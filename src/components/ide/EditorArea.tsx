import Editor from '@monaco-editor/react';
import { useIdeStore } from '@/store/ideStore';
import { X } from 'lucide-react';
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
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-xl font-semibold">Welcome to Nebula Studio</h3>
              <p className="text-sm">Open a file from the explorer to start editing</p>
              <p className="text-xs text-primary">Press ⌘K to open command palette</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
