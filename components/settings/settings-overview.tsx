"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Building, 
  Globe, 
  DollarSign, 
  Calendar, 
  Clock,
  MapPin,
  Languages,
  Edit,
  Check,
  AlertCircle,
  Users,
  Shield,
  Database,
  HardDrive
} from "lucide-react"
import { useEffect, useState } from "react"
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

export function SettingsOverview({ settings }: { settings: SystemStats | null }) {
  const supabase = createClient()
  const [systemSettings, setSystemSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await supabase
          .from('system_settings_new')
          .select('*')
          .limit(1)
          .maybeSingle()
        
        if (data) {
          setSystemSettings(data)
        }
      } catch (error) {
        console.error('Error loading system settings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [supabase])

  if (loading || !systemSettings || !settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a2141e] mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading system overview...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const settingsItems = [
    {
      label: "Company Name",
      value: systemSettings.company_name || 'Not configured',
      icon: Building,
      status: systemSettings.company_name ? "configured" : "not_configured"
    },
    {
      label: "Company Email",
      value: systemSettings.company_email || 'Not configured',
      icon: Globe,
      status: systemSettings.company_email ? "configured" : "not_configured"
    },
    {
      label: "Company Phone",
      value: systemSettings.company_phone || 'Not configured',
      icon: MapPin,
      status: systemSettings.company_phone ? "configured" : "not_configured"
    },
    {
      label: "Working Hours",
      value: `${systemSettings.working_hours || 8} hours/day`,
      icon: Clock,
      status: "configured"
    },
    {
      label: "Overtime Rate",
      value: `${systemSettings.overtime_rate || 1.5}x`,
      icon: DollarSign,
      status: "configured"
    },
    {
      label: "Annual Leave Balance",
      value: `${systemSettings.leave_balance_annual || 21} days`,
      icon: Calendar,
      status: "configured"
    },
    {
      label: "Payroll Frequency",
      value: systemSettings.payroll_frequency || 'monthly',
      icon: DollarSign,
      status: "configured"
    },
    {
      label: "System Version",
      value: systemSettings.system_version || 'Unknown',
      icon: Database,
      status: "configured"
    },
    {
      label: "Password Min Length",
      value: `${systemSettings.password_min_length || 6} characters`,
      icon: Shield,
      status: "configured"
    },
    {
      label: "Session Timeout",
      value: `${systemSettings.session_timeout || 480} minutes`,
      icon: Clock,
      status: "configured"
    },
    {
      label: "Backup Frequency",
      value: systemSettings.backup_frequency || 'daily',
      icon: HardDrive,
      status: "configured"
    },
    {
      label: "Backup Retention",
      value: `${systemSettings.backup_retention_days || 30} days`,
      icon: HardDrive,
      status: "configured"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "configured":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "not_configured":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "configured":
        return <Check className="h-3 w-3" />
      case "not_configured":
        return <AlertCircle className="h-3 w-3" />
      case "error":
        return <AlertCircle className="h-3 w-3" />
      default:
        return <AlertCircle className="h-3 w-3" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <Building className="h-5 w-5" />
          System Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Real-time system stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-300">Active Users</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{settings.activeUsers}</p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
            <Shield className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-300">Security Score</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{settings.securityScore}%</p>
          </div>
        </div>

        {/* Settings items */}
        <div className="space-y-3">
          {settingsItems.map((item, index) => {
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
                  </div>
                </div>
                <Badge className={getStatusColor(item.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(item.status)}
                    <span className="text-xs">
                      {item.status === "configured" ? "OK" : 
                       item.status === "not_configured" ? "Setup" : "Error"}
                    </span>
                  </div>
                </Badge>
              </div>
            )
          })}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" size="sm" className="flex-1">
            <Edit className="h-4 w-4 mr-2" />
            Edit Settings
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Globe className="h-4 w-4 mr-2" />
            Localization
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}