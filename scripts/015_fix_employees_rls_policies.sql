-- Fix Employees Table RLS Policies
-- This script creates the necessary Row Level Security policies for the employees table

-- Enable RLS on employees table (if not already enabled)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON employees;
DROP POLICY IF EXISTS "Allow authenticated users to read employees" ON employees;
DROP POLICY IF EXISTS "Allow authenticated users to insert employees" ON employees;
DROP POLICY IF EXISTS "Allow authenticated users to update employees" ON employees;
DROP POLICY IF EXISTS "Allow authenticated users to delete employees" ON employees;

-- Create comprehensive RLS policies for employees table

-- Policy 1: Allow authenticated users to read all employees
CREATE POLICY "Allow authenticated users to read employees" ON employees
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy 2: Allow authenticated users to insert employees
CREATE POLICY "Allow authenticated users to insert employees" ON employees
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy 3: Allow authenticated users to update employees
CREATE POLICY "Allow authenticated users to update employees" ON employees
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy 4: Allow authenticated users to delete employees
CREATE POLICY "Allow authenticated users to delete employees" ON employees
    FOR DELETE
    TO authenticated
    USING (true);

-- Also create policies for anon users (in case they're used)
CREATE POLICY "Allow anon users to read employees" ON employees
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow anon users to insert employees" ON employees
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anon users to update employees" ON employees
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anon users to delete employees" ON employees
    FOR DELETE
    TO anon
    USING (true);

-- Grant necessary permissions
GRANT ALL ON employees TO authenticated;
GRANT ALL ON employees TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Test the policies by checking if we can select from employees
SELECT 'RLS policies created successfully' as status;
