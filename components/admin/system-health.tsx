'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  Database, 
  Server, 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  RefreshCw,
  Activity,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { toast } from 'sonner'

interface SystemHealth {
  database: {
    status: 'healthy' | 'warning' | 'error'
    responseTime: number
    connections: number
    lastBackup: string
  }
  authentication: {
    status: 'healthy' | 'warning' | 'error'
    activeUsers: number
    failedLogins: number
    lastActivity: string
  }
  payroll: {
    status: 'healthy' | 'warning' | 'error'
    lastCalculation: string
    zimraCompliance: boolean
    nssaCompliance: boolean
  }
  system: {
    uptime: string
    memoryUsage: number
    cpuUsage: number
    diskUsage: number
  }
}

export default function SystemHealth() {
  const [health, setHealth] = useState<SystemHealth>({
    database: {
      status: 'healthy',
      responseTime: 45,
      connections: 12,
      lastBackup: '2 hours ago'
    },
    authentication: {
      status: 'healthy',
      activeUsers: 8,
      failedLogins: 2,
      lastActivity: '5 minutes ago'
    },
    payroll: {
      status: 'healthy',
      lastCalculation: '1 hour ago',
      zimraCompliance: true,
      nssaCompliance: true
    },
    system: {
      uptime: '15 days, 3 hours',
      memoryUsage: 68,
      cpuUsage: 23,
      diskUsage: 45
    }
  })
  const [loading, setLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState(new Date())

  const checkSystemHealth = async () => {
    try {
      setLoading(true)
      
      // In a real implementation, you would check actual system health
      // For now, we'll simulate the check
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setLastChecked(new Date())
      toast.success('System health checked successfully')
    } catch (error) {
      console.error('Error checking system health:', error)
      toast.error('Failed to check system health')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Activity className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getUsageColor = (usage: number) => {
    if (usage < 50) return 'text-green-600'
    if (usage < 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getUsageIcon = (usage: number) => {
    if (usage < 50) return <TrendingDown className="h-4 w-4 text-green-600" />
    if (usage < 80) return <Activity className="h-4 w-4 text-yellow-600" />
    return <TrendingUp className="h-4 w-4 text-red-600" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Health</h2>
          <p className="text-gray-600 mt-1">
            Monitor system performance and component status
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last checked: {lastChecked.toLocaleTimeString()}
          </div>
          <Button onClick={checkSystemHealth} disabled={loading} size="sm">
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">Check Health</span>
          </Button>
        </div>
      </div>

      {/* Core Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Database Health */}
        <Card className={`${getStatusColor(health.database.status)}`}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-600" />
              <span>Database</span>
              {getStatusIcon(health.database.status)}
            </CardTitle>
            <CardDescription>
              Database connection and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                {getStatusBadge(health.database.status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="text-sm font-medium">{health.database.responseTime}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Connections</span>
                <span className="text-sm font-medium">{health.database.connections}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Backup</span>
                <span className="text-sm font-medium">{health.database.lastBackup}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Health */}
        <Card className={`${getStatusColor(health.authentication.status)}`}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span>Authentication</span>
              {getStatusIcon(health.authentication.status)}
            </CardTitle>
            <CardDescription>
              User authentication and security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                {getStatusBadge(health.authentication.status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="text-sm font-medium">{health.authentication.activeUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Failed Logins (24h)</span>
                <span className="text-sm font-medium">{health.authentication.failedLogins}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Activity</span>
                <span className="text-sm font-medium">{health.authentication.lastActivity}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payroll Health */}
        <Card className={`${getStatusColor(health.payroll.status)}`}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-purple-600" />
              <span>Payroll System</span>
              {getStatusIcon(health.payroll.status)}
            </CardTitle>
            <CardDescription>
              Payroll processing and compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                {getStatusBadge(health.payroll.status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Calculation</span>
                <span className="text-sm font-medium">{health.payroll.lastCalculation}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">ZIMRA Compliance</span>
                <Badge variant={health.payroll.zimraCompliance ? "default" : "destructive"}>
                  {health.payroll.zimraCompliance ? "Compliant" : "Non-compliant"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">NSSA Compliance</span>
                <Badge variant={health.payroll.nssaCompliance ? "default" : "destructive"}>
                  {health.payroll.nssaCompliance ? "Compliant" : "Non-compliant"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5 text-gray-600" />
            <span>System Resources</span>
          </CardTitle>
          <CardDescription>
            Server performance and resource utilization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Uptime</span>
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-lg font-semibold">{health.system.uptime}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Memory Usage</span>
                {getUsageIcon(health.system.memoryUsage)}
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(health.system.memoryUsage)}`}
                    style={{ width: `${health.system.memoryUsage}%` }}
                  ></div>
                </div>
                <span className={`text-sm font-medium ${getUsageColor(health.system.memoryUsage)}`}>
                  {health.system.memoryUsage}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">CPU Usage</span>
                {getUsageIcon(health.system.cpuUsage)}
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(health.system.cpuUsage)}`}
                    style={{ width: `${health.system.cpuUsage}%` }}
                  ></div>
                </div>
                <span className={`text-sm font-medium ${getUsageColor(health.system.cpuUsage)}`}>
                  {health.system.cpuUsage}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Disk Usage</span>
                {getUsageIcon(health.system.diskUsage)}
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(health.system.diskUsage)}`}
                    style={{ width: `${health.system.diskUsage}%` }}
                  ></div>
                </div>
                <span className={`text-sm font-medium ${getUsageColor(health.system.diskUsage)}`}>
                  {health.system.diskUsage}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span>Overall System Status</span>
          </CardTitle>
          <CardDescription>
            Complete system health summary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-lg font-semibold text-green-900">All Systems Operational</p>
                <p className="text-sm text-green-700">Your HR system is running smoothly</p>
              </div>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Healthy
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
