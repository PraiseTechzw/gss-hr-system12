import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const supabase = await createClient()
    
    // Test basic query
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (testError) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: testError.message
      }, { status: 500 })
    }

    // Test authentication
    const authToken = request.cookies.get('auth-token')?.value
    let authStatus = 'No token'
    
    if (authToken) {
      try {
        const user = await AuthService.verifyToken(authToken)
        authStatus = user ? 'Valid token' : 'Invalid token'
      } catch (error) {
        authStatus = 'Token verification failed'
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        database: 'Connected',
        authentication: authStatus,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Connection test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
