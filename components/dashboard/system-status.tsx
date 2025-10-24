import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Database, 
  Shield, 
  Cloud, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getSystemSettings } from "@/lib/database-utils"

const getStatusColor = (status: string) => {
  switch (status) {
    case "connected":
    case "active":
    case "completed":
    case "normal":
      return "bg-green-100 text-green-800 border-green-200"
    case "warning":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "error":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "connected":
    case "active":
    case "completed":
    case "normal":
      return CheckCircle
    case "warning":
    case "error":
      return AlertCircle
    default:
      return CheckCircle
  }
}

export async function SystemStatus() {
  const settings = await getSystemSettings()

  const items = [
    {
      name: "Database",
      status: "connected",
      icon: Database,
      description: `${settings.totalEmployees} employees, ${settings.activeUsers} admins`,
      lastChecked: "Just now",
    },
    {
      name: "Authentication",
      status: settings.activeUsers > 0 ? "active" : "warning",
      icon: Shield,
      description: settings.activeUsers > 0 ? "Sessions healthy" : "No active admins detected",
      lastChecked: "Just now",
    },
    {
      name: "Cloud Storage",
      status: "connected",
      icon: Cloud,
      description: `Storage approx. ${settings.databaseSize}`,
      lastChecked: "Today",
    },
    {
      name: "Last Backup",
      status: "completed",
      icon: Clock,
      description: new Date(settings.lastBackup).toLocaleString(),
      lastChecked: "—",
    },
    {
      name: "System Version",
      status: "normal",
      icon: Activity,
      description: `v${settings.systemVersion}`,
      lastChecked: settings.timezone,
    },
  ]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          System Status
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => {
          const StatusIcon = getStatusIcon(item.status)
          return (
            <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white shadow-sm">
                  <item.icon className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getStatusColor(item.status))}
                >
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {item.status}
                </Badge>
                <div className="text-xs text-gray-400 mt-1">{item.lastChecked}</div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
