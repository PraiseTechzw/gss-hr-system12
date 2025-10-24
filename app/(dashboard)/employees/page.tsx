import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, UserCheck, UserX, TrendingUp, Calendar, Briefcase } from "lucide-react"
import Link from "next/link"
import { EmployeeTable } from "@/components/employees/employee-table"

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string }
}) {
  const supabase = await createClient()

  // Build query with department join
  let query = supabase.from("employees").select("*, departments(name)").order("created_at", { ascending: false })

  // Apply filters
  if (searchParams.search) {
    query = query.or(
      `first_name.ilike.%${searchParams.search}%,last_name.ilike.%${searchParams.search}%,employee_id.ilike.%${searchParams.search}%,email.ilike.%${searchParams.search}%`,
    )
  }

  if (searchParams.status) {
    query = query.eq("status", searchParams.status)
  }

  const { data: employees, error } = await query

  if (error) {
    console.error("Error fetching employees:", error)
  }

  // Get comprehensive employee statistics
  const { count: activeCount } = await supabase
    .from("employees")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")

  const { count: inactiveCount } = await supabase
    .from("employees")
    .select("*", { count: "exact", head: true })
    .eq("status", "inactive")

  const { count: terminatedCount } = await supabase
    .from("employees")
    .select("*", { count: "exact", head: true })
    .eq("status", "terminated")

  // Get department statistics
  const { data: departmentStats } = await supabase
    .from("employees")
    .select("department_id, departments(name)")
    .eq("status", "active")

  const departmentCounts = departmentStats?.reduce((acc, emp) => {
    const dept = (emp.departments as any)?.name || "Unassigned"
    acc[dept] = (acc[dept] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Get recent hires (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { count: recentHires } = await supabase
    .from("employees")
    .select("*", { count: "exact", head: true })
    .gte("hire_date", thirtyDaysAgo.toISOString().split('T')[0])

  const totalEmployees = (activeCount || 0) + (inactiveCount || 0) + (terminatedCount || 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="mt-1 text-gray-500">Comprehensive employee database and analytics</p>
        </div>
        <Link href="/employees/new">
          <Button className="bg-[#a2141e] hover:bg-[#8a1119]">
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">{recentHires || 0}</span>
              <span className="text-gray-500 ml-1">new hires this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Employees</p>
                <p className="text-2xl font-bold text-green-600">{activeCount || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Active Rate</span>
                <span className="font-medium text-gray-900">
                  {totalEmployees > 0 ? Math.round(((activeCount || 0) / totalEmployees) * 100) : 0}%
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${totalEmployees > 0 ? ((activeCount || 0) / totalEmployees) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-yellow-600">{inactiveCount || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <UserX className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="text-yellow-700 border-yellow-200">
                {totalEmployees > 0 ? Math.round(((inactiveCount || 0) / totalEmployees) * 100) : 0}% of total
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-purple-600">{Object.keys(departmentCounts).length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Largest: {Object.entries(departmentCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      {Object.keys(departmentCounts).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(departmentCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 6)
                .map(([dept, count]) => (
                <div key={dept} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
                    <span className="font-medium text-gray-900">{dept}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" 
                        style={{ width: `${(count / Math.max(...Object.values(departmentCounts))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Status Overview */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="px-3 py-1 bg-green-50 text-green-700 border-green-200">
          <UserCheck className="mr-1 h-3 w-3" />
          Active: {activeCount || 0}
        </Badge>
        <Badge variant="outline" className="px-3 py-1 bg-yellow-50 text-yellow-700 border-yellow-200">
          <UserX className="mr-1 h-3 w-3" />
          Inactive: {inactiveCount || 0}
        </Badge>
        {(terminatedCount || 0) > 0 && (
          <Badge variant="outline" className="px-3 py-1 bg-red-50 text-red-700 border-red-200">
            Terminated: {terminatedCount}
          </Badge>
        )}
        <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
          <Calendar className="mr-1 h-3 w-3" />
          New This Month: {recentHires || 0}
        </Badge>
      </div>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeTable employees={employees || []} />
        </CardContent>
      </Card>
    </div>
  )
}
