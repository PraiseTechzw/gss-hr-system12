"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Print, Download, FileText, User, DollarSign, Calendar, Building, ArrowLeft } from "lucide-react"

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
    <div className="bg-white min-h-screen">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-black">Back</span>
        </div>
        <Button 
          onClick={onPrint}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Print / Download
        </Button>
      </div>

      {/* Company Header */}
      <div className="bg-blue-900 text-white p-6">
        <div className="flex items-center gap-4">
          {/* Company Logo */}
          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 via-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <p className="text-blue-200">For Genuine Security Solutions</p>
          </div>
        </div>
      </div>

      {/* Employee Details Table */}
      <div className="p-6">
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div className="grid grid-cols-2">
            {/* Left Column */}
            <div className="border-r border-gray-300">
              <div className="p-4 border-b border-gray-300">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Employee Number:</span>
                  <span className="text-gray-900">{employee.number}</span>
                </div>
              </div>
              <div className="p-4 border-b border-gray-300">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Employee Name:</span>
                  <span className="text-gray-900">{employee.name}</span>
                </div>
              </div>
              <div className="p-4 border-b border-gray-300">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Department:</span>
                  <span className="text-gray-900">{employee.department}</span>
                </div>
              </div>
              <div className="p-4 border-b border-gray-300">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">I.D. Number:</span>
                  <span className="text-gray-900">{employee.idNumber}</span>
                </div>
              </div>
              <div className="p-4 border-b border-gray-300">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Position:</span>
                  <span className="text-gray-900">{employee.position}</span>
                </div>
              </div>
              <div className="p-4 border-b border-gray-300">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Branch Code:</span>
                  <span className="text-gray-900">1234</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Employment Type:</span>
                  <span className="text-gray-900">{employee.employmentType}</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="p-4 border-b border-gray-300">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Pay Point:</span>
                  <span className="text-gray-900">N/A</span>
                </div>
              </div>
              <div className="p-4 border-b border-gray-300">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Nostro Account Number:</span>
                  <span className="text-gray-900">{employee.accountNumber}</span>
                </div>
              </div>
              <div className="p-4 border-b border-gray-300">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Bank:</span>
                  <span className="text-gray-900">{employee.bank}</span>
                </div>
              </div>
              <div className="p-4 border-b border-gray-300">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Employment Status:</span>
                  <span className="text-gray-900">N/A</span>
                </div>
              </div>
              <div className="p-4 border-b border-gray-300">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">ZWL Account Number:</span>
                  <span className="text-gray-900">{employee.accountNumber}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Bank:</span>
                  <span className="text-gray-900">{employee.bank}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings and Deductions Tables */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Earnings Table */}
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-3 border-b border-gray-300">
              <h3 className="font-bold text-gray-800">EARNINGS</h3>
            </div>
            <div className="divide-y divide-gray-300">
              <div className="p-3 flex justify-between items-center">
                <span className="font-semibold text-gray-700">Basic:</span>
                <div className="flex gap-4">
                  <span className="text-right w-20">USD {payroll.basicSalary.toFixed(2)}</span>
                  <span className="text-right w-20">ZWL {(payroll.basicSalary * payroll.exchangeRate).toFixed(2)}</span>
                </div>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span className="font-semibold text-gray-700">Transport Allowance:</span>
                <div className="flex gap-4">
                  <span className="text-right w-20">USD {payroll.transportAllowance.toFixed(2)}</span>
                  <span className="text-right w-20">ZWL {(payroll.transportAllowance * payroll.exchangeRate).toFixed(2)}</span>
                </div>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span className="font-semibold text-gray-700">Other Allowances:</span>
                <div className="flex gap-4">
                  <span className="text-right w-20">USD {payroll.allowances.toFixed(2)}</span>
                  <span className="text-right w-20">ZWL {(payroll.allowances * payroll.exchangeRate).toFixed(2)}</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 border-t-2 border-gray-400 flex justify-between items-center">
                <span className="font-bold text-gray-800">GROSS:</span>
                <div className="flex gap-4">
                  <span className="text-right w-20 font-bold">USD {payroll.grossSalary.toFixed(2)}</span>
                  <span className="text-right w-20 font-bold">ZWL {(payroll.grossSalary * payroll.exchangeRate).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Deductions Table */}
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-3 border-b border-gray-300">
              <h3 className="font-bold text-gray-800">DEDUCTIONS</h3>
            </div>
            <div className="divide-y divide-gray-300">
              <div className="p-3 flex justify-between items-center">
                <span className="font-semibold text-gray-700">NSSA:</span>
                <div className="flex gap-4">
                  <span className="text-right w-20">USD -{payroll.nssaDeduction.toFixed(2)}</span>
                  <span className="text-right w-20">ZWL -{(payroll.nssaDeduction * payroll.exchangeRate).toFixed(2)}</span>
                </div>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span className="font-semibold text-gray-700">PAYEE:</span>
                <div className="flex gap-4">
                  <span className="text-right w-20">USD -{payroll.payeeDeduction.toFixed(2)}</span>
                  <span className="text-right w-20">ZWL -{(payroll.payeeDeduction * payroll.exchangeRate).toFixed(2)}</span>
                </div>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span className="font-semibold text-gray-700">Other Deductions:</span>
                <div className="flex gap-4">
                  <span className="text-right w-20">USD -{payroll.deductions.toFixed(2)}</span>
                  <span className="text-right w-20">ZWL -{(payroll.deductions * payroll.exchangeRate).toFixed(2)}</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 border-t-2 border-gray-400 flex justify-between items-center">
                <span className="font-bold text-gray-800">TOTAL DEDUCTIONS:</span>
                <div className="flex gap-4">
                  <span className="text-right w-20 font-bold">USD {payroll.totalDeductions.toFixed(2)}</span>
                  <span className="text-right w-20 font-bold">ZWL {(payroll.totalDeductions * payroll.exchangeRate).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Net Pay Section */}
      <div className="p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-green-600 mb-2">NET PAY</h3>
          <div className="flex justify-center gap-8">
            <div>
              <p className="text-sm text-gray-600">USD</p>
              <p className="text-3xl font-bold text-green-700">${payroll.netSalary.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ZWL</p>
              <p className="text-3xl font-bold text-green-700">ZWL {(payroll.netSalary * payroll.exchangeRate).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Online Status Indicator */}
      <div className="fixed bottom-4 right-4">
        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          Online
        </div>
      </div>
    </div>
  )
}
