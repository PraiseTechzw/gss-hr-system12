"use client"

import { useEffect, useMemo, useState } from "react"
import { countFromCache, fetchTable, selectRecent } from "@/lib/offline/helpers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, Calendar, DollarSign, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type Employee = { id: string; employment_status?: string; first_name?: string; last_name?: string; department?: string }
type Deployment = { id: string; status?: string; client_name?: string; site_location?: string; created_at?: string }
type LeaveReq = { id: string; status?: string; leave_type?: string; start_date?: string; end_date?: string; total_days?: number; created_at?: string }
type Payroll = { id: string; net_salary?: number; month?: number; year?: number; created_at?: string }

export default function DashboardClient() {
  const [loading, setLoading] = useState(true)
  const [totalEmployees, setTotalEmployees] = useState(0)
  const [activeEmployees, setActiveEmployees] = useState(0)
  const [activeDeployments, setActiveDeployments] = useState(0)
  const [totalDeployments, setTotalDeployments] = useState(0)
  const [pendingLeaves, setPendingLeaves] = useState(0)
  const [totalLeaves, setTotalLeaves] = useState(0)
  const [recentPayroll, setRecentPayroll] = useState<Payroll[]>([])
  const [recentLeaveRequests, setRecentLeaveRequests] = useState<LeaveReq[]>([])
  const [recentDeployments, setRecentDeployments] = useState<Deployment[]>([])

  const now = useMemo(() => new Date(), [])
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)

      const [employees, deployments, leaves, payroll] = await Promise.all([
        fetchTable<Employee>("employees"),
        fetchTable<Deployment>("deployments"),
        fetchTable<LeaveReq>("leave_requests"),
        fetchTable<Payroll>("payroll"),
      ])

      if (!mounted) return

      setTotalEmployees(employees.length)
      setActiveEmployees(employees.filter((e) => e.employment_status === "active").length)

      setTotalDeployments(deployments.length)
      setActiveDeployments(deployments.filter((d) => d.status === "active").length)

      setTotalLeaves(leaves.length)
      setPendingLeaves(leaves.filter((l) => l.status === "pending").length)

      setRecentPayroll(
        payroll
          .slice()
          .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
          .slice(0, 5)
      )

      setRecentLeaveRequests(
        leaves
          .slice()
          .filter((l) => l.status === "pending")
          .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
          .slice(0, 5)
      )

      setRecentDeployments(
        deployments
          .slice()
          .filter((d) => d.status === "active")
          .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
          .slice(0, 5)
      )

      setLoading(false)
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const totalPayroll = useMemo(() => {
    return recentPayroll
      .filter((p) => p.month === currentMonth && p.year === currentYear)
      .reduce((sum, p) => sum + (p.net_salary || 0), 0)
  }, [recentPayroll, currentMonth, currentYear])

  const getMonthName = (month: number) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months[month - 1]
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">Welcome to GSS HR & Payroll Management System</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Employees</CardTitle>
            <Users className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalEmployees}</div>
            <p className="mt-1 text-xs text-gray-500">
              <span className="font-medium text-green-600">{activeEmployees}</span> active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Deployments</CardTitle>
            <Briefcase className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{activeDeployments}</div>
            <p className="mt-1 text-xs text-gray-500">
              <span className="font-medium">{totalDeployments}</span> total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Leaves</CardTitle>
            <Calendar className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{pendingLeaves}</div>
            <p className="mt-1 text-xs text-gray-500">
              <span className="font-medium">{totalLeaves}</span> total requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Monthly Payroll</CardTitle>
            <DollarSign className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">₹{totalPayroll.toLocaleString()}</div>
            <p className="mt-1 text-xs text-gray-500">
              {getMonthName(currentMonth)} {currentYear}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#a2141e]" />
              Pending Leave Requests
            </CardTitle>
            <Link href="/attendance">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentLeaveRequests.length === 0 ? (
              <p className="text-center text-sm text-gray-500">No pending leave requests</p>
            ) : (
              <div className="space-y-3">
                {recentLeaveRequests.map((leave) => (
                  <div key={leave.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{leave.leave_type}</p>
                      <p className="text-sm text-gray-500">
                        {leave.start_date ? new Date(leave.start_date).toLocaleDateString() : ""} - {leave.end_date ? new Date(leave.end_date).toLocaleDateString() : ""}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                      {leave.total_days ?? ""} days
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[#a2141e]" />
              Active Deployments
            </CardTitle>
            <Link href="/deployments">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentDeployments.length === 0 ? (
              <p className="text-center text-sm text-gray-500">No active deployments</p>
            ) : (
              <div className="space-y-3">
                {recentDeployments.map((deployment) => (
                  <div key={deployment.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{deployment.client_name || "Deployment"}</p>
                      <p className="text-sm text-gray-500">{deployment.site_location || ""}</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-800">
                      Active
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#a2141e]" />
            Recent Payroll
          </CardTitle>
          <Link href="/payroll">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentPayroll.length === 0 ? (
            <p className="text-center text-sm text-gray-500">No payroll records</p>
          ) : (
            <div className="space-y-3">
              {recentPayroll.map((payroll) => (
                <div key={payroll.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{payroll.month ? getMonthName(payroll.month) : ""} {payroll.year || ""}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{(payroll.net_salary || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
