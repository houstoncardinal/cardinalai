import Editor, { OnMount } from '@monaco-editor/react';
import { useIdeStore } from '@/store/ideStore';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { defineMonacoTheme, themeRegistry } from '@/lib/monacoThemes';
import { AiCodeActions } from './AiCodeActions';

export const EditorArea = () => {
  const { tabs, activeTabId, setActiveTab, closeTab, updateTabContent, theme } = useIdeStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const editorRef = useRef<any>(null);
  const [selectedText, setSelectedText] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [actionPosition, setActionPosition] = useState({ top: 0, left: 0 });

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define custom themes
    Object.values(themeRegistry).forEach(theme => {
      defineMonacoTheme(monaco, theme);
    });

    // Set initial theme
    const pathwayTheme = themeRegistry[theme];
    if (pathwayTheme) {
      monaco.editor.setTheme(pathwayTheme.id);
    }

    // Handle text selection
    editor.onDidChangeCursorSelection((e) => {
      const model = editor.getModel();
      if (!model) return;

      const selection = e.selection;
      const text = model.getValueInRange(selection);

      if (text.trim().length > 0) {
        setSelectedText(text);
        const position = editor.getScrolledVisiblePosition(selection.getStartPosition());
        if (position) {
          setActionPosition({
            top: position.top + 30,
            left: position.left,
          });
          setShowActions(true);
        }
      } else {
        setShowActions(false);
      }
    });
  };

  useEffect(() => {
    if (editorRef.current) {
      const pathwayTheme = themeRegistry[theme];
      if (pathwayTheme) {
        editorRef.current.updateOptions({ theme: pathwayTheme.id });
      }
    }
  }, [theme]);

  const handleAiAction = (action: string, text: string) => {
    console.log('AI Action:', action, 'Text:', text);
    // This would integrate with the AI panel
    setShowActions(false);
  };

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
      <div className="flex-1 relative">
        {activeTab ? (
          <>
            <Editor
              height="100%"
              language={activeTab.language}
              value={activeTab.content}
              onChange={(value) => updateTabContent(activeTab.id, value || '')}
              onMount={handleEditorMount}
              theme={themeRegistry[theme]?.id || 'vs-dark'}
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
            {showActions && (
              <div
                className="absolute z-50"
                style={{ top: `${actionPosition.top}px`, left: `${actionPosition.left}px` }}
              >
                <AiCodeActions selectedText={selectedText} onAction={handleAiAction} />
              </div>
            )}
          </>
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
