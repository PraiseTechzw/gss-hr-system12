"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SystemSettings {
  email_notifications: boolean
  sms_alerts: boolean
  dark_mode: boolean
  auto_backup: boolean
  two_factor_auth: boolean
  data_encryption: boolean
  system_maintenance: boolean
  api_access: boolean
  audit_logging: boolean
  password_expiry: boolean
  company_name: string
  company_email: string
  company_phone: string
  company_address: string
  working_hours: number
  overtime_rate: number
  leave_balance_annual: number
  payroll_frequency: string
  system_version: string
  max_login_attempts: number
  session_timeout: number
  password_min_length: number
  require_password_change: boolean
  maintenance_mode: boolean
  backup_frequency: string
  backup_retention_days: number
}

interface SettingsContextType {
  settings: SystemSettings | null
  loading: boolean
  updateSetting: (key: keyof SystemSettings, value: any) => Promise<void>
  refreshSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('system_settings_new')
        .select('*')
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Error loading settings:', error)
        return
      }

      if (data) {
        setSettings(data)
        
        // Apply dark mode immediately
        if (data.dark_mode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: keyof SystemSettings, value: any) => {
    if (!settings) return

    try {
      const { error } = await supabase
        .from('system_settings_new')
        .update({ 
          [key]: value, 
          updated_at: new Date().toISOString() 
        })
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (error) {
        console.error('Error updating setting:', error)
        throw error
      }

      // Update local state
      setSettings(prev => prev ? { ...prev, [key]: value } : null)

      // Apply dark mode immediately if it's the dark mode setting
      if (key === 'dark_mode') {
        if (value) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }

      // Log the setting change
      await supabase.from('system_activity').insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action: 'settings_update',
        description: `${key} setting changed to ${value}`,
        details: {
          setting: key,
          new_value: value,
          timestamp: new Date().toISOString()
        }
      })

    } catch (err) {
      console.error('Failed to update setting:', err)
      throw err
    }
  }

  const refreshSettings = async () => {
    await loadSettings()
  }

  useEffect(() => {
    loadSettings()
  }, [])

  return (
    <SettingsContext.Provider value={{
      settings,
      loading,
      updateSetting,
      refreshSettings
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
