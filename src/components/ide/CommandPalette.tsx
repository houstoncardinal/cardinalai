import { useState, useEffect } from 'react';
import { useIdeStore } from '@/store/ideStore';
import { Command } from 'cmdk';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Palette, 
  Files, 
  GitBranch, 
  Terminal, 
  Sparkles,
  Sun,
  Moon,
  Zap
} from 'lucide-react';

export const CommandPalette = () => {
  const { 
    commandPaletteOpen, 
    toggleCommandPalette,
    setTheme,
    toggleFileExplorer,
    toggleGitPanel,
    toggleTerminal,
    toggleAiPanel
  } = useIdeStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCommandPalette();
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [toggleCommandPalette]);

  const handleSelect = (callback: () => void) => {
    callback();
    toggleCommandPalette();
    setSearch('');
  };

  return (
    <Dialog open={commandPaletteOpen} onOpenChange={toggleCommandPalette}>
      <DialogContent className="p-0 max-w-2xl glass-panel neon-glow">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <DialogDescription className="sr-only">
          Search and execute commands
        </DialogDescription>
        <Command className="rounded-lg border-0">
          <Command.Input
            placeholder="Type a command or search..."
            value={search}
            onValueChange={setSearch}
            className="border-0 border-b border-border px-4 py-3 text-base bg-transparent focus:outline-none focus:ring-0"
          />
          <Command.List className="max-h-96 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group heading="Themes" className="text-xs text-muted-foreground px-2 py-1.5">
              <Command.Item
                onSelect={() => handleSelect(() => setTheme('obsidian'))}
                className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-primary/20 smooth-transition"
              >
                <Moon className="w-4 h-4 text-primary" />
                <span>Obsidian</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => setTheme('pearl'))}
                className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-primary/20 smooth-transition"
              >
                <Sun className="w-4 h-4 text-primary" />
                <span>Pearl</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => setTheme('titanium'))}
                className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-primary/20 smooth-transition"
              >
                <Zap className="w-4 h-4 text-primary" />
                <span>Titanium</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Panels" className="text-xs text-muted-foreground px-2 py-1.5 mt-2">
              <Command.Item
                onSelect={() => handleSelect(toggleFileExplorer)}
                className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-primary/20 smooth-transition"
              >
                <Files className="w-4 h-4" />
                <span>Toggle File Explorer</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(toggleGitPanel)}
                className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-primary/20 smooth-transition"
              >
                <GitBranch className="w-4 h-4" />
                <span>Toggle Git Panel</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(toggleAiPanel)}
                className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-primary/20 smooth-transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Toggle AI Copilot</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(toggleTerminal)}
                className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-primary/20 smooth-transition"
              >
                <Terminal className="w-4 h-4" />
                <span>Toggle Terminal</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
