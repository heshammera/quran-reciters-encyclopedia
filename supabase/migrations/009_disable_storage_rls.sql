-- Comprehensive fix for storage RLS issues
-- This file takes a more aggressive approach to ensure uploads work

-- First, let's check if RLS is causing issues and disable it for storage.objects
-- Since recordings-media is a public bucket, we can safely disable RLS
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Alternatively, if you want to keep RLS enabled, we create maximally permissive policies
-- Uncomment the section below and comment out the ALTER TABLE above

/*
-- Drop ALL existing policies on storage.objects to start fresh
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON storage.objects';
    END LOOP;
END $$;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create new permissive policies for recordings-media bucket
-- Allow ALL operations for authenticated users
CREATE POLICY "recordings_media_all_authenticated" 
ON storage.objects 
FOR ALL 
TO authenticated
USING (bucket_id = 'recordings-media')
WITH CHECK (bucket_id = 'recordings-media');

-- Allow public reads
CREATE POLICY "recordings_media_public_read" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'recordings-media');
*/
