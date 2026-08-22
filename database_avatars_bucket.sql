-- Create the avatars bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for the avatars bucket
-- 1. Allow public viewing
CREATE POLICY "Avatar images are publicly accessible." 
  ON storage.objects FOR SELECT 
  USING ( bucket_id = 'avatars' );

-- 2. Allow authenticated users to upload files
CREATE POLICY "Users can upload their own avatars." 
  ON storage.objects FOR INSERT 
  WITH CHECK ( bucket_id = 'avatars' AND auth.uid()::uuid = owner );

-- 3. Allow users to update their own files
CREATE POLICY "Users can update their own avatars." 
  ON storage.objects FOR UPDATE 
  USING ( bucket_id = 'avatars' AND auth.uid()::uuid = owner );

-- 4. Allow users to delete their own files
CREATE POLICY "Users can delete their own avatars."
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'avatars' AND auth.uid()::uuid = owner );
