import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authToken = request.cookies.get('auth-token')?.value
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authResult = AuthService.verifyToken(authToken)
    if (!authResult.valid || !authResult.user || !['admin', 'hr'].includes(authResult.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'active'

    const supabase = await createClient()

    // Get departments with manager and employee count
    const { data: departments, error } = await supabase
      .from('departments')
      .select(`
        *,
        users!departments_manager_id_fkey (
          id,
          full_name,
          email,
          role
        ),
        employees (
          id,
          active
        )
      `)
      .eq('is_active', status === 'active')
      .order('name')

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to fetch departments',
        details: error.message 
      }, { status: 500 })
    }

    // Add employee count to each department
    const departmentsWithCounts = departments.map(dept => ({
      ...dept,
      employee_count: dept.employees.filter((emp: any) => emp.active).length,
      total_employees: dept.employees.length
    }))

    return NextResponse.json({
      success: true,
      data: departmentsWithCounts
    })

  } catch (error) {
    console.error('Departments fetch error:', error)
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

    const supabase = await createClient()

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
        .from('users')
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
        manager_id: managerId || null,
        is_active: true
      })
      .select(`
        *,
        users!departments_manager_id_fkey (
          id,
          full_name,
          email,
          role
        )
      `)
      .single()

    if (createError) {
      return NextResponse.json({ 
        error: 'Failed to create department',
        details: createError.message 
      }, { status: 500 })
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: authResult.user.id,
        action: 'department_created',
        table_name: 'departments',
        record_id: newDepartment.id,
        new_values: {
          name,
          description,
          manager_id: managerId
        }
      })

    return NextResponse.json({
      success: true,
      data: newDepartment,
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

    const supabase = await createClient()

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
        .from('users')
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
    if (isActive !== undefined) updateData.is_active = isActive

    const { data: updatedDept, error: updateError } = await supabase
      .from('departments')
      .update(updateData)
      .eq('id', departmentId)
      .select(`
        *,
        users!departments_manager_id_fkey (
          id,
          full_name,
          email,
          role
        )
      `)
      .single()

    if (updateError) {
      return NextResponse.json({ 
        error: 'Failed to update department',
        details: updateError.message 
      }, { status: 500 })
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: authResult.user.id,
        action: 'department_updated',
        table_name: 'departments',
        record_id: departmentId,
        old_values: currentDept,
        new_values: updatedDept
      })

    return NextResponse.json({
      success: true,
      data: updatedDept,
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

    const supabase = await createClient()

    // Check if department has employees
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id')
      .eq('department_id', departmentId)
      .eq('active', true)

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

    // Soft delete (deactivate) instead of hard delete
    const { error: deleteError } = await supabase
      .from('departments')
      .update({ is_active: false })
      .eq('id', departmentId)

    if (deleteError) {
      return NextResponse.json({ 
        error: 'Failed to delete department',
        details: deleteError.message 
      }, { status: 500 })
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: authResult.user.id,
        action: 'department_deleted',
        table_name: 'departments',
        record_id: departmentId,
        old_values: deptToDelete
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
