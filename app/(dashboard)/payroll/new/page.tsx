import { createClient } from "@/lib/supabase/server"
import { PayrollForm } from "@/components/payroll/payroll-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function NewPayrollPage() {
  const supabase = await createClient()

  // Fetch all active employees for the dropdown
  const { data: employees } = await supabase
    .from("employees")
    .select("id, employee_id, first_name, last_name, job_title")
    .eq("employment_status", "active")
    .order("first_name")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/payroll">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Process Payroll</h1>
          <p className="mt-1 text-gray-500">Create a new payroll record for an employee</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Information</CardTitle>
        </CardHeader>
        <CardContent>
          <PayrollForm employees={employees || []} />
        </CardContent>
      </Card>
    </div>
  )
}
