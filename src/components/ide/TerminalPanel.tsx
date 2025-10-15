import { Terminal as TerminalIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIdeStore } from '@/store/ideStore';

export const TerminalPanel = () => {
  const { toggleTerminal } = useIdeStore();

  return (
    <div className="h-64 glass-panel border-t flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">TERMINAL</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6"
          onClick={toggleTerminal}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 bg-[hsl(var(--editor-bg))] p-4 font-mono text-sm overflow-y-auto">
        <div className="text-green-500">nebula-studio@1.0.0 ~</div>
        <div className="text-muted-foreground mt-1">$ npm run dev</div>
        <div className="text-primary mt-2">
          ⚡ Vite dev server running at http://localhost:5173
        </div>
        <div className="text-muted-foreground mt-1">
          ➜ Press h to show help
        </div>
        <div className="mt-2 flex">
          <span className="text-green-500">$</span>
          <span className="ml-2 animate-pulse">_</span>
        </div>
      </div>
    </div>
  );
};
