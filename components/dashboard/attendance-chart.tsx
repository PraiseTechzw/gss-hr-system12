import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export async function AttendanceChart() {
  const supabase = await createClient()
  
  // For now, return mock data since we don't have attendance tables yet
  // This can be connected to real attendance data when the tables are created
  const attendanceStats = {
    presentDays: 27,
    absentDays: 3,
    attendanceRate: 90
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
  
  // For now, return mock data since we don't have payroll tables yet
  // This can be connected to real payroll data when the tables are created
  const payrollStats = {
    totalPayroll: 45230,
    averageSalary: 2500,
    monthlyGrowth: 5.2
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
