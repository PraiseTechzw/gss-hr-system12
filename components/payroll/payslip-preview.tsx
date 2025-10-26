"use client"

import React from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Printer, Download, ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface PayslipPreviewProps {
  payslipData: any
  isOpen: boolean
  onClose: () => void
  onPrint?: () => void
  onDownload?: () => void
}

export function PayslipPreview({ payslipData, isOpen, onClose, onPrint, onDownload }: PayslipPreviewProps) {
  if (!payslipData) {
    return null
  }

  const { company, employee, payroll } = payslipData

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none overflow-y-auto p-0">
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={onPrint} className="bg-[#a2141e] hover:bg-[#8a1119]">
              <Printer className="mr-2 h-4 w-4" />
              Print / Download
            </Button>
          </div>

          {/* Professional Payslip */}
          <Card className="mx-auto max-w-5xl print:shadow-none print:border-none">
            <CardContent className="p-0">
              {/* Header */}
              <div className="bg-gray-800 text-white p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <img 
                    src="/logo.png" 
                    alt="Genius Security Logo" 
                    className="h-16 w-16 mr-4"
                  />
                  <h1 className="text-2xl font-bold">GENIUS SECURITY (PVT) LTD</h1>
                </div>
                <p className="text-sm text-gray-300">For Genuine Security Solutions</p>
              </div>

              <div className="p-8">
                {/* Employee Information Table */}
                <div className="mb-6">
                  <table className="w-full border-collapse border border-gray-400 text-sm">
                    <tbody>
                      <tr>
                        <td className="border border-gray-400 bg-gray-100 px-3 py-2 font-medium w-1/4">Employee Number</td>
                        <td className="border border-gray-400 px-3 py-2 w-1/4">{employee.number}</td>
                        <td className="border border-gray-400 bg-gray-100 px-3 py-2 font-medium w-1/4">Pay Point</td>
                        <td className="border border-gray-400 px-3 py-2 w-1/4">{employee.city || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 bg-gray-100 px-3 py-2 font-medium">Employee Name</td>
                        <td className="border border-gray-400 px-3 py-2">{employee.name}</td>
                        <td className="border border-gray-400 bg-gray-100 px-3 py-2 font-medium">Nostro Account Number</td>
                        <td className="border border-gray-400 px-3 py-2">{employee.accountNumber || '0000000000'}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 bg-gray-100 px-3 py-2 font-medium">Department</td>
                        <td className="border border-gray-400 px-3 py-2">{employee.department || 'Operations'}</td>
                        <td className="border border-gray-400 bg-gray-100 px-3 py-2 font-medium">Bank</td>
                        <td className="border border-gray-400 px-3 py-2">{employee.bank || 'POHBS BANK'}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 bg-gray-100 px-3 py-2 font-medium">I.D. Number</td>
                        <td className="border border-gray-400 px-3 py-2">{employee.idNumber || 'N/A'}</td>
                        <td className="border border-gray-400 bg-gray-100 px-3 py-2 font-medium">Employment Status</td>
                        <td className="border border-gray-400 px-3 py-2">{employee.employmentStatus || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 bg-gray-100 px-3 py-2 font-medium">Position</td>
                        <td className="border border-gray-400 px-3 py-2">{employee.position}</td>
                        <td className="border border-gray-400 bg-gray-100 px-3 py-2 font-medium">ZWL Account Number</td>
                        <td className="border border-gray-400 px-3 py-2">{employee.zwlAccountNumber || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 bg-gray-100 px-3 py-2 font-medium">Branch Code</td>
                        <td className="border border-gray-400 px-3 py-2">{employee.branchCode || 'N/A'}</td>
                        <td className="border border-gray-400 bg-gray-100 px-3 py-2 font-medium">Bank</td>
                        <td className="border border-gray-400 px-3 py-2">{employee.bank || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 bg-gray-100 px-3 py-2 font-medium">Employment Type</td>
                        <td className="border border-gray-400 px-3 py-2">Contract</td>
                        <td className="border border-gray-400 bg-gray-100 px-3 py-2 font-medium"></td>
                        <td className="border border-gray-400 px-3 py-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Earnings and Deductions Table */}
                <div className="mb-6">
                  <table className="w-full border-collapse border border-gray-400 text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-400 px-3 py-2 text-left font-medium">EARNINGS</th>
                        <th className="border border-gray-400 px-3 py-2 text-right font-medium">USD</th>
                        <th className="border border-gray-400 px-3 py-2 text-right font-medium">ZWL</th>
                        <th className="border border-gray-400 px-3 py-2 text-left font-medium">DEDUCTIONS</th>
                        <th className="border border-gray-400 px-3 py-2 text-right font-medium">USD</th>
                        <th className="border border-gray-400 px-3 py-2 text-right font-medium">ZWL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const fx = Number(payroll.exchangeRate || 0)
                        const toZwl = (usd: number) => (fx > 0 ? usd * fx : 0)
                        const usdBasic = Number(payroll.basicSalary || 0)
                        const usdTransport = Number(payroll.transportAllowance || 0)
                        const usdOtherAllowances = Math.max(0, Number(payroll.allowances || 0) - usdTransport)
                        const usdNssa = Number(payroll.nssaDeduction || 0)
                        const usdPayee = Number(payroll.payeeDeduction || 0)
                        const usdOtherDeductions = Math.max(0, Number(payroll.deductions || 0) - usdNssa - usdPayee)
                        const usdGross = Number(payroll.grossSalary || 0)
                        const usdTotalDeductions = Number(payroll.totalDeductions || 0)

                        return (
                          <>
                            <tr>
                              <td className="border border-gray-400 px-3 py-2">Basic</td>
                              <td className="border border-gray-400 px-3 py-2 text-right">{usdBasic.toFixed(2)}</td>
                              <td className="border border-gray-400 px-3 py-2 text-right">{toZwl(usdBasic).toFixed(2)}</td>
                              <td className="border border-gray-400 px-3 py-2">NSSA</td>
                              <td className="border border-gray-400 px-3 py-2 text-right">-{usdNssa.toFixed(2)}</td>
                              <td className="border border-gray-400 px-3 py-2 text-right">-{toZwl(usdNssa).toFixed(2)}</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-400 px-3 py-2">Transport Allowance</td>
                              <td className="border border-gray-400 px-3 py-2 text-right">{usdTransport.toFixed(2)}</td>
                              <td className="border border-gray-400 px-3 py-2 text-right">{toZwl(usdTransport).toFixed(2)}</td>
                              <td className="border border-gray-400 px-3 py-2">PAYEE</td>
                              <td className="border border-gray-400 px-3 py-2 text-right">-{usdPayee.toFixed(2)}</td>
                              <td className="border border-gray-400 px-3 py-2 text-right">-{toZwl(usdPayee).toFixed(2)}</td>
                            </tr>
                            {(usdOtherAllowances > 0 || usdOtherDeductions > 0) && (
                              <tr>
                                <td className="border border-gray-400 px-3 py-2">Other Allowances</td>
                                <td className="border border-gray-400 px-3 py-2 text-right">{usdOtherAllowances.toFixed(2)}</td>
                                <td className="border border-gray-400 px-3 py-2 text-right">{toZwl(usdOtherAllowances).toFixed(2)}</td>
                                <td className="border border-gray-400 px-3 py-2">Other Deductions</td>
                                <td className="border border-gray-400 px-3 py-2 text-right">-{usdOtherDeductions.toFixed(2)}</td>
                                <td className="border border-gray-400 px-3 py-2 text-right">-{toZwl(usdOtherDeductions).toFixed(2)}</td>
                              </tr>
                            )}
                            <tr className="bg-gray-100 font-medium">
                              <td className="border border-gray-400 px-3 py-2">GROSS</td>
                              <td className="border border-gray-400 px-3 py-2 text-right">{usdGross.toFixed(2)}</td>
                              <td className="border border-gray-400 px-3 py-2 text-right">{toZwl(usdGross).toFixed(2)}</td>
                              <td className="border border-gray-400 px-3 py-2">TOTAL DEDUCTIONS</td>
                              <td className="border border-gray-400 px-3 py-2 text-right">{usdTotalDeductions.toFixed(2)}</td>
                              <td className="border border-gray-400 px-3 py-2 text-right">{toZwl(usdTotalDeductions).toFixed(2)}</td>
                            </tr>
                          </>
                        )
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Net Pay Table */}
                <div className="mb-6">
                  <table className="w-full border-collapse border border-gray-400 text-sm">
                    <tbody>
                      <tr className="bg-gray-800 text-white">
                        <td className="border border-gray-400 px-3 py-2 font-medium text-center">Net Paid</td>
                        <td className="border border-gray-400 px-3 py-2 text-right font-medium">USD</td>
                        <td className="border border-gray-400 px-3 py-2 text-right font-medium">ZWL</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 px-3 py-2"></td>
                        <td className="border border-gray-400 px-3 py-2 text-right font-bold">{Number(payroll.netSalary || 0).toFixed(2)}</td>
                        <td className="border border-gray-400 px-3 py-2 text-right font-bold">{(Number(payroll.exchangeRate || 0) > 0 ? (Number(payroll.netSalary || 0) * Number(payroll.exchangeRate)).toFixed(2) : '—')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
