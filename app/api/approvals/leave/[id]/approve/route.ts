import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { error } = await supabase.from("leave_requests").update({ status: "approved", approved_at: new Date().toISOString() }).eq("id", params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.redirect(new URL("/approvals", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"))
}
