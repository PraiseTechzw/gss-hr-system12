import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthService } from '@/lib/auth'
import { ZimraTaxCalculator } from '@/lib/tax/zimra-calculator'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') // 'zimra', 'nssa', 'summary'
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const format = searchParams.get('format') || 'json'

    if (!reportType || !month || !year) {
      return NextResponse.json({ 
        error: 'Missing required parameters: type, month, year' 
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Get payroll period
    const { data: payrollPeriod, error: periodError } = await supabase
      .from('payroll_periods')
      .select('*')
      .eq('month', parseInt(month))
      .eq('year', parseInt(year))
      .single()

    if (periodError || !payrollPeriod) {
      return NextResponse.json({ 
        error: 'Payroll period not found' 
      }, { status: 404 })
    }

    // Get payroll records for the period
    const { data: payrollRecords, error: recordsError } = await supabase
      .from('payroll_records')
      .select(`
        *,
        employees (
          id,
          employee_number,
          position,
          id_number,
          nssa_number,
          users (full_name, email),
          departments (name)
        )
      `)
      .eq('payroll_period_id', payrollPeriod.id)

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

    let reportData: any = {}

    switch (reportType) {
      case 'zimra':
        reportData = generateZIMRAReport(payrollRecords, payrollPeriod)
        break
      case 'nssa':
        reportData = generateNSSAReport(payrollRecords, payrollPeriod)
        break
      case 'summary':
        reportData = generateSummaryReport(payrollRecords, payrollPeriod)
        break
      default:
        return NextResponse.json({ 
          error: 'Invalid report type. Must be: zimra, nssa, or summary' 
        }, { status: 400 })
    }

    if (format === 'pdf') {
      // Generate PDF report
      const pdfBuffer = await generatePDFReport(reportType, reportData)
      
      return new NextResponse(pdfBuffer as any, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${reportType}-report-${month}-${year}.pdf"`
        }
      })
    } else {
      // Return JSON data
      return NextResponse.json({
        success: true,
        data: reportData
      })
    }

  } catch (error) {
    console.error('Compliance report error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function generateZIMRAReport(payrollRecords: any[], payrollPeriod: any) {
  const totalPAYE = payrollRecords.reduce((sum, record) => sum + record.paye, 0)
  const totalAidsLevy = payrollRecords.reduce((sum, record) => sum + record.aids_levy, 0)
  const totalGrossSalary = payrollRecords.reduce((sum, record) => sum + record.gross_salary_usd, 0)

  return {
    reportType: 'ZIMRA PAYE & AIDS Levy Report',
    period: `${payrollPeriod.month}/${payrollPeriod.year}`,
    company: 'Genius Security Services (Pvt) Ltd',
    generatedAt: new Date().toISOString(),
    summary: {
      totalEmployees: payrollRecords.length,
      totalGrossSalary,
      totalPAYE,
      totalAidsLevy,
      totalTax: totalPAYE + totalAidsLevy
    },
    employeeDetails: payrollRecords.map(record => ({
      employeeNumber: record.employees.employee_number,
      employeeName: record.employees.users.full_name,
      idNumber: record.employees.id_number,
      department: record.employees.departments.name,
      position: record.employees.position,
      grossSalary: record.gross_salary_usd,
      paye: record.paye,
      aidsLevy: record.aids_levy,
      totalTax: record.paye + record.aids_levy
    })),
    taxBrackets: {
      '0-100': payrollRecords.filter(r => r.gross_salary_usd <= 100).length,
      '100-300': payrollRecords.filter(r => r.gross_salary_usd > 100 && r.gross_salary_usd <= 300).length,
      '300-1000': payrollRecords.filter(r => r.gross_salary_usd > 300 && r.gross_salary_usd <= 1000).length,
      '1000-2000': payrollRecords.filter(r => r.gross_salary_usd > 1000 && r.gross_salary_usd <= 2000).length,
      '2000-3000': payrollRecords.filter(r => r.gross_salary_usd > 2000 && r.gross_salary_usd <= 3000).length,
      '3000+': payrollRecords.filter(r => r.gross_salary_usd > 3000).length
    }
  }
}

function generateNSSAReport(payrollRecords: any[], payrollPeriod: any) {
  const totalNSSA = payrollRecords.reduce((sum, record) => sum + record.nssa, 0)
  const totalGrossSalary = payrollRecords.reduce((sum, record) => sum + record.gross_salary_usd, 0)

  return {
    reportType: 'NSSA Contribution Report',
    period: `${payrollPeriod.month}/${payrollPeriod.year}`,
    company: 'Genius Security Services (Pvt) Ltd',
    generatedAt: new Date().toISOString(),
    summary: {
      totalEmployees: payrollRecords.length,
      totalGrossSalary,
      totalNSSA,
      nssaRate: '4.5%'
    },
    employeeDetails: payrollRecords.map(record => ({
      employeeNumber: record.employees.employee_number,
      employeeName: record.employees.users.full_name,
      nssaNumber: record.employees.nssa_number,
      department: record.employees.departments.name,
      position: record.employees.position,
      grossSalary: record.gross_salary_usd,
      nssaContribution: record.nssa
    })),
    contributionSummary: {
      totalContributions: totalNSSA,
      averageContribution: totalNSSA / payrollRecords.length,
      contributionRate: '4.5%'
    }
  }
}

function generateSummaryReport(payrollRecords: any[], payrollPeriod: any) {
  const totalGrossSalary = payrollRecords.reduce((sum, record) => sum + record.gross_salary_usd, 0)
  const totalPAYE = payrollRecords.reduce((sum, record) => sum + record.paye, 0)
  const totalAidsLevy = payrollRecords.reduce((sum, record) => sum + record.aids_levy, 0)
  const totalNSSA = payrollRecords.reduce((sum, record) => sum + record.nssa, 0)
  const totalDeductions = payrollRecords.reduce((sum, record) => sum + record.total_deductions, 0)
  const totalNetSalary = payrollRecords.reduce((sum, record) => sum + record.net_salary_usd, 0)

  return {
    reportType: 'Payroll Summary Report',
    period: `${payrollPeriod.month}/${payrollPeriod.year}`,
    company: 'Genius Security Services (Pvt) Ltd',
    generatedAt: new Date().toISOString(),
    summary: {
      totalEmployees: payrollRecords.length,
      totalGrossSalary,
      totalPAYE,
      totalAidsLevy,
      totalNSSA,
      totalDeductions,
      totalNetSalary
    },
    departmentBreakdown: payrollRecords.reduce((acc, record) => {
      const dept = record.employees.departments.name
      if (!acc[dept]) {
        acc[dept] = {
          employeeCount: 0,
          totalGrossSalary: 0,
          totalPAYE: 0,
          totalAidsLevy: 0,
          totalNSSA: 0,
          totalDeductions: 0,
          totalNetSalary: 0
        }
      }
      acc[dept].employeeCount++
      acc[dept].totalGrossSalary += record.gross_salary_usd
      acc[dept].totalPAYE += record.paye
      acc[dept].totalAidsLevy += record.aids_levy
      acc[dept].totalNSSA += record.nssa
      acc[dept].totalDeductions += record.total_deductions
      acc[dept].totalNetSalary += record.net_salary_usd
      return acc
    }, {}),
    compliance: {
      zimraCompliant: true,
      nssaCompliant: true,
      totalTaxObligations: totalPAYE + totalAidsLevy + totalNSSA
    }
  }
}

async function generatePDFReport(reportType: string, reportData: any): Promise<Buffer> {
  // This is a placeholder for PDF generation
  // In a real implementation, you would use a library like puppeteer, jsPDF, or PDFKit
  
  const pdfContent = `
    ${reportData.reportType}
    ================================================
    
    Company: ${reportData.company}
    Period: ${reportData.period}
    Generated: ${reportData.generatedAt}
    
    Summary:
    ${JSON.stringify(reportData.summary, null, 2)}
  `

  // Convert to Buffer (placeholder implementation)
  return Buffer.from(pdfContent, 'utf-8')
}
