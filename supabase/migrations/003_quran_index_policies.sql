
-- Enable RLS
ALTER TABLE quran_index ENABLE ROW LEVEL SECURITY;

-- 1. Read Policy
DROP POLICY IF EXISTS "Public can read quran index" ON quran_index;
CREATE POLICY "Public can read quran index" 
ON quran_index FOR SELECT 
TO anon, authenticated 
USING (true);

-- 2. Insert Policy (The critical one for seeding)
DROP POLICY IF EXISTS "Allow public insert for seeding" ON quran_index;
CREATE POLICY "Allow public insert for seeding" 
ON quran_index FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- 3. Update Policy
DROP POLICY IF EXISTS "Allow public update for seeding" ON quran_index;
CREATE POLICY "Allow public update for seeding" 
ON quran_index FOR UPDATE
TO anon, authenticated 
USING (true);
