-- Update Deployments Table Schema
-- This script adds missing columns to the existing deployments table

-- Add missing columns one by one to avoid conflicts

-- Add client_name column
ALTER TABLE deployments 
ADD COLUMN IF NOT EXISTS client_name VARCHAR(200);

-- Add site_location column (this is the one causing the error)
ALTER TABLE deployments 
ADD COLUMN IF NOT EXISTS site_location VARCHAR(200);

-- Add deployment_type column
ALTER TABLE deployments 
ADD COLUMN IF NOT EXISTS deployment_type VARCHAR(50) DEFAULT 'permanent';

-- Add time fields
ALTER TABLE deployments 
ADD COLUMN IF NOT EXISTS start_time TIME DEFAULT '08:00:00';

ALTER TABLE deployments 
ADD COLUMN IF NOT EXISTS end_time TIME DEFAULT '17:00:00';

-- Add shift_timing column for JSON data
ALTER TABLE deployments 
ADD COLUMN IF NOT EXISTS shift_timing TEXT;

-- Add compensation fields
ALTER TABLE deployments 
ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(12,2);

ALTER TABLE deployments 
ADD COLUMN IF NOT EXISTS monthly_salary DECIMAL(12,2);

-- Add contact information
ALTER TABLE deployments 
ADD COLUMN IF NOT EXISTS contact_person VARCHAR(200);

ALTER TABLE deployments 
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);

-- Add location details
ALTER TABLE deployments 
ADD COLUMN IF NOT EXISTS site_address TEXT;

-- Add additional information
ALTER TABLE deployments 
ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE deployments 
ADD COLUMN IF NOT EXISTS special_requirements TEXT;

-- Add created_by field
ALTER TABLE deployments 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES user_profiles(id);

-- Update existing records to have default values where needed
UPDATE deployments 
SET 
    client_name = COALESCE(client_name, 'Unknown Client'),
    site_location = COALESCE(site_location, location),
    deployment_type = COALESCE(deployment_type, 'permanent'),
    start_time = COALESCE(start_time, '08:00:00'),
    end_time = COALESCE(end_time, '17:00:00')
WHERE 
    client_name IS NULL 
    OR site_location IS NULL 
    OR deployment_type IS NULL 
    OR start_time IS NULL 
    OR end_time IS NULL;

-- Add constraints for data validation
DO $$ 
BEGIN
    -- Add date constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_deployments_dates' AND table_name = 'deployments'
    ) THEN
        ALTER TABLE deployments ADD CONSTRAINT chk_deployments_dates 
        CHECK (end_date IS NULL OR end_date >= start_date);
    END IF;
    
    -- Add time constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_deployments_times' AND table_name = 'deployments'
    ) THEN
        ALTER TABLE deployments ADD CONSTRAINT chk_deployments_times 
        CHECK (end_time IS NULL OR end_time > start_time);
    END IF;
    
    -- Add compensation constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_deployments_compensation' AND table_name = 'deployments'
    ) THEN
        ALTER TABLE deployments ADD CONSTRAINT chk_deployments_compensation 
        CHECK (
            (daily_rate IS NOT NULL AND daily_rate > 0) OR 
            (monthly_salary IS NOT NULL AND monthly_salary > 0) OR
            (daily_rate IS NULL AND monthly_salary IS NULL)
        );
    END IF;
    
    -- Add type constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_deployments_type' AND table_name = 'deployments'
    ) THEN
        ALTER TABLE deployments ADD CONSTRAINT chk_deployments_type 
        CHECK (deployment_type IN ('permanent', 'temporary', 'contract', 'emergency'));
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deployments_client_name ON deployments(client_name);
CREATE INDEX IF NOT EXISTS idx_deployments_site_location ON deployments(site_location);
CREATE INDEX IF NOT EXISTS idx_deployments_deployment_type ON deployments(deployment_type);
CREATE INDEX IF NOT EXISTS idx_deployments_start_time ON deployments(start_time);
CREATE INDEX IF NOT EXISTS idx_deployments_end_time ON deployments(end_time);
CREATE INDEX IF NOT EXISTS idx_deployments_daily_rate ON deployments(daily_rate);
CREATE INDEX IF NOT EXISTS idx_deployments_monthly_salary ON deployments(monthly_salary);

-- Update the existing location column to site_location if it exists
DO $$ 
BEGIN
    -- Check if 'location' column exists and 'site_location' is empty
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deployments' AND column_name = 'location'
    ) THEN
        -- Copy data from location to site_location for existing records
        UPDATE deployments 
        SET site_location = location 
        WHERE site_location IS NULL AND location IS NOT NULL;
    END IF;
END $$;

-- Create or update the view for deployment details
CREATE OR REPLACE VIEW deployment_details AS
SELECT 
    d.*,
    e.employee_id as emp_id,
    e.first_name,
    e.last_name,
    e.email,
    e.job_title,
    e.department_id,
    dep.name as department_name,
    up.first_name as created_by_first_name,
    up.last_name as created_by_last_name
FROM deployments d
LEFT JOIN employees e ON d.employee_id = e.id
LEFT JOIN departments dep ON e.department_id = dep.id
LEFT JOIN user_profiles up ON d.created_by = up.id;

-- Add comments for documentation
COMMENT ON COLUMN deployments.client_name IS 'Name of the client company';
COMMENT ON COLUMN deployments.site_location IS 'Specific location/site where employee is deployed';
COMMENT ON COLUMN deployments.deployment_type IS 'Type of deployment: permanent, temporary, contract, or emergency';
COMMENT ON COLUMN deployments.start_time IS 'Start time for the deployment';
COMMENT ON COLUMN deployments.end_time IS 'End time for the deployment';
COMMENT ON COLUMN deployments.shift_timing IS 'JSON string containing detailed shift patterns';
COMMENT ON COLUMN deployments.daily_rate IS 'Daily compensation rate for temporary/contract deployments';
COMMENT ON COLUMN deployments.monthly_salary IS 'Monthly salary for permanent deployments';
COMMENT ON COLUMN deployments.contact_person IS 'Contact person at the deployment site';
COMMENT ON COLUMN deployments.contact_phone IS 'Phone number of the contact person';
COMMENT ON COLUMN deployments.site_address IS 'Full address of the deployment site';
COMMENT ON COLUMN deployments.notes IS 'Additional notes about the deployment';
COMMENT ON COLUMN deployments.special_requirements IS 'Special requirements for the deployment';

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'deployments' 
ORDER BY ordinal_position;
