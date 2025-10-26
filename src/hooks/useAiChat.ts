import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  mode?: string;
  timestamp: number;
}

interface Session {
  id: string;
  session_name: string;
  created_at: string;
  updated_at: string;
}

export const useAiChat = () => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('lovable');
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  // Initialize or load session
  useEffect(() => {
    const initSession = async () => {
      // Check for existing session in localStorage
      const savedSessionId = localStorage.getItem('currentAiSessionId');
      
      if (savedSessionId) {
        // Load existing session
        const { data: session } = await supabase
          .from('ai_chat_sessions')
          .select('*')
          .eq('id', savedSessionId)
          .single();
        
        if (session) {
          setCurrentSession(session);
          await loadMessages(savedSessionId);
          return;
        }
      }
      
      // Create new session
      const { data: newSession, error } = await supabase
        .from('ai_chat_sessions')
        .insert([{ session_name: `Session ${new Date().toLocaleString()}` }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating session:', error);
        toast({
          title: 'Error',
          description: 'Failed to create chat session',
          variant: 'destructive',
        });
        return;
      }
      
      if (newSession) {
        setCurrentSession(newSession);
        localStorage.setItem('currentAiSessionId', newSession.id);
      }
    };
    
    initSession();
  }, []);

  // Load messages from database
  const loadMessages = async (sessionId: string) => {
    const { data, error } = await supabase
      .from('ai_chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error loading messages:', error);
      return;
    }
    
    if (data) {
      setMessages(data.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        mode: msg.mode || undefined,
        timestamp: new Date(msg.created_at).getTime(),
      })));
    }
  };

  // Subscribe to realtime updates
  useEffect(() => {
    if (!currentSession) return;

    const channel = supabase
      .channel(`ai_chat:${currentSession.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_chat_messages',
          filter: `session_id=eq.${currentSession.id}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
          setMessages(prev => [...prev, {
            id: newMsg.id,
            role: newMsg.role,
            content: newMsg.content,
            mode: newMsg.mode,
            timestamp: new Date(newMsg.created_at).getTime(),
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentSession]);

  // Save message to database
  const saveMessage = async (message: Omit<Message, 'id' | 'timestamp'>) => {
    if (!currentSession) return null;

    const { data, error } = await supabase
      .from('ai_chat_messages')
      .insert([{
        session_id: currentSession.id,
        role: message.role,
        content: message.content,
        mode: message.mode,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      return null;
    }

    return data;
  };

  // Stream AI response
  const streamAiResponse = async (
    prompt: string,
    mode: string,
    code?: string,
    language?: string,
    context?: string,
    provider?: string
  ) => {
    const useProvider = provider || selectedProvider;
    if (!currentSession) {
      toast({
        title: 'Error',
        description: 'No active session',
        variant: 'destructive',
      });
      return;
    }

    // Save user message
    await saveMessage({
      role: 'user',
      content: prompt,
      mode,
    });

    setIsStreaming(true);
    setStreamingContent('');
    
    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      // Get user session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const STREAM_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-multi-provider`;
      
      const response = await fetch(STREAM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: messages.filter(m => m.role !== 'system').map(m => ({
            role: m.role,
            content: m.content,
          })).concat([{ role: 'user', content: prompt }]),
          provider: useProvider,
          mode,
          code,
          language,
          context,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok || !response.body) {
        if (response.status === 429) {
          toast({
            title: 'Rate Limit Exceeded',
            description: 'Too many requests. Please wait a moment and try again.',
            variant: 'destructive',
          });
          throw new Error('Rate limit exceeded');
        }
        if (response.status === 402) {
          toast({
            title: 'Credits Required',
            description: 'Please add credits to your CardinalAI workspace to continue.',
            variant: 'destructive',
          });
          throw new Error('Payment required');
        }
        throw new Error('Failed to start stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullContent += content;
              setStreamingContent(fullContent);
            }
          } catch (e) {
            // Incomplete JSON, put back and wait
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Save complete assistant message
      if (fullContent) {
        await saveMessage({
          role: 'assistant',
          content: fullContent,
          mode,
        });
      }

      setIsStreaming(false);
      setStreamingContent('');
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Stream cancelled by user');
      } else {
        console.error('Error streaming:', error);
        toast({
          title: 'Error',
          description: 'Failed to get AI response',
          variant: 'destructive',
        });
      }
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  // Cancel streaming
  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setStreamingContent('');
  }, []);

  // Create new session
  const createNewSession = async () => {
    const { data: newSession, error } = await supabase
      .from('ai_chat_sessions')
      .insert([{ session_name: `Session ${new Date().toLocaleString()}` }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new session',
        variant: 'destructive',
      });
      return;
    }
    
    if (newSession) {
      setCurrentSession(newSession);
      localStorage.setItem('currentAiSessionId', newSession.id);
      setMessages([]);
    }
  };

  // Load all sessions
  const loadSessions = async () => {
    const { data, error } = await supabase
      .from('ai_chat_sessions')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error loading sessions:', error);
      return [];
    }
    
    return data || [];
  };

  // Switch to different session
  const switchSession = async (sessionId: string) => {
    const { data: session } = await supabase
      .from('ai_chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    
    if (session) {
      setCurrentSession(session);
      localStorage.setItem('currentAiSessionId', session.id);
      await loadMessages(sessionId);
    }
  };

  return {
    currentSession,
    messages,
    isStreaming,
    streamingContent,
    selectedProvider,
    setSelectedProvider,
    streamAiResponse,
    cancelStream,
    createNewSession,
    loadSessions,
    switchSession,
  };
};