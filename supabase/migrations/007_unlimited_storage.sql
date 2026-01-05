-- Ensure the bucket exists and is configured correctly (Unlimited Size)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recordings-media', 
  'recordings-media', 
  true, 
  5368709120, -- 5GB (Explicit limit instead of null which might fallback to global default)
  '{audio/*,video/*,application/zip,application/x-zip-compressed}'
)
on conflict (id) do update set
  file_size_limit = 5368709120, -- 5GB
  allowed_mime_types = '{audio/*,video/*,application/zip,application/x-zip-compressed}',
  public = true;

-- Use specific names to avoid "relation already exists" errors with generic "Public Access" policies

-- 1. Public Read Access
drop policy if exists "Public Access recordings-media" on storage.objects;
create policy "Public Access recordings-media"
  on storage.objects for select
  using ( bucket_id = 'recordings-media' );

-- 2. Authenticated Uploads
drop policy if exists "Authenticated Uploads recordings-media" on storage.objects;
create policy "Authenticated Uploads recordings-media"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'recordings-media' );

-- 3. Authenticated Updates
drop policy if exists "Authenticated Updates recordings-media" on storage.objects;
create policy "Authenticated Updates recordings-media"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'recordings-media' );
