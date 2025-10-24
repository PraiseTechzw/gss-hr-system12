import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Users, 
  Building, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Globe,
  Key,
  Mail,
  Smartphone,
  Monitor,
  HardDrive,
  Wifi,
  Lock,
  UserCheck,
  FileText,
  Zap
} from "lucide-react"
import Link from "next/link"
import { SettingsOverview } from "@/components/settings/settings-overview"
import { SystemStatus } from "@/components/settings/system-status"
import { QuickSettings } from "@/components/settings/quick-settings"
import { getSystemSettings, getRecentActivity } from "@/lib/database-utils"

export default async function SettingsPage() {
  const supabase = await createClient()

  // Fetch current user and system information using utility functions
  const [
    { data: { user } },
    systemSettings,
    recentActivity
  ] = await Promise.all([
    supabase.auth.getUser(),
    getSystemSettings(),
    getRecentActivity()
  ])

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

  // Convert recent activity to settings format
  const settingsActivity = recentActivity.slice(0, 4).map((activity, index) => ({
    action: activity.title,
    user: "System User",
    timestamp: new Date(activity.timestamp).toLocaleDateString(),
    category: activity.type.charAt(0).toUpperCase() + activity.type.slice(1)
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-gray-500">Manage system configuration and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Database className="mr-2 h-4 w-4" />
            Backup System
          </Button>
          <Button className="bg-[#a2141e] hover:bg-[#8a1119]">
            <FileText className="mr-2 h-4 w-4" />
            Export Settings
          </Button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{systemSettings.activeUsers}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Users className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">Online now</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Version</p>
                <p className="text-2xl font-bold text-gray-900">{systemSettings.systemVersion}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Monitor className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Zap className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-blue-600 font-medium">Up to date</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Database Size</p>
                <p className="text-2xl font-bold text-gray-900">{systemSettings.databaseSize}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <HardDrive className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Database className="h-4 w-4 text-purple-500 mr-1" />
              <span className="text-purple-600 font-medium">Optimized</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Backup</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Date(systemSettings.lastBackup).toLocaleDateString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Lock className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">Secure</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Overview and Quick Settings */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsOverview settings={systemSettings} />
        <QuickSettings />
      </div>

      {/* System Status */}
      <SystemStatus settings={systemSettings} />

      {/* Settings Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Settings Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {settingsCategories.map((category) => {
              const CategoryIcon = category.icon
              return (
                <Link key={category.id} href={category.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${category.bgColor}`}>
                          <CategoryIcon className={`h-6 w-6 ${category.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{category.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                          <div className="space-y-1">
                            {category.items.slice(0, 3).map((item, index) => (
                              <div key={index} className="text-xs text-gray-500">
                                • {item}
                              </div>
                            ))}
                            {category.items.length > 3 && (
                              <div className="text-xs text-gray-400">
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

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Settings Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settingsActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">by {activity.user}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-1">
                    {activity.category}
                  </Badge>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
