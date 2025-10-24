import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ 
        error: "No authenticated user",
        userError: userError?.message 
      })
    }

    // Check approval status
    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("is_approved, email, full_name, role")
      .eq("email", user.email)
      .single()

    return NextResponse.json({
      user: {
        email: user.email,
        id: user.id
      },
      admin: admin,
      adminError: adminError,
      isApproved: admin?.is_approved,
      approvalStatus: admin?.is_approved === true ? 'APPROVED' : 'NOT_APPROVED',
      shouldBlock: (adminError && adminError.code === 'PGRST116') || (admin && admin.is_approved !== true)
    })
  } catch (error) {
    return NextResponse.json({ 
      error: "Server error",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
