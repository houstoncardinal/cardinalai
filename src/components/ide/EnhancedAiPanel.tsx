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
    <div className="h-full flex flex-col bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(var(--background))] to-[hsl(var(--accent)/0.05)]">
      {/* Header with Material Elevation */}
      <div className="p-4 border-b border-[hsl(var(--border)/0.3)] bg-gradient-to-r from-[hsl(var(--background)/0.9)] to-[hsl(var(--muted)/0.1)] backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse" />
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary via-primary-glow to-accent flex items-center justify-center shadow-glow">
                {React.createElement(AGENT_PERSONALITIES[mode].icon, { className: "w-5 h-5 text-white" })}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">
                {AGENT_PERSONALITIES[mode].name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {AGENT_PERSONALITIES[mode].description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSessions(!showSessions)}
              className="hover:bg-accent/50 transition-all hover:scale-105"
            >
              <History className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={createNewSession}
              className="hover:bg-accent/50 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mode Selector with Material Pills */}
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(AGENT_PERSONALITIES) as AiMode[]).map((m) => {
            const Icon = AGENT_PERSONALITIES[m].icon;
            return (
              <motion.button
                key={m}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode(m)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300",
                  mode === m
                    ? "bg-gradient-to-r from-primary via-primary-glow to-accent text-white shadow-lg shadow-primary/30"
                    : "bg-gradient-to-r from-[hsl(var(--secondary))] to-[hsl(var(--muted))] text-muted-foreground hover:shadow-md"
                )}
              >
                <Icon className="w-4 h-4" />
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Sessions Sidebar with Material Design */}
      {showSessions && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-b border-[hsl(var(--border)/0.3)] bg-gradient-to-b from-[hsl(var(--muted)/0.3)] to-transparent p-4 max-h-[200px] overflow-y-auto backdrop-blur-sm"
        >
          <div className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            Chat Sessions
          </div>
          <div className="space-y-2">
            {sessions.map(session => (
              <motion.button
                key={session.id}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  switchSession(session.id);
                  setShowSessions(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-200",
                  currentSession?.id === session.id 
                    ? "bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 shadow-md" 
                    : "bg-[hsl(var(--muted)/0.5)] hover:bg-[hsl(var(--muted))] border border-transparent"
                )}
              >
                <div className="font-medium truncate text-foreground">{session.session_name}</div>
                <div className="text-muted-foreground text-[10px] mt-1">
                  {new Date(session.updated_at).toLocaleString()}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Chat History with Enhanced Material Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-6">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex gap-3 items-start",
                message.role === 'user' && "flex-row-reverse"
              )}
            >
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg",
                  message.role === 'user' 
                    ? "bg-gradient-to-br from-accent via-accent-foreground to-accent" 
                    : "bg-gradient-to-br from-primary via-primary-glow to-accent"
                )}
              >
                {message.role === 'user' ? (
                  <span className="text-sm font-bold text-white">U</span>
                ) : (
                  <MessageSquare className="w-5 h-5 text-white" />
                )}
              </motion.div>
              <div className="flex-1 space-y-2 max-w-[85%]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-foreground">
                    {message.role === 'user' ? 'You' : AGENT_PERSONALITIES[mode].name}
                  </span>
                  {message.mode && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 text-primary font-medium border border-primary/20">
                      {message.mode}
                    </span>
                  )}
                </div>
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className={cn(
                    "rounded-2xl p-4 border backdrop-blur-md shadow-lg transition-all duration-300",
                    message.role === 'user'
                      ? "bg-gradient-to-br from-accent/30 via-accent/20 to-accent/10 border-accent/40 text-foreground ml-auto"
                      : "bg-gradient-to-br from-[hsl(var(--muted)/0.6)] via-[hsl(var(--muted)/0.4)] to-[hsl(var(--background)/0.8)] border-[hsl(var(--border)/0.4)]"
                  )}
                >
                  <div className="whitespace-pre-wrap text-foreground text-sm leading-relaxed">
                    {message.content}
                  </div>
                </motion.div>
                {message.role === 'assistant' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(message.content, message.id)}
                    className="h-7 text-xs hover:bg-accent/50 transition-all"
                  >
                    {copiedId === message.id ? (
                      <>
                        <Check className="w-3 h-3 mr-1.5 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1.5" />
                        Copy
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          ))}

          {/* Streaming Content with Enhanced Animation */}
          {isStreaming && streamingContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 items-start"
            >
              <motion.div 
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary-glow to-accent flex items-center justify-center flex-shrink-0 mt-1 shadow-glow"
              >
                <MessageSquare className="w-5 h-5 text-white" />
              </motion.div>
              <div className="flex-1 space-y-2 max-w-[85%]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-primary">
                    {AGENT_PERSONALITIES[mode].name}
                  </span>
                  <div className="flex gap-1">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-primary" 
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      className="w-1.5 h-1.5 rounded-full bg-primary" 
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      className="w-1.5 h-1.5 rounded-full bg-primary" 
                    />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[hsl(var(--muted)/0.6)] via-[hsl(var(--muted)/0.4)] to-[hsl(var(--background)/0.8)] backdrop-blur-md rounded-2xl p-4 border border-[hsl(var(--border)/0.4)] shadow-lg">
                  <div className="whitespace-pre-wrap text-foreground text-sm leading-relaxed">
                    {streamingContent}
                    <motion.span 
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-1 h-4 bg-primary ml-1" 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {isStreaming && !streamingContent && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-[hsl(var(--muted)/0.3)] to-transparent rounded-xl border border-[hsl(var(--border)/0.3)] backdrop-blur-sm"
            >
              <div className="flex gap-1.5">
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-primary" 
                />
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 rounded-full bg-primary" 
                />
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 rounded-full bg-primary" 
                />
              </div>
              <span className="text-sm text-foreground font-medium">
                {AGENT_PERSONALITIES[mode].name} is thinking...
              </span>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area with Material Glass Effect */}
      <div className="p-4 border-t border-[hsl(var(--border)/0.3)] bg-gradient-to-t from-[hsl(var(--background))] via-[hsl(var(--background)/0.95)] to-[hsl(var(--muted)/0.1)] backdrop-blur-xl space-y-3 shadow-lg">
        {(mode === 'architect' || mode === 'composer') && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 p-2 rounded-lg bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border)/0.3)]"
          >
            <Checkbox
              id="create-files"
              checked={createFiles}
              onCheckedChange={(checked) => setCreateFiles(checked as boolean)}
              className="data-[state=checked]:bg-primary"
            />
            <Label
              htmlFor="create-files"
              className="text-xs text-foreground cursor-pointer font-medium"
            >
              Create files in project
            </Label>
          </motion.div>
        )}

        <div className="flex gap-3">
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
            className="resize-none bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--muted)/0.3)] border-[hsl(var(--border)/0.5)] focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all shadow-inner"
            rows={3}
            disabled={isStreaming}
          />
          {isStreaming ? (
            <Button 
              onClick={cancelStream} 
              className="bg-gradient-to-br from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <StopCircle className="w-5 h-5" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={!prompt.trim()}
              className="bg-gradient-to-br from-primary via-primary-glow to-accent hover:shadow-glow text-white shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
            >
              <Sparkles className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};