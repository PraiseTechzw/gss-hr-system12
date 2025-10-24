import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  
  const { data: admin, error } = await supabase.from("user_profiles").select("role").eq("id", user.id).maybeSingle()
  
  // If user doesn't exist in user_profiles or is not an admin, redirect to dashboard
  if (!admin || !admin.role || admin.role !== 'admin') {
    redirect("/dashboard")
  }
  
  return <>{children}</>
}


