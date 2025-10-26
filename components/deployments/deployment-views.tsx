"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, Map, Calendar, Search, Filter, Download, Plus, Grid, List, BarChart3, TrendingUp, Users, Clock, DollarSign } from "lucide-react"
import { DeploymentTable } from "./deployment-table"
import { DeploymentMap } from "./deployment-map-enhanced"
import { DeploymentCalendar } from "./deployment-calendar-enhanced"
import Link from "next/link"

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

type ViewMode = "table" | "map" | "calendar"

export function DeploymentViews({ deployments }: { deployments: Deployment[] }) {
  const [activeView, setActiveView] = useState<ViewMode>("table")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  // Calculate statistics
  const stats = useMemo(() => {
    const total = deployments.length
    const active = deployments.filter(d => d.status === 'active').length
    const completed = deployments.filter(d => d.status === 'completed').length
    const pending = deployments.filter(d => d.status === 'pending').length
    const cancelled = deployments.filter(d => d.status === 'cancelled').length
    
    const totalRevenue = deployments.reduce((sum, d) => {
      if (d.monthly_salary) return sum + d.monthly_salary
      if (d.daily_rate) return sum + (d.daily_rate * 30) // Estimate monthly
      return sum
    }, 0)

    return {
      total,
      active,
      completed,
      pending,
      cancelled,
      totalRevenue
    }
  }, [deployments])

  // Filter deployments
  const filteredDeployments = useMemo(() => {
    return deployments.filter(deployment => {
      const matchesSearch = 
        deployment.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deployment.site_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${deployment.employees.first_name} ${deployment.employees.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || deployment.status === statusFilter
      const matchesType = typeFilter === "all" || deployment.deployment_type === typeFilter
      
      return matchesSearch && matchesStatus && matchesType
    })
  }, [deployments, searchTerm, statusFilter, typeFilter])

  const views = [
    { key: "table", label: "Table View", icon: Table, description: "Detailed list view" },
    { key: "map", label: "Map View", icon: Map, description: "Geographic visualization" },
    { key: "calendar", label: "Calendar View", icon: Calendar, description: "Timeline view" },
  ]

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Deployments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Management Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Deployment Management
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Manage and monitor employee deployments across all locations
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Link href="/deployments/new">
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Deployment
                </Button>
              </Link>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mt-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search deployments, clients, employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
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
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle */}
            <div className="flex rounded-md border">
              {views.map((view) => {
                const ViewIcon = view.icon
                return (
                  <Button
                    key={view.key}
                    variant={activeView === view.key ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveView(view.key as ViewMode)}
                    className={`
                      ${view.key === 'table' ? 'rounded-r-none' : ''}
                      ${view.key === 'calendar' ? 'rounded-l-none' : ''}
                      ${view.key === 'map' ? 'rounded-none' : ''}
                    `}
                    title={view.description}
                  >
                    <ViewIcon className="mr-2 h-4 w-4" />
                    {view.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mt-2">
            <div className="flex items-center gap-4">
              <span>Showing {filteredDeployments.length} of {deployments.length} deployments</span>
              {(searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
                <Badge variant="secondary" className="gap-1">
                  <Filter className="h-3 w-3" />
                  Filtered
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {activeView === "table" && <DeploymentTable deployments={filteredDeployments} />}
          {activeView === "map" && <DeploymentMap deployments={filteredDeployments} />}
          {activeView === "calendar" && <DeploymentCalendar deployments={filteredDeployments} />}
        </CardContent>
      </Card>
    </div>
  )
}
