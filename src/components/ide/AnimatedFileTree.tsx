import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileIcon, FolderIcon, Sparkles } from 'lucide-react';
import { useAiOperationStore } from '@/hooks/useAiOperationEvents';

interface AnimatedFileProps {
  name: string;
  type: 'file' | 'folder';
  isNew?: boolean;
}

export const AnimatedFileItem: React.FC<AnimatedFileProps> = ({ name, type, isNew }) => {
  const [showSparkle, setShowSparkle] = useState(isNew);

  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => setShowSparkle(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  return (
    <motion.div
      initial={isNew ? { opacity: 0, x: -20, scale: 0.8 } : false}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 300,
      }}
      className="relative"
    >
      {showSparkle && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="absolute -left-6 top-1/2 -translate-y-1/2"
        >
          <motion.div
            animate={{
              rotate: [0, 180, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
          </motion.div>
        </motion.div>
      )}

      <div className="flex items-center gap-2">
        {type === 'folder' ? (
          <FolderIcon className="w-4 h-4" />
        ) : (
          <FileIcon className="w-4 h-4" />
        )}
        <span className={isNew ? 'font-semibold text-primary' : ''}>
          {name}
        </span>
      </div>

      {isNew && (
        <motion.div
          className="absolute inset-0 -z-10 rounded bg-primary/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: 2 }}
        />
      )}
    </motion.div>
  );
};

// Hook to track recently created files
export const useRecentFileOperations = () => {
  const operations = useAiOperationStore((state) => state.operations);
  const [recentFiles, setRecentFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    const newFiles = operations
      .filter((op) => op.type === 'creating' && op.progress < 100)
      .map((op) => op.target);

    setRecentFiles(new Set(newFiles));

    // Clean up completed operations
    const completedFiles = operations
      .filter((op) => op.progress === 100)
      .map((op) => op.target);

    if (completedFiles.length > 0) {
      setTimeout(() => {
        setRecentFiles((prev) => {
          const updated = new Set(prev);
          completedFiles.forEach((file) => updated.delete(file));
          return updated;
        });
      }, 3000);
    }
  }, [operations]);

  return recentFiles;
};