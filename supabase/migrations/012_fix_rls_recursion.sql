-- Migration 012: Fix RLS Recursion in user_roles (Defensive Version)
-- This migration replaces recursive subqueries in RLS policies with safe SECURITY DEFINER functions.
-- It includes checks for table existence to avoid errors if some modules are not yet installed.

-- 1. Create a safe function to check roles
CREATE OR REPLACE FUNCTION has_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = ANY(required_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update is_admin function to be safer and consistent
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN has_role(ARRAY['admin']);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update user_roles policies
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_roles') THEN
        DROP POLICY IF EXISTS "Admins can read all roles" ON user_roles;
        CREATE POLICY "Admins can read all roles" ON user_roles 
        FOR SELECT USING (is_admin());
    END IF;
END $$;

-- 4. Update static_pages policies
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'static_pages') THEN
        DROP POLICY IF EXISTS "Admins/Editors can read all pages" ON static_pages;
        CREATE POLICY "Admins/Editors can read all pages" ON static_pages 
        FOR SELECT USING (has_role(ARRAY['admin', 'editor']));

        DROP POLICY IF EXISTS "Admins/Editors can manage pages" ON static_pages;
        CREATE POLICY "Admins/Editors can manage pages" ON static_pages 
        FOR ALL USING (has_role(ARRAY['admin', 'editor']));
    END IF;
END $$;

-- 5. Update donations policies
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'donations') THEN
        DROP POLICY IF EXISTS "Admins can manage all donations" ON donations;
        CREATE POLICY "Admins can manage all donations" ON donations 
        FOR ALL USING (is_admin());
    END IF;
END $$;

-- 6. Update change_logs policies
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'change_logs') THEN
        DROP POLICY IF EXISTS "Admins can manage logs" ON change_logs;
        CREATE POLICY "Admins can manage logs" ON change_logs 
        FOR ALL USING (is_admin());
    END IF;
END $$;
