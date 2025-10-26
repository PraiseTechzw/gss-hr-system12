import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [BULK PAYSLIP] Starting bulk payslip generation...')

    const body = await request.json()
    const { month, year, departmentId, format = 'json' } = body

    console.log('📝 [BULK PAYSLIP] Request body:', { month, year, departmentId, format })

    if (!month || !year) {
      console.log('❌ [BULK PAYSLIP] Missing required fields')
      return NextResponse.json({ 
        error: 'Missing required fields: month, year' 
      }, { status: 400 })
    }

    const supabase = await createClient()
    console.log('✅ [BULK PAYSLIP] Supabase client created')

    // Build query for payroll records
    console.log('🔍 [BULK PAYSLIP] Building query for month:', month, 'year:', year)
    
    let query = supabase
      .from('payroll')
      .select(`
        *,
        employees (
          id,
          employee_id,
          first_name,
          last_name,
          job_title,
          email,
          phone,
          address,
          bank_name,
          account_number,
          pan_number,
          employment_status,
          department_id
        )
      `)
      .eq('month', month)
      .eq('year', year)

    // Filter by department if specified
    if (departmentId) {
      console.log('🔍 [BULK PAYSLIP] Filtering by department:', departmentId)
      query = query.eq('employees.department_id', departmentId)
    }

    console.log('🔍 [BULK PAYSLIP] Executing query...')
    const { data: payrollRecords, error: recordsError } = await query

    console.log('📊 [BULK PAYSLIP] Query result:', {
      hasData: !!payrollRecords,
      recordCount: payrollRecords?.length || 0,
      hasError: !!recordsError,
      errorMessage: recordsError?.message,
      errorCode: recordsError?.code,
      errorDetails: recordsError?.details
    })

    if (recordsError) {
      console.log('❌ [BULK PAYSLIP] Database error:', recordsError)
      return NextResponse.json({ 
        error: 'Failed to fetch payroll records',
        details: recordsError.message 
      }, { status: 500 })
    }

    if (!payrollRecords || payrollRecords.length === 0) {
      console.log('❌ [BULK PAYSLIP] No payroll records found for period:', month, year)
      return NextResponse.json({ 
        error: 'No payroll records found for the specified period' 
      }, { status: 404 })
    }

    console.log('✅ [BULK PAYSLIP] Found', payrollRecords.length, 'payroll records')

    // Generate payslips for all employees
    const payslips = []
    const errors = []

    console.log('🔧 [BULK PAYSLIP] Processing', payrollRecords.length, 'records...')

    for (const record of payrollRecords) {
      try {
        console.log('🔍 [BULK PAYSLIP] Processing record:', record.id, 'for employee:', record.employee_id)
        const employee = record.employees
        
        if (!employee) {
          console.log('❌ [BULK PAYSLIP] No employee data for record:', record.id)
          errors.push({
            payrollId: record.id,
            employeeId: record.employee_id,
            employeeNumber: 'N/A',
            error: 'Employee data not found'
          })
          continue
        }

        const payslipData = {
          company: {
            name: 'GENIUS SECURITY (PVT) LTD',
            address: '123 Business Park, Harare, Zimbabwe',
            phone: '+263 4 123 4567',
            email: 'info@geniussecurity.co.zw'
          },
          employee: {
            number: employee.employee_id,
            name: `${employee.first_name} ${employee.last_name}`,
            department: 'N/A', // We'll need to fetch department name separately if needed
            position: employee.job_title,
            bank: employee.bank_name || 'N/A',
            accountNumber: employee.account_number || 'N/A',
            idNumber: employee.pan_number || 'N/A',
            employmentType: employee.employment_status,
            email: employee.email,
            phone: employee.phone,
            address: employee.address
          },
          payroll: {
            period: `${record.month}/${record.year}`,
            payPeriodStart: record.pay_period_start,
            payPeriodEnd: record.pay_period_end,
            grossSalary: record.gross_salary,
            basicSalary: record.basic_salary,
            allowances: record.allowances,
            transportAllowance: record.transport_allowance,
            overtimePay: record.overtime_pay,
            totalAllowances: record.total_allowances || 0,
            deductions: record.deductions,
            nssaDeduction: record.nssa_deduction,
            payeeDeduction: record.payee_deduction,
            totalDeductions: record.total_deductions || 0,
            netSalary: record.net_salary,
            exchangeRate: record.exchange_rate,
            daysWorked: record.days_worked,
            daysAbsent: record.days_absent,
            paymentStatus: record.payment_status,
            paymentDate: record.payment_date,
            paymentMethod: record.payment_method
          },
          generatedAt: new Date().toISOString(),
          notes: record.notes || ''
        }

        payslips.push({
          payrollId: record.id,
          employeeId: record.employee_id,
          employeeNumber: employee.employee_id,
          employeeName: `${employee.first_name} ${employee.last_name}`,
          data: payslipData
        })

        console.log('✅ [BULK PAYSLIP] Generated payslip for:', employee.employee_id)

      } catch (error) {
        console.log('❌ [BULK PAYSLIP] Error processing record:', record.id, error)
        errors.push({
          payrollId: record.id,
          employeeId: record.employee_id,
          employeeNumber: record.employees?.employee_id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    console.log('📊 [BULK PAYSLIP] Processing complete:', {
      successful: payslips.length,
      errors: errors.length
    })

    // Generate summary
    const summary = {
      totalEmployees: payrollRecords.length,
      successfulPayslips: payslips.length,
      failedPayslips: errors.length,
      totalGrossSalary: payslips.reduce((sum, p) => sum + (p.data.payroll.grossSalary || 0), 0),
      totalBasicSalary: payslips.reduce((sum, p) => sum + (p.data.payroll.basicSalary || 0), 0),
      totalAllowances: payslips.reduce((sum, p) => sum + (p.data.payroll.allowances || 0), 0),
      totalTransportAllowance: payslips.reduce((sum, p) => sum + (p.data.payroll.transportAllowance || 0), 0),
      totalOvertimePay: payslips.reduce((sum, p) => sum + (p.data.payroll.overtimePay || 0), 0),
      totalDeductions: payslips.reduce((sum, p) => sum + (p.data.payroll.totalDeductions || 0), 0),
      totalNSSADeduction: payslips.reduce((sum, p) => sum + (p.data.payroll.nssaDeduction || 0), 0),
      totalPAYEDeduction: payslips.reduce((sum, p) => sum + (p.data.payroll.payeeDeduction || 0), 0),
      totalNetSalary: payslips.reduce((sum, p) => sum + (p.data.payroll.netSalary || 0), 0)
    }

    console.log('📄 [BULK PAYSLIP] Format requested:', format)

    if (format === 'zip') {
      console.log('🔧 [BULK PAYSLIP] Generating ZIP file...')
      // Generate ZIP file with all payslips
      const zipBuffer = await generatePayslipsZIP(payslips, { month, year })
      console.log('✅ [BULK PAYSLIP] ZIP generated successfully')
      
      return new NextResponse(zipBuffer as any, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="payslips-${month}-${year}.zip"`
        }
      })
    } else {
      console.log('📊 [BULK PAYSLIP] Returning JSON data')
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
    console.error('❌ [BULK PAYSLIP] Unexpected error:', error)
    console.error('❌ [BULK PAYSLIP] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function generatePayslipsZIP(payslips: any[], period: { month: number, year: number }): Promise<Buffer> {
  // This is a placeholder for ZIP generation
  // In a real implementation, you would use a library like jszip
  
  const zipContent = `
    PAYSLIPS FOR ${period.month}/${period.year}
    ================================================
    
    Total Employees: ${payslips.length}
    Generated: ${new Date().toISOString()}
    
    Files included:
    ${payslips.map(p => `- payslip-${p.employeeNumber}-${period.month}-${period.year}.pdf`).join('\n')}
    
    SUMMARY:
    ================================================
    Total Gross Salary: $${payslips.reduce((sum, p) => sum + (p.data.payroll.grossSalary || 0), 0).toFixed(2)}
    Total Net Salary: $${payslips.reduce((sum, p) => sum + (p.data.payroll.netSalary || 0), 0).toFixed(2)}
    Total Deductions: $${payslips.reduce((sum, p) => sum + (p.data.payroll.totalDeductions || 0), 0).toFixed(2)}
  `

  // Convert to Buffer (placeholder implementation)
  return Buffer.from(zipContent, 'utf-8')
}