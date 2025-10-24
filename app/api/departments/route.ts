import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: departments, error } = await supabase
      .from('departments')
      .select('id, name, description')
      .order('name')

    if (error) {
      console.error('Departments fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch departments' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      departments
    })
  } catch (error) {
    console.error('Departments API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
