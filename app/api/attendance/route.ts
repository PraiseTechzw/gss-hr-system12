import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const employeeId = searchParams.get('employee_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    
    // Build query
    let query = supabase
      .from('attendance')
      .select(`
        *,
        employees (
          id,
          employee_id,
          first_name,
          last_name,
          email,
          job_title
        )
      `)
      .order('date', { ascending: false })
    
    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    
    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }
    
    if (startDate) {
      query = query.gte('date', startDate)
    }
    
    if (endDate) {
      query = query.lte('date', endDate)
    }
    
    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    const { data: attendance, error, count } = await query
      .range(from, to)
      .select('*', { count: 'exact' })
    
    if (error) {
      console.error('Error fetching attendance:', error)
      return NextResponse.json(
        { error: 'Failed to fetch attendance records' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: attendance,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
    
  } catch (error) {
    console.error('Attendance API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { employee_id, date, status, check_in_time, check_out_time, notes } = body
    
    // Validate required fields
    if (!employee_id || !date || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: employee_id, date, status' },
        { status: 400 }
      )
    }
    
    // Check if attendance record already exists for this employee and date
    const { data: existingRecord } = await supabase
      .from('attendance')
      .select('id')
      .eq('employee_id', employee_id)
      .eq('date', date)
      .single()
    
    if (existingRecord) {
      return NextResponse.json(
        { error: 'Attendance record already exists for this employee and date' },
        { status: 409 }
      )
    }
    
    // Create new attendance record
    const { data, error } = await supabase
      .from('attendance')
      .insert({
        employee_id,
        date,
        status,
        check_in_time,
        check_out_time,
        notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating attendance record:', error)
      return NextResponse.json(
        { error: 'Failed to create attendance record' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data,
      message: 'Attendance record created successfully'
    })
    
  } catch (error) {
    console.error('Attendance POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
