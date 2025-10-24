import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthService } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
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
    const role = searchParams.get('role')
    const departmentId = searchParams.get('departmentId')
    const status = searchParams.get('status') || 'active'

    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('users')
      .select(`
        *,
        departments (id, name),
        employees (
          id,
          employee_number,
          position,
          employment_type,
          active
        )
      `)
      .eq('is_active', status === 'active')

    // Apply filters
    if (role) {
      query = query.eq('role', role)
    }

    if (departmentId) {
      query = query.eq('department_id', departmentId)
    }

    const { data: users, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to fetch users',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: users
    })

  } catch (error) {
    console.error('Users fetch error:', error)
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
    const { 
      email, 
      fullName, 
      role, 
      departmentId, 
      password = 'default123',
      sendEmail = false 
    } = body

    // Validate required fields
    if (!email || !fullName || !role) {
      return NextResponse.json({ 
        error: 'Missing required fields: email, fullName, role' 
      }, { status: 400 })
    }

    // Validate role
    if (!['admin', 'hr', 'manager', 'employee'].includes(role)) {
      return NextResponse.json({ 
        error: 'Invalid role. Must be: admin, hr, manager, employee' 
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json({ 
        error: 'User with this email already exists' 
      }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email,
        full_name: fullName,
        role,
        department_id: departmentId || null,
        is_active: true
      })
      .select(`
        *,
        departments (id, name)
      `)
      .single()

    if (createError) {
      return NextResponse.json({ 
        error: 'Failed to create user',
        details: createError.message 
      }, { status: 500 })
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: authResult.user.id,
        action: 'user_created',
        table_name: 'users',
        record_id: newUser.id,
        new_values: {
          email,
          full_name: fullName,
          role,
          department_id: departmentId
        }
      })

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    })

  } catch (error) {
    console.error('User creation error:', error)
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
      userId, 
      email, 
      fullName, 
      role, 
      departmentId, 
      isActive 
    } = body

    if (!userId) {
      return NextResponse.json({ 
        error: 'Missing required field: userId' 
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current user data for audit
    const { data: currentUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (!currentUser) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    // Update user
    const updateData: any = {}
    if (email !== undefined) updateData.email = email
    if (fullName !== undefined) updateData.full_name = fullName
    if (role !== undefined) updateData.role = role
    if (departmentId !== undefined) updateData.department_id = departmentId
    if (isActive !== undefined) updateData.is_active = isActive

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select(`
        *,
        departments (id, name)
      `)
      .single()

    if (updateError) {
      return NextResponse.json({ 
        error: 'Failed to update user',
        details: updateError.message 
      }, { status: 500 })
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: authResult.user.id,
        action: 'user_updated',
        table_name: 'users',
        record_id: userId,
        old_values: currentUser,
        new_values: updatedUser
      })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    })

  } catch (error) {
    console.error('User update error:', error)
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
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ 
        error: 'Missing required parameter: userId' 
      }, { status: 400 })
    }

    // Prevent self-deletion
    if (userId === authResult.user.id) {
      return NextResponse.json({ 
        error: 'Cannot delete your own account' 
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Get user data for audit
    const { data: userToDelete } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (!userToDelete) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    // Soft delete (deactivate) instead of hard delete
    const { error: deleteError } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', userId)

    if (deleteError) {
      return NextResponse.json({ 
        error: 'Failed to delete user',
        details: deleteError.message 
      }, { status: 500 })
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: authResult.user.id,
        action: 'user_deleted',
        table_name: 'users',
        record_id: userId,
        old_values: userToDelete
      })

    return NextResponse.json({
      success: true,
      message: 'User deactivated successfully'
    })

  } catch (error) {
    console.error('User deletion error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

