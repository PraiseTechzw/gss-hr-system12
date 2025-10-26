"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Users, 
  Building, 
  Bell, 
  Shield, 
  Database, 
  Monitor,
  HardDrive,
  Lock,
  UserCheck,
  FileText,
  Zap,
  RefreshCw,
  Save,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react"
import Link from "next/link"
import { SettingsOverview } from "@/components/settings/settings-overview"
import { SystemStatus } from "@/components/settings/system-status"
import { QuickSettings } from "@/components/settings/quick-settings"
import { SettingsProvider } from "@/lib/settings-context"
import { useEffect, useState } from "react"
import { toast } from "sonner"

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

interface RecentActivity {
  id: string
  action: string
  description: string
  user_id: string
  created_at: string
  details?: any
}

export default function SettingsPage() {
  const supabase = createClient()
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadRealTimeData = async () => {
    try {
      // Load all real-time data in parallel
      const [
        { data: activeUsers },
        { data: totalUsers },
        { data: systemSettings },
        { data: employees },
        { data: deployments },
        { data: leaveRequests },
        { data: payrollRecords },
        { data: activityData },
        { data: backupData }
      ] = await Promise.all([
        // Count active users (logged in within last 24 hours)
        supabase
          .from('user_profiles')
          .select('id', { count: 'exact' })
          .gte('last_login', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        
        // Count total users
        supabase
          .from('user_profiles')
          .select('id', { count: 'exact' }),
        
        // Get system settings
        supabase
          .from('system_settings_new')
          .select('*')
          .limit(1)
          .maybeSingle(),
        
        // Count total employees
        supabase
          .from('employees')
          .select('id', { count: 'exact' }),
        
        // Count active deployments
        supabase
          .from('deployments')
          .select('id', { count: 'exact' })
          .eq('status', 'active'),
        
        // Count pending leave requests
        supabase
          .from('leave_requests')
          .select('id', { count: 'exact' })
          .eq('status', 'pending'),
        
        // Get current month payroll total
        supabase
          .from('payroll')
          .select('net_salary')
          .gte('pay_period_start', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
          .lt('pay_period_start', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()),
        
        // Get recent activity
        supabase
          .from('system_activity')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6),
        
        // Get last backup info
        supabase
          .from('system_activity')
          .select('created_at')
          .eq('action', 'system_backup')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      ])

      // Calculate monthly payroll total
      const monthlyPayrollTotal = payrollRecords?.reduce((sum, record) => sum + (record.net_salary || 0), 0) || 0

      // Calculate database size (approximate based on record counts)
      const totalRecords = (totalUsers?.length || 0) + (employees?.length || 0) + (deployments?.length || 0) + (leaveRequests?.length || 0)
      const estimatedSize = `${(totalRecords * 0.001).toFixed(1)} MB`

      // Calculate security score based on enabled security features
      const securityFeatures = systemSettings ? [
        systemSettings.two_factor_auth,
        systemSettings.data_encryption,
        systemSettings.audit_logging,
        systemSettings.password_expiry
      ].filter(Boolean).length : 0
      const securityScore = Math.round((securityFeatures / 4) * 100)

      // Set real-time stats
      setSystemStats({
        activeUsers: activeUsers?.length || 0,
        totalUsers: totalUsers?.length || 0,
        systemVersion: systemSettings?.system_version || 'Unknown',
        databaseSize: estimatedSize,
        securityScore: securityScore,
        lastBackup: backupData?.created_at ? new Date(backupData.created_at).toLocaleString() : 'Never',
        totalEmployees: employees?.length || 0,
        activeDeployments: deployments?.length || 0,
        pendingLeaveRequests: leaveRequests?.length || 0,
        monthlyPayroll: monthlyPayrollTotal
      })

      // Set recent activity
      setRecentActivity(activityData || [])

    } catch (error) {
      console.error('Error loading real-time data:', error)
      toast.error('Failed to load system data')
    }
  }

  useEffect(() => {
    loadRealTimeData().finally(() => setLoading(false))
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadRealTimeData()
    setRefreshing(false)
    toast.success('Data refreshed successfully')
  }

  const handleBackup = async () => {
    try {
      const response = await fetch('/api/system/backup', { method: 'POST' })
      if (response.ok) {
        toast.success('System backup initiated successfully!')
        // Refresh data to show updated backup time
        await loadRealTimeData()
      } else {
        toast.error('Failed to initiate backup. Please try again.')
      }
    } catch (error) {
      toast.error('Error initiating backup. Please try again.')
    }
  }

  const handleSaveAll = async () => {
    try {
      const response = await fetch('/api/settings/save-all', { method: 'POST' })
      if (response.ok) {
        toast.success('All settings saved successfully!')
      } else {
        toast.error('Failed to save settings. Please try again.')
      }
    } catch (error) {
      toast.error('Error saving settings. Please try again.')
    }
  }

  const settingsCategories = [
    {
      id: "company",
      title: "Company Profile",
      description: "Company information, branding, and contact details",
      icon: Building,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      href: "/settings/company",
      items: ["Company Details", "Logo & Branding", "Contact Information", "Business Hours"]
    },
    {
      id: "users",
      title: "User Management",
      description: "Manage users, roles, and access permissions",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
      href: "/settings/users",
      items: ["User Accounts", "Roles & Permissions", "Access Control", "Authentication"]
    },
    {
      id: "system",
      title: "System Preferences",
      description: "General system settings and configurations",
      icon: Settings,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      href: "/settings/system",
      items: ["General Settings", "Date & Time", "Localization", "Data Format"]
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Email alerts, SMS notifications, and system alerts",
      icon: Bell,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      href: "/settings/notifications",
      items: ["Email Notifications", "SMS Alerts", "Push Notifications", "Alert Rules"]
    },
    {
      id: "security",
      title: "Security & Privacy",
      description: "Security settings, data protection, and privacy controls",
      icon: Shield,
      color: "text-red-600",
      bgColor: "bg-red-100",
      href: "/settings/security",
      items: ["Password Policy", "Two-Factor Auth", "Data Encryption", "Privacy Settings"]
    },
    {
      id: "integrations",
      title: "Integrations",
      description: "Third-party integrations and API configurations",
      icon: Zap,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      href: "/settings/integrations",
      items: ["API Keys", "Webhooks", "External Services", "Data Sync"]
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#a2141e] mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <SettingsProvider>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings & Configuration</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-300">
              Manage system configuration, user preferences, and security settings
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={handleBackup}
            >
              <Database className="h-4 w-4" />
              Backup System
            </Button>
            <Button 
              className="bg-[#a2141e] hover:bg-[#8a1119] gap-2" 
              onClick={handleSaveAll}
            >
              <Save className="h-4 w-4" />
              Save All Changes
            </Button>
          </div>
        </div>

        {/* Real-Time System Overview Cards */}
        {systemStats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{systemStats.activeUsers}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">of {systemStats.totalUsers} total users</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">System Status</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">Online</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Version {systemStats.systemVersion}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Last Backup</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {systemStats.lastBackup === 'Never' ? 'Never' : 'Recent'}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {systemStats.lastBackup === 'Never' ? 'No backups yet' : systemStats.lastBackup}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <HardDrive className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Security Score</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{systemStats.securityScore}%</p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {systemStats.securityScore >= 75 ? 'Excellent' : systemStats.securityScore >= 50 ? 'Good' : 'Needs improvement'}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Additional Real-Time Stats */}
        {systemStats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Employees</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{systemStats.totalEmployees}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Active workforce</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Deployments</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{systemStats.activeDeployments}</p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">Currently deployed</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                    <Building className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending Leave</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{systemStats.pendingLeaveRequests}</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">Awaiting approval</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Monthly Payroll</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      ${systemStats.monthlyPayroll.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">Current month</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Overview and Quick Settings */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SettingsOverview settings={systemStats} />
          <QuickSettings />
        </div>

        {/* System Status */}
        <SystemStatus settings={systemStats} />

        {/* Enhanced Settings Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Settings className="h-5 w-5" />
              Settings Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {settingsCategories.map((category) => {
                const CategoryIcon = category.icon
                return (
                  <Link key={category.id} href={category.href}>
                    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full group border-l-4 border-l-transparent hover:border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-full ${category.bgColor} dark:opacity-80 group-hover:scale-110 transition-transform`}>
                            <CategoryIcon className={`h-6 w-6 ${category.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                                {category.title}
                              </h3>
                              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{category.description}</p>
                            <div className="space-y-1">
                              {category.items.slice(0, 3).map((item, index) => (
                                <div key={index} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                                  {item}
                                </div>
                              ))}
                              {category.items.length > 3 && (
                                <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                                  +{category.items.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Real-Time Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Clock className="h-5 w-5" />
              Recent System Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No recent activity found</p>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{activity.action}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{activity.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsProvider>
  )
}