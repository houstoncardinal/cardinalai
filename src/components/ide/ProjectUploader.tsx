import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FolderOpen, File, CheckCircle, AlertCircle } from 'lucide-react';
import { fileSystem } from '@/lib/fileSystem';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useIdeStore } from '@/store/ideStore';

interface ProjectUploaderProps {
  open: boolean;
  onClose: () => void;
}

export const ProjectUploader = ({ open, onClose }: ProjectUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const { toast } = useToast();
  const { triggerFileSystemRefresh } = useIdeStore();

  const handleDirectoryInput = () => {
    // Trigger the hidden file input
    const input = document.getElementById('directory-input') as HTMLInputElement;
    input?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    try {
      setUploading(true);
      setProgress(0);
      setStatus('Reading files...');

      await fileSystem.init();
      const files = Array.from(fileList);
      
      // Filter out unwanted files
      const validFiles = files.filter(file => {
        const skipExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mp3', '.zip', '.pdf'];
        const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
        
        const path = (file as any).webkitRelativePath || file.name;
        const hasSkipExt = skipExtensions.some(ext => path.toLowerCase().endsWith(ext));
        const hasSkipDir = skipDirs.some(dir => path.includes(`/${dir}/`) || path.startsWith(`${dir}/`));
        
        return !hasSkipExt && !hasSkipDir;
      });
      
      if (validFiles.length === 0) {
        toast({
          title: "No Valid Files",
          description: "No importable files found in selection",
          variant: "destructive"
        });
        setUploading(false);
        return;
      }

      let imported = 0;
      for (const file of validFiles) {
        try {
          const content = await file.text();
          // Extract relative path from webkitRelativePath if available
          const path = (file as any).webkitRelativePath || file.name;
          await fileSystem.createFileFromPath(path, content);
          imported++;
          setProgress((imported / validFiles.length) * 100);
          setStatus(`Importing ${imported}/${validFiles.length} files...`);
        } catch (err) {
          console.warn(`Skipped file ${file.name}:`, err);
        }
      }

      setStatus('Complete!');
      
      // Trigger file explorer refresh
      triggerFileSystemRefresh();
      
      toast({
        title: "Project Imported",
        description: `Successfully imported ${imported} files`,
      });

      setTimeout(() => {
        onClose();
        setUploading(false);
        setProgress(0);
        setStatus('');
        // Reset the input
        event.target.value = '';
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


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-panel max-w-md">
        <DialogTitle>Import Project</DialogTitle>
        <DialogDescription>
          Upload your project folder to start working in CardinalAI
        </DialogDescription>

        <div className="space-y-4 py-4">
          {!uploading ? (
            <>
              {/* Hidden file inputs */}
              <input
                id="directory-input"
                type="file"
                // @ts-ignore
                webkitdirectory="true"
                directory="true"
                className="hidden"
                onChange={handleFileUpload}
              />
              <input
                id="file-input"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />

              <div className="space-y-3">
                <Button
                  onClick={handleDirectoryInput}
                  className="w-full h-28 flex flex-col gap-2"
                  variant="outline"
                >
                  <FolderOpen className="w-10 h-10 text-primary" />
                  <span className="font-semibold text-base">Import Project Folder</span>
                  <span className="text-xs text-muted-foreground">
                    Select your entire project directory
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

                <Button
                  onClick={() => document.getElementById('file-input')?.click()}
                  className="w-full h-20 flex flex-col gap-2"
                  variant="outline"
                >
                  <File className="w-8 h-8" />
                  <span className="font-semibold">Select Individual Files</span>
                </Button>
              </div>

              <div className="text-xs text-muted-foreground space-y-1 mt-4 p-3 glass-panel rounded-lg">
                <p className="font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Important:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-1">
                  <li>Files stored locally in your browser (IndexedDB)</li>
                  <li>Media files automatically skipped (images, videos)</li>
                  <li>node_modules and build folders excluded</li>
                  <li>Supports all text-based code files</li>
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
