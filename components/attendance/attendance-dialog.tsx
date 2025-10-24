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
// Supabase client removed

type Employee = {
  id: string
  employee_id: string
  first_name: string
  last_name: string
  job_title: string
}

export function AttendanceDialog({
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
    date: new Date().toISOString().split("T")[0],
    check_in: "",
    check_out: "",
    status: "present",
    notes: "",
  })

  const calculateHours = () => {
    if (formData.check_in && formData.check_out) {
      const [inHour, inMin] = formData.check_in.split(":").map(Number)
      const [outHour, outMin] = formData.check_out.split(":").map(Number)
      const inMinutes = inHour * 60 + inMin
      const outMinutes = outHour * 60 + outMin
      const diffMinutes = outMinutes - inMinutes
      return (diffMinutes / 60).toFixed(2)
    }
    return "0"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const hoursWorked = formData.check_in && formData.check_out ? Number.parseFloat(calculateHours()) : null

      const { error } = await supabase.from("attendance").insert([
        {
          employee_id: formData.employee_id,
          date: formData.date,
          check_in: formData.check_in || null,
          check_out: formData.check_out || null,
          status: formData.status,
          hours_worked: hoursWorked,
          notes: formData.notes || null,
        },
      ])

      if (error) throw error

      setFormData({
        employee_id: "",
        date: new Date().toISOString().split("T")[0],
        check_in: "",
        check_out: "",
        status: "present",
        notes: "",
      })
      onOpenChange(false)
      router.refresh()
    } catch (error: any) {
      console.error("Error marking attendance:", error)
      setError(error.message || "Failed to mark attendance")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Mark Attendance</DialogTitle>
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
            <Label htmlFor="date">
              Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="half_day">Half Day</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="check_in">Check In</Label>
              <Input
                id="check_in"
                type="time"
                value={formData.check_in}
                onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check_out">Check Out</Label>
              <Input
                id="check_out"
                type="time"
                value={formData.check_out}
                onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
              />
            </div>
          </div>

          {formData.check_in && formData.check_out && (
            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
              Hours Worked: <strong>{calculateHours()}h</strong>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex-1 bg-[#a2141e] hover:bg-[#8a1119]">
              {isLoading ? "Saving..." : "Mark Attendance"}
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
