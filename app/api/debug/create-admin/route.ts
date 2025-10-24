import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log("[DEBUG] Creating admin user...")
    const supabase = await createClient()
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('id, email')
      .eq('email', 'admin@geniussecurity.co.zw')
      .single()

    if (existingUser) {
      console.log("[DEBUG] User already exists:", existingUser.email)
      return NextResponse.json({
        success: true,
        message: 'User already exists',
        user: existingUser
      })
    }

    // Hash password
    const password = 'admin123'
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log("[DEBUG] Password hashed successfully")

    // Get HR department ID
    const { data: hrDept } = await supabase
      .from('departments')
      .select('id')
      .eq('name', 'Human Resources')
      .single()

    if (!hrDept) {
      console.log("[DEBUG] HR department not found, creating it...")
      const { data: newDept } = await supabase
        .from('departments')
        .insert({
          name: 'Human Resources',
          description: 'HR Department'
        })
        .select('id')
        .single()
      
      if (!newDept) {
        throw new Error('Failed to create HR department')
      }
    }

    // Create admin user
    const { data: newUser, error: createError } = await supabase
      .from('user_profiles')
      .insert({
        email: 'admin@geniussecurity.co.zw',
        password_hash: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        full_name: 'Admin User',
        role: 'admin',
        department_id: hrDept?.id,
        position: 'System Administrator',
        status: 'active'
      })
      .select('*')
      .single()

    if (createError) {
      console.error("[DEBUG] User creation error:", createError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create user: ' + createError.message
      }, { status: 500 })
    }

    console.log("[DEBUG] Admin user created successfully:", newUser.email)
    
    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status
      },
      credentials: {
        email: 'admin@geniussecurity.co.zw',
        password: 'admin123'
      }
    })

  } catch (error) {
    console.error('[DEBUG] Create admin error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
