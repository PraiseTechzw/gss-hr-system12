import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'overview'
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    
    let reportData: any = {}
    
    switch (reportType) {
      case 'overview':
        // Get comprehensive overview data
        const [
          { count: totalEmployees },
          { count: activeEmployees },
          { count: totalDepartments },
          { count: totalDeployments },
          { count: activeDeployments },
          { count: totalAttendance },
          { count: totalPayroll },
          { count: pendingLeaves }
        ] = await Promise.all([
          supabase.from('employees').select('*', { count: 'exact', head: true }),
          supabase.from('employees').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('departments').select('*', { count: 'exact', head: true }),
          supabase.from('deployments').select('*', { count: 'exact', head: true }),
          supabase.from('deployments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('attendance').select('*', { count: 'exact', head: true }),
          supabase.from('payroll').select('*', { count: 'exact', head: true }),
          supabase.from('leave_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
        ])
        
        reportData = {
          employees: {
            total: totalEmployees || 0,
            active: activeEmployees || 0,
            inactive: (totalEmployees || 0) - (activeEmployees || 0)
          },
          departments: {
            total: totalDepartments || 0
          },
          deployments: {
            total: totalDeployments || 0,
            active: activeDeployments || 0
          },
          attendance: {
            totalRecords: totalAttendance || 0
          },
          payroll: {
            totalRecords: totalPayroll || 0
          },
          leaves: {
            pending: pendingLeaves || 0
          }
        }
        break
        
      case 'payroll':
        // Get payroll report data
        let payrollQuery = supabase
          .from('payroll')
          .select(`
            *,
            employees (
              id,
              employee_id,
              first_name,
              last_name,
              job_title
            )
          `)
          .order('pay_period_start', { ascending: false })
        
        if (startDate) {
          payrollQuery = payrollQuery.gte('pay_period_start', startDate)
        }
        if (endDate) {
          payrollQuery = payrollQuery.lte('pay_period_start', endDate)
        }
        
        const { data: payrollData, error: payrollError } = await payrollQuery
        
        if (payrollError) {
          throw payrollError
        }
        
        const totalGross = payrollData?.reduce((sum, record) => sum + (record.gross_salary || 0), 0) || 0
        const totalNet = payrollData?.reduce((sum, record) => sum + (record.net_salary || 0), 0) || 0
        const totalTax = payrollData?.reduce((sum, record) => sum + (record.total_tax || 0), 0) || 0
        
        reportData = {
          records: payrollData || [],
          summary: {
            totalGross,
            totalNet,
            totalTax,
            recordCount: payrollData?.length || 0
          }
        }
        break
        
      case 'attendance':
        // Get attendance report data
        let attendanceQuery = supabase
          .from('attendance')
          .select(`
            *,
            employees (
              id,
              employee_id,
              first_name,
              last_name,
              job_title
            )
          `)
          .order('date', { ascending: false })
        
        if (startDate) {
          attendanceQuery = attendanceQuery.gte('date', startDate)
        }
        if (endDate) {
          attendanceQuery = attendanceQuery.lte('date', endDate)
        }
        
        const { data: attendanceData, error: attendanceError } = await attendanceQuery
        
        if (attendanceError) {
          throw attendanceError
        }
        
        const presentDays = attendanceData?.filter(att => att.status === 'present').length || 0
        const absentDays = attendanceData?.filter(att => att.status === 'absent').length || 0
        const lateDays = attendanceData?.filter(att => att.status === 'late').length || 0
        const totalDays = attendanceData?.length || 0
        const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0
        
        reportData = {
          records: attendanceData || [],
          summary: {
            totalDays,
            presentDays,
            absentDays,
            lateDays,
            attendanceRate
          }
        }
        break
        
      case 'employees':
        // Get employee report data
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select(`
            *,
            departments (
              id,
              name
            )
          `)
          .order('created_at', { ascending: false })
        
        if (employeeError) {
          throw employeeError
        }
        
        const activeCount = employeeData?.filter(emp => emp.status === 'active').length || 0
        const inactiveCount = employeeData?.filter(emp => emp.status === 'inactive').length || 0
        
        reportData = {
          records: employeeData || [],
          summary: {
            total: employeeData?.length || 0,
            active: activeCount,
            inactive: inactiveCount
          }
        }
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        )
    }
    
    return NextResponse.json({
      success: true,
      data: reportData,
      reportType,
      generatedAt: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
