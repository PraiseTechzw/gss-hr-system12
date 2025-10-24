import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log("[DEBUG] Simple admin creation...")
    const supabase = await createClient()
    
    // First, let's see what's in the database
    console.log("[DEBUG] Checking existing users...")
    const { data: existingUsers, error: listError } = await supabase
      .from('user_profiles')
      .select('id, email, role, status')
    
    console.log("[DEBUG] Existing users:", existingUsers)
    console.log("[DEBUG] List error:", listError)

    // Check if our target user exists
    const { data: targetUser, error: targetError } = await supabase
      .from('user_profiles')
      .select('id, email, role, status')
      .eq('email', 'admin@geniussecurity.co.zw')
      .single()

    console.log("[DEBUG] Target user query:", { targetUser, targetError })

    if (targetUser) {
      return NextResponse.json({
        success: true,
        message: 'User already exists',
        user: targetUser
      })
    }

    // Create the user
    const password = 'admin123'
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log("[DEBUG] Password hashed, creating user...")

    const { data: newUser, error: createError } = await supabase
      .from('user_profiles')
      .insert({
        email: 'admin@geniussecurity.co.zw',
        password_hash: hashedPassword,
        first_name: 'Admin',
        last_name: 'User', 
        full_name: 'Admin User',
        role: 'admin',
        position: 'System Administrator',
        status: 'active'
      })
      .select('id, email, role, status')
      .single()

    console.log("[DEBUG] Create result:", { newUser, createError })

    if (createError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create user: ' + createError.message,
        details: createError
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: newUser,
      credentials: {
        email: 'admin@geniussecurity.co.zw',
        password: 'admin123'
      }
    })

  } catch (error) {
    console.error('[DEBUG] Simple create admin error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
