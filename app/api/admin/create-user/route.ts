import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log("[Admin] Creating user request received")
    
    // Use service role key for admin operations (bypasses RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_URL_SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    console.log("[Admin] Service role client created")

    const body = await request.json()
    const { 
      email, 
      password = 'TempPassword123!', 
      firstName, 
      lastName, 
      role, 
      departmentId, 
      position 
    } = body

    console.log("[Admin] Creating user:", { email, role, firstName, lastName })

    // Validate required fields
    if (!email || !firstName || !lastName || !role) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: email, firstName, lastName, role'
      }, { status: 400 })
    }

    // Validate role
    if (!['admin', 'manager', 'hr', 'employee'].includes(role)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid role. Must be: admin, manager, hr, employee'
      }, { status: 400 })
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User with this email already exists'
      }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log("[Admin] Password hashed successfully")

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('user_profiles')
      .insert({
        email: email.toLowerCase(),
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        role: role,
        department_id: departmentId || null,
        position: position || null,
        status: 'active'
      })
      .select('*')
      .single()

    if (createError) {
      console.error("[Admin] User creation error:", createError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create user: ' + createError.message
      }, { status: 500 })
    }

    console.log("[Admin] User created successfully:", newUser.email)

    // Create welcome notification
    await supabase
      .from('notifications')
      .insert({
        user_id: newUser.id,
        title: 'Account Created',
        message: `Your account has been created. Please log in with your credentials.`,
        type: 'info'
      })

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        status: newUser.status
      },
      credentials: {
        email: newUser.email,
        password: password
      }
    })

  } catch (error) {
    console.error('[Admin] Create user error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
