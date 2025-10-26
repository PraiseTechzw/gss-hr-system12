export interface LeaveRequest {
  id: string
  employee_id: string
  leave_type: 'annual' | 'sick' | 'casual' | 'maternity' | 'paternity' | 'emergency' | 'unpaid'
  start_date: string
  end_date: string
  total_days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approved_by?: string
  approved_at?: string
  created_at: string
  updated_at: string
  employees?: {
    id: string
    employee_id: string
    first_name: string
    last_name: string
    job_title: string
    department_id?: string
  }
}

export interface LeaveBalance {
  employee_id: string
  annual_leave: number
  sick_leave: number
  casual_leave: number
  maternity_leave: number
  paternity_leave: number
  used_annual: number
  used_sick: number
  used_casual: number
  used_maternity: number
  used_paternity: number
}

export interface LeavePolicy {
  id: string
  leave_type: string
  max_days_per_year: number
  max_consecutive_days: number
  requires_approval: boolean
  advance_notice_days: number
  carry_over_allowed: boolean
  max_carry_over_days: number
}

export class LeaveManagementService {
  static getLeaveTypes() {
    return [
      { value: 'annual', label: 'Annual Leave', color: 'blue', icon: '🏖️' },
      { value: 'sick', label: 'Sick Leave', color: 'red', icon: '🏥' },
      { value: 'casual', label: 'Casual Leave', color: 'green', icon: '😊' },
      { value: 'maternity', label: 'Maternity Leave', color: 'pink', icon: '👶' },
      { value: 'paternity', label: 'Paternity Leave', color: 'blue', icon: '👨‍👶' },
      { value: 'emergency', label: 'Emergency Leave', color: 'orange', icon: '🚨' },
      { value: 'unpaid', label: 'Unpaid Leave', color: 'gray', icon: '💰' }
    ]
  }

  static getLeaveStatuses() {
    return [
      { value: 'pending', label: 'Pending', color: 'yellow', icon: '⏳' },
      { value: 'approved', label: 'Approved', color: 'green', icon: '✅' },
      { value: 'rejected', label: 'Rejected', color: 'red', icon: '❌' },
      { value: 'cancelled', label: 'Cancelled', color: 'gray', icon: '🚫' }
    ]
  }

  static calculateLeaveDays(startDate: string, endDate: string): number {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  static validateLeaveRequest(request: Partial<LeaveRequest>): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!request.employee_id) {
      errors.push('Employee is required')
    }

    if (!request.leave_type) {
      errors.push('Leave type is required')
    }

    if (!request.start_date) {
      errors.push('Start date is required')
    }

    if (!request.end_date) {
      errors.push('End date is required')
    }

    if (request.start_date && request.end_date) {
      const start = new Date(request.start_date)
      const end = new Date(request.end_date)
      
      if (start > end) {
        errors.push('Start date cannot be after end date')
      }

      if (start < new Date()) {
        errors.push('Start date cannot be in the past')
      }
    }

    if (!request.reason || request.reason.trim().length < 10) {
      errors.push('Reason must be at least 10 characters long')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  static getRoleBasedLeavePermissions(role: string) {
    const permissions = {
      admin: {
        canViewAllLeaves: true,
        canApproveLeaves: true,
        canRejectLeaves: true,
        canCancelLeaves: true,
        canViewLeaveBalances: true,
        canManageLeavePolicies: true,
        canGenerateLeaveReports: true,
        canViewLeaveAnalytics: true
      },
      manager: {
        canViewAllLeaves: false,
        canApproveLeaves: true,
        canRejectLeaves: true,
        canCancelLeaves: false,
        canViewLeaveBalances: true,
        canManageLeavePolicies: false,
        canGenerateLeaveReports: true,
        canViewLeaveAnalytics: true
      },
      hr: {
        canViewAllLeaves: true,
        canApproveLeaves: true,
        canRejectLeaves: true,
        canCancelLeaves: true,
        canViewLeaveBalances: true,
        canManageLeavePolicies: true,
        canGenerateLeaveReports: true,
        canViewLeaveAnalytics: true
      }
    }

    return permissions[role as keyof typeof permissions] || permissions.hr
  }
}
