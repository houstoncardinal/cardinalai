import { ChevronDown, ChevronRight, File, Folder } from 'lucide-react';
import { useState } from 'react';
import { useIdeStore } from '@/store/ideStore';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  language?: string;
  content?: string;
  children?: FileNode[];
}

const mockFiles: FileNode[] = [
  {
    name: 'src',
    type: 'folder',
    children: [
      {
        name: 'components',
        type: 'folder',
        children: [
          { name: 'Button.tsx', type: 'file', language: 'typescript', content: 'export const Button = () => {\n  return <button>Click me</button>;\n};' },
          { name: 'Header.tsx', type: 'file', language: 'typescript', content: 'export const Header = () => {\n  return <header>My App</header>;\n};' }
        ]
      },
      { name: 'App.tsx', type: 'file', language: 'typescript', content: 'import { Header } from "./components/Header";\n\nfunction App() {\n  return (\n    <div className="app">\n      <Header />\n      <main>Welcome to Nebula Studio</main>\n    </div>\n  );\n}\n\nexport default App;' },
      { name: 'index.css', type: 'file', language: 'css', content: ':root {\n  --primary: #9b5cff;\n  --background: #0b0b10;\n}\n\nbody {\n  background: var(--background);\n  color: white;\n}' }
    ]
  },
  { name: 'package.json', type: 'file', language: 'json', content: '{\n  "name": "nebula-project",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.0.0"\n  }\n}' },
  { name: 'README.md', type: 'file', language: 'markdown', content: '# Nebula Studio\n\nA magical IDE for creative developers.\n\n## Features\n- Beautiful themes\n- AI assistance\n- Fast editing' }
];

export const FileExplorer = () => {
  return (
    <div className="w-full md:w-64 glass-panel border-r flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">EXPLORER</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {mockFiles.map((node) => (
          <FileTreeNode key={node.name} node={node} depth={0} />
        ))}
      </div>
    </div>
  );
};

const FileTreeNode = ({ node, depth }: { node: FileNode; depth: number }) => {
  const [expanded, setExpanded] = useState(depth === 0);
  const { addTab, setActiveTab, tabs } = useIdeStore();

  const handleFileClick = () => {
    if (node.type === 'file') {
      const existingTab = tabs.find((t) => t.title === node.name);
      if (existingTab) {
        setActiveTab(existingTab.id);
      } else {
        const newTab = {
          id: `${Date.now()}-${node.name}`,
          title: node.name,
          content: node.content || '',
          language: node.language || 'plaintext',
          modified: false
        };
        addTab(newTab);
      }
    } else {
      setExpanded(!expanded);
    }
  };

  return (
    <div>
      <button
        className="w-full flex items-center gap-1.5 px-2 py-1 hover:bg-secondary/50 rounded text-sm smooth-transition text-left"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleFileClick}
      >
        {node.type === 'folder' && (
          expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
        )}
        {node.type === 'folder' ? (
          <Folder className="w-4 h-4 text-primary" />
        ) : (
          <File className="w-4 h-4 text-muted-foreground" />
        )}
        <span className="text-foreground">{node.name}</span>
      </button>
      {node.type === 'folder' && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode key={child.name} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
