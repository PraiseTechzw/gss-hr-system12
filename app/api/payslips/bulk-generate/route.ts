import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthService } from '@/lib/auth'
import { ZimraTaxCalculator } from '@/lib/tax/zimra-calculator'

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
    const { payrollPeriodId, departmentId, format = 'zip' } = body

    if (!payrollPeriodId) {
      return NextResponse.json({ 
        error: 'Missing required field: payrollPeriodId' 
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Get payroll period details
    const { data: payrollPeriod, error: periodError } = await supabase
      .from('payroll_periods')
      .select('*')
      .eq('id', payrollPeriodId)
      .single()

    if (periodError || !payrollPeriod) {
      return NextResponse.json({ 
        error: 'Payroll period not found' 
      }, { status: 404 })
    }

    // Build query for payroll records
    let query = supabase
      .from('payroll_records')
      .select(`
        *,
        employees (
          id,
          employee_number,
          position,
          user_id,
          department_id,
          users (full_name, email),
          departments (name)
        )
      `)
      .eq('payroll_period_id', payrollPeriodId)

    // Filter by department if specified
    if (departmentId) {
      query = query.eq('employees.department_id', departmentId)
    }

    const { data: payrollRecords, error: recordsError } = await query

    if (recordsError) {
      return NextResponse.json({ 
        error: 'Failed to fetch payroll records',
        details: recordsError.message 
      }, { status: 500 })
    }

    if (!payrollRecords || payrollRecords.length === 0) {
      return NextResponse.json({ 
        error: 'No payroll records found for the specified period' 
      }, { status: 404 })
    }

    // Generate payslips for all employees
    const payslips = []
    const errors = []

    for (const record of payrollRecords) {
      try {
        // Get allowances for the employee
        const { data: allowances } = await supabase
          .from('allowances')
          .select('*')
          .eq('employee_id', record.employee_id)
          .eq('payroll_period_id', payrollPeriodId)

        // Get deductions for the employee
        const { data: deductions } = await supabase
          .from('deductions')
          .select('*')
          .eq('employee_id', record.employee_id)
          .eq('payroll_period_id', payrollPeriodId)

        // Get leave balance
        const { data: leaveBalance } = await supabase
          .from('leave_balances')
          .select('*')
          .eq('employee_id', record.employee_id)
          .eq('leave_type', 'annual')
          .eq('year', payrollPeriod.year)
          .single()

        const payslipData = {
          company: {
            name: 'GENIUS SECURITY (PVT) LTD',
            address: '123 Business Park, Harare, Zimbabwe',
            phone: '+263 4 123 4567',
            email: 'info@geniussecurity.co.zw'
          },
          employee: {
            number: record.employees.employee_number,
            name: record.employees.users.full_name,
            department: record.employees.departments.name,
            position: record.employees.position,
            bank: record.employees.bank_name,
            idNumber: record.employees.id_number,
            employmentType: record.employees.employment_type
          },
          payroll: {
            period: `${payrollPeriod.month}/${payrollPeriod.year}`,
            grossSalary: record.gross_salary_usd,
            paye: record.paye,
            aidsLevy: record.aids_levy,
            nssa: record.nssa,
            totalDeductions: record.total_deductions,
            netSalary: record.net_salary_usd
          },
          allowances: allowances || [],
          deductions: deductions || [],
          leaveBalance: leaveBalance?.closing_balance || 0,
          generatedAt: new Date().toISOString(),
          generatedBy: authResult.user.full_name
        }

        payslips.push({
          employeeId: record.employee_id,
          employeeNumber: record.employees.employee_number,
          employeeName: record.employees.users.full_name,
          data: payslipData
        })

      } catch (error) {
        errors.push({
          employeeId: record.employee_id,
          employeeNumber: record.employees.employee_number,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Generate summary
    const summary = {
      totalEmployees: payrollRecords.length,
      successfulPayslips: payslips.length,
      failedPayslips: errors.length,
      totalGrossSalary: payslips.reduce((sum, p) => sum + p.data.payroll.grossSalary, 0),
      totalPAYE: payslips.reduce((sum, p) => sum + p.data.payroll.paye, 0),
      totalAidsLevy: payslips.reduce((sum, p) => sum + p.data.payroll.aidsLevy, 0),
      totalNSSA: payslips.reduce((sum, p) => sum + p.data.payroll.nssa, 0),
      totalDeductions: payslips.reduce((sum, p) => sum + p.data.payroll.totalDeductions, 0),
      totalNetSalary: payslips.reduce((sum, p) => sum + p.data.payroll.netSalary, 0)
    }

    if (format === 'zip') {
      // Generate ZIP file with all payslips
      const zipBuffer = await generatePayslipsZIP(payslips, payrollPeriod)
      
      return new NextResponse(zipBuffer as any, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="payslips-${payrollPeriod.month}-${payrollPeriod.year}.zip"`
        }
      })
    } else {
      // Return JSON data
      return NextResponse.json({
        success: true,
        data: {
          payslips,
          summary,
          errors: errors.length > 0 ? errors : undefined
        }
      })
    }

  } catch (error) {
    console.error('Bulk payslip generation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function generatePayslipsZIP(payslips: any[], payrollPeriod: any): Promise<Buffer> {
  // This is a placeholder for ZIP generation
  // In a real implementation, you would use a library like jszip
  
  const zipContent = `
    PAYSLIPS FOR ${payrollPeriod.month}/${payrollPeriod.year}
    ================================================
    
    Total Employees: ${payslips.length}
    Generated: ${new Date().toISOString()}
    
    Files included:
    ${payslips.map(p => `- payslip-${p.employeeNumber}-${payrollPeriod.month}-${payrollPeriod.year}.pdf`).join('\n')}
  `

  // Convert to Buffer (placeholder implementation)
  return Buffer.from(zipContent, 'utf-8')
}



