import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Pencil, MapPin, Calendar, DollarSign, Clock, FileText } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function DeploymentDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: deployment, error } = await supabase
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
        phone,
        job_title,
        department
      )
    `,
    )
    .eq("id", params.id)
    .single()

  if (error || !deployment) {
    notFound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "completed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/deployments">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{deployment.client_name}</h1>
            <p className="mt-1 text-gray-500">{deployment.site_location}</p>
          </div>
        </div>
        <Link href={`/deployments/${params.id}/edit`}>
          <Button className="bg-[#a2141e] hover:bg-[#8a1119]">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Deployment
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Deployment Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Deployment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Client Name</p>
                <p className="mt-1 text-gray-900">{deployment.client_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <Badge className={`mt-1 ${getStatusColor(deployment.status)}`} variant="secondary">
                  {deployment.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Site Location</p>
                <div className="mt-1 flex items-center gap-2 text-gray-900">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {deployment.site_location}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Deployment Type</p>
                <Badge className="mt-1" variant="outline">
                  {deployment.deployment_type}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Start Date</p>
                <div className="mt-1 flex items-center gap-2 text-gray-900">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {new Date(deployment.start_date).toLocaleDateString()}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">End Date</p>
                <div className="mt-1 flex items-center gap-2 text-gray-900">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {deployment.end_date ? new Date(deployment.end_date).toLocaleDateString() : "Ongoing"}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Shift Timing</p>
                <div className="mt-1 flex items-center gap-2 text-gray-900">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {deployment.shift_timing || "N/A"}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Monthly Salary</p>
                <div className="mt-1 flex items-center gap-2 text-gray-900">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  {deployment.monthly_salary ? `₹${deployment.monthly_salary.toLocaleString()}` : "N/A"}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Daily Rate</p>
                <div className="mt-1 flex items-center gap-2 text-gray-900">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  {deployment.daily_rate ? `₹${deployment.daily_rate.toLocaleString()}` : "N/A"}
                </div>
              </div>
            </div>

            {deployment.notes && (
              <div className="pt-4">
                <p className="text-sm font-medium text-gray-500">Notes</p>
                <div className="mt-1 flex items-start gap-2 text-gray-900">
                  <FileText className="mt-0.5 h-4 w-4 text-gray-400" />
                  <p className="text-sm">{deployment.notes}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employee Information */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Employee</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {deployment.employees.first_name} {deployment.employees.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Employee ID</p>
              <p className="mt-1 text-gray-900">{deployment.employees.employee_id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Job Title</p>
              <p className="mt-1 text-gray-900">{deployment.employees.job_title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Department</p>
              <p className="mt-1 text-gray-900">{deployment.employees.department || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="mt-1 text-sm text-gray-900">{deployment.employees.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="mt-1 text-gray-900">{deployment.employees.phone || "N/A"}</p>
            </div>
            <Link href={`/employees/${deployment.employees.id}`}>
              <Button variant="outline" className="w-full bg-transparent">
                View Employee Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
