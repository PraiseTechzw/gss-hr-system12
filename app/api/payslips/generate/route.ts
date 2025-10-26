import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthService } from '@/lib/auth'
import { ZimraTaxCalculator } from '@/lib/tax/zimra-calculator'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [PAYSLIP GENERATE] Starting individual payslip generation...')

    const body = await request.json()
    const { payrollId, format = 'pdf' } = body

    console.log('📝 [PAYSLIP GENERATE] Request body:', { payrollId, format })

    if (!payrollId) {
      console.log('❌ [PAYSLIP GENERATE] Missing payrollId')
      return NextResponse.json({ 
        error: 'Missing required field: payrollId' 
      }, { status: 400 })
    }

    const supabase = await createClient()
    console.log('✅ [PAYSLIP GENERATE] Supabase client created')

    // Get payroll record with employee details
    console.log('🔍 [PAYSLIP GENERATE] Fetching payroll record with ID:', payrollId)

    const { data: payrollRecord, error: payrollError } = await supabase
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
      .eq('id', payrollId)
      .single()

    console.log('📊 [PAYSLIP GENERATE] Query result:', { 
      hasData: !!payrollRecord, 
      hasError: !!payrollError,
      errorMessage: payrollError?.message,
      errorCode: payrollError?.code,
      errorDetails: payrollError?.details
    })

    if (payrollError) {
      console.log('❌ [PAYSLIP GENERATE] Database error:', payrollError)
      return NextResponse.json({ 
        error: 'Database error',
        details: payrollError.message 
      }, { status: 500 })
    }

    if (!payrollRecord) {
      console.log('❌ [PAYSLIP GENERATE] Payroll record not found for ID:', payrollId)
      return NextResponse.json({ 
        error: 'Payroll record not found' 
      }, { status: 404 })
    }

    console.log('✅ [PAYSLIP GENERATE] Payroll record found:', {
      id: payrollRecord.id,
      employeeId: payrollRecord.employee_id,
      month: payrollRecord.month,
      year: payrollRecord.year
    })

    const employee = payrollRecord.employees
    console.log('👤 [PAYSLIP GENERATE] Employee data:', {
      hasEmployee: !!employee,
      employeeId: employee?.id,
      name: employee ? `${employee.first_name} ${employee.last_name}` : 'N/A'
    })

    // Generate payslip data
    console.log('🔧 [PAYSLIP GENERATE] Generating payslip data...')
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
        period: `${payrollRecord.month}/${payrollRecord.year}`,
        payPeriodStart: payrollRecord.pay_period_start,
        payPeriodEnd: payrollRecord.pay_period_end,
        grossSalary: payrollRecord.gross_salary,
        basicSalary: payrollRecord.basic_salary,
        allowances: payrollRecord.allowances,
        transportAllowance: payrollRecord.transport_allowance,
        overtimePay: payrollRecord.overtime_pay,
        totalAllowances: payrollRecord.total_allowances || 0,
        deductions: payrollRecord.deductions,
        nssaDeduction: payrollRecord.nssa_deduction,
        payeeDeduction: payrollRecord.payee_deduction,
        totalDeductions: payrollRecord.total_deductions || 0,
        netSalary: payrollRecord.net_salary,
        exchangeRate: payrollRecord.exchange_rate,
        daysWorked: payrollRecord.days_worked,
        daysAbsent: payrollRecord.days_absent,
        paymentStatus: payrollRecord.payment_status,
        paymentDate: payrollRecord.payment_date,
        paymentMethod: payrollRecord.payment_method
      },
      generatedAt: new Date().toISOString(),
      notes: payrollRecord.notes || ''
    }

    console.log('📄 [PAYSLIP GENERATE] Format requested:', format)

    if (format === 'pdf') {
      console.log('🔧 [PAYSLIP GENERATE] Generating PDF...')
      // Generate PDF payslip
      const pdfBuffer = await generatePayslipPDF(payslipData)
      console.log('✅ [PAYSLIP GENERATE] PDF generated successfully')
      
      return new NextResponse(pdfBuffer as any, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="payslip-${employee.employee_id}-${payrollRecord.month}-${payrollRecord.year}.html"`
        }
      })
    } else {
      console.log('📊 [PAYSLIP GENERATE] Returning JSON data')
      // Return JSON data
      return NextResponse.json({
        success: true,
        data: payslipData
      })
    }

  } catch (error) {
    console.error('❌ [PAYSLIP GENERATE] Unexpected error:', error)
    console.error('❌ [PAYSLIP GENERATE] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function generatePayslipPDF(payslipData: any): Promise<Buffer> {
  console.log('🔧 [PDF GENERATION] Creating payslip PDF...')
  
  // Create a proper HTML payslip that can be converted to PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payslip - ${payslipData.employee.name}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 20px; 
          background: white;
          color: #333;
        }
        .header { 
          text-align: center; 
          border-bottom: 3px solid #a2141e; 
          padding-bottom: 20px; 
          margin-bottom: 30px;
        }
        .company-name { 
          font-size: 24px; 
          font-weight: bold; 
          color: #a2141e; 
          margin-bottom: 10px;
        }
        .company-details { 
          font-size: 14px; 
          color: #666; 
        }
        .payslip-title { 
          font-size: 20px; 
          font-weight: bold; 
          text-align: center; 
          margin: 20px 0; 
          color: #a2141e;
        }
        .employee-section, .earnings-section, .deductions-section { 
          margin: 20px 0; 
          padding: 15px; 
          border: 1px solid #ddd; 
          border-radius: 5px;
        }
        .section-title { 
          font-size: 16px; 
          font-weight: bold; 
          color: #a2141e; 
          margin-bottom: 15px; 
          border-bottom: 1px solid #eee; 
          padding-bottom: 5px;
        }
        .employee-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 15px; 
        }
        .employee-item { 
          margin-bottom: 8px; 
        }
        .employee-label { 
          font-weight: bold; 
          color: #666; 
        }
        .earnings-table, .deductions-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 10px;
        }
        .earnings-table th, .deductions-table th { 
          background: #f5f5f5; 
          padding: 10px; 
          text-align: left; 
          border: 1px solid #ddd;
        }
        .earnings-table td, .deductions-table td { 
          padding: 10px; 
          border: 1px solid #ddd;
        }
        .amount { 
          text-align: right; 
          font-weight: bold; 
        }
        .total-row { 
          background: #f9f9f9; 
          font-weight: bold;
        }
        .net-pay { 
          background: #e8f5e8; 
          color: #2d5a2d; 
          font-size: 18px; 
          font-weight: bold;
        }
        .footer { 
          margin-top: 30px; 
          text-align: center; 
          font-size: 12px; 
          color: #666; 
          border-top: 1px solid #eee; 
          padding-top: 15px;
        }
        @media print {
          body { margin: 0; padding: 15px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">${payslipData.company.name}</div>
        <div class="company-details">
          ${payslipData.company.address}<br>
          Phone: ${payslipData.company.phone} | Email: ${payslipData.company.email}
        </div>
      </div>
      
      <div class="payslip-title">PAYSLIP FOR PERIOD: ${payslipData.payroll.period}</div>
      
      <div class="employee-section">
        <div class="section-title">EMPLOYEE DETAILS</div>
        <div class="employee-grid">
          <div class="employee-item">
            <span class="employee-label">Employee Number:</span> ${payslipData.employee.number}
          </div>
          <div class="employee-item">
            <span class="employee-label">Name:</span> ${payslipData.employee.name}
          </div>
          <div class="employee-item">
            <span class="employee-label">Department:</span> ${payslipData.employee.department}
          </div>
          <div class="employee-item">
            <span class="employee-label">Position:</span> ${payslipData.employee.position}
          </div>
          <div class="employee-item">
            <span class="employee-label">Email:</span> ${payslipData.employee.email}
          </div>
          <div class="employee-item">
            <span class="employee-label">Phone:</span> ${payslipData.employee.phone}
          </div>
          <div class="employee-item">
            <span class="employee-label">ID Number:</span> ${payslipData.employee.idNumber}
          </div>
          <div class="employee-item">
            <span class="employee-label">Employment Type:</span> ${payslipData.employee.employmentType}
          </div>
        </div>
      </div>
      
      <div class="earnings-section">
        <div class="section-title">EARNINGS</div>
        <table class="earnings-table">
          <tr>
            <th>Description</th>
            <th class="amount">Amount (USD)</th>
          </tr>
          <tr>
            <td>Basic Salary</td>
            <td class="amount">$${payslipData.payroll.basicSalary.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Allowances</td>
            <td class="amount">$${payslipData.payroll.allowances.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Transport Allowance</td>
            <td class="amount">$${payslipData.payroll.transportAllowance.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Overtime Pay</td>
            <td class="amount">$${payslipData.payroll.overtimePay.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td><strong>GROSS SALARY</strong></td>
            <td class="amount"><strong>$${payslipData.payroll.grossSalary.toFixed(2)}</strong></td>
          </tr>
        </table>
      </div>
      
      <div class="deductions-section">
        <div class="section-title">DEDUCTIONS</div>
        <table class="deductions-table">
          <tr>
            <th>Description</th>
            <th class="amount">Amount (USD)</th>
          </tr>
          <tr>
            <td>NSSA Deduction</td>
            <td class="amount">$${payslipData.payroll.nssaDeduction.toFixed(2)}</td>
          </tr>
          <tr>
            <td>PAYE Deduction</td>
            <td class="amount">$${payslipData.payroll.payeeDeduction.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Other Deductions</td>
            <td class="amount">$${payslipData.payroll.deductions.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td><strong>TOTAL DEDUCTIONS</strong></td>
            <td class="amount"><strong>$${payslipData.payroll.totalDeductions.toFixed(2)}</strong></td>
          </tr>
        </table>
      </div>
      
      <div style="margin: 20px 0; padding: 15px; background: #e8f5e8; border-radius: 5px;">
        <div style="text-align: center; font-size: 20px; font-weight: bold; color: #2d5a2d;">
          NET PAY: $${payslipData.payroll.netSalary.toFixed(2)}
        </div>
      </div>
      
      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
        <div class="section-title">PAYMENT DETAILS</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div><strong>Payment Status:</strong> ${payslipData.payroll.paymentStatus.toUpperCase()}</div>
          <div><strong>Payment Date:</strong> ${payslipData.payroll.paymentDate || 'Pending'}</div>
          <div><strong>Payment Method:</strong> ${payslipData.payroll.paymentMethod || 'Bank Transfer'}</div>
          <div><strong>Exchange Rate:</strong> ${payslipData.payroll.exchangeRate} ZWL per USD</div>
          <div><strong>Days Worked:</strong> ${payslipData.payroll.daysWorked}</div>
          <div><strong>Days Absent:</strong> ${payslipData.payroll.daysAbsent}</div>
        </div>
        ${payslipData.notes ? `<div style="margin-top: 10px;"><strong>Notes:</strong> ${payslipData.notes}</div>` : ''}
      </div>
      
      <div class="footer">
        Generated on: ${new Date(payslipData.generatedAt).toLocaleDateString()}<br>
        This is a computer-generated payslip.
      </div>
    </body>
    </html>
  `

  console.log('✅ [PDF GENERATION] HTML content created')
  
  // For now, return the HTML as a buffer (in production, you'd use puppeteer or similar)
  // This will create a downloadable HTML file that can be printed
  return Buffer.from(htmlContent, 'utf-8')
}
