import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, MapPin, Users, Calendar, Clock, TrendingUp, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { DeploymentViews } from "@/components/deployments/deployment-views"

export default async function DeploymentsPage() {
  const supabase = await createClient()

  // Fetch deployments with employee information
  const { data: deployments, error } = await supabase
    .from("deployments")
    .select(
      `
      *,
      employees (
        id,
        employee_id,
        first_name,
        last_name,
        email,
        job_title
      )
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching deployments:", error)
  }

  // Get comprehensive deployment statistics
  const [
    { count: activeCount },
    { count: completedCount },
    { count: cancelledCount },
    { count: pendingCount },
    { data: recentDeployments },
    { data: siteStats },
    { data: upcomingDeployments }
  ] = await Promise.all([
    supabase.from("deployments").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("deployments").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("deployments").select("*", { count: "exact", head: true }).eq("status", "cancelled"),
    supabase.from("deployments").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("deployments").select("*, employees(first_name, last_name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("deployments").select("site_name").eq("status", "active"),
    supabase.from("deployments").select("*, employees(first_name, last_name)").gte("start_date", new Date().toISOString().split('T')[0]).order("start_date", { ascending: true }).limit(5)
  ])

  // Calculate additional metrics
  const totalDeployments = (activeCount || 0) + (completedCount || 0) + (cancelledCount || 0) + (pendingCount || 0)
  const activeSites = [...new Set(siteStats?.map(d => d.site_name))].length
  const completionRate = totalDeployments > 0 ? Math.round(((completedCount || 0) / totalDeployments) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deployments</h1>
          <p className="mt-1 text-gray-500">Manage employee deployments and assignments</p>
        </div>
        <Link href="/deployments/new">
          <Button className="bg-[#a2141e] hover:bg-[#8a1119]">
            <Plus className="mr-2 h-4 w-4" />
            New Deployment
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Deployments</p>
                <p className="text-2xl font-bold text-gray-900">{activeCount || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">{pendingCount || 0}</span>
              <span className="text-gray-500 ml-1">pending start</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sites</p>
                <p className="text-2xl font-bold text-gray-900">{activeSites}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Users className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-blue-600 font-medium">{activeCount || 0}</span>
              <span className="text-gray-500 ml-1">guards deployed</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-purple-500 mr-1" />
              <span className="text-purple-600 font-medium">{completedCount || 0}</span>
              <span className="text-gray-500 ml-1">completed</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deployments</p>
                <p className="text-2xl font-bold text-gray-900">{totalDeployments}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <XCircle className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-red-600 font-medium">{cancelledCount || 0}</span>
              <span className="text-gray-500 ml-1">cancelled</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Status Overview</h3>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">Active</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {activeCount || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-gray-600">Pending</span>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {pendingCount || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-600">Completed</span>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {completedCount || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-600">Cancelled</span>
                </div>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {cancelledCount || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Deployments</h3>
              <AlertTriangle className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {recentDeployments?.slice(0, 4).map((deployment: any) => (
                <div key={deployment.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {deployment.employees?.first_name} {deployment.employees?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{deployment.site_name}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      deployment.status === 'active' ? 'border-green-200 text-green-700' :
                      deployment.status === 'pending' ? 'border-yellow-200 text-yellow-700' :
                      deployment.status === 'completed' ? 'border-blue-200 text-blue-700' :
                      'border-red-200 text-red-700'
                    }
                  >
                    {deployment.status}
                  </Badge>
                </div>
              )) || (
                <p className="text-sm text-gray-500">No recent deployments</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Deployments</h3>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {upcomingDeployments?.slice(0, 4).map((deployment: any) => (
                <div key={deployment.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {deployment.employees?.first_name} {deployment.employees?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(deployment.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-900">{deployment.site_name}</p>
                    <p className="text-xs text-gray-500">{deployment.shift_type}</p>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-gray-500">No upcoming deployments</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <DeploymentViews deployments={deployments || []} />
    </div>
  )
}
