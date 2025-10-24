-- Test Employee Functionality
-- This script tests the employee system to ensure everything is working

-- Test 1: Check if the generate_next_employee_id function exists and works
SELECT generate_next_employee_id() as next_employee_id;

-- Test 2: Check if employees table has all required columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'employees' 
ORDER BY ordinal_position;

-- Test 3: Insert a test employee to verify the system works
INSERT INTO employees (
    employee_id,
    first_name,
    last_name,
    full_name,
    email,
    phone,
    job_title,
    employment_status,
    department,
    hire_date,
    status,
    position
) VALUES (
    'TEST001',
    'Test',
    'Employee',
    'Test Employee',
    'test.employee@company.com',
    '+263 77 123 4567',
    'Test Position',
    'active',
    'Test Department',
    CURRENT_DATE,
    'active',
    'Test Position'
) ON CONFLICT (employee_id) DO NOTHING;

-- Test 4: Verify the test employee was created
SELECT 
    employee_id,
    first_name,
    last_name,
    job_title,
    employment_status,
    department,
    status,
    position
FROM employees 
WHERE employee_id = 'TEST001';

-- Test 5: Test the generate_next_employee_id function again
SELECT generate_next_employee_id() as next_employee_id_after_insert;

-- Test 6: Check if we can update an employee
UPDATE employees 
SET 
    job_title = 'Updated Test Position',
    employment_status = 'inactive',
    department = 'Updated Test Department'
WHERE employee_id = 'TEST001';

-- Test 7: Verify the update worked
SELECT 
    employee_id,
    job_title,
    employment_status,
    department
FROM employees 
WHERE employee_id = 'TEST001';

-- Test 8: Clean up test data
DELETE FROM employees WHERE employee_id = 'TEST001';

-- Test 9: Verify cleanup
SELECT COUNT(*) as remaining_test_employees 
FROM employees 
WHERE employee_id = 'TEST001';

-- Test 10: Final test of generate_next_employee_id
SELECT generate_next_employee_id() as final_next_employee_id;
