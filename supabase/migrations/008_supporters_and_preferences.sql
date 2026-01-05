
-- 1. Update user_roles to include 'supporter'
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check CHECK (role IN ('admin', 'editor', 'supporter', 'user'));

-- 2. User Preferences Table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lean_mode BOOLEAN DEFAULT false,
    dark_mode BOOLEAN DEFAULT true,
    audio_volume FLOAT DEFAULT 0.8,
    hide_donation_prompts BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. Donations Log Table
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected
    transaction_id VARCHAR(100), -- Archive.org donation ID or similar or manual reference
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES auth.users(id)
);

-- RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Preferences: Users can manage their own
CREATE POLICY "Users can manage own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Donations: Users can see their own, admins see all
CREATE POLICY "Users can see own donations" ON donations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all donations" ON donations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Helper to grant supporter role on verified donation
CREATE OR REPLACE FUNCTION handle_verified_donation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'verified' AND OLD.status = 'pending' THEN
        -- Check if user exists in user_roles
        INSERT INTO user_roles (user_id, role)
        VALUES (NEW.user_id, 'supporter')
        ON CONFLICT (user_id) DO UPDATE SET role = 'supporter';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_on_donation_verified
    AFTER UPDATE ON donations
    FOR EACH ROW
    WHEN (NEW.status = 'verified')
    EXECUTE FUNCTION handle_verified_donation();
