import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Calendar, DollarSign, CreditCard } from "lucide-react"
import { formatCurrency } from "@/lib/database-utils"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function PayrollDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: payroll, error } = await supabase
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
        branch_code
      )
    `,
    )
    .eq("id", params.id)
    .single()

  if (error || !payroll) {
    notFound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "processed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      default:
        return ""
    }
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
        <div className="flex items-center gap-4">
          <Link href="/payroll">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {payroll.employees.first_name} {payroll.employees.last_name}
            </h1>
            <p className="mt-1 text-gray-500">
              Payroll for {getMonthName(payroll.month)} {payroll.year}
            </p>
          </div>
        </div>
        <Link href={`/payroll/${params.id}/payslip`}>
          <Button className="bg-[#a2141e] hover:bg-[#8a1119]">
            <Download className="mr-2 h-4 w-4" />
            Download Payslip
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Salary Breakdown */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Salary Breakdown</CardTitle>
              {Number(payroll.exchange_rate || 0) > 0 && (
                <span className="text-xs rounded-full bg-blue-50 px-3 py-1 text-blue-700 border border-blue-100">
                  1 USD = {Number(payroll.exchange_rate).toLocaleString()} ZWL
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">Earnings</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Basic Salary</span>
                  <span className="font-medium">{formatCurrency(payroll.basic_salary, 'USD')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transport Allowance</span>
                  <span className="font-medium">{formatCurrency(payroll.transport_allowance || 0, 'USD')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Other Allowances</span>
                  <span className="font-medium">{formatCurrency(Math.max(0, (payroll.allowances || 0) - (payroll.transport_allowance || 0)), 'USD')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Overtime Pay</span>
                  <span className="font-medium">{formatCurrency(payroll.overtime_pay || 0, 'USD')}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold text-gray-900">Gross Salary</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(payroll.gross_salary, 'USD')}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">Deductions</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">NSSA</span>
                  <span className="font-medium text-red-600">-{formatCurrency(payroll.nssa_deduction || 0, 'USD')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PAYE</span>
                  <span className="font-medium text-red-600">-{formatCurrency(payroll.payee_deduction || 0, 'USD')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Other Deductions</span>
                  <span className="font-medium text-red-600">-{formatCurrency(Math.max(0, (payroll.deductions || 0) - (payroll.nssa_deduction || 0) - (payroll.payee_deduction || 0)), 'USD')}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-r from-[#a2141e] to-[#7f0e16] p-4 text-white shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Net Salary</p>
                  <p className="mt-1 text-3xl font-bold">{formatCurrency(payroll.net_salary, 'USD')}</p>
                </div>
                <DollarSign className="h-12 w-12 opacity-50" />
              </div>
              {Number(payroll.exchange_rate || 0) > 0 && (
                <p className="mt-2 text-xs opacity-90">Equivalent: <span className="font-semibold">ZWL {Number(payroll.net_salary * payroll.exchange_rate).toLocaleString()}</span></p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment & Attendance Info */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <Badge className={`mt-1 ${getStatusColor(payroll.payment_status)}`} variant="secondary">
                  {payroll.payment_status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Payment Date</p>
                <div className="mt-1 flex items-center gap-2 text-gray-900">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {payroll.payment_date ? new Date(payroll.payment_date).toLocaleDateString() : "Not paid yet"}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Payment Method</p>
                <div className="mt-1 flex items-center gap-2 text-gray-900">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  {payroll.payment_method || "N/A"}
                </div>
              </div>
              {Number(payroll.exchange_rate || 0) > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Exchange Rate</p>
                  <div className="mt-1 text-gray-900">{(payroll.exchange_rate)} ZWL per 1 USD</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Days Worked</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{payroll.days_worked}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Days Absent</p>
                <p className="mt-1 text-2xl font-bold text-red-600">{payroll.days_absent}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Days</p>
                <p className="mt-1 text-gray-900">{payroll.days_worked + payroll.days_absent}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employee Bank Details */}
        <Card className="lg:col-span-3 shadow-sm">
          <CardHeader>
          <CardTitle>Bank Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Bank Name</p>
                <p className="mt-1 text-gray-900">{payroll.employees.bank_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Nostro Account Number (USD)</p>
                <p className="mt-1 text-gray-900">{payroll.employees.nostro_account_number || payroll.employees.account_number || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">ZWL Account Number</p>
                <p className="mt-1 text-gray-900">{payroll.employees.zwl_account_number || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Branch Code</p>
                <p className="mt-1 text-gray-900">{payroll.employees.branch_code || payroll.employees.ifsc_code || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
