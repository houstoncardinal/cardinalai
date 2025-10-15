import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, Trash2, Code, FileCode, TestTube, Bug, MessageSquare, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useIdeStore } from '@/store/ideStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { soundManager } from '@/utils/sounds';

type AiMode = 'architect' | 'debugger' | 'mentor' | 'composer' | 'chat';

interface AgentPersonality {
  name: string;
  color: string;
  gradient: string;
  description: string;
  systemPrompt: string;
}

const AGENT_PERSONALITIES: Record<AiMode, AgentPersonality> = {
  architect: {
    name: 'The Architect',
    color: 'hsl(200, 80%, 60%)',
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Designs frameworks and structures',
    systemPrompt: 'You are The Architect - a visionary AI that designs elegant code architectures, project structures, and system designs. Speak with confidence and precision. Focus on scalability, maintainability, and best practices.'
  },
  debugger: {
    name: 'The Debugger',
    color: 'hsl(0, 80%, 60%)',
    gradient: 'from-red-500 to-orange-500',
    description: 'Analyzes and resolves issues',
    systemPrompt: 'You are The Debugger - a methodical AI that identifies bugs, explains errors, and provides solutions. Speak calmly and factually. Break down complex problems into understandable steps.'
  },
  mentor: {
    name: 'The Mentor',
    color: 'hsl(150, 70%, 55%)',
    gradient: 'from-green-500 to-emerald-500',
    description: 'Teaches and explains concepts',
    systemPrompt: 'You are The Mentor - a supportive AI that explains code concepts, teaches best practices, and encourages learning. Speak warmly and insightfully. Break down complex topics into digestible lessons.'
  },
  composer: {
    name: 'The Composer',
    color: 'hsl(280, 70%, 60%)',
    gradient: 'from-purple-500 to-pink-500',
    description: 'Refactors with artistic precision',
    systemPrompt: 'You are The Composer - an artistic AI that refactors code into elegant, efficient masterpieces. Speak poetically yet technically. Transform messy code into beautiful, maintainable art.'
  },
  chat: {
    name: 'Pathway Collective',
    color: 'hsl(0, 0%, 85%)',
    gradient: 'from-gray-400 to-gray-600',
    description: 'General AI assistance',
    systemPrompt: 'You are part of the Pathway Collective - a collaborative AI system. Provide helpful, accurate responses to any coding question. Adapt your tone based on the query.'
  }
};

export const EnhancedAiPanel = () => {
  const { tabs, activeTabId, aiHistory, addAiMessage, clearAiHistory } = useIdeStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const [mode, setMode] = useState<AiMode>('chat');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiHistory]);

  const currentAgent = AGENT_PERSONALITIES[mode];

  const modes: { value: AiMode; label: string; icon: any; desc: string }[] = [
    { value: 'architect', label: 'Architect', icon: Code, desc: 'Design structures' },
    { value: 'debugger', label: 'Debugger', icon: Bug, desc: 'Fix issues' },
    { value: 'mentor', label: 'Mentor', icon: MessageSquare, desc: 'Learn & explain' },
    { value: 'composer', label: 'Composer', icon: Sparkles, desc: 'Refactor elegantly' },
    { value: 'chat', label: 'Collective', icon: FileCode, desc: 'General help' },
  ];

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    
    if (!activeTab && mode !== 'chat') {
      toast({
        title: 'No file selected',
        description: 'Please open a file to use AI assistance',
        variant: 'destructive',
      });
      return;
    }

    soundManager.aiThinking();

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: prompt,
      timestamp: Date.now(),
      mode,
      agent: currentAgent.name,
    };

    addAiMessage(userMessage);
    setPrompt('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-code-assist', {
        body: {
          mode,
          code: activeTab?.content || '',
          language: activeTab?.language || 'plaintext',
          context: prompt,
          systemPrompt: currentAgent.systemPrompt,
        },
      });

      if (error) throw error;

      soundManager.aiResponse();

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: data.result,
        timestamp: Date.now(),
        mode,
        agent: currentAgent.name,
      };

      addAiMessage(assistantMessage);
    } catch (error: any) {
      soundManager.error();
      toast({
        title: 'AI Error',
        description: error.message || 'Failed to get AI response',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: 'Copied to clipboard',
      description: 'Code copied successfully',
    });
  };

  return (
    <div className="w-full md:w-96 metal-panel border-l flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border metal-shine relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: `linear-gradient(135deg, ${currentAgent.color}, transparent)`
          }}
        />
        <div className="relative flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <h2 className="text-sm font-semibold tracking-wide">PATHWAY AI</h2>
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {currentAgent.name} • {currentAgent.description}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={clearAiHistory}
            disabled={aiHistory.length === 0}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="p-3 border-b border-border">
        <div className="grid grid-cols-5 gap-1">
          {modes.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`px-2 py-2 rounded smooth-transition flex flex-col items-center gap-1 ${
                  mode === m.value
                    ? 'bg-primary text-primary-foreground sharp-shadow'
                    : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/60'
                }`}
                title={m.desc}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[9px] font-medium">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {activeTab && (
          <div className="glass-panel p-2.5 rounded mb-3 text-xs">
            <div className="text-muted-foreground mb-1 text-[10px] uppercase tracking-wide">Active File</div>
            <div className="text-primary font-mono flex items-center gap-1.5">
              <FileCode className="w-3 h-3" />
              {activeTab.title}
            </div>
          </div>
        )}

        {aiHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Sparkles className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">Start a conversation with PathwayAI</p>
            <p className="text-xs text-muted-foreground/70 mt-2">Ask questions, get explanations, or refactor code</p>
          </div>
        )}

        <div className="space-y-3">
          {aiHistory.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-secondary/50 ml-4'
                  : 'glass-panel mr-4'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {msg.role === 'user' ? (
                    <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary">U</span>
                    </div>
                  ) : (
                    <Sparkles className="w-4 h-4 text-primary" />
                  )}
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {msg.role === 'user' ? 'You' : 'PathwayAI'}
                  </span>
                </div>
                {msg.role === 'assistant' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(msg.content, msg.id)}
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                )}
              </div>
              <div className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="glass-panel p-3 rounded-lg mr-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">PathwayAI</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-3 border-t border-border">
        <div className="space-y-2">
          <Textarea
            placeholder={
              mode === 'chat'
                ? 'Ask PathwayAI anything...'
                : `${mode.charAt(0).toUpperCase() + mode.slice(1)} mode: Add context...`
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="glass-panel border-border resize-none h-20 text-xs"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            onClick={handleSubmit}
            disabled={loading || !prompt.trim()}
            className="w-full metal-shine"
            size="sm"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 mr-2" />
            )}
            {loading ? 'Processing...' : 'Send (⌘↵)'}
          </Button>
        </div>
      </div>
    </div>
  );
};
