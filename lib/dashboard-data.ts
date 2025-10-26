import { createClient } from "@/lib/supabase/server"

export interface DashboardStats {
  employees: {
    total: number
    active: number
    inactive: number
    terminated: number
    recentHires: number
    activeRate: number
  }
  departments: {
    total: number
    breakdown: Record<string, number>
  }
  users: {
    total: number
    active: number
  }
  deployments: {
    total: number
    active: number
  }
  attendance: {
    presentDays: number
    absentDays: number
    lateDays: number
    totalDays: number
    attendanceRate: number
  }
  payroll: {
    totalPayroll: number
    monthlyGrowth: string
    recordCount: number
  }
  leaveRequests: {
    total: number
    pending: number
  }
}

export interface RecentActivity {
  id: string
  action_type: string
  description: string
  created_at: string
  user_id?: string
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()

  try {
    // Fetch all required data in parallel
    const [
      employeesResult,
      departmentsResult,
      userProfilesResult,
      attendanceResult,
      payrollResult,
      deploymentsResult,
      leaveRequestsResult
    ] = await Promise.all([
      supabase.from('employees').select('*', { count: 'exact' }),
      supabase.from('departments').select('*', { count: 'exact' }),
      supabase.from('user_profiles').select('*', { count: 'exact' }),
      supabase.from('attendance')
        .select('*')
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
      supabase.from('payroll')
        .select('*')
        .gte('pay_period_start', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
      supabase.from('deployments').select('*', { count: 'exact' }),
      supabase.from('leave_requests').select('*', { count: 'exact' })
    ])

    // Calculate employee statistics
    const totalEmployees = employeesResult.count || 0
    const activeEmployees = employeesResult.data?.filter(emp => emp.status === 'active').length || 0
    const inactiveEmployees = employeesResult.data?.filter(emp => emp.status === 'inactive').length || 0
    const terminatedEmployees = employeesResult.data?.filter(emp => emp.status === 'terminated').length || 0

    // Calculate recent hires (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentHires = employeesResult.data?.filter(emp => 
      new Date(emp.hire_date || emp.created_at) >= thirtyDaysAgo
    ).length || 0

    // Department breakdown
    const departmentStats = employeesResult.data?.reduce((acc, emp) => {
      const deptName = emp.department_id ? 
        departmentsResult.data?.find(d => d.id === emp.department_id)?.name || 'Unassigned' 
        : 'Unassigned'
      acc[deptName] = (acc[deptName] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // User statistics
    const totalUsers = userProfilesResult.count || 0
    const activeUsers = userProfilesResult.data?.filter(user => user.status === 'active').length || 0

    // Deployment statistics
    const totalDeployments = deploymentsResult.count || 0
    const activeDeployments = deploymentsResult.data?.filter(dep => dep.status === 'active').length || 0

    // Leave request statistics
    const totalLeaveRequests = leaveRequestsResult.count || 0
    const pendingLeaveRequests = leaveRequestsResult.data?.filter(leave => leave.status === 'pending').length || 0

    // Attendance statistics
    const attendanceData = attendanceResult.data || []
    const presentDays = attendanceData.filter(att => att.status === 'present').length
    const absentDays = attendanceData.filter(att => att.status === 'absent').length
    const lateDays = attendanceData.filter(att => att.status === 'late').length
    const totalAttendanceDays = attendanceData.length
    const attendanceRate = totalAttendanceDays > 0 ? Math.round((presentDays / totalAttendanceDays) * 100) : 0

    // Payroll statistics
    const payrollData = payrollResult.data || []
    const totalPayroll = payrollData.reduce((sum, record) => sum + (record.net_salary || 0), 0)
    
    // Calculate monthly growth
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const { data: previousPayrollData } = await supabase
      .from('payroll')
      .select('net_salary')
      .gte('pay_period_start', new Date(previousYear, previousMonth, 1).toISOString().split('T')[0])
      .lt('pay_period_start', new Date(currentYear, currentMonth, 1).toISOString().split('T')[0])

    const previousPayroll = previousPayrollData?.reduce((sum, record) => sum + (record.net_salary || 0), 0) || 0
    const monthlyGrowth = previousPayroll > 0 ? ((totalPayroll - previousPayroll) / previousPayroll * 100).toFixed(1) : '0'

    return {
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        inactive: inactiveEmployees,
        terminated: terminatedEmployees,
        recentHires: recentHires,
        activeRate: totalEmployees > 0 ? Math.round((activeEmployees / totalEmployees) * 100) : 0
      },
      departments: {
        total: departmentsResult.count || 0,
        breakdown: departmentStats
      },
      users: {
        total: totalUsers,
        active: activeUsers
      },
      deployments: {
        total: totalDeployments,
        active: activeDeployments
      },
      attendance: {
        presentDays,
        absentDays,
        lateDays,
        totalDays: totalAttendanceDays,
        attendanceRate
      },
      payroll: {
        totalPayroll,
        monthlyGrowth: `${monthlyGrowth}%`,
        recordCount: payrollData.length
      },
      leaveRequests: {
        total: totalLeaveRequests,
        pending: pendingLeaveRequests
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw error
  }
}

export async function getRecentActivity(): Promise<RecentActivity[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('system_activity')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching recent activity:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return []
  }
}

export async function getDashboardData() {
  try {
    const [stats, recentActivity] = await Promise.all([
      getDashboardStats(),
      getRecentActivity()
    ])

    return {
      stats,
      recentActivity,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    throw error
  }
}
