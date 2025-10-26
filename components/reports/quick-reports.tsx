"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Download, 
  FileText, 
  Users, 
  DollarSign, 
  MapPin, 
  Calendar,
  Clock,
  Eye,
  Filter
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { exportPayrollToCSV, exportEmployeesToCSV } from "@/lib/export-utils"

type ReportItem = {
  id: string
  title: string
  description: string
  type: string
  lastGenerated: string
  icon: any
  color: string
  bgColor: string
  size: string
  records: number
  href?: string
}

function formatAgo(dateIso?: string | null) {
  if (!dateIso) return "N/A"
  const diffMs = Date.now() - new Date(dateIso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 60) return `${mins} minutes ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hours ago`
  const days = Math.floor(hours / 24)
  return `${days} days ago`
}

export function QuickReports() {
  const supabase = createClient()
  const [counts, setCounts] = useState({ employees: 0, payroll: 0, deployments: 0, attendance: 0, leaves: 0 })
  const [lastTimes, setLastTimes] = useState<{ employee?: string; payroll?: string; deployment?: string; attendance?: string; leave?: string }>({})

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [ec, pc, dc, ac, lc, le, lp, ld, la, ll] = await Promise.all([
        supabase.from("employees").select("*", { count: "exact", head: true }),
        supabase.from("payroll").select("*", { count: "exact", head: true }),
        supabase.from("deployments").select("*", { count: "exact", head: true }),
        supabase.from("attendance").select("*", { count: "exact", head: true }),
        supabase.from("leave_requests").select("*", { count: "exact", head: true }),
        supabase.from("employees").select("created_at").order("created_at", { ascending: false }).limit(1),
        supabase.from("payroll").select("created_at").order("created_at", { ascending: false }).limit(1),
        supabase.from("deployments").select("created_at").order("created_at", { ascending: false }).limit(1),
        supabase.from("attendance").select("date").order("date", { ascending: false }).limit(1),
        supabase.from("leave_requests").select("created_at").order("created_at", { ascending: false }).limit(1),
      ])
      if (cancelled) return
      setCounts({
        employees: ec.count || 0,
        payroll: pc.count || 0,
        deployments: dc.count || 0,
        attendance: ac.count || 0,
        leaves: lc.count || 0,
      })
      setLastTimes({
        employee: le.data?.[0]?.created_at,
        payroll: lp.data?.[0]?.created_at,
        deployment: ld.data?.[0]?.created_at,
        attendance: la.data?.[0]?.date,
        leave: ll.data?.[0]?.created_at,
      })
    }
    load()
    return () => { cancelled = true }
  }, [supabase])

  const reports: ReportItem[] = [
  {
    id: "employee-summary",
    title: "Employee Summary Report",
      description: "Overview of employees, departments, and roles",
    type: "PDF",
      lastGenerated: formatAgo(lastTimes.employee),
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
      size: "—",
      records: counts.employees,
      href: "/reports/employees"
  },
  {
    id: "monthly-payroll",
    title: "Monthly Payroll Report",
      description: "Dual-currency payroll with component breakdown",
    type: "Excel",
      lastGenerated: formatAgo(lastTimes.payroll),
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-100",
      size: "—",
      records: counts.payroll,
      href: "/reports/payroll"
  },
  {
    id: "deployment-status",
    title: "Deployment Status Report",
    description: "Current deployment status across all sites",
    type: "PDF",
      lastGenerated: formatAgo(lastTimes.deployment),
    icon: MapPin,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
      size: "—",
      records: counts.deployments,
      href: "/reports/deployments"
  },
  {
    id: "attendance-monthly",
    title: "Monthly Attendance Report",
    description: "Attendance patterns and absence analysis",
    type: "Excel",
      lastGenerated: formatAgo(lastTimes.attendance),
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
      size: "—",
      records: counts.attendance,
      href: "/attendance"
  },
  {
    id: "leave-summary",
    title: "Leave Summary Report",
      description: "Leave requests, approvals, and balances",
    type: "Excel",
      lastGenerated: formatAgo(lastTimes.leave),
    icon: Calendar,
    color: "text-red-600",
    bgColor: "bg-red-100",
      size: "—",
      records: counts.leaves,
      href: "/attendance"
  }
]

  const categories = [
    { value: "all", label: "All Reports" },
    { value: "employee", label: "Employee" },
    { value: "payroll", label: "Payroll" },
    { value: "deployment", label: "Deployment" },
    { value: "attendance", label: "Attendance" }
  ]

  // Default to all; allow basic filtering via search params in future if needed
  const selectedCategory: string = "all"
  const filteredReports = selectedCategory === "all" 
    ? reports 
    : reports.filter((report: ReportItem) => report.id.toLowerCase().includes(selectedCategory.toLowerCase()))

  const handleView = (href?: string) => {
    if (href) return href
    return "#"
  }

  async function handleDownload(reportId: string) {
    if (reportId === "employee-summary") {
      const { data } = await supabase.from("employees").select("*")
      if (data) exportEmployeesToCSV(data)
      return
    }
    if (reportId === "monthly-payroll") {
      const { data } = await supabase
        .from("payroll")
        .select("*, employees(first_name, last_name, employee_id, job_title)")
        .order("created_at", { ascending: false })
      if (data) exportPayrollToCSV(data as any[])
      return
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quick Reports
          </CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">All Reports</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const ReportIcon = report.icon
            return (
              <div 
                key={report.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${report.bgColor}`}>
                    <ReportIcon className={`h-5 w-5 ${report.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{report.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {report.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Last generated: {report.lastGenerated}</span>
                      <span>•</span>
                      <span>{report.records} records</span>
                      <span>•</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Link href={handleView(report.href)} className="inline-flex">
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  </Link>
                  <Button
                    size="sm"
                    className="bg-[#a2141e] hover:bg-[#8a1119]"
                    onClick={async () => { await handleDownload(report.id) }}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
        
        {filteredReports.length === 0 && (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-sm text-gray-500">
              Try selecting a different category or generate a new report
            </p>
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredReports.length} of {reports.length} reports
            </div>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Generate Custom Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
