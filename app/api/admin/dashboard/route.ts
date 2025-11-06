import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AuthService } from '@/lib/auth-service'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authToken = request.cookies.get('auth-token')?.value
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authResult = AuthService.verifyToken(authToken)
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = authResult.user.role?.toLowerCase() || ''
    const isAdmin = userRole === 'admin' || userRole === 'super_admin'
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Use service role client to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL_SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    console.log('[Dashboard API] Starting data fetch...')
    console.log('[Dashboard API] Supabase URL:', supabaseUrl ? 'Set' : 'Missing')
    console.log('[Dashboard API] Service Role Key:', serviceRoleKey ? 'Set' : 'Missing')

    // Fetch statistics in parallel
    const [
      usersResult,
      employeesResult,
      deploymentsResult,
      leavesResult,
      payrollResult,
      recentUsersResult,
      departmentsResult,
      userRoleDistributionResult
    ] = await Promise.all([
      // Total users
      supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true }),
      
      // Active employees
      supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
      
      // Active deployments
      supabase
        .from('deployments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
      
      // Pending leave requests
      supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      
      // Payroll data
      supabase
        .from('payroll')
        .select('net_salary'),
      
      // Recent users
      supabase
        .from('user_profiles')
        .select('id, email, first_name, last_name, full_name, role, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      
      // Total departments
      supabase
        .from('departments')
        .select('*', { count: 'exact', head: true }),
      
      // User role distribution
      supabase
        .from('user_profiles')
        .select('role')
    ])

    console.log('[Dashboard API] Parallel queries completed')
    console.log('[Dashboard API] Users count:', usersResult.count)
    console.log('[Dashboard API] Employees count:', employeesResult.count)
    console.log('[Dashboard API] Departments count:', departmentsResult.count)
    console.log('[Dashboard API] Deployments count:', deploymentsResult.count)
    console.log('[Dashboard API] Leaves count:', leavesResult.count)
    console.log('[Dashboard API] Recent users:', recentUsersResult.data?.length || 0)
    console.log('[Dashboard API] User role distribution data:', userRoleDistributionResult.data?.length || 0)

    // Fetch recent activity separately to avoid join issues
    const { data: activityData } = await supabase
      .from('system_activity')
      .select('id, action, description, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(10)

    // Fetch user info for activities
    const userIds = activityData?.filter(a => a.user_id).map(a => a.user_id) || []
    let usersMap: Record<string, any> = {}
    
    if (userIds.length > 0) {
      const { data: usersData } = await supabase
        .from('user_profiles')
        .select('id, email, full_name')
        .in('id', userIds)
      
      usersData?.forEach(user => {
        usersMap[user.id] = user
      })
    }

    const formattedActivity = activityData?.map((activity: any) => ({
      id: activity.id,
      type: activity.action || 'system',
      description: activity.description || 'System activity',
      timestamp: activity.created_at,
      user: activity.user_id 
        ? (usersMap[activity.user_id]?.email || usersMap[activity.user_id]?.full_name || 'System')
        : 'System'
    })) || []

    // Calculate total payroll
    const totalPayroll = payrollResult.data?.reduce(
      (sum: number, record: any) => sum + (parseFloat(record.net_salary) || 0),
      0
    ) || 0

    // Calculate user role distribution
    const roleDistribution: Record<string, number> = {}
    userRoleDistributionResult.data?.forEach((user: any) => {
      const role = user.role || 'unknown'
      roleDistribution[role] = (roleDistribution[role] || 0) + 1
    })

    console.log('[Dashboard API] Role distribution calculated:', roleDistribution)
    console.log('[Dashboard API] Total payroll:', totalPayroll)
    console.log('[Dashboard API] Activity items:', formattedActivity.length)

    const responseData = {
      success: true,
      data: {
        stats: {
          totalUsers: usersResult.count || 0,
          totalDepartments: departmentsResult.count || 0,
          totalEmployees: employeesResult.count || 0,
          activeDeployments: deploymentsResult.count || 0,
          pendingLeaves: leavesResult.count || 0,
          totalPayroll: totalPayroll
        },
        userDistribution: roleDistribution,
        recentUsers: recentUsersResult.data || [],
        recentActivity: formattedActivity
      }
    }

    console.log('[Dashboard API] Final response data:', JSON.stringify(responseData, null, 2))

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Dashboard fetch error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

