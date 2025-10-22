-- Enable pgcrypto for API key encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  display_name TEXT,
  bio TEXT,
  preferences JSONB DEFAULT '{
    "theme": "obsidian",
    "fontSize": 14,
    "tabSize": 2,
    "soundEnabled": true,
    "soundVolume": 0.5
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for profile updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Projects RLS policies
CREATE POLICY "Users can view own projects"
ON public.projects FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view public projects"
ON public.projects FOR SELECT
TO authenticated
USING (is_public = true);

CREATE POLICY "Users can create own projects"
ON public.projects FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
ON public.projects FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
ON public.projects FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Trigger for projects updated_at
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create project_files table
CREATE TABLE public.project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  content TEXT,
  language TEXT,
  storage_path TEXT,
  parent_id UUID REFERENCES public.project_files(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, file_path)
);

ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- Project files RLS policies
CREATE POLICY "Users can view own project files"
ON public.project_files FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_files.project_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create own project files"
ON public.project_files FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_files.project_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own project files"
ON public.project_files FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_files.project_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own project files"
ON public.project_files FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_files.project_id
    AND projects.user_id = auth.uid()
  )
);

-- Trigger for project_files updated_at
CREATE TRIGGER update_project_files_updated_at
BEFORE UPDATE ON public.project_files
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update user_api_keys table to use encryption
ALTER TABLE public.user_api_keys
ADD COLUMN encrypted_key BYTEA;

-- Migrate existing keys to encrypted format (if any exist)
UPDATE public.user_api_keys
SET encrypted_key = pgp_sym_encrypt(api_key, current_setting('app.encryption_key', true))
WHERE encrypted_key IS NULL AND api_key IS NOT NULL;

-- Create storage bucket for project files
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for project files
CREATE POLICY "Users can upload own project files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own project files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own project files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own project files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);