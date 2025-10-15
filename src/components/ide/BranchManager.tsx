import { useState, useEffect } from 'react';
import { GitBranch, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { gitService } from '@/lib/git';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

export const BranchManager = () => {
  const [branches, setBranches] = useState<string[]>([]);
  const [currentBranch, setCurrentBranch] = useState<string>('main');
  const [newBranchName, setNewBranchName] = useState('');
  const [showInput, setShowInput] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    const branchList = await gitService.branches();
    const current = await gitService.currentBranch();
    setBranches(branchList);
    setCurrentBranch(current);
  };

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) return;

    const success = await gitService.createBranch(newBranchName);
    if (success) {
      toast({
        title: 'Branch created',
        description: `Created branch: ${newBranchName}`,
      });
      setNewBranchName('');
      setShowInput(false);
      loadBranches();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to create branch',
        variant: 'destructive',
      });
    }
  };

  const handleCheckout = async (branch: string) => {
    const success = await gitService.checkout(branch);
    if (success) {
      toast({
        title: 'Switched branch',
        description: `Now on branch: ${branch}`,
      });
      setCurrentBranch(branch);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to switch branch',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="glass-panel p-4 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">BRANCHES</h3>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={() => setShowInput(!showInput)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {showInput && (
        <div className="flex gap-2">
          <Input
            placeholder="New branch name..."
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateBranch()}
            className="h-8 text-xs"
          />
          <Button size="sm" onClick={handleCreateBranch} className="h-8">
            Create
          </Button>
        </div>
      )}

      <ScrollArea className="max-h-48">
        <div className="space-y-1">
          {branches.map((branch) => (
            <button
              key={branch}
              onClick={() => handleCheckout(branch)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm smooth-transition ${
                branch === currentBranch
                  ? 'bg-primary/20 text-primary'
                  : 'hover:bg-secondary/50 text-foreground'
              }`}
            >
              <span>{branch}</span>
              {branch === currentBranch && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
