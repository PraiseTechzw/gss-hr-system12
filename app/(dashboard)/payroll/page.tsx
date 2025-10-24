import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, DollarSign, Users, Calendar, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { PayrollTable } from "@/components/payroll/payroll-table"

export default async function PayrollPage() {
  const supabase = await createClient()

  // Fetch payroll records with employee information
  const { data: payrollRecords, error } = await supabase
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
        job_title
      )
    `,
    )
    .order("year", { ascending: false })
    .order("month", { ascending: false })

  if (error) {
    console.error("Error fetching payroll:", error)
  }

  // Get comprehensive payroll statistics
  const { count: pendingCount } = await supabase
    .from("payroll")
    .select("*", { count: "exact", head: true })
    .eq("payment_status", "pending")

  const { count: processedCount } = await supabase
    .from("payroll")
    .select("*", { count: "exact", head: true })
    .eq("payment_status", "processed")

  const { count: paidCount } = await supabase
    .from("payroll")
    .select("*", { count: "exact", head: true })
    .eq("payment_status", "paid")

  // Get current month statistics
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  const { data: currentMonthPayroll } = await supabase
    .from("payroll")
    .select("gross_salary, net_salary")
    .eq("month", currentMonth)
    .eq("year", currentYear)

  const { data: totalSalaryData } = await supabase
    .from("payroll")
    .select("gross_salary, net_salary")

  // Calculate totals
  const currentMonthTotal = currentMonthPayroll?.reduce((sum, record) => sum + record.net_salary, 0) || 0
  const totalGrossSalary = totalSalaryData?.reduce((sum, record) => sum + record.gross_salary, 0) || 0
  const totalNetSalary = totalSalaryData?.reduce((sum, record) => sum + record.net_salary, 0) || 0
  const averageSalary = totalSalaryData && totalSalaryData.length > 0 ? totalNetSalary / totalSalaryData.length : 0

  const totalRecords = (pendingCount || 0) + (processedCount || 0) + (paidCount || 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="mt-1 text-gray-500">Comprehensive payroll processing and analytics</p>
        </div>
        <Link href="/payroll/new">
          <Button className="bg-[#a2141e] hover:bg-[#8a1119]">
            <Plus className="mr-2 h-4 w-4" />
            Process Payroll
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{totalRecords}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">{currentMonthPayroll?.length || 0}</span>
              <span className="text-gray-500 ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Gross Salary</p>
                <p className="text-2xl font-bold text-green-600">USD ${totalGrossSalary.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">This Month</span>
                <span className="font-medium text-gray-900">USD ${currentMonthTotal.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Salary</p>
                <p className="text-2xl font-bold text-purple-600">USD ${Math.round(averageSalary).toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="text-purple-700 border-purple-200">
                Per employee
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-orange-600">{pendingCount || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="text-orange-700 border-orange-200">
                Requires attention
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Pending</p>
                  <p className="text-sm text-gray-500">Awaiting processing</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-600">{pendingCount || 0}</p>
                <p className="text-xs text-gray-500">records</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Processed</p>
                  <p className="text-sm text-gray-500">Ready for payment</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{processedCount || 0}</p>
                <p className="text-xs text-gray-500">records</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Paid</p>
                  <p className="text-sm text-gray-500">Completed payments</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">{paidCount || 0}</p>
                <p className="text-xs text-gray-500">records</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Status Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="px-3 py-1 bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="mr-1 h-3 w-3" />
          Pending: {pendingCount || 0}
        </Badge>
        <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
          <AlertCircle className="mr-1 h-3 w-3" />
          Processed: {processedCount || 0}
        </Badge>
        <Badge variant="outline" className="px-3 py-1 bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="mr-1 h-3 w-3" />
          Paid: {paidCount || 0}
        </Badge>
        <Badge variant="outline" className="px-3 py-1 bg-gray-50 text-gray-700 border-gray-200">
          <Calendar className="mr-1 h-3 w-3" />
          Total: {totalRecords}
        </Badge>
      </div>

      {/* Payroll Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
        </CardHeader>
        <CardContent>
          <PayrollTable payrollRecords={payrollRecords || []} />
        </CardContent>
      </Card>
    </div>
  )
}
