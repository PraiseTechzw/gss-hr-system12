import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Debug endpoint to check password markers in the database
 * Shows which users have the temporary password marker
 * 
 * Usage: GET /api/debug/check-password-marker?email=user@example.com
 *        GET /api/debug/check-password-marker (shows all users with temp marker)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    const TEMP_PASSWORD_MARKER = '$2a$12$TEMP.PASSWORD.NEEDS.SETUP.REQUIRED.FOR.NEW.USER'

    // Use service role client to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL_SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    let query = supabase
      .from('user_profiles')
      .select('id, email, full_name, role, password_hash, created_at')
      .eq('password_hash', TEMP_PASSWORD_MARKER)

    if (email) {
      query = query.eq('email', email.toLowerCase())
    }

    const { data: users, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      tempPasswordMarker: TEMP_PASSWORD_MARKER,
      message: email 
        ? `Checking for user: ${email}`
        : 'All users with temporary password marker',
      count: users?.length || 0,
      users: users?.map(user => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        hasTempMarker: user.password_hash === TEMP_PASSWORD_MARKER,
        created_at: user.created_at
      })) || []
    })

  } catch (error) {
    console.error('[Debug] Check password marker error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        tempPasswordMarker: '$2a$12$TEMP.PASSWORD.NEEDS.SETUP.REQUIRED.FOR.NEW.USER'
      },
      { status: 500 }
    )
  }
}

