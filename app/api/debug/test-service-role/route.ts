import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    console.log("[DEBUG] Testing service role access...")
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_URL_SUPABASE_SERVICE_ROLE_KEY!
    
    console.log("[DEBUG] Service role key exists:", !!serviceRoleKey)
    
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    console.log("[DEBUG] Service role client created")

    // Test 1: Try to read users with service role
    console.log("[DEBUG] Testing user read with service role...")
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, email, role, status')
      .limit(5)

    console.log("[DEBUG] Users query result:", { users, usersError })

    // Test 2: Try to create a test user
    console.log("[DEBUG] Testing user creation with service role...")
    const testEmail = 'test@example.com'
    
    // First check if test user exists
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', testEmail)
      .single()

    if (existingUser) {
      console.log("[DEBUG] Test user already exists, deleting...")
      await supabase
        .from('user_profiles')
        .delete()
        .eq('email', testEmail)
    }

    const { data: newUser, error: createError } = await supabase
      .from('user_profiles')
      .insert({
        email: testEmail,
        password_hash: 'test_hash',
        first_name: 'Test',
        last_name: 'User',
        full_name: 'Test User',
        role: 'employee',
        status: 'active'
      })
      .select('id, email')
      .single()

    console.log("[DEBUG] User creation result:", { newUser, createError })

    // Clean up test user
    if (newUser) {
      await supabase
        .from('user_profiles')
        .delete()
        .eq('id', newUser.id)
      console.log("[DEBUG] Test user cleaned up")
    }

    return NextResponse.json({
      success: true,
      serviceRoleWorking: !usersError,
      canReadUsers: !usersError,
      canCreateUsers: !createError,
      users: users || [],
      errors: {
        usersError: usersError?.message,
        createError: createError?.message
      }
    })

  } catch (error) {
    console.error('[DEBUG] Service role test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Service role test failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}


