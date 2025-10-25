import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Trash2, Loader2 } from 'lucide-react';
import { AgentSelector } from './AgentSelector';
import { useAiAgents } from '@/hooks/useAiAgents';
import { usePatternRecognition } from '@/hooks/usePatternRecognition';
import { cn } from '@/lib/utils';

interface PathwayCollectivePanelProps {
  projectId: string | null;
  projectContext?: any;
}

export const PathwayCollectivePanel: React.FC<PathwayCollectivePanelProps> = ({
  projectId,
  projectContext,
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    agents,
    selectedAgent,
    conversationHistory,
    loading,
    streaming,
    switchAgent,
    sendMessage,
    clearConversation,
  } = useAiAgents(projectId);

  const { patterns } = usePatternRecognition(projectId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const message = input;
    setInput('');
    await sendMessage(message, projectContext, patterns);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-black/90 to-black/70 backdrop-blur-xl">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            The Pathway Collective
          </h2>
          {conversationHistory.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearConversation}
              className="hover:bg-white/5"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
        <AgentSelector
          agents={agents}
          selectedAgent={selectedAgent}
          onSelectAgent={switchAgent}
        />
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {conversationHistory.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-lg mb-2">
                Welcome to The Pathway Collective
              </p>
              <p className="text-sm">
                Select an AI agent above and start a conversation
              </p>
            </div>
          )}

          {conversationHistory.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex gap-3 animate-in fade-in-50',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-lg p-3 shadow-lg',
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                    : 'bg-white/10 backdrop-blur-sm border border-white/10'
                )}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs opacity-60 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {streaming && (
            <div className="flex gap-2 items-center text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{selectedAgent?.name} is thinking...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${selectedAgent?.name || 'an agent'} anything...`}
            className="min-h-[60px] bg-white/5 border-white/10 resize-none"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="h-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
