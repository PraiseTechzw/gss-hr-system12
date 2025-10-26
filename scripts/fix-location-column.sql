-- Fix Location Column Issue in Deployments Table
-- This script handles the transition from 'location' to 'site_location'

-- Step 1: Check current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'deployments' 
AND column_name IN ('location', 'site_location')
ORDER BY column_name;

-- Step 2: Handle the column transition
DO $$ 
BEGIN
    -- Check if 'location' column exists and 'site_location' exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deployments' AND column_name = 'location'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deployments' AND column_name = 'site_location'
    ) THEN
        -- Both columns exist - copy data from location to site_location
        UPDATE deployments 
        SET site_location = location 
        WHERE site_location IS NULL AND location IS NOT NULL;
        
        -- Make location column nullable to avoid constraint issues
        ALTER TABLE deployments ALTER COLUMN location DROP NOT NULL;
        
        RAISE NOTICE 'Copied data from location to site_location and made location nullable';
        
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deployments' AND column_name = 'location'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deployments' AND column_name = 'site_location'
    ) THEN
        -- Only 'location' exists - rename it to 'site_location'
        ALTER TABLE deployments RENAME COLUMN location TO site_location;
        
        RAISE NOTICE 'Renamed location column to site_location';
        
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deployments' AND column_name = 'location'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deployments' AND column_name = 'site_location'
    ) THEN
        -- Only 'site_location' exists - this is what we want
        RAISE NOTICE 'site_location column already exists - no action needed';
        
    ELSE
        -- Neither column exists - create site_location
        ALTER TABLE deployments ADD COLUMN site_location VARCHAR(200);
        RAISE NOTICE 'Created site_location column';
    END IF;
END $$;

-- Step 3: Ensure site_location has proper constraints
ALTER TABLE deployments 
ALTER COLUMN site_location SET NOT NULL;

-- Step 4: Update any NULL values in site_location
UPDATE deployments 
SET site_location = 'Unknown Location' 
WHERE site_location IS NULL;

-- Step 5: Add default value for future inserts
ALTER TABLE deployments 
ALTER COLUMN site_location SET DEFAULT 'Unknown Location';

-- Step 6: Verify the final structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'deployments' 
AND column_name IN ('location', 'site_location')
ORDER BY column_name;

-- Step 7: Test data integrity
SELECT 
    COUNT(*) as total_deployments,
    COUNT(site_location) as deployments_with_location,
    COUNT(*) - COUNT(site_location) as deployments_without_location
FROM deployments;

-- Step 8: Handle view dependencies before dropping location column
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deployments' AND column_name = 'location'
    ) THEN
        -- First, drop the view that depends on the location column
        DROP VIEW IF EXISTS deployment_details CASCADE;
        RAISE NOTICE 'Dropped deployment_details view to handle dependencies';
        
        -- Check if location column has any non-null values
        IF NOT EXISTS (
            SELECT 1 FROM deployments WHERE location IS NOT NULL
        ) THEN
            -- Safe to drop the old location column
            ALTER TABLE deployments DROP COLUMN location;
            RAISE NOTICE 'Dropped old location column';
        ELSE
            RAISE NOTICE 'Old location column still has data - keeping it for now';
        END IF;
        
        -- Recreate the view without the location column dependency
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
        
        RAISE NOTICE 'Recreated deployment_details view';
    END IF;
END $$;

-- Step 9: Create a function to handle future inserts properly
CREATE OR REPLACE FUNCTION handle_deployment_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure site_location is never NULL
    IF NEW.site_location IS NULL OR NEW.site_location = '' THEN
        NEW.site_location := 'Unknown Location';
    END IF;
    
    -- Copy site_location to location if location column still exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deployments' AND column_name = 'location'
    ) THEN
        NEW.location := NEW.site_location;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 10: Create trigger to handle inserts
DROP TRIGGER IF EXISTS deployment_insert_trigger ON deployments;
CREATE TRIGGER deployment_insert_trigger
    BEFORE INSERT ON deployments
    FOR EACH ROW
    EXECUTE FUNCTION handle_deployment_insert();

-- Step 11: Create trigger to handle updates
DROP TRIGGER IF EXISTS deployment_update_trigger ON deployments;
CREATE TRIGGER deployment_update_trigger
    BEFORE UPDATE ON deployments
    FOR EACH ROW
    EXECUTE FUNCTION handle_deployment_insert();

-- Step 12: Test the fix with a sample insert
-- This should work without errors now
INSERT INTO deployments (
    employee_id,
    client_name,
    site_location,
    deployment_type,
    start_date,
    status
) VALUES (
    (SELECT id FROM employees LIMIT 1),
    'Test Client',
    'Test Location',
    'temporary',
    CURRENT_DATE,
    'active'
) ON CONFLICT DO NOTHING;

-- Step 13: Clean up test data
DELETE FROM deployments 
WHERE client_name = 'Test Client' AND site_location = 'Test Location';

-- Final verification
SELECT 
    'Deployment table structure fixed' as status,
    COUNT(*) as total_deployments,
    COUNT(site_location) as deployments_with_site_location
FROM deployments;
