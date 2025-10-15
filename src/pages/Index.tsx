import { useEffect } from 'react';
import { useIdeStore } from '@/store/ideStore';
import { ActivityBar } from '@/components/ide/ActivityBar';
import { MobileNav } from '@/components/ide/MobileNav';
import { MobileToolbar } from '@/components/ide/MobileToolbar';
import { FileExplorer } from '@/components/ide/FileExplorer';
import { EditorArea } from '@/components/ide/EditorArea';
import { EnhancedAiPanel } from '@/components/ide/EnhancedAiPanel';
import { GitPanel } from '@/components/ide/GitPanel';
import { TerminalPanel } from '@/components/ide/TerminalPanel';
import { CommandPalette } from '@/components/ide/CommandPalette';
import { DeviceSimulator } from '@/components/ide/DeviceSimulator';
import { CodeGenerator } from '@/components/ide/CodeGenerator';

const Index = () => {
  const { 
    theme, 
    fileExplorerOpen, 
    gitPanelOpen, 
    aiPanelOpen, 
    terminalOpen,
    simulatorOpen,
    codeGeneratorOpen,
    toggleSimulator,
    toggleCodeGenerator
  } = useIdeStore();

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.remove('theme-pearl', 'theme-titanium');
    if (theme === 'pearl') {
      document.documentElement.classList.add('theme-pearl');
    } else if (theme === 'titanium') {
      document.documentElement.classList.add('theme-titanium');
    }
  }, [theme]);

  useEffect(() => {
    // Prevent zoom on mobile double-tap
    let lastTouchEnd = 0;
    const preventZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchend', preventZoom, { passive: false });
    return () => document.removeEventListener('touchend', preventZoom);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background touch-manipulation animate-fade-in-up">
      {/* Mobile Navigation */}
      <MobileNav />
      <MobileToolbar />
      
      {/* Desktop Activity Bar */}
      <ActivityBar />
      
      {simulatorOpen && <DeviceSimulator onClose={toggleSimulator} />}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile: Panels overlay on small screens */}
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
          {/* Side Panels - Hidden on mobile by default, shown in drawer */}
          <div className="hidden md:flex">
            {fileExplorerOpen && <FileExplorer />}
            {gitPanelOpen && <GitPanel />}
          </div>

          {/* Mobile: Panels as full-screen overlays */}
          {fileExplorerOpen && (
            <div className="md:hidden absolute inset-0 z-30 bg-background">
              <FileExplorer />
            </div>
          )}
          
          {gitPanelOpen && (
            <div className="md:hidden absolute inset-0 z-30 bg-background">
              <GitPanel />
            </div>
          )}

          {/* Editor/Generator Area */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {codeGeneratorOpen ? <CodeGenerator /> : <EditorArea />}
            
            {/* Terminal - Collapsible on mobile */}
            {terminalOpen && (
              <div className="flex-shrink-0">
                <TerminalPanel />
              </div>
            )}
          </div>

          {/* AI Panel - Full screen on mobile, sidebar on desktop */}
          {aiPanelOpen && (
            <div className="md:relative absolute inset-0 md:inset-auto z-30 md:z-auto">
              <EnhancedAiPanel />
            </div>
          )}

          {/* Code Generator - Full screen on mobile */}
          {codeGeneratorOpen && (
            <div className="md:hidden absolute inset-0 z-30 bg-background">
              <CodeGenerator />
            </div>
          )}
        </div>
      </div>

      <CommandPalette />
    </div>
  );
};

export default Index;
