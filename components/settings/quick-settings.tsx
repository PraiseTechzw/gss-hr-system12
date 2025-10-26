"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  Bell, 
  Shield, 
  Mail, 
  Smartphone, 
  Database,
  Moon,
  Sun,
  Wifi,
  Lock,
  Eye,
  EyeOff,
  Check,
  X
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"

export function QuickSettings() {
  const supabase = createClient()
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsAlerts: false,
    darkMode: false,
    autoBackup: true,
    twoFactorAuth: true,
    dataEncryption: true,
    systemMaintenance: false,
    apiAccess: true,
    auditLogging: true,
    passwordExpiry: false
  })

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase.from("system_settings_new").select("*").limit(1).maybeSingle()
        if (error) {
          console.error("Error loading settings:", error)
          return
        }
        if (data) {
          setSettings({
            emailNotifications: !!data.email_notifications,
            smsAlerts: !!data.sms_alerts,
            darkMode: !!data.dark_mode,
            autoBackup: !!data.auto_backup,
            twoFactorAuth: !!data.two_factor_auth,
            dataEncryption: !!data.data_encryption,
            systemMaintenance: !!data.system_maintenance,
            apiAccess: !!data.api_access,
            auditLogging: !!data.audit_logging,
            passwordExpiry: !!data.password_expiry,
          })
          
          // Apply dark mode immediately if enabled
          if (data.dark_mode) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err)
      }
    }
    load()
  }, [supabase])

  const handleToggle = async (setting: keyof typeof settings) => {
    const next = !settings[setting]
    setSettings(prev => ({ ...prev, [setting]: next }))
    setIsSaving(true)
    const columnMap: Record<string, string> = {
      emailNotifications: "email_notifications",
      smsAlerts: "sms_alerts",
      darkMode: "dark_mode",
      autoBackup: "auto_backup",
      twoFactorAuth: "two_factor_auth",
      dataEncryption: "data_encryption",
      systemMaintenance: "system_maintenance",
      apiAccess: "api_access",
      auditLogging: "audit_logging",
      passwordExpiry: "password_expiry",
    }
    await supabase.from("system_settings").update({ [columnMap[setting]]: next, updated_at: new Date().toISOString() }).neq("id", "00000000-0000-0000-0000-000000000000")
    if (setting === 'darkMode') {
      const root = document.documentElement
      if (next) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
    setIsSaving(false)
  }

  const quickSettingsItems = [
    {
      id: "emailNotifications",
      label: "Email Notifications",
      description: "Receive system alerts via email",
      icon: Mail,
      color: "text-blue-600",
      category: "notifications"
    },
    {
      id: "smsAlerts",
      label: "SMS Alerts",
      description: "Critical alerts sent to mobile",
      icon: Smartphone,
      color: "text-green-600",
      category: "notifications"
    },
    {
      id: "darkMode",
      label: "Dark Mode",
      description: "Use dark theme interface",
      icon: Moon,
      color: "text-purple-600",
      category: "appearance"
    },
    {
      id: "autoBackup",
      label: "Auto Backup",
      description: "Automatic daily system backups",
      icon: Database,
      color: "text-orange-600",
      category: "system"
    },
    {
      id: "twoFactorAuth",
      label: "Two-Factor Authentication",
      description: "Enhanced login security",
      icon: Shield,
      color: "text-red-600",
      category: "security"
    },
    {
      id: "dataEncryption",
      label: "Data Encryption",
      description: "Encrypt sensitive data at rest",
      icon: Lock,
      color: "text-indigo-600",
      category: "security"
    },
    {
      id: "systemMaintenance",
      label: "Maintenance Mode",
      description: "Enable system maintenance mode",
      icon: Zap,
      color: "text-yellow-600",
      category: "system"
    },
    {
      id: "apiAccess",
      label: "API Access",
      description: "Allow external API connections",
      icon: Wifi,
      color: "text-cyan-600",
      category: "system"
    },
    {
      id: "auditLogging",
      label: "Audit Logging",
      description: "Log all system activities",
      icon: Eye,
      color: "text-gray-600",
      category: "security"
    },
    {
      id: "passwordExpiry",
      label: "Password Expiry",
      description: "Force password changes every 90 days",
      icon: Lock,
      color: "text-pink-600",
      category: "security"
    }
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "notifications":
        return "bg-blue-100 text-blue-800"
      case "appearance":
        return "bg-purple-100 text-purple-800"
      case "system":
        return "bg-orange-100 text-orange-800"
      case "security":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const categoryCounts = quickSettingsItems.reduce((acc, item) => {
    const enabled = settings[item.id as keyof typeof settings]
    if (!acc[item.category]) {
      acc[item.category] = { total: 0, enabled: 0 }
    }
    acc[item.category].total += 1
    if (enabled) acc[item.category].enabled += 1
    return acc
  }, {} as Record<string, { total: number; enabled: number }>)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Zap className="h-5 w-5" />
            Quick Settings
          </CardTitle>
          <Button variant="outline" size="sm" disabled={isSaving}>
            Advanced Settings
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Summary */}
        <div className="grid gap-2 md:grid-cols-2">
          {Object.entries(categoryCounts).map(([category, counts]) => (
            <div key={category} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <span className="text-sm font-medium capitalize text-gray-900 dark:text-gray-100">{category}</span>
              <Badge variant="secondary" className={getCategoryColor(category)}>
                {counts.enabled}/{counts.total}
              </Badge>
            </div>
          ))}
        </div>

        {/* Settings List */}
        <div className="space-y-3">
          {quickSettingsItems.map((item) => {
            const ItemIcon = item.icon
            const isEnabled = settings[item.id as keyof typeof settings]
            
            return (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${isEnabled ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <ItemIcon className={`h-4 w-4 ${isEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                      <Badge variant="outline" className={`text-xs ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {isEnabled ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400" />
                  )}
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={() => handleToggle(item.id as keyof typeof settings)}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Security Status */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Security Status</h4>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Shield className="h-3 w-3 mr-1" />
              Secure
            </Badge>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Security Features Enabled:</span>
              <span className="font-medium">
                {quickSettingsItems.filter(item => 
                  item.category === 'security' && settings[item.id as keyof typeof settings]
                ).length}/{quickSettingsItems.filter(item => item.category === 'security').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">System Health:</span>
              <span className="font-medium text-green-600">Excellent</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Security Scan:</span>
              <span className="font-medium">2 hours ago</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <div className="grid gap-2 md:grid-cols-2">
            <Button variant="outline" size="sm" className="w-full">
              <Database className="h-4 w-4 mr-2" />
              Backup Now
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <Shield className="h-4 w-4 mr-2" />
              Security Scan
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
