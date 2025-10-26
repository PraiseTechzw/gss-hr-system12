import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log("[DEBUG] Checking database connection...")
    const supabase = await createClient()
    
    // Check if user_profiles table exists
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)

    console.log("[DEBUG] User profiles query result:", { users, usersError })

    // Check if departments table exists
    const { data: depts, error: deptsError } = await supabase
      .from('departments')
      .select('count')
      .limit(1)

    console.log("[DEBUG] Departments query result:", { depts, deptsError })

    // Try to get all users
    const { data: allUsers, error: allUsersError } = await supabase
      .from('user_profiles')
      .select('id, email, role, status')
      .limit(10)

    console.log("[DEBUG] All users query result:", { allUsers, allUsersError })

    return NextResponse.json({
      success: true,
      database: {
        user_profiles: {
          exists: !usersError,
          error: usersError?.message,
          count: users?.length || 0
        },
        departments: {
          exists: !deptsError,
          error: deptsError?.message,
          count: depts?.length || 0
        },
        users: allUsers || [],
        usersError: allUsersError?.message
      }
    })

  } catch (error) {
    console.error('[DEBUG] Database check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database check failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}



