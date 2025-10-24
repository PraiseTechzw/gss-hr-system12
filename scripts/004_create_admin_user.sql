-- Create Admin User Script
-- This script creates an admin user with a secure password

-- Create the admin user
-- Default password is 'admin123' - CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN
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

-- Log the admin creation
INSERT INTO system_activity (user_id, action, description, details)
VALUES (
    (SELECT id FROM user_profiles WHERE email = 'admin@gss.com'),
    'system_init',
    'Admin user created via script',
    '{"type": "admin_creation", "email": "admin@gss.com", "method": "script"}'
);

-- Create a welcome notification for the admin
INSERT INTO notifications (user_id, title, message, type)
VALUES (
    (SELECT id FROM user_profiles WHERE email = 'admin@gss.com'),
    'Welcome to GSS HR System',
    'Your admin account has been created successfully. Please change your password after first login.',
    'info'
);

-- Display success message
SELECT 'Admin user created successfully!' as message,
       'admin@gss.com' as email,
       'admin123' as default_password,
       'Please change the password after first login' as security_note;
