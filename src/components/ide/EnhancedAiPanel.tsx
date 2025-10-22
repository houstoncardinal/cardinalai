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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    description: '⚡ Designs complete system architectures • Generates multiple files • Plans data models & API routes',
  },
  debugger: {
    name: 'The Debugger',
    icon: Bug,
    description: '🔍 Identifies root causes • Analyzes errors & stack traces • Finds performance bottlenecks',
  },
  mentor: {
    name: 'The Mentor',
    icon: BookOpen,
    description: '📚 Teaches concepts clearly • Provides examples & exercises • Explains best practices',
  },
  composer: {
    name: 'The Composer',
    icon: Wand2,
    description: '✨ Refactors code beautifully • Optimizes performance • Applies clean code principles',
  },
  chat: {
    name: 'CardinalAI',
    icon: MessageSquare,
    description: '💬 General-purpose AI assistant • Answers questions • Provides code solutions',
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
    <div className="h-full flex flex-col bg-[#0a0a0a] overflow-hidden">
      {/* Dynamic Header Background with Mode-Specific Gradients */}
      <motion.div 
        className="flex-shrink-0 relative overflow-hidden"
        animate={{
          background: mode === 'architect' 
            ? 'linear-gradient(135deg, #1a1f3a 0%, #2d3a5f 50%, #1a1f3a 100%)'
            : mode === 'debugger'
            ? 'linear-gradient(135deg, #3a1a1a 0%, #5f2d2d 50%, #3a1a1a 100%)'
            : mode === 'mentor'
            ? 'linear-gradient(135deg, #1a3a1a 0%, #2d5f2d 50%, #1a3a1a 100%)'
            : mode === 'composer'
            ? 'linear-gradient(135deg, #2d1a3a 0%, #4a2d5f 50%, #2d1a3a 100%)'
            : 'linear-gradient(135deg, #3a3a1a 0%, #5f5f2d 50%, #3a3a1a 100%)'
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        {/* Animated circuit pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <motion.path
                  d="M 0 50 L 25 50 L 25 25 L 50 25 M 50 25 L 75 25 L 75 50 L 100 50"
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="none"
                  animate={{ pathLength: [0, 1, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)" className={cn(
              mode === 'architect' && "text-[#7B94FF]",
              mode === 'debugger' && "text-[#FF8E8E]",
              mode === 'mentor' && "text-[#A8F5A8]",
              mode === 'composer' && "text-[#C7A8FF]",
              mode === 'chat' && "text-[#FFE44D]"
            )} />
          </svg>
        </div>

        {/* Header Content */}
        <div className="relative z-10 px-6 py-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-5">
            {/* Agent Identity */}
            <div className="flex items-center gap-4">
              <motion.div 
                className="relative w-14 h-14"
                whileHover={{ scale: 1.1, rotate: 5 }}
                animate={{ 
                  rotate: 360,
                  boxShadow: [
                    `0 0 30px ${getModeAccent(mode)}60`,
                    `0 0 50px ${getModeAccent(mode)}80`,
                    `0 0 30px ${getModeAccent(mode)}60`
                  ]
                }}
                transition={{ 
                  rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                  boxShadow: { duration: 2, repeat: Infinity }
                }}
              >
                <div className={cn(
                  "w-full h-full rounded-full bg-gradient-to-br flex items-center justify-center shadow-2xl relative overflow-hidden backdrop-blur-xl",
                  mode === 'architect' && "from-[#5B7FFF]/40 to-[#7B94FF]/20",
                  mode === 'debugger' && "from-[#FF6B6B]/40 to-[#FF8E8E]/20",
                  mode === 'mentor' && "from-[#90EE90]/40 to-[#A8F5A8]/20",
                  mode === 'composer' && "from-[#B794F6]/40 to-[#C7A8FF]/20",
                  mode === 'chat' && "from-[#FFD700]/40 to-[#FFE44D]/20"
                )}
                style={{
                  border: `2px solid ${getModeAccent(mode)}`,
                  boxShadow: `0 0 40px ${getModeAccent(mode)}60, inset 0 0 20px ${getModeAccent(mode)}40`
                }}>
                  {/* Rotating glow rings */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ 
                      background: `conic-gradient(from 0deg, transparent 0%, ${getModeAccent(mode)}60 50%, transparent 100%)`
                    }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute inset-2 rounded-full"
                    style={{ 
                      background: `conic-gradient(from 180deg, transparent 0%, ${getModeAccent(mode)}40 50%, transparent 100%)`
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  {React.createElement(AGENT_PERSONALITIES[mode].icon, { 
                    className: cn(
                      "w-7 h-7 relative z-10 drop-shadow-2xl",
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
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="font-black text-white text-xl tracking-tight">
                    CARDINAL AI
                  </h3>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={cn(
                      "w-2.5 h-2.5 rounded-full shadow-lg",
                      mode === 'architect' && "bg-[#7B94FF] shadow-[#7B94FF]",
                      mode === 'debugger' && "bg-[#FF8E8E] shadow-[#FF8E8E]",
                      mode === 'mentor' && "bg-[#A8F5A8] shadow-[#A8F5A8]",
                      mode === 'composer' && "bg-[#C7A8FF] shadow-[#C7A8FF]",
                      mode === 'chat' && "bg-[#FFE44D] shadow-[#FFE44D]"
                    )}
                  />
                </motion.div>
                <p className={cn(
                  "text-sm font-bold uppercase tracking-widest mt-1 drop-shadow-lg",
                  mode === 'architect' && "text-[#9BB4FF]",
                  mode === 'debugger' && "text-[#FFB0B0]",
                  mode === 'mentor' && "text-[#C0FFC0]",
                  mode === 'composer' && "text-[#D7B8FF]",
                  mode === 'chat' && "text-[#FFF680]"
                )}>
                  {mode === 'architect' && '⚡ SYSTEM ARCHITECT'}
                  {mode === 'debugger' && '🔍 DEBUG SPECIALIST'}
                  {mode === 'mentor' && '📚 LEARNING GUIDE'}
                  {mode === 'composer' && '✨ CODE ARTIST'}
                  {mode === 'chat' && '💬 AI ASSISTANT'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSessions(!showSessions)}
                  className={cn(
                    "h-10 w-10 p-0 rounded-xl border-2 backdrop-blur-md transition-all shadow-lg",
                    "hover:scale-110",
                    mode === 'architect' && "border-[#5B7FFF]/40 bg-[#5B7FFF]/10 hover:bg-[#5B7FFF]/20 hover:border-[#7B94FF]",
                    mode === 'debugger' && "border-[#FF6B6B]/40 bg-[#FF6B6B]/10 hover:bg-[#FF6B6B]/20 hover:border-[#FF8E8E]",
                    mode === 'mentor' && "border-[#90EE90]/40 bg-[#90EE90]/10 hover:bg-[#90EE90]/20 hover:border-[#A8F5A8]",
                    mode === 'composer' && "border-[#B794F6]/40 bg-[#B794F6]/10 hover:bg-[#B794F6]/20 hover:border-[#C7A8FF]",
                    mode === 'chat' && "border-[#FFD700]/40 bg-[#FFD700]/10 hover:bg-[#FFD700]/20 hover:border-[#FFE44D]"
                  )}
                >
                  <History className="w-5 h-5 text-white drop-shadow-lg" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={createNewSession}
                  className={cn(
                    "h-10 w-10 p-0 rounded-xl border-2 backdrop-blur-md transition-all shadow-lg",
                    "hover:scale-110",
                    mode === 'architect' && "border-[#5B7FFF]/40 bg-[#5B7FFF]/10 hover:bg-[#5B7FFF]/20 hover:border-[#7B94FF]",
                    mode === 'debugger' && "border-[#FF6B6B]/40 bg-[#FF6B6B]/10 hover:bg-[#FF6B6B]/20 hover:border-[#FF8E8E]",
                    mode === 'mentor' && "border-[#90EE90]/40 bg-[#90EE90]/10 hover:bg-[#90EE90]/20 hover:border-[#A8F5A8]",
                    mode === 'composer' && "border-[#B794F6]/40 bg-[#B794F6]/10 hover:bg-[#B794F6]/20 hover:border-[#C7A8FF]",
                    mode === 'chat' && "border-[#FFD700]/40 bg-[#FFD700]/10 hover:bg-[#FFD700]/20 hover:border-[#FFE44D]"
                  )}
                >
                  <Plus className="w-5 h-5 text-white drop-shadow-lg" />
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Mode Selector - Organized by Category */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-white/60 font-bold">Select AI Mode</p>
            <TooltipProvider delayDuration={200}>
              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(AGENT_PERSONALITIES) as AiMode[]).map((m) => {
                  const Icon = AGENT_PERSONALITIES[m].icon;
                  const isActive = mode === m;
                  return (
                    <Tooltip key={m}>
                      <TooltipTrigger asChild>
                        <motion.button
                          onClick={() => setMode(m)}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className={cn(
                            "relative flex flex-col items-center gap-2 p-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 overflow-hidden group",
                            isActive
                              ? "shadow-2xl border-2"
                              : "bg-black/40 border border-white/10 text-white/50 hover:text-white/90 hover:bg-white/5 hover:border-white/20 backdrop-blur-sm"
                          )}
                          style={isActive ? {
                            background: getModeGradient(m),
                            borderColor: getModeAccent(m),
                            boxShadow: `0 8px 32px ${getModeAccent(m)}50, inset 0 1px 0 rgba(255,255,255,0.1)`
                          } : {}}
                        >
                          {/* Animated shimmer for active mode */}
                          {isActive && (
                            <>
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                              />
                              <motion.div
                                className="absolute inset-0"
                                animate={{ 
                                  background: [
                                    'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                                    'radial-gradient(circle at 100% 100%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                                    'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.1) 0%, transparent 50%)'
                                  ]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                              />
                            </>
                          )}
                          
                          <Icon className={cn(
                            "w-6 h-6 relative z-10 transition-transform group-hover:scale-110",
                            isActive && "text-white drop-shadow-2xl"
                          )} />
                          <span className={cn(
                            "relative z-10 text-[10px] leading-tight text-center",
                            isActive && "text-white drop-shadow-lg font-extrabold"
                          )}>
                            {m.charAt(0).toUpperCase() + m.slice(1)}
                          </span>
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="bottom" 
                        className="max-w-xs bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-2 p-3"
                        style={{ borderColor: getModeAccent(m) }}
                      >
                        <p className="text-sm font-semibold text-white mb-1">
                          {AGENT_PERSONALITIES[m].name}
                        </p>
                        <p className="text-xs text-white/80 leading-relaxed">
                          {AGENT_PERSONALITIES[m].description}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
          </div>
        </div>
      </motion.div>

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

      {/* Chat History - Full Height with Enhanced Visuals */}
      <ScrollArea className="flex-1 p-5 bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f]" ref={scrollRef}>
        <div className="space-y-6">
          {messages.length === 0 && !isStreaming && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full py-24 text-center"
            >
              <motion.div 
                animate={{ 
                  rotate: 360,
                  boxShadow: [
                    `0 0 30px ${getModeAccent(mode)}40`,
                    `0 0 50px ${getModeAccent(mode)}60`,
                    `0 0 30px ${getModeAccent(mode)}40`
                  ]
                }}
                transition={{ 
                  rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                  boxShadow: { duration: 2, repeat: Infinity }
                }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center mb-6 border-2"
                style={{
                  borderColor: getModeAccent(mode),
                  boxShadow: `0 0 40px ${getModeAccent(mode)}50`
                }}
              >
                <MessageSquare className="w-10 h-10" style={{ color: getModeAccent(mode) }} />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                Start a conversation with CardinalAI
              </h3>
              <p className="text-sm text-[#a0a0a0] max-w-md leading-relaxed">
                Ask questions, get code assistance, debug issues, or learn new concepts with AI-powered intelligence
              </p>
            </motion.div>
          )}
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex gap-4 items-start",
                message.role === 'user' && "flex-row-reverse"
              )}
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 border-2 backdrop-blur-xl relative overflow-hidden",
                  message.role === 'user' 
                    ? "bg-gradient-to-br from-[#4a4a4a]/50 to-[#2a2a2a]/30 border-[#6a6a6a]" 
                    : "bg-gradient-to-br border-2"
                )}
                style={message.role === 'assistant' ? {
                  borderColor: getModeAccent(mode),
                  background: `linear-gradient(135deg, ${getModeAccent(mode)}30, ${getModeAccent(mode)}10)`,
                  boxShadow: `0 4px 20px ${getModeAccent(mode)}40`
                } : {}}
              >
                {message.role === 'user' ? (
                  <span className="text-sm font-bold text-white">U</span>
                ) : (
                  <MessageSquare className="w-5 h-5" style={{ color: getModeAccent(mode) }} />
                )}
                {/* Subtle glow effect */}
                <div 
                  className="absolute inset-0 rounded-xl opacity-30"
                  style={{
                    background: `radial-gradient(circle at center, ${message.role === 'assistant' ? getModeAccent(mode) : '#6a6a6a'}40, transparent 70%)`
                  }}
                />
              </motion.div>
              <div className="flex-1 space-y-2 max-w-[85%]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-white tracking-wide uppercase">
                    {message.role === 'user' ? 'You' : AGENT_PERSONALITIES[mode].name}
                  </span>
                  {message.mode && (
                    <span 
                      className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border backdrop-blur-sm"
                      style={{
                        borderColor: getModeAccent(mode),
                        background: `${getModeAccent(mode)}20`,
                        color: getModeAccent(mode)
                      }}
                    >
                      {message.mode}
                    </span>
                  )}
                </div>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className={cn(
                    "rounded-xl p-4 border backdrop-blur-xl relative overflow-hidden",
                    message.role === 'user'
                      ? "bg-gradient-to-br from-[#3a3a3a]/80 to-[#2a2a2a]/60 border-[#5a5a5a] text-white ml-auto shadow-lg"
                      : "bg-gradient-to-br from-[#2a2a2a]/80 to-[#1a1a1a]/60 text-[#e0e0e0] shadow-xl"
                  )}
                  style={message.role === 'assistant' ? {
                    borderColor: `${getModeAccent(mode)}40`,
                    boxShadow: `0 4px 24px ${getModeAccent(mode)}20, inset 0 1px 0 rgba(255,255,255,0.05)`
                  } : {}}
                >
                  {/* Subtle gradient overlay */}
                  <div 
                    className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{
                      background: message.role === 'assistant' 
                        ? `linear-gradient(135deg, ${getModeAccent(mode)}50, transparent)`
                        : 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)'
                    }}
                  />
                  <div className="whitespace-pre-wrap text-sm leading-relaxed relative z-10">
                    {message.content}
                  </div>
                </motion.div>
                {message.role === 'assistant' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(message.content, message.id)}
                    className="h-8 text-xs hover:bg-white/5 transition-all text-[#a0a0a0] hover:text-white rounded-lg"
                  >
                    {copiedId === message.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-2 text-green-400" />
                        <span className="font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-2" />
                        <span className="font-medium">Copy</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          ))}

          {/* Streaming Content with Enhanced Styling */}
          {isStreaming && streamingContent && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 items-start"
            >
              <motion.div 
                animate={{ 
                  boxShadow: [
                    `0 0 20px ${getModeAccent(mode)}40`,
                    `0 0 30px ${getModeAccent(mode)}60`,
                    `0 0 20px ${getModeAccent(mode)}40`
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 border-2 backdrop-blur-xl relative overflow-hidden"
                style={{
                  borderColor: getModeAccent(mode),
                  background: `linear-gradient(135deg, ${getModeAccent(mode)}30, ${getModeAccent(mode)}10)`,
                }}
              >
                <MessageSquare className="w-5 h-5" style={{ color: getModeAccent(mode) }} />
                <div 
                  className="absolute inset-0 rounded-xl opacity-30"
                  style={{
                    background: `radial-gradient(circle at center, ${getModeAccent(mode)}40, transparent 70%)`
                  }}
                />
              </motion.div>
              <div className="flex-1 space-y-2 max-w-[85%]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-white tracking-wide uppercase">
                    {AGENT_PERSONALITIES[mode].name}
                  </span>
                  <div className="flex gap-1.5">
                    <motion.div 
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: getModeAccent(mode) }}
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: getModeAccent(mode) }}
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: getModeAccent(mode) }}
                    />
                  </div>
                </div>
                <div 
                  className="rounded-xl p-4 border backdrop-blur-xl relative overflow-hidden"
                  style={{
                    borderColor: `${getModeAccent(mode)}40`,
                    background: `linear-gradient(135deg, rgba(42,42,42,0.8), rgba(26,26,26,0.6))`,
                    boxShadow: `0 4px 24px ${getModeAccent(mode)}20, inset 0 1px 0 rgba(255,255,255,0.05)`
                  }}
                >
                  <div 
                    className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${getModeAccent(mode)}50, transparent)`
                    }}
                  />
                  <div className="whitespace-pre-wrap text-[#e0e0e0] text-sm leading-relaxed relative z-10">
                    {streamingContent}
                    <motion.span 
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="inline-block w-0.5 h-4 ml-1"
                      style={{ backgroundColor: getModeAccent(mode) }}
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
              className="flex items-center gap-4 p-4 rounded-xl border backdrop-blur-xl"
              style={{
                borderColor: `${getModeAccent(mode)}40`,
                background: `linear-gradient(135deg, rgba(42,42,42,0.8), rgba(26,26,26,0.6))`,
                boxShadow: `0 4px 20px ${getModeAccent(mode)}20`
              }}
            >
              <div className="flex gap-2">
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getModeAccent(mode) }}
                />
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getModeAccent(mode) }}
                />
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getModeAccent(mode) }}
                />
              </div>
              <span className="text-sm font-medium text-white">Thinking...</span>
            </motion.div>
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