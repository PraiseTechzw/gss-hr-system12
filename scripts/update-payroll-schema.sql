-- Update Payroll Table Schema
-- This script adds all the missing fields from the payroll form to the payroll table

-- First, let's check if the table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS payroll (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add all the required fields for the payroll form
-- Employee and Period fields
ALTER TABLE payroll 
ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS month INTEGER NOT NULL DEFAULT EXTRACT(MONTH FROM CURRENT_DATE),
ADD COLUMN IF NOT EXISTS year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Salary Components
ALTER TABLE payroll 
ADD COLUMN IF NOT EXISTS basic_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS allowances DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS transport_allowance DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS overtime_pay DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS gross_salary DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_salary DECIMAL(10,2) DEFAULT 0;

-- Deductions
ALTER TABLE payroll 
ADD COLUMN IF NOT EXISTS deductions DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS nssa_deduction DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payee_deduction DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_deductions DECIMAL(10,2) DEFAULT 0;

-- Exchange Rate and Currency
ALTER TABLE payroll 
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(15,6) DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

-- Attendance
ALTER TABLE payroll 
ADD COLUMN IF NOT EXISTS days_worked INTEGER DEFAULT 26,
ADD COLUMN IF NOT EXISTS days_absent INTEGER DEFAULT 0;

-- Payment Details
ALTER TABLE payroll 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_date DATE,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Additional fields for comprehensive payroll management
ALTER TABLE payroll 
ADD COLUMN IF NOT EXISTS pay_period_start DATE,
ADD COLUMN IF NOT EXISTS pay_period_end DATE,
ADD COLUMN IF NOT EXISTS total_allowances DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_tax DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS aids_levy DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS nssa_contribution DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS pension_contribution DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS medical_aid DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS loan_deduction DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS advance_deduction DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS other_deductions DECIMAL(10,2) DEFAULT 0;

-- Leave-related fields
ALTER TABLE payroll 
ADD COLUMN IF NOT EXISTS leave_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unpaid_leave_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sick_leave_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS annual_leave_days INTEGER DEFAULT 0;

-- Status and tracking fields
ALTER TABLE payroll 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS processed_by UUID REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payroll_employee_id ON payroll(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_month_year ON payroll(month, year);
CREATE INDEX IF NOT EXISTS idx_payroll_payment_status ON payroll(payment_status);
CREATE INDEX IF NOT EXISTS idx_payroll_created_at ON payroll(created_at);

-- Create a function to automatically update the updated_at timestamp
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

-- Add constraints (with proper type casting)
ALTER TABLE payroll 
ADD CONSTRAINT chk_payroll_month CHECK (month::integer >= 1 AND month::integer <= 12),
ADD CONSTRAINT chk_payroll_year CHECK (year::integer >= 2020 AND year::integer <= 2030),
ADD CONSTRAINT chk_payroll_basic_salary CHECK (basic_salary::decimal >= 0),
ADD CONSTRAINT chk_payroll_days_worked CHECK (days_worked::integer >= 0 AND days_worked::integer <= 31),
ADD CONSTRAINT chk_payroll_days_absent CHECK (days_absent::integer >= 0),
ADD CONSTRAINT chk_payroll_payment_status CHECK (payment_status IN ('pending', 'processed', 'paid', 'cancelled'));

-- Add comments to document the fields
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

-- Insert sample data (optional - remove if not needed)
-- INSERT INTO payroll (
--     employee_id, month, year, basic_salary, allowances, transport_allowance,
--     overtime_pay, gross_salary, net_salary, days_worked, days_absent,
--     payment_status, exchange_rate, notes
-- ) VALUES (
--     (SELECT id FROM employees LIMIT 1), -- Replace with actual employee ID
--     12, 2024, 1500.00, 200.00, 100.00,
--     50.00, 1850.00, 1650.00, 26, 0,
--     'pending', 25.50, 'Sample payroll record'
-- );

-- Verify the table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'payroll' 
ORDER BY ordinal_position;
