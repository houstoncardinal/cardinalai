-- Fix search_path security warning for update_session_timestamp
DROP FUNCTION IF EXISTS public.update_session_timestamp() CASCADE;

CREATE OR REPLACE FUNCTION public.update_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ai_chat_sessions
  SET updated_at = now()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER update_message_session_timestamp
AFTER INSERT ON public.ai_chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_session_timestamp();