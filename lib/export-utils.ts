// Utility functions for exporting data

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    alert('No data to export')
    return
  }

  // Get headers from the first object
  const headers = Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value || ''
      }).join(',')
    )
  ].join('\n')

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportPayrollToCSV(payrollRecords: any[]) {
  const exportData = payrollRecords.map(record => ({
    'Employee ID': record.employees?.employee_id || '',
    'Employee Name': record.employees ? `${record.employees.first_name} ${record.employees.last_name}` : '',
    'Job Title': record.employees?.job_title || '',
    'Month': getMonthName(record.month),
    'Year': record.year,
    'Basic Salary': record.basic_salary,
    'Transport Allowance': record.transport_allowance ?? 0,
    'Other Allowances': (record.allowances ?? 0) - (record.transport_allowance ?? 0),
    'Overtime Pay': record.overtime_pay,
    'Gross Salary': record.gross_salary,
    'NSSA Deduction': record.nssa_deduction ?? 0,
    'PAYE Deduction': record.payee_deduction ?? 0,
    'Other Deductions': Math.max(0, (record.deductions ?? 0) - (record.nssa_deduction ?? 0) - (record.payee_deduction ?? 0)),
    'Total Deductions': record.deductions,
    'Net Salary': record.net_salary,
    'Exchange Rate (ZWL per USD)': record.exchange_rate ?? 0,
    'Net Salary (ZWL)': record.exchange_rate ? (record.net_salary * record.exchange_rate) : 0,
    'Days Worked': record.days_worked,
    'Days Absent': record.days_absent,
    'Payment Status': record.payment_status,
    'Payment Date': record.payment_date || '',
    'Payment Method': record.payment_method || '',
    'Notes': record.notes || ''
  }))

  exportToCSV(exportData, 'payroll-records')
}

export function exportEmployeesToCSV(employees: any[]) {
  const exportData = employees.map(emp => ({
    'Employee ID': emp.employee_id,
    'First Name': emp.first_name,
    'Last Name': emp.last_name,
    'Email': emp.email,
    'Phone': emp.phone || '',
    'Job Title': emp.job_title,
    'Department': emp.department || '',
    'Employment Status': emp.employment_status,
    'Hire Date': emp.hire_date,
    'Date of Birth': emp.date_of_birth || '',
    'Gender': emp.gender || '',
    'Address': emp.address || '',
    'City': emp.city || '',
    'State': emp.state || '',
    'Postal Code': emp.postal_code || '',
    'Bank Name': emp.bank_name || '',
    'Account Number': emp.account_number || '',
    'IFSC Code': emp.ifsc_code || '',
    'PAN Number': emp.pan_number || '',
    'Aadhar Number': emp.aadhar_number || '',
    'Emergency Contact Name': emp.emergency_contact_name || '',
    'Emergency Contact Phone': emp.emergency_contact_phone || '',
    'Emergency Contact Relationship': emp.emergency_contact_relationship || ''
  }))

  exportToCSV(exportData, 'employee-records')
}

function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[month - 1] || ''
}

// PDF Export functionality (basic implementation)
export function generatePayslipPDF(payrollData: any) {
  // This would typically use a library like jsPDF or Puppeteer
  // For now, we'll use the browser's print functionality
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const payslipHTML = generatePayslipHTML(payrollData)
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payslip - ${payrollData.employees.first_name} ${payrollData.employees.last_name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #111; }
        .header { text-align: center; background: #222; color: white; padding: 20px; margin-bottom: 20px; }
        .brand { display: inline-flex; align-items: center; gap: 12px; }
        .logo { height: 56px; width: auto; background: #ffffff; border-radius: 10px; padding: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.2); }
        .subtle { color: #cbd5e1; font-size: 12px; }
        .note { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; padding: 8px 12px; border-radius: 6px; margin-bottom: 14px; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f7f7f7; font-weight: bold; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .muted { color: #555; }
        .row-accent { background: #fafafa; font-weight: 600; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      ${payslipHTML}
    </body>
    </html>
  `)
  
  printWindow.document.close()
  printWindow.focus()
  
  // Auto print after a short delay
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 500)
}

function generatePayslipHTML(payrollData: any): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  return `
    <div class="header">
      <div class="brand">
        <img class="logo" src="/logo.png" alt="Genius Security Logo" />
        <div>
          <h1>GENIUS SECURITY (PVT) LTD</h1>
          <div class="subtle">For Genuine Security Solutions</div>
        </div>
      </div>
    </div>
    ${Number(payrollData.exchange_rate || 0) > 0 ? `<div class="note">Exchange Rate: 1 USD = ${Number(payrollData.exchange_rate).toLocaleString()} ZWL</div>` : ''}
    
    <table>
      <tr>
        <th>Employee Number</th>
        <td>${payrollData.employees.employee_id}</td>
        <th>Pay Point</th>
        <td>Harare</td>
      </tr>
      <tr>
        <th>Employee Name</th>
        <td>${payrollData.employees.first_name} ${payrollData.employees.last_name}</td>
        <th>Nostro Account Number (USD)</th>
        <td>${payrollData.employees.nostro_account_number || payrollData.employees.account_number || 'N/A'}</td>
      </tr>
      <tr>
        <th>Department</th>
        <td>${payrollData.employees.department || 'Operations'}</td>
        <th>Bank</th>
        <td>${payrollData.employees.bank_name || 'POHBS BANK'}</td>
      </tr>
      <tr>
        <th>Position</th>
        <td>${payrollData.employees.job_title}</td>
        <th>Period</th>
        <td>${monthNames[payrollData.month - 1]} ${payrollData.year}</td>
      </tr>
      <tr>
        <th>ZWL Account Number</th>
        <td>${payrollData.employees.zwl_account_number || 'N/A'}</td>
        <th>Branch Code</th>
        <td>${payrollData.employees.branch_code || payrollData.employees.ifsc_code || 'N/A'}</td>
      </tr>
    </table>
    
    <table>
      <tr>
        <th>EARNINGS</th>
        <th class="text-right">USD</th>
        <th class="text-right">ZWL</th>
        <th>DEDUCTIONS</th>
        <th class="text-right">USD</th>
        <th class="text-right">ZWL</th>
      </tr>
      ${(() => {
        const fx = Number(payrollData.exchange_rate || 0)
        const toZwl = (usd: number) => (fx > 0 ? usd * fx : 0)
        const usdBasic = Number(payrollData.basic_salary || 0)
        const usdTransport = Number(payrollData.transport_allowance || 0)
        const usdOtherAllowances = Math.max(0, Number(payrollData.allowances || 0) - usdTransport)
        const usdNssa = Number(payrollData.nssa_deduction || 0)
        const usdPayee = Number(payrollData.payee_deduction || 0)
        const usdOtherDeductions = Math.max(0, Number(payrollData.deductions || 0) - usdNssa - usdPayee)
        const usdGross = Number(payrollData.gross_salary || 0)
        const usdTotalDeductions = Number(payrollData.deductions || 0)

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
        ${usdOtherAllowances > 0 || usdOtherDeductions > 0 ? `
        <tr>
          <td>Other Allowances</td>
          <td class="text-right">${usdOtherAllowances.toFixed(2)}</td>
          <td class="text-right">${toZwl(usdOtherAllowances).toFixed(2)}</td>
          <td>Other Deductions</td>
          <td class="text-right">-${usdOtherDeductions.toFixed(2)}</td>
          <td class="text-right">-${toZwl(usdOtherDeductions).toFixed(2)}</td>
        </tr>` : ''}
        <tr class="row-accent">
          <td>GROSS</td>
          <td class="text-right">${usdGross.toFixed(2)}</td>
          <td class="text-right">${toZwl(usdGross).toFixed(2)}</td>
          <td>TOTAL DEDUCTIONS</td>
          <td class="text-right">${usdTotalDeductions.toFixed(2)}</td>
          <td class="text-right">${toZwl(usdTotalDeductions).toFixed(2)}</td>
        </tr>
        `
      })()}
    </table>
    
    <table>
      <tr style="background-color: #1f2937; color: white;">
        <th class="text-center">Net Paid</th>
        <th class="text-right">USD</th>
        <th class="text-right">ZWL</th>
      </tr>
      <tr>
        <td></td>
        <td class="text-right" style="font-weight: bold; font-size: 18px;">${Number(payrollData.net_salary || 0).toFixed(2)}</td>
        <td class="text-right" style="font-weight: bold;">${(Number(payrollData.exchange_rate || 0) > 0 ? (Number(payrollData.net_salary || 0) * Number(payrollData.exchange_rate)).toFixed(2) : (0).toFixed(2))}</td>
      </tr>
    </table>
  `
}

