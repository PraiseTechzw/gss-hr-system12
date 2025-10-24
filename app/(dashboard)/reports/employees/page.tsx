import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users } from "lucide-react"
import { ExportButton } from "@/components/reports/export-button"

export default async function EmployeesReportPage() {
  const supabase = await createClient()
  const { data: employees } = await supabase
    .from("employees")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Reports</h1>
          <p className="mt-1 text-gray-500">Directory with export options</p>
        </div>
        <ExportButton report="employees" className="bg-[#a2141e] hover:bg-[#8a1119]" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> All Employees ({employees?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Hire Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(employees || []).map((e: any) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.employee_id} - {e.first_name} {e.last_name}</TableCell>
                    <TableCell>{e.department || '—'}</TableCell>
                    <TableCell>{e.job_title}</TableCell>
                    <TableCell>{e.email}</TableCell>
                    <TableCell>{e.phone || '—'}</TableCell>
                    <TableCell>{e.hire_date ? new Date(e.hire_date).toLocaleDateString() : '—'}</TableCell>
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


