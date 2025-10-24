"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
// Supabase client removed
import { exportEmployeesToCSV, exportPayrollToCSV } from "@/lib/export-utils"

type Props = {
  report: "employees" | "payroll" | "deployments"
  className?: string
}

export function ExportButton({ report, className }: Props) {
  const supabase = createClient()

  const handleClick = async () => {
    if (report === "employees") {
      const { data } = await supabase.from("employees").select("*")
      if (data) exportEmployeesToCSV(data)
      return
    }
    if (report === "payroll") {
      const { data } = await supabase
        .from("payroll")
        .select("*, employees(first_name, last_name, employee_id, job_title)")
        .order("created_at", { ascending: false })
      if (data) exportPayrollToCSV(data as any[])
      return
    }
    if (report === "deployments") {
      const { data } = await supabase
        .from("deployments")
        .select("*, employees(first_name, last_name)")
        .order("start_date", { ascending: false })
      if (!data || data.length === 0) return
      const headers = [
        "Employee",
        "Client",
        "Site",
        "Type",
        "Start Date",
        "End Date",
        "Status",
      ]
      const rows = data.map((d: any) => [
        `${d.employees?.first_name || ''} ${d.employees?.last_name || ''}`.trim(),
        d.client_name,
        d.site_location,
        d.deployment_type,
        d.start_date,
        d.end_date || '',
        d.status,
      ])
      const csv = [headers.join(','), ...rows.map((r: any) => r.map((v: any) => typeof v === 'string' && (v.includes(',') || v.includes('"')) ? `"${v.replace(/"/g, '""')}"` : v || '').join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `deployments-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return
    }
  }

  return (
    <Button onClick={handleClick} className={className}>
      <Download className="mr-2 h-4 w-4" /> Export CSV
    </Button>
  )
}
