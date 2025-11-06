import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AuthService } from '@/lib/auth-service'

export async function GET(request: NextRequest) {
  try {
    console.log('[Departments API] GET request received')
    
    // Verify authentication
    const authToken = request.cookies.get('auth-token')?.value
    if (!authToken) {
      console.log('[Departments API] No auth token')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authResult = AuthService.verifyToken(authToken)
    if (!authResult.valid || !authResult.user || !['admin', 'hr'].includes(authResult.user.role)) {
      console.log('[Departments API] Insufficient permissions')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    console.log('[Departments API] Authentication verified, user role:', authResult.user.role)

    // Use service role client to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL_SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    console.log('[Departments API] Fetching departments...')

    // Fetch departments first
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('*')
      .order('name')

    console.log('[Departments API] Departments query result:', {
      count: departments?.length || 0,
      error: deptError?.message
    })

    if (deptError) {
      console.error('[Departments API] Departments query error:', deptError)
      return NextResponse.json({ 
        error: 'Failed to fetch departments',
        details: deptError.message 
      }, { status: 500 })
    }

    // Fetch managers separately
    const managerIds = departments?.filter(d => d.manager_id).map(d => d.manager_id) || []
    let managersMap: Record<string, any> = {}
    
    if (managerIds.length > 0) {
      console.log('[Departments API] Fetching managers:', managerIds.length)
      const { data: managers } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, role')
        .in('id', managerIds)
      
      managers?.forEach(manager => {
        managersMap[manager.id] = manager
      })
      console.log('[Departments API] Managers fetched:', managers?.length || 0)
    }

    // Fetch employee counts for each department
    const departmentIds = departments?.map(d => d.id) || []
    let employeeCountsMap: Record<string, { active: number; total: number }> = {}
    
    if (departmentIds.length > 0) {
      console.log('[Departments API] Fetching employee counts for departments:', departmentIds.length)
      const { data: employees } = await supabase
        .from('employees')
        .select('id, department_id, status')
        .in('department_id', departmentIds)
      
      // Count employees per department
      employees?.forEach(emp => {
        if (!employeeCountsMap[emp.department_id]) {
          employeeCountsMap[emp.department_id] = { active: 0, total: 0 }
        }
        employeeCountsMap[emp.department_id].total++
        if (emp.status === 'active') {
          employeeCountsMap[emp.department_id].active++
        }
      })
      console.log('[Departments API] Employee counts calculated for', Object.keys(employeeCountsMap).length, 'departments')
    }

    // Combine all data
    const departmentsWithCounts = departments?.map(dept => ({
      ...dept,
      users: dept.manager_id ? managersMap[dept.manager_id] : null,
      employee_count: employeeCountsMap[dept.id]?.active || 0,
      total_employees: employeeCountsMap[dept.id]?.total || 0
    })) || []

    console.log('[Departments API] Returning', departmentsWithCounts.length, 'departments')

    return NextResponse.json({
      success: true,
      data: departmentsWithCounts
    })

  } catch (error) {
    console.error('[Departments API] Fetch error:', error)
    console.error('[Departments API] Error details:', error instanceof Error ? error.message : error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authToken = request.cookies.get('auth-token')?.value
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authResult = AuthService.verifyToken(authToken)
    if (!authResult.valid || !authResult.user || authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, managerId } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: 'Missing required field: name' 
      }, { status: 400 })
    }

    // Use service role client to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL_SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Check if department already exists
    const { data: existingDept } = await supabase
      .from('departments')
      .select('id')
      .eq('name', name)
      .single()

    if (existingDept) {
      return NextResponse.json({ 
        error: 'Department with this name already exists' 
      }, { status: 400 })
    }

    // Validate manager if provided
    if (managerId) {
      const { data: manager } = await supabase
        .from('user_profiles')
        .select('id, role')
        .eq('id', managerId)
        .single()

      if (!manager) {
        return NextResponse.json({ 
          error: 'Manager not found' 
        }, { status: 404 })
      }

      if (!['admin', 'manager'].includes(manager.role)) {
        return NextResponse.json({ 
          error: 'Manager must have admin or manager role' 
        }, { status: 400 })
      }
    }

    // Create department
    const { data: newDepartment, error: createError } = await supabase
      .from('departments')
      .insert({
        name,
        description: description || null,
        manager_id: managerId || null
      })
      .select('*')
      .single()

    if (createError) {
      console.error('[Departments API] Create error:', createError)
      return NextResponse.json({ 
        error: 'Failed to create department',
        details: createError.message 
      }, { status: 500 })
    }

    // Fetch manager info if exists
    let managerInfo = null
    if (newDepartment.manager_id) {
      const { data: manager } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, role')
        .eq('id', newDepartment.manager_id)
        .single()
      managerInfo = manager
    }

    const departmentWithManager = {
      ...newDepartment,
      users: managerInfo
    }

    // Log the action
    await supabase
      .from('system_activity')
      .insert({
        user_id: authResult.user.id,
        action: 'create',
        description: `Department created: ${name}`,
        details: {
          type: 'department_created',
          name,
          description,
          manager_id: managerId
        }
      })

    return NextResponse.json({
      success: true,
      data: departmentWithManager,
      message: 'Department created successfully'
    })

  } catch (error) {
    console.error('Department creation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authToken = request.cookies.get('auth-token')?.value
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authResult = AuthService.verifyToken(authToken)
    if (!authResult.valid || !authResult.user || authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      departmentId, 
      name, 
      description, 
      managerId, 
      isActive 
    } = body

    if (!departmentId) {
      return NextResponse.json({ 
        error: 'Missing required field: departmentId' 
      }, { status: 400 })
    }

    // Use service role client to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL_SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Get current department data for audit
    const { data: currentDept } = await supabase
      .from('departments')
      .select('*')
      .eq('id', departmentId)
      .single()

    if (!currentDept) {
      return NextResponse.json({ 
        error: 'Department not found' 
      }, { status: 404 })
    }

    // Validate manager if provided
    if (managerId) {
      const { data: manager } = await supabase
        .from('user_profiles')
        .select('id, role')
        .eq('id', managerId)
        .single()

      if (!manager) {
        return NextResponse.json({ 
          error: 'Manager not found' 
        }, { status: 404 })
      }

      if (!['admin', 'manager'].includes(manager.role)) {
        return NextResponse.json({ 
          error: 'Manager must have admin or manager role' 
        }, { status: 400 })
      }
    }

    // Update department
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (managerId !== undefined) updateData.manager_id = managerId

    const { data: updatedDept, error: updateError } = await supabase
      .from('departments')
      .update(updateData)
      .eq('id', departmentId)
      .select('*')
      .single()

    if (updateError) {
      console.error('[Departments API] Update error:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update department',
        details: updateError.message 
      }, { status: 500 })
    }

    // Fetch manager info if exists
    let managerInfo = null
    if (updatedDept.manager_id) {
      const { data: manager } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, role')
        .eq('id', updatedDept.manager_id)
        .single()
      managerInfo = manager
    }

    const departmentWithManager = {
      ...updatedDept,
      users: managerInfo
    }

    // Log the action
    await supabase
      .from('system_activity')
      .insert({
        user_id: authResult.user.id,
        action: 'update',
        description: `Department updated: ${updatedDept.name}`,
        details: {
          type: 'department_updated',
          department_id: departmentId,
          changes: updateData
        }
      })

    return NextResponse.json({
      success: true,
      data: departmentWithManager,
      message: 'Department updated successfully'
    })

  } catch (error) {
    console.error('Department update error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authToken = request.cookies.get('auth-token')?.value
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authResult = AuthService.verifyToken(authToken)
    if (!authResult.valid || !authResult.user || authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')

    if (!departmentId) {
      return NextResponse.json({ 
        error: 'Missing required parameter: departmentId' 
      }, { status: 400 })
    }

    // Use service role client to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL_SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Check if department has employees
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id')
      .eq('department_id', departmentId)
      .eq('status', 'active')

    if (empError) {
      return NextResponse.json({ 
        error: 'Failed to check department employees' 
      }, { status: 500 })
    }

    if (employees && employees.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete department with active employees. Please reassign employees first.' 
      }, { status: 400 })
    }

    // Get department data for audit
    const { data: deptToDelete } = await supabase
      .from('departments')
      .select('*')
      .eq('id', departmentId)
      .single()

    if (!deptToDelete) {
      return NextResponse.json({ 
        error: 'Department not found' 
      }, { status: 404 })
    }

    // Hard delete (departments table doesn't have status field)
    const { error: deleteError } = await supabase
      .from('departments')
      .delete()
      .eq('id', departmentId)

    if (deleteError) {
      return NextResponse.json({ 
        error: 'Failed to delete department',
        details: deleteError.message 
      }, { status: 500 })
    }

    // Log the action
    await supabase
      .from('system_activity')
      .insert({
        user_id: authResult.user.id,
        action: 'delete',
        description: `Department deleted: ${deptToDelete.name}`,
        details: {
          type: 'department_deleted',
          department_id: departmentId
        }
      })

    return NextResponse.json({
      success: true,
      message: 'Department deactivated successfully'
    })

  } catch (error) {
    console.error('Department deletion error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
