import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthService } from '@/lib/auth-service'

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
    const action = searchParams.get('action')
    const tableName = searchParams.get('tableName')
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('system_activity')
      .select(`
        *,
        user_profiles!system_activity_user_id_fkey (
          id,
          full_name,
          email,
          role
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (action) {
      query = query.eq('action', action)
    }

    if (tableName) {
      // Filter by table name in details JSONB
      query = query.contains('details', { table_name: tableName })
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

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to fetch audit logs',
        details: error.message 
      }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('system_activity')
      .select('*', { count: 'exact', head: true })

    if (action) countQuery = countQuery.eq('action', action)
    if (tableName) countQuery = countQuery.contains('details', { table_name: tableName })
    if (userId) countQuery = countQuery.eq('user_id', userId)
    if (startDate) countQuery = countQuery.gte('created_at', startDate)
    if (endDate) countQuery = countQuery.lte('created_at', endDate)

    const { count, error: countError } = await countQuery

    if (countError) {
      return NextResponse.json({ 
        error: 'Failed to get audit log count',
        details: countError.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        logs: auditLogs,
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit
        }
      }
    })

  } catch (error) {
    console.error('Audit logs fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
