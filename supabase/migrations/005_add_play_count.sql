-- Add play_count column to recordings table
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS play_count BIGINT DEFAULT 0;

-- Create a function to increment play count atomically
CREATE OR REPLACE FUNCTION increment_play_count(rec_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE recordings
  SET play_count = play_count + 1
  WHERE id = rec_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to public (or authenticated if you prefer, but public is needed for unauthenticated listeners)
GRANT EXECUTE ON FUNCTION increment_play_count(UUID) TO public;
GRANT EXECUTE ON FUNCTION increment_play_count(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_play_count(UUID) TO authenticated;
