"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Print, Download, FileText, User, DollarSign, Calendar, Building } from "lucide-react"

interface PayslipPreviewProps {
  payslipData: any
  onPrint?: () => void
  onDownload?: () => void
}

export function PayslipPreview({ payslipData, onPrint, onDownload }: PayslipPreviewProps) {
  if (!payslipData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No payslip data to preview</p>
        </CardContent>
      </Card>
    )
  }

  const { company, employee, payroll } = payslipData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center border-b-2 border-red-600 pb-6 mb-8">
        <h1 className="text-2xl font-bold text-red-600 mb-2">{company.name}</h1>
        <p className="text-gray-600">{company.address}</p>
        <p className="text-sm text-gray-500">Phone: {company.phone} | Email: {company.email}</p>
      </div>

      {/* Payslip Title */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-red-600">PAYSLIP FOR PERIOD: {payroll.period}</h2>
        <p className="text-sm text-gray-600">
          {payroll.payPeriodStart} to {payroll.payPeriodEnd}
        </p>
      </div>

      {/* Employee Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <User className="h-5 w-5" />
            Employee Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Employee Number</p>
              <p className="font-semibold">{employee.number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-semibold">{employee.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="font-semibold">{employee.department}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Position</p>
              <p className="font-semibold">{employee.position}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold">{employee.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-semibold">{employee.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ID Number</p>
              <p className="font-semibold">{employee.idNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Employment Type</p>
              <p className="font-semibold">{employee.employmentType}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earnings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <DollarSign className="h-5 w-5" />
            Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Basic Salary</span>
              <span className="font-semibold">${payroll.basicSalary.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Allowances</span>
              <span className="font-semibold">${payroll.allowances.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Transport Allowance</span>
              <span className="font-semibold">${payroll.transportAllowance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Overtime Pay</span>
              <span className="font-semibold">${payroll.overtimePay.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-lg font-bold text-green-600">
              <span>GROSS SALARY</span>
              <span>${payroll.grossSalary.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deductions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <DollarSign className="h-5 w-5" />
            Deductions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>NSSA Deduction</span>
              <span className="font-semibold">${payroll.nssaDeduction.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>PAYE Deduction</span>
              <span className="font-semibold">${payroll.payeeDeduction.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Other Deductions</span>
              <span className="font-semibold">${payroll.deductions.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-lg font-bold text-red-600">
              <span>TOTAL DEDUCTIONS</span>
              <span>${payroll.totalDeductions.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Net Pay */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-green-600 mb-2">NET PAY</h3>
            <p className="text-3xl font-bold text-green-700">${payroll.netSalary.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <Calendar className="h-5 w-5" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <Badge variant={payroll.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                {payroll.paymentStatus.toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Date</p>
              <p className="font-semibold">{payroll.paymentDate || 'Pending'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-semibold">{payroll.paymentMethod || 'Bank Transfer'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Exchange Rate</p>
              <p className="font-semibold">{payroll.exchangeRate} ZWL per USD</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Days Worked</p>
              <p className="font-semibold">{payroll.daysWorked}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Days Absent</p>
              <p className="font-semibold">{payroll.daysAbsent}</p>
            </div>
          </div>
          {payslipData.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Notes:</p>
              <p className="font-semibold">{payslipData.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button onClick={onPrint} className="flex items-center gap-2">
          <Print className="h-4 w-4" />
          Print Payslip
        </Button>
        <Button onClick={onDownload} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download HTML
        </Button>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 border-t pt-4">
        <p>Generated on: {new Date(payslipData.generatedAt).toLocaleDateString()}</p>
        <p>This is a computer-generated payslip.</p>
      </div>
    </div>
  )
}
