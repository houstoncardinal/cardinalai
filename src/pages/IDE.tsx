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
import { AiOperationOverlay } from "@/components/ide/AiOperationOverlay";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIdeStore } from "@/store/ideStore";

type ViewType = 'explorer' | 'editor' | 'ai' | 'preview' | 'terminal' | 'git' | 'settings';

const IDE = () => {
  const isMobile = useIsMobile();
  const [activeView, setActiveView] = useState<ViewType>('editor');
  const [showSettings, setShowSettings] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const { livePreviewOpen } = useIdeStore();


  const renderSidePanel = () => {
    switch (activeView) {
      case 'explorer':
        return <FileExplorer />;
      case 'git':
        return <GitPanel />;
      case 'settings':
        setShowSettings(true);
        return <FileExplorer />;
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
          {activeView === 'git' && <GitPanel />}
        </div>
        <MobileNav />
        <FileChangeMonitor />
        <AiOperationOverlay />
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
        
        <ResizablePanel defaultSize={45} minSize={30}>
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
        
        <ResizablePanel defaultSize={35} minSize={30} maxSize={50}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={livePreviewOpen ? 50 : 100} minSize={40}>
              <EnhancedAiPanel />
            </ResizablePanel>
            
            {livePreviewOpen && (
              <>
                <ResizableHandle className="h-1 bg-border hover:bg-primary transition-colors" />
                
                <ResizablePanel defaultSize={50} minSize={40}>
                  <LivePreview />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>

      <CommandPalette />
      <FileChangeMonitor />
      <AiOperationOverlay />
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {showSimulator && <DeviceSimulator onClose={() => setShowSimulator(false)} />}
    </div>
  );
};

export default IDE;