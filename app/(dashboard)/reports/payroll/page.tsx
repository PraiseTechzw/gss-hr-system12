import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExportButton } from "@/components/reports/export-button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, DollarSign } from "lucide-react"
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Reports</h1>
          <p className="mt-1 text-gray-500">Dual-currency payroll breakdown</p>
        </div>
        <ExportButton report="payroll" className="bg-[#a2141e] hover:bg-[#8a1119]" />
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


