-- Decouple articles from Supabase Auth
-- 1. Modify articles table to support text-based author_ids (from local users)
ALTER TABLE public.articles 
  DROP CONSTRAINT IF EXISTS articles_author_id_fkey;

ALTER TABLE public.articles 
  ALTER COLUMN author_id TYPE text;

-- 2. Create a simple table for Author Profiles (independent of Supabase Auth)
CREATE TABLE IF NOT EXISTS public.app_users (
  username text PRIMARY KEY,
  name text,
  email text,
  role text,
  avatar text,
  bio text,
  social_links jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Open up RLS for these tables (Since auth is handled locally in code)
-- This allows the application (using anon key) to read/write these tables
-- Security is delegated to the client-side AdminAuth check.

-- Articles
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for anon" ON public.articles;
CREATE POLICY "Enable all access for anon"
  ON public.articles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- App Users
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for anon" ON public.app_users;
CREATE POLICY "Enable all access for anon"
  ON public.app_users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comments (if exists)
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for anon" ON public.comments;
CREATE POLICY "Enable all access for anon"
  ON public.comments
  FOR ALL
  USING (true)
  WITH CHECK (true);
