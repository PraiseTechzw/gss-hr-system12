"use client"

import { useState, useEffect } from "react"
// Supabase client removed

export function useSidebarCounts() {
  const [counts, setCounts] = useState({
    employees: 0,
    deployments: 0,
    pendingLeaves: 0,
    loading: true
  })

  useEffect(() => {
    async function fetchCounts() {
      try {
        const supabase = createClient()
        
        const [
          { count: employeeCount },
          { count: deploymentCount },
          { count: leaveCount }
        ] = await Promise.all([
          supabase.from("employees").select("*", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("deployments").select("*", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("leave_requests").select("*", { count: "exact", head: true }).eq("status", "pending")
        ])

        setCounts({
          employees: employeeCount || 0,
          deployments: deploymentCount || 0,
          pendingLeaves: leaveCount || 0,
          loading: false
        })
      } catch (error) {
        console.error("Error fetching sidebar counts:", error)
        setCounts(prev => ({ ...prev, loading: false }))
      }
    }

    fetchCounts()
    
    // Set up real-time subscriptions for live updates
    let employeeSubscription: any = null
    let deploymentSubscription: any = null
    let leaveSubscription: any = null
    
    try {
      const supabase = createClient()
      
      employeeSubscription = supabase
        .channel('employees-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, () => {
          fetchCounts()
        })
        .subscribe()

      deploymentSubscription = supabase
        .channel('deployments-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'deployments' }, () => {
          fetchCounts()
        })
        .subscribe()

      leaveSubscription = supabase
        .channel('leave-requests-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'leave_requests' }, () => {
          fetchCounts()
        })
        .subscribe()
    } catch (error) {
      console.error("Error setting up subscriptions:", error)
    }

    return () => {
      if (employeeSubscription) employeeSubscription.unsubscribe()
      if (deploymentSubscription) deploymentSubscription.unsubscribe()
      if (leaveSubscription) leaveSubscription.unsubscribe()
    }
  }, [])

  return counts
}
