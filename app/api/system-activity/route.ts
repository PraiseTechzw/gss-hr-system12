import { NextRequest, NextResponse } from "next/server"
import { SystemActivityLogger } from "@/lib/system-activity"

export async function POST(request: NextRequest) {
  try {
    const { action, description, userId } = await request.json()

    if (!action || !description) {
      return NextResponse.json(
        { success: false, error: "Action and description are required" },
        { status: 400 }
      )
    }

    await SystemActivityLogger.logActivity({
      action,
      description,
      user_id: userId,
      details: { timestamp: new Date().toISOString() }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Activity logged successfully" 
    })
  } catch (error) {
    console.error("Error logging activity:", error)
    return NextResponse.json(
      { success: false, error: "Failed to log activity" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { data, error } = await supabase
      .from('system_activity')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching activities:", error)
      return NextResponse.json(
        { success: false, error: "Failed to fetch activities" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      activities: data || [] 
    })
  } catch (error) {
    console.error("Error fetching activities:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch activities" },
      { status: 500 }
    )
  }
}
