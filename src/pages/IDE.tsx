import { useState, useEffect } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ActivityBar } from "@/components/ide/ActivityBar";
import { EnhancedFileExplorer } from "@/components/ide/EnhancedFileExplorer";
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
import { ThemeSwitcher } from "@/components/ide/ThemeSwitcher";
import { ProjectSwitcher } from "@/components/ide/ProjectSwitcher";
import { UserMenu } from "@/components/ide/UserMenu";
import { ActivityPanel } from "@/components/ide/ActivityPanel";
import { AnalyticsDashboard } from "@/components/ide/AnalyticsDashboard";
import { PathwayCollectivePanel } from "@/components/ide/PathwayCollectivePanel";
import { PredictiveSuggestionsPanel } from "@/components/ide/PredictiveSuggestionsPanel";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIdeStore } from "@/store/ideStore";
import { CloudProject } from "@/lib/cloudFileSystem";
import { useAnalytics } from "@/hooks/useAnalytics";

type ViewType = 'explorer' | 'editor' | 'ai' | 'preview' | 'terminal' | 'git' | 'settings' | 'activity' | 'analytics' | 'agent' | 'predictions';

const IDE = () => {
  const isMobile = useIsMobile();
  const [activeView, setActiveView] = useState<ViewType>('editor');
  const [showSettings, setShowSettings] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [currentProject, setCurrentProject] = useState<CloudProject | null>(null);
  const { livePreviewOpen, theme } = useIdeStore();
  const { trackPageView } = useAnalytics();
  
  useEffect(() => {
    trackPageView('ide', currentProject?.id);
  }, [trackPageView, currentProject?.id]);

  // Apply theme on mount and when it changes
  useEffect(() => {
    document.documentElement.classList.remove(
      'theme-obsidian',
      'theme-pearl',
      'theme-titanium',
      'theme-neon',
      'theme-cyberpunk',
      'theme-forest',
      'theme-ocean',
      'theme-sunset'
    );
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);


  const renderSidePanel = () => {
    switch (activeView) {
      case 'explorer':
        return <EnhancedFileExplorer />;
      case 'git':
        return <GitPanel />;
      case 'activity':
        return <ActivityPanel projectId={currentProject?.id || null} />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'agent':
        return <PathwayCollectivePanel projectId={currentProject?.id || null} />;
      case 'predictions':
        return <PredictiveSuggestionsPanel projectId={currentProject?.id || null} />;
      case 'settings':
        setShowSettings(true);
        return <EnhancedFileExplorer />;
      default:
        return <EnhancedFileExplorer />;
    }
  };

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Mobile Theme Switcher */}
        <div className="absolute top-2 right-2 z-50">
          <ThemeSwitcher />
        </div>
        
        <MobileToolbar />
        <div className="flex-1 overflow-hidden">
          {activeView === 'explorer' && <EnhancedFileExplorer />}
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
      <ActivityBar onViewChange={setActiveView} />
      
      {/* Top bar with Project Switcher and User Menu */}
      <div className="absolute top-3 left-16 right-3 z-50 flex items-center justify-between px-4">
        <ProjectSwitcher 
          currentProject={currentProject} 
          onProjectChange={setCurrentProject} 
        />
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <UserMenu />
        </div>
      </div>
      
      <ResizablePanelGroup direction="horizontal" className="flex-1 pt-16">
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