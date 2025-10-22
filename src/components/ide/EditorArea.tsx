import Editor from '@monaco-editor/react';
import { useIdeStore } from '@/store/ideStore';
import { X, Sparkles, Save, Search, Replace } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fileSystem } from '@/lib/fileSystem';
import { toast } from '@/hooks/use-toast';
import * as React from 'react';
import { AnimatedCodeEditor } from './CodeTypingAnimation';
import { useAiOperationStore } from '@/hooks/useAiOperationEvents';

export const EditorArea = () => {
  const { tabs, activeTabId, setActiveTab, closeTab, updateTabContent, refreshTabs } = useIdeStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const operations = useAiOperationStore((state) => state.operations);
  
  // Check if AI is currently editing this file
  const isAiEditing = operations.some(
    (op) => op.type === 'editing' && activeTab && op.target.includes(activeTab.title)
  );

  const handleSave = async () => {
    if (!activeTab || !activeTab.fileId) return;
    
    try {
      await fileSystem.updateFile(activeTab.fileId, {
        content: activeTab.content,
      });
      
      // Mark as not modified
      const updatedTabs = tabs.map(t => 
        t.id === activeTab.id ? { ...t, modified: false } : t
      );
      
      toast({
        title: 'Saved',
        description: `${activeTab.title} saved successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save file',
        variant: 'destructive',
      });
    }
  };

  // Keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  return (
    <div className="flex-1 flex flex-col bg-[hsl(var(--editor-bg))] min-h-0">
      {/* Tab Bar */}
      <div className="flex items-center justify-between gap-0.5 bg-[hsl(var(--panel-bg))] border-b border-border px-2 flex-shrink-0">
        <div className="flex items-center gap-0.5 flex-1 overflow-x-auto">
          {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center gap-2 px-3 py-2 text-sm smooth-transition border-b-2 ${
              activeTabId === tab.id
                ? 'bg-[hsl(var(--editor-bg))] text-foreground border-primary'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.title}</span>
            {tab.modified && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
            <Button
              variant="ghost"
              size="icon"
              className="w-4 h-4 p-0 hover:bg-destructive/20"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          </button>
        ))}
        </div>
        {activeTab && activeTab.modified && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="flex items-center gap-2"
            title="Save (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
            <span className="text-xs">Save</span>
          </Button>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        {activeTab ? (
          <AnimatedCodeEditor isAiTyping={isAiEditing}>
            <Editor
            height="100%"
            path={activeTab.title}
            language={activeTab.language}
            value={activeTab.content}
            onChange={(value) => {
              updateTabContent(activeTab.id, value || '');
            }}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
              fontLigatures: true,
              lineNumbers: 'on',
              renderWhitespace: 'selection',
              tabSize: 2,
              insertSpaces: true,
              wordWrap: 'on',
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              automaticLayout: true,
              formatOnPaste: true,
              formatOnType: true,
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              snippetSuggestions: 'inline',
              folding: true,
              foldingStrategy: 'indentation',
              showFoldingControls: 'always',
              matchBrackets: 'always',
              autoClosingBrackets: 'always',
              autoClosingQuotes: 'always',
              autoIndent: 'full',
              find: {
                addExtraSpaceOnTop: true,
                autoFindInSelection: 'multiline',
                seedSearchStringFromSelection: 'selection',
              },
            }}
          />
          </AnimatedCodeEditor>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center space-y-4 animate-fade-in-up">
              <div className="text-6xl mb-4 animate-pulse">✨</div>
              <h3 className="text-xl font-semibold">Welcome to PathwayAI</h3>
              <p className="text-sm">Open a file from the explorer to start editing</p>
              <p className="text-xs text-primary">Press ⌘K to open command palette</p>
              <div className="glass-panel p-4 mx-auto max-w-md mt-6 text-left">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Quick Tips
                </h4>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>AI Assistant</span>
                    <kbd className="px-2 py-1 rounded bg-secondary">⌘J</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Command Palette</span>
                    <kbd className="px-2 py-1 rounded bg-secondary">⌘K</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Toggle Terminal</span>
                    <kbd className="px-2 py-1 rounded bg-secondary">⌘`</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
