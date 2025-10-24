import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Calendar, Briefcase, CreditCard, User, Shield, Clock } from "lucide-react"
import { notFound } from "next/navigation"
import { EmployeeProfileHeader } from "@/components/employees/employee-profile-header"

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: employee, error } = await supabase.from("employees").select("*").eq("id", params.id).single()

  if (error || !employee) {
    notFound()
  }

  // Get related data
  const { data: deployments } = await supabase
    .from("deployments")
    .select("*")
    .eq("employee_id", params.id)
    .order("start_date", { ascending: false })

  const { data: leaveRequests } = await supabase
    .from("leave_requests")
    .select("*")
    .eq("employee_id", params.id)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <EmployeeProfileHeader employee={employee} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Date of Birth</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString() : "N/A"}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Gender</p>
                  <p className="text-gray-900">{employee.gender || "N/A"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Emergency Contact</p>
                  <div className="space-y-1">
                    <p className="text-gray-900 font-medium">{employee.emergency_contact_name || "N/A"}</p>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-3 w-3" />
                      <span className="text-sm">{employee.emergency_contact_phone || "N/A"}</span>
                    </div>
                    <p className="text-sm text-gray-500">{employee.emergency_contact_relationship || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-gray-500 mb-2">Address</p>
              <div className="flex items-start gap-2 text-gray-900">
                <MapPin className="mt-0.5 h-4 w-4 text-gray-400 flex-shrink-0" />
                <span>
                  {employee.address && employee.city
                    ? `${employee.address}, ${employee.city}, ${employee.state} ${employee.postal_code}`
                    : "No address provided"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="h-12 w-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {deployments?.filter((d) => d.status === "active").length || 0}
              </p>
              <p className="text-sm text-gray-600">Active Deployments</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="h-12 w-12 mx-auto rounded-full bg-purple-100 flex items-center justify-center mb-2">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">{leaveRequests?.length || 0}</p>
              <p className="text-sm text-gray-600">Leave Requests</p>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Hired on {new Date(employee.hire_date).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-orange-600" />
              Employment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-sm font-medium text-orange-800 mb-1">Position</p>
                <p className="text-lg font-semibold text-orange-900">{employee.job_title}</p>
                <p className="text-sm text-orange-600">{employee.department || "No Department"}</p>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-500">Start Date</span>
                <span className="font-medium">{new Date(employee.hire_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500">Employee ID</span>
                <Badge variant="outline">{employee.employee_id}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank & IDs (Zimbabwe) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-1">Bank Details</p>
                <p className="font-semibold text-green-900">{employee.bank_name || "Not provided"}</p>
                <div className="grid gap-2 md:grid-cols-2 mt-2">
                  <div className="text-sm text-green-700">
                    <span className="block text-xs uppercase text-green-800/80">Nostro (USD)</span>
                    <span className="font-mono">
                      {employee.nostro_account_number
                        ? `****${String(employee.nostro_account_number).slice(-4)}`
                        : employee.account_number
                          ? `****${String(employee.account_number).slice(-4)}`
                          : "N/A"}
                    </span>
                  </div>
                  <div className="text-sm text-green-700">
                    <span className="block text-xs uppercase text-green-800/80">ZWL Account</span>
                    <span className="font-mono">
                      {employee.zwl_account_number ? `****${String(employee.zwl_account_number).slice(-4)}` : "N/A"}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-2">
                  {employee.branch_code || employee.ifsc_code ? `Branch Code: ${employee.branch_code || employee.ifsc_code}` : "No branch code"}
                </p>
              </div>
              
              <div className="grid gap-2">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-500">National ID</span>
                  <span className="font-mono text-sm">{employee.pan_number || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">NSSA Number</span>
                  <span className="font-mono text-sm">{employee.aadhar_number || "N/A"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Deployments */}
      {deployments && deployments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Recent Deployments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {deployments.slice(0, 6).map((deployment) => (
                <div key={deployment.id} className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{deployment.client_name}</h4>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {deployment.site_location}
                      </p>
                    </div>
                    <Badge 
                      variant={deployment.status === "active" ? "default" : "secondary"}
                      className={
                        deployment.status === "active" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {deployment.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    Started: {new Date(deployment.start_date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
            {deployments.length > 6 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Showing 6 of {deployments.length} deployments
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Deployments State */}
      {(!deployments || deployments.length === 0) && (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Deployments</h3>
            <p className="text-gray-500">This employee has no deployment history.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
