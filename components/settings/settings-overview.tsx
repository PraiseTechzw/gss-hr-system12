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
  AlertCircle
} from "lucide-react"

type SystemSettings = {
  companyName: string
  timezone: string
  currency: string
  language: string
  dateFormat: string
  workingHours: string
  weekStart: string
  fiscalYearStart: string
  lastBackup: string
  systemVersion: string
  databaseSize: string
  activeUsers: number
  totalEmployees: number
}

export function SettingsOverview({ settings }: { settings: SystemSettings }) {
  const settingsItems = [
    {
      label: "Company Name",
      value: settings.companyName,
      icon: Building,
      status: "configured"
    },
    {
      label: "Timezone",
      value: settings.timezone,
      icon: Globe,
      status: "configured"
    },
    {
      label: "Currency",
      value: settings.currency,
      icon: DollarSign,
      status: "configured"
    },
    {
      label: "Language",
      value: settings.language,
      icon: Languages,
      status: "configured"
    },
    {
      label: "Date Format",
      value: settings.dateFormat,
      icon: Calendar,
      status: "configured"
    },
    {
      label: "Working Hours",
      value: settings.workingHours,
      icon: Clock,
      status: "configured"
    },
    {
      label: "Week Start",
      value: settings.weekStart,
      icon: Calendar,
      status: "configured"
    },
    {
      label: "Fiscal Year Start",
      value: settings.fiscalYearStart,
      icon: Calendar,
      status: "configured"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "configured":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "configured":
        return <Check className="h-3 w-3" />
      case "pending":
        return <Clock className="h-3 w-3" />
      case "error":
        return <AlertCircle className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            System Configuration
          </CardTitle>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Settings
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {settingsItems.map((item, index) => {
            const ItemIcon = item.icon
            return (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <ItemIcon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-600">{item.value}</p>
                  </div>
                </div>
                <Badge variant="secondary" className={getStatusColor(item.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(item.status)}
                    <span className="capitalize">{item.status}</span>
                  </div>
                </Badge>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {settings.activeUsers}
              </div>
              <p className="text-sm text-blue-700">Active Users</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {settings.totalEmployees}
              </div>
              <p className="text-sm text-green-700">Total Employees</p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium text-gray-900">System Health</p>
              <p className="text-gray-600">All systems operational</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 font-medium">Online</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
