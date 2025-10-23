import React, { useMemo, useCallback } from 'react';
import { File, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  path: string;
}

interface OptimizedFileExplorerProps {
  files: FileNode[];
  onFileClick: (path: string) => void;
  activeFile?: string;
}

const FileItem = React.memo<{
  node: FileNode;
  level: number;
  onFileClick: (path: string) => void;
  activeFile?: string;
}>(({ node, level, onFileClick, activeFile }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const handleClick = useCallback(() => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick(node.path);
    }
  }, [node, isExpanded, onFileClick]);

  const isActive = activeFile === node.path;

  return (
    <div>
      <Button
        variant="ghost"
        className={`w-full justify-start text-sm py-1.5 px-2 h-auto font-normal ${
          isActive ? 'bg-primary/20 text-primary' : 'hover:bg-muted/50'
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        {node.type === 'folder' ? (
          <>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 mr-1 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-1 shrink-0" />
            )}
            <Folder className="w-4 h-4 mr-2 shrink-0" />
          </>
        ) : (
          <File className="w-4 h-4 mr-2 ml-5 shrink-0" />
        )}
        <span className="truncate">{node.name}</span>
      </Button>

      {node.type === 'folder' && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileItem
              key={child.id}
              node={child}
              level={level + 1}
              onFileClick={onFileClick}
              activeFile={activeFile}
            />
          ))}
        </div>
      )}
    </div>
  );
});

FileItem.displayName = 'FileItem';

export const OptimizedFileExplorer = React.memo<OptimizedFileExplorerProps>(
  ({ files, onFileClick, activeFile }) => {
    const memoizedFiles = useMemo(() => files, [files]);

    return (
      <div className="space-y-1">
        {memoizedFiles.map((node) => (
          <FileItem
            key={node.id}
            node={node}
            level={0}
            onFileClick={onFileClick}
            activeFile={activeFile}
          />
        ))}
      </div>
    );
  }
);

OptimizedFileExplorer.displayName = 'OptimizedFileExplorer';
