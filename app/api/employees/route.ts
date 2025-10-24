import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authToken = request.cookies.get('auth-token')?.value
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authResult = AuthService.verifyToken(authToken)
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const department = searchParams.get('department')

    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('employees')
      .select(`
        *,
        departments (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,employee_id.ilike.%${search}%,email.ilike.%${search}%`
      )
    }

    if (status) {
      query = query.or(`status.eq.${status},employment_status.eq.${status}`)
    }

    if (department) {
      query = query.or(`department.eq.${department},departments.name.eq.${department}`)
    }

    const { data: employees, error } = await query

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to fetch employees',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: employees
    })

  } catch (error) {
    console.error('Employees fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authToken = request.cookies.get('auth-token')?.value
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authResult = AuthService.verifyToken(authToken)
    if (!authResult.valid || !authResult.user || !['admin', 'hr'].includes(authResult.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const supabase = await createClient()

    // Create employee
    const { data: employee, error } = await supabase
      .from('employees')
      .insert([body])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to create employee',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: employee
    })

  } catch (error) {
    console.error('Employee creation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
