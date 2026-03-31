-- =============================================================
-- CONSOLIDATED PAYROLL FIX - RUN IN SUPABASE SQL EDITOR
-- =============================================================
-- This script fixes: 
-- 1. Missing columns in 'payroll' table
-- 2. Restrictive RLS policies preventing non-admin users from processing payroll
-- 3. Missing 'exec_sql' RPC function (used by node scripts)
-- =============================================================

-- STEP 1: DEFINE HELPER RPC FUNCTION
-- This allows node scripts to execute SQL in the future
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- STEP 2: FIX PAYROLL TABLE SCHEMA
-- Ensure all required columns exist with correct types
DO $$
BEGIN
    -- Core Columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'month') THEN
        ALTER TABLE payroll ADD COLUMN month INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'year') THEN
        ALTER TABLE payroll ADD COLUMN year INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'gross_salary') THEN
        ALTER TABLE payroll ADD COLUMN gross_salary DECIMAL(12,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'days_worked') THEN
        ALTER TABLE payroll ADD COLUMN days_worked INTEGER DEFAULT 26;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'days_absent') THEN
        ALTER TABLE payroll ADD COLUMN days_absent INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'payment_status') THEN
        ALTER TABLE payroll ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'payment_date') THEN
        ALTER TABLE payroll ADD COLUMN payment_date DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'payment_method') THEN
        ALTER TABLE payroll ADD COLUMN payment_method VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'notes') THEN
        ALTER TABLE payroll ADD COLUMN notes TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'exchange_rate') THEN
        ALTER TABLE payroll ADD COLUMN exchange_rate DECIMAL(15,6) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'transport_allowance') THEN
        ALTER TABLE payroll ADD COLUMN transport_allowance DECIMAL(12,2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'nssa_deduction') THEN
        ALTER TABLE payroll ADD COLUMN nssa_deduction DECIMAL(12,2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'payee_deduction') THEN
        ALTER TABLE payroll ADD COLUMN payee_deduction DECIMAL(12,2) DEFAULT 0;
    END IF;

    -- Ensure 'status' column exists too if used as fallback
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'status') THEN
        ALTER TABLE payroll ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
    END IF;

    RAISE NOTICE 'Payroll schema check/update completed.';
END $$;

-- STEP 3: FIX RLS POLICIES
-- First, disable RLS temporarily to ensure no conflicts (optional but safer)
-- ALTER TABLE payroll DISABLE ROW LEVEL SECURITY;

-- Drop all problematic existing policies
DROP POLICY IF EXISTS "Admins can manage payroll" ON payroll;
DROP POLICY IF EXISTS "Admins and managers can view payroll" ON payroll;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON payroll;
DROP POLICY IF EXISTS "Enable all operations for service role" ON payroll;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON payroll;
DROP POLICY IF EXISTS "Allow all operations for service role" ON payroll;

-- Create broad, functional policies for the application
-- 1. All authenticated users (Admin, Manager, HR) can manage payroll
CREATE POLICY "Enable all operations for authenticated users" ON payroll
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 2. Service role (server-side) can do anything
CREATE POLICY "Enable all operations for service role" ON payroll
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Re-enable RLS just in case it was disabled
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

-- STEP 4: GRANT PERMISSIONS
GRANT ALL ON TABLE payroll TO authenticated;
GRANT ALL ON TABLE payroll TO service_role;
GRANT ALL ON TABLE payroll TO postgres;

-- STEP 5: VERIFY
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'payroll';
