---------------------------------------------------------
-- SOCIAL PROFILE MIGRATION
---------------------------------------------------------

-- 1. Add missing social profile columns to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS headline text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS github_url text,
  ADD COLUMN IF NOT EXISTS portfolio_url text;

-- 2. Update Row Level Security (RLS) to allow public viewing
-- First, drop the old restrictive SELECT policy
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;

-- Create the new SELECT policy allowing authenticated users to read all profiles
-- (This enables viewing other people's public profiles)
CREATE POLICY "Authenticated users can read all profiles" 
  ON public.profiles FOR SELECT 
  TO authenticated 
  USING (true);

-- Ensure the UPDATE policy is still strictly for the owner
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- 3. (Optional) Create unique index on username
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (username);
