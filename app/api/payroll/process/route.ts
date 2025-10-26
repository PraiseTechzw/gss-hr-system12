import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthService } from '@/lib/auth'
import { PayrollCalculatorService, PayrollCalculationRequest } from '@/lib/payroll-calculator'

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
      employeeId, 
      month, 
      year, 
      basicSalary, 
      allowances = 0,
      overtimePay = 0,
      transportAllowance = 0,
      housingAllowance = 0,
      otherAllowances = 0,
      bonuses = 0,
      daysWorked = 26,
      daysAbsent = 0,
      paymentStatus = 'pending',
      saveToDatabase = true
    } = body

    // Validate required fields
    if (!employeeId || !month || !year || !basicSalary) {
      return NextResponse.json({ 
        error: 'Missing required fields: employeeId, month, year, basicSalary' 
      }, { status: 400 })
    }

    // Create calculation request
    const calculationRequest: PayrollCalculationRequest = {
      employeeId,
      month: parseInt(month),
      year: parseInt(year),
      basicSalary: parseFloat(basicSalary),
      allowances: parseFloat(allowances),
      overtimePay: parseFloat(overtimePay),
      transportAllowance: parseFloat(transportAllowance),
      housingAllowance: parseFloat(housingAllowance),
      otherAllowances: parseFloat(otherAllowances),
      bonuses: parseFloat(bonuses),
      daysWorked: parseInt(daysWorked),
      daysAbsent: parseInt(daysAbsent)
    }

    // Calculate payroll
    const calculationResult = await PayrollCalculatorService.calculateEmployeePayroll(calculationRequest)

    let savedRecord = null
    if (saveToDatabase) {
      // Save to database
      const saveResult = await PayrollCalculatorService.savePayrollCalculation(
        calculationResult,
        paymentStatus,
        authResult.user.id
      )

      if (!saveResult.success) {
        return NextResponse.json({ 
          error: 'Failed to save payroll record',
          details: saveResult.error 
        }, { status: 500 })
      }

      // Get the saved record with employee details
      const supabase = await createClient()
      const { data: savedRecordData } = await supabase
        .from('payroll')
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
        .eq('id', saveResult.id)
        .single()

      savedRecord = savedRecordData
    }

    return NextResponse.json({
      success: true,
      calculation: calculationResult,
      savedRecord,
      message: 'Payroll processed successfully'
    })

  } catch (error) {
    console.error('Payroll processing error:', error)
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
    const employeeId = searchParams.get('employeeId')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    if (!employeeId || !month || !year) {
      return NextResponse.json({ 
        error: 'Missing required parameters: employeeId, month, year' 
      }, { status: 400 })
    }

    // Get employee payroll history
    const history = await PayrollCalculatorService.getEmployeePayrollHistory(
      employeeId,
      12 // Last 12 months
    )

    // Filter by month/year if specified
    const filteredHistory = history.filter(record => 
      record.month === parseInt(month) && record.year === parseInt(year)
    )

    return NextResponse.json({
      success: true,
      history: filteredHistory,
      totalRecords: filteredHistory.length
    })

  } catch (error) {
    console.error('Payroll history fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
