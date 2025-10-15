import { GitBranch, GitCommit, Plus, Minus, Circle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { gitService } from '@/lib/git';
import { useToast } from '@/hooks/use-toast';
import { BranchManager } from './BranchManager';
import { DiffViewer } from './DiffViewer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface GitChange {
  file: string;
  status: string;
  staged: boolean;
  modified: boolean;
}

export const GitPanel = () => {
  const [commitMessage, setCommitMessage] = useState('');
  const [staged, setStaged] = useState<string[]>([]);
  const [changes, setChanges] = useState<GitChange[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadChanges();
    gitService.init(); // Initialize git repo
  }, []);

  const loadChanges = async () => {
    const status = await gitService.status();
    setChanges(status);
  };

  const toggleStaged = async (file: string) => {
    const isStaged = staged.includes(file);
    if (isStaged) {
      await gitService.remove(file);
      setStaged(prev => prev.filter(f => f !== file));
    } else {
      const success = await gitService.add(file);
      if (success) {
        setStaged(prev => [...prev, file]);
      }
    }
    loadChanges();
  };

  const handleCommit = async () => {
    if (staged.length === 0 || !commitMessage) return;

    const sha = await gitService.commit(commitMessage, {
      name: 'PathwayAI User',
      email: 'user@pathwayai.dev',
    });

    if (sha) {
      toast({
        title: 'Committed successfully',
        description: `Commit: ${sha.substring(0, 7)}`,
      });
      setCommitMessage('');
      setStaged([]);
      loadChanges();
    } else {
      toast({
        title: 'Commit failed',
        description: 'Failed to create commit',
        variant: 'destructive',
      });
    }
  };

  const viewDiff = (file: string) => {
    setSelectedFile(file);
    setShowDiff(true);
  };

  return (
    <>
      <div className="w-80 glass-panel border-l flex flex-col h-full">
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">SOURCE CONTROL</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            <BranchManager />

            <div className="space-y-2">
              <Input
                placeholder="Commit message..."
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                className="glass-panel border-border text-sm"
              />
              <Button 
                className="w-full metal-shine"
                disabled={staged.length === 0 || !commitMessage}
                onClick={handleCommit}
              >
                <GitCommit className="w-4 h-4 mr-2" />
                Commit {staged.length > 0 && `(${staged.length})`}
              </Button>
            </div>
          </div>

          <div className="px-4 py-2">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">
              CHANGES ({changes.length})
            </h3>
            <div className="space-y-1">
              {changes.map((change) => (
                <div
                  key={change.file}
                  className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-secondary/50 rounded text-sm smooth-transition group"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={staged.includes(change.file)}
                      onChange={() => toggleStaged(change.file)}
                      className="accent-primary cursor-pointer"
                    />
                    <span className={change.status === 'new' ? 'text-green-500' : 'text-yellow-500'}>
                      {change.status === 'new' ? 'U' : 'M'}
                    </span>
                    <span className="text-foreground truncate">{change.file}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 smooth-transition"
                    onClick={() => viewDiff(change.file)}
                  >
                    <FileText className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showDiff} onOpenChange={setShowDiff}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>File Changes</DialogTitle>
          </DialogHeader>
          {selectedFile && (
            <DiffViewer
              file={selectedFile}
              oldContent="// Original content"
              newContent="// Modified content"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
