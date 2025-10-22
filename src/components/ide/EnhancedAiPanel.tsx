import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Sparkles, Bug, BookOpen, Wand2, MessageSquare, Copy, Check, Trash2, StopCircle, Plus, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIdeStore } from '@/store/ideStore';
import { fileSystem } from '@/lib/fileSystem';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAiChat } from '@/hooks/useAiChat';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

type AiMode = 'architect' | 'debugger' | 'mentor' | 'composer' | 'chat';

interface AgentPersonality {
  name: string;
  icon: any;
  description: string;
}

const AGENT_PERSONALITIES: Record<AiMode, AgentPersonality> = {
  architect: {
    name: 'The Architect',
    icon: Brain,
    description: 'Designs elegant, scalable code structures',
  },
  debugger: {
    name: 'The Debugger',
    icon: Bug,
    description: 'Identifies and resolves issues methodically',
  },
  mentor: {
    name: 'The Mentor',
    icon: BookOpen,
    description: 'Teaches concepts with clarity and patience',
  },
  composer: {
    name: 'The Composer',
    icon: Wand2,
    description: 'Refactors code into elegant masterpieces',
  },
  chat: {
    name: 'PathwayAI',
    icon: MessageSquare,
    description: 'General AI assistance',
  },
};

export const EnhancedAiPanel: React.FC = () => {
  const [mode, setMode] = useState<AiMode>('chat');
  const [prompt, setPrompt] = useState('');
  const [createFiles, setCreateFiles] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSessions, setShowSessions] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const { toast } = useToast();
  const { tabs, activeTabId } = useIdeStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const {
    currentSession,
    messages,
    isStreaming,
    streamingContent,
    streamAiResponse,
    cancelStream,
    createNewSession,
    loadSessions,
    switchSession,
  } = useAiChat();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  // Load sessions when opening history
  useEffect(() => {
    if (showSessions) {
      loadSessions().then(setSessions);
    }
  }, [showSessions]);

  const handleSubmit = async () => {
    if (!prompt.trim() || isStreaming) return;

    const currentPrompt = prompt;
    setPrompt('');

    try {
      const activeTab = tabs.find(t => t.id === activeTabId);
      const context = activeTab ? `Current file: ${activeTab.title}\nLanguage: ${activeTab.language}` : 'No file open';

      if ((mode === 'architect' || mode === 'composer') && createFiles) {
        // Notify file creation start
        if ((window as any).notifyFileChange) {
          (window as any).notifyFileChange('AI generating files...', 'create');
        }

        // File generation mode using existing logic
        const { data: functionData, error: functionError } = await supabase.functions.invoke('ai-file-generator', {
          body: { 
            prompt: currentPrompt,
            projectContext: context,
            mode,
          }
        });

        if (functionError) throw functionError;

        if (functionData.files && Array.isArray(functionData.files)) {
          for (const file of functionData.files) {
            const pathParts = file.path.split('/');
            const fileName = pathParts.pop() || 'untitled';
            const folderPath = pathParts.join('/') || '/';

            let folder = await fileSystem.getFile(folderPath === '/' ? 'root' : folderPath);
            if (!folder) {
              const parts = folderPath.split('/').filter(Boolean);
              let currentPath = 'root';
              for (const part of parts) {
                const children = await fileSystem.getChildren(currentPath);
                const existing = children.find(f => f.name === part && f.type === 'folder');
                if (!existing) {
                  const newFolder = await fileSystem.createFile(part, 'folder', currentPath);
                  currentPath = newFolder.id;
                } else {
                  currentPath = existing.id;
                }
              }
              folder = { id: currentPath } as any;
            }

            await fileSystem.createFile(fileName, file.content, folder?.id || 'root');
            
            // Notify file creation
            if ((window as any).notifyFileChange) {
              (window as any).notifyFileChange(file.path, 'create');
            }
          }

          toast({
            title: 'Files Generated',
            description: `Created ${functionData.files.length} file(s)`,
          });
        }
      } else {
        // Stream AI response for chat/assistance
        const activeTab = tabs.find(t => t.id === activeTabId);
        await streamAiResponse(
          currentPrompt,
          mode,
          activeTab?.content,
          activeTab?.language,
          context
        );
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process request',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: 'Copied', description: 'Content copied to clipboard' });
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-semibold text-foreground">
              {AGENT_PERSONALITIES[mode].name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSessions(!showSessions)}
              className="text-muted-foreground"
            >
              <History className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={createNewSession}
              className="text-muted-foreground"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(AGENT_PERSONALITIES) as AiMode[]).map((m) => {
            const Icon = AGENT_PERSONALITIES[m].icon;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  mode === m
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                )}
              >
                <Icon className="w-3 h-3" />
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sessions Sidebar */}
      {showSessions && (
        <div className="border-b border-border/50 bg-background/30 p-3 max-h-[200px] overflow-y-auto">
          <div className="text-xs font-medium text-muted-foreground mb-2">Chat Sessions</div>
          <div className="space-y-1">
            {sessions.map(session => (
              <button
                key={session.id}
                onClick={() => {
                  switchSession(session.id);
                  setShowSessions(false);
                }}
                className={cn(
                  "w-full text-left px-2 py-1.5 rounded text-xs hover:bg-accent/50 transition-colors",
                  currentSession?.id === session.id && "bg-accent"
                )}
              >
                <div className="font-medium truncate">{session.session_name}</div>
                <div className="text-muted-foreground text-[10px]">
                  {new Date(session.updated_at).toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat History */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 items-start",
                message.role === 'user' && "flex-row-reverse"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                message.role === 'user' ? "bg-accent" : "bg-primary/10"
              )}>
                {message.role === 'user' ? (
                  <span className="text-xs font-bold">U</span>
                ) : (
                  <MessageSquare className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {message.role === 'user' ? 'You' : AGENT_PERSONALITIES[mode].name}
                  </span>
                  {message.mode && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/50 text-muted-foreground">
                      {message.mode}
                    </span>
                  )}
                </div>
                <div className={cn(
                  "rounded-lg p-3 border prose prose-sm max-w-none",
                  message.role === 'user'
                    ? "bg-accent/50 border-accent"
                    : "bg-muted/50 backdrop-blur-sm border-border/30"
                )}>
                  <div className="whitespace-pre-wrap text-foreground text-sm">
                    {message.content}
                  </div>
                </div>
                {message.role === 'assistant' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(message.content, message.id)}
                    className="h-6 text-xs"
                  >
                    {copiedId === message.id ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Streaming Content */}
          {isStreaming && streamingContent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 items-start"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-primary">
                    {AGENT_PERSONALITIES[mode].name}
                  </span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
                <div className="bg-muted/50 backdrop-blur-sm rounded-lg p-3 border border-border/30 prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-foreground">
                    {streamingContent}
                    <span className="inline-block w-1 h-4 bg-primary ml-1 animate-pulse" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {isStreaming && !streamingContent && (
            <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg border border-border/30">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-sm text-muted-foreground ml-2">
                {AGENT_PERSONALITIES[mode].name} is thinking...
              </span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm space-y-3">
        {(mode === 'architect' || mode === 'composer') && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="create-files"
              checked={createFiles}
              onCheckedChange={(checked) => setCreateFiles(checked as boolean)}
            />
            <Label
              htmlFor="create-files"
              className="text-xs text-muted-foreground cursor-pointer"
            >
              Create files in project
            </Label>
          </div>
        )}

        <div className="flex gap-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={`Ask ${AGENT_PERSONALITIES[mode].name}...`}
            className="resize-none bg-background/50 border-border/50 focus:border-primary"
            rows={3}
            disabled={isStreaming}
          />
          {isStreaming ? (
            <Button 
              onClick={cancelStream} 
              variant="destructive"
              className="bg-destructive hover:bg-destructive/90"
            >
              <StopCircle className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={!prompt.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              <Sparkles className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};