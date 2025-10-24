"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
// Supabase client removed

type AttendanceRecord = {
  id: string
  employee_id: string
  date: string
  check_in: string | null
  check_out: string | null
  status: string
  hours_worked: number | null
  notes: string | null
  employees: {
    id: string
    employee_id: string
    first_name: string
    last_name: string
    job_title: string
  }
}

export function AttendanceTable({ attendanceRecords }: { attendanceRecords: AttendanceRecord[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const filteredRecords = attendanceRecords.filter(
    (record) =>
      record.employees.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employees.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employees.employee_id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this attendance record?")) return

    setIsDeleting(id)
    try {
      const { error } = await supabase.from("attendance").delete().eq("id", id)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error deleting attendance:", error)
      alert("Failed to delete attendance record")
    } finally {
      setIsDeleting(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "absent":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "half_day":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "on_leave":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by employee name or ID..."
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
              <TableHead>Date</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">
                  No attendance records found
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {record.employees.first_name} {record.employees.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{record.employees.employee_id}</p>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell>{record.check_in || "N/A"}</TableCell>
                  <TableCell>{record.check_out || "N/A"}</TableCell>
                  <TableCell>{record.hours_worked ? `${record.hours_worked}h` : "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(record.status)}>
                      {record.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{record.notes || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(record.id)}
                      disabled={isDeleting === record.id}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
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
