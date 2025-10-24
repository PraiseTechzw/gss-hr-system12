"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AttendanceDialog } from "./attendance-dialog"
import { AttendanceTable } from "./attendance-table"

type Employee = {
  id: string
  employee_id: string
  first_name: string
  last_name: string
  job_title: string
}

type AttendanceRecord = {
  id: string
  employee_id: string
  date: string
  check_in: string | null
  check_out: string | null
  status: string
  hours_worked: number | null
  notes: string | null
  employees: Employee
}

export function AttendanceTab({
  attendanceRecords,
  employees,
}: {
  attendanceRecords: AttendanceRecord[]
  employees: Employee[]
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={() => setIsDialogOpen(true)} className="bg-[#a2141e] hover:bg-[#8a1119]">
          <Plus className="mr-2 h-4 w-4" />
          Mark Attendance
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceTable attendanceRecords={attendanceRecords} />
        </CardContent>
      </Card>

      <AttendanceDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} employees={employees} />
    </div>
  )
}
