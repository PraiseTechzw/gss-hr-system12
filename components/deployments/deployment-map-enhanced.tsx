"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Navigation, Users, Building, Clock, DollarSign, Search, Filter, Eye, Maximize2, Minimize2, Layers, Target, ZoomIn, ZoomOut } from "lucide-react"
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

// Enhanced coordinate generation with better distribution
const getMockCoordinates = (location: string, index: number) => {
  // Base coordinates for Harare, Zimbabwe
  const baseLatitude = -17.8292
  const baseLongitude = 31.0522
  
  // Better distribution using hash-like function
  const hash = location.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  const latOffset = (Math.abs(hash) % 20) * 0.005 - 0.05
  const lngOffset = (index % 20) * 0.005 - 0.05
  
  return {
    latitude: baseLatitude + latOffset,
    longitude: baseLongitude + lngOffset
  }
}

export function DeploymentMap({ deployments }: { deployments: Deployment[] }) {
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null)
  const [mapView, setMapView] = useState<'standard' | 'satellite' | 'terrain'>('standard')
  const [showCluster, setShowCluster] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(10)

  // Group deployments by location for clustering
  const locationGroups = useMemo(() => {
    const groups = new Map<string, Deployment[]>()
    
    deployments.forEach(deployment => {
      const key = deployment.site_location
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(deployment)
    })
    
    return Array.from(groups.entries()).map(([location, deployments]) => ({
      location,
      deployments,
      coordinates: getMockCoordinates(location, deployments[0].id.length),
      count: deployments.length
    }))
  }, [deployments])

  // Calculate map statistics
  const mapStats = useMemo(() => {
    const totalLocations = locationGroups.length
    const totalEmployees = deployments.length
    const activeDeployments = deployments.filter(d => d.status === 'active').length
    
    const totalRevenue = deployments.reduce((sum, d) => {
      if (d.monthly_salary) return sum + d.monthly_salary
      if (d.daily_rate) return sum + (d.daily_rate * 30)
      return sum
    }, 0)

    return {
      totalLocations,
      totalEmployees,
      activeDeployments,
      totalRevenue
    }
  }, [deployments, locationGroups])

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
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-4' : ''}`}>
      {/* Map Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-300">Locations</p>
                <p className="text-lg font-bold">{mapStats.totalLocations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-300">Employees</p>
                <p className="text-lg font-bold">{mapStats.totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-300">Active</p>
                <p className="text-lg font-bold">{mapStats.activeDeployments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-300">Revenue</p>
                <p className="text-lg font-bold">${mapStats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Deployment Locations
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Map Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-gray-500" />
              <Select value={mapView} onValueChange={(value: any) => setMapView(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="satellite">Satellite</SelectItem>
                  <SelectItem value="terrain">Terrain</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomLevel(Math.min(zoomLevel + 1, 20))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-300">{zoomLevel}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomLevel(Math.max(zoomLevel - 1, 1))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant={showCluster ? "default" : "outline"}
              size="sm"
              onClick={() => setShowCluster(!showCluster)}
            >
              <Target className="h-4 w-4 mr-1" />
              Cluster
            </Button>
          </div>

          {/* Mock Map Container */}
          <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden" style={{ height: isFullscreen ? 'calc(100vh - 200px)' : '500px' }}>
            {/* Map Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 opacity-50" />
            
            {/* Map Markers */}
            {locationGroups.map((group, index) => (
              <div
                key={group.location}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{
                  left: `${50 + (group.coordinates.longitude - 31.0522) * 1000}px`,
                  top: `${50 + (group.coordinates.latitude + 17.8292) * 1000}px`,
                }}
                onClick={() => setSelectedDeployment(group.deployments[0])}
              >
                <div className="relative">
                  {/* Cluster Marker */}
                  {showCluster && group.count > 1 ? (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg hover:scale-110 transition-transform">
                      {group.count}
                    </div>
                  ) : (
                    <div className={`w-4 h-4 rounded-full ${getTypeColor(group.deployments[0].deployment_type)} shadow-lg hover:scale-125 transition-transform`} />
                  )}
                  
                  {/* Location Label */}
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs shadow-lg whitespace-nowrap">
                    {group.location}
                  </div>
                </div>
              </div>
            ))}

            {/* Map Center Indicator */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg">
              <h4 className="text-sm font-medium mb-2">Deployment Types</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-xs">Permanent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="text-xs">Temporary</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-xs">Contract</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-xs">Emergency</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Deployment Details */}
          {selectedDeployment && (
            <Card className="mt-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{selectedDeployment.client_name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDeployment(null)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Location Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{selectedDeployment.site_location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span>{selectedDeployment.deployment_type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(selectedDeployment.status)}>
                          {selectedDeployment.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Employee Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{selectedDeployment.employees.first_name} {selectedDeployment.employees.last_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{getShiftSummary(selectedDeployment.shift_timing || '').summary}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span>
                          {selectedDeployment.monthly_salary 
                            ? `$${selectedDeployment.monthly_salary.toLocaleString()}/mo`
                            : selectedDeployment.daily_rate 
                            ? `$${selectedDeployment.daily_rate}/day`
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Link href={`/deployments/${selectedDeployment.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/deployments/${selectedDeployment.id}/edit`}>
                    <Button size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
