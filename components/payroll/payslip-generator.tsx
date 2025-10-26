"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Eye, Calendar, User, DollarSign } from "lucide-react"
import { toast } from "sonner"
import { PayslipPreview } from "./payslip-preview"

interface PayslipGeneratorProps {
  payrollRecords: any[]
  employees: any[]
}

export function PayslipGenerator({ payrollRecords, employees }: PayslipGeneratorProps) {
  const [selectedPayroll, setSelectedPayroll] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)

  const handleGeneratePayslip = async (format: 'pdf' | 'json') => {
    if (!selectedPayroll) {
      toast.error("Please select a payroll record")
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/payslips/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payrollId: selectedPayroll,
          format: format
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate payslip')
      }

      if (format === 'pdf') {
        // Handle HTML download (printable payslip)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `payslip-${selectedPayroll}.html`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast.success("Payslip HTML downloaded successfully - you can print this file")
      } else {
        // Handle JSON preview
        const data = await response.json()
        setPreviewData(data.data)
        toast.success("Payslip data loaded for preview")
      }
    } catch (error: any) {
      console.error('Payslip generation error:', error)
      toast.error(error.message || 'Failed to generate payslip')
    } finally {
      setIsGenerating(false)
    }
  }

  const selectedRecord = payrollRecords.find(record => record.id === selectedPayroll)
  const selectedEmployee = selectedRecord ? employees.find(emp => emp.id === selectedRecord.employee_id) : null

  // Helper function to generate HTML payslip
  const generateHTMLPayslip = (payslipData: any) => {
    return `
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
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Payslip
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Payroll Record</label>
            <Select value={selectedPayroll || undefined} onValueChange={setSelectedPayroll}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a payroll record to generate payslip for" />
              </SelectTrigger>
              <SelectContent>
                {payrollRecords.map((record) => {
                  const employee = employees.find(emp => emp.id === record.employee_id)
                  return (
                    <SelectItem key={record.id} value={record.id}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{employee?.first_name} {employee?.last_name}</span>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant="outline">{record.month}/{record.year}</Badge>
                          <Badge variant={record.payment_status === 'paid' ? 'default' : 'secondary'}>
                            {record.payment_status}
                          </Badge>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {selectedRecord && selectedEmployee && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <h4 className="font-medium text-gray-900">Selected Record Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Employee:</span>
                  <p className="font-medium">{selectedEmployee.first_name} {selectedEmployee.last_name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Period:</span>
                  <p className="font-medium">{selectedRecord.month}/{selectedRecord.year}</p>
                </div>
                <div>
                  <span className="text-gray-600">Gross Salary:</span>
                  <p className="font-medium">${selectedRecord.gross_salary?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Net Salary:</span>
                  <p className="font-medium">${selectedRecord.net_salary?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => handleGeneratePayslip('pdf')}
              disabled={!selectedPayroll || isGenerating}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Download HTML'}
            </Button>
            
            <Button
              onClick={() => handleGeneratePayslip('json')}
              disabled={!selectedPayroll || isGenerating}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {previewData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Payslip Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PayslipPreview 
              payslipData={previewData}
              onPrint={() => {
                // Open the HTML file in a new window for printing
                const blob = new Blob([generateHTMLPayslip(previewData)], { type: 'text/html' })
                const url = URL.createObjectURL(blob)
                const printWindow = window.open(url, '_blank')
                if (printWindow) {
                  printWindow.onload = () => printWindow.print()
                }
              }}
              onDownload={() => {
                // Download the HTML file
                const blob = new Blob([generateHTMLPayslip(previewData)], { type: 'text/html' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `payslip-${previewData.employee.number}-${previewData.payroll.period}.html`
                document.body.appendChild(a)
                a.click()
                URL.revokeObjectURL(url)
                document.body.removeChild(a)
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
