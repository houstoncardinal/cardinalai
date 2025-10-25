-- Create table for AI agent personalities and their configurations
CREATE TABLE IF NOT EXISTS public.ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('architect', 'debugger', 'mentor', 'composer')),
  personality_prompt TEXT NOT NULL,
  system_instructions TEXT NOT NULL,
  tone TEXT NOT NULL,
  capabilities JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for agent conversations with context
CREATE TABLE IF NOT EXISTS public.agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  conversation_history JSONB DEFAULT '[]'::jsonb,
  context_snapshot JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create knowledge graph nodes table (simplified without vector embeddings)
CREATE TABLE IF NOT EXISTS public.knowledge_graph_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  node_type TEXT NOT NULL CHECK (node_type IN ('file', 'function', 'class', 'concept', 'pattern', 'dependency')),
  name TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create knowledge graph edges table
CREATE TABLE IF NOT EXISTS public.knowledge_graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id UUID REFERENCES public.knowledge_graph_nodes(id) ON DELETE CASCADE,
  target_node_id UUID REFERENCES public.knowledge_graph_nodes(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  weight NUMERIC DEFAULT 1.0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(source_node_id, target_node_id, relationship_type)
);

-- Create user coding patterns table
CREATE TABLE IF NOT EXISTS public.user_coding_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('language_preference', 'framework_usage', 'code_style', 'naming_convention', 'architecture_pattern', 'testing_approach', 'workflow_sequence')),
  pattern_data JSONB NOT NULL,
  confidence_score NUMERIC DEFAULT 0.0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  frequency INTEGER DEFAULT 1,
  last_observed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create predictive suggestions table
CREATE TABLE IF NOT EXISTS public.predictive_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('next_file', 'next_action', 'code_completion', 'refactoring', 'optimization')),
  suggestion_data JSONB NOT NULL,
  confidence_score NUMERIC DEFAULT 0.0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  was_accepted BOOLEAN DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ
);

-- Create workflow sequences table
CREATE TABLE IF NOT EXISTS public.workflow_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  action_sequence JSONB NOT NULL,
  pattern_signature TEXT NOT NULL,
  frequency INTEGER DEFAULT 1,
  last_executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert the four AI agent personalities
INSERT INTO public.ai_agents (name, role, personality_prompt, system_instructions, tone, capabilities) VALUES
(
  'The Architect',
  'architect',
  'You are The Architect - a visionary system designer with deep understanding of software architecture patterns. You think in structures, scalability, and elegant design. You see the big picture and guide users toward robust, maintainable solutions.',
  'Design codebases, folder structures, and architectural patterns. Focus on scalability, maintainability, and best practices. Provide high-level guidance on system design, module organization, and technology choices. Always consider future growth and technical debt.',
  'Confident, precise, visionary',
  '["system_design", "architecture_patterns", "scalability", "code_organization", "technology_selection", "module_design"]'::jsonb
),
(
  'The Debugger',
  'debugger',
  'You are The Debugger - a meticulous analyst who spots inefficiencies, bugs, and potential issues before they become problems. You think methodically, examining code with surgical precision. You help users write bulletproof code.',
  'Identify bugs, performance bottlenecks, security vulnerabilities, and code smells. Analyze code for efficiency and correctness. Suggest optimizations and improvements. Focus on edge cases and error handling. Always provide specific examples and test cases.',
  'Calm, factual, methodical',
  '["bug_detection", "performance_analysis", "security_review", "code_quality", "testing", "error_handling"]'::jsonb
),
(
  'The Mentor',
  'mentor',
  'You are The Mentor - a supportive teacher who breaks down complex concepts into digestible pieces. You encourage learning and growth. You help users understand not just the "how" but the "why" behind coding decisions.',
  'Explain concepts clearly with examples. Provide educational insights about programming patterns, language features, and best practices. Encourage good habits and incremental learning. Answer questions with patience and clarity. Use analogies and real-world examples.',
  'Encouraging, insightful, patient',
  '["concept_explanation", "best_practices", "learning_guidance", "code_review", "documentation", "mentorship"]'::jsonb
),
(
  'The Composer',
  'composer',
  'You are The Composer - an artist who refactors code into elegant poetry. You see beauty in clean, expressive code. You transform messy implementations into readable, maintainable masterpieces. You care deeply about developer experience.',
  'Refactor code for clarity, elegance, and readability. Improve naming conventions, code structure, and overall aesthetics. Focus on developer experience and code maintainability. Suggest more expressive patterns and modern language features. Make code beautiful.',
  'Poetic, artistic, precise',
  '["code_refactoring", "readability", "naming", "code_aesthetics", "modern_patterns", "developer_experience"]'::jsonb
);

-- Enable RLS
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_graph_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_graph_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_coding_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_sequences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_agents (public read)
CREATE POLICY "Anyone can view AI agents"
  ON public.ai_agents FOR SELECT
  USING (true);

-- RLS Policies for agent_conversations
CREATE POLICY "Users can view own agent conversations"
  ON public.agent_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own agent conversations"
  ON public.agent_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agent conversations"
  ON public.agent_conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for knowledge_graph_nodes
CREATE POLICY "Users can view own knowledge nodes"
  ON public.knowledge_graph_nodes FOR SELECT
  USING (auth.uid() = user_id OR is_project_member(auth.uid(), project_id));

CREATE POLICY "Users can create own knowledge nodes"
  ON public.knowledge_graph_nodes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own knowledge nodes"
  ON public.knowledge_graph_nodes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own knowledge nodes"
  ON public.knowledge_graph_nodes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for knowledge_graph_edges
CREATE POLICY "Users can view own knowledge edges"
  ON public.knowledge_graph_edges FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.knowledge_graph_nodes
    WHERE id = source_node_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create own knowledge edges"
  ON public.knowledge_graph_edges FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.knowledge_graph_nodes
    WHERE id = source_node_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own knowledge edges"
  ON public.knowledge_graph_edges FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.knowledge_graph_nodes
    WHERE id = source_node_id AND user_id = auth.uid()
  ));

-- RLS Policies for user_coding_patterns
CREATE POLICY "Users can view own coding patterns"
  ON public.user_coding_patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own coding patterns"
  ON public.user_coding_patterns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coding patterns"
  ON public.user_coding_patterns FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for predictive_suggestions
CREATE POLICY "Users can view own suggestions"
  ON public.predictive_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own suggestions"
  ON public.predictive_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own suggestions"
  ON public.predictive_suggestions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for workflow_sequences
CREATE POLICY "Users can view own workflow sequences"
  ON public.workflow_sequences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workflow sequences"
  ON public.workflow_sequences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workflow sequences"
  ON public.workflow_sequences FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_agent_conversations_user_project ON public.agent_conversations(user_id, project_id);
CREATE INDEX idx_knowledge_nodes_user_project ON public.knowledge_graph_nodes(user_id, project_id);
CREATE INDEX idx_knowledge_nodes_type ON public.knowledge_graph_nodes(node_type);
CREATE INDEX idx_knowledge_edges_source ON public.knowledge_graph_edges(source_node_id);
CREATE INDEX idx_knowledge_edges_target ON public.knowledge_graph_edges(target_node_id);
CREATE INDEX idx_coding_patterns_user ON public.user_coding_patterns(user_id, pattern_type);
CREATE INDEX idx_predictive_suggestions_user ON public.predictive_suggestions(user_id, created_at DESC);
CREATE INDEX idx_workflow_sequences_user ON public.workflow_sequences(user_id, pattern_signature);

-- Create triggers for updated_at
CREATE TRIGGER update_ai_agents_updated_at
  BEFORE UPDATE ON public.ai_agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_conversations_updated_at
  BEFORE UPDATE ON public.agent_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_knowledge_nodes_updated_at
  BEFORE UPDATE ON public.knowledge_graph_nodes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coding_patterns_updated_at
  BEFORE UPDATE ON public.user_coding_patterns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for agent conversations and suggestions
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.predictive_suggestions;