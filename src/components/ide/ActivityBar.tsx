import { Files, GitBranch, Terminal, Sparkles, Palette, Command, Monitor, Code2, Settings, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { useIdeStore } from '@/store/ideStore';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { soundManager } from '@/utils/sounds';

export const ActivityBar = () => {
  const { 
    fileExplorerOpen, 
    gitPanelOpen, 
    terminalOpen, 
    aiPanelOpen,
    simulatorOpen,
    codeGeneratorOpen,
    componentBuilderOpen,
    toggleFileExplorer,
    toggleGitPanel,
    toggleTerminal,
    toggleAiPanel,
    toggleCommandPalette,
    toggleSimulator,
    toggleCodeGenerator,
    toggleComponentBuilder
  } = useIdeStore();
  
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleClick = (action: () => void) => {
    soundManager.click();
    action();
  };

  return (
    <>
      <div className="hidden md:flex w-12 metal-panel border-r flex-col items-center py-4 gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`w-10 h-10 smooth-transition ${
                fileExplorerOpen ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => handleClick(toggleFileExplorer)}
            >
              <Files className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Files</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`w-10 h-10 smooth-transition ${
                gitPanelOpen ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => handleClick(toggleGitPanel)}
            >
              <GitBranch className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Git</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`w-10 h-10 smooth-transition metal-shine ${
                aiPanelOpen ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => handleClick(toggleAiPanel)}
            >
              <Sparkles className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">AI Copilot</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`w-10 h-10 smooth-transition metal-shine ${
                codeGeneratorOpen ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => handleClick(toggleCodeGenerator)}
            >
              <Code2 className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Code Generator</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`w-10 h-10 smooth-transition metal-shine ${
                componentBuilderOpen ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => handleClick(toggleComponentBuilder)}
            >
              <Wand2 className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Component Builder</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`w-10 h-10 smooth-transition metal-shine ${
                simulatorOpen ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => handleClick(toggleSimulator)}
            >
              <Monitor className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Device Simulator</TooltipContent>
        </Tooltip>

        <div className="flex-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 text-muted-foreground hover:text-foreground smooth-transition"
              onClick={() => handleClick(toggleCommandPalette)}
            >
              <Command className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Command Palette (⌘K)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`w-10 h-10 smooth-transition ${
                terminalOpen ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => handleClick(toggleTerminal)}
            >
              <Terminal className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Terminal</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 text-muted-foreground hover:text-foreground smooth-transition"
              onClick={() => handleClick(() => setSettingsOpen(true))}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>

        <ThemeSelector />
      </div>
      
      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
    </>
  );
};

const ThemeSelector = () => {
  const { theme, setTheme } = useIdeStore();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 text-muted-foreground hover:text-foreground smooth-transition"
          onClick={() => {
            const themes: ('obsidian' | 'pearl' | 'titanium')[] = ['obsidian', 'pearl', 'titanium'];
            const currentIndex = themes.indexOf(theme);
            const nextTheme = themes[(currentIndex + 1) % themes.length];
            setTheme(nextTheme);
          }}
        >
          <Palette className="w-5 h-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">Switch Theme</TooltipContent>
    </Tooltip>
  );
};
