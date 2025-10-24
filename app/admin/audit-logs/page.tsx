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
  Shield, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  User,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react'
import { toast } from 'sonner'

interface AuditLog {
  id: string
  user_id?: string
  action: string
  table_name?: string
  record_id?: string
  old_values?: any
  new_values?: any
  ip_address?: string
  user_agent?: string
  created_at: string
  users?: {
    id: string
    full_name: string
    email: string
    role: string
  }
}

export default function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [tableFilter, setTableFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false
  })

  useEffect(() => {
    fetchAuditLogs()
  }, [actionFilter, tableFilter, dateFilter, pagination.offset])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString()
      })

      if (actionFilter !== 'all') params.append('action', actionFilter)
      if (tableFilter !== 'all') params.append('tableName', tableFilter)
      if (dateFilter !== 'all') {
        const endDate = new Date().toISOString()
        const startDate = new Date()
        if (dateFilter === 'today') {
          startDate.setHours(0, 0, 0, 0)
        } else if (dateFilter === 'week') {
          startDate.setDate(startDate.getDate() - 7)
        } else if (dateFilter === 'month') {
          startDate.setMonth(startDate.getMonth() - 1)
        }
        params.append('startDate', startDate.toISOString())
        params.append('endDate', endDate)
      }

      const response = await fetch(`/api/admin/audit-logs?${params}`)
      const data = await response.json()

      if (data.success) {
        setAuditLogs(data.data.logs)
        setPagination(prev => ({
          ...prev,
          total: data.data.pagination.total,
          hasMore: data.data.pagination.hasMore
        }))
      } else {
        toast.error('Failed to fetch audit logs', {
          description: data.error || 'An error occurred'
        })
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      toast.error('Connection error', {
        description: 'Unable to fetch audit logs. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (actionFilter !== 'all') params.append('action', actionFilter)
      if (tableFilter !== 'all') params.append('tableName', tableFilter)
      if (dateFilter !== 'all') {
        const endDate = new Date().toISOString()
        const startDate = new Date()
        if (dateFilter === 'today') {
          startDate.setHours(0, 0, 0, 0)
        } else if (dateFilter === 'week') {
          startDate.setDate(startDate.getDate() - 7)
        } else if (dateFilter === 'month') {
          startDate.setMonth(startDate.getMonth() - 1)
        }
        params.append('startDate', startDate.toISOString())
        params.append('endDate', endDate)
      }

      // In a real implementation, you would generate and download a CSV/Excel file
      toast.info('Export functionality coming soon', {
        description: 'Audit log export will be available in the next update'
      })
    } catch (error) {
      console.error('Error exporting audit logs:', error)
      toast.error('Export failed', {
        description: 'Unable to export audit logs. Please try again.'
      })
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('create') || action.includes('add')) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    } else if (action.includes('update') || action.includes('edit')) {
      return <Info className="h-4 w-4 text-blue-600" />
    } else if (action.includes('delete') || action.includes('remove')) {
      return <AlertCircle className="h-4 w-4 text-red-600" />
    } else {
      return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getActionColor = (action: string) => {
    if (action.includes('create') || action.includes('add')) {
      return 'bg-green-50 border-green-200'
    } else if (action.includes('update') || action.includes('edit')) {
      return 'bg-blue-50 border-blue-200'
    } else if (action.includes('delete') || action.includes('remove')) {
      return 'bg-red-50 border-red-200'
    } else {
      return 'bg-gray-50 border-gray-200'
    }
  }

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const filteredLogs = auditLogs.filter(log => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      log.action.toLowerCase().includes(searchLower) ||
      log.table_name?.toLowerCase().includes(searchLower) ||
      log.users?.full_name.toLowerCase().includes(searchLower) ||
      log.users?.email.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading audit logs...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-2">
            Monitor system activity and track all user actions for security and compliance.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search audit logs..."
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
                  Filter by Action
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by Action</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActionFilter('all')}>
                  All Actions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActionFilter('user_created')}>
                  User Created
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActionFilter('user_updated')}>
                  User Updated
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActionFilter('user_deleted')}>
                  User Deleted
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActionFilter('department_created')}>
                  Department Created
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActionFilter('department_updated')}>
                  Department Updated
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActionFilter('department_deleted')}>
                  Department Deleted
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Filter by Date
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setDateFilter('all')}>
                  All Time
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter('today')}>
                  Today
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter('week')}>
                  Last 7 Days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter('month')}>
                  Last 30 Days
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button onClick={fetchAuditLogs} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Audit Logs List */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          {filteredLogs.map((log) => (
            <Card key={log.id} className={`${getActionColor(log.action)}`}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {getActionIcon(log.action)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {formatAction(log.action)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {log.table_name && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                              {log.table_name}
                            </span>
                          )}
                          {log.users ? (
                            <span>by {log.users.full_name} ({log.users.email})</span>
                          ) : (
                            <span>by System</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                        {log.ip_address && (
                          <p className="text-xs text-gray-400">
                            IP: {log.ip_address}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {log.old_values && log.new_values && (
                      <div className="mt-3 p-3 bg-white rounded-lg border">
                        <p className="text-xs font-medium text-gray-700 mb-2">Changes:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-red-600 mb-1">Old Values:</p>
                            <pre className="text-xs text-gray-600 bg-red-50 p-2 rounded">
                              {JSON.stringify(log.old_values, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-green-600 mb-1">New Values:</p>
                            <pre className="text-xs text-gray-600 bg-green-50 p-2 rounded">
                              {JSON.stringify(log.new_values, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="flex justify-center space-x-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600">
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
              disabled={pagination.offset === 0}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 py-2 text-sm text-gray-600">
              Page {Math.floor(pagination.offset / pagination.limit) + 1} of {Math.ceil(pagination.total / pagination.limit)}
            </span>
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
              disabled={!pagination.hasMore}
            >
              Next
            </Button>
          </div>
        )}

        {filteredLogs.length === 0 && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600">
            <CardContent className="p-12 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No audit logs found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || actionFilter !== 'all' || tableFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No system activity has been recorded yet.'
                }
              </p>
              {!searchTerm && actionFilter === 'all' && tableFilter === 'all' && dateFilter === 'all' && (
                <Button onClick={fetchAuditLogs}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}


