-- Fix search_path security warning for update_community_post_timestamp using CASCADE
DROP FUNCTION IF EXISTS public.update_community_post_timestamp() CASCADE;

CREATE OR REPLACE FUNCTION public.update_community_post_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER update_community_posts_updated_at
BEFORE UPDATE ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_community_post_timestamp();