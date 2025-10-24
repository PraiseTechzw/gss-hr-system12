"use client"

import { useState, useEffect } from "react"
// Supabase client removed
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  TrendingUp, 
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Mail,
  Settings
} from "lucide-react"
import { toast } from "sonner"

interface ReportData {
  userRegistrations: Array<{
    date: string
    count: number
  }>
  systemActivity: Array<{
    action: string
    user: string
    timestamp: string
  }>
  userRoles: Array<{
    role: string
    count: number
  }>
}

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    userRegistrations: [],
    systemActivity: [],
    userRoles: []
  })
  const [selectedPeriod, setSelectedPeriod] = useState("30")
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchReportData()
  }, [selectedPeriod])

  const fetchReportData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch user registrations by period
      const days = parseInt(selectedPeriod)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      
      const { data: registrations } = await supabase
        .from('admin_users')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      // Fetch user creation data (all users are now automatically approved)
      const { data: userCreations } = await supabase
        .from('admin_users')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      // Fetch real system activity
      const { data: systemActivityData } = await supabase
        .from('system_activity')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(20)

      const systemActivity = systemActivityData?.map((activity: any) => ({
        action: activity.description,
        user: activity.user_email,
        timestamp: activity.created_at
      })) || []

      // Fetch user roles (all users are now automatically approved)
      const { data: roleData } = await supabase
        .from('admin_users')
        .select('role')

      const roleCounts = roleData?.reduce((acc: any, user: any) => {
        const role = user.role || 'user'
        acc[role] = (acc[role] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const userRoles = Object.entries(roleCounts).map(([role, count]) => ({
        role,
        count
      }))

      // Process registrations data
      const processedRegistrations = registrations?.map((reg: any) => ({
        date: reg.created_at,
        count: 1
      })) || []

      setReportData({
        userRegistrations: processedRegistrations,
        systemActivity,
        userRoles: userRoles as { role: string; count: number }[]
      })

    } catch (error) {
      console.error("Error fetching report data:", error)
      toast.error("Failed to load report data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = async (reportType: string) => {
    setIsGenerating(true)
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success("Report generated", {
        description: `${reportType} report has been generated successfully`
      })
    } catch (error) {
      toast.error("Failed to generate report")
    } finally {
      setIsGenerating(false)
    }
  }

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "7": return "Last 7 days"
      case "30": return "Last 30 days"
      case "90": return "Last 90 days"
      case "365": return "Last year"
      default: return "Last 30 days"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a2141e] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Reports</h1>
          <p className="text-gray-600">System analytics and user activity reports</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Report Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">New Registrations</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.userRegistrations.length}</p>
                <p className="text-xs text-gray-500">{getPeriodLabel(selectedPeriod)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.userRoles.reduce((sum, role) => sum + role.count, 0)}</p>
                <p className="text-xs text-gray-500">Total system users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">System Activities</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.systemActivity.length}</p>
                <p className="text-xs text-gray-500">{getPeriodLabel(selectedPeriod)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Growth Rate</p>
                <p className="text-2xl font-bold text-gray-900">+12%</p>
                <p className="text-xs text-gray-500">vs previous period</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Button
                onClick={() => handleGenerateReport("User Activity")}
                disabled={isGenerating}
                variant="outline"
                className="justify-start"
              >
                <Users className="h-4 w-4 mr-2" />
                User Activity Report
              </Button>
              <Button
                onClick={() => handleGenerateReport("System Usage")}
                disabled={isGenerating}
                variant="outline"
                className="justify-start"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                System Usage Report
              </Button>
              <Button
                onClick={() => handleGenerateReport("Security Audit")}
                disabled={isGenerating}
                variant="outline"
                className="justify-start"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Security Audit Report
              </Button>
              <Button
                onClick={() => handleGenerateReport("Performance")}
                disabled={isGenerating}
                variant="outline"
                className="justify-start"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Performance Report
              </Button>
            </div>
            {isGenerating && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#a2141e]"></div>
                Generating report...
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              User Roles Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.userRoles.map((role, index) => (
                <div key={role.role} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: [
                          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
                        ][index % 5]
                      }}
                    ></div>
                    <span className="font-medium capitalize">{role.role}</span>
                  </div>
                  <Badge variant="outline">{role.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent System Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.systemActivity.map((activity, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {activity.action === "User Created" && <Users className="h-4 w-4 text-blue-600" />}
                      {activity.action === "User Registration" && <Users className="h-4 w-4 text-blue-600" />}
                      {activity.action === "Settings Updated" && <Settings className="h-4 w-4 text-purple-600" />}
                      <span className="font-medium">{activity.action}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{activity.user}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">
                      Completed
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
            <Button variant="outline" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export as PDF
            </Button>
            <Button variant="outline" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export as Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
