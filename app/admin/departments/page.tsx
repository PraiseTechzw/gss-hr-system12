'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Users,
  User,
  Calendar,
  TrendingUp
} from 'lucide-react'
import { toast } from 'sonner'

interface Department {
  id: string
  name: string
  description?: string
  manager_id?: string
  is_active: boolean
  created_at: string
  users?: {
    id: string
    full_name: string
    email: string
    role: string
  }
  employees?: {
    id: string
    active: boolean
  }[]
  employee_count?: number
  total_employees?: number
}

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [showAddDepartment, setShowAddDepartment] = useState(false)
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
    managerId: ''
  })

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/departments')
      const data = await response.json()

      if (data.success) {
        setDepartments(data.data)
      } else {
        toast.error('Failed to fetch departments', {
          description: data.error || 'An error occurred'
        })
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
      toast.error('Connection error', {
        description: 'Unable to fetch departments. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDepartment),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Department created successfully', {
          description: `${newDepartment.name} has been added to the system`
        })
        setShowAddDepartment(false)
        setNewDepartment({
          name: '',
          description: '',
          managerId: ''
        })
        fetchDepartments()
      } else {
        toast.error('Failed to create department', {
          description: data.error || 'An error occurred'
        })
      }
    } catch (error) {
      console.error('Error creating department:', error)
      toast.error('Connection error', {
        description: 'Unable to create department. Please try again.'
      })
    }
  }

  const handleDeleteDepartment = async (departmentId: string, departmentName: string) => {
    if (!confirm(`Are you sure you want to deactivate ${departmentName}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/departments?departmentId=${departmentId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Department deactivated successfully', {
          description: `${departmentName} has been deactivated`
        })
        fetchDepartments()
      } else {
        toast.error('Failed to deactivate department', {
          description: data.error || 'An error occurred'
        })
      }
    } catch (error) {
      console.error('Error deleting department:', error)
      toast.error('Connection error', {
        description: 'Unable to deactivate department. Please try again.'
      })
    }
  }

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && dept.is_active) ||
                         (statusFilter === 'inactive' && !dept.is_active)
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading departments...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-3xl font-bold text-gray-900">Department Management</h1>
          <p className="text-gray-600 mt-2">
            Organize your company structure and assign department managers.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter by Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  All Departments
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                  Active Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                  Inactive Only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setShowAddDepartment(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </div>
        </div>

        {/* Add Department Modal */}
        {showAddDepartment && (
          <Card className="animate-in fade-in slide-in-from-top-4 duration-300">
            <CardHeader>
              <CardTitle>Add New Department</CardTitle>
              <CardDescription>
                Create a new department and assign a manager if needed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddDepartment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Department Name</Label>
                    <Input
                      id="name"
                      value={newDepartment.name}
                      onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="managerId">Manager (Optional)</Label>
                    <Input
                      id="managerId"
                      value={newDepartment.managerId}
                      onChange={(e) => setNewDepartment({ ...newDepartment, managerId: e.target.value })}
                      placeholder="Manager ID"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={newDepartment.description}
                    onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddDepartment(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Department
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          {filteredDepartments.map((department) => (
            <Card key={department.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{department.name}</CardTitle>
                      <CardDescription>
                        {department.description || 'No description provided'}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Department
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteDepartment(department.id, department.name)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Deactivate Department
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Manager Info */}
                  {department.users && (
                    <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                      <User className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Manager</p>
                        <p className="text-xs text-blue-700">{department.users.full_name}</p>
                        <p className="text-xs text-blue-600">{department.users.email}</p>
                      </div>
                    </div>
                  )}

                  {/* Employee Count */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Employees</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">
                        {department.employee_count || 0} active
                      </Badge>
                      <Badge variant="outline">
                        {department.total_employees || 0} total
                      </Badge>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge variant={department.is_active ? 'default' : 'secondary'}>
                      {department.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>Created {new Date(department.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDepartments.length === 0 && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600">
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No departments found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first department.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => setShowAddDepartment(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Department
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
