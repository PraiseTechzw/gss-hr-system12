import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log("[DEBUG] Initializing database...")
    const supabase = await createClient()
    
    // Step 1: Create HR department if it doesn't exist
    console.log("[DEBUG] Creating HR department...")
    const { data: hrDept, error: deptError } = await supabase
      .from('departments')
      .select('id')
      .eq('name', 'Human Resources')
      .single()

    let departmentId = hrDept?.id

    if (!hrDept) {
      console.log("[DEBUG] HR department not found, creating...")
      const { data: newDept, error: createDeptError } = await supabase
        .from('departments')
        .insert({
          name: 'Human Resources',
          description: 'HR Department'
        })
        .select('id')
        .single()

      if (createDeptError) {
        console.error("[DEBUG] Failed to create department:", createDeptError)
        return NextResponse.json({
          success: false,
          error: 'Failed to create department: ' + createDeptError.message
        }, { status: 500 })
      }

      departmentId = newDept.id
      console.log("[DEBUG] HR department created with ID:", departmentId)
    } else {
      console.log("[DEBUG] HR department found with ID:", departmentId)
    }

    // Step 2: Create admin user
    console.log("[DEBUG] Creating admin user...")
    const password = 'admin123'
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log("[DEBUG] Password hashed successfully")

    const { data: newUser, error: userError } = await supabase
      .from('user_profiles')
      .insert({
        email: 'admin@geniussecurity.co.zw',
        password_hash: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        full_name: 'Admin User',
        role: 'admin',
        department_id: departmentId,
        position: 'System Administrator',
        status: 'active'
      })
      .select('id, email, role, status')
      .single()

    if (userError) {
      console.error("[DEBUG] Failed to create user:", userError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create user: ' + userError.message,
        details: userError
      }, { status: 500 })
    }

    console.log("[DEBUG] Admin user created successfully:", newUser)

    // Step 3: Create system settings
    console.log("[DEBUG] Creating system settings...")
    const settings = [
      { setting_key: 'company_name', setting_value: 'GSS HR System', description: 'Company name' },
      { setting_key: 'company_email', setting_value: 'hr@gss.com', description: 'Company email' },
      { setting_key: 'working_hours', setting_value: '8', description: 'Standard working hours per day' }
    ]

    const { error: settingsError } = await supabase
      .from('system_settings')
      .insert(settings)

    if (settingsError) {
      console.log("[DEBUG] Warning: Failed to create settings:", settingsError.message)
    } else {
      console.log("[DEBUG] System settings created successfully")
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      user: newUser,
      department: { id: departmentId, name: 'Human Resources' },
      credentials: {
        email: 'admin@geniussecurity.co.zw',
        password: 'admin123'
      }
    })

  } catch (error) {
    console.error('[DEBUG] Database initialization error:', error)
    return NextResponse.json({
      success: false,
      error: 'Initialization failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
