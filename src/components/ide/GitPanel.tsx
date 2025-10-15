import { GitBranch, GitCommit, Plus, Minus, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const mockChanges = [
  { file: 'src/App.tsx', status: 'modified', additions: 12, deletions: 3 },
  { file: 'src/components/Button.tsx', status: 'new', additions: 24, deletions: 0 },
  { file: 'package.json', status: 'modified', additions: 2, deletions: 1 },
];

export const GitPanel = () => {
  const [commitMessage, setCommitMessage] = useState('');
  const [staged, setStaged] = useState<string[]>([]);

  const toggleStaged = (file: string) => {
    setStaged(prev => 
      prev.includes(file) 
        ? prev.filter(f => f !== file)
        : [...prev, file]
    );
  };

  return (
    <div className="w-80 glass-panel border-l flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <GitBranch className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">SOURCE CONTROL</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Circle className="w-3 h-3 fill-primary text-primary" />
          <span>main</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          <Input
            placeholder="Commit message..."
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            className="glass-panel border-border"
          />
          <Button 
            className="w-full neon-glow"
            disabled={staged.length === 0 || !commitMessage}
          >
            <GitCommit className="w-4 h-4 mr-2" />
            Commit {staged.length > 0 && `(${staged.length})`}
          </Button>
        </div>

        <div className="px-4 py-2">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">
            CHANGES ({mockChanges.length})
          </h3>
          <div className="space-y-1">
            {mockChanges.map((change) => (
              <button
                key={change.file}
                onClick={() => toggleStaged(change.file)}
                className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-secondary/50 rounded text-sm smooth-transition"
              >
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="checkbox"
                    checked={staged.includes(change.file)}
                    onChange={() => {}}
                    className="accent-primary"
                  />
                  <span className={change.status === 'new' ? 'text-green-500' : 'text-yellow-500'}>
                    {change.status === 'new' ? 'U' : 'M'}
                  </span>
                  <span className="text-foreground truncate">{change.file}</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="flex items-center gap-0.5 text-green-500">
                    <Plus className="w-3 h-3" />
                    {change.additions}
                  </span>
                  {change.deletions > 0 && (
                    <span className="flex items-center gap-0.5 text-red-500">
                      <Minus className="w-3 h-3" />
                      {change.deletions}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
