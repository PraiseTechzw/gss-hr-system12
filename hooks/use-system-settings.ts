"use client"

import { useSettings } from '@/lib/settings-context'

// Custom hook for system-wide settings access
export function useSystemSettings() {
  const { settings, loading, updateSetting, refreshSettings } = useSettings()

  // Helper functions for common settings checks
  const isDarkMode = settings?.dark_mode || false
  const isMaintenanceMode = settings?.maintenance_mode || false
  const isEmailNotificationsEnabled = settings?.email_notifications || false
  const isSmsAlertsEnabled = settings?.sms_alerts || false
  const isTwoFactorAuthEnabled = settings?.two_factor_auth || false
  const isDataEncryptionEnabled = settings?.data_encryption || false
  const isAuditLoggingEnabled = settings?.audit_logging || false
  const isApiAccessEnabled = settings?.api_access || false
  const isAutoBackupEnabled = settings?.auto_backup || false
  const isPasswordExpiryEnabled = settings?.password_expiry || false

  // Company information
  const companyName = settings?.company_name || 'GSS HR System'
  const companyEmail = settings?.company_email || 'hr@gss.com'
  const companyPhone = settings?.company_phone || '+263 4 123 456'
  const companyAddress = settings?.company_address || '123 Business Street, Harare, Zimbabwe'

  // System configuration
  const workingHours = settings?.working_hours || 8
  const overtimeRate = settings?.overtime_rate || 1.5
  const leaveBalanceAnnual = settings?.leave_balance_annual || 21
  const payrollFrequency = settings?.payroll_frequency || 'monthly'
  const systemVersion = settings?.system_version || '2.0'
  const maxLoginAttempts = settings?.max_login_attempts || 5
  const sessionTimeout = settings?.session_timeout || 480
  const passwordMinLength = settings?.password_min_length || 6
  const requirePasswordChange = settings?.require_password_change || true
  const backupFrequency = settings?.backup_frequency || 'daily'
  const backupRetentionDays = settings?.backup_retention_days || 30

  // Email/SMS configuration
  const emailSmtpHost = settings?.email_smtp_host || ''
  const emailSmtpPort = settings?.email_smtp_port || 587
  const emailSmtpUsername = settings?.email_smtp_username || ''
  const emailSmtpPassword = settings?.email_smtp_password || ''
  const smsProvider = settings?.sms_provider || ''
  const smsApiKey = settings?.sms_api_key || ''

  // Quick update functions
  const toggleDarkMode = () => updateSetting('dark_mode', !isDarkMode)
  const toggleMaintenanceMode = () => updateSetting('maintenance_mode', !isMaintenanceMode)
  const toggleEmailNotifications = () => updateSetting('email_notifications', !isEmailNotificationsEnabled)
  const toggleSmsAlerts = () => updateSetting('sms_alerts', !isSmsAlertsEnabled)
  const toggleTwoFactorAuth = () => updateSetting('two_factor_auth', !isTwoFactorAuthEnabled)
  const toggleDataEncryption = () => updateSetting('data_encryption', !isDataEncryptionEnabled)
  const toggleAuditLogging = () => updateSetting('audit_logging', !isAuditLoggingEnabled)
  const toggleApiAccess = () => updateSetting('api_access', !isApiAccessEnabled)
  const toggleAutoBackup = () => updateSetting('auto_backup', !isAutoBackupEnabled)
  const togglePasswordExpiry = () => updateSetting('password_expiry', !isPasswordExpiryEnabled)

  // Update company information
  const updateCompanyInfo = (updates: {
    company_name?: string
    company_email?: string
    company_phone?: string
    company_address?: string
  }) => {
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateSetting(key as any, value)
      }
    })
  }

  // Update system configuration
  const updateSystemConfig = (updates: {
    working_hours?: number
    overtime_rate?: number
    leave_balance_annual?: number
    payroll_frequency?: string
    system_version?: string
    max_login_attempts?: number
    session_timeout?: number
    password_min_length?: number
    require_password_change?: boolean
    backup_frequency?: string
    backup_retention_days?: number
  }) => {
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateSetting(key as any, value)
      }
    })
  }

  // Update email/SMS configuration
  const updateEmailSmsConfig = (updates: {
    email_smtp_host?: string
    email_smtp_port?: number
    email_smtp_username?: string
    email_smtp_password?: string
    sms_provider?: string
    sms_api_key?: string
  }) => {
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateSetting(key as any, value)
      }
    })
  }

  return {
    // Raw settings
    settings,
    loading,
    updateSetting,
    refreshSettings,

    // Boolean flags
    isDarkMode,
    isMaintenanceMode,
    isEmailNotificationsEnabled,
    isSmsAlertsEnabled,
    isTwoFactorAuthEnabled,
    isDataEncryptionEnabled,
    isAuditLoggingEnabled,
    isApiAccessEnabled,
    isAutoBackupEnabled,
    isPasswordExpiryEnabled,

    // Company information
    companyName,
    companyEmail,
    companyPhone,
    companyAddress,

    // System configuration
    workingHours,
    overtimeRate,
    leaveBalanceAnnual,
    payrollFrequency,
    systemVersion,
    maxLoginAttempts,
    sessionTimeout,
    passwordMinLength,
    requirePasswordChange,
    backupFrequency,
    backupRetentionDays,

    // Email/SMS configuration
    emailSmtpHost,
    emailSmtpPort,
    emailSmtpUsername,
    emailSmtpPassword,
    smsProvider,
    smsApiKey,

    // Quick update functions
    toggleDarkMode,
    toggleMaintenanceMode,
    toggleEmailNotifications,
    toggleSmsAlerts,
    toggleTwoFactorAuth,
    toggleDataEncryption,
    toggleAuditLogging,
    toggleApiAccess,
    toggleAutoBackup,
    togglePasswordExpiry,

    // Bulk update functions
    updateCompanyInfo,
    updateSystemConfig,
    updateEmailSmsConfig,
  }
}
