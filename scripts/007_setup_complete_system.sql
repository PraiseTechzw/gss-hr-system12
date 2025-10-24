-- Complete System Setup Script
-- This script sets up the entire HR system with all necessary components

-- 1. Create the complete database schema
\i scripts/001_create_complete_hr_system.sql

-- 2. Create the first admin user
\i scripts/004_create_admin_user.sql

-- 3. Create sample manager and HR users
\i scripts/005_create_manager_user.sql
\i scripts/006_create_hr_user.sql

-- 4. Add sample data
\i scripts/003_seed_sample_data.sql

-- 5. Create additional departments
INSERT INTO departments (name, description) VALUES
('Sales', 'Sales Department'),
('Customer Service', 'Customer Service Department'),
('Legal', 'Legal Department'),
('Research & Development', 'R&D Department');

-- 6. Create additional system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('system_version', '2.0', 'Current system version'),
('maintenance_mode', 'false', 'System maintenance mode'),
('max_login_attempts', '5', 'Maximum login attempts before lockout'),
('session_timeout', '480', 'Session timeout in minutes'),
('password_min_length', '6', 'Minimum password length'),
('require_password_change', 'true', 'Require password change on first login');

-- 7. Create welcome notifications for all users
INSERT INTO notifications (user_id, title, message, type)
SELECT 
    id,
    'System Setup Complete',
    'The GSS HR System has been successfully set up. You can now start using all features.',
    'success'
FROM user_profiles;

-- 8. Log system setup completion
INSERT INTO system_activity (user_id, action, description, details)
VALUES (
    (SELECT id FROM user_profiles WHERE email = 'admin@gss.com'),
    'system_setup_complete',
    'Complete HR system setup completed',
    '{"version": "2.0", "users_created": 3, "departments_created": 9, "settings_configured": 6}'
);

-- 9. Display setup summary
SELECT 
    'GSS HR System Setup Complete!' as status,
    (SELECT COUNT(*) FROM user_profiles) as total_users,
    (SELECT COUNT(*) FROM departments) as total_departments,
    (SELECT COUNT(*) FROM employees) as total_employees,
    (SELECT COUNT(*) FROM system_settings) as total_settings;

-- 10. Display login credentials
SELECT 
    'Login Credentials' as info,
    email,
    CASE 
        WHEN email = 'admin@gss.com' THEN 'admin123'
        WHEN email = 'manager@gss.com' THEN 'manager123'
        WHEN email = 'hr@gss.com' THEN 'hr123'
        ELSE 'Check with administrator'
    END as default_password,
    role,
    'Please change password after first login' as security_note
FROM user_profiles
ORDER BY role DESC;



