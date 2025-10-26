"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { LeaveManagementService } from "@/lib/leave-management"

type Employee = {
  id: string
  employee_id: string
  first_name: string
  last_name: string
  job_title: string
}

export function LeaveRequestDialog({
  open,
  onOpenChange,
  employees,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  employees: Employee[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    employee_id: "",
    leave_type: "casual",
    start_date: "",
    end_date: "",
    reason: "",
  })

  const calculateDays = () => {
    if (formData.start_date && formData.end_date) {
      return LeaveManagementService.calculateLeaveDays(formData.start_date, formData.end_date)
    }
    return 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate the leave request
      const validation = LeaveManagementService.validateLeaveRequest(formData)
      if (!validation.valid) {
        setError(validation.errors.join(', '))
        return
      }

      const totalDays = calculateDays()

      const { error } = await supabase.from("leave_requests").insert([
        {
          employee_id: formData.employee_id,
          leave_type: formData.leave_type,
          start_date: formData.start_date,
          end_date: formData.end_date,
          total_days: totalDays,
          reason: formData.reason || null,
          status: "pending",
        },
      ])

      if (error) throw error

      setFormData({
        employee_id: "",
        leave_type: "casual",
        start_date: "",
        end_date: "",
        reason: "",
      })
      onOpenChange(false)
      router.refresh()
    } catch (error: any) {
      console.error("Error creating leave request:", error)
      setError(error.message || "Failed to create leave request")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Leave Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="employee_id">
              Employee <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.employee_id}
              onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.employee_id} - {emp.first_name} {emp.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="leave_type">
              Leave Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.leave_type}
              onValueChange={(value) => setFormData({ ...formData, leave_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="casual">Casual Leave</SelectItem>
                <SelectItem value="earned">Earned Leave</SelectItem>
                <SelectItem value="unpaid">Unpaid Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="start_date"
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">
                End Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="end_date"
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          {formData.start_date && formData.end_date && (
            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
              Total Days: <strong>{calculateDays()}</strong>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Reason for leave..."
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex-1 bg-[#a2141e] hover:bg-[#8a1119]">
              {isLoading ? "Creating..." : "Create Request"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
