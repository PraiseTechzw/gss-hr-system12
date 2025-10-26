-- Simple script to fix payroll table schema
-- This script ensures all columns have the correct data types

-- First, let's check what columns exist and their types
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'payroll' 
ORDER BY ordinal_position;

-- If the table doesn't exist, create it with all the right columns
CREATE TABLE IF NOT EXISTS payroll (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Employee and period
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    month INTEGER NOT NULL DEFAULT EXTRACT(MONTH FROM CURRENT_DATE),
    year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    
    -- Salary components
    basic_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
    allowances DECIMAL(10,2) DEFAULT 0,
    transport_allowance DECIMAL(10,2) DEFAULT 0,
    overtime_pay DECIMAL(10,2) DEFAULT 0,
    gross_salary DECIMAL(10,2) DEFAULT 0,
    net_salary DECIMAL(10,2) DEFAULT 0,
    
    -- Deductions
    deductions DECIMAL(10,2) DEFAULT 0,
    nssa_deduction DECIMAL(10,2) DEFAULT 0,
    payee_deduction DECIMAL(10,2) DEFAULT 0,
    total_deductions DECIMAL(10,2) DEFAULT 0,
    
    -- Exchange rate and currency
    exchange_rate DECIMAL(15,6) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Attendance
    days_worked INTEGER DEFAULT 26,
    days_absent INTEGER DEFAULT 0,
    
    -- Payment details
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_date DATE,
    payment_method VARCHAR(50),
    notes TEXT,
    
    -- Additional fields
    pay_period_start DATE,
    pay_period_end DATE,
    total_allowances DECIMAL(10,2) DEFAULT 0,
    total_tax DECIMAL(10,2) DEFAULT 0,
    aids_levy DECIMAL(10,2) DEFAULT 0,
    nssa_contribution DECIMAL(10,2) DEFAULT 0,
    pension_contribution DECIMAL(10,2) DEFAULT 0,
    medical_aid DECIMAL(10,2) DEFAULT 0,
    loan_deduction DECIMAL(10,2) DEFAULT 0,
    advance_deduction DECIMAL(10,2) DEFAULT 0,
    other_deductions DECIMAL(10,2) DEFAULT 0,
    
    -- Leave fields
    leave_days INTEGER DEFAULT 0,
    unpaid_leave_days INTEGER DEFAULT 0,
    sick_leave_days INTEGER DEFAULT 0,
    annual_leave_days INTEGER DEFAULT 0,
    
    -- Status and tracking
    status VARCHAR(20) DEFAULT 'active',
    processed_by UUID REFERENCES user_profiles(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES user_profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE
);

-- If the table already exists, add missing columns one by one
DO $$
BEGIN
    -- Add employee_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'employee_id') THEN
        ALTER TABLE payroll ADD COLUMN employee_id UUID REFERENCES employees(id) ON DELETE CASCADE;
    END IF;
    
    -- Add month if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'month') THEN
        ALTER TABLE payroll ADD COLUMN month INTEGER NOT NULL DEFAULT EXTRACT(MONTH FROM CURRENT_DATE);
    END IF;
    
    -- Add year if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'year') THEN
        ALTER TABLE payroll ADD COLUMN year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);
    END IF;
    
    -- Add basic_salary if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'basic_salary') THEN
        ALTER TABLE payroll ADD COLUMN basic_salary DECIMAL(10,2) NOT NULL DEFAULT 0;
    END IF;
    
    -- Add allowances if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'allowances') THEN
        ALTER TABLE payroll ADD COLUMN allowances DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add transport_allowance if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'transport_allowance') THEN
        ALTER TABLE payroll ADD COLUMN transport_allowance DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add overtime_pay if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'overtime_pay') THEN
        ALTER TABLE payroll ADD COLUMN overtime_pay DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add gross_salary if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'gross_salary') THEN
        ALTER TABLE payroll ADD COLUMN gross_salary DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add net_salary if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'net_salary') THEN
        ALTER TABLE payroll ADD COLUMN net_salary DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add deductions if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'deductions') THEN
        ALTER TABLE payroll ADD COLUMN deductions DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add nssa_deduction if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'nssa_deduction') THEN
        ALTER TABLE payroll ADD COLUMN nssa_deduction DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add payee_deduction if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'payee_deduction') THEN
        ALTER TABLE payroll ADD COLUMN payee_deduction DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add exchange_rate if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'exchange_rate') THEN
        ALTER TABLE payroll ADD COLUMN exchange_rate DECIMAL(15,6) DEFAULT 0;
    END IF;
    
    -- Add days_worked if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'days_worked') THEN
        ALTER TABLE payroll ADD COLUMN days_worked INTEGER DEFAULT 26;
    END IF;
    
    -- Add days_absent if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'days_absent') THEN
        ALTER TABLE payroll ADD COLUMN days_absent INTEGER DEFAULT 0;
    END IF;
    
    -- Add payment_status if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'payment_status') THEN
        ALTER TABLE payroll ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';
    END IF;
    
    -- Add payment_date if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'payment_date') THEN
        ALTER TABLE payroll ADD COLUMN payment_date DATE;
    END IF;
    
    -- Add payment_method if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'payment_method') THEN
        ALTER TABLE payroll ADD COLUMN payment_method VARCHAR(50);
    END IF;
    
    -- Add notes if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'notes') THEN
        ALTER TABLE payroll ADD COLUMN notes TEXT;
    END IF;
    
    RAISE NOTICE 'Payroll table schema updated successfully';
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payroll_employee_id ON payroll(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_month_year ON payroll(month, year);
CREATE INDEX IF NOT EXISTS idx_payroll_payment_status ON payroll(payment_status);
CREATE INDEX IF NOT EXISTS idx_payroll_created_at ON payroll(created_at);

-- Create or replace the update trigger function
CREATE OR REPLACE FUNCTION update_payroll_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_payroll_updated_at ON payroll;
CREATE TRIGGER trigger_update_payroll_updated_at
    BEFORE UPDATE ON payroll
    FOR EACH ROW
    EXECUTE FUNCTION update_payroll_updated_at();

-- Add basic constraints (only if the columns exist and are the right type)
DO $$
BEGIN
    -- Only add constraints if the columns exist and are the right type
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'month' AND data_type = 'integer') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'chk_payroll_month') THEN
            ALTER TABLE payroll ADD CONSTRAINT chk_payroll_month CHECK (month >= 1 AND month <= 12);
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'year' AND data_type = 'integer') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'chk_payroll_year') THEN
            ALTER TABLE payroll ADD CONSTRAINT chk_payroll_year CHECK (year >= 2020 AND year <= 2030);
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'basic_salary' AND data_type = 'numeric') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'chk_payroll_basic_salary') THEN
            ALTER TABLE payroll ADD CONSTRAINT chk_payroll_basic_salary CHECK (basic_salary >= 0);
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'days_worked' AND data_type = 'integer') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'chk_payroll_days_worked') THEN
            ALTER TABLE payroll ADD CONSTRAINT chk_payroll_days_worked CHECK (days_worked >= 0 AND days_worked <= 31);
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'days_absent' AND data_type = 'integer') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'chk_payroll_days_absent') THEN
            ALTER TABLE payroll ADD CONSTRAINT chk_payroll_days_absent CHECK (days_absent >= 0);
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'payment_status' AND data_type = 'character varying') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'chk_payroll_payment_status') THEN
            ALTER TABLE payroll ADD CONSTRAINT chk_payroll_payment_status CHECK (payment_status IN ('pending', 'processed', 'paid', 'cancelled'));
        END IF;
    END IF;
    
    RAISE NOTICE 'Constraints added successfully';
END $$;

-- Final verification - show the current table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'payroll' 
ORDER BY ordinal_position;
