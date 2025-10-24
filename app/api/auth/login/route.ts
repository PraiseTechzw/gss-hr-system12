import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    console.log("[API] Login request received")
    const { email, password } = await request.json()
    console.log("[API] Login attempt for email:", email)

    if (!email || !password) {
      console.log("[API] Missing email or password")
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log("[API] Calling AuthService.authenticate...")
    // Authenticate user
    const authResult = await AuthService.authenticate(email, password)
    console.log("[API] Authentication result:", { success: authResult.success, error: authResult.error })

    if (!authResult.success || !authResult.user) {
      console.log("[API] Authentication failed:", authResult.error)
      return NextResponse.json(
        { success: false, error: authResult.error || 'Authentication failed' },
        { status: 401 }
      )
    }

    console.log("[API] Authentication successful, generating token...")
    // Generate JWT token
    const token = AuthService.generateToken(authResult.user)
    console.log("[API] Token generated successfully")

    // Set HTTP-only cookie
    console.log("[API] Setting auth cookie...")
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })
    console.log("[API] Cookie set successfully")

    console.log("[API] Login successful for user:", authResult.user.email)
    return NextResponse.json({
      success: true,
      user: authResult.user,
      message: 'Login successful'
    })
  } catch (error) {
    console.error('[API] Login error:', error)
    console.error('[API] Error details:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
