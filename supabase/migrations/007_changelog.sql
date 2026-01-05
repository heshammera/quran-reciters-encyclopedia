
-- Change Logs Table
CREATE TABLE change_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version TEXT NOT NULL, -- e.g. "v1.0.0" or "v1.1.2"
  title TEXT NOT NULL,
  description_markdown TEXT NOT NULL,
  release_date DATE DEFAULT CURRENT_DATE,
  change_type TEXT CHECK (change_type IN ('major', 'minor', 'patch', 'feature', 'fix')) DEFAULT 'patch',
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE change_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can read published logs" ON change_logs FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage logs" ON change_logs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Seed Data
INSERT INTO change_logs (version, title, description_markdown, release_date, change_type, is_published) VALUES
('v1.0.0', 'الإطلاق الرسمي', '### مرحباً بكم في الإصدار الأول\n\n- إطلاق الموسوعة رسمياً\n- إضافة أكثر من 100 قارئ\n- دعم التلاوات النادرة', CURRENT_DATE, 'major', true);
