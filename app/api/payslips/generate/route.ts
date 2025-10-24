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
    if (!authResult.valid || !authResult.user || !['admin', 'hr', 'manager'].includes(authResult.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { employeeId, payrollPeriodId, format = 'pdf' } = body

    if (!employeeId || !payrollPeriodId) {
      return NextResponse.json({ 
        error: 'Missing required fields: employeeId, payrollPeriodId' 
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Get employee details
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select(`
        *,
        users (full_name, email),
        departments (name)
      `)
      .eq('id', employeeId)
      .single()

    if (employeeError || !employee) {
      return NextResponse.json({ 
        error: 'Employee not found' 
      }, { status: 404 })
    }

    // Get payroll record
    const { data: payrollRecord, error: payrollError } = await supabase
      .from('payroll_records')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('payroll_period_id', payrollPeriodId)
      .single()

    if (payrollError || !payrollRecord) {
      return NextResponse.json({ 
        error: 'Payroll record not found' 
      }, { status: 404 })
    }

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

    // Get allowances for the period
    const { data: allowances, error: allowancesError } = await supabase
      .from('allowances')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('payroll_period_id', payrollPeriodId)

    if (allowancesError) {
      return NextResponse.json({ 
        error: 'Failed to fetch allowances' 
      }, { status: 500 })
    }

    // Get deductions for the period
    const { data: deductions, error: deductionsError } = await supabase
      .from('deductions')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('payroll_period_id', payrollPeriodId)

    if (deductionsError) {
      return NextResponse.json({ 
        error: 'Failed to fetch deductions' 
      }, { status: 500 })
    }

    // Get leave balance
    const { data: leaveBalance, error: leaveError } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('leave_type', 'annual')
      .eq('year', payrollPeriod.year)
      .single()

    // Generate payslip data
    const payslipData = {
      company: {
        name: 'GENIUS SECURITY (PVT) LTD',
        address: '123 Business Park, Harare, Zimbabwe',
        phone: '+263 4 123 4567',
        email: 'info@geniussecurity.co.zw'
      },
      employee: {
        number: employee.employee_number,
        name: employee.users.full_name,
        department: employee.departments.name,
        position: employee.position,
        bank: employee.bank_name,
        idNumber: employee.id_number,
        employmentType: employee.employment_type
      },
      payroll: {
        period: `${payrollPeriod.month}/${payrollPeriod.year}`,
        grossSalary: payrollRecord.gross_salary_usd,
        paye: payrollRecord.paye,
        aidsLevy: payrollRecord.aids_levy,
        nssa: payrollRecord.nssa,
        totalDeductions: payrollRecord.total_deductions,
        netSalary: payrollRecord.net_salary_usd
      },
      allowances: allowances || [],
      deductions: deductions || [],
      leaveBalance: leaveBalance?.closing_balance || 0,
      generatedAt: new Date().toISOString(),
      generatedBy: authResult.user.full_name
    }

    if (format === 'pdf') {
      // Generate PDF payslip
      const pdfBuffer = await generatePayslipPDF(payslipData)
      
      return new NextResponse(pdfBuffer as any, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="payslip-${employee.employee_number}-${payrollPeriod.month}-${payrollPeriod.year}.pdf"`
        }
      })
    } else {
      // Return JSON data
      return NextResponse.json({
        success: true,
        data: payslipData
      })
    }

  } catch (error) {
    console.error('Payslip generation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function generatePayslipPDF(payslipData: any): Promise<Buffer> {
  // This is a placeholder for PDF generation
  // In a real implementation, you would use a library like puppeteer, jsPDF, or PDFKit
  
  const pdfContent = `
    GENIUS SECURITY (PVT) LTD
    ------------------------------------------
    Employee Number: ${payslipData.employee.number}
    Employee Name: ${payslipData.employee.name}
    Department: ${payslipData.employee.department}
    Position: ${payslipData.employee.position}
    Bank: ${payslipData.employee.bank}
    ID No: ${payslipData.employee.idNumber}
    Employment Type: ${payslipData.employee.employmentType}

    EARNINGS                   DEDUCTIONS
    ------------------------------------------
    Basic              ${payslipData.payroll.grossSalary.toFixed(2)}     NSSA           ${payslipData.payroll.nssa.toFixed(2)}
    Transport Allow.   ${payslipData.allowances.find((a: any) => a.type === 'transport')?.amount_usd || 0}     PAYE          ${payslipData.payroll.paye.toFixed(2)}
                               AIDS Levy      ${payslipData.payroll.aidsLevy.toFixed(2)}
    ------------------------------------------
    GROSS:             ${payslipData.payroll.grossSalary.toFixed(2)}     TOTAL DED:    ${payslipData.payroll.totalDeductions.toFixed(2)}
    NET PAID:          USD ${payslipData.payroll.netSalary.toFixed(2)}

    LEAVE SUMMARY
    Annual Leave: ${payslipData.leaveBalance} days remaining
  `

  // Convert to Buffer (placeholder implementation)
  return Buffer.from(pdfContent, 'utf-8')
}
