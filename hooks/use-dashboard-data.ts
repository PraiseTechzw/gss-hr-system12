"use client"

import { useState, useEffect } from 'react'

export interface DashboardData {
  stats: {
    employees: {
      total: number
      active: number
      inactive: number
      terminated: number
      recentHires: number
      activeRate: number
    }
    departments: {
      total: number
      breakdown: Record<string, number>
    }
    users: {
      total: number
      active: number
    }
    deployments: {
      total: number
      active: number
    }
    attendance: {
      presentDays: number
      absentDays: number
      lateDays: number
      totalDays: number
      attendanceRate: number
    }
    payroll: {
      totalPayroll: number
      monthlyGrowth: string
      recordCount: number
    }
    leaveRequests: {
      total: number
      pending: number
    }
  }
  recentActivity: Array<{
    id: string
    action_type: string
    description: string
    created_at: string
    user_id?: string
  }>
  timestamp: string
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/dashboard/stats', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setData(result)
      } else {
        throw new Error(result.error || 'Failed to fetch dashboard data')
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const refresh = () => {
    fetchData()
  }

  return {
    data,
    loading,
    error,
    refresh
  }
}
