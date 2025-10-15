import { Sparkles, Code, Bug, RefreshCw, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AiCodeActionsProps {
  selectedText: string;
  onAction: (action: string, text: string) => void;
}

export const AiCodeActions = ({ selectedText, onAction }: AiCodeActionsProps) => {
  const actions = [
    { id: 'explain', label: 'Explain', icon: MessageSquare, color: 'text-blue-400' },
    { id: 'refactor', label: 'Refactor', icon: RefreshCw, color: 'text-purple-400' },
    { id: 'debug', label: 'Debug', icon: Bug, color: 'text-red-400' },
    { id: 'optimize', label: 'Optimize', icon: Code, color: 'text-green-400' },
  ];

  return (
    <div className="glass-panel rounded-lg p-2 shadow-lg border border-primary/20">
      <div className="flex items-center gap-1 mb-2">
        <Sparkles className="w-3 h-3 text-primary animate-pulse" />
        <span className="text-[10px] font-semibold text-muted-foreground">AI ACTIONS</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              size="sm"
              variant="ghost"
              onClick={() => onAction(action.id, selectedText)}
              className={`h-8 text-xs ${action.color} hover:bg-secondary/50`}
            >
              <Icon className="w-3 h-3 mr-1" />
              {action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
