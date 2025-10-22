import { 
  Copy, 
  Trash2, 
  Edit2, 
  FolderPlus, 
  FileCode,
  Download,
  FileType,
  Scissors,
  Clipboard
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { FileNode, fileSystem } from '@/lib/fileSystem';
import { toast } from '@/hooks/use-toast';

interface FileContextMenuProps {
  node: FileNode;
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  onRename: () => void;
  onDelete: (e: React.MouseEvent) => Promise<void>;
  setCreating: (creating: { parentId: string | null; type: 'file' | 'folder' }) => void;
}

export const FileContextMenu = ({
  node,
  children,
  onRefresh,
  onRename,
  onDelete,
  setCreating,
}: FileContextMenuProps) => {
  const handleDuplicate = async () => {
    try {
      const baseName = node.name.replace(/\.[^/.]+$/, '');
      const ext = node.name.includes('.') ? `.${node.name.split('.').pop()}` : '';
      const newName = `${baseName}-copy${ext}`;
      
      await fileSystem.createFile(
        newName,
        node.type,
        node.parentId,
        node.content || ''
      );
      await onRefresh();
      toast({
        title: 'Duplicated',
        description: `Created ${newName}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = async () => {
    if (node.type === 'file' && node.content) {
      const blob = new Blob([node.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = node.name;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: 'Downloaded',
        description: `${node.name} downloaded`,
      });
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="glass-panel border-border">
        {node.type === 'folder' && (
          <>
            <ContextMenuItem onClick={() => setCreating({ parentId: node.id, type: 'file' })}>
              <FileCode className="w-4 h-4 mr-2" />
              New File
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setCreating({ parentId: node.id, type: 'folder' })}>
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        <ContextMenuItem onClick={handleDuplicate}>
          <Copy className="w-4 h-4 mr-2" />
          Duplicate
        </ContextMenuItem>
        <ContextMenuItem onClick={onRename}>
          <Edit2 className="w-4 h-4 mr-2" />
          Rename
        </ContextMenuItem>
        {node.type === 'file' && (
          <ContextMenuItem onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem onClick={(e) => onDelete(e as any)} className="text-destructive">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
