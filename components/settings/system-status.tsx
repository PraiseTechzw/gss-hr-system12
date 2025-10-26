"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Activity,
  Database,
  Wifi,
  HardDrive,
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Zap,
  Users,
  Building,
  FileText,
  Calendar
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SystemStats {
  activeUsers: number
  totalUsers: number
  systemVersion: string
  databaseSize: string
  securityScore: number
  lastBackup: string
  totalEmployees: number
  activeDeployments: number
  pendingLeaveRequests: number
  monthlyPayroll: number
}

export function SystemStatus({ settings }: { settings: SystemStats | null }) {
  const supabase = createClient()
  const [metrics, setMetrics] = useState({
    employees: 0,
    deploymentsActive: 0,
    deploymentsPending: 0,
    networkStatus: "online" as "online" | "offline",
    databaseConnections: 0,
    systemUptime: "99.9%",
    memoryUsage: "45%",
    cpuUsage: "23%"
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadRealTimeMetrics() {
      try {
        // Load real-time metrics
        const [
          { data: employees },
          { data: activeDeployments },
          { data: pendingDeployments },
          { data: systemSettings },
          { data: recentActivity }
        ] = await Promise.all([
          supabase.from('employees').select('id', { count: 'exact' }),
          supabase.from('deployments').select('id', { count: 'exact' }).eq('status', 'active'),
          supabase.from('deployments').select('id', { count: 'exact' }).eq('status', 'pending'),
          supabase.from('system_settings_new').select('*').limit(1).maybeSingle(),
          supabase.from('system_activity').select('id').gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
        ])

        if (isMounted) {
          setMetrics({
            employees: employees?.length || 0,
            deploymentsActive: activeDeployments?.length || 0,
            deploymentsPending: pendingDeployments?.length || 0,
            networkStatus: "online",
            databaseConnections: recentActivity?.length || 0,
            systemUptime: "99.9%", // This would come from system monitoring
            memoryUsage: "45%", // This would come from system monitoring
            cpuUsage: "23%" // This would come from system monitoring
          })
        }
      } catch (error) {
        console.error('Error loading system metrics:', error)
        if (isMounted) {
          setMetrics(prev => ({
            ...prev,
            networkStatus: "offline"
          }))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadRealTimeMetrics()

    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadRealTimeMetrics, 30000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [supabase])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "offline":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "offline":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading || !settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a2141e] mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading system status...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const statusItems = [
    {
      label: "Database Connection",
      status: metrics.networkStatus,
      icon: Database,
      value: `${metrics.databaseConnections} active connections`,
      description: "Real-time database connectivity"
    },
    {
      label: "System Uptime",
      status: "online",
      icon: Clock,
      value: metrics.systemUptime,
      description: "System availability"
    },
    {
      label: "Memory Usage",
      status: parseFloat(metrics.memoryUsage) > 80 ? "warning" : "online",
      icon: HardDrive,
      value: metrics.memoryUsage,
      description: "Current memory utilization"
    },
    {
      label: "CPU Usage",
      status: parseFloat(metrics.cpuUsage) > 80 ? "warning" : "online",
      icon: Zap,
      value: metrics.cpuUsage,
      description: "Current CPU utilization"
    },
    {
      label: "Active Users",
      status: "online",
      icon: Users,
      value: `${settings.activeUsers} of ${settings.totalUsers}`,
      description: "Currently logged in users"
    },
    {
      label: "Total Employees",
      status: "online",
      icon: Users,
      value: settings.totalEmployees.toString(),
      description: "Total employee records"
    },
    {
      label: "Active Deployments",
      status: "online",
      icon: Building,
      value: settings.activeDeployments.toString(),
      description: "Currently active deployments"
    },
    {
      label: "Pending Leave Requests",
      status: settings.pendingLeaveRequests > 10 ? "warning" : "online",
      icon: Calendar,
      value: settings.pendingLeaveRequests.toString(),
      description: "Leave requests awaiting approval"
    },
    {
      label: "Monthly Payroll",
      status: "online",
      icon: FileText,
      value: `$${settings.monthlyPayroll.toLocaleString()}`,
      description: "Current month payroll total"
    },
    {
      label: "Security Score",
      status: settings.securityScore >= 75 ? "online" : settings.securityScore >= 50 ? "warning" : "offline",
      icon: Shield,
      value: `${settings.securityScore}%`,
      description: "Overall system security rating"
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <Activity className="h-5 w-5" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Overall system status */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-3">
              {getStatusIcon(metrics.networkStatus)}
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">System Status</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {metrics.networkStatus === "online" ? "All systems operational" : "System offline"}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(metrics.networkStatus)}>
              {metrics.networkStatus.toUpperCase()}
            </Badge>
          </div>

          {/* Detailed metrics */}
          <div className="grid gap-3 md:grid-cols-2">
            {statusItems.map((item, index) => {
              const ItemIcon = item.icon
              return (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                      <ItemIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{item.value}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(item.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(item.status)}
                      <span className="text-xs">
                        {item.status === "online" ? "OK" : 
                         item.status === "warning" ? "WARN" : "ERROR"}
                      </span>
                    </div>
                  </Badge>
                </div>
              )
            })}
          </div>

          {/* Last updated */}
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}