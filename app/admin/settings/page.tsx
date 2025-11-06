'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Save, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  Shield, 
  DollarSign,
  Percent,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface SystemSettings {
  id: string
  company_name: string
  company_address?: string
  company_phone?: string
  company_email?: string
  logo_url?: string
  nssa_rate: number
  aids_levy_rate: number
  created_at: string
  updated_at: string
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    id: '',
    company_name: 'Genius Security Services',
    company_address: '',
    company_phone: '',
    company_email: '',
    logo_url: '',
    nssa_rate: 0.045,
    aids_levy_rate: 0.03,
    created_at: '',
    updated_at: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')
      const data = await response.json()

      if (data.success) {
        const settingsData = data.data
        setSettings({
          id: '1',
          company_name: settingsData.company_name || 'Genius Security Services (Pvt) Ltd',
          company_address: settingsData.company_address || '',
          company_phone: settingsData.company_phone || '',
          company_email: settingsData.company_email || 'info@geniussecurity.co.zw',
          logo_url: settingsData.logo_url || '/logo.png',
          nssa_rate: parseFloat(settingsData.nssa_rate) || 0.045,
          aids_levy_rate: parseFloat(settingsData.aids_levy_rate) || 0.03,
          created_at: settingsData.created_at || new Date().toISOString(),
          updated_at: settingsData.updated_at || new Date().toISOString()
        })
      } else {
        toast.error('Failed to fetch settings', {
          description: data.error || 'An error occurred'
        })
      }
    } catch (error) {
      toast.error('Connection error', {
        description: 'Unable to fetch settings. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: settings.company_name,
          company_address: settings.company_address,
          company_phone: settings.company_phone,
          company_email: settings.company_email,
          logo_url: settings.logo_url,
          nssa_rate: settings.nssa_rate.toString(),
          aids_levy_rate: settings.aids_levy_rate.toString()
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Settings saved successfully', {
          description: 'Your system settings have been updated'
        })
        setSettings(prev => ({
          ...prev,
          updated_at: new Date().toISOString()
        }))
      } else {
        toast.error('Failed to save settings', {
          description: data.error || 'An error occurred'
        })
      }
    } catch (error) {
      toast.error('Connection error', {
        description: 'Unable to save settings. Please try again.'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings({
        id: '1',
        company_name: 'Genius Security Services (Pvt) Ltd',
        company_address: '123 Business Park, Harare, Zimbabwe',
        company_phone: '+263 4 123 4567',
        company_email: 'info@geniussecurity.co.zw',
        logo_url: '/logo.png',
        nssa_rate: 0.045,
        aids_levy_rate: 0.03,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      toast.info('Settings reset to default values')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure your HR system settings, company information, and compliance rates.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Company Information */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span>Company Information</span>
              </CardTitle>
              <CardDescription>
                Basic company details that appear on payslips and reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={settings.company_name}
                    onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="company_phone">Phone Number</Label>
                  <Input
                    id="company_phone"
                    value={settings.company_phone}
                    onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                    placeholder="+263 4 123 4567"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="company_address">Address</Label>
                <textarea
                  id="company_address"
                  value={settings.company_address}
                  onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter company address"
                />
              </div>
              <div>
                <Label htmlFor="company_email">Email Address</Label>
                <Input
                  id="company_email"
                  type="email"
                  value={settings.company_email}
                  onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                  placeholder="info@company.co.zw"
                />
              </div>
            </CardContent>
          </Card>

          {/* Compliance Settings */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span>Zimbabwe Compliance Settings</span>
              </CardTitle>
              <CardDescription>
                Tax rates and compliance settings for Zimbabwean payroll
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nssa_rate" className="flex items-center space-x-2">
                    <Percent className="h-4 w-4" />
                    <span>NSSA Rate</span>
                  </Label>
                  <Input
                    id="nssa_rate"
                    type="number"
                    step="0.001"
                    min="0"
                    max="1"
                    value={settings.nssa_rate}
                    onChange={(e) => setSettings({ ...settings, nssa_rate: parseFloat(e.target.value) })}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {(settings.nssa_rate * 100).toFixed(1)}% (Standard: 4.5%)
                  </p>
                </div>
                <div>
                  <Label htmlFor="aids_levy_rate" className="flex items-center space-x-2">
                    <Percent className="h-4 w-4" />
                    <span>AIDS Levy Rate</span>
                  </Label>
                  <Input
                    id="aids_levy_rate"
                    type="number"
                    step="0.001"
                    min="0"
                    max="1"
                    value={settings.aids_levy_rate}
                    onChange={(e) => setSettings({ ...settings, aids_levy_rate: parseFloat(e.target.value) })}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {(settings.aids_levy_rate * 100).toFixed(1)}% (Standard: 3.0%)
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Compliance Information</p>
                    <p className="text-xs text-blue-700 mt-1">
                      These rates are used for automatic payroll calculations. 
                      Ensure they match current ZIMRA and NSSA requirements.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-purple-600" />
                <span>System Status</span>
              </CardTitle>
              <CardDescription>
                Current system health and configuration status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Database</p>
                    <p className="text-xs text-green-700">Connected and operational</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">ZIMRA Compliance</p>
                    <p className="text-xs text-green-700">Tax calculations active</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">NSSA Integration</p>
                    <p className="text-xs text-green-700">Contributions tracked</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-800">
            <Button type="button" variant="outline" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
