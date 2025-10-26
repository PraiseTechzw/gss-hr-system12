import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authToken = request.cookies.get('auth-token')?.value
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authResult = AuthService.verifyToken(authToken)
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const supabase = await createClient()

    // Fetch comprehensive dashboard statistics
    const [
      employeesResult,
      departmentsResult,
      userProfilesResult,
      attendanceResult,
      payrollResult,
      deploymentsResult,
      leaveRequestsResult,
      activityResult
    ] = await Promise.all([
      // Employee statistics
      supabase.from('employees').select('*', { count: 'exact' }),
      supabase.from('departments').select('*', { count: 'exact' }),
      supabase.from('user_profiles').select('*', { count: 'exact' }),
      
      // Attendance data (last 30 days)
      supabase.from('attendance')
        .select('*')
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
      
      // Payroll data (current month)
      supabase.from('payroll')
        .select('*')
        .gte('pay_period_start', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
      
      // Deployment data
      supabase.from('deployments').select('*', { count: 'exact' }),
      
      // Leave requests
      supabase.from('leave_requests').select('*', { count: 'exact' }),
      
      // Recent activity
      supabase.from('system_activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
    ])

    // Calculate statistics
    const totalEmployees = employeesResult.count || 0
    const activeEmployees = employeesResult.data?.filter(emp => emp.status === 'active').length || 0
    const inactiveEmployees = employeesResult.data?.filter(emp => emp.status === 'inactive').length || 0
    const terminatedEmployees = employeesResult.data?.filter(emp => emp.status === 'terminated').length || 0

    const totalDepartments = departmentsResult.count || 0
    const totalUsers = userProfilesResult.count || 0
    const activeUsers = userProfilesResult.data?.filter(user => user.status === 'active').length || 0

    const totalDeployments = deploymentsResult.count || 0
    const activeDeployments = deploymentsResult.data?.filter(dep => dep.status === 'active').length || 0

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
    
    // Calculate monthly growth (compare with previous month)
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

    // Department breakdown
    const departmentStats = employeesResult.data?.reduce((acc, emp) => {
      const deptName = emp.department_id ? 
        departmentsResult.data?.find(d => d.id === emp.department_id)?.name || 'Unassigned' 
        : 'Unassigned'
      acc[deptName] = (acc[deptName] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Recent hires (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentHires = employeesResult.data?.filter(emp => 
      new Date(emp.hire_date || emp.created_at) >= thirtyDaysAgo
    ).length || 0

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        employees: {
          total: totalEmployees,
          active: activeEmployees,
          inactive: inactiveEmployees,
          terminated: terminatedEmployees,
          recentHires: recentHires,
          activeRate: totalEmployees > 0 ? Math.round((activeEmployees / totalEmployees) * 100) : 0
        },
        departments: {
          total: totalDepartments,
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
      },
      recentActivity: activityResult.data || []
    })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
