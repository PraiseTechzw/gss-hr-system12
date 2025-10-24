-- =====================================================
-- ZIMBABWE HR SYSTEM - COMPLETE DATABASE SCHEMA
-- ZIMRA PAYE, AIDS LEVY, NSSA COMPLIANCE
-- =====================================================

-- Drop existing tables if they exist (in correct order)
DROP TABLE IF EXISTS payroll_records CASCADE;
DROP TABLE IF EXISTS allowances CASCADE;
DROP TABLE IF EXISTS deductions CASCADE;
DROP TABLE IF EXISTS payroll_periods CASCADE;
DROP TABLE IF EXISTS leave_balances CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS employment_type CASCADE;
DROP TYPE IF EXISTS leave_type CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;
DROP TYPE IF EXISTS payroll_status CASCADE;

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'hr', 'manager', 'employee');
CREATE TYPE employment_type AS ENUM ('Permanent', 'Contract', 'Casual');
CREATE TYPE leave_type AS ENUM ('annual', 'sick', 'compassionate', 'maternity', 'paternity');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE payroll_status AS ENUM ('draft', 'approved', 'completed');

-- =====================================================
-- 1. USERS TABLE (Supabase Auth Integration)
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'employee',
    department_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. DEPARTMENTS TABLE
-- =====================================================
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint for users.department_id
ALTER TABLE users ADD CONSTRAINT fk_users_department 
    FOREIGN KEY (department_id) REFERENCES departments(id);

-- =====================================================
-- 3. EMPLOYEES TABLE (Core HR Data)
-- =====================================================
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    department_id UUID REFERENCES departments(id),
    position VARCHAR(255) NOT NULL,
    job_grade VARCHAR(50),
    employment_type employment_type NOT NULL,
    id_number VARCHAR(50) UNIQUE NOT NULL,
    nssa_number VARCHAR(50),
    bank_name VARCHAR(255),
    usd_account_number VARCHAR(50),
    zwl_account_number VARCHAR(50),
    basic_salary_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
    transport_allowance_usd NUMERIC(10,2) DEFAULT 0,
    housing_allowance_usd NUMERIC(10,2) DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. PAYROLL PERIODS TABLE
-- =====================================================
CREATE TABLE payroll_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    status payroll_status DEFAULT 'draft',
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(month, year)
);

-- =====================================================
-- 5. PAYROLL RECORDS TABLE (Monthly Payroll Data)
-- =====================================================
CREATE TABLE payroll_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    payroll_period_id UUID REFERENCES payroll_periods(id) ON DELETE CASCADE,
    gross_salary_usd NUMERIC(10,2) NOT NULL,
    paye NUMERIC(10,2) NOT NULL DEFAULT 0,
    aids_levy NUMERIC(10,2) NOT NULL DEFAULT 0,
    nssa NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_deductions NUMERIC(10,2) NOT NULL DEFAULT 0,
    net_salary_usd NUMERIC(10,2) NOT NULL,
    status request_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, payroll_period_id)
);

-- =====================================================
-- 6. ALLOWANCES TABLE
-- =====================================================
CREATE TABLE allowances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    payroll_period_id UUID REFERENCES payroll_periods(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- transport, housing, bonus, overtime, etc.
    amount_usd NUMERIC(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. DEDUCTIONS TABLE
-- =====================================================
CREATE TABLE deductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    payroll_period_id UUID REFERENCES payroll_periods(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- loan, pension, other
    amount_usd NUMERIC(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. LEAVE REQUESTS TABLE
-- =====================================================
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    type leave_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested INTEGER NOT NULL,
    reason TEXT,
    status request_status DEFAULT 'pending',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. LEAVE BALANCES TABLE
-- =====================================================
CREATE TABLE leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    leave_type leave_type NOT NULL,
    opening_balance INTEGER DEFAULT 0,
    accrued INTEGER DEFAULT 0,
    taken INTEGER DEFAULT 0,
    closing_balance INTEGER GENERATED ALWAYS AS (opening_balance + accrued - taken) STORED,
    year INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, leave_type, year)
);

-- =====================================================
-- 10. SYSTEM SETTINGS TABLE
-- =====================================================
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL DEFAULT 'Genius Security Services',
    company_address TEXT,
    company_phone VARCHAR(50),
    company_email VARCHAR(255),
    logo_url VARCHAR(500),
    nssa_rate NUMERIC(5,4) DEFAULT 0.045, -- 4.5%
    aids_levy_rate NUMERIC(5,4) DEFAULT 0.03, -- 3%
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 11. AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ZIMBABWE TAX CALCULATION FUNCTIONS
-- =====================================================

-- Function to calculate ZIMRA PAYE based on 2025 USD brackets
CREATE OR REPLACE FUNCTION calculate_zimra_paye(gross_salary NUMERIC)
RETURNS NUMERIC AS $$
DECLARE
    paye_amount NUMERIC := 0;
BEGIN
    -- 2025 ZIMRA USD Tax Brackets
    IF gross_salary <= 100 THEN
        paye_amount := 0;
    ELSIF gross_salary <= 300 THEN
        paye_amount := (gross_salary - 100) * 0.20;
    ELSIF gross_salary <= 1000 THEN
        paye_amount := 40 + (gross_salary - 300) * 0.25; -- 40 = (300-100)*0.20
    ELSIF gross_salary <= 2000 THEN
        paye_amount := 215 + (gross_salary - 1000) * 0.30; -- 215 = 40 + (1000-300)*0.25
    ELSIF gross_salary <= 3000 THEN
        paye_amount := 515 + (gross_salary - 2000) * 0.35; -- 515 = 215 + (2000-1000)*0.30
    ELSE
        paye_amount := 865 + (gross_salary - 3000) * 0.40; -- 865 = 515 + (3000-2000)*0.35
    END IF;
    
    RETURN ROUND(paye_amount, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate AIDS Levy (3% of PAYE)
CREATE OR REPLACE FUNCTION calculate_aids_levy(paye_amount NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
    RETURN ROUND(paye_amount * 0.03, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate NSSA (4.5% of gross salary)
CREATE OR REPLACE FUNCTION calculate_nssa(gross_salary NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
    RETURN ROUND(gross_salary * 0.045, 2);
END;
$$ LANGUAGE plpgsql;

-- Comprehensive Zimbabwe tax calculation function
CREATE OR REPLACE FUNCTION calculate_zimbabwe_tax(gross_salary NUMERIC)
RETURNS JSONB AS $$
DECLARE
    paye_amount NUMERIC;
    aids_levy_amount NUMERIC;
    nssa_amount NUMERIC;
    total_deductions NUMERIC;
    net_salary NUMERIC;
BEGIN
    -- Calculate PAYE
    paye_amount := calculate_zimra_paye(gross_salary);
    
    -- Calculate AIDS Levy (3% of PAYE)
    aids_levy_amount := calculate_aids_levy(paye_amount);
    
    -- Calculate NSSA (4.5% of gross salary)
    nssa_amount := calculate_nssa(gross_salary);
    
    -- Calculate total deductions
    total_deductions := paye_amount + aids_levy_amount + nssa_amount;
    
    -- Calculate net salary
    net_salary := gross_salary - total_deductions;
    
    RETURN jsonb_build_object(
        'gross_salary', gross_salary,
        'paye', paye_amount,
        'aids_levy', aids_levy_amount,
        'nssa', nssa_amount,
        'total_deductions', total_deductions,
        'net_salary', net_salary
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS FOR AUTOMATIC CALCULATIONS
-- =====================================================

-- Trigger to automatically calculate payroll deductions
CREATE OR REPLACE FUNCTION calculate_payroll_deductions()
RETURNS TRIGGER AS $$
DECLARE
    tax_calculation JSONB;
BEGIN
    -- Calculate Zimbabwe tax components
    tax_calculation := calculate_zimbabwe_tax(NEW.gross_salary_usd);
    
    -- Update the record with calculated values
    NEW.paye := (tax_calculation->>'paye')::NUMERIC;
    NEW.aids_levy := (tax_calculation->>'aids_levy')::NUMERIC;
    NEW.nssa := (tax_calculation->>'nssa')::NUMERIC;
    NEW.total_deductions := (tax_calculation->>'total_deductions')::NUMERIC;
    NEW.net_salary_usd := (tax_calculation->>'net_salary')::NUMERIC;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payroll_records
CREATE TRIGGER trigger_calculate_payroll_deductions
    BEFORE INSERT OR UPDATE OF gross_salary_usd ON payroll_records
    FOR EACH ROW
    EXECUTE FUNCTION calculate_payroll_deductions();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Admins can do everything
CREATE POLICY "Admins can do everything" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- HR can view all users
CREATE POLICY "HR can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'hr')
        )
    );

-- Employees can view their own payroll records
CREATE POLICY "Employees can view own payroll" ON payroll_records
    FOR SELECT USING (
        employee_id IN (
            SELECT id FROM employees WHERE user_id = auth.uid()
        )
    );

-- HR and Admin can view all payroll records
CREATE POLICY "HR can view all payroll" ON payroll_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'hr')
        )
    );

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_employees_employee_number ON employees(employee_number);
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_payroll_records_employee ON payroll_records(employee_id);
CREATE INDEX idx_payroll_records_period ON payroll_records(payroll_period_id);
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert system settings
INSERT INTO system_settings (company_name, company_address, company_phone, company_email) 
VALUES (
    'Genius Security Services (Pvt) Ltd',
    '123 Business Park, Harare, Zimbabwe',
    '+263 4 123 4567',
    'info@geniussecurity.co.zw'
);

-- Insert sample departments
INSERT INTO departments (name, description) VALUES
('Operations', 'Security operations and field work'),
('Administration', 'Administrative and support functions'),
('Finance', 'Financial management and accounting'),
('Human Resources', 'HR management and employee relations');

-- Insert sample users
INSERT INTO users (email, full_name, role, department_id) VALUES
('admin@geniussecurity.co.zw', 'System Administrator', 'admin', (SELECT id FROM departments WHERE name = 'Administration')),
('hr@geniussecurity.co.zw', 'HR Manager', 'hr', (SELECT id FROM departments WHERE name = 'Human Resources')),
('manager@geniussecurity.co.zw', 'Operations Manager', 'manager', (SELECT id FROM departments WHERE name = 'Operations'));

-- Update department managers
UPDATE departments SET manager_id = (SELECT id FROM users WHERE email = 'manager@geniussecurity.co.zw') WHERE name = 'Operations';
UPDATE departments SET manager_id = (SELECT id FROM users WHERE email = 'hr@geniussecurity.co.zw') WHERE name = 'Human Resources';

-- Insert sample employees
INSERT INTO employees (
    user_id, employee_number, department_id, position, job_grade, employment_type,
    id_number, nssa_number, bank_name, usd_account_number,
    basic_salary_usd, transport_allowance_usd, housing_allowance_usd, start_date
) VALUES
(
    (SELECT id FROM users WHERE email = 'admin@geniussecurity.co.zw'),
    'EMP001', (SELECT id FROM departments WHERE name = 'Administration'),
    'System Administrator', 'Grade 1', 'Permanent',
    '09-123456-T-09', 'NSSA001', 'POHBS Bank', 'USD001',
    2500.00, 200.00, 300.00, '2024-01-01'
),
(
    (SELECT id FROM users WHERE email = 'hr@geniussecurity.co.zw'),
    'EMP002', (SELECT id FROM departments WHERE name = 'Human Resources'),
    'HR Manager', 'Grade 2', 'Permanent',
    '09-234567-T-09', 'NSSA002', 'CBZ Bank', 'USD002',
    2200.00, 150.00, 250.00, '2024-01-15'
),
(
    (SELECT id FROM users WHERE email = 'manager@geniussecurity.co.zw'),
    'EMP003', (SELECT id FROM departments WHERE name = 'Operations'),
    'Operations Manager', 'Grade 2', 'Permanent',
    '09-345678-T-09', 'NSSA003', 'Stanbic Bank', 'USD003',
    2000.00, 100.00, 200.00, '2024-02-01'
);

-- Insert sample payroll period
INSERT INTO payroll_periods (month, year, status, created_by) VALUES
(1, 2025, 'draft', (SELECT id FROM users WHERE email = 'admin@geniussecurity.co.zw'));

-- Insert sample payroll records (will trigger automatic tax calculations)
INSERT INTO payroll_records (employee_id, payroll_period_id, gross_salary_usd) 
SELECT 
    e.id, 
    (SELECT id FROM payroll_periods WHERE month = 1 AND year = 2025),
    e.basic_salary_usd + e.transport_allowance_usd + e.housing_allowance_usd
FROM employees e;

-- Insert sample leave balances
INSERT INTO leave_balances (employee_id, leave_type, opening_balance, accrued, year)
SELECT 
    e.id,
    'annual',
    21, -- 21 days annual leave
    1.75, -- 1.75 days per month
    2025
FROM employees e;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Zimbabwe HR System database created successfully!';
    RAISE NOTICE 'Features implemented:';
    RAISE NOTICE '- ZIMRA PAYE calculation with 2025 USD brackets';
    RAISE NOTICE '- AIDS Levy calculation (3% of PAYE)';
    RAISE NOTICE '- NSSA calculation (4.5% of gross salary)';
    RAISE NOTICE '- Automatic payroll calculations';
    RAISE NOTICE '- Role-based access control';
    RAISE NOTICE '- Leave management system';
    RAISE NOTICE '- Audit logging';
    RAISE NOTICE 'Sample data inserted for testing.';
END $$;



