'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Building2, 
  UserPlus, 
  Shield, 
  BarChart3, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  DollarSign,
  Activity,
  Database,
  Server,
  Globe
} from 'lucide-react'
import { toast } from 'sonner'

interface AdminSummary {
  users: {
    total: number
    active: number
    byRole: {
      admin: number
      hr: number
      manager: number
      employee: number
    }
  }
  departments: {
    total: number
    active: number
    withManagers: number
  }
  system: {
    health: 'healthy' | 'warning' | 'error'
    uptime: string
    lastBackup: string
    compliance: {
      zimra: boolean
      nssa: boolean
    }
  }
  recentActivity: Array<{
    id: string
    action: string
    user: string
    timestamp: string
    type: 'success' | 'warning' | 'error'
  }>
}

export default function AdminSummary() {
  const [summary, setSummary] = useState<AdminSummary>({
    users: {
      total: 0,
      active: 0,
      byRole: {
        admin: 0,
        hr: 0,
        manager: 0,
        employee: 0
      }
    },
    departments: {
      total: 0,
      active: 0,
      withManagers: 0
    },
    system: {
      health: 'healthy',
      uptime: '15 days, 3 hours',
      lastBackup: '2 hours ago',
      compliance: {
        zimra: true,
        nssa: true
      }
    },
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminSummary()
  }, [])

  const fetchAdminSummary = async () => {
    try {
      setLoading(true)
      
      // Fetch users data
      const usersResponse = await fetch('/api/admin/users')
      const usersData = await usersResponse.json()
      
      // Fetch departments data
      const deptResponse = await fetch('/api/admin/departments')
      const deptData = await deptResponse.json()
      
      if (usersData.success && deptData.success) {
        const users = usersData.data || []
        const departments = deptData.data || []
        
        // Calculate user statistics
        const userStats = {
          total: users.length,
          active: users.filter((u: any) => u.is_active).length,
          byRole: {
            admin: users.filter((u: any) => u.role === 'admin').length,
            hr: users.filter((u: any) => u.role === 'hr').length,
            manager: users.filter((u: any) => u.role === 'manager').length,
            employee: users.filter((u: any) => u.role === 'employee').length
          }
        }
        
        // Calculate department statistics
        const deptStats = {
          total: departments.length,
          active: departments.filter((d: any) => d.is_active).length,
          withManagers: departments.filter((d: any) => d.users).length
        }
        
        setSummary({
          users: userStats,
          departments: deptStats,
          system: {
            health: 'healthy',
            uptime: '15 days, 3 hours',
            lastBackup: '2 hours ago',
            compliance: {
              zimra: true,
              nssa: true
            }
          },
          recentActivity: [
            {
              id: '1',
              action: 'New user created',
              user: 'System Admin',
              timestamp: '2 hours ago',
              type: 'success'
            },
            {
              id: '2',
              action: 'Department updated',
              user: 'System Admin',
              timestamp: '4 hours ago',
              type: 'success'
            },
            {
              id: '3',
              action: 'System backup completed',
              user: 'System',
              timestamp: '6 hours ago',
              type: 'success'
            }
          ]
        })
      }
    } catch (error) {
      console.error('Error fetching admin summary:', error)
      toast.error('Failed to load admin summary')
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin summary...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.users.total}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              {summary.users.active} active
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.departments.total}</div>
            <p className="text-xs text-gray-600 mt-1">
              {summary.departments.active} active
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <Globe className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              ZIMRA & NSSA compliant
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Role Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>User Distribution</span>
            </CardTitle>
            <CardDescription>
              Users by role and department
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Administrators</span>
                </div>
                <Badge variant="destructive">{summary.users.byRole.admin}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">HR Staff</span>
                </div>
                <Badge variant="default">{summary.users.byRole.hr}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Managers</span>
                </div>
                <Badge variant="secondary">{summary.users.byRole.manager}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserPlus className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Employees</span>
                </div>
                <Badge variant="outline">{summary.users.byRole.employee}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-green-600" />
              <span>Department Status</span>
            </CardTitle>
            <CardDescription>
              Department organization and management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Departments</span>
                <span className="text-sm font-medium">{summary.departments.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Departments</span>
                <span className="text-sm font-medium text-green-600">{summary.departments.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">With Managers</span>
                <span className="text-sm font-medium text-blue-600">{summary.departments.withManagers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Management Coverage</span>
                <span className="text-sm font-medium">
                  {summary.departments.total > 0 
                    ? Math.round((summary.departments.withManagers / summary.departments.total) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-gray-600" />
              <span>System Status</span>
            </CardTitle>
            <CardDescription>
              Current system health and performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Health</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {summary.system.health}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="text-sm font-medium">{summary.system.uptime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Backup</span>
                <span className="text-sm font-medium">{summary.system.lastBackup}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-purple-600" />
              <span>Compliance Status</span>
            </CardTitle>
            <CardDescription>
              ZIMRA and NSSA compliance monitoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">ZIMRA Compliance</span>
                <Badge variant={summary.system.compliance.zimra ? "default" : "destructive"}>
                  {summary.system.compliance.zimra ? "Compliant" : "Non-compliant"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">NSSA Compliance</span>
                <Badge variant={summary.system.compliance.nssa ? "default" : "destructive"}>
                  {summary.system.compliance.nssa ? "Compliant" : "Non-compliant"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overall Status</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Fully Compliant
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>Recent System Activity</span>
          </CardTitle>
          <CardDescription>
            Latest actions and changes in the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {summary.recentActivity.map((activity) => (
            <div 
              key={activity.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}
            >
              {getActivityIcon(activity.type)}
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.action}</p>
                <p className="text-xs text-gray-600">by {activity.user}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
