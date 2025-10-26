-- Fix Row Level Security issues for payroll table
-- This script addresses RLS policies that might be blocking payroll operations

-- First, let's check if RLS is enabled on the payroll table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'payroll';

-- Check existing policies on payroll table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'payroll';

-- Option 1: Temporarily disable RLS for testing (if you have admin access)
-- ALTER TABLE payroll DISABLE ROW LEVEL SECURITY;

-- Option 2: Create proper RLS policies for payroll table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON payroll;
DROP POLICY IF EXISTS "Enable read access for all users" ON payroll;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON payroll;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON payroll;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON payroll;

-- Create comprehensive RLS policies for payroll table
CREATE POLICY "Enable all operations for authenticated users" ON payroll
    FOR ALL USING (auth.role() = 'authenticated');

-- Alternative: More restrictive policies based on user roles
-- CREATE POLICY "Enable read access for all authenticated users" ON payroll
--     FOR SELECT USING (auth.role() = 'authenticated');

-- CREATE POLICY "Enable insert for authenticated users" ON payroll
--     FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Enable update for authenticated users" ON payroll
--     FOR UPDATE USING (auth.role() = 'authenticated');

-- CREATE POLICY "Enable delete for authenticated users" ON payroll
--     FOR DELETE USING (auth.role() = 'authenticated');

-- If you want to allow service role access (for server-side operations)
CREATE POLICY "Enable all operations for service role" ON payroll
    FOR ALL USING (auth.role() = 'service_role');

-- Grant necessary permissions to authenticated users
GRANT ALL ON payroll TO authenticated;
GRANT ALL ON payroll TO service_role;

-- If you're using a service role, make sure it has the right permissions
-- GRANT ALL ON payroll TO postgres;

-- Verify the policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'payroll';

-- Test if we can now insert into payroll
-- This is just a test - you can remove this if not needed
DO $$
BEGIN
    -- Try to insert a test record (this will be rolled back)
    INSERT INTO payroll (employee_id, month, year, basic_salary, payment_status)
    VALUES (
        (SELECT id FROM employees LIMIT 1),
        12, 
        2024, 
        1000.00, 
        'pending'
    );
    
    -- If we get here, the insert worked
    RAISE NOTICE 'Payroll insert test successful - RLS policies are working correctly';
    
    -- Rollback the test insert
    ROLLBACK;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Payroll insert test failed: %', SQLERRM;
        -- Don't re-raise the exception, just log it
END $$;
