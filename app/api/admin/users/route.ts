import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AuthService } from '@/lib/auth-service'
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

    // Use service role client to bypass RLS for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL_SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Build query - fetch users first
    let query = supabase
      .from('user_profiles')
      .select('*')
      .eq('status', status === 'active' ? 'active' : 'inactive')

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

    // Fetch departments for users who have department_id
    const departmentIds = users?.filter(u => u.department_id).map(u => u.department_id) || []
    let departmentsMap: Record<string, any> = {}
    
    if (departmentIds.length > 0) {
      const { data: departments } = await supabase
        .from('departments')
        .select('id, name')
        .in('id', departmentIds)
      
      departments?.forEach(dept => {
        departmentsMap[dept.id] = dept
      })
    }

    // Check for temporary password marker
    const TEMP_PASSWORD_MARKER = '$2a$12$TEMP.PASSWORD.NEEDS.SETUP.REQUIRED.FOR.NEW.USER'
    
    // Add department info and password setup status to users
    const usersWithDepartments = users?.map(user => ({
      ...user,
      departments: user.department_id ? departmentsMap[user.department_id] : null,
      requires_password_setup: user.password_hash === TEMP_PASSWORD_MARKER
    })) || []

    return NextResponse.json({
      success: true,
      data: usersWithDepartments
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
        success: false,
        error: 'Missing required fields: email, fullName, role',
        received: { email: !!email, fullName: !!fullName, role: !!role }
      }, { status: 400 })
    }

    // Validate role - database enum only supports admin, manager, hr
    const validRoles = ['admin', 'hr', 'manager']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ 
        success: false,
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
      }, { status: 400 })
    }

    // Use service role client to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL_SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json({ 
        error: 'User with this email already exists' 
      }, { status: 400 })
    }

    // For new users, set a temporary password marker that requires setup
    // Import the constant from a shared location
    const TEMP_PASSWORD_MARKER = '$2a$12$TEMP.PASSWORD.NEEDS.SETUP.REQUIRED.FOR.NEW.USER'
    
    // Create user with temporary password marker (user must set password on first login)
    const { data: newUser, error: createError } = await supabase
      .from('user_profiles')
      .insert({
        email: email.toLowerCase().trim(),
        first_name: fullName.split(' ')[0] || fullName,
        last_name: fullName.split(' ').slice(1).join(' ') || '',
        full_name: fullName.trim(),
        role,
        department_id: departmentId && departmentId !== '' ? departmentId : null,
        status: 'active',
        password_hash: TEMP_PASSWORD_MARKER // User must set password on first login
      })
      .select('*')
      .single()

    if (createError) {
      return NextResponse.json({ 
        success: false,
        error: 'Failed to create user',
        details: createError.message,
        code: createError.code
      }, { status: 500 })
    }

    // Log the action
    await supabase
      .from('system_activity')
      .insert({
        user_id: authResult.user.id,
        action: 'create',
        description: `User created: ${fullName} (${email}) - Password setup required`,
        details: {
          type: 'user_created',
          email,
          full_name: fullName,
          role,
          department_id: departmentId,
          requires_password_setup: true
        }
      })

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'User created successfully',
      requiresPasswordSetup: true,
      instructions: {
        title: 'Password Setup Required',
        message: `The user ${fullName} (${email}) has been created successfully. They will need to set up their password on first login.`,
        steps: [
          'Inform the user that their account has been created',
          'They should go to the login page and enter their email',
          'They will be automatically redirected to set up their password',
          'After setting their password, they can log in normally'
        ]
      }
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

    // Use service role client to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL_SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Get current user data for audit
    const { data: currentUser } = await supabase
      .from('user_profiles')
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
    if (fullName !== undefined) {
      updateData.full_name = fullName
      updateData.first_name = fullName.split(' ')[0]
      updateData.last_name = fullName.split(' ').slice(1).join(' ')
    }
    if (role !== undefined) updateData.role = role
    if (departmentId !== undefined) updateData.department_id = departmentId
    if (isActive !== undefined) updateData.status = isActive ? 'active' : 'inactive'

    const { data: updatedUser, error: updateError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId)
      .select('*')
      .single()

    if (updateError) {
      return NextResponse.json({ 
        error: 'Failed to update user',
        details: updateError.message 
      }, { status: 500 })
    }

    // Log the action
    await supabase
      .from('system_activity')
      .insert({
        user_id: authResult.user.id,
        action: 'update',
        description: `User updated: ${updatedUser.full_name || updatedUser.email}`,
        details: {
          type: 'user_updated',
          user_id: userId,
          changes: updateData
        }
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

    // Use service role client to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL_SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Get user data for audit
    const { data: userToDelete } = await supabase
      .from('user_profiles')
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
      .from('user_profiles')
      .update({ status: 'inactive' })
      .eq('id', userId)

    if (deleteError) {
      return NextResponse.json({ 
        error: 'Failed to delete user',
        details: deleteError.message 
      }, { status: 500 })
    }

    // Log the action
    await supabase
      .from('system_activity')
      .insert({
        user_id: authResult.user.id,
        action: 'delete',
        description: `User deactivated: ${userToDelete.full_name || userToDelete.email}`,
        details: {
          type: 'user_deactivated',
          user_id: userId
        }
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
