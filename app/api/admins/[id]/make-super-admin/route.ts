import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { error } = await supabase.from("admin_users").update({ role: "super_admin" }).eq("id", params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.redirect(new URL("/settings/users", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"))
}


