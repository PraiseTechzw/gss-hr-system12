import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Use service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const body = await request.json()
    
    // Create employee with service role (bypasses RLS)
    const { data: employee, error } = await supabase
      .from('employees')
      .insert([body])
      .select()
      .single()

    if (error) {
      console.error('Error creating employee:', error)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to create employee',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: employee
    })

  } catch (error) {
    console.error('Employee creation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
