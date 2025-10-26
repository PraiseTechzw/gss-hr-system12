import { createClient } from "@/lib/supabase/client"

export interface ActivityLog {
  action: string
  description: string
  user_id?: string
  details?: Record<string, any>
}

export class SystemActivityLogger {
  private static supabase = createClient()
  
  /**
   * Log a system activity
   */
  static async logActivity(activity: ActivityLog): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('system_activity')
        .insert({
          action: activity.action,
          description: activity.description,
          user_id: activity.user_id,
          details: activity.details,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Failed to log system activity:', error)
      }
    } catch (error) {
      console.error('Error logging system activity:', error)
    }
  }

  /**
   * Log employee-related activities
   */
  static async logEmployeeActivity(action: string, employeeName: string, userId?: string): Promise<void> {
    await this.logActivity({
      action: action,
      description: `${action}: ${employeeName}`,
      user_id: userId,
      details: { action, employee_name: employeeName }
    })
  }

  /**
   * Log payroll-related activities
   */
  static async logPayrollActivity(action: string, description: string, userId?: string): Promise<void> {
    await this.logActivity({
      action: action,
      description: `${action}: ${description}`,
      user_id: userId,
      details: { action, description }
    })
  }

  /**
   * Log deployment-related activities
   */
  static async logDeploymentActivity(action: string, deploymentName: string, userId?: string): Promise<void> {
    await this.logActivity({
      action: action,
      description: `${action}: ${deploymentName}`,
      user_id: userId,
      details: { action, deployment_name: deploymentName }
    })
  }

  /**
   * Log leave-related activities
   */
  static async logLeaveActivity(action: string, employeeName: string, userId?: string): Promise<void> {
    await this.logActivity({
      action: action,
      description: `${action}: ${employeeName}`,
      user_id: userId,
      details: { action, employee_name: employeeName }
    })
  }

  /**
   * Log attendance-related activities
   */
  static async logAttendanceActivity(action: string, description: string, userId?: string): Promise<void> {
    await this.logActivity({
      action: action,
      description: `${action}: ${description}`,
      user_id: userId,
      details: { action, description }
    })
  }

  /**
   * Log user authentication activities
   */
  static async logAuthActivity(action: string, userEmail: string, userId?: string): Promise<void> {
    await this.logActivity({
      action: action,
      description: `${action}: ${userEmail}`,
      user_id: userId,
      details: { action, user_email: userEmail }
    })
  }

  /**
   * Log system activities
   */
  static async logSystemActivity(action: string, description: string, userId?: string): Promise<void> {
    await this.logActivity({
      action: action,
      description: `${action}: ${description}`,
      user_id: userId,
      details: { action, description }
    })
  }
}
