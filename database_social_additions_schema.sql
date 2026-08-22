ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS twitter_url text,
  ADD COLUMN IF NOT EXISTS avatar_url text;
