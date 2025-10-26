"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface SidebarData {
  employees: number
  deployments: number
  pendingLeaves: number
  payrollRecords: number
  users: number
  departments: number
  recentActivity: number
  loading: boolean
  error: string | null
}

export function useSidebarData() {
  const [data, setData] = useState<SidebarData>({
    employees: 0,
    deployments: 0,
    pendingLeaves: 0,
    payrollRecords: 0,
    users: 0,
    departments: 0,
    recentActivity: 0,
    loading: true,
    error: null
  })

  useEffect(() => {
    async function fetchSidebarData() {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }))
        const supabase = createClient()
        
        const [
          { count: employeeCount },
          { count: deploymentCount },
          { count: leaveCount },
          { count: payrollCount },
          { count: userCount },
          { count: departmentCount },
          { count: activityCount }
        ] = await Promise.all([
          supabase.from("employees").select("*", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("deployments").select("*", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("leave_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("payroll").select("*", { count: "exact", head: true }).eq("payment_status", "pending"),
          supabase.from("user_profiles").select("*", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("departments").select("*", { count: "exact", head: true }),
          supabase.from("system_activity").select("*", { count: "exact", head: true })
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        ])

        setData({
          employees: employeeCount || 0,
          deployments: deploymentCount || 0,
          pendingLeaves: leaveCount || 0,
          payrollRecords: payrollCount || 0,
          users: userCount || 0,
          departments: departmentCount || 0,
          recentActivity: activityCount || 0,
          loading: false,
          error: null
        })
      } catch (error) {
        console.error("Error fetching sidebar data:", error)
        setData(prev => ({ 
          ...prev, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }))
      }
    }

    fetchSidebarData()
    
    // Set up real-time subscriptions for live updates
    let subscriptions: any[] = []
    
    try {
      const supabase = createClient()
      
      // Subscribe to all relevant table changes
      const tables = ['employees', 'deployments', 'leave_requests', 'payroll', 'user_profiles', 'departments', 'system_activity']
      
      tables.forEach(table => {
        const subscription = supabase
          .channel(`${table}-changes`)
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: table 
          }, () => {
            fetchSidebarData()
          })
          .subscribe()
        
        subscriptions.push(subscription)
      })
    } catch (error) {
      console.error("Error setting up subscriptions:", error)
    }

    return () => {
      subscriptions.forEach(subscription => {
        if (subscription) subscription.unsubscribe()
      })
    }
  }, [])

  return data
}
