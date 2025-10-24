-- Enhance Employees Table
-- This script adds all the missing fields to the employees table to match the form requirements

-- Add missing columns to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS job_title VARCHAR(100),
ADD COLUMN IF NOT EXISTS employment_status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS account_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS nostro_account_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS zwl_account_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS branch_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS pan_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS aadhar_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(50);

-- Update existing records to set employment_status from status
UPDATE employees 
SET employment_status = status::text 
WHERE employment_status IS NULL;

-- Update existing records to set job_title from position
UPDATE employees 
SET job_title = position 
WHERE job_title IS NULL;

-- Update existing records to set department from department_id
UPDATE employees 
SET department = d.name
FROM departments d
WHERE employees.department_id = d.id 
AND employees.department IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_employees_employment_status ON employees(employment_status);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_job_title ON employees(job_title);
