"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  UserPlus, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Clock,
  ArrowRight,
  Users
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface ActivityItem {
  type: string
  title: string
  description: string
  timestamp: string
  icon: string
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "employee":
      return Users
    case "deployment":
      return MapPin
    case "payroll":
      return DollarSign
    case "leave":
      return Calendar
    case "attendance":
      return Clock
    default:
      return Clock
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "employee":
      return "text-blue-600"
    case "deployment":
      return "text-green-600"
    case "payroll":
      return "text-purple-600"
    case "leave":
      return "text-orange-600"
    case "attendance":
      return "text-indigo-600"
    default:
      return "text-gray-600"
  }
}

const getTimeAgo = (timestamp: string) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActivity() {
      try {
        const supabase = createClient()
        
        // Fetch real data from system_activity table
        const { data, error } = await supabase
          .from('system_activity')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)
        
        if (error) {
          console.error("Error fetching activity:", error)
          setActivities([])
          return
        }
        
        if (data && data.length > 0) {
          const formattedActivities = data.map(activity => ({
            type: activity.action || 'system',
            title: activity.description || 'System activity',
            description: `Action: ${activity.action}`,
            timestamp: activity.created_at,
            icon: 'Clock'
          }))
          
          setActivities(formattedActivities)
        } else {
          // No data found - show empty state
          setActivities([])
        }
      } catch (error) {
        console.error("Error fetching recent activity:", error)
        setActivities([])
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [])

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Recent Activity
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Recent Activity
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">No recent activity</p>
            <p className="text-gray-400 text-xs mt-1">Activity will appear here as users interact with the system</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {activities.map((activity, index) => {
                const ActivityIcon = getActivityIcon(activity.type)
                const typeColor = getTypeColor(activity.type)
                return (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${typeColor}`}>
                      <ActivityIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.title}</p>
                        <Badge variant="outline" className="text-xs capitalize">
                          {activity.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{activity.description}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{getTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <button className="text-sm text-[#a2141e] dark:text-red-400 hover:underline font-medium">
                View all activity
              </button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
