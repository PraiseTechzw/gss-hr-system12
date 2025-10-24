import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test basic connection
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // Test database connection by querying a simple table
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('*')
      .limit(5)
    
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('*')
      .limit(5)
    
    const { data: userProfiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(5)
    
    // Test system settings
    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('*')
      .limit(5)
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      connection: {
        user: user ? { id: user.id, email: user.email } : null,
        userError: userError?.message || null
      },
      database: {
        departments: {
          count: departments?.length || 0,
          data: departments,
          error: deptError?.message || null
        },
        employees: {
          count: employees?.length || 0,
          data: employees,
          error: empError?.message || null
        },
        userProfiles: {
          count: userProfiles?.length || 0,
          data: userProfiles,
          error: profileError?.message || null
        },
        systemSettings: {
          count: settings?.length || 0,
          data: settings,
          error: settingsError?.message || null
        }
      },
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL_NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_URL_NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
