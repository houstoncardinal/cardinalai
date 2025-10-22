import { useState, useEffect } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ActivityBar } from "@/components/ide/ActivityBar";
import { FileExplorer } from "@/components/ide/FileExplorer";
import { EditorArea } from "@/components/ide/EditorArea";
import { EnhancedAiPanel } from "@/components/ide/EnhancedAiPanel";
import { TerminalPanel } from "@/components/ide/TerminalPanel";
import { CommandPalette } from "@/components/ide/CommandPalette";
import { LivePreview } from "@/components/ide/LivePreview";
import { DeviceSimulator } from "@/components/ide/DeviceSimulator";
import { GitPanel } from "@/components/ide/GitPanel";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { FileChangeMonitor } from "@/components/ide/FileChangeMonitor";
import { MobileNav } from "@/components/ide/MobileNav";
import { MobileToolbar } from "@/components/ide/MobileToolbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIdeStore } from "@/store/ideStore";

const IDE = () => {
  const isMobile = useIsMobile();
  const { activeView } = useIdeStore();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderSidePanel = () => {
    switch (activeView) {
      case 'explorer':
        return <FileExplorer />;
      case 'git':
        return <GitPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <FileExplorer />;
    }
  };

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <MobileToolbar />
        <div className="flex-1 overflow-hidden">
          {activeView === 'explorer' && <FileExplorer />}
          {activeView === 'editor' && <EditorArea />}
          {activeView === 'ai' && <EnhancedAiPanel />}
          {activeView === 'preview' && <LivePreview />}
          {activeView === 'terminal' && <TerminalPanel />}
        </div>
        <MobileNav />
        <FileChangeMonitor />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <ActivityBar />
      
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          {renderSidePanel()}
        </ResizablePanel>
        
        <ResizableHandle className="w-1 bg-border hover:bg-primary transition-colors" />
        
        <ResizablePanel defaultSize={50} minSize={30}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70} minSize={40}>
              <EditorArea />
            </ResizablePanel>
            
            <ResizableHandle className="h-1 bg-border hover:bg-primary transition-colors" />
            
            <ResizablePanel defaultSize={30} minSize={20}>
              <TerminalPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        
        <ResizableHandle className="w-1 bg-border hover:bg-primary transition-colors" />
        
        <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={60} minSize={40}>
              <EnhancedAiPanel />
            </ResizablePanel>
            
            <ResizableHandle className="h-1 bg-border hover:bg-primary transition-colors" />
            
            <ResizablePanel defaultSize={40} minSize={30}>
              <div className="h-full border-l border-border bg-background/50 backdrop-blur-sm">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-semibold">Preview</h2>
                  <DeviceSimulator />
                </div>
                <LivePreview />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>

      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
      <FileChangeMonitor />
    </div>
  );
};

export default IDE;