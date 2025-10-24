"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Shield } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getEmployeeLeaveData } from "@/lib/leave-payroll-integration"

export default function PayslipPage({ params }: { params: { id: string } }) {
  const [payroll, setPayroll] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [leaveSummary, setLeaveSummary] = useState<{ approved_leave_days: number; unpaid_leave_days: number; sick_leave_days: number; casual_leave_days: number } | null>(null)

  useEffect(() => {
    async function fetchPayroll() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("payroll")
          .select(
            `
            *,
            employees (
              id,
              employee_id,
              first_name,
              last_name,
              email,
              phone,
              job_title,
              department,
              bank_name,
              account_number,
              ifsc_code,
              nostro_account_number,
              zwl_account_number,
              branch_code,
              pan_number
            )
          `,
          )
          .eq("id", params.id)
          .single()

        if (error) {
          setError(error.message)
        } else {
          setPayroll(data)
          // Fetch leave summary for the same month/year
          if (data?.employee_id && data?.month && data?.year) {
            try {
              const summary = await getEmployeeLeaveData(data.employee_id, data.month, data.year)
              setLeaveSummary(summary)
            } catch {
              // best-effort
            }
          }
        }
      } catch (err) {
        setError("Failed to fetch payroll data")
      } finally {
        setLoading(false)
      }
    }

    fetchPayroll()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#a2141e]"></div>
          <p className="mt-4 text-gray-600">Loading payslip...</p>
        </div>
      </div>
    )
  }

  if (error || !payroll) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error || "Payroll not found"}</p>
          <Link href="/payroll">
            <Button variant="outline">Back to Payroll</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getMonthName = (month: number) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    return months[month - 1]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/payroll/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <Button onClick={() => window.print()} className="bg-[#a2141e] hover:bg-[#8a1119]">
          <Download className="mr-2 h-4 w-4" />
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
                    <td className="border border-gray-400 px-3 py-2 w-1/4">{payroll.employees.employee_id}</td>
                    <td className="border border-gray-400 bg-gray-100 px-3 py-2 font-medium w-1/4">Pay Point</td>
                    <td className="border border-gray-400 px-3 py-2 w-1/4">{payroll.employees.city || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 bg-gray-100 px-3 py-2 font-medium">Employee Name</td>
                    <td className="border border-gray-400 px-3 py-2">{payroll.employees.first_name} {payroll.employees.last_name}</td>
                    <td className="border border-gray-400 bg-gray-100 px-3 py-2 font-medium">Nostro Account Number</td>
                    <td className="border border-gray-400 px-3 py-2">{payroll.employees.nostro_account_number || payroll.employees.account_number || '0000000000'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 bg-gray-100 px-3 py-2 font-medium">Department</td>
                    <td className="border border-gray-400 px-3 py-2">{payroll.employees.department || 'Operations'}</td>
                    <td className="border border-gray-400 bg-gray-100 px-3 py-2 font-medium">Bank</td>
                    <td className="border border-gray-400 px-3 py-2">{payroll.employees.bank_name || 'POHBS BANK'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 bg-gray-100 px-3 py-2 font-medium">I.D. Number</td>
                    <td className="border border-gray-400 px-3 py-2">{payroll.employees.pan_number || 'N/A'}</td>
                    <td className="border border-gray-400 bg-gray-100 px-3 py-2 font-medium">Employment Status</td>
                    <td className="border border-gray-400 px-3 py-2">{payroll.employees.employment_status || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 bg-gray-100 px-3 py-2 font-medium">Position</td>
                    <td className="border border-gray-400 px-3 py-2">{payroll.employees.job_title}</td>
                    <td className="border border-gray-400 bg-gray-100 px-3 py-2 font-medium">ZWL Account Number</td>
                    <td className="border border-gray-400 px-3 py-2">{payroll.employees.zwl_account_number || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 bg-gray-100 px-3 py-2 font-medium">Branch Code</td>
                    <td className="border border-gray-400 px-3 py-2">{payroll.employees.branch_code || payroll.employees.ifsc_code || 'N/A'}</td>
                    <td className="border border-gray-400 bg-gray-100 px-3 py-2 font-medium">Bank</td>
                    <td className="border border-gray-400 px-3 py-2">{payroll.employees.bank_name || 'N/A'}</td>
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
                    const fx = Number(payroll.exchange_rate || 0)
                    const toZwl = (usd: number) => (fx > 0 ? usd * fx : 0)
                    const usdBasic = Number(payroll.basic_salary || 0)
                    const usdTransport = Number(payroll.transport_allowance || 0)
                    const usdOtherAllowances = Math.max(0, Number(payroll.allowances || 0) - usdTransport)
                    const usdNssa = Number(payroll.nssa_deduction || 0)
                    const usdPayee = Number(payroll.payee_deduction || 0)
                    const usdOtherDeductions = Math.max(0, Number(payroll.deductions || 0) - usdNssa - usdPayee)
                    const usdGross = Number(payroll.gross_salary || 0)
                    const usdTotalDeductions = Number(payroll.deductions || 0)

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
                        {usdOtherAllowances > 0 || usdOtherDeductions > 0 ? (
                          <tr>
                            <td className="border border-gray-400 px-3 py-2">Other Allowances</td>
                            <td className="border border-gray-400 px-3 py-2 text-right">{usdOtherAllowances.toFixed(2)}</td>
                            <td className="border border-gray-400 px-3 py-2 text-right">{toZwl(usdOtherAllowances).toFixed(2)}</td>
                            <td className="border border-gray-400 px-3 py-2">Other Deductions</td>
                            <td className="border border-gray-400 px-3 py-2 text-right">-{usdOtherDeductions.toFixed(2)}</td>
                            <td className="border border-gray-400 px-3 py-2 text-right">-{toZwl(usdOtherDeductions).toFixed(2)}</td>
                  </tr>
                        ) : null}
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
                    <td className="border border-gray-400 px-3 py-2 text-right font-bold">{Number(payroll.net_salary || 0).toFixed(2)}</td>
                    <td className="border border-gray-400 px-3 py-2 text-right font-bold">{(Number(payroll.exchange_rate || 0) > 0 ? (Number(payroll.net_salary || 0) * Number(payroll.exchange_rate)).toFixed(2) : '—')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Leave Summary Table */}
            <div className="mb-6">
              <table className="w-full border-collapse border border-gray-400 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 px-3 py-2 text-center font-medium" colSpan={5}>LEAVE SUMMARY</th>
                  </tr>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 px-3 py-2 text-left font-medium">Annual Leave</th>
                    <th className="border border-gray-400 px-3 py-2 text-center font-medium">Opening Balance</th>
                    <th className="border border-gray-400 px-3 py-2 text-center font-medium">Accrual</th>
                    <th className="border border-gray-400 px-3 py-2 text-center font-medium">Leave Taken</th>
                    <th className="border border-gray-400 px-3 py-2 text-center font-medium">Closing Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 px-3 py-2">Annual</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">—</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">—</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">{leaveSummary ? leaveSummary.approved_leave_days : 0}</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">—</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-3 py-2">Unpaid</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">—</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">—</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">{leaveSummary ? leaveSummary.unpaid_leave_days : 0}</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">—</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-3 py-2">Sick</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">—</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">—</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">{leaveSummary ? leaveSummary.sick_leave_days : 0}</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">—</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-3 py-2">Casual</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">—</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">—</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">{leaveSummary ? leaveSummary.casual_leave_days : 0}</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">—</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to convert number to words (simplified version)
function numberToWords(num: number): string {
  if (num === 0) return "Zero"

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ]

  function convertLessThanThousand(n: number): string {
    if (n === 0) return ""
    if (n < 10) return ones[n]
    if (n < 20) return teens[n - 10]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")
    return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + convertLessThanThousand(n % 100) : "")
  }

  if (num < 1000) return convertLessThanThousand(num)
  if (num < 100000)
    return (
      convertLessThanThousand(Math.floor(num / 1000)) +
      " Thousand" +
      (num % 1000 !== 0 ? " " + convertLessThanThousand(num % 1000) : "")
    )
  if (num < 10000000)
    return (
      convertLessThanThousand(Math.floor(num / 100000)) +
      " Lakh" +
      (num % 100000 !== 0 ? " " + numberToWords(num % 100000) : "")
    )

  return (
    convertLessThanThousand(Math.floor(num / 10000000)) +
    " Crore" +
    (num % 10000000 !== 0 ? " " + numberToWords(num % 10000000) : "")
  )
}
