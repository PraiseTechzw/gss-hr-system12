-- Simple RLS fix for payroll table
-- Run this in your Supabase SQL Editor

-- Check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'payroll';

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'payroll';

-- Drop all existing policies on payroll table
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON payroll;
DROP POLICY IF EXISTS "Enable read access for all users" ON payroll;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON payroll;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON payroll;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON payroll;
DROP POLICY IF EXISTS "Enable all operations for service role" ON payroll;

-- Create a simple policy that allows all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON payroll
    FOR ALL USING (auth.role() = 'authenticated');

-- Create a policy for service role (for server-side operations)
CREATE POLICY "Allow all operations for service role" ON payroll
    FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON payroll TO authenticated;
GRANT ALL ON payroll TO service_role;

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'payroll';

-- Test insert (this will be rolled back automatically)
DO $$
DECLARE
    test_employee_id UUID;
BEGIN
    -- Get a sample employee ID
    SELECT id INTO test_employee_id FROM employees LIMIT 1;
    
    IF test_employee_id IS NOT NULL THEN
        -- Try to insert a test record
        INSERT INTO payroll (
            employee_id, 
            month, 
            year, 
            basic_salary, 
            payment_status,
            notes
        ) VALUES (
            test_employee_id,
            12, 
            2024, 
            1000.00, 
            'pending',
            'RLS test record'
        );
        
        RAISE NOTICE '✅ Payroll insert test successful - RLS policies are working';
        
        -- Clean up the test record
        DELETE FROM payroll WHERE notes = 'RLS test record';
        
    ELSE
        RAISE NOTICE '⚠️  No employees found - cannot test insert';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Payroll insert test failed: %', SQLERRM;
END $$;
