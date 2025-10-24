-- Create Employee ID Generation Function
-- This script creates the missing generate_next_employee_id function

-- Function to generate the next employee ID
CREATE OR REPLACE FUNCTION generate_next_employee_id()
RETURNS TEXT AS $$
DECLARE
    next_id TEXT;
    max_num INTEGER;
BEGIN
    -- Get the highest numeric part from existing employee IDs
    SELECT COALESCE(MAX(
        CASE 
            WHEN employee_id ~ '^EMP[0-9]+$' 
            THEN CAST(SUBSTRING(employee_id FROM 4) AS INTEGER)
            ELSE 0
        END
    ), 0) + 1
    INTO max_num
    FROM employees
    WHERE employee_id ~ '^EMP[0-9]+$';
    
    -- Format as EMP followed by zero-padded number
    next_id := 'EMP' || LPAD(max_num::TEXT, 4, '0');
    
    RETURN next_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION generate_next_employee_id() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_next_employee_id() TO anon;
