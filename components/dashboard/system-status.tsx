import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Database, 
  Shield, 
  Cloud, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Activity,
  Users,
  DollarSign
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"

const getStatusColor = (status: string) => {
  switch (status) {
    case "connected":
    case "active":
    case "completed":
    case "normal":
      return "bg-green-100 text-green-800 border-green-200"
    case "warning":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "error":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "connected":
    case "active":
    case "completed":
    case "normal":
      return CheckCircle
    case "warning":
    case "error":
      return AlertCircle
    default:
      return CheckCircle
  }
}

export async function SystemStatus() {
  const supabase = await createClient()
  
  // Get comprehensive system data from Supabase
  const [usersResult, departmentsResult, employeesResult, attendanceResult, payrollResult] = await Promise.all([
    supabase.from('user_profiles').select('*', { count: 'exact' }),
    supabase.from('departments').select('*', { count: 'exact' }),
    supabase.from('employees').select('*', { count: 'exact' }),
    supabase.from('attendance').select('*', { count: 'exact' }),
    supabase.from('payroll').select('*', { count: 'exact' })
  ])
  
  const totalUsers = usersResult.count || 0
  const totalDepartments = departmentsResult.count || 0
  const totalEmployees = employeesResult.count || 0
  const totalAttendance = attendanceResult.count || 0
  const totalPayroll = payrollResult.count || 0
  const activeUsers = usersResult.data?.filter(user => user.status === 'active').length || 0
  const activeEmployees = employeesResult.data?.filter(emp => emp.status === 'active').length || 0

  // Check for recent activity (last 24 hours)
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const { data: recentActivity } = await supabase
    .from('system_activity')
    .select('*')
    .gte('created_at', yesterday.toISOString())
    .limit(1)

  const hasRecentActivity = recentActivity && recentActivity.length > 0

  const items = [
    {
      name: "Database",
      status: "connected",
      icon: Database,
      description: `${totalUsers} users, ${totalDepartments} departments, ${totalEmployees} employees`,
      lastChecked: "Just now",
    },
    {
      name: "Authentication",
      status: activeUsers > 0 ? "active" : "warning",
      icon: Shield,
      description: activeUsers > 0 ? `${activeUsers} active sessions` : "No active users detected",
      lastChecked: "Just now",
    },
    {
      name: "Employee Data",
      status: totalEmployees > 0 ? "active" : "warning",
      icon: Users,
      description: `${activeEmployees}/${totalEmployees} active employees`,
      lastChecked: "Just now",
    },
    {
      name: "Attendance System",
      status: totalAttendance > 0 ? "active" : "warning",
      icon: Clock,
      description: totalAttendance > 0 ? `${totalAttendance} attendance records` : "No attendance data",
      lastChecked: "Just now",
    },
    {
      name: "Payroll System",
      status: totalPayroll > 0 ? "active" : "warning",
      icon: DollarSign,
      description: totalPayroll > 0 ? `${totalPayroll} payroll records` : "No payroll data",
      lastChecked: "Just now",
    },
    {
      name: "System Activity",
      status: hasRecentActivity ? "active" : "warning",
      icon: Activity,
      description: hasRecentActivity ? "Recent activity detected" : "No recent activity",
      lastChecked: "Just now",
    },
  ]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          System Status
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => {
          const StatusIcon = getStatusIcon(item.status)
          return (
            <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white shadow-sm">
                  <item.icon className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getStatusColor(item.status))}
                >
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {item.status}
                </Badge>
                <div className="text-xs text-gray-400 mt-1">{item.lastChecked}</div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
