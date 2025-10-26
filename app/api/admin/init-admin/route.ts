import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log("[Admin] Initializing first admin user...")
    
    // Use service role key for admin operations (bypasses RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_URL_SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    console.log("[Admin] Service role client created")

    // Check if any users exist
    const { data: existingUsers, error: checkError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1)

    if (checkError) {
      console.error("[Admin] Error checking existing users:", checkError)
      return NextResponse.json({
        success: false,
        error: 'Failed to check existing users: ' + checkError.message
      }, { status: 500 })
    }

    if (existingUsers && existingUsers.length > 0) {
      console.log("[Admin] Users already exist, skipping initialization")
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        skip: true
      })
    }

    console.log("[Admin] No users exist, creating first admin...")

    // Create HR department first
    const { data: hrDept, error: deptError } = await supabase
      .from('departments')
      .select('id')
      .eq('name', 'Human Resources')
      .single()

    let departmentId = hrDept?.id
    if (!departmentId) {
      console.log("[Admin] Creating HR department...")
      const { data: newDept, error: createDeptError } = await supabase
        .from('departments')
        .insert({
          name: 'Human Resources',
          description: 'HR Department'
        })
        .select('id')
        .single()

      if (createDeptError) {
        console.error("[Admin] Failed to create department:", createDeptError)
        return NextResponse.json({
          success: false,
          error: 'Failed to create department: ' + createDeptError.message
        }, { status: 500 })
      }

      departmentId = newDept.id
      console.log("[Admin] HR department created with ID:", departmentId)
    }

    // Create admin user
    const email = 'admin@geniussecurity.co.zw'
    const password = 'admin123'
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log("[Admin] Password hashed successfully")

    const { data: newUser, error: userError } = await supabase
      .from('user_profiles')
      .insert({
        email: email,
        password_hash: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        full_name: 'Admin User',
        role: 'admin',
        department_id: departmentId,
        position: 'System Administrator',
        status: 'active'
      })
      .select('*')
      .single()

    if (userError) {
      console.error("[Admin] Failed to create admin user:", userError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create admin user: ' + userError.message
      }, { status: 500 })
    }

    console.log("[Admin] Admin user created successfully:", newUser.email)

    // Create system settings
    const settings = [
      { setting_key: 'company_name', setting_value: 'GSS HR System', description: 'Company name' },
      { setting_key: 'company_email', setting_value: 'hr@gss.com', description: 'Company email' },
      { setting_key: 'working_hours', setting_value: '8', description: 'Standard working hours per day' },
      { setting_key: 'overtime_rate', setting_value: '1.5', description: 'Overtime rate multiplier' }
    ]

    const { error: settingsError } = await supabase
      .from('system_settings')
      .insert(settings)

    if (settingsError) {
      console.log("[Admin] Warning: Failed to create settings:", settingsError.message)
    } else {
      console.log("[Admin] System settings created successfully")
    }

    // Create welcome notification
    await supabase
      .from('notifications')
      .insert({
        user_id: newUser.id,
        title: 'Welcome to GSS HR System',
        message: 'Your admin account has been created successfully. You can now manage users and system settings.',
        type: 'info'
      })

    return NextResponse.json({
      success: true,
      message: 'Admin user initialized successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        status: newUser.status
      },
      credentials: {
        email: email,
        password: password
      }
    })

  } catch (error) {
    console.error('[Admin] Initialize admin error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}



