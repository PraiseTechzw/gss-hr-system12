"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, ChevronLeft, ChevronRight, MapPin, Users, Clock, Plus } from "lucide-react"
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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function DeploymentCalendar({ deployments }: { deployments: Deployment[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<"month" | "week">("month")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Filter deployments by status
  const filteredDeployments = useMemo(() => {
    return deployments.filter(deployment => 
      statusFilter === "all" || deployment.status === statusFilter
    )
  }, [deployments, statusFilter])

  // Get deployments for a specific date
  const getDeploymentsForDate = (date: Date) => {
    return filteredDeployments.filter(deployment => {
      const startDate = new Date(deployment.start_date)
      const endDate = deployment.end_date ? new Date(deployment.end_date) : null
      
      const dateStr = date.toDateString()
      const startStr = startDate.toDateString()
      const endStr = endDate?.toDateString()
      
      if (!endDate) {
        // Ongoing deployment - check if date is after start date
        return date >= startDate
      } else {
        // Fixed-term deployment - check if date is within range
        return date >= startDate && date <= endDate
      }
    })
  }

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  // Generate week days for current week
  const generateWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    
    return days
  }

  const calendarDays = viewMode === "month" ? generateCalendarDays() : generateWeekDays()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(currentDate.getMonth() - 1)
    } else {
      newDate.setMonth(currentDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setDate(currentDate.getDate() - 7)
    } else {
      newDate.setDate(currentDate.getDate() + 7)
    }
    setCurrentDate(newDate)
  }

  const navigate = (direction: "prev" | "next") => {
    if (viewMode === "month") {
      navigateMonth(direction)
    } else {
      navigateWeek(direction)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "completed":
        return "bg-blue-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold min-w-[200px] text-center">
              {viewMode === "month" 
                ? `${MONTHS[currentMonth]} ${currentYear}`
                : `Week of ${calendarDays[0].toLocaleDateString()}`
              }
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
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

          <div className="flex rounded-md border">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="rounded-r-none"
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className="rounded-l-none"
            >
              Week
            </Button>
          </div>

          <Link href="/deployments/new">
            <Button size="sm" className="bg-[#a2141e] hover:bg-[#8a1119]">
              <Plus className="mr-2 h-4 w-4" />
              New Deployment
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 border-b">
                {DAYS.map((day) => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 border-r last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Body */}
              <div className={`grid grid-cols-7 ${viewMode === 'month' ? 'grid-rows-6' : 'grid-rows-1'}`}>
                {calendarDays.map((date, index) => {
                  const dayDeployments = getDeploymentsForDate(date)
                  const isCurrentMonthDay = viewMode === 'week' || isCurrentMonth(date)
                  const isTodayDate = isToday(date)
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[120px] p-2 border-r border-b last:border-r-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                        !isCurrentMonthDay ? 'bg-gray-50 text-gray-400' : ''
                      } ${isTodayDate ? 'bg-blue-50 border-blue-200' : ''}`}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        isTodayDate ? 'text-blue-600' : isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {date.getDate()}
                        {isTodayDate && (
                          <span className="ml-1 text-xs bg-blue-600 text-white px-1 rounded">Today</span>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        {dayDeployments.slice(0, 3).map((deployment) => (
                          <div
                            key={deployment.id}
                            className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${getStatusBadgeColor(deployment.status)}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              // Could open deployment details modal here
                            }}
                          >
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(deployment.status)}`}></div>
                              <span className="truncate">{deployment.client_name}</span>
                            </div>
                          </div>
                        ))}
                        {dayDeployments.length > 3 && (
                          <div className="text-xs text-gray-500 pl-1">
                            +{dayDeployments.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected Date Details */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  {selectedDate.toLocaleDateString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const dayDeployments = getDeploymentsForDate(selectedDate)
                  
                  if (dayDeployments.length === 0) {
                    return (
                      <div className="text-center py-4">
                        <Calendar className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">No deployments scheduled</p>
                        <Link href="/deployments/new" className="mt-2 inline-block">
                          <Button size="sm" variant="outline">
                            <Plus className="mr-2 h-3 w-3" />
                            Add Deployment
                          </Button>
                        </Link>
                      </div>
                    )
                  }
                  
                  return (
                    <div className="space-y-3">
                      {dayDeployments.map((deployment) => (
                        <div key={deployment.id} className="p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm">{deployment.client_name}</h4>
                            <Badge variant="secondary" className={`text-xs ${getStatusBadgeColor(deployment.status)}`}>
                              {deployment.status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{deployment.site_location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{deployment.employees.first_name} {deployment.employees.last_name}</span>
                            </div>
                            {deployment.shift_timing && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{deployment.shift_timing}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-1 mt-2">
                            <Link href={`/deployments/${deployment.id}`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full text-xs">
                                View
                              </Button>
                            </Link>
                            <Link href={`/deployments/${deployment.id}/edit`} className="flex-1">
                              <Button size="sm" className="w-full text-xs bg-[#a2141e] hover:bg-[#8a1119]">
                                Edit
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          )}

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Active ({filteredDeployments.filter(d => d.status === 'active').length})</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Pending ({filteredDeployments.filter(d => d.status === 'pending').length})</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Completed ({filteredDeployments.filter(d => d.status === 'completed').length})</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Cancelled ({filteredDeployments.filter(d => d.status === 'cancelled').length})</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const monthStart = new Date(currentYear, currentMonth, 1)
                const monthEnd = new Date(currentYear, currentMonth + 1, 0)
                
                const monthDeployments = filteredDeployments.filter(deployment => {
                  const startDate = new Date(deployment.start_date)
                  const endDate = deployment.end_date ? new Date(deployment.end_date) : new Date()
                  
                  return (startDate <= monthEnd && endDate >= monthStart)
                })
                
                return (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Deployments:</span>
                      <span className="font-medium">{monthDeployments.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Sites:</span>
                      <span className="font-medium text-green-600">
                        {monthDeployments.filter(d => d.status === 'active').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Starting This Month:</span>
                      <span className="font-medium text-blue-600">
                        {monthDeployments.filter(d => {
                          const startDate = new Date(d.start_date)
                          return startDate >= monthStart && startDate <= monthEnd
                        }).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ending This Month:</span>
                      <span className="font-medium text-orange-600">
                        {monthDeployments.filter(d => {
                          if (!d.end_date) return false
                          const endDate = new Date(d.end_date)
                          return endDate >= monthStart && endDate <= monthEnd
                        }).length}
                      </span>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
