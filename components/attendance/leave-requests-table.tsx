"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Check, X, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
// Supabase client removed

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
  employees: {
    id: string
    employee_id: string
    first_name: string
    last_name: string
    job_title: string
  }
}

export function LeaveRequestsTable({ leaveRequests }: { leaveRequests: LeaveRequest[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const filteredRequests = leaveRequests.filter(
    (req) =>
      req.employees.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.employees.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.employees.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.leave_type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleApprove = async (id: string) => {
    setIsProcessing(id)
    try {
      const { error } = await supabase
        .from("leave_requests")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: "Admin",
        })
        .eq("id", id)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error approving leave:", error)
      alert("Failed to approve leave request")
    } finally {
      setIsProcessing(null)
    }
  }

  const handleReject = async (id: string) => {
    setIsProcessing(id)
    try {
      const { error } = await supabase
        .from("leave_requests")
        .update({
          status: "rejected",
          approved_at: new Date().toISOString(),
          approved_by: "Admin",
        })
        .eq("id", id)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error rejecting leave:", error)
      alert("Failed to reject leave request")
    } finally {
      setIsProcessing(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this leave request?")) return

    setIsProcessing(id)
    try {
      const { error } = await supabase.from("leave_requests").delete().eq("id", id)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error deleting leave:", error)
      alert("Failed to delete leave request")
    } finally {
      setIsProcessing(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by employee name, ID, or leave type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">
                  No leave requests found
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {request.employees.first_name} {request.employees.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{request.employees.employee_id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{request.leave_type}</Badge>
                  </TableCell>
                  <TableCell>{new Date(request.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(request.end_date).toLocaleDateString()}</TableCell>
                  <TableCell>{request.total_days}</TableCell>
                  <TableCell className="max-w-xs truncate">{request.reason || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {request.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                            disabled={isProcessing === request.id}
                            title="Approve"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReject(request.id)}
                            disabled={isProcessing === request.id}
                            title="Reject"
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(request.id)}
                        disabled={isProcessing === request.id}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
