"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, Map, Calendar } from "lucide-react"
import { DeploymentTable } from "./deployment-table"
import { DeploymentMap } from "./deployment-map"
import { DeploymentCalendar } from "./deployment-calendar"

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

type ViewMode = "table" | "map" | "calendar"

export function DeploymentViews({ deployments }: { deployments: Deployment[] }) {
  const [activeView, setActiveView] = useState<ViewMode>("table")

  const views = [
    { key: "table", label: "Table View", icon: Table },
    { key: "map", label: "Map View", icon: Map },
    { key: "calendar", label: "Calendar View", icon: Calendar },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Deployment Management</CardTitle>
          
          {/* View Toggle */}
          <div className="flex rounded-md border">
            {views.map((view) => {
              const ViewIcon = view.icon
              return (
                <Button
                  key={view.key}
                  variant={activeView === view.key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView(view.key as ViewMode)}
                  className={`
                    ${view.key === 'table' ? 'rounded-r-none' : ''}
                    ${view.key === 'calendar' ? 'rounded-l-none' : ''}
                    ${view.key === 'map' ? 'rounded-none' : ''}
                  `}
                >
                  <ViewIcon className="mr-2 h-4 w-4" />
                  {view.label}
                </Button>
              )
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activeView === "table" && <DeploymentTable deployments={deployments} />}
        {activeView === "map" && <DeploymentMap deployments={deployments} />}
        {activeView === "calendar" && <DeploymentCalendar deployments={deployments} />}
      </CardContent>
    </Card>
  )
}
