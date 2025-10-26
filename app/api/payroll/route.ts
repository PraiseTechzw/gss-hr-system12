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

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Get query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    const employeeId = searchParams.get('employeeId')

    // Build query
    let query = supabase
      .from('payroll')
      .select(`
        *,
        employees (
          id,
          employee_id,
          first_name,
          last_name,
          email,
          job_title,
          employment_status
        )
      `, { count: 'exact' })

    // Apply filters
    if (status) {
      query = query.eq('payment_status', status)
    }
    if (year) {
      query = query.eq('year', parseInt(year))
    }
    if (month) {
      query = query.eq('month', parseInt(month))
    }
    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    // Apply pagination and ordering
    query = query
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    const { data: payrollRecords, error, count } = await query

    if (error) {
      console.error('Error fetching payroll records:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch payroll records',
        details: error.message 
      }, { status: 500 })
    }

    // Get summary statistics
    const { data: summaryData } = await supabase
      .from('payroll')
      .select('payment_status, gross_salary, net_salary')

    const summary = {
      total: count || 0,
      pending: summaryData?.filter(r => r.payment_status === 'pending').length || 0,
      processed: summaryData?.filter(r => r.payment_status === 'processed').length || 0,
      paid: summaryData?.filter(r => r.payment_status === 'paid').length || 0,
      totalGrossSalary: summaryData?.reduce((sum, r) => sum + (r.gross_salary || 0), 0) || 0,
      totalNetSalary: summaryData?.reduce((sum, r) => sum + (r.net_salary || 0), 0) || 0
    }

    return NextResponse.json({
      success: true,
      data: payrollRecords,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      },
      summary
    })

  } catch (error) {
    console.error('Payroll fetch error:', error)
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
    if (!authResult.valid || !authResult.user || !['admin', 'hr', 'manager'].includes(authResult.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const {
      employee_id,
      month,
      year,
      basic_salary,
      allowances,
      overtime_pay,
      deductions,
      days_worked,
      days_absent,
      payment_status = 'pending'
    } = body

    // Validate required fields
    if (!employee_id || !month || !year || !basic_salary) {
      return NextResponse.json({ 
        error: 'Missing required fields: employee_id, month, year, basic_salary' 
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if payroll record already exists for this employee and period
    const { data: existingRecord } = await supabase
      .from('payroll')
      .select('id')
      .eq('employee_id', employee_id)
      .eq('month', month)
      .eq('year', year)
      .single()

    if (existingRecord) {
      return NextResponse.json({ 
        error: 'Payroll record already exists for this employee and period' 
      }, { status: 409 })
    }

    // Calculate gross and net salary
    const gross_salary = (basic_salary || 0) + (allowances || 0) + (overtime_pay || 0)
    const net_salary = gross_salary - (deductions || 0)

    // Create payroll record
    const { data: newRecord, error } = await supabase
      .from('payroll')
      .insert({
        employee_id,
        month,
        year,
        basic_salary: basic_salary || 0,
        allowances: allowances || 0,
        overtime_pay: overtime_pay || 0,
        deductions: deductions || 0,
        gross_salary,
        net_salary,
        days_worked: days_worked || 0,
        days_absent: days_absent || 0,
        payment_status,
        created_by: authResult.user.id
      })
      .select(`
        *,
        employees (
          id,
          employee_id,
          first_name,
          last_name,
          email,
          job_title
        )
      `)
      .single()

    if (error) {
      console.error('Error creating payroll record:', error)
      return NextResponse.json({ 
        error: 'Failed to create payroll record',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: newRecord,
      message: 'Payroll record created successfully'
    })

  } catch (error) {
    console.error('Payroll creation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
