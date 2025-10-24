import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log("[DEBUG] Testing database...")
    const supabase = await createClient()
    
    // Test 1: Simple query
    console.log("[DEBUG] Test 1: Simple select...")
    const { data: test1, error: error1 } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(5)

    console.log("[DEBUG] Test 1 result:", { test1, error1 })

    // Test 2: Count query
    console.log("[DEBUG] Test 2: Count query...")
    const { count, error: error2 } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })

    console.log("[DEBUG] Test 2 result:", { count, error2 })

    // Test 3: Try to find any user
    console.log("[DEBUG] Test 3: Find any user...")
    const { data: anyUser, error: error3 } = await supabase
      .from('user_profiles')
      .select('id, email, role, status')
      .limit(1)
      .single()

    console.log("[DEBUG] Test 3 result:", { anyUser, error3 })

    return NextResponse.json({
      success: true,
      tests: {
        test1: { data: test1, error: error1?.message },
        test2: { count, error: error2?.message },
        test3: { user: anyUser, error: error3?.message }
      }
    })

  } catch (error) {
    console.error('[DEBUG] Test database error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
