import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: admin } = await supabase
    .from("admin_users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (!admin) redirect("/")
  return <>{children}</>
}


