import { createClient } from "@/lib/supabase/server"
import { DeploymentForm } from "@/components/deployments/deployment-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"

export default async function EditDeploymentPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: deployment, error } = await supabase.from("deployments").select("*").eq("id", params.id).single()

  if (error || !deployment) {
    notFound()
  }

  // Fetch all active employees for the dropdown
  const { data: employees } = await supabase
    .from("employees")
    .select("id, employee_id, first_name, last_name, job_title")
    .eq("employment_status", "active")
    .order("first_name")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/deployments/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Deployment</h1>
          <p className="mt-1 text-gray-500">Update deployment information for {deployment.client_name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deployment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <DeploymentForm employees={employees || []} deployment={deployment} />
        </CardContent>
      </Card>
    </div>
  )
}
