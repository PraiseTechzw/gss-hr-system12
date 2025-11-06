import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password, confirmPassword } = await request.json()

    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and confirmation are required' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Use service role client to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL_SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Get user and verify they have temporary password
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('status', 'active')
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const TEMP_PASSWORD_MARKER = '$2a$12$TEMP.PASSWORD.NEEDS.SETUP.REQUIRED.FOR.NEW.USER'
    if (user.password_hash !== TEMP_PASSWORD_MARKER) {
      return NextResponse.json(
        { success: false, error: 'Password has already been set. Please use the login page.' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user password
    const { data: updatedUser, error: updateError } = await supabase
      .from('user_profiles')
      .update({ password_hash: hashedPassword })
      .eq('id', user.id)
      .select('*')
      .single()

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Failed to set password: ' + updateError.message },
        { status: 500 }
      )
    }

    // Now authenticate the user and create session
    const authResult = await AuthService.authenticate(email, password)
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Password set but login failed. Please try logging in.' },
        { status: 500 }
      )
    }

    // Generate JWT token
    const token = AuthService.generateToken(authResult.user)

    // Set HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return NextResponse.json({
      success: true,
      user: authResult.user,
      message: 'Password set successfully. You are now logged in.'
    })

  } catch (error) {
    console.error('[API] Setup password error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

