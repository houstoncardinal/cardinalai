import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FolderOpen, File, CheckCircle, AlertCircle } from 'lucide-react';
import { fileSystem } from '@/lib/fileSystem';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface ProjectUploaderProps {
  open: boolean;
  onClose: () => void;
}

export const ProjectUploader = ({ open, onClose }: ProjectUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const { toast } = useToast();

  const handleDirectoryUpload = async () => {
    try {
      // Check if browser supports directory upload
      if (!('showDirectoryPicker' in window)) {
        toast({
          title: "Browser Not Supported",
          description: "Your browser doesn't support directory upload. Please use the file upload instead.",
          variant: "destructive"
        });
        return;
      }

      setUploading(true);
      setProgress(0);
      setStatus('Selecting directory...');

      // @ts-ignore - showDirectoryPicker is not yet in TypeScript types
      const dirHandle = await window.showDirectoryPicker();
      
      setStatus('Reading files...');
      const files: { path: string; content: string; type: string }[] = [];
      
      await processDirectory(dirHandle, '', files);
      
      setStatus('Importing files into IDE...');
      await fileSystem.init();
      
      let imported = 0;
      for (const file of files) {
        await fileSystem.createFileFromPath(file.path, file.content);
        imported++;
        setProgress((imported / files.length) * 100);
      }

      setStatus('Complete!');
      toast({
        title: "Project Imported",
        description: `Successfully imported ${files.length} files`,
      });

      setTimeout(() => {
        onClose();
        setUploading(false);
        setProgress(0);
        setStatus('');
      }, 1500);

    } catch (error: any) {
      console.error('Upload error:', error);
      if (error.name !== 'AbortError') {
        toast({
          title: "Upload Failed",
          description: error.message || "Failed to upload project",
          variant: "destructive"
        });
      }
      setUploading(false);
      setProgress(0);
      setStatus('');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;

    try {
      setUploading(true);
      setProgress(0);
      setStatus('Reading files...');

      await fileSystem.init();
      const files = Array.from(fileList);
      
      let imported = 0;
      for (const file of files) {
        const content = await file.text();
        // Extract relative path from webkitRelativePath if available
        const path = (file as any).webkitRelativePath || file.name;
        await fileSystem.createFileFromPath(path, content);
        imported++;
        setProgress((imported / files.length) * 100);
        setStatus(`Importing ${imported}/${files.length} files...`);
      }

      setStatus('Complete!');
      toast({
        title: "Files Imported",
        description: `Successfully imported ${files.length} files`,
      });

      setTimeout(() => {
        onClose();
        setUploading(false);
        setProgress(0);
        setStatus('');
      }, 1500);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload files",
        variant: "destructive"
      });
      setUploading(false);
      setProgress(0);
      setStatus('');
    }
  };

  const processDirectory = async (
    dirHandle: any,
    path: string,
    files: { path: string; content: string; type: string }[]
  ) => {
    for await (const entry of dirHandle.values()) {
      const entryPath = path ? `${path}/${entry.name}` : entry.name;

      // Skip common directories that shouldn't be imported
      if (entry.kind === 'directory') {
        const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
        if (skipDirs.includes(entry.name)) continue;
        
        await processDirectory(entry, entryPath, files);
      } else if (entry.kind === 'file') {
        // Skip certain file types
        const skipExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mp3', '.zip', '.pdf'];
        if (skipExtensions.some(ext => entry.name.toLowerCase().endsWith(ext))) continue;

        try {
          const file = await entry.getFile();
          const content = await file.text();
          
          files.push({
            path: entryPath,
            content,
            type: getFileType(entry.name)
          });
        } catch (error) {
          console.warn(`Skipped file ${entryPath}:`, error);
        }
      }
    }
  };

  const getFileType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const typeMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
    };
    return typeMap[ext || ''] || 'plaintext';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-panel max-w-md">
        <DialogTitle>Import Project</DialogTitle>
        <DialogDescription>
          Upload your project folder to start working in PathwayAI
        </DialogDescription>

        <div className="space-y-4 py-4">
          {!uploading ? (
            <>
              <div className="space-y-2">
                <Button
                  onClick={handleDirectoryUpload}
                  className="w-full h-24 flex flex-col gap-2"
                  variant="outline"
                >
                  <FolderOpen className="w-8 h-8" />
                  <span className="font-semibold">Choose Folder</span>
                  <span className="text-xs text-muted-foreground">
                    Import entire project directory
                  </span>
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <label className="block">
                  <input
                    type="file"
                    multiple
                    // @ts-ignore
                    webkitdirectory="true"
                    directory="true"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      (e.currentTarget.previousSibling as HTMLInputElement)?.click();
                    }}
                    className="w-full h-24 flex flex-col gap-2"
                    variant="outline"
                  >
                    <File className="w-8 h-8" />
                    <span className="font-semibold">Select Files</span>
                    <span className="text-xs text-muted-foreground">
                      Import individual files
                    </span>
                  </Button>
                </label>
              </div>

              <div className="text-xs text-muted-foreground space-y-1 mt-4 p-3 glass-panel rounded-lg">
                <p className="font-semibold">Note:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Files are stored locally in your browser</li>
                  <li>Large files (images, videos) are skipped</li>
                  <li>node_modules and build folders are excluded</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-center">
                {progress === 100 ? (
                  <CheckCircle className="w-12 h-12 text-green-500" />
                ) : (
                  <Upload className="w-12 h-12 text-primary animate-pulse" />
                )}
              </div>
              
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  {status}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
