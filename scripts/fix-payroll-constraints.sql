-- Fix payroll table constraints
-- This script makes pay_period_start and pay_period_end nullable

-- Check current constraints
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'payroll' 
AND column_name IN ('pay_period_start', 'pay_period_end')
ORDER BY column_name;

-- Make pay_period_start nullable
ALTER TABLE payroll ALTER COLUMN pay_period_start DROP NOT NULL;

-- Make pay_period_end nullable  
ALTER TABLE payroll ALTER COLUMN pay_period_end DROP NOT NULL;

-- Add default values for pay period dates
ALTER TABLE payroll ALTER COLUMN pay_period_start SET DEFAULT CURRENT_DATE;
ALTER TABLE payroll ALTER COLUMN pay_period_end SET DEFAULT CURRENT_DATE;

-- Verify the changes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'payroll' 
AND column_name IN ('pay_period_start', 'pay_period_end')
ORDER BY column_name;

-- Test insert without pay period dates
DO $$
DECLARE
    test_employee_id UUID;
BEGIN
    -- Get a sample employee ID
    SELECT id INTO test_employee_id FROM employees LIMIT 1;
    
    IF test_employee_id IS NOT NULL THEN
        -- Try to insert a test record without pay period dates
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
            'Constraint test record'
        );
        
        RAISE NOTICE '✅ Payroll insert test successful - constraints fixed';
        
        -- Clean up the test record
        DELETE FROM payroll WHERE notes = 'Constraint test record';
        
    ELSE
        RAISE NOTICE '⚠️  No employees found - cannot test insert';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Payroll insert test failed: %', SQLERRM;
END $$;
