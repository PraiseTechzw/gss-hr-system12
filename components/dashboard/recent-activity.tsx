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
        const { data, error } = await supabase
          .from('system_activity')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)
        
        if (error) {
          console.error("Error fetching activity:", error)
          return
        }
        
        const formattedActivities = data?.map(activity => ({
          type: activity.action_type || 'system',
          title: activity.description || 'System activity',
          description: `Action: ${activity.action_type}`,
          timestamp: activity.created_at,
          icon: 'Clock'
        })) || []
        
        setActivities(formattedActivities)
      } catch (error) {
        console.error("Error fetching recent activity:", error)
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
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
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
        <div className="space-y-3">
          {activities.map((activity, index) => {
            const ActivityIcon = getActivityIcon(activity.type)
            const typeColor = getTypeColor(activity.type)
            return (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50/50 transition-colors">
                <div className={`p-2 rounded-lg bg-gray-100 ${typeColor}`}>
                  <ActivityIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <Badge variant="outline" className="text-xs capitalize">
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400">{getTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="pt-2 border-t">
          <button className="text-sm text-[#a2141e] hover:underline font-medium">
            View all activity
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
