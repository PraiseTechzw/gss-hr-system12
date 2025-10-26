"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Navigation, Users, Building, Clock, DollarSign, Search, Filter, Eye, Maximize2, Minimize2, Layers, Target } from "lucide-react"
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

// Mock coordinates for demonstration - in a real app, you'd geocode addresses
const getMockCoordinates = (location: string, index: number) => {
  // Base coordinates for Harare, Zimbabwe
  const baseLatitude = -17.8292
  const baseLongitude = 31.0522
  
  // Add some variation based on location name and index
  const latOffset = (location.length % 10) * 0.01 - 0.05
  const lngOffset = (index % 10) * 0.01 - 0.05
  
  return {
    latitude: baseLatitude + latOffset,
    longitude: baseLongitude + lngOffset
  }
}

export function DeploymentMap({ deployments }: { deployments: Deployment[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null)
  const [mapCenter, setMapCenter] = useState({ lat: -17.8292, lng: 31.0522 })
  const [zoomLevel, setZoomLevel] = useState(12)

  // Filter deployments
  const filteredDeployments = useMemo(() => {
    return deployments.filter((deployment) => {
      const matchesSearch = 
        deployment.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deployment.site_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deployment.employees.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deployment.employees.last_name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || deployment.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [deployments, searchTerm, statusFilter])

  // Add coordinates to deployments
  const deploymentsWithCoords = useMemo(() => {
    return filteredDeployments.map((deployment, index) => ({
      ...deployment,
      coordinates: getMockCoordinates(deployment.site_location, index)
    }))
  }, [filteredDeployments])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "completed":
        return "bg-blue-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search deployments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{filteredDeployments.length} locations</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Deployment Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mock Map Container */}
              <div className="relative h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
                {/* Map Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
                  {/* Grid Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="grid grid-cols-8 grid-rows-6 h-full">
                      {Array.from({ length: 48 }).map((_, i) => (
                        <div key={i} className="border border-gray-300"></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Mock Roads */}
                  <div className="absolute top-1/3 left-0 right-0 h-1 bg-gray-400"></div>
                  <div className="absolute top-2/3 left-0 right-0 h-1 bg-gray-400"></div>
                  <div className="absolute top-0 bottom-0 left-1/4 w-1 bg-gray-400"></div>
                  <div className="absolute top-0 bottom-0 left-3/4 w-1 bg-gray-400"></div>
                  
                  {/* Deployment Markers */}
                  {deploymentsWithCoords.map((deployment, index) => {
                    const x = ((deployment.coordinates.longitude + 31.1) * 400) % 100
                    const y = ((deployment.coordinates.latitude + 17.9) * 300) % 100
                    
                    return (
                      <div
                        key={deployment.id}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110 ${
                          selectedDeployment?.id === deployment.id ? 'scale-125 z-10' : ''
                        }`}
                        style={{
                          left: `${20 + (x * 0.6)}%`,
                          top: `${20 + (y * 0.6)}%`
                        }}
                        onClick={() => setSelectedDeployment(deployment)}
                      >
                        <div className="relative">
                          <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${getStatusDotColor(deployment.status)}`}></div>
                          {selectedDeployment?.id === deployment.id && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                              {deployment.client_name}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Map Controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white"
                    onClick={() => setZoomLevel(prev => Math.min(18, prev + 1))}
                  >
                    +
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white"
                    onClick={() => setZoomLevel(prev => Math.max(8, prev - 1))}
                  >
                    -
                  </Button>
                </div>
                
                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
                  <h4 className="text-sm font-medium mb-2">Status</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Active</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>Pending</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Completed</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Cancelled</span>
                    </div>
                  </div>
                </div>

                {/* Center Marker (Harare) */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
                    Harare CBD
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center text-sm text-gray-500">
                <p>Interactive map showing deployment locations across Harare</p>
                <p className="text-xs mt-1">Click on markers to view deployment details</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deployment Details */}
        <div className="space-y-4">
          {selectedDeployment ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Deployment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{selectedDeployment.client_name}</h3>
                  <Badge variant="secondary" className={getStatusColor(selectedDeployment.status)}>
                    {selectedDeployment.status}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{selectedDeployment.site_location}</p>
                      <p className="text-xs text-gray-500">Deployment Location</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">
                        {selectedDeployment.employees.first_name} {selectedDeployment.employees.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{selectedDeployment.employees.job_title}</p>
                    </div>
                  </div>
                  
                  {selectedDeployment.shift_timing && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{selectedDeployment.shift_timing}</p>
                        <p className="text-xs text-gray-500">Shift Timing</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">
                        {selectedDeployment.monthly_salary
                          ? `USD $${selectedDeployment.monthly_salary.toLocaleString()}/month`
                          : selectedDeployment.daily_rate
                            ? `USD $${selectedDeployment.daily_rate.toLocaleString()}/day`
                            : "Not specified"}
                      </p>
                      <p className="text-xs text-gray-500">Compensation</p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500 mb-1">Deployment Period</p>
                    <p className="text-sm">
                      {new Date(selectedDeployment.start_date).toLocaleDateString()}
                      {selectedDeployment.end_date && (
                        <> - {new Date(selectedDeployment.end_date).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Link href={`/deployments/${selectedDeployment.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/deployments/${selectedDeployment.id}/edit`} className="flex-1">
                    <Button size="sm" className="w-full bg-[#a2141e] hover:bg-[#8a1119]">
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Deployment</h3>
                <p className="text-sm text-gray-500">
                  Click on a marker on the map to view deployment details
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Location Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Locations:</span>
                  <span className="font-medium">{filteredDeployments.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Sites:</span>
                  <span className="font-medium text-green-600">
                    {filteredDeployments.filter(d => d.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending Sites:</span>
                  <span className="font-medium text-yellow-600">
                    {filteredDeployments.filter(d => d.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Unique Clients:</span>
                  <span className="font-medium">
                    {new Set(filteredDeployments.map(d => d.client_name)).size}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
