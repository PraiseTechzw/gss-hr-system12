import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import ApprovalsClient from "@/components/approvals/approvals-client"

export default async function ApprovalsPage() {
  const supabase = await createClient()
  // For demo purposes, pending approvals from leave_requests
  const { data: pendingLeaves } = await supabase
    .from("leave_requests")
    .select("*, employees(first_name, last_name, employee_id)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  return <ApprovalsClient pendingLeaves={pendingLeaves || []} />
}
