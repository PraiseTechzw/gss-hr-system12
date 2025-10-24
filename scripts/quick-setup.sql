-- Quick Database Setup for Zimbabwe HR System
-- Run this in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee',
    department_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    department_id UUID REFERENCES departments(id),
    position VARCHAR(255),
    job_grade VARCHAR(50),
    employment_type VARCHAR(50),
    id_number VARCHAR(50),
    nssa_number VARCHAR(50),
    bank_name VARCHAR(255),
    usd_account_number VARCHAR(50),
    zwl_account_number VARCHAR(50),
    basic_salary_usd DECIMAL(10,2),
    transport_allowance_usd DECIMAL(10,2),
    housing_allowance_usd DECIMAL(10,2),
    start_date DATE,
    end_date DATE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin user
INSERT INTO users (email, full_name, role, is_active) 
VALUES ('admin@geniussecurity.co.zw', 'System Administrator', 'admin', true)
ON CONFLICT (email) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- Create sample department
INSERT INTO departments (name, description, is_active) 
VALUES ('Administration', 'System Administration Department', true)
ON CONFLICT DO NOTHING;

-- Create sample employee for admin
INSERT INTO employees (user_id, employee_number, department_id, position, employment_type, basic_salary_usd, active)
SELECT 
    u.id,
    'ADMIN001',
    d.id,
    'System Administrator',
    'Permanent',
    5000.00,
    true
FROM users u, departments d
WHERE u.email = 'admin@geniussecurity.co.zw'
AND d.name = 'Administration'
ON CONFLICT (employee_number) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

CREATE POLICY "Public departments" ON departments
    FOR SELECT USING (true);

CREATE POLICY "Admin departments management" ON departments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Success message
SELECT 'Database setup completed successfully!' as message;
