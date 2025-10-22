import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { soundManager } from '@/utils/sounds';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  language?: string;
  content?: string;
  parentId: string | null;
  path: string;
  createdAt: number;
  updatedAt: number;
}

interface FileSystemDB extends DBSchema {
  files: {
    key: string;
    value: FileNode;
    indexes: { 'by-parent': string; 'by-path': string };
  };
  projects: {
    key: string;
    value: {
      id: string;
      name: string;
      rootFileId: string;
      createdAt: number;
      updatedAt: number;
    };
  };
}

class FileSystemManager {
  private db: IDBPDatabase<FileSystemDB> | null = null;
  private currentProjectId: string | null = null;

  async init() {
    this.db = await openDB<FileSystemDB>('CardinalFS', 1, {
      upgrade(db) {
        const fileStore = db.createObjectStore('files', { keyPath: 'id' });
        fileStore.createIndex('by-parent', 'parentId');
        fileStore.createIndex('by-path', 'path');
        db.createObjectStore('projects', { keyPath: 'id' });
      },
    });
  }

  async createFile(
    name: string,
    type: 'file' | 'folder',
    parentId: string | null,
    content: string = '',
    language?: string
  ): Promise<FileNode> {
    if (!this.db) await this.init();

    const parent = parentId ? await this.db!.get('files', parentId) : null;
    const path = parent ? `${parent.path}/${name}` : name;

    const file: FileNode = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      language: language || this.getLanguageFromExtension(name),
      content,
      parentId,
      path,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await this.db!.add('files', file);
    return file;
  }

  async updateFile(id: string, updates: Partial<FileNode>): Promise<void> {
    if (!this.db) await this.init();
    
    const file = await this.db!.get('files', id);
    if (!file) throw new Error('File not found');

    const updatedFile = {
      ...file,
      ...updates,
      updatedAt: Date.now(),
    };

    await this.db!.put('files', updatedFile);
  }

  async deleteFile(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    // Get all children recursively
    const children = await this.getChildren(id);
    
    // Delete all children first
    for (const child of children) {
      await this.deleteFile(child.id);
    }
    
    // Delete the file itself
    await this.db!.delete('files', id);
  }

  async getFile(id: string): Promise<FileNode | undefined> {
    if (!this.db) await this.init();
    return this.db!.get('files', id);
  }

  async getChildren(parentId: string | null): Promise<FileNode[]> {
    if (!this.db) await this.init();
    const all = await this.db!.getAllFromIndex('files', 'by-parent', parentId);
    return all.sort((a, b) => {
      // Folders first, then files
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  async getRootFiles(): Promise<FileNode[]> {
    return this.getChildren(null);
  }

  async moveFile(id: string, newParentId: string | null): Promise<void> {
    if (!this.db) await this.init();
    
    const file = await this.db!.get('files', id);
    if (!file) throw new Error('File not found');

    const newParent = newParentId ? await this.db!.get('files', newParentId) : null;
    const newPath = newParent ? `${newParent.path}/${file.name}` : file.name;

    await this.updateFile(id, {
      parentId: newParentId,
      path: newPath,
    });
  }

  async renameFile(id: string, newName: string): Promise<void> {
    if (!this.db) await this.init();
    
    const file = await this.db!.get('files', id);
    if (!file) throw new Error('File not found');

    const parent = file.parentId ? await this.db!.get('files', file.parentId) : null;
    const newPath = parent ? `${parent.path}/${newName}` : newName;

    await this.updateFile(id, {
      name: newName,
      path: newPath,
      language: this.getLanguageFromExtension(newName),
    });
  }

  async searchFiles(query: string): Promise<FileNode[]> {
    if (!this.db) await this.init();
    
    const all = await this.db!.getAll('files');
    const lowerQuery = query.toLowerCase();
    
    return all.filter(file => 
      file.name.toLowerCase().includes(lowerQuery) ||
      file.content?.toLowerCase().includes(lowerQuery)
    );
  }

  async createProject(name: string): Promise<string> {
    if (!this.db) await this.init();
    
    // Create root folder
    const root = await this.createFile(name, 'folder', null);
    
    // Create default files
    await this.createFile('index.html', 'file', root.id, this.getDefaultHTML(), 'html');
    await this.createFile('styles.css', 'file', root.id, this.getDefaultCSS(), 'css');
    await this.createFile('script.js', 'file', root.id, this.getDefaultJS(), 'javascript');
    
    const projectId = `project-${Date.now()}`;
    await this.db!.add('projects', {
      id: projectId,
      name,
      rootFileId: root.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    this.currentProjectId = projectId;
    return projectId;
  }

  async exportProject(): Promise<string> {
    if (!this.db) await this.init();
    
    const files = await this.db!.getAll('files');
    return JSON.stringify(files, null, 2);
  }

  async importProject(jsonData: string): Promise<void> {
    if (!this.db) await this.init();
    
    const files = JSON.parse(jsonData) as FileNode[];
    
    // Clear existing files
    const tx = this.db!.transaction('files', 'readwrite');
    await tx.store.clear();
    
    // Import all files
    for (const file of files) {
      await this.db!.add('files', file);
    }
  }

  async createFileFromPath(path: string, content: string = ''): Promise<FileNode> {
    if (!this.db) await this.init();
    
    const parts = path.split('/').filter(p => p);
    let currentParentId: string | null = null;
    
    // Create folders along the path
    for (let i = 0; i < parts.length - 1; i++) {
      const folderName = parts[i];
      const folderPath = parts.slice(0, i + 1).join('/');
      
      // Check if folder exists
      const existing = await this.db!.getAllFromIndex('files', 'by-path', folderPath);
      if (existing.length > 0) {
        currentParentId = existing[0].id;
      } else {
        const folder = await this.createFile(folderName, 'folder', currentParentId);
        currentParentId = folder.id;
      }
    }
    
    // Create the file
    const fileName = parts[parts.length - 1];
    return await this.createFile(fileName, 'file', currentParentId, content);
  }

  private getLanguageFromExtension(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      go: 'go',
      rs: 'rust',
      php: 'php',
      rb: 'ruby',
      swift: 'swift',
      kt: 'kotlin',
      sql: 'sql',
      sh: 'shell',
      yaml: 'yaml',
      xml: 'xml',
    };
    return languageMap[ext || ''] || 'plaintext';
  }

  private getDefaultHTML(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CardinalAI App</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app">
    <h1>Welcome to CardinalAI</h1>
    <p>Start building your application!</p>
  </div>
  <script src="script.js"></script>
</body>
</html>`;
  }

  private getDefaultCSS(): string {
    return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

#app {
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}`;
  }

  private getDefaultJS(): string {
    return `// Welcome to CardinalAI!
// Start building your application here

console.log('CardinalAI is ready! 🚀');

// Example: Add interactivity
document.querySelector('#app').addEventListener('click', () => {
  console.log('App clicked!');
});`;
  }
}

export const fileSystem = new FileSystemManager();
