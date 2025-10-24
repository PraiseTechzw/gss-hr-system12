// Supabase client removed

export interface SystemActivityLog {
  user_email: string
  action_type: string
  description: string
  metadata?: Record<string, any>
}

export async function logSystemActivity(activity: SystemActivityLog) {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('system_activity')
      .insert([{
        user_email: activity.user_email,
        action_type: activity.action_type,
        description: activity.description,
        metadata: activity.metadata || null
      }])

    if (error) {
      console.error('Error logging system activity:', error)
    }
  } catch (error) {
    console.error('Error logging system activity:', error)
  }
}

// Predefined activity types
export const ACTIVITY_TYPES = {
  USER_SIGNUP: 'user_signup',
  USER_APPROVED: 'user_approved',
  USER_REJECTED: 'user_rejected',
  USER_ROLE_CHANGED: 'user_role_changed',
  EMPLOYEE_ADDED: 'employee_added',
  EMPLOYEE_UPDATED: 'employee_updated',
  EMPLOYEE_DELETED: 'employee_deleted',
  DEPLOYMENT_CREATED: 'deployment_created',
  DEPLOYMENT_UPDATED: 'deployment_updated',
  DEPLOYMENT_DELETED: 'deployment_deleted',
  LEAVE_REQUESTED: 'leave_requested',
  LEAVE_APPROVED: 'leave_approved',
  LEAVE_REJECTED: 'leave_rejected',
  PAYROLL_PROCESSED: 'payroll_processed',
  SETTINGS_UPDATED: 'settings_updated',
  SYSTEM_MAINTENANCE: 'system_maintenance'
} as const

// Helper functions for common activities
export async function logUserSignup(userEmail: string, role: string) {
  await logSystemActivity({
    user_email: userEmail,
    action_type: ACTIVITY_TYPES.USER_SIGNUP,
    description: 'New user registered',
    metadata: { user_email: userEmail, role }
  })
}

export async function logUserApproval(userEmail: string, approvedBy: string) {
  await logSystemActivity({
    user_email: approvedBy,
    action_type: ACTIVITY_TYPES.USER_APPROVED,
    description: 'User account approved',
    metadata: { user_email: userEmail, approved_by: approvedBy }
  })
}

export async function logUserRejection(userEmail: string, rejectedBy: string) {
  await logSystemActivity({
    user_email: rejectedBy,
    action_type: ACTIVITY_TYPES.USER_REJECTED,
    description: 'User account rejected',
    metadata: { user_email: userEmail, rejected_by: rejectedBy }
  })
}

export async function logUserRoleChange(userEmail: string, oldRole: string, newRole: string, changedBy: string) {
  await logSystemActivity({
    user_email: changedBy,
    action_type: ACTIVITY_TYPES.USER_ROLE_CHANGED,
    description: 'User role changed',
    metadata: { user_email: userEmail, old_role: oldRole, new_role: newRole, changed_by: changedBy }
  })
}

export async function logEmployeeAdded(employeeId: string, employeeName: string, addedBy: string) {
  await logSystemActivity({
    user_email: addedBy,
    action_type: ACTIVITY_TYPES.EMPLOYEE_ADDED,
    description: 'New employee added',
    metadata: { employee_id: employeeId, employee_name: employeeName, added_by: addedBy }
  })
}

export async function logSettingsUpdate(updatedBy: string, settings: string[]) {
  await logSystemActivity({
    user_email: updatedBy,
    action_type: ACTIVITY_TYPES.SETTINGS_UPDATED,
    description: 'System settings updated',
    metadata: { updated_by: updatedBy, settings_updated: settings }
  })
}
