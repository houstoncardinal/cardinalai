import { useState } from 'react';
import { fileSystem } from '@/lib/fileSystem';
import { useIdeStore } from '@/store/ideStore';
import { toast } from '@/hooks/use-toast';

export interface FileOperation {
  type: 'create' | 'update' | 'delete';
  path: string;
  content?: string;
  language?: string;
  fileId?: string;
}

export const useAiFileOperations = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { addTab, refreshTabs } = useIdeStore();

  const parseCodeBlocks = (content: string): FileOperation[] => {
    const operations: FileOperation[] = [];
    
    // Match code blocks with file paths: ```language:path/to/file.ext
    const codeBlockRegex = /```(\w+):([^\n]+)\n([\s\S]*?)```/g;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const [, language, path, code] = match;
      operations.push({
        type: 'create',
        path: path.trim(),
        content: code.trim(),
        language: language.toLowerCase(),
      });
    }
    
    // Also match standard code blocks if they mention file creation
    const createFileRegex = /(?:create|add|new)\s+file[:\s]+`?([^\s`]+)`?/gi;
    const standardBlockRegex = /```(\w+)\n([\s\S]*?)```/g;
    
    const createMatches = [...content.matchAll(createFileRegex)];
    const codeMatches = [...content.matchAll(standardBlockRegex)];
    
    if (createMatches.length > 0 && codeMatches.length > 0) {
      createMatches.forEach((createMatch, idx) => {
        if (codeMatches[idx]) {
          const path = createMatch[1];
          const [, language, code] = codeMatches[idx];
          operations.push({
            type: 'create',
            path: path.trim(),
            content: code.trim(),
            language: language.toLowerCase(),
          });
        }
      });
    }
    
    return operations;
  };

  const applyFileOperations = async (operations: FileOperation[]) => {
    setIsProcessing(true);
    try {
      for (const op of operations) {
        switch (op.type) {
          case 'create':
            await createFile(op.path, op.content || '', op.language);
            break;
          case 'update':
            if (op.fileId) {
              await updateFile(op.fileId, op.content || '');
            }
            break;
          case 'delete':
            if (op.fileId) {
              await deleteFile(op.fileId);
            }
            break;
        }
      }
      
      refreshTabs();
      toast({
        title: 'Success',
        description: `Applied ${operations.length} file operation(s)`,
      });
    } catch (error) {
      console.error('Error applying file operations:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply file operations',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const createFile = async (path: string, content: string, language?: string) => {
    try {
      const file = await fileSystem.createFileFromPath(path, content);
      
      // Open the created file in the editor
      addTab({
        id: file.id,
        title: file.name,
        content: content,
        language: language || file.language || 'plaintext',
        fileId: file.id,
        modified: false,
      });
      
      toast({
        title: 'File Created',
        description: `Created ${path}`,
      });
    } catch (error) {
      console.error('Error creating file:', error);
      throw error;
    }
  };

  const updateFile = async (fileId: string, content: string) => {
    try {
      await fileSystem.updateFile(fileId, { content });
      
      toast({
        title: 'File Updated',
        description: 'File content updated successfully',
      });
    } catch (error) {
      console.error('Error updating file:', error);
      throw error;
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      await fileSystem.deleteFile(fileId);
      
      toast({
        title: 'File Deleted',
        description: 'File deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  return {
    parseCodeBlocks,
    applyFileOperations,
    createFile,
    updateFile,
    deleteFile,
    isProcessing,
  };
};