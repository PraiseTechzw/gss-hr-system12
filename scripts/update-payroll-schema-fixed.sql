-- Fixed Payroll Table Schema Update
-- This script safely adds all missing fields to the payroll table

-- Check if payroll table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payroll') THEN
        CREATE TABLE payroll (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created payroll table';
    ELSE
        RAISE NOTICE 'Payroll table already exists';
    END IF;
END $$;

-- Add employee and period fields
DO $$
BEGIN
    -- Employee ID
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'employee_id') THEN
        ALTER TABLE payroll ADD COLUMN employee_id UUID REFERENCES employees(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added employee_id column';
    END IF;
    
    -- Month
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'month') THEN
        ALTER TABLE payroll ADD COLUMN month INTEGER NOT NULL DEFAULT EXTRACT(MONTH FROM CURRENT_DATE);
        RAISE NOTICE 'Added month column';
    END IF;
    
    -- Year
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'year') THEN
        ALTER TABLE payroll ADD COLUMN year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);
        RAISE NOTICE 'Added year column';
    END IF;
END $$;

-- Add salary components
DO $$
BEGIN
    -- Basic salary
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'basic_salary') THEN
        ALTER TABLE payroll ADD COLUMN basic_salary DECIMAL(10,2) NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added basic_salary column';
    END IF;
    
    -- Allowances
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'allowances') THEN
        ALTER TABLE payroll ADD COLUMN allowances DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added allowances column';
    END IF;
    
    -- Transport allowance
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'transport_allowance') THEN
        ALTER TABLE payroll ADD COLUMN transport_allowance DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added transport_allowance column';
    END IF;
    
    -- Overtime pay
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'overtime_pay') THEN
        ALTER TABLE payroll ADD COLUMN overtime_pay DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added overtime_pay column';
    END IF;
    
    -- Gross salary
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'gross_salary') THEN
        ALTER TABLE payroll ADD COLUMN gross_salary DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added gross_salary column';
    END IF;
    
    -- Net salary
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'net_salary') THEN
        ALTER TABLE payroll ADD COLUMN net_salary DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added net_salary column';
    END IF;
END $$;

-- Add deduction fields
DO $$
BEGIN
    -- Deductions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'deductions') THEN
        ALTER TABLE payroll ADD COLUMN deductions DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added deductions column';
    END IF;
    
    -- NSSA deduction
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'nssa_deduction') THEN
        ALTER TABLE payroll ADD COLUMN nssa_deduction DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added nssa_deduction column';
    END IF;
    
    -- PAYEE deduction
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'payee_deduction') THEN
        ALTER TABLE payroll ADD COLUMN payee_deduction DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added payee_deduction column';
    END IF;
    
    -- Total deductions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'total_deductions') THEN
        ALTER TABLE payroll ADD COLUMN total_deductions DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added total_deductions column';
    END IF;
END $$;

-- Add exchange rate and currency
DO $$
BEGIN
    -- Exchange rate
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'exchange_rate') THEN
        ALTER TABLE payroll ADD COLUMN exchange_rate DECIMAL(15,6) DEFAULT 0;
        RAISE NOTICE 'Added exchange_rate column';
    END IF;
    
    -- Currency
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'currency') THEN
        ALTER TABLE payroll ADD COLUMN currency VARCHAR(3) DEFAULT 'USD';
        RAISE NOTICE 'Added currency column';
    END IF;
END $$;

-- Add attendance fields
DO $$
BEGIN
    -- Days worked
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'days_worked') THEN
        ALTER TABLE payroll ADD COLUMN days_worked INTEGER DEFAULT 26;
        RAISE NOTICE 'Added days_worked column';
    END IF;
    
    -- Days absent
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'days_absent') THEN
        ALTER TABLE payroll ADD COLUMN days_absent INTEGER DEFAULT 0;
        RAISE NOTICE 'Added days_absent column';
    END IF;
END $$;

-- Add payment details
DO $$
BEGIN
    -- Payment status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'payment_status') THEN
        ALTER TABLE payroll ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';
        RAISE NOTICE 'Added payment_status column';
    END IF;
    
    -- Payment date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'payment_date') THEN
        ALTER TABLE payroll ADD COLUMN payment_date DATE;
        RAISE NOTICE 'Added payment_date column';
    END IF;
    
    -- Payment method
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'payment_method') THEN
        ALTER TABLE payroll ADD COLUMN payment_method VARCHAR(50);
        RAISE NOTICE 'Added payment_method column';
    END IF;
    
    -- Notes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'notes') THEN
        ALTER TABLE payroll ADD COLUMN notes TEXT;
        RAISE NOTICE 'Added notes column';
    END IF;
END $$;

-- Add additional fields for comprehensive payroll management
DO $$
BEGIN
    -- Pay period
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'pay_period_start') THEN
        ALTER TABLE payroll ADD COLUMN pay_period_start DATE;
        RAISE NOTICE 'Added pay_period_start column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'pay_period_end') THEN
        ALTER TABLE payroll ADD COLUMN pay_period_end DATE;
        RAISE NOTICE 'Added pay_period_end column';
    END IF;
    
    -- Total allowances
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'total_allowances') THEN
        ALTER TABLE payroll ADD COLUMN total_allowances DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added total_allowances column';
    END IF;
    
    -- Tax fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'total_tax') THEN
        ALTER TABLE payroll ADD COLUMN total_tax DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added total_tax column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'aids_levy') THEN
        ALTER TABLE payroll ADD COLUMN aids_levy DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added aids_levy column';
    END IF;
    
    -- Contributions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'nssa_contribution') THEN
        ALTER TABLE payroll ADD COLUMN nssa_contribution DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added nssa_contribution column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'pension_contribution') THEN
        ALTER TABLE payroll ADD COLUMN pension_contribution DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added pension_contribution column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'medical_aid') THEN
        ALTER TABLE payroll ADD COLUMN medical_aid DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added medical_aid column';
    END IF;
    
    -- Other deductions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'loan_deduction') THEN
        ALTER TABLE payroll ADD COLUMN loan_deduction DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added loan_deduction column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'advance_deduction') THEN
        ALTER TABLE payroll ADD COLUMN advance_deduction DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added advance_deduction column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'other_deductions') THEN
        ALTER TABLE payroll ADD COLUMN other_deductions DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added other_deductions column';
    END IF;
END $$;

-- Add leave-related fields
DO $$
BEGIN
    -- Leave days
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'leave_days') THEN
        ALTER TABLE payroll ADD COLUMN leave_days INTEGER DEFAULT 0;
        RAISE NOTICE 'Added leave_days column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'unpaid_leave_days') THEN
        ALTER TABLE payroll ADD COLUMN unpaid_leave_days INTEGER DEFAULT 0;
        RAISE NOTICE 'Added unpaid_leave_days column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'sick_leave_days') THEN
        ALTER TABLE payroll ADD COLUMN sick_leave_days INTEGER DEFAULT 0;
        RAISE NOTICE 'Added sick_leave_days column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'annual_leave_days') THEN
        ALTER TABLE payroll ADD COLUMN annual_leave_days INTEGER DEFAULT 0;
        RAISE NOTICE 'Added annual_leave_days column';
    END IF;
END $$;

-- Add status and tracking fields
DO $$
BEGIN
    -- Status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'status') THEN
        ALTER TABLE payroll ADD COLUMN status VARCHAR(20) DEFAULT 'active';
        RAISE NOTICE 'Added status column';
    END IF;
    
    -- Processed by
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'processed_by') THEN
        ALTER TABLE payroll ADD COLUMN processed_by UUID REFERENCES user_profiles(id);
        RAISE NOTICE 'Added processed_by column';
    END IF;
    
    -- Processed at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'processed_at') THEN
        ALTER TABLE payroll ADD COLUMN processed_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added processed_at column';
    END IF;
    
    -- Approved by
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'approved_by') THEN
        ALTER TABLE payroll ADD COLUMN approved_by UUID REFERENCES user_profiles(id);
        RAISE NOTICE 'Added approved_by column';
    END IF;
    
    -- Approved at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll' AND column_name = 'approved_at') THEN
        ALTER TABLE payroll ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added approved_at column';
    END IF;
END $$;

-- Create indexes for better performance (only if they don't exist)
DO $$
BEGIN
    -- Employee ID index
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'payroll' AND indexname = 'idx_payroll_employee_id') THEN
        CREATE INDEX idx_payroll_employee_id ON payroll(employee_id);
        RAISE NOTICE 'Created index on employee_id';
    END IF;
    
    -- Month/Year index
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'payroll' AND indexname = 'idx_payroll_month_year') THEN
        CREATE INDEX idx_payroll_month_year ON payroll(month, year);
        RAISE NOTICE 'Created index on month, year';
    END IF;
    
    -- Payment status index
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'payroll' AND indexname = 'idx_payroll_payment_status') THEN
        CREATE INDEX idx_payroll_payment_status ON payroll(payment_status);
        RAISE NOTICE 'Created index on payment_status';
    END IF;
    
    -- Created at index
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'payroll' AND indexname = 'idx_payroll_created_at') THEN
        CREATE INDEX idx_payroll_created_at ON payroll(created_at);
        RAISE NOTICE 'Created index on created_at';
    END IF;
END $$;

-- Create or replace the update trigger function
CREATE OR REPLACE FUNCTION update_payroll_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at (drop first if exists)
DROP TRIGGER IF EXISTS trigger_update_payroll_updated_at ON payroll;
CREATE TRIGGER trigger_update_payroll_updated_at
    BEFORE UPDATE ON payroll
    FOR EACH ROW
    EXECUTE FUNCTION update_payroll_updated_at();

-- Add basic constraints (without complex type casting)
DO $$
BEGIN
    -- Month constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'chk_payroll_month') THEN
        ALTER TABLE payroll ADD CONSTRAINT chk_payroll_month CHECK (month >= 1 AND month <= 12);
        RAISE NOTICE 'Added month constraint';
    END IF;
    
    -- Year constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'chk_payroll_year') THEN
        ALTER TABLE payroll ADD CONSTRAINT chk_payroll_year CHECK (year >= 2020 AND year <= 2030);
        RAISE NOTICE 'Added year constraint';
    END IF;
    
    -- Basic salary constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'chk_payroll_basic_salary') THEN
        ALTER TABLE payroll ADD CONSTRAINT chk_payroll_basic_salary CHECK (basic_salary >= 0);
        RAISE NOTICE 'Added basic_salary constraint';
    END IF;
    
    -- Days worked constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'chk_payroll_days_worked') THEN
        ALTER TABLE payroll ADD CONSTRAINT chk_payroll_days_worked CHECK (days_worked >= 0 AND days_worked <= 31);
        RAISE NOTICE 'Added days_worked constraint';
    END IF;
    
    -- Days absent constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'chk_payroll_days_absent') THEN
        ALTER TABLE payroll ADD CONSTRAINT chk_payroll_days_absent CHECK (days_absent >= 0);
        RAISE NOTICE 'Added days_absent constraint';
    END IF;
    
    -- Payment status constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'chk_payroll_payment_status') THEN
        ALTER TABLE payroll ADD CONSTRAINT chk_payroll_payment_status CHECK (payment_status IN ('pending', 'processed', 'paid', 'cancelled'));
        RAISE NOTICE 'Added payment_status constraint';
    END IF;
END $$;

-- Add table and column comments
COMMENT ON TABLE payroll IS 'Comprehensive payroll records for all employees';
COMMENT ON COLUMN payroll.employee_id IS 'Reference to the employee';
COMMENT ON COLUMN payroll.month IS 'Payroll month (1-12)';
COMMENT ON COLUMN payroll.year IS 'Payroll year';
COMMENT ON COLUMN payroll.basic_salary IS 'Base salary amount';
COMMENT ON COLUMN payroll.allowances IS 'Additional allowances';
COMMENT ON COLUMN payroll.transport_allowance IS 'Transport allowance';
COMMENT ON COLUMN payroll.overtime_pay IS 'Overtime payment';
COMMENT ON COLUMN payroll.gross_salary IS 'Total salary before deductions';
COMMENT ON COLUMN payroll.net_salary IS 'Final salary after all deductions';
COMMENT ON COLUMN payroll.nssa_deduction IS 'NSSA contribution';
COMMENT ON COLUMN payroll.payee_deduction IS 'PAYEE tax deduction';
COMMENT ON COLUMN payroll.exchange_rate IS 'Exchange rate (ZWL per USD)';
COMMENT ON COLUMN payroll.days_worked IS 'Number of days worked';
COMMENT ON COLUMN payroll.days_absent IS 'Number of days absent';
COMMENT ON COLUMN payroll.payment_status IS 'Payment processing status';
COMMENT ON COLUMN payroll.payment_date IS 'Date when payment was made';
COMMENT ON COLUMN payroll.payment_method IS 'Method of payment';
COMMENT ON COLUMN payroll.notes IS 'Additional notes or comments';

-- Final verification
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'payroll' 
ORDER BY ordinal_position;
