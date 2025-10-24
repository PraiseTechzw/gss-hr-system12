-- Create HR User Script
-- This script creates an HR staff user

-- Create the HR user
-- Default password is 'hr123' - CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN
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

-- Log the HR user creation
INSERT INTO system_activity (user_id, action, description, details)
VALUES (
    (SELECT id FROM user_profiles WHERE email = 'admin@gss.com'),
    'user_created',
    'HR user created via script',
    '{"type": "hr_creation", "email": "hr@gss.com", "method": "script"}'
);

-- Create a welcome notification for the HR user
INSERT INTO notifications (user_id, title, message, type)
VALUES (
    (SELECT id FROM user_profiles WHERE email = 'hr@gss.com'),
    'Welcome to GSS HR System',
    'Your HR staff account has been created successfully. Please change your password after first login.',
    'info'
);

-- Display success message
SELECT 'HR user created successfully!' as message,
       'hr@gss.com' as email,
       'hr123' as default_password,
       'Please change the password after first login' as security_note;



