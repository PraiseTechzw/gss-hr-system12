"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, ChevronLeft, ChevronRight, MapPin, Users, Clock, Plus, Filter, Eye, Edit } from "lucide-react"
import Link from "next/link"
import { formatShiftTimesForDisplay, getShiftSummary } from "@/components/ui/shift-time-picker"

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

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function DeploymentCalendar({ deployments }: { deployments: Deployment[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Get calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    // Create calendar grid
    const days = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push(date)
    }
    
    return {
      year,
      month,
      days,
      monthName: MONTHS[month]
    }
  }, [currentDate])

  // Filter deployments by status
  const filteredDeployments = useMemo(() => {
    return deployments.filter(deployment => {
      if (filterStatus === 'all') return true
      return deployment.status === filterStatus
    })
  }, [deployments, filterStatus])

  // Get deployments for a specific date
  const getDeploymentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return filteredDeployments.filter(deployment => {
      const startDate = new Date(deployment.start_date).toISOString().split('T')[0]
      const endDate = deployment.end_date ? new Date(deployment.end_date).toISOString().split('T')[0] : null
      
      return startDate <= dateStr && (!endDate || endDate >= dateStr)
    })
  }

  // Get deployments for selected date
  const selectedDateDeployments = selectedDate ? getDeploymentsForDate(selectedDate) : []

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'permanent': return 'bg-blue-500'
      case 'temporary': return 'bg-yellow-500'
      case 'contract': return 'bg-green-500'
      case 'emergency': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Deployment Calendar
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                View deployments by date and timeline
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

          {/* Calendar Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mt-4">
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-2">
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Current Month Display */}
            <div className="flex-1 text-center">
              <h2 className="text-xl font-bold">
                {calendarData.monthName} {calendarData.year}
              </h2>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {/* Day Headers */}
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {calendarData.days.map((date, index) => {
              if (!date) {
                return <div key={index} className="h-24" />
              }
              
              const dayDeployments = getDeploymentsForDate(date)
              const isToday = date.toDateString() === new Date().toDateString()
              const isSelected = selectedDate?.toDateString() === date.toDateString()
              
              return (
                <div
                  key={date.toISOString()}
                  className={`
                    h-24 p-1 border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800
                    ${isToday ? 'bg-blue-50 dark:bg-blue-900' : ''}
                    ${isSelected ? 'bg-blue-100 dark:bg-blue-800' : ''}
                  `}
                  onClick={() => setSelectedDate(date)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm ${isToday ? 'font-bold text-blue-600' : ''}`}>
                      {date.getDate()}
                    </span>
                    {dayDeployments.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {dayDeployments.length}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Deployment Indicators */}
                  <div className="space-y-1">
                    {dayDeployments.slice(0, 2).map(deployment => (
                      <div
                        key={deployment.id}
                        className={`
                          w-full h-2 rounded text-xs truncate px-1
                          ${getTypeColor(deployment.deployment_type)}
                        `}
                        title={`${deployment.client_name} - ${deployment.employees.first_name} ${deployment.employees.last_name}`}
                      />
                    ))}
                    {dayDeployments.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayDeployments.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Selected Date Details */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Deployments for {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateDeployments.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateDeployments.map(deployment => (
                      <Card key={deployment.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{deployment.client_name}</h4>
                                <Badge className={getStatusColor(deployment.status)}>
                                  {deployment.status}
                                </Badge>
                                <Badge variant="outline">{deployment.deployment_type}</Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    <span>{deployment.site_location}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-gray-500" />
                                    <span>{deployment.employees.first_name} {deployment.employees.last_name}</span>
                                  </div>
                                </div>
                                
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <span>{getShiftSummary(deployment.shift_timing || '').summary}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      {deployment.monthly_salary 
                                        ? `$${deployment.monthly_salary.toLocaleString()}/mo`
                                        : deployment.daily_rate 
                                        ? `$${deployment.daily_rate}/day`
                                        : 'N/A'
                                      }
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              <Link href={`/deployments/${deployment.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/deployments/${deployment.id}/edit`}>
                                <Button size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No deployments scheduled</p>
                    <p className="text-sm">This date has no active deployments</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
