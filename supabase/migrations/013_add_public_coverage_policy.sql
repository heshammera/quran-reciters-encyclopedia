-- Add public read policy for recording_coverage to allow anonymous users to see all segments
CREATE POLICY "Public can read recording coverage" ON recording_coverage
    FOR SELECT
    USING (true);
