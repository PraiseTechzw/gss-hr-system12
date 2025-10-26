import { NextResponse } from 'next/server'
import { SystemActivityLogger } from '@/lib/system-activity'
import { cookies } from 'next/headers'
import { AuthService } from '@/lib/auth'

export async function POST() {
  try {
    // Get user info before clearing cookie for logging
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    let userEmail = 'Unknown'
    if (token) {
      try {
        const tokenResult = AuthService.verifyToken(token)
        if (tokenResult.valid && tokenResult.user) {
          userEmail = tokenResult.user.email
          // Log logout activity
          await SystemActivityLogger.logAuthActivity('logout', userEmail, tokenResult.user.id)
        }
      } catch (error) {
        console.error('Error getting user info for logout logging:', error)
      }
    }
    
    // Clear the auth token cookie
    cookieStore.delete('auth-token')

    return NextResponse.json({
      success: true,
      message: 'Logout successful'
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
