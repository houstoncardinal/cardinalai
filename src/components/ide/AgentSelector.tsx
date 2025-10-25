import React from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Bug, GraduationCap, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AiAgent } from '@/hooks/useAiAgents';

interface AgentSelectorProps {
  agents: AiAgent[];
  selectedAgent: AiAgent | null;
  onSelectAgent: (role: string) => void;
}

const agentIcons = {
  architect: Brain,
  debugger: Bug,
  mentor: GraduationCap,
  composer: Sparkles,
};

const agentColors = {
  architect: 'from-blue-500 to-cyan-500',
  debugger: 'from-red-500 to-orange-500',
  mentor: 'from-green-500 to-emerald-500',
  composer: 'from-purple-500 to-pink-500',
};

export const AgentSelector: React.FC<AgentSelectorProps> = ({
  agents,
  selectedAgent,
  onSelectAgent,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-black/20 rounded-lg border border-white/10">
      {agents.map((agent) => {
        const Icon = agentIcons[agent.role];
        const isSelected = selectedAgent?.id === agent.id;

        return (
          <Button
            key={agent.id}
            variant="ghost"
            onClick={() => onSelectAgent(agent.role)}
            className={cn(
              'relative h-auto flex flex-col items-center gap-2 p-4 transition-all duration-300',
              'hover:bg-white/5 border border-transparent',
              isSelected && 'border-white/20 bg-white/10 shadow-lg'
            )}
          >
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                'bg-gradient-to-br transition-all duration-300',
                agentColors[agent.role],
                isSelected && 'scale-110 shadow-xl'
              )}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <div className="font-semibold text-sm">{agent.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{agent.tone}</div>
            </div>
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            )}
          </Button>
        );
      })}
    </div>
  );
};
