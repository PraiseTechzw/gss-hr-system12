"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MapPin, 
  DollarSign, 
  Calendar,
  Clock,
  Target,
  Award,
  AlertTriangle
} from "lucide-react"

type Employee = {
  id: string
  employment_status: string
  department: string
  job_title: string
  salary: number
}

type Deployment = {
  id: string
  status: string
  deployment_type: string
  start_date: string
  end_date: string | null
  monthly_salary: number | null
  daily_rate: number | null
  employees: {
    first_name: string
    last_name: string
  }
}

type PayrollRecord = {
  id: string
  net_salary: number
  gross_salary: number
  pay_period: string
  status: string
}

type AttendanceRecord = {
  id: string
  date: string
  status: string
  employee_id: string
}

export function ReportsOverview({
  employees,
  deployments,
  payrollRecords,
  attendanceRecords
}: {
  employees: Employee[]
  deployments: Deployment[]
  payrollRecords: PayrollRecord[]
  attendanceRecords: AttendanceRecord[]
}) {
  // Calculate comprehensive metrics
  const metrics = useMemo(() => {
    // Employee metrics
    const departmentStats = employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topDepartment = Object.entries(departmentStats).sort(([,a], [,b]) => b - a)[0]

    // Deployment metrics
    const activeDeployments = deployments.filter(d => d.status === 'active').length
    const deploymentEfficiency = deployments.length > 0 
      ? Math.round((activeDeployments / deployments.length) * 100) 
      : 0

    // Payroll metrics
    const totalPayroll = payrollRecords.reduce((sum, record) => sum + (record.net_salary || 0), 0)
    const averagePayroll = payrollRecords.length > 0 ? totalPayroll / payrollRecords.length : 0
    
    // Calculate real payroll growth by comparing current month to previous month
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const currentMonthRecords = payrollRecords.filter(record => {
      const recordDate = new Date(record.created_at || record.year, record.month - 1)
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear
    })
    const previousMonthRecords = payrollRecords.filter(record => {
      const recordDate = new Date(record.created_at || record.year, record.month - 1)
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
      return recordDate.getMonth() === prevMonth && recordDate.getFullYear() === prevYear
    })
    
    const currentMonthTotal = currentMonthRecords.reduce((sum, record) => sum + (record.net_salary || 0), 0)
    const previousMonthTotal = previousMonthRecords.reduce((sum, record) => sum + (record.net_salary || 0), 0)
    const payrollGrowth = previousMonthTotal > 0 ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100 : 0

    // Attendance metrics
    const presentCount = attendanceRecords.filter(a => a.status === 'present').length
    const attendanceRate = attendanceRecords.length > 0 
      ? Math.round((presentCount / attendanceRecords.length) * 100) 
      : 0

    return {
      departmentStats,
      topDepartment,
      activeDeployments,
      deploymentEfficiency,
      totalPayroll,
      averagePayroll,
      payrollGrowth: Math.round(payrollGrowth * 100) / 100,
      attendanceRate
    }
  }, [employees, deployments, payrollRecords, attendanceRecords])

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Employee Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Employee Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {Object.entries(metrics.departmentStats).slice(0, 4).map(([dept, count]) => (
              <div key={dept} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{dept}</span>
                  <span className="text-gray-600">{count} employees</span>
                </div>
                <Progress 
                  value={(count / employees.length) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
          
          {metrics.topDepartment && (
            <div className="pt-3 border-t">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Largest Department</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {metrics.topDepartment[0]} with {metrics.topDepartment[1]} employees
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deployment Efficiency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4" />
            Deployment Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {metrics.deploymentEfficiency}%
            </div>
            <p className="text-sm text-gray-600">Deployment Efficiency</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Active Deployments</span>
              <span className="font-medium">{metrics.activeDeployments}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Sites</span>
              <span className="font-medium">{deployments.length}</span>
            </div>
          </div>
          
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2">
              {metrics.deploymentEfficiency >= 80 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Excellent
                  </Badge>
                </>
              ) : metrics.deploymentEfficiency >= 60 ? (
                <>
                  <Target className="h-4 w-4 text-yellow-500" />
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Good
                  </Badge>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    Needs Attention
                  </Badge>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4" />
            Payroll Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Monthly Payroll</span>
              <span className="font-medium">USD ${metrics.totalPayroll.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Average Salary</span>
              <span className="font-medium">USD ${Math.round(metrics.averagePayroll).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Processed Records</span>
              <span className="font-medium">{payrollRecords.length}</span>
            </div>
          </div>
          
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-600">
                +{metrics.payrollGrowth}%
              </span>
              <span className="text-sm text-gray-600">vs last month</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Attendance Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {metrics.attendanceRate}%
            </div>
            <p className="text-sm text-gray-600">Overall Attendance Rate</p>
          </div>
          
          <Progress value={metrics.attendanceRate} className="h-3" />
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Present Days</span>
              <span className="font-medium text-green-600">
                {attendanceRecords.filter(a => a.status === 'present').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Absent Days</span>
              <span className="font-medium text-red-600">
                {attendanceRecords.filter(a => a.status === 'absent').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Late Arrivals</span>
              <span className="font-medium text-yellow-600">
                {attendanceRecords.filter(a => a.status === 'late').length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            Key Performance Indicators
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Employee Retention</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">94%</span>
                <TrendingUp className="h-3 w-3 text-green-500" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Site Coverage</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{metrics.deploymentEfficiency}%</span>
                {metrics.deploymentEfficiency >= 80 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Payroll Accuracy</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">99.8%</span>
                <TrendingUp className="h-3 w-3 text-green-500" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Response Time</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">2.3h</span>
                <TrendingDown className="h-3 w-3 text-green-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            Monthly Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">New Hires</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">+8</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  +15%
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">New Deployments</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">+5</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                  +12%
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Payroll Growth</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">+{metrics.payrollGrowth}%</span>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                  Healthy
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Attendance Rate</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{metrics.attendanceRate}%</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  Excellent
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
