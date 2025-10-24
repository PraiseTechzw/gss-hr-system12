import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test dashboard stats function
    const { getDashboardStats, getPayrollStats, getAttendanceStats } = await import("@/lib/database-utils")
    
    const [dashboardStats, payrollStats, attendanceStats] = await Promise.all([
      getDashboardStats(),
      getPayrollStats(),
      getAttendanceStats()
    ])
    
    // Test individual table queries
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('*')
      .limit(10)
    
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('*')
      .limit(10)
    
    const { data: userProfiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(10)
    
    const { data: attendance, error: attError } = await supabase
      .from('attendance')
      .select('*')
      .limit(10)
    
    const { data: payroll, error: payError } = await supabase
      .from('payroll')
      .select('*')
      .limit(10)
    
    const { data: deployments, error: depError } = await supabase
      .from('deployments')
      .select('*')
      .limit(10)
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      dashboardStats,
      payrollStats,
      attendanceStats,
      rawQueries: {
        employees: {
          count: employees?.length || 0,
          data: employees,
          error: empError?.message || null
        },
        departments: {
          count: departments?.length || 0,
          data: departments,
          error: deptError?.message || null
        },
        userProfiles: {
          count: userProfiles?.length || 0,
          data: userProfiles,
          error: profileError?.message || null
        },
        attendance: {
          count: attendance?.length || 0,
          data: attendance,
          error: attError?.message || null
        },
        payroll: {
          count: payroll?.length || 0,
          data: payroll,
          error: payError?.message || null
        },
        deployments: {
          count: deployments?.length || 0,
          data: deployments,
          error: depError?.message || null
        }
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
