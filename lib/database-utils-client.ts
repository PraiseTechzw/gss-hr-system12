"use client"

import { createClient } from "@/lib/supabase/client"

// Client-side database utility functions for real-time data

export async function getRecentActivity() {
  const supabase = createClient()
  
  try {
    const [
      { data: recentEmployees },
      { data: recentDeployments },
      { data: recentPayroll },
      { data: recentLeaves }
    ] = await Promise.all([
      supabase.from("employees").select("first_name, last_name, created_at").order("created_at", { ascending: false }).limit(3),
      supabase.from("deployments").select("client_name, created_at").order("created_at", { ascending: false }).limit(3),
      supabase.from("payroll").select("*, employees(first_name, last_name)").order("created_at", { ascending: false }).limit(3),
      supabase.from("leave_requests").select("*, employees(first_name, last_name)").order("created_at", { ascending: false }).limit(3)
    ])

    const activities = []

    // Add recent employees
    recentEmployees?.forEach(emp => {
      activities.push({
        type: 'employee',
        title: 'New Employee Added',
        description: `${emp.first_name} ${emp.last_name} joined the team`,
        timestamp: emp.created_at,
        icon: 'Users'
      })
    })

    // Add recent deployments
    recentDeployments?.forEach(dep => {
      activities.push({
        type: 'deployment',
        title: 'New Deployment Created',
        description: `Assignment to ${dep.client_name}`,
        timestamp: dep.created_at,
        icon: 'MapPin'
      })
    })

    // Add recent payroll
    recentPayroll?.forEach(pay => {
      activities.push({
        type: 'payroll',
        title: 'Payroll Processed',
        description: `${pay.employees?.first_name} ${pay.employees?.last_name} - USD $${pay.net_salary}`,
        timestamp: pay.created_at,
        icon: 'DollarSign'
      })
    })

    // Add recent leaves
    recentLeaves?.forEach(leave => {
      activities.push({
        type: 'leave',
        title: 'Leave Request',
        description: `${leave.employees?.first_name} ${leave.employees?.last_name} - ${leave.leave_type}`,
        timestamp: leave.created_at,
        icon: 'Calendar'
      })
    })

    // Sort by timestamp and return top 10
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return []
  }
}

export function getTimeAgo(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays < 7) return `${diffDays} days ago`
  
  return new Date(date).toLocaleDateString('en-GB')
}
