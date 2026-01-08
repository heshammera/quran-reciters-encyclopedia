-- Add permissions column to user_roles
ALTER TABLE user_roles 
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT NULL;

-- Comment on column
COMMENT ON COLUMN user_roles.permissions IS 'Granular permissions override for the user.';
