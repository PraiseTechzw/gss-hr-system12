import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthService } from '@/lib/auth'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { 
      employeeId, 
      type, 
      startDate, 
      endDate, 
      reason 
    } = body

    // Validate required fields
    if (!employeeId || !type || !startDate || !endDate) {
      return NextResponse.json({ 
        error: 'Missing required fields: employeeId, type, startDate, endDate' 
      }, { status: 400 })
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start >= end) {
      return NextResponse.json({ 
        error: 'Start date must be before end date' 
      }, { status: 400 })
    }

    if (start < new Date()) {
      return NextResponse.json({ 
        error: 'Start date cannot be in the past' 
      }, { status: 400 })
    }

    // Calculate days requested
    const daysRequested = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const supabase = await createClient()

    // Check if employee exists and user has permission
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single()

    if (employeeError || !employee) {
      return NextResponse.json({ 
        error: 'Employee not found' 
      }, { status: 404 })
    }

    // Check if user can create leave request for this employee
    if (authResult.user.role === 'employee' && employee.user_id !== authResult.user.id) {
      return NextResponse.json({ 
        error: 'You can only create leave requests for yourself' 
      }, { status: 403 })
    }

    // Check leave balance
    const { data: leaveBalance, error: balanceError } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('leave_type', type)
      .eq('year', new Date().getFullYear())
      .single()

    if (balanceError || !leaveBalance) {
      return NextResponse.json({ 
        error: 'Leave balance not found for this employee' 
      }, { status: 404 })
    }

    if (leaveBalance.closing_balance < daysRequested) {
      return NextResponse.json({ 
        error: `Insufficient leave balance. Available: ${leaveBalance.closing_balance} days, Requested: ${daysRequested} days` 
      }, { status: 400 })
    }

    // Check for overlapping leave requests
    const { data: overlappingRequests, error: overlapError } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('status', 'approved')
      .or(`and(start_date.lte.${endDate},end_date.gte.${startDate})`)

    if (overlapError) {
      return NextResponse.json({ 
        error: 'Failed to check for overlapping requests' 
      }, { status: 500 })
    }

    if (overlappingRequests && overlappingRequests.length > 0) {
      return NextResponse.json({ 
        error: 'You have overlapping approved leave during this period' 
      }, { status: 400 })
    }

    // Create leave request
    const { data: leaveRequest, error: createError } = await supabase
      .from('leave_requests')
      .insert({
        employee_id: employeeId,
        type,
        start_date: startDate,
        end_date: endDate,
        days_requested: daysRequested,
        reason,
        status: 'pending'
      })
      .select(`
        *,
        employees (
          id,
          employee_number,
          position,
          users (full_name, email)
        )
      `)
      .single()

    if (createError) {
      return NextResponse.json({ 
        error: 'Failed to create leave request',
        details: createError.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: leaveRequest,
      message: 'Leave request created successfully'
    })

  } catch (error) {
    console.error('Leave request creation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

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
    const status = searchParams.get('status')
    const employeeId = searchParams.get('employeeId')
    const departmentId = searchParams.get('departmentId')

    const supabase = await createClient()

    // Build query based on user role
    let query = supabase
      .from('leave_requests')
      .select(`
        *,
        employees (
          id,
          employee_number,
          position,
          department_id,
          users (full_name, email),
          departments (name)
        )
      `)

    // Apply filters based on user role
    if (authResult.user.role === 'employee') {
      // Employees can only see their own requests
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', authResult.user.id)
        .single()

      if (employee) {
        query = query.eq('employee_id', employee.id)
      } else {
        return NextResponse.json({ 
          error: 'Employee record not found' 
        }, { status: 404 })
      }
    } else if (authResult.user.role === 'manager') {
      // Managers can see requests from their department
      const { data: managerEmployee } = await supabase
        .from('employees')
        .select('department_id')
        .eq('user_id', authResult.user.id)
        .single()

      if (managerEmployee) {
        query = query.eq('employees.department_id', managerEmployee.department_id)
      }
    }
    // Admin and HR can see all requests (no additional filtering)

    // Apply additional filters
    if (status) {
      query = query.eq('status', status)
    }

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    if (departmentId) {
      query = query.eq('employees.department_id', departmentId)
    }

    const { data: leaveRequests, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to fetch leave requests',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: leaveRequests
    })

  } catch (error) {
    console.error('Leave requests fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
