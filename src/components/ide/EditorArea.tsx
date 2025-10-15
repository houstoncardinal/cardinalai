import Editor from '@monaco-editor/react';
import { useIdeStore } from '@/store/ideStore';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EditorArea = () => {
  const { tabs, activeTabId, setActiveTab, closeTab, updateTabContent } = useIdeStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="flex-1 flex flex-col bg-[hsl(var(--editor-bg))]">
      {/* Tab Bar */}
      <div className="flex items-center gap-0.5 bg-[hsl(var(--panel-bg))] border-b border-border px-2">
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

      {/* Editor */}
      <div className="flex-1">
        {activeTab ? (
          <Editor
            height="100%"
            language={activeTab.language}
            value={activeTab.content}
            onChange={(value) => updateTabContent(activeTab.id, value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              fontFamily: "'Fira Code', 'Cascadia Code', monospace",
              lineNumbers: 'on',
              renderWhitespace: 'selection',
              tabSize: 2,
              insertSpaces: true,
              wordWrap: 'on',
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
            }}
          />
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
