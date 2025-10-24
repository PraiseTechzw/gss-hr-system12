import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Create the generate_next_employee_id function
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })

    if (error) {
      console.error('Error creating function:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create function',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Employee ID generation function created successfully'
    })

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
