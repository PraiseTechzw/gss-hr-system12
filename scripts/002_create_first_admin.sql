-- Create First Admin User
-- This script creates the initial admin user for the system

-- Create the first admin user
-- Replace the values below with your actual admin details
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
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: 'password'
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
    'First admin user created',
    '{"type": "admin_creation", "email": "admin@gss.com"}'
);

-- Create a notification for the admin
INSERT INTO notifications (user_id, title, message, type)
VALUES (
    (SELECT id FROM user_profiles WHERE email = 'admin@gss.com'),
    'Welcome to GSS HR System',
    'Your admin account has been created successfully. Please change your password after first login.',
    'info'
);
