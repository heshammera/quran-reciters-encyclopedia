-- Migration: 005_multi_surah_support.sql
-- Description: Update recording_coverage to support multiple segments per recording (Multi-Surah support)

-- 1. Remove the UNIQUE constraint on recording_id to allow multiple rows per recording
ALTER TABLE recording_coverage DROP CONSTRAINT recording_coverage_recording_id_key;

-- 2. Add surah_number column to recording_coverage
ALTER TABLE recording_coverage ADD COLUMN surah_number INTEGER;

-- 3. Add constraint to ensure valid surah number
ALTER TABLE recording_coverage ADD CONSTRAINT coverage_surah_valid CHECK (surah_number BETWEEN 1 AND 114);

-- 4. Backfill existing data:
--    If we have existing rows in recording_coverage, they likely correspond to the single surah in 'recordings'.
--    We can update them by joining with the recordings table.
UPDATE recording_coverage rc
SET surah_number = r.surah_number
FROM recordings r
WHERE rc.recording_id = r.id
AND rc.surah_number IS NULL;

-- 5. Make surah_number NOT NULL after backfilling
ALTER TABLE recording_coverage ALTER COLUMN surah_number SET NOT NULL;

-- 6. Add index for searching by surah in coverage
CREATE INDEX idx_coverage_surah ON recording_coverage(surah_number);
