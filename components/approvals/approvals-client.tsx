"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { approveLeave, rejectLeave } from "@/lib/offline/mutations"
import { useOfflineMutation } from "@/lib/offline/use-offline-mutation"
import { toast } from "sonner"

export default function ApprovalsClient({ pendingLeaves }: { pendingLeaves: any[] }) {
  const [rows, setRows] = useState<any[]>(pendingLeaves)
  const { run: runApprove, isLoading: approving } = useOfflineMutation(async (id: string) => {
    await approveLeave(id)
    setRows((prev) => prev.filter((r) => r.id !== id))
    toast.success("Leave request approved!", {
      description: "The leave request has been successfully approved"
    })
  })
  const { run: runReject, isLoading: rejecting } = useOfflineMutation(async (id: string) => {
    await rejectLeave(id)
    setRows((prev) => prev.filter((r) => r.id !== id))
    toast.success("Leave request rejected", {
      description: "The leave request has been rejected"
    })
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Approvals</h1>
      <Card>
        <CardHeader>
          <CardTitle>Pending Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Total Days</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.employees ? `${r.employees.employee_id} - ${r.employees.first_name} ${r.employees.last_name}` : '—'}</TableCell>
                    <TableCell><Badge variant="secondary">{r.leave_type}</Badge></TableCell>
                    <TableCell>{new Date(r.start_date).toLocaleDateString()} - {new Date(r.end_date).toLocaleDateString()}</TableCell>
                    <TableCell>{r.total_days}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" className="mr-2" onClick={() => runApprove(r.id)} disabled={approving || rejecting}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => runReject(r.id)} disabled={approving || rejecting}>Reject</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


