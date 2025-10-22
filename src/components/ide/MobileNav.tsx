import { useState } from 'react';
import { Menu, X, Files, GitBranch, Terminal, Sparkles, Code2, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIdeStore } from '@/store/ideStore';

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const {
    fileExplorerOpen,
    gitPanelOpen,
    terminalOpen,
    aiPanelOpen,
    codeGeneratorOpen,
    simulatorOpen,
    toggleFileExplorer,
    toggleGitPanel,
    toggleTerminal,
    toggleAiPanel,
    toggleCodeGenerator,
    toggleSimulator,
  } = useIdeStore();

  const menuItems = [
    {
      icon: Files,
      label: 'File Explorer',
      active: fileExplorerOpen,
      onClick: () => {
        toggleFileExplorer();
        setOpen(false);
      },
    },
    {
      icon: GitBranch,
      label: 'Git',
      active: gitPanelOpen,
      onClick: () => {
        toggleGitPanel();
        setOpen(false);
      },
    },
    {
      icon: Sparkles,
      label: 'AI Copilot',
      active: aiPanelOpen,
      onClick: () => {
        toggleAiPanel();
        setOpen(false);
      },
    },
    {
      icon: Code2,
      label: 'Code Generator',
      active: codeGeneratorOpen,
      onClick: () => {
        toggleCodeGenerator();
        setOpen(false);
      },
    },
    {
      icon: Monitor,
      label: 'Device Simulator',
      active: simulatorOpen,
      onClick: () => {
        toggleSimulator();
        setOpen(false);
      },
    },
    {
      icon: Terminal,
      label: 'Terminal',
      active: terminalOpen,
      onClick: () => {
        toggleTerminal();
        setOpen(false);
      },
    },
  ];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-2 left-2 z-40 metal-panel h-10 w-10"
        onClick={() => setOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 metal-panel p-0">
          <SheetHeader className="border-b border-border p-4">
            <SheetTitle className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold tracking-wide">CARDINAL AI</span>
            </SheetTitle>
          </SheetHeader>

          <div className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg smooth-transition ${
                    item.active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/40 hover:bg-secondary/60 text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
