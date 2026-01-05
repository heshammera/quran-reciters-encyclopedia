-- Increase file size limit for recordings-media bucket to 1GB
update storage.buckets
set file_size_limit = 1073741824 -- 1GB
where id = 'recordings-media';

-- Ensure we can upload audio/video
update storage.buckets
set allowed_mime_types = '{audio/*,video/*,application/zip,application/x-zip-compressed}'
where id = 'recordings-media';
