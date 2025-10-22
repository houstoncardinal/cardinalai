-- Create chat history table for persistent AI conversations
CREATE TABLE public.ai_chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_name TEXT NOT NULL DEFAULT 'New Session',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.ai_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  mode TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_chat_messages_session_id ON public.ai_chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON public.ai_chat_messages(created_at);
CREATE INDEX idx_chat_sessions_updated_at ON public.ai_chat_sessions(updated_at);

-- Enable RLS
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required for this IDE)
CREATE POLICY "Allow all operations on chat sessions" 
ON public.ai_chat_sessions 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on chat messages" 
ON public.ai_chat_messages 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Function to update session timestamp
CREATE OR REPLACE FUNCTION public.update_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ai_chat_sessions
  SET updated_at = now()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update session timestamp on new message
CREATE TRIGGER update_session_timestamp_trigger
AFTER INSERT ON public.ai_chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_session_timestamp();

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_chat_messages;