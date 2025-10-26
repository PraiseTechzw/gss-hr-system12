import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log("[DEBUG] Force initializing database...")
    
    // Try with anon key first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, anonKey)
    console.log("[DEBUG] Using anon key client")

    // First, let's try to disable RLS temporarily or create with anon key
    console.log("[DEBUG] Attempting to create admin user with anon key...")
    
    const email = 'admin@geniussecurity.co.zw'
    const password = 'admin123'
    const hashedPassword = await bcrypt.hash(password, 12)

    // Try to create user directly
    const { data: newUser, error: userError } = await supabase
      .from('user_profiles')
      .insert({
        email: email,
        password_hash: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        full_name: 'Admin User',
        role: 'admin',
        position: 'System Administrator',
        status: 'active'
      })
      .select('*')
      .single()

    if (userError) {
      console.error("[DEBUG] Failed to create user with anon key:", userError)
      
      // If RLS is blocking, let's try a different approach
      return NextResponse.json({
        success: false,
        error: 'Failed to create user: ' + userError.message,
        details: userError,
        suggestion: 'RLS policies are blocking user creation. You may need to disable RLS temporarily or use service role key.'
      }, { status: 500 })
    }

    console.log("[DEBUG] Admin user created successfully:", newUser.email)

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
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
    console.error('[DEBUG] Force init error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}



