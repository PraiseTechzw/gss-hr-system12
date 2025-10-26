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
    const { searchParams } = new URL(request.url)
    
    // Get query parameters
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    const departmentId = searchParams.get('departmentId')

    // Build base query
    let query = supabase.from('payroll').select('*')
    
    // Apply filters
    if (year) {
      query = query.eq('year', parseInt(year))
    }
    if (month) {
      query = query.eq('month', parseInt(month))
    }

    const { data: payrollRecords, error } = await query

    if (error) {
      console.error('Error fetching payroll stats:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch payroll statistics',
        details: error.message 
      }, { status: 500 })
    }

    // Calculate comprehensive statistics
    const totalRecords = payrollRecords?.length || 0
    const totalGrossSalary = payrollRecords?.reduce((sum, record) => sum + (record.gross_salary || 0), 0) || 0
    const totalNetSalary = payrollRecords?.reduce((sum, record) => sum + (record.net_salary || 0), 0) || 0
    const totalDeductions = payrollRecords?.reduce((sum, record) => sum + (record.deductions || 0), 0) || 0
    const averageSalary = totalRecords > 0 ? totalNetSalary / totalRecords : 0

    // Status breakdown
    const statusBreakdown = {
      pending: payrollRecords?.filter(r => r.payment_status === 'pending').length || 0,
      processed: payrollRecords?.filter(r => r.payment_status === 'processed').length || 0,
      paid: payrollRecords?.filter(r => r.payment_status === 'paid').length || 0
    }

    // Monthly trends (last 12 months)
    const currentDate = new Date()
    const monthlyTrends = []
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      
      const monthRecords = payrollRecords?.filter(r => r.month === month && r.year === year) || []
      const monthTotal = monthRecords.reduce((sum, r) => sum + (r.net_salary || 0), 0)
      
      monthlyTrends.push({
        month,
        year,
        monthName: date.toLocaleString('default', { month: 'short' }),
        totalSalary: monthTotal,
        recordCount: monthRecords.length
      })
    }

    // Department breakdown (if department filter not applied)
    let departmentBreakdown = []
    if (!departmentId) {
      const { data: departmentData } = await supabase
        .from('payroll')
        .select(`
          net_salary,
          employees (
            department_id,
            departments (
              id,
              name
            )
          )
        `)

      const deptStats = departmentData?.reduce((acc, record) => {
        const deptName = record.employees?.departments?.name || 'Unassigned'
        if (!acc[deptName]) {
          acc[deptName] = { totalSalary: 0, recordCount: 0 }
        }
        acc[deptName].totalSalary += record.net_salary || 0
        acc[deptName].recordCount += 1
        return acc
      }, {} as Record<string, { totalSalary: number; recordCount: number }>) || {}

      departmentBreakdown = Object.entries(deptStats).map(([name, stats]) => ({
        department: name,
        totalSalary: stats.totalSalary,
        recordCount: stats.recordCount,
        averageSalary: stats.recordCount > 0 ? stats.totalSalary / stats.recordCount : 0
      })).sort((a, b) => b.totalSalary - a.totalSalary)
    }

    // Top earners
    const topEarners = payrollRecords
      ?.sort((a, b) => (b.net_salary || 0) - (a.net_salary || 0))
      .slice(0, 10)
      .map(record => ({
        employee_id: record.employee_id,
        net_salary: record.net_salary,
        month: record.month,
        year: record.year
      })) || []

    // Recent activity
    const { data: recentActivity } = await supabase
      .from('system_activity')
      .select('*')
      .or('action_type.eq.payroll_created,action_type.eq.payroll_updated,action_type.eq.payroll_processed')
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        overview: {
          totalRecords,
          totalGrossSalary,
          totalNetSalary,
          totalDeductions,
          averageSalary
        },
        statusBreakdown,
        monthlyTrends,
        departmentBreakdown,
        topEarners,
        recentActivity: recentActivity || []
      }
    })

  } catch (error) {
    console.error('Payroll stats error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
