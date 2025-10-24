import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "No authenticated user" })
    }

    // Check if user exists in admin_users
    const { data: adminUser, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", user.id)
      .single()

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      adminUser,
      error: error?.message,
      exists: !!adminUser
    })
  } catch (error) {
    return NextResponse.json({ 
      error: "Failed to check user", 
      details: error instanceof Error ? error.message : "Unknown error" 
    })
  }
}
