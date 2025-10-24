import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExportButton } from "@/components/reports/export-button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, MapPin } from "lucide-react"

function exportDeploymentsToCSV(deployments: any[]) {
  const headers = [
    "Employee",
    "Client",
    "Site",
    "Type",
    "Start Date",
    "End Date",
    "Status",
  ]
  const rows = deployments.map((d) => [
    `${d.employees?.first_name || ''} ${d.employees?.last_name || ''}`.trim(),
    d.client_name,
    d.site_location,
    d.deployment_type,
    d.start_date,
    d.end_date || '',
    d.status,
  ])
  const csv = [headers.join(','), ...rows.map(r => r.map(v => typeof v === 'string' && (v.includes(',') || v.includes('"')) ? `"${v.replace(/"/g, '""')}"` : v || '').join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `deployments-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default async function DeploymentsReportPage() {
  const supabase = await createClient()
  const { data: deployments } = await supabase
    .from("deployments")
    .select("*, employees(first_name, last_name)")
    .order("start_date", { ascending: false })
    .limit(200)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deployment Reports</h1>
          <p className="mt-1 text-gray-500">Assignments, timelines, and statuses</p>
        </div>
        <ExportButton report="deployments" className="bg-[#a2141e] hover:bg-[#8a1119]" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" /> Recent Deployments ({deployments?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(deployments || []).map((d: any) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.employees ? `${d.employees.first_name} ${d.employees.last_name}` : '—'}</TableCell>
                    <TableCell>{d.client_name}</TableCell>
                    <TableCell>{d.site_location}</TableCell>
                    <TableCell>{d.deployment_type}</TableCell>
                    <TableCell>{d.start_date ? new Date(d.start_date).toLocaleDateString() : '—'}</TableCell>
                    <TableCell>{d.end_date ? new Date(d.end_date).toLocaleDateString() : '—'}</TableCell>
                    <TableCell>{d.status}</TableCell>
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


