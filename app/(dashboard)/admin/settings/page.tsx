"use client"

import { useState, useEffect } from "react"
// Supabase client removed
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Settings, 
  Shield, 
  Users, 
  Mail, 
  Bell, 
  Database, 
  Key, 
  Globe,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import { toast } from "sonner"
import { logSettingsUpdate } from "@/lib/system-activity"

interface SystemSettings {
  company_name: string
  company_email: string
  company_phone: string
  company_address: string
  allow_user_registration: boolean
  require_admin_approval: boolean
  email_notifications: boolean
  system_maintenance: boolean
  backup_frequency: string
  session_timeout: number
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    company_name: "GSS HR & Payroll Management System",
    company_email: "admin@gss.com",
    company_phone: "+263 771 123 456",
    company_address: "Harare, Zimbabwe",
    allow_user_registration: true,
    require_admin_approval: true,
    email_notifications: true,
    system_maintenance: false,
    backup_frequency: "daily",
    session_timeout: 30
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .single()

      if (data) {
        setSettings({
          company_name: data.company_name || "GSS HR & Payroll Management System",
          company_email: data.company_email || "admin@gss.com",
          company_phone: data.company_phone || "+263 771 123 456",
          company_address: data.company_address || "Harare, Zimbabwe",
          allow_user_registration: data.allow_user_registration ?? true,
          require_admin_approval: data.require_admin_approval ?? true,
          email_notifications: data.email_notifications ?? true,
          system_maintenance: data.system_maintenance ?? false,
          backup_frequency: data.backup_frequency || "daily",
          session_timeout: data.session_timeout || 30
        })
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast.error("Failed to load settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          company_name: settings.company_name,
          company_email: settings.company_email,
          company_phone: settings.company_phone,
          company_address: settings.company_address,
          allow_user_registration: settings.allow_user_registration,
          require_admin_approval: settings.require_admin_approval,
          email_notifications: settings.email_notifications,
          system_maintenance: settings.system_maintenance,
          backup_frequency: settings.backup_frequency,
          session_timeout: settings.session_timeout
        })

      if (error) throw error

      // Log system activity
      const updatedSettings = Object.keys(settings).filter(key => 
        settings[key as keyof SystemSettings] !== undefined
      )
      await logSettingsUpdate('admin', updatedSettings)

      toast.success("Settings saved", {
        description: "System settings have been updated successfully"
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a2141e] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#a2141e] hover:bg-[#8a0f1a]"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={settings.company_name}
                onChange={(e) => updateSetting('company_name', e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_email">Company Email</Label>
              <Input
                id="company_email"
                type="email"
                value={settings.company_email}
                onChange={(e) => updateSetting('company_email', e.target.value)}
                placeholder="admin@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_phone">Company Phone</Label>
              <Input
                id="company_phone"
                value={settings.company_phone}
                onChange={(e) => updateSetting('company_phone', e.target.value)}
                placeholder="+263 771 123 456"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_address">Company Address</Label>
              <Textarea
                id="company_address"
                value={settings.company_address}
                onChange={(e) => updateSetting('company_address', e.target.value)}
                placeholder="Enter company address"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="allow_registration">Allow User Registration</Label>
                <p className="text-sm text-gray-500">Allow new users to register</p>
              </div>
              <Switch
                id="allow_registration"
                checked={settings.allow_user_registration}
                onCheckedChange={(checked) => updateSetting('allow_user_registration', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="require_approval">Require Admin Approval</Label>
                <p className="text-sm text-gray-500">New users need admin approval</p>
              </div>
              <Switch
                id="require_approval"
                checked={settings.require_admin_approval}
                onCheckedChange={(checked) => updateSetting('require_admin_approval', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="email_notifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">Send email notifications</p>
              </div>
              <Switch
                id="email_notifications"
                checked={settings.email_notifications}
                onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                <p className="text-sm text-gray-500">Put system in maintenance mode</p>
              </div>
              <Switch
                id="maintenance_mode"
                checked={settings.system_maintenance}
                onCheckedChange={(checked) => updateSetting('system_maintenance', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="backup_frequency">Backup Frequency</Label>
              <Select
                value={settings.backup_frequency}
                onValueChange={(value) => updateSetting('backup_frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
              <Input
                id="session_timeout"
                type="number"
                value={settings.session_timeout}
                onChange={(e) => updateSetting('session_timeout', parseInt(e.target.value))}
                placeholder="30"
                min="5"
                max="480"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Security Notice</span>
              </div>
              <p className="text-sm text-yellow-700">
                These settings affect system security. Changes will take effect immediately.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Password Policy</p>
                  <p className="text-sm text-gray-500">Minimum 6 characters required</p>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Session Security</p>
                  <p className="text-sm text-gray-500">Automatic logout on timeout</p>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Data Encryption</p>
                  <p className="text-sm text-gray-500">All data encrypted at rest</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Enabled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Database</p>
                <p className="text-sm text-green-600">Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Authentication</p>
                <p className="text-sm text-green-600">Active</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Email Service</p>
                <p className="text-sm text-green-600">Operational</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
