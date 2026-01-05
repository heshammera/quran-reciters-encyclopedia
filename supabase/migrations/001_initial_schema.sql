-- Quran Reciters Encyclopedia - Initial Database Schema
-- Created: 2026-01-02
-- Description: Complete schema for archival platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE ENTITIES
-- ============================================

-- Reciters table
CREATE TABLE reciters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar TEXT NOT NULL,
  biography_ar TEXT,
  image_url TEXT,
  birth_date DATE,
  death_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reciter phases (فترات صوتية)
CREATE TABLE reciter_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reciter_id UUID NOT NULL REFERENCES reciters(id) ON DELETE CASCADE,
  phase_name_ar TEXT NOT NULL,
  description_ar TEXT,
  approximate_start_year INTEGER,
  approximate_end_year INTEGER,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT phases_order_positive CHECK (display_order >= 0)
);

-- Content sections (مرتل، مجود، مناسبات، etc.)
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description_ar TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quran index for search
CREATE TABLE quran_index (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
  ayah_number INTEGER NOT NULL CHECK (ayah_number > 0),
  text_original TEXT NOT NULL,
  text_normalized TEXT NOT NULL,
  surah_name_ar TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(surah_number, ayah_number)
);

-- Create index for fast Ayah search
CREATE INDEX idx_quran_normalized ON quran_index USING GIN(to_tsvector('arabic', text_normalized));
CREATE INDEX idx_quran_surah ON quran_index(surah_number);

-- ============================================
-- RECORDINGS & MEDIA
-- ============================================

-- Main recordings table
CREATE TABLE recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  archival_id TEXT NOT NULL UNIQUE,
  reciter_id UUID NOT NULL REFERENCES reciters(id) ON DELETE CASCADE,
  reciter_phase_id UUID REFERENCES reciter_phases(id) ON DELETE SET NULL,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
  ayah_start INTEGER NOT NULL CHECK (ayah_start > 0),
  ayah_end INTEGER NOT NULL CHECK (ayah_end > 0),
  city TEXT NOT NULL,
  recording_date JSONB NOT NULL,
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
  source_description TEXT NOT NULL,
  quality_level TEXT,
  reliability_level TEXT NOT NULL CHECK (reliability_level IN ('verified', 'unverified', 'rare', 'very_rare')),
  rarity_classification TEXT NOT NULL CHECK (rarity_classification IN ('common', 'less_common', 'rare', 'very_rare')),
  is_published BOOLEAN DEFAULT FALSE,
  metadata_complete BOOLEAN GENERATED ALWAYS AS (
    archival_id IS NOT NULL AND
    reciter_id IS NOT NULL AND
    section_id IS NOT NULL AND
    surah_number IS NOT NULL AND
    city IS NOT NULL AND
    duration_seconds IS NOT NULL AND
    source_description IS NOT NULL
  ) STORED,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT ayah_range_valid CHECK (ayah_end >= ayah_start)
);

-- Media files (separate audio/video/zip)
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recording_id UUID NOT NULL REFERENCES recordings(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('audio', 'video', 'zip')),
  file_format TEXT NOT NULL,
  archive_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- DATA INTEGRITY & VALIDATION
-- ============================================

-- Recording coverage (نطاق التغطية الفعلي)
CREATE TABLE recording_coverage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recording_id UUID NOT NULL UNIQUE REFERENCES recordings(id) ON DELETE CASCADE,
  start_ayah INTEGER NOT NULL,
  end_ayah INTEGER NOT NULL,
  full_surah BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT coverage_range_valid CHECK (end_ayah >= start_ayah)
);

-- File deduplication
CREATE TABLE file_deduplication (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recording_id UUID NOT NULL REFERENCES recordings(id) ON DELETE CASCADE,
  url_fingerprint TEXT NOT NULL,
  manual_duplicate_flag BOOLEAN DEFAULT FALSE,
  possible_duplicate_of UUID REFERENCES recordings(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Validation warnings (تحذيرات غير مانعة)
CREATE TABLE validation_warnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recording_id UUID NOT NULL REFERENCES recordings(id) ON DELETE CASCADE,
  warning_type TEXT NOT NULL CHECK (warning_type IN ('illogical_date', 'inconsistent_city', 'unexpected_duration')),
  warning_message_ar TEXT NOT NULL,
  acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reference tracks (نسخة مرجعية)
CREATE TABLE reference_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reciter_id UUID NOT NULL REFERENCES reciters(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
  reference_recording_id UUID NOT NULL REFERENCES recordings(id) ON DELETE CASCADE,
  reason_ar TEXT NOT NULL,
  set_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reciter_id, section_id, surah_number)
);

-- ============================================
-- AUDIT & LOGGING
-- ============================================

-- Change log for all edits
CREATE TABLE change_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Recordings indexes
CREATE INDEX idx_recordings_reciter ON recordings(reciter_id);
CREATE INDEX idx_recordings_section ON recordings(section_id);
CREATE INDEX idx_recordings_surah ON recordings(surah_number);
CREATE INDEX idx_recordings_published ON recordings(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_recordings_featured ON recordings(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_recordings_rarity ON recordings(rarity_classification);
CREATE INDEX idx_recordings_created ON recordings(created_at DESC);

-- Media files indexes
CREATE INDEX idx_media_recording ON media_files(recording_id);
CREATE INDEX idx_media_type ON media_files(media_type);

-- Phases indexes
CREATE INDEX idx_phases_reciter ON reciter_phases(reciter_id);

-- Coverage index
CREATE INDEX idx_coverage_recording ON recording_coverage(recording_id);

-- Deduplication index
CREATE INDEX idx_dedup_fingerprint ON file_deduplication(url_fingerprint);

-- Warnings index
CREATE INDEX idx_warnings_recording ON validation_warnings(recording_id);
CREATE INDEX idx_warnings_unacknowledged ON validation_warnings(acknowledged_by) WHERE acknowledged_by IS NULL;

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to reciters
CREATE TRIGGER update_reciters_updated_at
BEFORE UPDATE ON reciters
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to recordings
CREATE TRIGGER update_recordings_updated_at
BEFORE UPDATE ON recordings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default sections
INSERT INTO sections (name_ar, slug, display_order) VALUES
  ('مرتل', 'murattal', 1),
  ('مجود', 'mujawwad', 2),
  ('حفلات ومناسبات', 'events', 3),
  ('ابتهالات', 'supplications', 4),
  ('أذان', 'adhan', 5),
  ('دعاء', 'duaa', 6);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE reciters ENABLE ROW LEVEL SECURITY;
ALTER TABLE reciter_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE quran_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE recording_coverage ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_deduplication ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_log ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public can read published reciters" ON reciters FOR SELECT USING (true);
CREATE POLICY "Public can read sections" ON sections FOR SELECT USING (true);
CREATE POLICY "Public can read published recordings" ON recordings FOR SELECT USING (is_published = true);
CREATE POLICY "Public can read media files" ON media_files FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM recordings WHERE recordings.id = media_files.recording_id AND recordings.is_published = true
  )
);
CREATE POLICY "Public can read quran index" ON quran_index FOR SELECT USING (true);
CREATE POLICY "Public can read reference tracks" ON reference_tracks FOR SELECT USING (true);

-- Admin full access (will be configured with auth)
-- Note: Admin policies will be added after auth setup

COMMENT ON TABLE reciters IS 'القرّاء - Quran reciters';
COMMENT ON TABLE reciter_phases IS 'فترات صوتية - Voice phases of reciters';
COMMENT ON TABLE sections IS 'أقسام المحتوى - Content types';
COMMENT ON TABLE recordings IS 'التسجيلات - Main recordings table';
COMMENT ON TABLE media_files IS 'ملفات الوسائط - Separate media files';
COMMENT ON TABLE quran_index IS 'فهرس القرآن - Quran text index for search';
COMMENT ON TABLE recording_coverage IS 'نطاق التغطية - Actual Ayah coverage';
COMMENT ON TABLE file_deduplication IS 'منع التكرار - Deduplication tracking';
COMMENT ON TABLE validation_warnings IS 'تحذيرات - Non-blocking validation warnings';
COMMENT ON TABLE reference_tracks IS 'نسخ مرجعية - Reference/primary versions';
COMMENT ON TABLE change_log IS 'سجل التغييرات - Audit trail';
