-- Fix RLS policies for recordings-media bucket
-- Drop all existing policies to avoid conflicts
drop policy if exists "Public Access recordings-media" on storage.objects;
drop policy if exists "Authenticated Uploads recordings-media" on storage.objects;
drop policy if exists "Authenticated Updates recordings-media" on storage.objects;
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated Uploads" on storage.objects;
drop policy if exists "Authenticated Updates" on storage.objects;

-- Create fresh, permissive policies for the recordings-media bucket
-- 1. Allow anyone to read (public bucket)
create policy "Allow public reads on recordings-media"
  on storage.objects for select
  using ( bucket_id = 'recordings-media' );

-- 2. Allow authenticated users to upload
create policy "Allow authenticated uploads to recordings-media"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'recordings-media' );

-- 3. Allow authenticated users to update their uploads
create policy "Allow authenticated updates to recordings-media"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'recordings-media' );

-- 4. Allow authenticated users to delete their uploads
create policy "Allow authenticated deletes from recordings-media"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'recordings-media' );
