import { createClient } from "@/lib/supabase/server"

// Database utility functions for common queries and calculations

export async function getDashboardStats() {
  const supabase = await createClient()
  
  try {
    // Get comprehensive dashboard statistics from new schema
    const [
      { count: totalEmployees },
      { count: activeEmployees },
      { count: totalDeployments },
      { count: activeDeployments },
      { count: pendingLeaves },
      { data: recentPayroll },
      { data: recentAttendance },
      { data: departmentData }
    ] = await Promise.all([
      supabase.from("employees").select("*", { count: "exact", head: true }),
      supabase.from("employees").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("deployments").select("*", { count: "exact", head: true }),
      supabase.from("deployments").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("leave_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("payroll").select("net_salary").order("created_at", { ascending: false }).limit(1),
      supabase.from("attendance").select("*").eq("date", new Date().toISOString().split('T')[0]),
      supabase.from("employees").select("department_id, departments(name)").eq("status", "active")
    ])

    // Calculate additional metrics
    const totalPayroll = recentPayroll?.[0]?.net_salary || 0
    const attendanceToday = recentAttendance?.filter(a => a.status === 'present').length || 0
    const attendanceRate = recentAttendance?.length ? Math.round((attendanceToday / recentAttendance.length) * 100) : 0
    
    // Department distribution
    const departmentStats = departmentData?.reduce((acc: Record<string, number>, emp: any) => {
      const deptName = emp.departments?.name || 'Unknown'
      acc[deptName] = (acc[deptName] || 0) + 1
      return acc
    }, {}) || {}

    return {
      totalEmployees: totalEmployees || 0,
      activeEmployees: activeEmployees || 0,
      totalDeployments: totalDeployments || 0,
      activeDeployments: activeDeployments || 0,
      pendingLeaves: pendingLeaves || 0,
      totalPayroll,
      attendanceRate,
      departmentStats
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      totalEmployees: 0,
      activeEmployees: 0,
      totalDeployments: 0,
      activeDeployments: 0,
      pendingLeaves: 0,
      totalPayroll: 0,
      attendanceRate: 0,
      departmentStats: {}
    }
  }
}

export async function getPayrollStats() {
  const supabase = await createClient()
  
  try {
    const { data: payrollData } = await supabase
      .from("payroll")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (!payrollData) return { totalPayroll: 0, averageSalary: 0, monthlyGrowth: 0 }

    const totalPayroll = payrollData.reduce((sum, record) => sum + (record.net_salary || 0), 0)
    const averageSalary = payrollData.length > 0 ? totalPayroll / payrollData.length : 0
    
    // Calculate monthly growth (compare last 2 months)
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear

    const currentMonthPayroll = payrollData
      .filter(p => p.month === currentMonth && p.year === currentYear)
      .reduce((sum, record) => sum + (record.net_salary || 0), 0)
    
    const lastMonthPayroll = payrollData
      .filter(p => p.month === lastMonth && p.year === lastMonthYear)
      .reduce((sum, record) => sum + (record.net_salary || 0), 0)

    const monthlyGrowth = lastMonthPayroll > 0 
      ? Math.round(((currentMonthPayroll - lastMonthPayroll) / lastMonthPayroll) * 100)
      : 0

    return {
      totalPayroll,
      averageSalary,
      monthlyGrowth
    }
  } catch (error) {
    console.error("Error fetching payroll stats:", error)
    return { totalPayroll: 0, averageSalary: 0, monthlyGrowth: 0 }
  }
}

export async function getAttendanceStats() {
  const supabase = await createClient()
  
  try {
    // Get attendance for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: attendanceData } = await supabase
      .from("attendance")
      .select("*")
      .gte("date", thirtyDaysAgo.toISOString().split('T')[0])
      .order("date", { ascending: false })

    if (!attendanceData) return { attendanceRate: 0, presentDays: 0, absentDays: 0, lateDays: 0 }

    const presentDays = attendanceData.filter(a => a.status === 'present').length
    const absentDays = attendanceData.filter(a => a.status === 'absent').length
    const lateDays = attendanceData.filter(a => a.status === 'late').length
    const attendanceRate = attendanceData.length > 0 ? Math.round((presentDays / attendanceData.length) * 100) : 0

    return {
      attendanceRate,
      presentDays,
      absentDays,
      lateDays
    }
  } catch (error) {
    console.error("Error fetching attendance stats:", error)
    return { attendanceRate: 0, presentDays: 0, absentDays: 0, lateDays: 0 }
  }
}

export async function getDeploymentStats() {
  const supabase = await createClient()
  
  try {
    const [
      { data: deployments },
      { count: activeCount },
      { count: completedCount },
      { count: cancelledCount },
      { count: pendingCount }
    ] = await Promise.all([
      supabase.from("deployments").select("*"),
      supabase.from("deployments").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("deployments").select("*", { count: "exact", head: true }).eq("status", "completed"),
      supabase.from("deployments").select("*", { count: "exact", head: true }).eq("status", "cancelled"),
      supabase.from("deployments").select("*", { count: "exact", head: true }).eq("status", "pending")
    ])

    const totalDeployments = (activeCount || 0) + (completedCount || 0) + (cancelledCount || 0) + (pendingCount || 0)
    const completionRate = totalDeployments > 0 ? Math.round(((completedCount || 0) / totalDeployments) * 100) : 0
    
    // Get unique sites
    const uniqueSites = [...new Set(deployments?.map(d => d.site_location))].length

    return {
      totalDeployments,
      activeCount: activeCount || 0,
      completedCount: completedCount || 0,
      cancelledCount: cancelledCount || 0,
      pendingCount: pendingCount || 0,
      completionRate,
      uniqueSites
    }
  } catch (error) {
    console.error("Error fetching deployment stats:", error)
    return {
      totalDeployments: 0,
      activeCount: 0,
      completedCount: 0,
      cancelledCount: 0,
      pendingCount: 0,
      completionRate: 0,
      uniqueSites: 0
    }
  }
}

type ActivityItem = {
  type: string
  title: string
  description: string
  timestamp: string
  icon: string
}

export async function getRecentActivity() {
  const supabase = await createClient()
  
  try {
    const [
      { data: recentEmployees },
      { data: recentDeployments },
      { data: recentPayroll },
      { data: recentLeaves }
    ] = await Promise.all([
      supabase.from("employees").select("first_name, last_name, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("deployments").select("client_name, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("payroll").select("*, employees(first_name, last_name)").order("created_at", { ascending: false }).limit(5),
      supabase.from("leave_requests").select("*, employees(first_name, last_name)").order("created_at", { ascending: false }).limit(5)
    ])

    const activities: ActivityItem[] = []

    // Add recent employees
    recentEmployees?.forEach(emp => {
      activities.push({
        type: 'employee',
        title: 'New Employee Added',
        description: `${emp.first_name} ${emp.last_name} joined the team`,
        timestamp: emp.created_at,
        icon: 'Users'
      })
    })

    // Add recent deployments
    recentDeployments?.forEach(dep => {
      activities.push({
        type: 'deployment',
        title: 'New Deployment Created',
        description: `Assignment to ${dep.client_name}`,
        timestamp: dep.created_at,
        icon: 'MapPin'
      })
    })

    // Add recent payroll
    recentPayroll?.forEach(pay => {
      activities.push({
        type: 'payroll',
        title: 'Payroll Processed',
        description: `${pay.employees?.first_name} ${pay.employees?.last_name} - USD $${pay.net_salary}`,
        timestamp: pay.created_at,
        icon: 'DollarSign'
      })
    })

    // Add recent leaves
    recentLeaves?.forEach(leave => {
      activities.push({
        type: 'leave',
        title: 'Leave Request',
        description: `${leave.employees?.first_name} ${leave.employees?.last_name} - ${leave.leave_type}`,
        timestamp: leave.created_at,
        icon: 'Calendar'
      })
    })

    // Sort by timestamp and return top 10
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return []
  }
}

export async function getSystemSettings() {
  const supabase = await createClient()
  
  try {
    // Get system info from new schema
    const [
      { count: totalUsers },
      { count: totalEmployees },
      { data: systemActivity }
    ] = await Promise.all([
      supabase.from("user_profiles").select("*", { count: "exact", head: true }),
      supabase.from("employees").select("*", { count: "exact", head: true }),
      supabase.from("system_activity").select("created_at, activity_type").order("created_at", { ascending: false }).limit(1)
    ])

    const lastBackupCreatedAt = Array.isArray(systemActivity) && systemActivity.length > 0
      ? systemActivity[0]?.created_at
      : new Date().toISOString()

    return {
      companyName: "GSS",
      timezone: "Africa/Harare",
      currency: "USD",
      language: "English",
      dateFormat: "DD/MM/YYYY",
      workingHours: "08:00 - 17:00",
      weekStart: "Monday",
      fiscalYearStart: "January",
      lastBackup: lastBackupCreatedAt,
      systemVersion: "2.1.4",
      databaseSize: "2.3 GB", // This would come from system monitoring
      activeUsers: totalUsers || 0,
      totalEmployees: totalEmployees || 0
    }
  } catch (error) {
    console.error("Error fetching system settings:", error)
    return {
      companyName: "GSS",
      timezone: "Africa/Harare",
      currency: "USD",
      language: "English",
      dateFormat: "DD/MM/YYYY",
      workingHours: "08:00 - 17:00",
      weekStart: "Monday",
      fiscalYearStart: "January",
      lastBackup: new Date().toISOString(),
      systemVersion: "2.1.4",
      databaseSize: "2.3 GB",
      activeUsers: 0,
      totalEmployees: 0
    }
  }
}

export function formatCurrency(amount: number, currency: 'USD' | 'ZWL' = 'USD'): string {
  return `${currency} $${amount.toLocaleString()}`
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-GB') // DD/MM/YYYY format
}

export function getTimeAgo(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays < 7) return `${diffDays} days ago`
  
  return formatDate(date)
}
