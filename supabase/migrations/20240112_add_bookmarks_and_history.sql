-- Create bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, article_id)
);

-- Create user_reading_history table
CREATE TABLE IF NOT EXISTS public.user_reading_history (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id text NOT NULL,
  last_read_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, article_id)
);

-- Enable RLS
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reading_history ENABLE ROW LEVEL SECURITY;

-- Policies for bookmarks
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.bookmarks;
CREATE POLICY "Enable read access for authenticated users"
  ON public.bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.bookmarks;
CREATE POLICY "Enable insert for authenticated users"
  ON public.bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.bookmarks;
CREATE POLICY "Enable update for authenticated users"
  ON public.bookmarks
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.bookmarks;
CREATE POLICY "Enable delete for authenticated users"
  ON public.bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for user_reading_history
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_reading_history;
CREATE POLICY "Enable read access for authenticated users"
  ON public.user_reading_history
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.user_reading_history;
CREATE POLICY "Enable insert for authenticated users"
  ON public.user_reading_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.user_reading_history;
CREATE POLICY "Enable update for authenticated users"
  ON public.user_reading_history
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.user_reading_history;
CREATE POLICY "Enable delete for authenticated users"
  ON public.user_reading_history
  FOR DELETE
  USING (auth.uid() = user_id);
