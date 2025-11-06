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
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Shield,
  Building2,
  Mail,
  Phone,
  Calendar,
  Lock,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'hr' | 'manager'
  department_id?: string
  is_active: boolean
  created_at: string
  requires_password_setup?: boolean
  departments?: {
    id: string
    name: string
  }
  employees?: {
    id: string
    employee_number: string
    position: string
    employment_type: string
    active: boolean
  }[]
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    fullName: '',
    role: 'hr',
    departmentId: '',
    password: 'default123'
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      const data = await response.json()

      if (data.success) {
        setUsers(data.data)
      } else {
        toast.error('Failed to fetch users', {
          description: data.error || 'An error occurred'
        })
      }
    } catch (error) {
      toast.error('Connection error', {
        description: 'Unable to fetch users. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })

      const data = await response.json()

      if (data.success) {
        // Show success message with password setup instructions
        if (data.requiresPasswordSetup && data.instructions) {
          toast.success('User created successfully', {
            description: `${newUser.fullName} has been added. They need to set up their password on first login.`,
            duration: 6000,
            action: {
              label: 'View Instructions',
              onClick: () => {
                // Show detailed instructions
                const instructions = data.instructions
                alert(
                  `${instructions.title}\n\n` +
                  `${instructions.message}\n\n` +
                  `Instructions for the new user:\n` +
                  instructions.steps.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n') +
                  `\n\nUser Email: ${newUser.email}\n` +
                  `User Name: ${newUser.fullName}`
                )
              }
            }
          })
          
          // Also show a more detailed toast with key info
          setTimeout(() => {
            toast.info('Password Setup Required', {
              description: `Tell ${newUser.fullName} to login with their email (${newUser.email}). They will be prompted to set their password.`,
              duration: 8000,
            })
          }, 1000)
        } else {
          toast.success('User created successfully', {
            description: `${newUser.fullName} has been added to the system`
          })
        }
        
        setShowAddUser(false)
        setNewUser({
          email: '',
          fullName: '',
          role: 'hr',
          departmentId: '',
          password: 'default123'
        })
        fetchUsers()
      } else {
        const errorMsg = data.details || data.error || 'An error occurred'
        toast.error('Failed to create user', {
          description: errorMsg
        })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unable to create user. Please try again.'
      toast.error('Connection error', {
        description: errorMsg
      })
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to deactivate ${userName}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('User deactivated successfully', {
          description: `${userName} has been deactivated`
        })
        fetchUsers()
      } else {
        toast.error('Failed to deactivate user', {
          description: data.error || 'An error occurred'
        })
      }
    } catch (error) {
      toast.error('Connection error', {
        description: 'Unable to deactivate user. Please try again.'
      })
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'hr':
        return 'default'
      case 'manager':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3 h-3" />
      case 'hr':
        return <Users className="w-3 h-3" />
      case 'manager':
        return <Building2 className="w-3 h-3" />
      default:
        return <Users className="w-3 h-3" />
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage system users, roles, and permissions.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
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
                  Filter by Role
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setRoleFilter('all')}>
                  All Roles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRoleFilter('admin')}>
                  Admin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRoleFilter('hr')}>
                  HR
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRoleFilter('manager')}>
                  Manager
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setShowAddUser(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Add User Modal */}
        {showAddUser && (
          <Card className="animate-in fade-in slide-in-from-top-4 duration-300">
            <CardHeader>
              <CardTitle>Add New User</CardTitle>
              <CardDescription>
                Create a new user account with appropriate role and permissions. The user will need to set up their password on first login.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={newUser.fullName}
                      onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="hr">HR</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="departmentId">Department (Optional)</Label>
                    <Input
                      id="departmentId"
                      value={newUser.departmentId}
                      onChange={(e) => setNewUser({ ...newUser, departmentId: e.target.value })}
                      placeholder="Department ID"
                    />
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">📋 What to tell the new user:</p>
                  <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                    <li>Their account has been created with email: <strong>{newUser.email || '[email]'}</strong></li>
                    <li>They should go to the login page and enter their email address</li>
                    <li>They will be automatically redirected to set up their password</li>
                    <li>After setting their password, they can log in normally</li>
                  </ul>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddUser(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create User
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Users List */}
        <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {user.full_name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{user.full_name}</h3>
                        {user.requires_password_setup && (
                          <AlertCircle className="h-4 w-4 text-orange-500" title="Password setup required" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {user.email}
                      </p>
                      {user.requires_password_setup && (
                        <p className="text-xs text-orange-600 flex items-center mt-1">
                          <Lock className="h-3 w-3 mr-1" />
                          User needs to set up password on first login
                        </p>
                      )}
                      {user.departments && (
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Building2 className="h-4 w-4 mr-1" />
                          {user.departments.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {user.requires_password_setup && (
                      <Badge variant="destructive" className="flex items-center space-x-1">
                        <Lock className="h-3 w-3" />
                        <span>Password Setup Required</span>
                      </Badge>
                    )}
                    <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center space-x-1">
                      {getRoleIcon(user.role)}
                      <span>{user.role.toUpperCase()}</span>
                    </Badge>
                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
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
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteUser(user.id, user.full_name)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Deactivate User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                {user.employees && user.employees.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Employee Records: {user.employees.length} active
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || roleFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first user.'
                }
              </p>
              {!searchTerm && roleFilter === 'all' && (
                <Button onClick={() => setShowAddUser(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add First User
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
