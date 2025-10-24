-- Create Manager User Script
-- This script creates a manager user

-- Create the manager user
-- Default password is 'manager123' - CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN
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

-- Log the manager creation
INSERT INTO system_activity (user_id, action, description, details)
VALUES (
    (SELECT id FROM user_profiles WHERE email = 'admin@gss.com'),
    'user_created',
    'Manager user created via script',
    '{"type": "manager_creation", "email": "manager@gss.com", "method": "script"}'
);

-- Create a welcome notification for the manager
INSERT INTO notifications (user_id, title, message, type)
VALUES (
    (SELECT id FROM user_profiles WHERE email = 'manager@gss.com'),
    'Welcome to GSS HR System',
    'Your manager account has been created successfully. Please change your password after first login.',
    'info'
);

-- Display success message
SELECT 'Manager user created successfully!' as message,
       'manager@gss.com' as email,
       'manager123' as default_password,
       'Please change the password after first login' as security_note;
