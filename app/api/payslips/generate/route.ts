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
  
  // Create a proper HTML payslip matching the exact design from the existing payslip page
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
          padding: 0; 
          background: white;
          color: #333;
        }
        .payslip-container {
          max-width: 5xl;
          margin: 0 auto;
          background: white;
        }
        .company-header {
          background: #374151;
          color: white;
          padding: 24px;
          text-align: center;
        }
        .company-header .logo-section {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .company-header img {
          height: 64px;
          width: 64px;
          margin-right: 16px;
        }
        .company-header h1 {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
        }
        .company-header p {
          font-size: 14px;
          color: #d1d5db;
          margin: 0;
        }
        .payslip-content {
          padding: 32px;
        }
        .employee-table, .earnings-table, .net-pay-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #9ca3af;
          font-size: 14px;
          margin-bottom: 24px;
        }
        .employee-table td, .earnings-table td, .earnings-table th, .net-pay-table td {
          border: 1px solid #9ca3af;
          padding: 8px 12px;
        }
        .employee-table td:first-child, .earnings-table th:first-child {
          background: #f3f4f6;
          font-weight: 500;
        }
        .earnings-table th {
          background: #f3f4f6;
          font-weight: 500;
        }
        .earnings-table tr:last-child {
          background: #f3f4f6;
          font-weight: 500;
        }
        .net-pay-table tr:first-child {
          background: #374151;
          color: white;
        }
        .net-pay-table tr:first-child td {
          font-weight: 500;
        }
        .net-pay-table tr:last-child td:last-child {
          font-weight: bold;
        }
        .text-right {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
        @media print {
          body { margin: 0; padding: 0; }
          .payslip-container { box-shadow: none; border: none; }
        }
      </style>
    </head>
    <body>
      <div class="payslip-container">
        <!-- Header -->
        <div class="company-header">
          <div class="logo-section">
            <img src="/logo.png" alt="Genius Security Logo" />
            <h1>GENIUS SECURITY (PVT) LTD</h1>
          </div>
          <p>For Genuine Security Solutions</p>
        </div>

        <div class="payslip-content">
          <!-- Employee Information Table -->
          <table class="employee-table">
            <tbody>
              <tr>
                <td style="width: 25%;">Employee Number</td>
                <td style="width: 25%;">${payslipData.employee.number}</td>
                <td style="width: 25%;">Pay Point</td>
                <td style="width: 25%;">${payslipData.employee.city || 'N/A'}</td>
              </tr>
              <tr>
                <td>Employee Name</td>
                <td>${payslipData.employee.name}</td>
                <td>Nostro Account Number</td>
                <td>${payslipData.employee.accountNumber || '0000000000'}</td>
              </tr>
              <tr>
                <td>Department</td>
                <td>${payslipData.employee.department || 'Operations'}</td>
                <td>Bank</td>
                <td>${payslipData.employee.bank || 'POHBS BANK'}</td>
              </tr>
              <tr>
                <td>I.D. Number</td>
                <td>${payslipData.employee.idNumber || 'N/A'}</td>
                <td>Employment Status</td>
                <td>${payslipData.employee.employmentStatus || 'N/A'}</td>
              </tr>
              <tr>
                <td>Position</td>
                <td>${payslipData.employee.position}</td>
                <td>ZWL Account Number</td>
                <td>${payslipData.employee.zwlAccountNumber || 'N/A'}</td>
              </tr>
              <tr>
                <td>Branch Code</td>
                <td>${payslipData.employee.branchCode || 'N/A'}</td>
                <td>Bank</td>
                <td>${payslipData.employee.bank || 'N/A'}</td>
              </tr>
              <tr>
                <td>Employment Type</td>
                <td>Contract</td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <!-- Earnings and Deductions Table -->
          <table class="earnings-table">
            <thead>
              <tr>
                <th style="width: 20%;">EARNINGS</th>
                <th style="width: 15%;" class="text-right">USD</th>
                <th style="width: 15%;" class="text-right">ZWL</th>
                <th style="width: 20%;">DEDUCTIONS</th>
                <th style="width: 15%;" class="text-right">USD</th>
                <th style="width: 15%;" class="text-right">ZWL</th>
              </tr>
            </thead>
            <tbody>
              ${(() => {
                const fx = Number(payslipData.payroll.exchangeRate || 0)
                const toZwl = (usd: number) => (fx > 0 ? usd * fx : 0)
                const usdBasic = Number(payslipData.payroll.basicSalary || 0)
                const usdTransport = Number(payslipData.payroll.transportAllowance || 0)
                const usdOtherAllowances = Math.max(0, Number(payslipData.payroll.allowances || 0) - usdTransport)
                const usdNssa = Number(payslipData.payroll.nssaDeduction || 0)
                const usdPayee = Number(payslipData.payroll.payeeDeduction || 0)
                const usdOtherDeductions = Math.max(0, Number(payslipData.payroll.deductions || 0) - usdNssa - usdPayee)
                const usdGross = Number(payslipData.payroll.grossSalary || 0)
                const usdTotalDeductions = Number(payslipData.payroll.totalDeductions || 0)

                return `
                  <tr>
                    <td>Basic</td>
                    <td class="text-right">${usdBasic.toFixed(2)}</td>
                    <td class="text-right">${toZwl(usdBasic).toFixed(2)}</td>
                    <td>NSSA</td>
                    <td class="text-right">-${usdNssa.toFixed(2)}</td>
                    <td class="text-right">-${toZwl(usdNssa).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Transport Allowance</td>
                    <td class="text-right">${usdTransport.toFixed(2)}</td>
                    <td class="text-right">${toZwl(usdTransport).toFixed(2)}</td>
                    <td>PAYEE</td>
                    <td class="text-right">-${usdPayee.toFixed(2)}</td>
                    <td class="text-right">-${toZwl(usdPayee).toFixed(2)}</td>
                  </tr>
                  ${(usdOtherAllowances > 0 || usdOtherDeductions > 0) ? `
                    <tr>
                      <td>Other Allowances</td>
                      <td class="text-right">${usdOtherAllowances.toFixed(2)}</td>
                      <td class="text-right">${toZwl(usdOtherAllowances).toFixed(2)}</td>
                      <td>Other Deductions</td>
                      <td class="text-right">-${usdOtherDeductions.toFixed(2)}</td>
                      <td class="text-right">-${toZwl(usdOtherDeductions).toFixed(2)}</td>
                    </tr>
                  ` : ''}
                  <tr>
                    <td>GROSS</td>
                    <td class="text-right">${usdGross.toFixed(2)}</td>
                    <td class="text-right">${toZwl(usdGross).toFixed(2)}</td>
                    <td>TOTAL DEDUCTIONS</td>
                    <td class="text-right">${usdTotalDeductions.toFixed(2)}</td>
                    <td class="text-right">${toZwl(usdTotalDeductions).toFixed(2)}</td>
                  </tr>
                `
              })()}
            </tbody>
          </table>

          <!-- Net Pay Table -->
          <table class="net-pay-table">
            <tbody>
              <tr>
                <td class="text-center">Net Paid</td>
                <td class="text-right">USD</td>
                <td class="text-right">ZWL</td>
              </tr>
              <tr>
                <td></td>
                <td class="text-right">${Number(payslipData.payroll.netSalary || 0).toFixed(2)}</td>
                <td class="text-right">${(Number(payslipData.payroll.exchangeRate || 0) > 0 ? (Number(payslipData.payroll.netSalary || 0) * Number(payslipData.payroll.exchangeRate)).toFixed(2) : '—')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </body>
    </html>
  `

  console.log('✅ [PDF GENERATION] HTML content created')
  
  // For now, return the HTML as a buffer (in production, you'd use puppeteer or similar)
  // This will create a downloadable HTML file that can be printed
  return Buffer.from(htmlContent, 'utf-8')
}
