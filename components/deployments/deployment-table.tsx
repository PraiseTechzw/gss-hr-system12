"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, Pencil, Trash2, Search, Filter, Download, MoreHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, MapPin, Calendar, Users, Grid, List } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type Deployment = {
  id: string
  employee_id: string
  client_name: string
  site_location: string
  deployment_type: string
  start_date: string
  end_date: string | null
  shift_timing: string | null
  daily_rate: number | null
  monthly_salary: number | null
  status: string
  employees: {
    id: string
    employee_id: string
    first_name: string
    last_name: string
    email: string
    job_title: string
  }
}

export function DeploymentTable({ deployments }: { deployments: Deployment[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<string>("start_date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [selectedDeployments, setSelectedDeployments] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const itemsPerPage = 10
  
  const router = useRouter()
  const supabase = createClient()

  // Get unique deployment types for filter
  const deploymentTypes = useMemo(() => {
    return [...new Set(deployments.map(d => d.deployment_type))].filter(Boolean)
  }, [deployments])

  // Advanced filtering and sorting
  const filteredAndSortedDeployments = useMemo(() => {
    let filtered = deployments.filter((dep) => {
      const matchesSearch = 
        dep.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dep.site_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dep.employees.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dep.employees.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dep.employees.employee_id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || dep.status === statusFilter
      const matchesType = typeFilter === "all" || dep.deployment_type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })

    // Sort deployments
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortField) {
        case "employee_name":
          aValue = `${a.employees.first_name} ${a.employees.last_name}`
          bValue = `${b.employees.first_name} ${b.employees.last_name}`
          break
        case "client_name":
          aValue = a.client_name
          bValue = b.client_name
          break
        case "site_location":
          aValue = a.site_location
          bValue = b.site_location
          break
        case "start_date":
          aValue = new Date(a.start_date)
          bValue = new Date(b.start_date)
          break
        case "salary":
          aValue = a.monthly_salary || a.daily_rate || 0
          bValue = b.monthly_salary || b.daily_rate || 0
          break
        default:
          aValue = a[sortField as keyof Deployment]
          bValue = b[sortField as keyof Deployment]
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [deployments, searchTerm, statusFilter, typeFilter, sortField, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedDeployments.length / itemsPerPage)
  const paginatedDeployments = filteredAndSortedDeployments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Sorting handler
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  // Selection handlers
  const handleSelectDeployment = (deploymentId: string) => {
    setSelectedDeployments(prev =>
      prev.includes(deploymentId)
        ? prev.filter(id => id !== deploymentId)
        : [...prev, deploymentId]
    )
  }

  const handleSelectAll = () => {
    if (selectedDeployments.length === paginatedDeployments.length) {
      setSelectedDeployments([])
    } else {
      setSelectedDeployments(paginatedDeployments.map(deployment => deployment.id))
    }
  }

  // Bulk actions
  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from("deployments")
        .update({ status: newStatus })
        .in("id", selectedDeployments)

      if (error) throw error

      setSelectedDeployments([])
      router.refresh()
    } catch (error) {
      console.error("Error updating deployment status:", error)
      alert("Failed to update deployment status. Please try again.")
    }
  }

  // Export to CSV
  const exportToCSV = () => {
    const csvContent = [
      ['Employee', 'Client', 'Site Location', 'Type', 'Start Date', 'End Date', 'Salary', 'Status'],
      ...filteredAndSortedDeployments.map(dep => [
        `${dep.employees.first_name} ${dep.employees.last_name}`,
        dep.client_name,
        dep.site_location,
        dep.deployment_type,
        dep.start_date,
        dep.end_date || '',
        dep.monthly_salary ? `USD $${dep.monthly_salary}` : dep.daily_rate ? `USD $${dep.daily_rate}/day` : '',
        dep.status
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `deployments_${new Date().toISOString().split('T')[0]}.csv`)
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = async (id: string, clientName: string) => {
    if (!confirm(`Are you sure you want to delete the deployment at ${clientName}? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(id)
    try {
      const { error } = await supabase.from("deployments").delete().eq("id", id)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Error deleting deployment:", error)
      alert("Failed to delete deployment. Please try again.")
    } finally {
      setIsDeleting(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "completed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return ""
    }
  }

  // Sortable header component
  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-gray-50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-4 w-4 text-gray-400" />
      </div>
    </TableHead>
  )

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search deployments..."
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {deploymentTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-l-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>

          {/* Export Button */}
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          {/* Bulk Actions */}
          {selectedDeployments.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                  Actions ({selectedDeployments.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkStatusUpdate('active')}>
                  Mark as Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusUpdate('completed')}>
                  Mark as Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusUpdate('cancelled')}>
                  Mark as Cancelled
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedDeployments([])}>
                  Clear Selection
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {paginatedDeployments.length} of {filteredAndSortedDeployments.length} deployments
          {filteredAndSortedDeployments.length !== deployments.length && ` (filtered from ${deployments.length} total)`}
        </span>
        <div className="flex items-center gap-4">
          <span>Page {currentPage} of {totalPages}</span>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedDeployments.length === paginatedDeployments.length && paginatedDeployments.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </TableHead>
                <SortableHeader field="employee_name">Employee</SortableHeader>
                <SortableHeader field="client_name">Client</SortableHeader>
                <SortableHeader field="site_location">Site Location</SortableHeader>
                <TableHead>Type</TableHead>
                <SortableHeader field="start_date">Start Date</SortableHeader>
                <SortableHeader field="salary">Salary</SortableHeader>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDeployments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                    <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium">No deployments found</p>
                    <p className="text-sm">Try adjusting your search or filter criteria</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDeployments.map((deployment) => (
                  <TableRow key={deployment.id} className="hover:bg-gray-50">
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedDeployments.includes(deployment.id)}
                        onChange={() => handleSelectDeployment(deployment.id)}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                          {deployment.employees.first_name[0]}{deployment.employees.last_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {deployment.employees.first_name} {deployment.employees.last_name}
                          </p>
                          <p className="text-sm text-gray-500">{deployment.employees.employee_id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{deployment.client_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {deployment.site_location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{deployment.deployment_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(deployment.start_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {deployment.monthly_salary
                        ? `USD $${deployment.monthly_salary.toLocaleString()}/mo`
                        : deployment.daily_rate
                          ? `USD $${deployment.daily_rate.toLocaleString()}/day`
                          : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(deployment.status)}>
                        {deployment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/deployments/${deployment.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/deployments/${deployment.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(deployment.id, deployment.client_name)}
                            disabled={isDeleting === deployment.id}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* Grid View */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedDeployments.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900">No deployments found</p>
              <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            paginatedDeployments.map((deployment) => (
              <div key={deployment.id} className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                      {deployment.employees.first_name[0]}{deployment.employees.last_name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {deployment.employees.first_name} {deployment.employees.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{deployment.employees.employee_id}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={getStatusColor(deployment.status)}>
                    {deployment.status}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{deployment.client_name}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3 w-3" />
                      {deployment.site_location}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(deployment.start_date).toLocaleDateString()}
                    </div>
                    <Badge variant="outline">{deployment.deployment_type}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {deployment.monthly_salary
                        ? `USD $${deployment.monthly_salary.toLocaleString()}/mo`
                        : deployment.daily_rate
                          ? `USD $${deployment.daily_rate.toLocaleString()}/day`
                          : "N/A"}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/deployments/${deployment.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/deployments/${deployment.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(deployment.id, deployment.client_name)}
                          disabled={isDeleting === deployment.id}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
