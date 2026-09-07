-- Phase 4: Avatar Bucket Security Hardening

-- Drop existing weak policies
DROP POLICY IF EXISTS "Users can upload their own avatars." ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars." ON storage.objects;

-- Create hardened INSERT policy
CREATE POLICY "Users can upload their own avatars." 
  ON storage.objects FOR INSERT 
  WITH CHECK ( 
    bucket_id = 'avatars' 
    AND auth.uid()::uuid = owner
    AND LOWER(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp')
    AND (metadata->>'mimetype') IN ('image/jpeg', 'image/png', 'image/webp')
    AND (metadata->>'size')::int < 5242880
  );

-- Create hardened UPDATE policy
CREATE POLICY "Users can update their own avatars." 
  ON storage.objects FOR UPDATE 
  USING ( 
    bucket_id = 'avatars' 
    AND auth.uid()::uuid = owner
  )
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::uuid = owner
    AND LOWER(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp')
    AND (metadata->>'mimetype') IN ('image/jpeg', 'image/png', 'image/webp')
    AND (metadata->>'size')::int < 5242880
  );
