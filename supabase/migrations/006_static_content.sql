
-- Static Pages Table for CMS-like functionality
CREATE TABLE static_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE, -- e.g. 'about', 'privacy', 'donate'
  title_ar TEXT NOT NULL,
  content_markdown TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  last_updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE static_pages ENABLE ROW LEVEL SECURITY;

-- Policies
-- Public can read published pages
CREATE POLICY "Public can read published pages" ON static_pages FOR SELECT USING (is_published = true);

-- Admins/Editors can read all
CREATE POLICY "Admins/Editors can read all pages" ON static_pages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- Admins/Editors can insert/update/delete
CREATE POLICY "Admins/Editors can manage pages" ON static_pages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_static_pages_updated_at
BEFORE UPDATE ON static_pages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Seed Initial Pages
INSERT INTO static_pages (slug, title_ar, content_markdown, is_published) VALUES 
('about', 'عن الموسوعة', '## مرحباً بكم في موسوعة قراء القرآن\n\nهذا النص تجريبي.', true),
('contact', 'اتصل بنا', '## تواصل معنا\n\nيمكنكم التواصل عبر البريد الإلكتروني.', true);
