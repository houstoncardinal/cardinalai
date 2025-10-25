import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AiAgent {
  id: string;
  name: string;
  role: 'architect' | 'debugger' | 'mentor' | 'composer';
  personality_prompt: string;
  system_instructions: string;
  tone: string;
  capabilities: string[];
}

export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const useAiAgents = (projectId: string | null) => {
  const [agents, setAgents] = useState<AiAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AiAgent | null>(null);
  const [conversationHistory, setConversationHistory] = useState<AgentMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    const { data, error } = await supabase
      .from('ai_agents')
      .select('*')
      .order('role');

    if (error) {
      console.error('Error fetching agents:', error);
      return;
    }

    setAgents(data as AiAgent[]);
    if (data && data.length > 0 && !selectedAgent) {
      setSelectedAgent(data[0] as AiAgent);
    }
  };

  const switchAgent = useCallback((agentRole: string) => {
    const agent = agents.find(a => a.role === agentRole);
    if (agent) {
      setSelectedAgent(agent);
      toast({
        title: `Switched to ${agent.name}`,
        description: agent.tone,
      });
    }
  }, [agents, toast]);

  const sendMessage = useCallback(async (
    message: string,
    projectContext?: any,
    userPatterns?: any[]
  ) => {
    if (!selectedAgent) return;

    setLoading(true);
    setStreaming(true);

    const userMessage: AgentMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setConversationHistory(prev => [...prev, userMessage]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-agent-orchestrator`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            agentRole: selectedAgent.role,
            messages: [...conversationHistory, userMessage].map(m => ({
              role: m.role,
              content: m.content,
            })),
            projectContext,
            userPatterns,
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error('Failed to get response from agent');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantMessage += content;
                setConversationHistory(prev => {
                  const last = prev[prev.length - 1];
                  if (last?.role === 'assistant') {
                    return [...prev.slice(0, -1), { ...last, content: assistantMessage }];
                  }
                  return [...prev, {
                    role: 'assistant',
                    content: assistantMessage,
                    timestamp: new Date().toISOString(),
                  }];
                });
              }
            } catch (e) {
              // Ignore parse errors for incomplete JSON
            }
          }
        }
      }

      // Save conversation to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user && projectId) {
        await supabase.from('agent_conversations').insert({
          user_id: user.id,
          project_id: projectId,
          agent_id: selectedAgent.id,
          conversation_history: [...conversationHistory, userMessage, {
            role: 'assistant',
            content: assistantMessage,
            timestamp: new Date().toISOString(),
          }],
          context_snapshot: { projectContext, userPatterns },
        });
      }
    } catch (error) {
      console.error('Error sending message to agent:', error);
      toast({
        title: 'Error',
        description: 'Failed to communicate with agent',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  }, [selectedAgent, conversationHistory, projectId, toast]);

  const clearConversation = useCallback(() => {
    setConversationHistory([]);
  }, []);

  return {
    agents,
    selectedAgent,
    conversationHistory,
    loading,
    streaming,
    switchAgent,
    sendMessage,
    clearConversation,
  };
};
