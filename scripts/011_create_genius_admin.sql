-- Create Genius Security Admin User
-- This script creates an admin user for Genius Security

-- Create the admin user for Genius Security
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
    'admin@geniussecurity.co.zw',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: 'admin123'
    'Admin',
    'User',
    'Admin User',
    'admin',
    (SELECT id FROM departments WHERE name = 'Human Resources' LIMIT 1),
    'System Administrator',
    'active'
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    status = 'active';

-- Log the admin creation
INSERT INTO system_activity (user_id, action, description, details)
VALUES (
    (SELECT id FROM user_profiles WHERE email = 'admin@geniussecurity.co.zw'),
    'system_init',
    'Genius Security admin user created',
    '{"type": "admin_creation", "email": "admin@geniussecurity.co.zw"}'
);

-- Create a welcome notification for the admin
INSERT INTO notifications (user_id, title, message, type)
VALUES (
    (SELECT id FROM user_profiles WHERE email = 'admin@geniussecurity.co.zw'),
    'Welcome to GSS HR System',
    'Your admin account has been created successfully. Please change your password after first login.',
    'info'
);

-- Display success message
SELECT 'Genius Security admin user created successfully!' as message,
       'admin@geniussecurity.co.zw' as email,
       'admin123' as default_password,
       'Please change the password after first login' as security_note;
