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
import { useAiFileOperations } from '@/hooks/useAiFileOperations';
import { Loader2, Send, X } from 'lucide-react';

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
    name: 'CardinalAI',
    icon: MessageSquare,
    description: 'General AI assistance',
  },
};

export const EnhancedAiPanel: React.FC = () => {
  const [mode, setMode] = useState<AiMode>('chat');
  const [prompt, setPrompt] = useState('');
  const [createFiles, setCreateFiles] = useState(false);
  const [autoApplyFiles, setAutoApplyFiles] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSessions, setShowSessions] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const { toast } = useToast();
  const { tabs, activeTabId, addTab } = useIdeStore();
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
  
  const { parseCodeBlocks, applyFileOperations, isProcessing } = useAiFileOperations();

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
      // Get current file context if available
      const activeTab = tabs.find(t => t.id === activeTabId);
      const code = activeTab?.content;
      const language = activeTab?.language;
      const fileName = activeTab?.title;

      // Enhanced context with file structure
      const rootFiles = await fileSystem.getRootFiles();
      const fileStructure = rootFiles.map(f => `${f.type === 'folder' ? '📁' : '📄'} ${f.name}`).join('\n');
      
      const context = code 
        ? `Current file: ${fileName} (${language})\nProject structure:\n${fileStructure}\n\nYou can create/edit files using the special format in your instructions.`
        : `Project structure:\n${fileStructure}\n\nYou can create/edit files using the special format in your instructions.`;

      // Stream AI response with enhanced context
      await streamAiResponse(currentPrompt, mode, code, language, context);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process request',
        variant: 'destructive',
      });
    }
  };

  // Auto-apply file operations from AI responses
  useEffect(() => {
    if (!isStreaming && streamingContent && autoApplyFiles && (mode === 'architect' || mode === 'composer')) {
      const operations = parseCodeBlocks(streamingContent);
      if (operations.length > 0) {
        applyFileOperations(operations);
      }
    }
  }, [isStreaming, streamingContent, autoApplyFiles, mode]);

  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: 'Copied', description: 'Content copied to clipboard' });
  };

  // Enhanced color schemes for each mode
  const getModeColor = (m: AiMode) => {
    switch (m) {
      case 'architect': return 'from-[#5B7FFF] to-[#7B94FF]';
      case 'debugger': return 'from-[#FF6B6B] to-[#FF8E8E]';
      case 'mentor': return 'from-[#90EE90] to-[#A8F5A8]';
      case 'composer': return 'from-[#B794F6] to-[#C7A8FF]';
      case 'chat': return 'from-[#FFD700] to-[#FFE44D]';
      default: return 'from-primary to-accent';
    }
  };

  const getModeGradient = (m: AiMode) => {
    switch (m) {
      case 'architect': return 'linear-gradient(135deg, #5B7FFF 0%, #7B94FF 100%)';
      case 'debugger': return 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)';
      case 'mentor': return 'linear-gradient(135deg, #90EE90 0%, #A8F5A8 100%)';
      case 'composer': return 'linear-gradient(135deg, #B794F6 0%, #C7A8FF 100%)';
      case 'chat': return 'linear-gradient(135deg, #FFD700 0%, #FFE44D 100%)';
      default: return 'linear-gradient(135deg, #fff 0%, #ccc 100%)';
    }
  };

  const getModeAccent = (m: AiMode) => {
    switch (m) {
      case 'architect': return '#7B94FF';
      case 'debugger': return '#FF8E8E';
      case 'mentor': return '#A8F5A8';
      case 'composer': return '#C7A8FF';
      case 'chat': return '#FFE44D';
      default: return '#fff';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      {/* Header - Enhanced with better contrast and aesthetics */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-[#333] bg-gradient-to-br from-[#222] to-[#1a1a1a] shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div 
              className="relative"
              animate={{ 
                boxShadow: [
                  '0 0 10px rgba(255,255,255,0.1)',
                  '0 0 20px rgba(255,255,255,0.2)',
                  '0 0 10px rgba(255,255,255,0.1)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center border-2 shadow-lg",
                mode === 'architect' && "border-[#5B7FFF] from-[#5B7FFF]/20 to-[#7B94FF]/20",
                mode === 'debugger' && "border-[#FF6B6B] from-[#FF6B6B]/20 to-[#FF8E8E]/20",
                mode === 'mentor' && "border-[#90EE90] from-[#90EE90]/20 to-[#A8F5A8]/20",
                mode === 'composer' && "border-[#B794F6] from-[#B794F6]/20 to-[#C7A8FF]/20",
                mode === 'chat' && "border-[#FFD700] from-[#FFD700]/20 to-[#FFE44D]/20"
              )}>
                {React.createElement(AGENT_PERSONALITIES[mode].icon, { 
                  className: cn(
                    "w-5 h-5",
                    mode === 'architect' && "text-[#7B94FF]",
                    mode === 'debugger' && "text-[#FF8E8E]",
                    mode === 'mentor' && "text-[#A8F5A8]",
                    mode === 'composer' && "text-[#C7A8FF]",
                    mode === 'chat' && "text-[#FFE44D]"
                  )
                })}
              </div>
            </motion.div>
            <div>
              <h3 className="font-bold text-white text-base tracking-wide flex items-center gap-2">
                CARDINAL AI
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    mode === 'architect' && "bg-[#7B94FF]",
                    mode === 'debugger' && "bg-[#FF8E8E]",
                    mode === 'mentor' && "bg-[#A8F5A8]",
                    mode === 'composer' && "bg-[#C7A8FF]",
                    mode === 'chat' && "bg-[#FFE44D]"
                  )}
                />
              </h3>
              <p className={cn(
                "text-xs font-medium uppercase tracking-wider mt-0.5",
                mode === 'architect' && "text-[#7B94FF]",
                mode === 'debugger' && "text-[#FF8E8E]",
                mode === 'mentor' && "text-[#A8F5A8]",
                mode === 'composer' && "text-[#C7A8FF]",
                mode === 'chat' && "text-[#FFE44D]"
              )}>
                {mode === 'architect' && '⚡ THE ARCHITECT • DESIGNS FRAMEWORKS'}
                {mode === 'debugger' && '🔍 THE DEBUGGER • RESOLVES ISSUES'}
                {mode === 'mentor' && '📚 THE MENTOR • TEACHES CONCEPTS'}
                {mode === 'composer' && '✨ THE COMPOSER • REFACTORS CODE'}
                {mode === 'chat' && '💬 CARDINAL COLLECTIVE • AI ASSISTANCE'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSessions(!showSessions)}
                className="h-9 w-9 p-0 hover:bg-white/10 transition-all rounded-lg border border-white/10 hover:border-white/20"
              >
                <History className="w-4 h-4 text-white/70 hover:text-white" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={createNewSession}
                className="h-9 w-9 p-0 hover:bg-white/10 transition-all rounded-lg border border-white/10 hover:border-white/20"
              >
                <Plus className="w-4 h-4 text-white/70 hover:text-white" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mode Selector with Enhanced Visuals */}
        <div className="flex gap-2 flex-wrap justify-center">
          {(Object.keys(AGENT_PERSONALITIES) as AiMode[]).map((m) => {
            const Icon = AGENT_PERSONALITIES[m].icon;
            const isActive = mode === m;
            return (
              <motion.button
                key={m}
                onClick={() => setMode(m)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 overflow-hidden",
                  isActive
                    ? "bg-gradient-to-br shadow-2xl border-2"
                    : "bg-[#2a2a2a] border border-[#444] text-white/60 hover:text-white/90 hover:bg-[#333] hover:border-[#555]"
                )}
                style={isActive ? {
                  background: getModeGradient(m),
                  borderColor: getModeAccent(m),
                  boxShadow: `0 0 20px ${getModeAccent(m)}40`
                } : {}}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                )}
                <Icon className={cn("w-4 h-4 relative z-10", isActive && "text-white drop-shadow-lg")} />
                <span className={cn("relative z-10", isActive && "text-white drop-shadow-lg")}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Sessions Sidebar */}
      {showSessions && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex-shrink-0 border-b border-[#3a3a3a] bg-[#2a2a2a] p-3 max-h-[150px] overflow-y-auto"
        >
          <div className="text-xs font-semibold text-[#e0e0e0] mb-2 flex items-center gap-2">
            <History className="w-3 h-3 text-[#909090]" />
            Chat Sessions
          </div>
          <div className="space-y-1.5">
            {sessions.map(session => (
              <button
                key={session.id}
                onClick={() => {
                  switchSession(session.id);
                  setShowSessions(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded text-xs transition-colors",
                  currentSession?.id === session.id 
                    ? "bg-[#3a3a3a] border border-[#5a5a5a]" 
                    : "bg-[#333333] hover:bg-[#3a3a3a] border border-transparent"
                )}
              >
                <div className="font-medium truncate text-[#e0e0e0]">{session.session_name}</div>
                <div className="text-[#808080] text-[10px] mt-0.5">
                  {new Date(session.updated_at).toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Chat History - Full Height */}
      <ScrollArea className="flex-1 p-4 bg-[#353535]" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-[#3a3a3a] flex items-center justify-center mb-4 border border-[#4a4a4a]">
                <MessageSquare className="w-8 h-8 text-[#707070]" />
              </div>
              <h3 className="text-lg font-semibold text-[#e0e0e0] mb-2">
                Start a conversation with CardinalAI
              </h3>
              <p className="text-sm text-[#909090]">
                Ask questions, get explanations, or refactor code
              </p>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 items-start",
                message.role === 'user' && "flex-row-reverse"
              )}
            >
              <div 
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 border",
                  message.role === 'user' 
                    ? "bg-[#3a3a3a] border-[#5a5a5a]" 
                    : "bg-[#3a3a3a] border-[#5a5a5a]"
                )}
              >
                {message.role === 'user' ? (
                  <span className="text-xs font-bold text-[#e0e0e0]">U</span>
                ) : (
                  <MessageSquare className="w-4 h-4 text-[#e0e0e0]" />
                )}
              </div>
              <div className="flex-1 space-y-2 max-w-[85%]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-[#e0e0e0]">
                    {message.role === 'user' ? 'You' : AGENT_PERSONALITIES[mode].name}
                  </span>
                  {message.mode && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#3a3a3a] text-[#b0b0b0] font-medium border border-[#4a4a4a]">
                      {message.mode}
                    </span>
                  )}
                </div>
                <div 
                  className={cn(
                    "rounded-lg p-3 border",
                    message.role === 'user'
                      ? "bg-[#3a3a3a] border-[#5a5a5a] text-[#e0e0e0] ml-auto"
                      : "bg-[#2f2f2f] border-[#4a4a4a] text-[#d0d0d0]"
                  )}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                </div>
                {message.role === 'assistant' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(message.content, message.id)}
                    className="h-7 text-xs hover:bg-[#3a3a3a] transition-colors text-[#909090]"
                  >
                    {copiedId === message.id ? (
                      <>
                        <Check className="w-3 h-3 mr-1.5 text-green-400" />
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
            </div>
          ))}

          {/* Streaming Content */}
          {isStreaming && streamingContent && (
            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-lg bg-[#3a3a3a] border border-[#5a5a5a] flex items-center justify-center flex-shrink-0 mt-1">
                <MessageSquare className="w-4 h-4 text-[#e0e0e0]" />
              </div>
              <div className="flex-1 space-y-2 max-w-[85%]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-[#e0e0e0]">
                    {AGENT_PERSONALITIES[mode].name}
                  </span>
                  <div className="flex gap-1">
                    <motion.div 
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="w-1 h-1 rounded-full bg-[#909090]" 
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                      className="w-1 h-1 rounded-full bg-[#909090]" 
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                      className="w-1 h-1 rounded-full bg-[#909090]" 
                    />
                  </div>
                </div>
                <div className="bg-[#2f2f2f] border border-[#4a4a4a] rounded-lg p-3">
                  <div className="whitespace-pre-wrap text-[#d0d0d0] text-sm leading-relaxed">
                    {streamingContent}
                    <motion.span 
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-0.5 h-4 bg-[#909090] ml-1" 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {isStreaming && !streamingContent && (
            <div className="flex items-center gap-3 p-3 bg-[#2f2f2f] rounded-lg border border-[#4a4a4a]">
              <div className="flex gap-1.5">
                <motion.div 
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-[#909090]" 
                />
                <motion.div 
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-[#909090]" 
                />
                <motion.div 
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  className="w-1.5 h-1.5 rounded-full bg-[#909090]" 
                />
              </div>
              <span className="text-xs text-[#b0b0b0]">Thinking...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area - Fixed at Bottom */}
      <div className="flex-shrink-0 border-t border-[#3a3a3a] p-4 bg-[#2a2a2a]">
        {(mode === 'architect' || mode === 'composer') && (
          <div className="mb-3 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Checkbox
                id="create-files"
                checked={createFiles}
                onCheckedChange={(checked) => setCreateFiles(checked as boolean)}
                className="border-[#5a5a5a] data-[state=checked]:bg-[#5B7FFF]"
              />
              <Label htmlFor="create-files" className="text-[#b0b0b0] cursor-pointer">
                Enable file generation mode
              </Label>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Checkbox
                id="auto-apply"
                checked={autoApplyFiles}
                onCheckedChange={(checked) => setAutoApplyFiles(checked as boolean)}
                className="border-[#5a5a5a] data-[state=checked]:bg-[#5B7FFF]"
              />
              <Label htmlFor="auto-apply" className="text-[#b0b0b0] cursor-pointer">
                Auto-apply file operations from AI
              </Label>
            </div>
            {isProcessing && (
              <div className="flex items-center gap-2 text-xs text-[#5B7FFF] animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Applying file operations...</span>
              </div>
            )}
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
            placeholder={`Ask ${AGENT_PERSONALITIES[mode].name} anything... (Shift+Enter for new line)`}
            className="flex-1 min-h-[80px] max-h-[150px] resize-none bg-[#333333] border border-[#4a4a4a] focus:border-[#6a6a6a] transition-colors text-[#e0e0e0] placeholder:text-[#707070] rounded text-sm p-3"
            disabled={isStreaming}
          />
          <div className="flex flex-col gap-2 justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isStreaming}
              className="h-[80px] px-4 rounded transition-all hover:shadow-lg"
              style={{
                background: isStreaming 
                  ? '#404040' 
                  : `linear-gradient(135deg, ${getModeColor(mode).split(' ')[0].replace('from-', '')} 0%, ${getModeColor(mode).split(' ')[1].replace('to-', '')} 100%)`,
              }}
            >
              {isStreaming ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
            {isStreaming && (
              <Button
                onClick={cancelStream}
                variant="destructive"
                size="sm"
                className="h-8"
              >
                <X className="w-4 h-4 mr-1" />
                Stop
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};