import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AuthService } from '@/lib/auth-service'

export async function GET(request: NextRequest) {
  try {
    console.log('[Audit Logs API] GET request received')
    
    // Verify authentication
    const authToken = request.cookies.get('auth-token')?.value
    if (!authToken) {
      console.log('[Audit Logs API] No auth token')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authResult = AuthService.verifyToken(authToken)
    if (!authResult.valid || !authResult.user || authResult.user.role !== 'admin') {
      console.log('[Audit Logs API] Insufficient permissions')
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('[Audit Logs API] Authentication verified, user role:', authResult.user.role)

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const tableName = searchParams.get('tableName')
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('[Audit Logs API] Query params:', {
      action,
      tableName,
      userId,
      startDate,
      endDate,
      limit,
      offset
    })

    // Use service role client to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL_SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    console.log('[Audit Logs API] Fetching audit logs...')

    // Fetch audit logs first
    let query = supabase
      .from('system_activity')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (action) {
      query = query.eq('action', action)
    }

    if (tableName) {
      // Filter by table name in details JSONB
      query = query.contains('details', { tableName: tableName })
    }

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: auditLogs, error } = await query

    console.log('[Audit Logs API] Audit logs query result:', {
      count: auditLogs?.length || 0,
      error: error?.message
    })

    if (error) {
      console.error('[Audit Logs API] Query error:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch audit logs',
        details: error.message 
      }, { status: 500 })
    }

    // Fetch user profiles separately
    const userIds = auditLogs?.filter(log => log.user_id).map(log => log.user_id) || []
    let usersMap: Record<string, any> = {}
    
    if (userIds.length > 0) {
      console.log('[Audit Logs API] Fetching user profiles:', userIds.length)
      const { data: users } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, role')
        .in('id', userIds)
      
      users?.forEach(user => {
        usersMap[user.id] = user
      })
      console.log('[Audit Logs API] User profiles fetched:', users?.length || 0)
    }

    // Combine audit logs with user profiles
    const logsWithUsers = auditLogs?.map(log => ({
      ...log,
      user_profiles: log.user_id ? usersMap[log.user_id] : null
    })) || []

    // Get total count for pagination
    console.log('[Audit Logs API] Fetching total count...')
    let countQuery = supabase
      .from('system_activity')
      .select('*', { count: 'exact', head: true })

    if (action) countQuery = countQuery.eq('action', action)
    if (tableName) countQuery = countQuery.contains('details', { tableName: tableName })
    if (userId) countQuery = countQuery.eq('user_id', userId)
    if (startDate) countQuery = countQuery.gte('created_at', startDate)
    if (endDate) countQuery = countQuery.lte('created_at', endDate)

    const { count, error: countError } = await countQuery

    console.log('[Audit Logs API] Total count:', count)

    if (countError) {
      console.error('[Audit Logs API] Count error:', countError)
      return NextResponse.json({ 
        error: 'Failed to get audit log count',
        details: countError.message 
      }, { status: 500 })
    }

    const responseData = {
      success: true,
      data: {
        logs: logsWithUsers,
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit
        }
      }
    }

    console.log('[Audit Logs API] Returning response:', {
      logsCount: logsWithUsers.length,
      total: count || 0,
      hasMore: responseData.data.pagination.hasMore
    })

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('[Audit Logs API] Fetch error:', error)
    console.error('[Audit Logs API] Error details:', error instanceof Error ? error.message : error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
