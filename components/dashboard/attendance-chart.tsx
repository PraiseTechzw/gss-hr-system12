import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAttendanceStats, getPayrollStats } from "@/lib/database-utils"

export async function AttendanceChart() {
  const attendanceStats = await getAttendanceStats()

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
  const payrollStats = await getPayrollStats()

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
