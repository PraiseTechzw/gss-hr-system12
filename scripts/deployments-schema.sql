-- Enhanced Deployments Table Schema
-- This script creates/updates the deployments table to support all form fields

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types if they don't exist
DO $$ BEGIN
    CREATE TYPE deployment_status AS ENUM ('active', 'completed', 'cancelled', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create deployments table with all form fields
CREATE TABLE IF NOT EXISTS deployments (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Employee reference
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    
    -- Basic Information
    client_name VARCHAR(200) NOT NULL,
    site_location VARCHAR(200) NOT NULL,
    deployment_type VARCHAR(50) NOT NULL DEFAULT 'permanent',
    
    -- Schedule Information
    start_date DATE NOT NULL,
    start_time TIME DEFAULT '08:00:00',
    end_date DATE,
    end_time TIME DEFAULT '17:00:00',
    
    -- Shift Timing (JSON format for complex shift patterns)
    shift_timing TEXT, -- JSON string containing shift details
    
    -- Compensation
    daily_rate DECIMAL(12,2),
    monthly_salary DECIMAL(12,2),
    
    -- Status and Management
    status deployment_status DEFAULT 'pending',
    
    -- Contact Information
    contact_person VARCHAR(200),
    contact_phone VARCHAR(20),
    
    -- Location Details
    site_address TEXT,
    
    -- Additional Information
    notes TEXT,
    special_requirements TEXT,
    
    -- Audit fields
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deployments_employee_id ON deployments(employee_id);
CREATE INDEX IF NOT EXISTS idx_deployments_client_name ON deployments(client_name);
CREATE INDEX IF NOT EXISTS idx_deployments_site_location ON deployments(site_location);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
CREATE INDEX IF NOT EXISTS idx_deployments_start_date ON deployments(start_date);
CREATE INDEX IF NOT EXISTS idx_deployments_end_date ON deployments(end_date);
CREATE INDEX IF NOT EXISTS idx_deployments_deployment_type ON deployments(deployment_type);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_deployments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_deployments_updated_at ON deployments;
CREATE TRIGGER update_deployments_updated_at
    BEFORE UPDATE ON deployments
    FOR EACH ROW
    EXECUTE FUNCTION update_deployments_updated_at();

-- Add constraints for data validation
ALTER TABLE deployments 
ADD CONSTRAINT chk_deployments_dates 
CHECK (end_date IS NULL OR end_date >= start_date);

ALTER TABLE deployments 
ADD CONSTRAINT chk_deployments_times 
CHECK (end_time IS NULL OR end_time > start_time);

ALTER TABLE deployments 
ADD CONSTRAINT chk_deployments_compensation 
CHECK (
    (daily_rate IS NOT NULL AND daily_rate > 0) OR 
    (monthly_salary IS NOT NULL AND monthly_salary > 0)
);

ALTER TABLE deployments 
ADD CONSTRAINT chk_deployments_type 
CHECK (deployment_type IN ('permanent', 'temporary', 'contract', 'emergency'));

-- Insert sample data (optional)
INSERT INTO deployments (
    employee_id,
    client_name,
    site_location,
    deployment_type,
    start_date,
    start_time,
    end_date,
    end_time,
    shift_timing,
    daily_rate,
    monthly_salary,
    status,
    contact_person,
    contact_phone,
    site_address,
    notes,
    special_requirements,
    created_by
) VALUES (
    (SELECT id FROM employees LIMIT 1), -- Replace with actual employee ID
    'ABC Security Company',
    'Harare CBD Office Complex',
    'permanent',
    CURRENT_DATE,
    '08:00:00',
    NULL,
    '17:00:00',
    '[
        {
            "id": "shift-1",
            "day": "monday",
            "startTime": "08:00",
            "endTime": "17:00",
            "shiftType": "day",
            "isActive": true
        },
        {
            "id": "shift-2",
            "day": "tuesday",
            "startTime": "08:00",
            "endTime": "17:00",
            "shiftType": "day",
            "isActive": true
        },
        {
            "id": "shift-3",
            "day": "wednesday",
            "startTime": "08:00",
            "endTime": "17:00",
            "shiftType": "day",
            "isActive": true
        },
        {
            "id": "shift-4",
            "day": "thursday",
            "startTime": "08:00",
            "endTime": "17:00",
            "shiftType": "day",
            "isActive": true
        },
        {
            "id": "shift-5",
            "day": "friday",
            "startTime": "08:00",
            "endTime": "17:00",
            "shiftType": "day",
            "isActive": true
        }
    ]',
    150.00,
    NULL,
    'active',
    'John Smith',
    '+263 77 123 4567',
    '123 Main Street, Harare CBD, Zimbabwe',
    'Standard security deployment for office complex',
    'Must have valid security clearance',
    (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1) -- Replace with actual admin user ID
) ON CONFLICT DO NOTHING;

-- Create view for deployment details with employee information
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

-- Create function to get deployment statistics
CREATE OR REPLACE FUNCTION get_deployment_stats()
RETURNS TABLE (
    total_deployments BIGINT,
    active_deployments BIGINT,
    completed_deployments BIGINT,
    pending_deployments BIGINT,
    cancelled_deployments BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_deployments,
        COUNT(*) FILTER (WHERE status = 'active') as active_deployments,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_deployments,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_deployments,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_deployments
    FROM deployments;
END;
$$ LANGUAGE plpgsql;

-- Create function to get deployments by employee
CREATE OR REPLACE FUNCTION get_employee_deployments(emp_id UUID)
RETURNS TABLE (
    deployment_id UUID,
    client_name VARCHAR(200),
    site_location VARCHAR(200),
    deployment_type VARCHAR(50),
    start_date DATE,
    end_date DATE,
    status deployment_status,
    daily_rate DECIMAL(12,2),
    monthly_salary DECIMAL(12,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.client_name,
        d.site_location,
        d.deployment_type,
        d.start_date,
        d.end_date,
        d.status,
        d.daily_rate,
        d.monthly_salary
    FROM deployments d
    WHERE d.employee_id = emp_id
    ORDER BY d.start_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON deployments TO your_app_user;
-- GRANT SELECT ON deployment_details TO your_app_user;
-- GRANT EXECUTE ON FUNCTION get_deployment_stats() TO your_app_user;
-- GRANT EXECUTE ON FUNCTION get_employee_deployments(UUID) TO your_app_user;

-- Comments for documentation
COMMENT ON TABLE deployments IS 'Stores employee deployment assignments with comprehensive scheduling and compensation details';
COMMENT ON COLUMN deployments.shift_timing IS 'JSON string containing detailed shift patterns with days, times, and break periods';
COMMENT ON COLUMN deployments.daily_rate IS 'Daily compensation rate for temporary/contract deployments';
COMMENT ON COLUMN deployments.monthly_salary IS 'Monthly salary for permanent deployments';
COMMENT ON COLUMN deployments.deployment_type IS 'Type of deployment: permanent, temporary, contract, or emergency';
COMMENT ON COLUMN deployments.status IS 'Current status of the deployment: pending, active, completed, or cancelled';
