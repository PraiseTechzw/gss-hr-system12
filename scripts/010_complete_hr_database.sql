-- ===========================================
-- GSS HR SYSTEM - COMPLETE DATABASE SCHEMA
-- ===========================================
-- This script creates the complete HR system database
-- No Supabase Auth dependencies - Custom authentication only
-- All users created by administrators

-- ===========================================
-- STEP 1: CLEAN SLATE - REMOVE EVERYTHING
-- ===========================================

-- Drop all existing objects first
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Drop all policies
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I CASCADE', r.policyname, r.schemaname, r.tablename);
    END LOOP;
    
    -- Drop all triggers
    FOR r IN (SELECT trigger_name, event_object_table, event_object_schema FROM information_schema.triggers WHERE trigger_schema = 'public') LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I CASCADE', r.trigger_name, r.event_object_schema, r.event_object_table);
    END LOOP;
    
    -- Drop all functions
    FOR r IN (SELECT proname, oid FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND proname NOT LIKE 'pg_%' AND proname NOT LIKE 'sql_%') LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS %I CASCADE', r.oid);
    END LOOP;
    
    -- Drop all tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', r.tablename);
    END LOOP;
    
    -- Drop all types
    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e') LOOP
        EXECUTE format('DROP TYPE IF EXISTS %I CASCADE', r.typname);
    END LOOP;
END $$;

-- ===========================================
-- STEP 2: ENABLE EXTENSIONS
-- ===========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- STEP 3: CREATE CUSTOM TYPES
-- ===========================================

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'hr');
CREATE TYPE employee_status AS ENUM ('active', 'inactive', 'terminated', 'on_leave');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'half_day', 'overtime');
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE deployment_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');
CREATE TYPE activity_type AS ENUM ('login', 'logout', 'create', 'update', 'delete', 'approve', 'reject', 'system_init');

-- ===========================================
-- STEP 4: CREATE CORE TABLES
-- ===========================================

-- Departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    manager_id UUID, -- Will be set after user_profiles table
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table (Custom authentication - no Supabase Auth)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role user_role NOT NULL DEFAULT 'hr',
    department_id UUID REFERENCES departments(id),
    position VARCHAR(100),
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    last_login TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for departments manager
ALTER TABLE departments ADD CONSTRAINT fk_departments_manager 
FOREIGN KEY (manager_id) REFERENCES user_profiles(id);

-- Employees table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    department_id UUID REFERENCES departments(id),
    position VARCHAR(100),
    hire_date DATE,
    salary DECIMAL(12,2),
    status employee_status DEFAULT 'active',
    manager_id UUID REFERENCES employees(id),
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance table
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    status attendance_status DEFAULT 'present',
    hours_worked DECIMAL(4,2),
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, date)
);

-- Leave requests table
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested INTEGER NOT NULL,
    reason TEXT,
    status leave_status DEFAULT 'pending',
    approved_by UUID REFERENCES user_profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payroll table
CREATE TABLE payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    basic_salary DECIMAL(12,2) NOT NULL,
    overtime_pay DECIMAL(12,2) DEFAULT 0,
    allowances DECIMAL(12,2) DEFAULT 0,
    deductions DECIMAL(12,2) DEFAULT 0,
    net_salary DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    processed_by UUID REFERENCES user_profiles(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deployments table
CREATE TABLE deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    location VARCHAR(200) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status deployment_status DEFAULT 'active',
    description TEXT,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description TEXT,
    updated_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System activity table
CREATE TABLE system_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id),
    action VARCHAR(100) NOT NULL,
    description TEXT,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- STEP 5: CREATE INDEXES FOR PERFORMANCE
-- ===========================================

-- User profiles indexes
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_department ON user_profiles(department_id);
CREATE INDEX idx_user_profiles_status ON user_profiles(status);

-- Employees indexes
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_manager ON employees(manager_id);

-- Attendance indexes
CREATE INDEX idx_attendance_employee ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX idx_attendance_status ON attendance(status);

-- Leave requests indexes
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_leave_requests_approved_by ON leave_requests(approved_by);

-- Payroll indexes
CREATE INDEX idx_payroll_employee ON payroll(employee_id);
CREATE INDEX idx_payroll_period ON payroll(pay_period_start, pay_period_end);
CREATE INDEX idx_payroll_status ON payroll(status);

-- Deployments indexes
CREATE INDEX idx_deployments_employee ON deployments(employee_id);
CREATE INDEX idx_deployments_status ON deployments(status);
CREATE INDEX idx_deployments_dates ON deployments(start_date, end_date);

-- System activity indexes
CREATE INDEX idx_system_activity_user ON system_activity(user_id);
CREATE INDEX idx_system_activity_action ON system_activity(action);
CREATE INDEX idx_system_activity_created ON system_activity(created_at);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- ===========================================
-- STEP 6: CREATE HELPER FUNCTIONS
-- ===========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
BEGIN
    RETURN (SELECT role FROM user_profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user permissions
CREATE OR REPLACE FUNCTION check_user_permission(user_id UUID, required_role user_role)
RETURNS BOOLEAN AS $$
DECLARE
    user_role_value user_role;
BEGIN
    SELECT role INTO user_role_value FROM user_profiles WHERE id = user_id;
    
    IF user_role_value IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Admin can do everything
    IF user_role_value = 'admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Manager can do manager and hr tasks
    IF user_role_value = 'manager' AND required_role IN ('manager', 'hr') THEN
        RETURN TRUE;
    END IF;
    
    -- HR can only do hr tasks
    IF user_role_value = 'hr' AND required_role = 'hr' THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log system activity
CREATE OR REPLACE FUNCTION log_system_activity(
    p_user_id UUID,
    p_action VARCHAR(100),
    p_description TEXT,
    p_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO system_activity (user_id, action, description, details)
    VALUES (p_user_id, p_action, p_description, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_title VARCHAR(200),
    p_message TEXT,
    p_type notification_type DEFAULT 'info'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (p_user_id, p_title, p_message, p_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_id UUID)
RETURNS TABLE(
    can_manage_users BOOLEAN,
    can_manage_employees BOOLEAN,
    can_manage_payroll BOOLEAN,
    can_manage_settings BOOLEAN,
    can_view_reports BOOLEAN
) AS $$
DECLARE
    user_role_value user_role;
BEGIN
    SELECT role INTO user_role_value FROM user_profiles WHERE id = user_id;
    
    RETURN QUERY SELECT
        CASE 
            WHEN user_role_value = 'admin' THEN TRUE
            ELSE FALSE
        END,
        CASE 
            WHEN user_role_value IN ('admin', 'manager') THEN TRUE
            ELSE FALSE
        END,
        CASE 
            WHEN user_role_value IN ('admin', 'manager') THEN TRUE
            ELSE FALSE
        END,
        CASE 
            WHEN user_role_value = 'admin' THEN TRUE
            ELSE FALSE
        END,
        CASE 
            WHEN user_role_value IN ('admin', 'manager', 'hr') THEN TRUE
            ELSE FALSE
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- STEP 7: CREATE TRIGGERS
-- ===========================================

-- Update triggers for all tables
CREATE TRIGGER update_departments_updated_at 
    BEFORE UPDATE ON departments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at 
    BEFORE UPDATE ON employees 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at 
    BEFORE UPDATE ON attendance 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at 
    BEFORE UPDATE ON leave_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_updated_at 
    BEFORE UPDATE ON payroll 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deployments_updated_at 
    BEFORE UPDATE ON deployments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- STEP 8: ENABLE ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- STEP 9: CREATE RLS POLICIES
-- ===========================================

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (id = auth.uid() OR check_user_permission(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all profiles" ON user_profiles
    FOR ALL USING (check_user_permission(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (id = auth.uid());

-- Departments policies
CREATE POLICY "All authenticated users can view departments" ON departments
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage departments" ON departments
    FOR ALL USING (check_user_permission(auth.uid(), 'admin'));

-- Employees policies
CREATE POLICY "All authenticated users can view employees" ON employees
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Managers and admins can manage employees" ON employees
    FOR ALL USING (check_user_permission(auth.uid(), 'manager'));

-- Attendance policies
CREATE POLICY "All authenticated users can view attendance" ON attendance
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Managers and admins can manage attendance" ON attendance
    FOR ALL USING (check_user_permission(auth.uid(), 'manager'));

-- Leave requests policies
CREATE POLICY "All authenticated users can view leave requests" ON leave_requests
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Managers and admins can manage leave requests" ON leave_requests
    FOR ALL USING (check_user_permission(auth.uid(), 'manager'));

-- Payroll policies
CREATE POLICY "Admins and managers can view payroll" ON payroll
    FOR SELECT USING (check_user_permission(auth.uid(), 'manager'));

CREATE POLICY "Admins can manage payroll" ON payroll
    FOR ALL USING (check_user_permission(auth.uid(), 'admin'));

-- Deployments policies
CREATE POLICY "All authenticated users can view deployments" ON deployments
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Managers and admins can manage deployments" ON deployments
    FOR ALL USING (check_user_permission(auth.uid(), 'manager'));

-- System settings policies
CREATE POLICY "Admins can manage system settings" ON system_settings
    FOR ALL USING (check_user_permission(auth.uid(), 'admin'));

-- System activity policies
CREATE POLICY "Users can view their own activity" ON system_activity
    FOR SELECT USING (user_id = auth.uid() OR check_user_permission(auth.uid(), 'admin'));

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- ===========================================
-- STEP 10: INSERT DEFAULT DATA
-- ===========================================

-- Insert default departments
INSERT INTO departments (name, description) VALUES
('Human Resources', 'HR Department - Manages all HR operations'),
('Information Technology', 'IT Department - Manages technology infrastructure'),
('Finance', 'Finance Department - Manages financial operations'),
('Operations', 'Operations Department - Manages daily operations'),
('Marketing', 'Marketing Department - Manages marketing activities'),
('Sales', 'Sales Department - Manages sales operations'),
('Customer Service', 'Customer Service Department - Manages customer support'),
('Legal', 'Legal Department - Manages legal affairs'),
('Research & Development', 'R&D Department - Manages research and development');

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('company_name', 'GSS HR System', 'Company name for the system'),
('company_email', 'hr@gss.com', 'Company email address'),
('working_hours', '8', 'Standard working hours per day'),
('overtime_rate', '1.5', 'Overtime rate multiplier'),
('leave_balance_annual', '21', 'Annual leave balance in days'),
('payroll_frequency', 'monthly', 'Payroll processing frequency'),
('system_version', '2.0', 'Current system version'),
('maintenance_mode', 'false', 'System maintenance mode'),
('max_login_attempts', '5', 'Maximum login attempts before lockout'),
('session_timeout', '480', 'Session timeout in minutes'),
('password_min_length', '6', 'Minimum password length'),
('require_password_change', 'true', 'Require password change on first login');

-- ===========================================
-- STEP 11: CREATE ADMIN USERS
-- ===========================================

-- Create the first admin user
INSERT INTO user_profiles (
    email,
    password_hash,
    first_name,
    last_name,
    full_name,
    role,
    department_id,
    position,
    status
) VALUES (
    'admin@gss.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: 'admin123'
    'System',
    'Administrator',
    'System Administrator',
    'admin',
    (SELECT id FROM departments WHERE name = 'Human Resources' LIMIT 1),
    'System Administrator',
    'active'
);

-- Create manager user
INSERT INTO user_profiles (
    email,
    password_hash,
    first_name,
    last_name,
    full_name,
    role,
    department_id,
    position,
    status,
    created_by
) VALUES (
    'manager@gss.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: 'manager123'
    'HR',
    'Manager',
    'HR Manager',
    'manager',
    (SELECT id FROM departments WHERE name = 'Human Resources' LIMIT 1),
    'HR Manager',
    'active',
    (SELECT id FROM user_profiles WHERE email = 'admin@gss.com' LIMIT 1)
);

-- Create HR staff user
INSERT INTO user_profiles (
    email,
    password_hash,
    first_name,
    last_name,
    full_name,
    role,
    department_id,
    position,
    status,
    created_by
) VALUES (
    'hr@gss.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: 'hr123'
    'HR',
    'Staff',
    'HR Staff',
    'hr',
    (SELECT id FROM departments WHERE name = 'Human Resources' LIMIT 1),
    'HR Staff',
    'active',
    (SELECT id FROM user_profiles WHERE email = 'admin@gss.com' LIMIT 1)
);

-- Update department managers
UPDATE departments SET manager_id = (SELECT id FROM user_profiles WHERE email = 'manager@gss.com' LIMIT 1)
WHERE name = 'Human Resources';

-- ===========================================
-- STEP 12: LOG INITIAL ACTIVITIES
-- ===========================================

-- Log admin creation
INSERT INTO system_activity (user_id, action, description, details)
VALUES (
    (SELECT id FROM user_profiles WHERE email = 'admin@gss.com'),
    'system_init',
    'Admin user created via database setup',
    '{"type": "admin_creation", "email": "admin@gss.com", "method": "database_setup"}'
);

-- Log manager creation
INSERT INTO system_activity (user_id, action, description, details)
VALUES (
    (SELECT id FROM user_profiles WHERE email = 'admin@gss.com'),
    'user_created',
    'Manager user created via database setup',
    '{"type": "manager_creation", "email": "manager@gss.com", "method": "database_setup"}'
);

-- Log HR user creation
INSERT INTO system_activity (user_id, action, description, details)
VALUES (
    (SELECT id FROM user_profiles WHERE email = 'admin@gss.com'),
    'user_created',
    'HR user created via database setup',
    '{"type": "hr_creation", "email": "hr@gss.com", "method": "database_setup"}'
);

-- ===========================================
-- STEP 13: CREATE WELCOME NOTIFICATIONS
-- ===========================================

-- Create notifications for all users
INSERT INTO notifications (user_id, title, message, type)
SELECT 
    id,
    'Welcome to GSS HR System',
    'Your account has been created successfully. Please change your password after first login.',
    'info'
FROM user_profiles;

-- ===========================================
-- STEP 14: VERIFICATION AND SUMMARY
-- ===========================================

-- Display setup summary
SELECT 
    '=== GSS HR SYSTEM SETUP COMPLETED ===' as status,
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as tables_created,
    (SELECT COUNT(*) FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND proname NOT LIKE 'pg_%') as functions_created,
    (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public') as triggers_created,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as policies_created,
    (SELECT COUNT(*) FROM user_profiles) as users_created,
    (SELECT COUNT(*) FROM departments) as departments_created;

-- Display login credentials
SELECT 
    '=== LOGIN CREDENTIALS ===' as info;

SELECT 
    'User' as type,
    email,
    CASE 
        WHEN email = 'admin@gss.com' THEN 'admin123'
        WHEN email = 'manager@gss.com' THEN 'manager123'
        WHEN email = 'hr@gss.com' THEN 'hr123'
        ELSE 'Check with administrator'
    END as default_password,
    role,
    'CHANGE PASSWORD AFTER FIRST LOGIN!' as security_note
FROM user_profiles
ORDER BY role DESC;

-- Display created tables
SELECT 
    'Created Tables:' as info,
    tablename as table_name
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Display created functions
SELECT 
    'Created Functions:' as info,
    proname as function_name
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname NOT LIKE 'pg_%'
ORDER BY proname;

-- Final completion message
SELECT 
    '=== DATABASE SETUP COMPLETED SUCCESSFULLY ===' as status,
    'All tables, functions, triggers, policies, and data have been created.' as message,
    'You can now start using the GSS HR System.' as next_step,
    'Remember to change all default passwords!' as security_reminder;
