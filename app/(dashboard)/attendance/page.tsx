import { createClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeaveRequestsTab } from "@/components/attendance/leave-requests-tab"
import { AttendanceTab } from "@/components/attendance/attendance-tab"

export default async function AttendancePage() {
  const supabase = await createClient()

  // Fetch leave requests with employee information
  const { data: leaveRequests } = await supabase
    .from("leave_requests")
    .select(
      `
      *,
      employees (
        id,
        employee_id,
        first_name,
        last_name,
        email,
        job_title
      )
    `,
    )
    .order("created_at", { ascending: false })

  // Fetch attendance records with employee information
  const { data: attendanceRecords } = await supabase
    .from("attendance")
    .select(
      `
      *,
      employees (
        id,
        employee_id,
        first_name,
        last_name,
        job_title
      )
    `,
    )
    .order("date", { ascending: false })
    .limit(100)

  // Fetch all active employees for forms
  const { data: employees } = await supabase
    .from("employees")
    .select("id, employee_id, first_name, last_name, job_title")
    .eq("employment_status", "active")
    .order("first_name")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leave & Attendance</h1>
        <p className="mt-1 text-gray-500">Manage employee leave requests and attendance records</p>
      </div>

      <Tabs defaultValue="leave" className="space-y-6">
        <TabsList>
          <TabsTrigger value="leave">Leave Requests</TabsTrigger>
          <TabsTrigger value="attendance">Attendance Records</TabsTrigger>
        </TabsList>

        <TabsContent value="leave">
          <LeaveRequestsTab leaveRequests={leaveRequests || []} employees={employees || []} />
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceTab attendanceRecords={attendanceRecords || []} employees={employees || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
