import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export async function AttendanceChart() {
  const supabase = await createClient()
  
  // Fetch real attendance data for the last 30 days
  const { data: attendanceData, error } = await supabase
    .from('attendance')
    .select('*')
    .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching attendance data:', error)
  }

  const attendance = attendanceData || []
  const presentDays = attendance.filter(att => att.status === 'present').length
  const absentDays = attendance.filter(att => att.status === 'absent').length
  const lateDays = attendance.filter(att => att.status === 'late').length
  const totalDays = attendance.length
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

  const attendanceStats = {
    presentDays,
    absentDays,
    lateDays,
    attendanceRate
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Attendance (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="text-sm text-gray-600">Present</div>
            <div className="text-2xl font-semibold text-gray-900">{attendanceStats.presentDays}</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="text-sm text-gray-600">Absent</div>
            <div className="text-2xl font-semibold text-gray-900">{attendanceStats.absentDays}</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="text-sm text-gray-600">Late</div>
            <div className="text-2xl font-semibold text-gray-900">{attendanceStats.lateDays}</div>
          </div>
        </div>
        <div className="mt-6 text-sm text-gray-600">
          Attendance Rate: <span className="font-medium">{attendanceStats.attendanceRate}%</span>
        </div>
      </CardContent>
    </Card>
  )
}

export async function PayrollChart() {
  const supabase = await createClient()
  
  // Fetch real payroll data for the current month
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const { data: currentPayrollData, error: currentError } = await supabase
    .from('payroll')
    .select('*')
    .gte('pay_period_start', new Date(currentYear, currentMonth, 1).toISOString().split('T')[0])
    .lt('pay_period_start', new Date(currentYear, currentMonth + 1, 1).toISOString().split('T')[0])

  // Fetch previous month data for comparison
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear
  
  const { data: previousPayrollData, error: previousError } = await supabase
    .from('payroll')
    .select('*')
    .gte('pay_period_start', new Date(previousYear, previousMonth, 1).toISOString().split('T')[0])
    .lt('pay_period_start', new Date(previousYear, previousMonth + 1, 1).toISOString().split('T')[0])

  if (currentError || previousError) {
    console.error('Error fetching payroll data:', currentError || previousError)
  }

  const currentPayroll = currentPayrollData || []
  const previousPayroll = previousPayrollData || []
  
  const totalCurrentPayroll = currentPayroll.reduce((sum, record) => sum + (record.net_salary || 0), 0)
  const totalPreviousPayroll = previousPayroll.reduce((sum, record) => sum + (record.net_salary || 0), 0)
  
  const monthlyGrowth = totalPreviousPayroll > 0 ? 
    ((totalCurrentPayroll - totalPreviousPayroll) / totalPreviousPayroll * 100).toFixed(1) : '0'

  const averageSalary = currentPayroll.length > 0 ? totalCurrentPayroll / currentPayroll.length : 0

  const payrollStats = {
    totalPayroll: totalCurrentPayroll,
    averageSalary: averageSalary,
    monthlyGrowth: parseFloat(monthlyGrowth)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Payroll Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="text-sm text-gray-600">Total Payroll</div>
            <div className="text-2xl font-semibold text-gray-900">USD ${Math.round(payrollStats.totalPayroll).toLocaleString()}</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="text-sm text-gray-600">Average Salary</div>
            <div className="text-2xl font-semibold text-gray-900">USD ${Math.round(payrollStats.averageSalary).toLocaleString()}</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="text-sm text-gray-600">Monthly Growth</div>
            <div className="text-2xl font-semibold text-gray-900">{payrollStats.monthlyGrowth}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
