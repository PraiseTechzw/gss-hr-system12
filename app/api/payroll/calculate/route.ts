import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ZimraTaxCalculator, PayrollComponents } from '@/lib/tax/zimra-calculator'
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
    const { employeeId, payrollPeriodId, components } = body

    // Validate required fields
    if (!employeeId || !payrollPeriodId || !components) {
      return NextResponse.json({ 
        error: 'Missing required fields: employeeId, payrollPeriodId, components' 
      }, { status: 400 })
    }

    // Validate payroll components
    // Validate components manually
    if (!components.basicSalary || components.basicSalary < 0) {
      return NextResponse.json({ 
        error: 'Invalid basic salary' 
      }, { status: 400 })
    }
    // Additional validation can be added here

    // Calculate Zimbabwe tax
    const taxResult = ZimraTaxCalculator.calculateZimbabweTax(components)

    // Validate the calculation
    const taxValidation = ZimraTaxCalculator.validateTaxCalculation(taxResult)
    if (!taxValidation.isValid) {
      return NextResponse.json({ 
        error: 'Tax calculation validation failed', 
        details: taxValidation.errors 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: taxResult,
      message: 'Payroll calculated successfully'
    })

  } catch (error) {
    console.error('Payroll calculation error:', error)
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
    const payrollPeriodId = searchParams.get('payrollPeriodId')

    if (!payrollPeriodId) {
      return NextResponse.json({ 
        error: 'Missing payrollPeriodId parameter' 
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Get payroll records for the period
    const { data: payrollRecords, error } = await supabase
      .from('payroll_records')
      .select(`
        *,
        employees (
          id,
          employee_number,
          position,
          user_id,
          users (full_name, email)
        )
      `)
      .eq('payroll_period_id', payrollPeriodId)

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to fetch payroll records',
        details: error.message 
      }, { status: 500 })
    }

    // Generate tax summary
    const taxSummary = ZimraTaxCalculator.generateTaxSummary(
      payrollRecords.map((record: any) => ({
        grossSalary: record.gross_salary_usd,
        paye: record.paye,
        aidsLevy: record.aids_levy,
        nssa: record.nssa,
        totalDeductions: record.total_deductions,
        netSalary: record.net_salary_usd,
        breakdown: {
          basicSalary: 0,
          allowances: 0,
          grossTotal: record.gross_salary_usd,
          payeBreakdown: '',
          aidsLevyBreakdown: '',
          nssaBreakdown: ''
        }
      }))
    )

    return NextResponse.json({
      success: true,
      data: {
        payrollRecords,
        summary: taxSummary
      }
    })

  } catch (error) {
    console.error('Payroll fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
