
-- Curated Collections Table (المجموعات المختارة)
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_ar TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description_ar TEXT,
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collection Items (Pivot table for Reciter or Recording)
-- Initially we'll focus on RECORDINGS collections.
CREATE TABLE collection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  recording_id UUID NOT NULL REFERENCES recordings(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, recording_id)
);

-- RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can read published collections" ON collections FOR SELECT USING (is_published = true);
CREATE POLICY "Public can read items of published collections" ON collection_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM collections WHERE collections.id = collection_items.collection_id AND collections.is_published = true
  )
);

-- Triggers for updated_at
CREATE TRIGGER update_collections_updated_at
BEFORE UPDATE ON collections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_collection_items_collection ON collection_items(collection_id);
CREATE INDEX idx_collection_items_recording ON collection_items(recording_id);
