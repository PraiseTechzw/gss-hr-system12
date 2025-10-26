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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

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
        setIsPreviewOpen(true)
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

  // Helper function to generate HTML payslip matching the exact design from the existing payslip page
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

      {/* Payslip Preview Full Screen */}
      {isPreviewOpen && (
        <PayslipPreview 
          payslipData={previewData}
          onClose={() => setIsPreviewOpen(false)}
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
      )}
    </div>
  )
}
