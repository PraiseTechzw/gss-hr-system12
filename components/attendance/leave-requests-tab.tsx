"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { LeaveRequestDialog } from "./leave-request-dialog"
import { LeaveRequestsTable } from "./leave-requests-table"

type Employee = {
  id: string
  employee_id: string
  first_name: string
  last_name: string
  job_title: string
}

type LeaveRequest = {
  id: string
  employee_id: string
  leave_type: string
  start_date: string
  end_date: string
  total_days: number
  reason: string | null
  status: string
  approved_by: string | null
  approved_at: string | null
  created_at: string
  employees: Employee
}

export function LeaveRequestsTab({
  leaveRequests,
  employees,
}: {
  leaveRequests: LeaveRequest[]
  employees: Employee[]
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const pendingCount = leaveRequests.filter((req) => req.status === "pending").length
  const approvedCount = leaveRequests.filter((req) => req.status === "approved").length
  const rejectedCount = leaveRequests.filter((req) => req.status === "rejected").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1">
            Pending: {pendingCount}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            Approved: {approvedCount}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            Rejected: {rejectedCount}
          </Badge>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-[#a2141e] hover:bg-[#8a1119]">
          <Plus className="mr-2 h-4 w-4" />
          New Leave Request
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <LeaveRequestsTable leaveRequests={leaveRequests} />
        </CardContent>
      </Card>

      <LeaveRequestDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} employees={employees} />
    </div>
  )
}
