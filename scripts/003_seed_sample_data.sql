-- Seed Sample Data
-- This script creates sample data for testing the system

-- Create sample employees
INSERT INTO employees (employee_id, first_name, last_name, full_name, email, phone, department_id, position, hire_date, salary, status, created_by)
SELECT 
    'EMP' || LPAD(ROW_NUMBER() OVER()::text, 4, '0'),
    first_names.first_name,
    last_names.last_name,
    first_names.first_name || ' ' || last_names.last_name,
    LOWER(first_names.first_name) || '.' || LOWER(last_names.last_name) || '@gss.com',
    '+1-555-' || LPAD((RANDOM() * 9999)::int::text, 4, '0'),
    d.id,
    positions.position,
    CURRENT_DATE - INTERVAL '1 year' - (RANDOM() * 365)::int * INTERVAL '1 day',
    50000 + (RANDOM() * 50000),
    'active',
    (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)
FROM 
    (VALUES 
        ('John'), ('Jane'), ('Michael'), ('Sarah'), ('David'), 
        ('Lisa'), ('Robert'), ('Emily'), ('James'), ('Jessica'),
        ('William'), ('Ashley'), ('Richard'), ('Amanda'), ('Charles')
    ) AS first_names(first_name),
    (VALUES 
        ('Smith'), ('Johnson'), ('Williams'), ('Brown'), ('Jones'),
        ('Garcia'), ('Miller'), ('Davis'), ('Rodriguez'), ('Martinez'),
        ('Hernandez'), ('Lopez'), ('Gonzalez'), ('Wilson'), ('Anderson')
    ) AS last_names(last_name),
    (VALUES 
        ('HR Manager'), ('HR Specialist'), ('HR Coordinator'), ('HR Assistant'),
        ('IT Manager'), ('Software Developer'), ('System Administrator'),
        ('Finance Manager'), ('Accountant'), ('Financial Analyst'),
        ('Operations Manager'), ('Operations Coordinator'),
        ('Marketing Manager'), ('Marketing Specialist')
    ) AS positions(position),
    departments d
WHERE d.name IN ('Human Resources', 'Information Technology', 'Finance', 'Operations', 'Marketing')
LIMIT 50;

-- Create sample attendance records for the last 30 days
INSERT INTO attendance (employee_id, date, check_in, check_out, status, hours_worked, created_by)
SELECT 
    e.id,
    CURRENT_DATE - (s.day_offset * INTERVAL '1 day'),
    '09:00:00'::time + (RANDOM() * 30)::int * INTERVAL '1 minute',
    '17:00:00'::time + (RANDOM() * 60)::int * INTERVAL '1 minute',
    CASE 
        WHEN RANDOM() < 0.1 THEN 'late'
        WHEN RANDOM() < 0.05 THEN 'absent'
        ELSE 'present'
    END::attendance_status,
    8.0 + (RANDOM() - 0.5) * 2.0,
    (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)
FROM 
    employees e,
    generate_series(0, 29) AS s(day_offset)
WHERE e.status = 'active'
AND EXTRACT(DOW FROM CURRENT_DATE - (s.day_offset * INTERVAL '1 day')) BETWEEN 1 AND 5; -- Only weekdays

-- Create sample leave requests
INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, days_requested, reason, status, created_by)
SELECT 
    e.id,
    leave_types.leave_type,
    CURRENT_DATE + (RANDOM() * 30)::int * INTERVAL '1 day',
    CURRENT_DATE + (RANDOM() * 30)::int * INTERVAL '1 day' + (RANDOM() * 5)::int * INTERVAL '1 day',
    (RANDOM() * 5)::int + 1,
    'Personal reasons',
    CASE 
        WHEN RANDOM() < 0.3 THEN 'approved'
        WHEN RANDOM() < 0.1 THEN 'rejected'
        ELSE 'pending'
    END::leave_status,
    (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)
FROM 
    employees e,
    (VALUES 
        ('Annual Leave'), ('Sick Leave'), ('Personal Leave'), 
        ('Maternity Leave'), ('Paternity Leave')
    ) AS leave_types(leave_type)
WHERE e.status = 'active'
LIMIT 20;

-- Create sample payroll records
INSERT INTO payroll (employee_id, pay_period_start, pay_period_end, basic_salary, overtime_pay, allowances, deductions, net_salary, status, processed_by)
SELECT 
    e.id,
    DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::date,
    (DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') + INTERVAL '1 month' - INTERVAL '1 day')::date,
    e.salary,
    (RANDOM() * 1000)::decimal(12,2),
    (RANDOM() * 500)::decimal(12,2),
    (RANDOM() * 200)::decimal(12,2),
    e.salary + (RANDOM() * 1000)::decimal(12,2) + (RANDOM() * 500)::decimal(12,2) - (RANDOM() * 200)::decimal(12,2),
    'processed',
    (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)
FROM employees e
WHERE e.status = 'active'
LIMIT 30;

-- Create sample deployments
INSERT INTO deployments (employee_id, location, start_date, end_date, status, description, created_by)
SELECT 
    e.id,
    locations.location,
    CURRENT_DATE - (RANDOM() * 90)::int * INTERVAL '1 day',
    CASE 
        WHEN RANDOM() < 0.7 THEN CURRENT_DATE + (RANDOM() * 30)::int * INTERVAL '1 day'
        ELSE NULL
    END,
    CASE 
        WHEN RANDOM() < 0.8 THEN 'active'
        ELSE 'completed'
    END::deployment_status,
    'Business deployment',
    (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)
FROM 
    employees e,
    (VALUES 
        ('New York Office'), ('Los Angeles Branch'), ('Chicago Office'),
        ('Houston Office'), ('Phoenix Office'), ('Philadelphia Office'),
        ('San Antonio Office'), ('San Diego Office'), ('Dallas Office'),
        ('San Jose Office')
    ) AS locations(location)
WHERE e.status = 'active'
LIMIT 15;

-- Create sample notifications
INSERT INTO notifications (user_id, title, message, type)
SELECT 
    up.id,
    notification_titles.title,
    notification_messages.message,
    notification_types.type
FROM 
    user_profiles up,
    (VALUES 
        ('Welcome to GSS HR System'),
        ('New Employee Added'),
        ('Leave Request Pending'),
        ('Payroll Processed'),
        ('System Update Available')
    ) AS notification_titles(title),
    (VALUES 
        ('Welcome to the GSS HR System. Please explore the features available to you.'),
        ('A new employee has been added to your department.'),
        ('You have a new leave request that requires your attention.'),
        ('The monthly payroll has been processed successfully.'),
        ('A new system update is available. Please check the admin panel for details.')
    ) AS notification_messages(message),
    (VALUES 
        ('info'), ('success'), ('warning'), ('info'), ('info')
    ) AS notification_types(type)
LIMIT 25;
