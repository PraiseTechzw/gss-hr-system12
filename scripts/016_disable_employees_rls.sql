-- Disable RLS for employees table (temporary solution)
-- This script disables Row Level Security for the employees table to allow operations

-- Disable RLS on employees table
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to authenticated and anon users
GRANT ALL ON employees TO authenticated;
GRANT ALL ON employees TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Test by checking table permissions
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasrls
FROM pg_tables 
WHERE tablename = 'employees';

SELECT 'RLS disabled for employees table' as status;
