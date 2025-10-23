-- Enable realtime for projects and project_files
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_files;

-- Create enum for project roles
CREATE TYPE public.project_role AS ENUM ('owner', 'editor', 'viewer');

-- Create project_members table for collaboration
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role project_role NOT NULL DEFAULT 'viewer',
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Create project_comments table
CREATE TABLE public.project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT,
  line_number INTEGER,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.project_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_activity_log table
CREATE TABLE public.project_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_analytics table
CREATE TABLE public.user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_project_members_project ON public.project_members(project_id);
CREATE INDEX idx_project_members_user ON public.project_members(user_id);
CREATE INDEX idx_project_comments_project ON public.project_comments(project_id);
CREATE INDEX idx_project_comments_user ON public.project_comments(user_id);
CREATE INDEX idx_project_activity_project ON public.project_activity_log(project_id);
CREATE INDEX idx_project_activity_user ON public.project_activity_log(user_id);
CREATE INDEX idx_user_analytics_user ON public.user_analytics(user_id);
CREATE INDEX idx_user_analytics_project ON public.user_analytics(project_id);
CREATE INDEX idx_user_analytics_created ON public.user_analytics(created_at);

-- Enable RLS
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- Security definer function to check project membership
CREATE OR REPLACE FUNCTION public.is_project_member(_user_id UUID, _project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects WHERE id = _project_id AND user_id = _user_id
    UNION
    SELECT 1 FROM public.project_members WHERE project_id = _project_id AND user_id = _user_id
  );
$$;

-- Security definer function to check project role
CREATE OR REPLACE FUNCTION public.get_project_role(_user_id UUID, _project_id UUID)
RETURNS project_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN EXISTS(SELECT 1 FROM public.projects WHERE id = _project_id AND user_id = _user_id) THEN 'owner'::project_role
    ELSE (SELECT role FROM public.project_members WHERE project_id = _project_id AND user_id = _user_id LIMIT 1)
  END;
$$;

-- RLS Policies for project_members
CREATE POLICY "Users can view members of their projects"
ON public.project_members FOR SELECT
USING (public.is_project_member(auth.uid(), project_id));

CREATE POLICY "Project owners can manage members"
ON public.project_members FOR ALL
USING (
  EXISTS(SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
);

-- RLS Policies for project_comments
CREATE POLICY "Users can view comments on accessible projects"
ON public.project_comments FOR SELECT
USING (
  public.is_project_member(auth.uid(), project_id) OR
  EXISTS(SELECT 1 FROM public.projects WHERE id = project_id AND is_public = true)
);

CREATE POLICY "Users can create comments on accessible projects"
ON public.project_comments FOR INSERT
WITH CHECK (
  public.is_project_member(auth.uid(), project_id) AND auth.uid() = user_id
);

CREATE POLICY "Users can update own comments"
ON public.project_comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
ON public.project_comments FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for project_activity_log
CREATE POLICY "Users can view activity of accessible projects"
ON public.project_activity_log FOR SELECT
USING (public.is_project_member(auth.uid(), project_id));

CREATE POLICY "Users can create activity logs"
ON public.project_activity_log FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_analytics
CREATE POLICY "Users can view own analytics"
ON public.user_analytics FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analytics"
ON public.user_analytics FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update projects RLS to include shared projects
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
CREATE POLICY "Users can view own and shared projects"
ON public.projects FOR SELECT
USING (
  auth.uid() = user_id OR
  is_public = true OR
  public.is_project_member(auth.uid(), id)
);

-- Update project_files RLS to include shared projects
DROP POLICY IF EXISTS "Users can view own project files" ON public.project_files;
CREATE POLICY "Users can view accessible project files"
ON public.project_files FOR SELECT
USING (public.is_project_member(auth.uid(), project_id));

DROP POLICY IF EXISTS "Users can create own project files" ON public.project_files;
CREATE POLICY "Users can create project files if editor or owner"
ON public.project_files FOR INSERT
WITH CHECK (
  public.get_project_role(auth.uid(), project_id) IN ('owner', 'editor')
);

DROP POLICY IF EXISTS "Users can update own project files" ON public.project_files;
CREATE POLICY "Users can update project files if editor or owner"
ON public.project_files FOR UPDATE
USING (
  public.get_project_role(auth.uid(), project_id) IN ('owner', 'editor')
);

DROP POLICY IF EXISTS "Users can delete own project files" ON public.project_files;
CREATE POLICY "Users can delete project files if editor or owner"
ON public.project_files FOR DELETE
USING (
  public.get_project_role(auth.uid(), project_id) IN ('owner', 'editor')
);

-- Triggers for updated_at
CREATE TRIGGER update_project_members_updated_at
BEFORE UPDATE ON public.project_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_comments_updated_at
BEFORE UPDATE ON public.project_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for collaboration tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_activity_log;