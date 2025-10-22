import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  FileCode,
  FolderPlus,
  Search,
  X,
  Download,
  Upload,
  ChevronLeft,
  SortAsc,
  LayoutGrid,
  Clock,
  Star,
  FolderOpen,
  Minimize2,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { useIdeStore } from '@/store/ideStore';
import { fileSystem, FileNode } from '@/lib/fileSystem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { FileContextMenu } from '@/components/ide/FileContextMenu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { RecentFiles } from './RecentFiles';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAiOperationStore } from '@/hooks/useAiOperationEvents';

type SortBy = 'name' | 'type' | 'modified';

export const EnhancedFileExplorer = () => {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [creating, setCreating] = useState<{ parentId: string | null; type: 'file' | 'folder' } | null>(null);
  const [newName, setNewName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const { setProjectInitialized, fileSystemRefreshTrigger } = useIdeStore();
  const operations = useAiOperationStore((state) => state.operations);

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
      a.download = `project-${Date.now()}.json`;
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

  const sortFiles = (fileList: FileNode[]) => {
    return [...fileList].sort((a, b) => {
      // Always folders first
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }

      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'modified':
          return b.updatedAt - a.updatedAt;
        case 'type':
          return (a.language || '').localeCompare(b.language || '');
        default:
          return 0;
      }
    });
  };

  const filterFiles = (fileList: FileNode[]): FileNode[] => {
    if (!searchQuery.trim()) return fileList;
    const query = searchQuery.toLowerCase();
    return fileList.filter((file) =>
      file.name.toLowerCase().includes(query)
    );
  };

  const expandAll = async () => {
    const allFolderIds = new Set<string>();
    const collectFolders = async (nodes: FileNode[]) => {
      for (const node of nodes) {
        if (node.type === 'folder') {
          allFolderIds.add(node.id);
          const children = await fileSystem.getChildren(node.id);
          await collectFolders(children);
        }
      }
    };
    await collectFolders(files);
    setExpandedFolders(allFolderIds);
  };

  const collapseAll = () => {
    setExpandedFolders(new Set());
  };

  const displayedFiles = sortFiles(filterFiles(files));

  if (isCollapsed) {
    return (
      <motion.div
        initial={{ width: 48 }}
        animate={{ width: 48 }}
        className="flex flex-col items-center gap-2 py-4 border-r border-border bg-[hsl(var(--panel-bg))]"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          title="Expand Explorer"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCreating({ parentId: null, type: 'file' })}
          title="New File"
        >
          <FileCode className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCreating({ parentId: null, type: 'folder' })}
          title="New Folder"
        >
          <FolderPlus className="w-4 h-4" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ width: 280 }}
      animate={{ width: 280 }}
      className="flex flex-col h-full border-r border-border bg-[hsl(var(--panel-bg))]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Explorer</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={() => setIsCollapsed(true)}
            title="Collapse Explorer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="h-8 pl-8 pr-8 text-xs bg-[hsl(var(--editor-bg))]"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 w-7 h-8"
              onClick={() => setSearchQuery('')}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-[hsl(var(--editor-bg))]">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={() => setCreating({ parentId: null, type: 'file' })}
            title="New File (Ctrl+N)"
          >
            <FileCode className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={() => setCreating({ parentId: null, type: 'folder' })}
            title="New Folder"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-7 h-7" title="Sort">
                <SortAsc className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="glass-panel">
              <DropdownMenuItem onClick={() => setSortBy('name')}>
                <span className={cn('text-xs', sortBy === 'name' && 'text-primary font-semibold')}>
                  Sort by Name
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('type')}>
                <span className={cn('text-xs', sortBy === 'type' && 'text-primary font-semibold')}>
                  Sort by Type
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('modified')}>
                <span className={cn('text-xs', sortBy === 'modified' && 'text-primary font-semibold')}>
                  Sort by Modified
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={expandAll}
            title="Expand All"
          >
            <Maximize2 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={collapseAll}
            title="Collapse All"
          >
            <Minimize2 className="w-3 h-3" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-7 h-7" title="More Options">
                <LayoutGrid className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-panel">
              <DropdownMenuItem onClick={handleExport}>
                <Download className="w-3.5 h-3.5 mr-2" />
                <span className="text-xs">Export Project</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleImport}>
                <Upload className="w-3.5 h-3.5 mr-2" />
                <span className="text-xs">Import Project</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* File Tree */}
      <ScrollArea className="flex-1">
        <div className="px-2 py-2">
          {files.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <FileCode className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-4">No files yet</p>
              <Button onClick={handleNewProject} size="sm" className="w-full max-w-[200px]">
                <Sparkles className="w-4 h-4 mr-2" />
                Create New Project
              </Button>
            </motion.div>
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
                    className="h-7 text-xs bg-[hsl(var(--editor-bg))]"
                  />
                </div>
              )}
              
              <AnimatePresence mode="popLayout">
                {displayedFiles.map((node) => (
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
                    expandedFolders={expandedFolders}
                    setExpandedFolders={setExpandedFolders}
                  />
                ))}
              </AnimatePresence>
            </>
          )}
        </div>
      </ScrollArea>
      
      {/* Recent Files Panel */}
      <RecentFiles />
    </motion.div>
  );
};

interface FileTreeNodeProps {
  node: FileNode;
  depth: number;
  onRefresh: () => Promise<void>;
  creating: { parentId: string | null; type: 'file' | 'folder' } | null;
  setCreating: (creating: { parentId: string | null; type: 'file' | 'folder' } | null) => void;
  newName: string;
  setNewName: (name: string) => void;
  onCreateNew: () => Promise<void>;
  expandedFolders: Set<string>;
  setExpandedFolders: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({
  node,
  depth,
  onRefresh,
  creating,
  setCreating,
  newName,
  setNewName,
  onCreateNew,
  expandedFolders,
  setExpandedFolders,
}) => {
  const [children, setChildren] = useState<FileNode[]>([]);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const { addTab, setActiveTab, tabs } = useIdeStore();
  const operations = useAiOperationStore((state) => state.operations);

  const isExpanded = expandedFolders.has(node.id);
  const isBeingCreated = operations.some(
    (op) => op.type === 'creating' && op.target.includes(node.name)
  );

  const loadChildren = async () => {
    if (node.type === 'folder') {
      const childNodes = await fileSystem.getChildren(node.id);
      setChildren(childNodes);
    }
  };

  useEffect(() => {
    if (isExpanded && node.type === 'folder') {
      loadChildren();
    }
  }, [isExpanded, node.id]);

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
      setExpandedFolders((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) {
          next.delete(node.id);
        } else {
          next.add(node.id);
        }
        return next;
      });
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
    <motion.div
      initial={isBeingCreated ? { opacity: 0, x: -10 } : false}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.2 }}
    >
      <FileContextMenu
        node={node}
        onRefresh={onRefresh}
        onRename={() => setEditing(true)}
        onDelete={handleDelete}
        setCreating={setCreating}
      >
        <motion.div
          whileHover={{ backgroundColor: 'hsla(var(--secondary) / 0.5)' }}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors group cursor-pointer',
            isBeingCreated && 'ring-1 ring-primary/50'
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
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
            <button
              className="flex items-center gap-1.5 flex-1 text-left"
              onClick={handleFileClick}
            >
              {node.type === 'folder' && (
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </motion.div>
              )}
              {node.type === 'folder' ? (
                <Folder
                  className={cn('w-4 h-4', isExpanded ? 'text-primary' : 'text-muted-foreground')}
                />
              ) : (
                <File className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-foreground truncate">{node.name}</span>
            </button>
          )}
        </motion.div>
      </FileContextMenu>

      <AnimatePresence>
        {node.type === 'folder' && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {creating && creating.parentId === node.id && (
              <div className="px-2 py-1" style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}>
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
                expandedFolders={expandedFolders}
                setExpandedFolders={setExpandedFolders}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};