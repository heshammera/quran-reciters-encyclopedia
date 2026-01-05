-- Migration: 011_video_support.sql
-- Description: Add video support columns to recordings table

-- 1. Create enum for recording type if not exists (or just check constraint)
-- Using check constraint is easier for updates
ALTER TABLE recordings ADD COLUMN type TEXT NOT NULL DEFAULT 'audio' CHECK (type IN ('audio', 'video'));

-- 2. Add video specific columns
ALTER TABLE recordings ADD COLUMN video_url TEXT; -- Stores YouTube/Vimeo URL
ALTER TABLE recordings ADD COLUMN video_thumbnail TEXT; -- Stores thumbnail URL

-- 3. Create index for filtering by type
CREATE INDEX idx_recordings_type ON recordings(type);

-- 4. Comment
COMMENT ON COLUMN recordings.type IS 'Type of content: audio or video';
COMMENT ON COLUMN recordings.video_url IS 'External video URL (e.g. YouTube)';
