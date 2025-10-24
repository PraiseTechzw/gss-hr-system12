"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Download, Search, Trash2, Filter, ChevronUp, ChevronDown, MoreHorizontal, DollarSign, Calendar, Users, TrendingUp, FileText, FileSpreadsheet } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"
// Supabase client removed
import { toast } from "sonner"
import { exportPayrollToCSV, generatePayslipPDF } from "@/lib/export-utils"

type PayrollRecord = {
  id: string
  employee_id: string
  month: number
  year: number
  basic_salary: number
  allowances: number
  deductions: number
  overtime_pay: number
  gross_salary: number
  net_salary: number
  days_worked: number
  days_absent: number
  payment_status: string
  payment_date: string | null
  payment_method: string | null
  employees: {
    id: string
    employee_id: string
    first_name: string
    last_name: string
    email: string
    job_title: string
  }
}

type SortField = 'employee_name' | 'period' | 'basic_salary' | 'gross_salary' | 'net_salary' | 'payment_status'
type SortOrder = 'asc' | 'desc'

export function PayrollTable({ payrollRecords }: { payrollRecords: PayrollRecord[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [yearFilter, setYearFilter] = useState<string>("all")
  const [monthFilter, setMonthFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>('period')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  const router = useRouter()
  const supabase = createClient()

  // Get unique years and months for filters
  const availableYears = useMemo(() => {
    const years = [...new Set(payrollRecords.map(record => record.year))]
    return years.sort((a, b) => b - a)
  }, [payrollRecords])

  const availableMonths = useMemo(() => {
    const months = [...new Set(payrollRecords.map(record => record.month))]
    return months.sort((a, b) => a - b)
  }, [payrollRecords])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const filtered = payrollRecords.filter(record => {
      const matchesSearch = 
        record.employees.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employees.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employees.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || record.payment_status === statusFilter
      const matchesYear = yearFilter === "all" || record.year.toString() === yearFilter
      const matchesMonth = monthFilter === "all" || record.month.toString() === monthFilter
      
      return matchesSearch && matchesStatus && matchesYear && matchesMonth
    })

    return {
      totalRecords: filtered.length,
      totalGrossSalary: filtered.reduce((sum, record) => sum + record.gross_salary, 0),
      totalNetSalary: filtered.reduce((sum, record) => sum + record.net_salary, 0),
      avgSalary: filtered.length > 0 ? filtered.reduce((sum, record) => sum + record.net_salary, 0) / filtered.length : 0,
      pendingPayments: filtered.filter(record => record.payment_status === 'pending').length,
    }
  }, [payrollRecords, searchTerm, statusFilter, yearFilter, monthFilter])

  // Filter and sort records
  const filteredAndSortedRecords = useMemo(() => {
    let filtered = payrollRecords.filter((record) => {
      const matchesSearch = 
      record.employees.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employees.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employees.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || record.payment_status === statusFilter
      const matchesYear = yearFilter === "all" || record.year.toString() === yearFilter
      const matchesMonth = monthFilter === "all" || record.month.toString() === monthFilter
      
      return matchesSearch && matchesStatus && matchesYear && matchesMonth
    })

    // Sort records
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortField) {
        case 'employee_name':
          aValue = `${a.employees.first_name} ${a.employees.last_name}`.toLowerCase()
          bValue = `${b.employees.first_name} ${b.employees.last_name}`.toLowerCase()
          break
        case 'period':
          aValue = a.year * 100 + a.month
          bValue = b.year * 100 + b.month
          break
        case 'basic_salary':
          aValue = a.basic_salary
          bValue = b.basic_salary
          break
        case 'gross_salary':
          aValue = a.gross_salary
          bValue = b.gross_salary
          break
        case 'net_salary':
          aValue = a.net_salary
          bValue = b.net_salary
          break
        case 'payment_status':
          aValue = a.payment_status
          bValue = b.payment_status
          break
        default:
          aValue = a.year * 100 + a.month
          bValue = b.year * 100 + b.month
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [payrollRecords, searchTerm, statusFilter, yearFilter, monthFilter, sortField, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedRecords.length / itemsPerPage)
  const paginatedRecords = filteredAndSortedRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleSelectRecord = (recordId: string) => {
    setSelectedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    )
  }

  const handleSelectAll = () => {
    if (selectedRecords.length === paginatedRecords.length) {
      setSelectedRecords([])
    } else {
      setSelectedRecords(paginatedRecords.map(record => record.id))
    }
  }

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedRecords.length === 0) return
    
    try {
      const { error } = await supabase
        .from("payroll")
        .update({ payment_status: newStatus })
        .in("id", selectedRecords)

      if (error) throw error

      toast.success("Status updated", {
        description: `${selectedRecords.length} payroll record(s) status updated to ${newStatus}`
      })

      setSelectedRecords([])
      router.refresh()
    } catch (error) {
      console.error("Error updating payroll status:", error)
      toast.error("Update failed", {
        description: "Failed to update payroll status. Please try again."
      })
    }
  }

  const handleDelete = async (id: string, employeeName: string) => {
    if (!confirm(`Are you sure you want to delete payroll record for ${employeeName}?`)) return

    setIsDeleting(id)
    try {
      const { error } = await supabase.from("payroll").delete().eq("id", id)

      if (error) throw error
      
      toast.success("Payroll record deleted", {
        description: `Payroll record for ${employeeName} has been deleted successfully`
      })
      
      router.refresh()
    } catch (error) {
      console.error("Error deleting payroll:", error)
      toast.error("Delete failed", {
        description: "Failed to delete payroll record"
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "processed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      default:
        return ""
    }
  }

  const getMonthName = (month: number) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months[month - 1]
  }

  const getFullMonthName = (month: number) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    return months[month - 1]
  }

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-gray-50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortField === field && (
          sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </TableHead>
  )

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.totalRecords}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Gross Salary</p>
                <p className="text-2xl font-bold text-green-600">USD ${summaryStats.totalGrossSalary.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Net Salary</p>
                <p className="text-2xl font-bold text-purple-600">USD ${summaryStats.totalNetSalary.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-orange-600">{summaryStats.pendingPayments}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by employee name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>

          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {availableMonths.map(month => (
                <SelectItem key={month} value={month.toString()}>{getFullMonthName(month)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => exportPayrollToCSV(filteredAndSortedRecords)}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export All as CSV
            </DropdownMenuItem>
            {selectedRecords.length > 0 && (
              <DropdownMenuItem onClick={() => exportPayrollToCSV(
                filteredAndSortedRecords.filter(record => selectedRecords.includes(record.id))
              )}>
                <FileText className="mr-2 h-4 w-4" />
                Export Selected ({selectedRecords.length})
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Bulk Actions */}
        {selectedRecords.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
                Actions ({selectedRecords.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleBulkStatusUpdate('processed')}>
                Mark as Processed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkStatusUpdate('paid')}>
                Mark as Paid
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedRecords([])}>
                Clear Selection
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {paginatedRecords.length} of {filteredAndSortedRecords.length} records
          {filteredAndSortedRecords.length !== payrollRecords.length && ` (filtered from ${payrollRecords.length} total)`}
        </span>
        {selectedRecords.length > 0 && (
          <span className="font-medium text-blue-600">
            {selectedRecords.length} selected
          </span>
        )}
      </div>

      {/* Payroll Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedRecords.length === paginatedRecords.length && paginatedRecords.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </TableHead>
              <SortableHeader field="employee_name">Employee</SortableHeader>
              <SortableHeader field="period">Period</SortableHeader>
              <SortableHeader field="basic_salary">Basic Salary</SortableHeader>
              <SortableHeader field="gross_salary">Gross Salary</SortableHeader>
              <SortableHeader field="net_salary">Net Salary</SortableHeader>
              <TableHead>Days Worked</TableHead>
              <SortableHeader field="payment_status">Status</SortableHeader>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-lg font-medium">No payroll records found</p>
                  <p className="text-sm">Try adjusting your search or filter criteria</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRecords.map((record) => (
                <TableRow key={record.id} className="hover:bg-gray-50">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedRecords.includes(record.id)}
                      onChange={() => handleSelectRecord(record.id)}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                        {record.employees.first_name[0]}{record.employees.last_name[0]}
                      </div>
                    <div>
                      <p className="font-medium">
                        {record.employees.first_name} {record.employees.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{record.employees.employee_id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{getMonthName(record.month)} {record.year}</p>
                      <p className="text-xs text-gray-500">{record.days_worked} days worked</p>
                    </div>
                  </TableCell>
                  <TableCell>USD ${record.basic_salary.toLocaleString()}</TableCell>
                  <TableCell>USD ${record.gross_salary.toLocaleString()}</TableCell>
                  <TableCell className="font-semibold">USD ${record.net_salary.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="text-center">
                      <span className="font-medium">{record.days_worked}</span>
                      <span className="text-gray-400"> / </span>
                      <span className="text-sm text-gray-500">{record.days_worked + record.days_absent}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(record.payment_status)}>
                      {record.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/payroll/${record.id}`}>
                        <Button variant="ghost" size="sm" title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" title="Download Payslip">
                            <Download className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem asChild>
                            <Link href={`/payroll/${record.id}/payslip`}>
                              <FileText className="mr-2 h-4 w-4" />
                              View Payslip
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => generatePayslipPDF(record)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDelete(record.id, `${record.employees.first_name} ${record.employees.last_name}`)
                        }
                        disabled={isDeleting === record.id}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
