-- Add missing columns to match frontend Article interface
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS subcategory text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS author_display_name text,
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS read_time text,
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS is_trending boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS local_images jsonb DEFAULT '{}'::jsonb;

-- Optional: Migrate existing data
UPDATE public.articles 
SET 
  image_url = cover_image,
  author_display_name = author_name,
  is_trending = is_featured
WHERE 
  image_url IS NULL OR 
  author_display_name IS NULL;
