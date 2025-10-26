import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExportButton } from "@/components/reports/export-button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, DollarSign, TrendingUp, Users, Calendar, Filter, RefreshCw, Eye } from "lucide-react"
import { exportPayrollToCSV } from "@/lib/export-utils"

export default async function PayrollReportPage() {
  const supabase = await createClient()
  const { data: payrollRecords } = await supabase
    .from("payroll")
    .select("*, employees(first_name, last_name, employee_id, job_title)")
    .order("year", { ascending: false })
    .order("month", { ascending: false })
    .limit(200)

  const toZwl = (usd?: number, rate?: number) => {
    if (!usd || !rate) return 0
    return usd * rate
  }

  // Calculate summary statistics
  const totalGross = payrollRecords?.reduce((sum, record) => sum + (record.gross_salary || 0), 0) || 0
  const totalDeductions = payrollRecords?.reduce((sum, record) => sum + (record.total_deductions || 0), 0) || 0
  const totalNet = payrollRecords?.reduce((sum, record) => sum + (record.net_salary || 0), 0) || 0
  const averageSalary = payrollRecords?.length ? totalGross / payrollRecords.length : 0

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Payroll Reports</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            Comprehensive payroll analysis with dual-currency support
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <ExportButton report="payroll" className="bg-[#a2141e] hover:bg-[#8a1119] gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </ExportButton>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Gross</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">${totalGross.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Deductions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">${totalDeductions.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Net</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">${totalNet.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Average Salary</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">${Math.round(averageSalary).toLocaleString()}</p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" /> Recent Payroll ({payrollRecords?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Gross (USD)</TableHead>
                  <TableHead className="text-right">Deductions (USD)</TableHead>
                  <TableHead className="text-right">Net (USD)</TableHead>
                  <TableHead className="text-right">Net (ZWL)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(payrollRecords || []).map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.employees?.employee_id} - {p.employees?.first_name} {p.employees?.last_name}</TableCell>
                    <TableCell>{`${p.month}/${p.year}`}</TableCell>
                    <TableCell className="text-right">{Number(p.gross_salary || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{Number(p.deductions || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{Number(p.net_salary || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{toZwl(p.net_salary, p.exchange_rate).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
