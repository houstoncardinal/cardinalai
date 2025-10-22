import { ChevronDown, ChevronRight, File, Folder, Plus, FolderPlus, FileCode, Trash2, Edit2, Download, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useIdeStore } from '@/store/ideStore';
import { fileSystem, FileNode } from '@/lib/fileSystem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

export const FileExplorer = () => {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [creating, setCreating] = useState<{ parentId: string | null; type: 'file' | 'folder' } | null>(null);
  const [newName, setNewName] = useState('');
  const { setProjectInitialized, fileSystemRefreshTrigger } = useIdeStore();

  const loadFiles = async () => {
    try {
      await fileSystem.init();
      const rootFiles = await fileSystem.getRootFiles();
      setFiles(rootFiles);
      setProjectInitialized(rootFiles.length > 0);
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [fileSystemRefreshTrigger]);

  const handleCreateNew = async () => {
    if (!newName.trim()) return;
    
    try {
      await fileSystem.createFile(
        newName,
        creating!.type,
        creating!.parentId,
        creating!.type === 'file' ? '// New file\n' : ''
      );
      await loadFiles();
      setCreating(null);
      setNewName('');
      toast({
        title: `${creating!.type === 'file' ? 'File' : 'Folder'} created`,
        description: `${newName} has been created successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to create ${creating!.type}`,
        variant: 'destructive',
      });
    }
  };

  const handleNewProject = async () => {
    try {
      await fileSystem.createProject('my-app');
      await loadFiles();
      toast({
        title: 'Project created',
        description: 'New project initialized with starter files',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
    }
  };

  const handleExport = async () => {
    try {
      const data = await fileSystem.exportProject();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'project.json';
      a.click();
      toast({
        title: 'Project exported',
        description: 'Project has been exported successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export project',
        variant: 'destructive',
      });
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        await fileSystem.importProject(text);
        await loadFiles();
        toast({
          title: 'Project imported',
          description: 'Project has been imported successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to import project',
          variant: 'destructive',
        });
      }
    };
    input.click();
  };

  return (
    <div className="w-full md:w-64 glass-panel border-r flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">EXPLORER</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={() => setCreating({ parentId: null, type: 'file' })}
            title="New File"
          >
            <FileCode className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={() => setCreating({ parentId: null, type: 'folder' })}
            title="New Folder"
          >
            <FolderPlus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={handleExport}
            title="Export Project"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={handleImport}
            title="Import Project"
          >
            <Upload className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <FileCode className="w-12 h-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">No files yet</p>
            <Button onClick={handleNewProject} size="sm" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        ) : (
          <>
            {creating && creating.parentId === null && (
              <div className="mb-2 px-2">
                <Input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateNew();
                    if (e.key === 'Escape') setCreating(null);
                  }}
                  onBlur={() => {
                    if (newName.trim()) handleCreateNew();
                    else setCreating(null);
                  }}
                  placeholder={creating.type === 'file' ? 'filename.ext' : 'foldername'}
                  className="h-7 text-xs"
                />
              </div>
            )}
            {files.map((node) => (
              <FileTreeNode 
                key={node.id} 
                node={node} 
                depth={0} 
                onRefresh={loadFiles}
                creating={creating}
                setCreating={setCreating}
                newName={newName}
                setNewName={setNewName}
                onCreateNew={handleCreateNew}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

const FileTreeNode = ({ 
  node, 
  depth, 
  onRefresh,
  creating,
  setCreating,
  newName,
  setNewName,
  onCreateNew
}: { 
  node: FileNode; 
  depth: number;
  onRefresh: () => Promise<void>;
  creating: { parentId: string | null; type: 'file' | 'folder' } | null;
  setCreating: (creating: { parentId: string | null; type: 'file' | 'folder' } | null) => void;
  newName: string;
  setNewName: (name: string) => void;
  onCreateNew: () => Promise<void>;
}) => {
  const [expanded, setExpanded] = useState(depth === 0);
  const [children, setChildren] = useState<FileNode[]>([]);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const { addTab, setActiveTab, tabs } = useIdeStore();

  const loadChildren = async () => {
    if (node.type === 'folder') {
      const childNodes = await fileSystem.getChildren(node.id);
      setChildren(childNodes);
    }
  };

  useEffect(() => {
    if (expanded && node.type === 'folder') {
      loadChildren();
    }
  }, [expanded, node.id]);

  const handleFileClick = async () => {
    if (node.type === 'file') {
      const existingTab = tabs.find((t) => t.fileId === node.id);
      if (existingTab) {
        setActiveTab(existingTab.id);
      } else {
        const file = await fileSystem.getFile(node.id);
        if (file) {
          const newTab = {
            id: `${Date.now()}-${node.id}`,
            title: file.name,
            content: file.content || '',
            language: file.language || 'plaintext',
            modified: false,
            fileId: file.id,
          };
          addTab(newTab);
        }
      }
    } else {
      setExpanded(!expanded);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fileSystem.deleteFile(node.id);
      await onRefresh();
      toast({
        title: `${node.type === 'file' ? 'File' : 'Folder'} deleted`,
        description: `${node.name} has been deleted`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete ${node.type}`,
        variant: 'destructive',
      });
    }
  };

  const handleRename = async () => {
    if (!editName.trim() || editName === node.name) {
      setEditing(false);
      return;
    }
    
    try {
      await fileSystem.renameFile(node.id, editName);
      await onRefresh();
      setEditing(false);
      toast({
        title: 'Renamed',
        description: `Renamed to ${editName}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to rename',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <div
        className="w-full flex items-center gap-1.5 px-2 py-1 hover:bg-secondary/50 rounded text-sm smooth-transition group"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {editing ? (
          <Input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') setEditing(false);
            }}
            onBlur={handleRename}
            className="h-6 text-xs flex-1"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <>
            <button
              className="flex items-center gap-1.5 flex-1 text-left"
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
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {node.type === 'folder' && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-5 h-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCreating({ parentId: node.id, type: 'file' });
                    }}
                    title="New File"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-5 h-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCreating({ parentId: node.id, type: 'folder' });
                    }}
                    title="New Folder"
                  >
                    <FolderPlus className="w-3 h-3" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="w-5 h-5"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(true);
                }}
                title="Rename"
              >
                <Edit2 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-5 h-5 hover:bg-destructive/20"
                onClick={handleDelete}
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </>
        )}
      </div>
      
      {node.type === 'folder' && expanded && (
        <div>
          {creating && creating.parentId === node.id && (
            <div className="px-2 py-1" style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}>
              <Input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onCreateNew();
                  if (e.key === 'Escape') setCreating(null);
                }}
                onBlur={() => {
                  if (newName.trim()) onCreateNew();
                  else setCreating(null);
                }}
                placeholder={creating.type === 'file' ? 'filename.ext' : 'foldername'}
                className="h-6 text-xs"
              />
            </div>
          )}
          {children.map((child) => (
            <FileTreeNode 
              key={child.id} 
              node={child} 
              depth={depth + 1} 
              onRefresh={onRefresh}
              creating={creating}
              setCreating={setCreating}
              newName={newName}
              setNewName={setNewName}
              onCreateNew={onCreateNew}
            />
          ))}
        </div>
      )}
    </div>
  );
};
