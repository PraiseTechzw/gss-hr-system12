import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Users, 
  DollarSign, 
  MapPin, 
  TrendingUp, 
  Calendar, 
  Download, 
  BarChart3, 
  PieChart, 
  Activity,
  Clock,
  Target,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { ReportsOverview } from "@/components/reports/reports-overview"
import { QuickReports } from "@/components/reports/quick-reports"
// import { ReportCharts } from "@/components/reports/report-charts"
import { getDashboardStats, getPayrollStats, getAttendanceStats, getDeploymentStats, getRecentActivity } from "@/lib/database-utils"

export default async function ReportsPage() {
  const supabase = await createClient()

  // Fetch comprehensive data for reports using utility functions
  const [
    dashboardStats,
    payrollStats,
    attendanceStats,
    deploymentStats,
    recentActivity,
    { data: employees },
    { data: deployments },
    { data: payrollRecords },
    { data: attendanceRecords }
  ] = await Promise.all([
    getDashboardStats(),
    getPayrollStats(),
    getAttendanceStats(),
    getDeploymentStats(),
    getRecentActivity(),
    supabase.from("employees").select("*").eq("employment_status", "active"),
    supabase.from("deployments").select("*, employees(first_name, last_name)"),
    supabase.from("payroll").select("*").order("created_at", { ascending: false }).limit(100),
    supabase.from("attendance").select("*").order("date", { ascending: false }).limit(500)
  ])

  // Calculate deployment rate
  const deploymentRate = dashboardStats.totalEmployees > 0 
    ? Math.round((dashboardStats.activeDeployments / dashboardStats.totalEmployees) * 100) 
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-gray-500">Comprehensive insights and data analysis</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
          <Button className="bg-[#a2141e] hover:bg-[#8a1119]">
            <FileText className="mr-2 h-4 w-4" />
            Custom Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalEmployees}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">{dashboardStats.activeEmployees}</span>
              <span className="text-gray-500 ml-1">active employees</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Deployments</p>
                <p className="text-2xl font-bold text-gray-900">{deploymentStats.activeCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Target className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">{deploymentRate}%</span>
              <span className="text-gray-500 ml-1">deployment rate</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payroll</p>
                <p className="text-2xl font-bold text-gray-900">USD ${payrollStats.totalPayroll.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Activity className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-blue-600 font-medium">USD ${Math.round(payrollStats.averageSalary).toLocaleString()}</span>
              <span className="text-gray-500 ml-1">avg. salary</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">{attendanceStats.attendanceRate}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Clock className="h-4 w-4 text-orange-500 mr-1" />
              <span className="text-orange-600 font-medium">{attendanceStats.presentDays}</span>
              <span className="text-gray-500 ml-1">present days (30d)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Overview */}
      <ReportsOverview 
        employees={employees || []}
        deployments={deployments || []}
        payrollRecords={payrollRecords || []}
        attendanceRecords={attendanceRecords || []}
      />

      {/* Quick Reports */}
      <QuickReports />

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Report Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.slice(0, 6).map((activity, index) => {
              const getIcon = (type: string) => {
                switch (type) {
                  case 'employee': return Users
                  case 'deployment': return MapPin
                  case 'payroll': return DollarSign
                  case 'leave': return Calendar
                  default: return Activity
                }
              }
              
              const getColor = (type: string) => {
                switch (type) {
                  case 'employee': return 'text-blue-600'
                  case 'deployment': return 'text-green-600'
                  case 'payroll': return 'text-purple-600'
                  case 'leave': return 'text-orange-600'
                  default: return 'text-gray-600'
                }
              }
              
              const ActivityIcon = getIcon(activity.type)
              const color = getColor(activity.type)
              
              return (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-full bg-gray-100 ${color}`}>
                    <ActivityIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Report Categories */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/reports/employees">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Employee Reports</h3>
                  <p className="text-sm text-gray-600">Performance, attendance, demographics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reports/payroll">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Payroll Reports</h3>
                  <p className="text-sm text-gray-600">Salary analysis, cost breakdown</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reports/deployments">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Deployment Reports</h3>
                  <p className="text-sm text-gray-600">Site efficiency, coverage analysis</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
