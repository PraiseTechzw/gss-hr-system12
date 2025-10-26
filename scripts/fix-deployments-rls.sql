-- Fix Row Level Security (RLS) Policies for Deployments Table
-- This script creates proper RLS policies to allow CRUD operations

-- First, let's check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'deployments';

-- Disable RLS temporarily to allow data operations
ALTER TABLE deployments DISABLE ROW LEVEL SECURITY;

-- Or alternatively, create proper RLS policies
-- Re-enable RLS
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON deployments;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON deployments;
DROP POLICY IF EXISTS "Allow select for authenticated users" ON deployments;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON deployments;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON deployments;

-- Create comprehensive RLS policies

-- Policy 1: Allow authenticated users to view all deployments
CREATE POLICY "Allow select for authenticated users" ON deployments
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy 2: Allow authenticated users to insert deployments
CREATE POLICY "Allow insert for authenticated users" ON deployments
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy 3: Allow authenticated users to update deployments
CREATE POLICY "Allow update for authenticated users" ON deployments
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy 4: Allow authenticated users to delete deployments
CREATE POLICY "Allow delete for authenticated users" ON deployments
    FOR DELETE
    TO authenticated
    USING (true);

-- Alternative: More restrictive policies based on user roles
-- Uncomment these if you want role-based access control

/*
-- Policy for admin users (can do everything)
CREATE POLICY "Admin full access" ON deployments
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy for manager users (can view and create)
CREATE POLICY "Manager access" ON deployments
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Policy for HR users (can view and create)
CREATE POLICY "HR access" ON deployments
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'manager', 'hr')
        )
    );
*/

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON deployments TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant sequence permissions if using serial columns
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Alternative approach: Disable RLS completely if you don't need it
-- Uncomment the line below if you want to disable RLS entirely
-- ALTER TABLE deployments DISABLE ROW LEVEL SECURITY;

-- Test the policies by checking if a user can access the table
-- This query should return data if RLS is working correctly
SELECT 
    'RLS Test' as test_name,
    COUNT(*) as deployment_count
FROM deployments;

-- Create a function to check RLS status
CREATE OR REPLACE FUNCTION check_deployments_rls_status()
RETURNS TABLE (
    table_name TEXT,
    rls_enabled BOOLEAN,
    policy_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'deployments'::TEXT as table_name,
        (SELECT rowsecurity FROM pg_tables WHERE tablename = 'deployments') as rls_enabled,
        (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'deployments') as policy_count;
END;
$$ LANGUAGE plpgsql;

-- Run the check function
SELECT * FROM check_deployments_rls_status();

-- Additional troubleshooting queries
-- Check current user context
SELECT 
    current_user,
    session_user,
    current_setting('role'),
    current_setting('request.jwt.claims', true);

-- Check if auth.uid() function exists and works
-- SELECT auth.uid() as current_user_id;

-- Check user_profiles table access
SELECT COUNT(*) as user_count FROM user_profiles;

-- If you're still having issues, you can temporarily disable RLS
-- and handle security at the application level instead
/*
ALTER TABLE deployments DISABLE ROW LEVEL SECURITY;
*/

-- Comments for documentation
COMMENT ON POLICY "Allow select for authenticated users" ON deployments IS 'Allows authenticated users to view all deployments';
COMMENT ON POLICY "Allow insert for authenticated users" ON deployments IS 'Allows authenticated users to create new deployments';
COMMENT ON POLICY "Allow update for authenticated users" ON deployments IS 'Allows authenticated users to update existing deployments';
COMMENT ON POLICY "Allow delete for authenticated users" ON deployments IS 'Allows authenticated users to delete deployments';
