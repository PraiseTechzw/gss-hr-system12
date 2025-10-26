import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthService } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data: payrollRecord, error } = await supabase
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
          employment_status,
          departments (
            id,
            name
          )
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching payroll record:', error)
      return NextResponse.json({ 
        error: 'Payroll record not found',
        details: error.message 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: payrollRecord
    })

  } catch (error) {
    console.error('Payroll fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      basic_salary,
      allowances,
      overtime_pay,
      deductions,
      days_worked,
      days_absent,
      payment_status,
      payment_date,
      payment_method
    } = body

    const supabase = await createClient()

    // Get current record to calculate new values
    const { data: currentRecord } = await supabase
      .from('payroll')
      .select('basic_salary, allowances, overtime_pay, deductions')
      .eq('id', params.id)
      .single()

    if (!currentRecord) {
      return NextResponse.json({ 
        error: 'Payroll record not found' 
      }, { status: 404 })
    }

    // Calculate new gross and net salary
    const newBasicSalary = basic_salary !== undefined ? basic_salary : currentRecord.basic_salary
    const newAllowances = allowances !== undefined ? allowances : currentRecord.allowances
    const newOvertimePay = overtime_pay !== undefined ? overtime_pay : currentRecord.overtime_pay
    const newDeductions = deductions !== undefined ? deductions : currentRecord.deductions

    const gross_salary = newBasicSalary + newAllowances + newOvertimePay
    const net_salary = gross_salary - newDeductions

    // Update payroll record
    const updateData: any = {
      updated_by: authResult.user.id,
      updated_at: new Date().toISOString()
    }

    if (basic_salary !== undefined) updateData.basic_salary = newBasicSalary
    if (allowances !== undefined) updateData.allowances = newAllowances
    if (overtime_pay !== undefined) updateData.overtime_pay = newOvertimePay
    if (deductions !== undefined) updateData.deductions = newDeductions
    if (days_worked !== undefined) updateData.days_worked = days_worked
    if (days_absent !== undefined) updateData.days_absent = days_absent
    if (payment_status !== undefined) updateData.payment_status = payment_status
    if (payment_date !== undefined) updateData.payment_date = payment_date
    if (payment_method !== undefined) updateData.payment_method = payment_method

    updateData.gross_salary = gross_salary
    updateData.net_salary = net_salary

    const { data: updatedRecord, error } = await supabase
      .from('payroll')
      .update(updateData)
      .eq('id', params.id)
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
      console.error('Error updating payroll record:', error)
      return NextResponse.json({ 
        error: 'Failed to update payroll record',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: updatedRecord,
      message: 'Payroll record updated successfully'
    })

  } catch (error) {
    console.error('Payroll update error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const supabase = await createClient()

    const { error } = await supabase
      .from('payroll')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting payroll record:', error)
      return NextResponse.json({ 
        error: 'Failed to delete payroll record',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Payroll record deleted successfully'
    })

  } catch (error) {
    console.error('Payroll deletion error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
