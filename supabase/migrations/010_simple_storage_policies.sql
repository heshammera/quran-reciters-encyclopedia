-- Simple, permissive storage policies for recordings-media bucket
-- This approach doesn't try to alter the table, just creates maximally permissive policies

-- Drop any existing policies that might conflict
DROP POLICY IF EXISTS "recordings_media_all_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "recordings_media_public_read" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads on recordings-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to recordings-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to recordings-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from recordings-media" ON storage.objects;

-- Create a single, comprehensive policy for authenticated users
-- This allows ALL operations (SELECT, INSERT, UPDATE, DELETE) on the recordings-media bucket
CREATE POLICY "recordings_media_all_operations" 
ON storage.objects 
FOR ALL 
TO authenticated
USING (bucket_id = 'recordings-media')
WITH CHECK (bucket_id = 'recordings-media');

-- Allow public to read from the bucket (since it's a public bucket)
CREATE POLICY "recordings_media_public_select" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'recordings-media');
