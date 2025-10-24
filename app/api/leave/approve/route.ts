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
    if (!authResult.valid || !authResult.user || !['admin', 'hr', 'manager'].includes(authResult.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { requestId, action, comments } = body

    if (!requestId || !action) {
      return NextResponse.json({ 
        error: 'Missing required fields: requestId, action' 
      }, { status: 400 })
    }

    if (!['approved', 'rejected'].includes(action)) {
      return NextResponse.json({ 
        error: 'Invalid action. Must be "approved" or "rejected"' 
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Get the leave request
    const { data: leaveRequest, error: requestError } = await supabase
      .from('leave_requests')
      .select(`
        *,
        employees (
          id,
          employee_number,
          position,
          department_id,
          user_id,
          users (full_name, email),
          departments (name)
        )
      `)
      .eq('id', requestId)
      .single()

    if (requestError || !leaveRequest) {
      return NextResponse.json({ 
        error: 'Leave request not found' 
      }, { status: 404 })
    }

    // Check if request is already processed
    if (leaveRequest.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Leave request has already been processed' 
      }, { status: 400 })
    }

    // Check permissions based on role
    if (authResult.user.role === 'manager') {
      // Managers can only approve requests from their department
      const { data: managerEmployee } = await supabase
        .from('employees')
        .select('department_id')
        .eq('user_id', authResult.user.id)
        .single()

      if (!managerEmployee || managerEmployee.department_id !== leaveRequest.employees.department_id) {
        return NextResponse.json({ 
          error: 'You can only approve leave requests from your department' 
        }, { status: 403 })
      }
    }

    // Update the leave request
    const { data: updatedRequest, error: updateError } = await supabase
      .from('leave_requests')
      .update({
        status: action,
        approved_by: authResult.user.id,
        approved_at: new Date().toISOString(),
        comments: comments || null
      })
      .eq('id', requestId)
      .select(`
        *,
        employees (
          id,
          employee_number,
          position,
          users (full_name, email),
          departments (name)
        )
      `)
      .single()

    if (updateError) {
      return NextResponse.json({ 
        error: 'Failed to update leave request',
        details: updateError.message 
      }, { status: 500 })
    }

    // If approved, update leave balance
    if (action === 'approved') {
      const { error: balanceError } = await supabase
        .from('leave_balances')
        .update({
          taken: leaveRequest.days_requested
        })
        .eq('employee_id', leaveRequest.employee_id)
        .eq('leave_type', leaveRequest.type)
        .eq('year', new Date().getFullYear())

      if (balanceError) {
        console.error('Failed to update leave balance:', balanceError)
        // Don't fail the request, just log the error
      }
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: authResult.user.id,
        action: `leave_request_${action}`,
        table_name: 'leave_requests',
        record_id: requestId,
        new_values: {
          status: action,
          approved_by: authResult.user.id,
          approved_at: new Date().toISOString()
        }
      })

    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message: `Leave request ${action} successfully`
    })

  } catch (error) {
    console.error('Leave approval error:', error)
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
    if (!authResult.valid || !authResult.user || !['admin', 'hr', 'manager'].includes(authResult.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const departmentId = searchParams.get('departmentId')

    const supabase = await createClient()

    // Build query for pending requests
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
      .eq('status', status)
      .order('created_at', { ascending: false })

    // Apply department filter if specified
    if (departmentId) {
      query = query.eq('employees.department_id', departmentId)
    }

    // Apply role-based filtering
    if (authResult.user.role === 'manager') {
      const { data: managerEmployee } = await supabase
        .from('employees')
        .select('department_id')
        .eq('user_id', authResult.user.id)
        .single()

      if (managerEmployee) {
        query = query.eq('employees.department_id', managerEmployee.department_id)
      }
    }

    const { data: leaveRequests, error } = await query

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
