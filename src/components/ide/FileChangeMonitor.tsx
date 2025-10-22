import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileEdit, FilePlus, FileCheck } from 'lucide-react';
import { fileSystem, FileNode } from '@/lib/fileSystem';

interface FileChange {
  id: string;
  path: string;
  type: 'create' | 'edit' | 'save';
  timestamp: number;
}

export const FileChangeMonitor: React.FC = () => {
  const [changes, setChanges] = useState<FileChange[]>([]);

  useEffect(() => {
    // Monitor file system changes
    const checkInterval = setInterval(async () => {
      // This would be enhanced with actual file system events
      // For now, we'll show changes when they occur
    }, 1000);

    return () => clearInterval(checkInterval);
  }, []);

  // Public method to add changes (called by other components)
  const addChange = (path: string, type: FileChange['type']) => {
    const newChange: FileChange = {
      id: `${Date.now()}-${Math.random()}`,
      path,
      type,
      timestamp: Date.now(),
    };
    
    setChanges(prev => [...prev, newChange]);
    
    // Remove after animation
    setTimeout(() => {
      setChanges(prev => prev.filter(c => c.id !== newChange.id));
    }, 3000);
  };

  // Expose method globally for other components to use
  useEffect(() => {
    (window as any).notifyFileChange = addChange;
    return () => {
      delete (window as any).notifyFileChange;
    };
  }, []);

  const getIcon = (type: FileChange['type']) => {
    switch (type) {
      case 'create': return <FilePlus className="w-4 h-4" />;
      case 'edit': return <FileEdit className="w-4 h-4" />;
      case 'save': return <FileCheck className="w-4 h-4" />;
    }
  };

  const getLabel = (type: FileChange['type']) => {
    switch (type) {
      case 'create': return 'Created';
      case 'edit': return 'Editing';
      case 'save': return 'Saved';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {changes.map(change => (
          <motion.div
            key={change.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 flex items-center gap-3 min-w-[250px]"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
              {getIcon(change.type)}
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-foreground">
                {getLabel(change.type)}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {change.path}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};