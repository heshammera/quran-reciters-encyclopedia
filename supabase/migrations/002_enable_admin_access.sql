-- Enable full access for authenticated users (admins)

-- 1. Reciters
CREATE POLICY "Admins can do everything on reciters" ON reciters
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Reciter Phases
CREATE POLICY "Admins can do everything on reciter_phases" ON reciter_phases
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Sections
CREATE POLICY "Admins can do everything on sections" ON sections
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Recordings
CREATE POLICY "Admins can do everything on recordings" ON recordings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Media Files
CREATE POLICY "Admins can do everything on media_files" ON media_files
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Quran Index
CREATE POLICY "Admins can do everything on quran_index" ON quran_index
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Recording Coverage
CREATE POLICY "Admins can do everything on recording_coverage" ON recording_coverage
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. File Deduplication
CREATE POLICY "Admins can do everything on file_deduplication" ON file_deduplication
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. Validation Warnings
CREATE POLICY "Admins can do everything on validation_warnings" ON validation_warnings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 10. Reference Tracks
CREATE POLICY "Admins can do everything on reference_tracks" ON reference_tracks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 11. Change Log
CREATE POLICY "Admins can do everything on change_log" ON change_log
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
