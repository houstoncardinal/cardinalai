import { Terminal as TerminalIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIdeStore } from '@/store/ideStore';
import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TerminalLine {
  type: 'command' | 'output' | 'error' | 'system';
  content: string;
  timestamp?: Date;
}

export const TerminalPanel = () => {
  const { toggleTerminal } = useIdeStore();
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'system', content: 'PathwayAI Terminal v1.0.0 - Type "help" for available commands' },
    { type: 'output', content: '⚡ Development server running at http://localhost:5173' },
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    // Add command to history
    setCommandHistory(prev => [...prev, trimmedCmd]);
    setHistoryIndex(-1);

    // Add command to output
    setLines(prev => [...prev, { type: 'command', content: `$ ${trimmedCmd}` }]);

    // Parse and execute command
    const [command, ...args] = trimmedCmd.split(' ');
    
    switch (command.toLowerCase()) {
      case 'help':
        setLines(prev => [...prev, 
          { type: 'output', content: 'Available commands:' },
          { type: 'output', content: '  help          - Show this help message' },
          { type: 'output', content: '  clear         - Clear terminal' },
          { type: 'output', content: '  ls            - List files' },
          { type: 'output', content: '  pwd           - Print working directory' },
          { type: 'output', content: '  echo <text>   - Print text' },
          { type: 'output', content: '  date          - Show current date/time' },
          { type: 'output', content: '  about         - About PathwayAI' },
          { type: 'output', content: '  theme         - Show current theme' },
        ]);
        break;

      case 'clear':
        setLines([]);
        break;

      case 'ls':
        setLines(prev => [...prev,
          { type: 'output', content: 'src/          components/   pages/        public/' },
          { type: 'output', content: 'package.json  tsconfig.json vite.config.ts' },
        ]);
        break;

      case 'pwd':
        setLines(prev => [...prev, { type: 'output', content: '/workspace/pathwayai' }]);
        break;

      case 'echo':
        setLines(prev => [...prev, { type: 'output', content: args.join(' ') }]);
        break;

      case 'date':
        setLines(prev => [...prev, { type: 'output', content: new Date().toString() }]);
        break;

      case 'about':
        setLines(prev => [...prev,
          { type: 'output', content: '🌟 PathwayAI - Where Code Meets Consciousness' },
          { type: 'output', content: 'A development environment so aware, it feels alive' },
          { type: 'output', content: 'Version: 1.0.0' },
        ]);
        break;

      case 'theme':
        setLines(prev => [...prev, { type: 'output', content: 'Current theme: Metallic Luxury' }]);
        break;

      default:
        setLines(prev => [...prev, { 
          type: 'error', 
          content: `Command not found: ${command}. Type "help" for available commands.` 
        }]);
    }

    setCurrentCommand('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(currentCommand);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentCommand(commandHistory[newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Basic autocomplete for common commands
      const commands = ['help', 'clear', 'ls', 'pwd', 'echo', 'date', 'about', 'theme'];
      const matches = commands.filter(cmd => cmd.startsWith(currentCommand.toLowerCase()));
      if (matches.length === 1) {
        setCurrentCommand(matches[0]);
      }
    }
  };

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command': return 'text-cyan-400';
      case 'output': return 'text-foreground';
      case 'error': return 'text-red-400';
      case 'system': return 'text-primary';
      default: return 'text-foreground';
    }
  };

  return (
    <div className="h-64 glass-panel border-t flex flex-col bg-gradient-to-br from-[#0a0a14] via-[#0f0f1e] to-[#1a1a2e]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-primary animate-pulse" />
          <h3 className="text-sm font-semibold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
            PATHWAY TERMINAL
          </h3>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6 hover:bg-white/10"
          onClick={toggleTerminal}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 bg-[hsl(var(--editor-bg))] p-4 font-mono text-sm overflow-y-auto"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="space-y-1">
          {lines.map((line, idx) => (
            <div key={idx} className={getLineColor(line.type)}>
              {line.content}
            </div>
          ))}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-green-500">$</span>
            <input
              ref={inputRef}
              type="text"
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none text-foreground caret-primary"
              autoFocus
              spellCheck={false}
            />
            <span className="w-2 h-4 bg-primary animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
