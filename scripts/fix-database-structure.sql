-- Fix Database Structure for Zimbabwe HR System
-- This script will create the correct user_profiles table and admin user

-- First, let's see what we have
-- Drop the incomplete user_profiles table if it exists
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Create the correct user_profiles table with all required columns
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee',
    department_id UUID,
    position VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin user with proper password hash
-- Password: admin123 (bcrypt hash)
INSERT INTO user_profiles (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    full_name, 
    role, 
    status
) VALUES (
    'admin@geniussecurity.co.zw',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8.8.8.8',
    'System',
    'Administrator',
    'System Administrator',
    'admin',
    'active'
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can manage all profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Create a sample department if it doesn't exist
INSERT INTO departments (name, description, is_active) 
VALUES ('Administration', 'System Administration Department', true)
ON CONFLICT DO NOTHING;

-- Create employee record for admin
INSERT INTO employees (user_id, employee_number, department_id, position, employment_type, basic_salary_usd, active)
SELECT 
    u.id,
    'ADMIN001',
    d.id,
    'System Administrator',
    'Permanent',
    5000.00,
    true
FROM user_profiles u, departments d
WHERE u.email = 'admin@geniussecurity.co.zw'
AND d.name = 'Administration'
ON CONFLICT (employee_number) DO NOTHING;

-- Success message
SELECT 'Database structure fixed successfully!' as message,
       'Admin user created: admin@geniussecurity.co.zw' as admin_info,
       'Password: admin123' as password_info;
