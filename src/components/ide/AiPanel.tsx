import { useState } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useIdeStore } from '@/store/ideStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type AiMode = 'explain' | 'refactor' | 'test' | 'fix' | 'chat';

export const AiPanel = () => {
  const { tabs, activeTabId } = useIdeStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const [mode, setMode] = useState<AiMode>('explain');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const modes: { value: AiMode; label: string; desc: string }[] = [
    { value: 'explain', label: 'Explain', desc: 'Understand the code' },
    { value: 'refactor', label: 'Refactor', desc: 'Improve code quality' },
    { value: 'test', label: 'Test', desc: 'Generate unit tests' },
    { value: 'fix', label: 'Fix', desc: 'Debug and fix errors' },
    { value: 'chat', label: 'Chat', desc: 'Ask questions' },
  ];

  const handleSubmit = async () => {
    if (!activeTab && mode !== 'chat') {
      toast({
        title: 'No file selected',
        description: 'Please open a file to use AI assistance',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-code-assist', {
        body: {
          mode,
          code: activeTab?.content || '',
          language: activeTab?.language || 'plaintext',
          context: prompt,
        },
      });

      if (error) throw error;

      setResponse(data.result);
      setPrompt('');
    } catch (error: any) {
      toast({
        title: 'AI Error',
        description: error.message || 'Failed to get AI response',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-96 glass-panel border-l flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary neon-glow" />
          <h2 className="text-sm font-semibold">AI COPILOT</h2>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="p-4 border-b border-border">
        <div className="grid grid-cols-3 gap-2">
          {modes.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`px-3 py-2 rounded text-xs smooth-transition ${
                mode === m.value
                  ? 'bg-primary/20 text-primary neon-glow'
                  : 'bg-secondary/20 text-muted-foreground hover:bg-secondary/40'
              }`}
            >
              <div className="font-semibold">{m.label}</div>
              <div className="text-[10px] opacity-70">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Response Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab && (
          <div className="glass-panel p-3 rounded text-xs">
            <div className="text-muted-foreground mb-1">Current file:</div>
            <div className="text-primary font-mono">{activeTab.title}</div>
          </div>
        )}

        {response && (
          <div className="glass-panel p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary">AI Response</span>
            </div>
            <div className="text-sm text-foreground whitespace-pre-wrap">{response}</div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <div className="space-y-2">
          <Textarea
            placeholder={
              mode === 'chat'
                ? 'Ask a question about the code...'
                : `Additional context for ${mode} mode...`
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="glass-panel border-border resize-none h-20"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full neon-glow"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Thinking...' : 'Send (⌘↵)'}
          </Button>
        </div>
      </div>
    </div>
  );
};
