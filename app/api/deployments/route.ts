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
    const deploymentType = searchParams.get('deployment_type')
    const employeeId = searchParams.get('employee_id')
    
    // Build query
    let query = supabase
      .from('deployments')
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
      .order('start_date', { ascending: false })
    
    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    
    if (deploymentType) {
      query = query.eq('deployment_type', deploymentType)
    }
    
    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }
    
    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    const { data: deployments, error, count } = await query
      .range(from, to)
      .select('*', { count: 'exact' })
    
    if (error) {
      console.error('Error fetching deployments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch deployment records' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: deployments,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
    
  } catch (error) {
    console.error('Deployments API error:', error)
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
    
    const {
      employee_id,
      client_name,
      site_location,
      deployment_type,
      start_date,
      end_date,
      shift_timing,
      daily_rate,
      monthly_salary,
      status = 'active'
    } = body
    
    // Validate required fields
    if (!employee_id || !client_name || !site_location || !deployment_type || !start_date) {
      return NextResponse.json(
        { error: 'Missing required fields: employee_id, client_name, site_location, deployment_type, start_date' },
        { status: 400 }
      )
    }
    
    // Check if employee exists
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('id, first_name, last_name')
      .eq('id', employee_id)
      .single()
    
    if (employeeError || !employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }
    
    // Create new deployment record
    const { data, error } = await supabase
      .from('deployments')
      .insert({
        employee_id,
        client_name,
        site_location,
        deployment_type,
        start_date,
        end_date,
        shift_timing,
        daily_rate,
        monthly_salary,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
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
      .single()
    
    if (error) {
      console.error('Error creating deployment:', error)
      return NextResponse.json(
        { error: 'Failed to create deployment record' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data,
      message: 'Deployment record created successfully'
    })
    
  } catch (error) {
    console.error('Deployments POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
