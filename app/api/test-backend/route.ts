import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: []
    }

    // Test 1: Database Connection
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      results.tests.push({
        name: 'Database Connection',
        status: error ? 'FAIL' : 'PASS',
        message: error ? `Database error: ${error.message}` : 'Database connected successfully',
        details: error ? error : 'Connection established'
      })
    } catch (error) {
      results.tests.push({
        name: 'Database Connection',
        status: 'FAIL',
        message: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 2: Authentication System
    try {
      const authToken = request.cookies.get('auth-token')?.value
      if (authToken) {
        const authResult = AuthService.verifyToken(authToken)
        results.tests.push({
          name: 'Authentication System',
          status: authResult.valid ? 'PASS' : 'FAIL',
          message: authResult.valid ? 'Authentication working' : 'Invalid token',
          details: authResult.valid ? `User: ${authResult.user?.email}` : 'Token verification failed'
        })
      } else {
        results.tests.push({
          name: 'Authentication System',
          status: 'WARN',
          message: 'No authentication token found',
          details: 'User not logged in (expected for test)'
        })
      }
    } catch (error) {
      results.tests.push({
        name: 'Authentication System',
        status: 'FAIL',
        message: 'Authentication system error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 3: Core Tables
    try {
      const supabase = await createClient()
      const tableChecks = [
        { name: 'users', query: supabase.from('users').select('count').limit(1) },
        { name: 'departments', query: supabase.from('departments').select('count').limit(1) },
        { name: 'employees', query: supabase.from('employees').select('count').limit(1) },
        { name: 'payroll_periods', query: supabase.from('payroll_periods').select('count').limit(1) },
        { name: 'leave_requests', query: supabase.from('leave_requests').select('count').limit(1) }
      ]

      let tableResults = []
      for (const check of tableChecks) {
        try {
          const { error } = await check.query
          tableResults.push({
            table: check.name,
            status: error ? 'FAIL' : 'PASS',
            message: error ? error.message : 'Table accessible'
          })
        } catch (error) {
          tableResults.push({
            table: check.name,
            status: 'FAIL',
            message: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      const passedTables = tableResults.filter(r => r.status === 'PASS').length
      results.tests.push({
        name: 'Core Tables',
        status: passedTables === tableResults.length ? 'PASS' : 'FAIL',
        message: `${passedTables}/${tableResults.length} tables accessible`,
        details: tableResults
      })
    } catch (error) {
      results.tests.push({
        name: 'Core Tables',
        status: 'FAIL',
        message: 'Table check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 4: API Endpoints
    const apiTests = [
      { name: 'Users API', url: '/api/admin/users' },
      { name: 'Departments API', url: '/api/admin/departments' },
      { name: 'Audit Logs API', url: '/api/admin/audit-logs' },
      { name: 'Payroll API', url: '/api/payroll/calculate' },
      { name: 'Leave API', url: '/api/leave/requests' }
    ]

    const apiResults = []
    for (const test of apiTests) {
      try {
        const response = await fetch(`${request.nextUrl.origin}${test.url}`, {
          method: 'GET',
          headers: {
            'Cookie': request.headers.get('cookie') || ''
          }
        })
        
        apiResults.push({
          endpoint: test.name,
          status: response.status === 401 ? 'PASS' : response.ok ? 'PASS' : 'FAIL',
          message: response.status === 401 ? 'Protected endpoint (expected)' : 
                   response.ok ? 'Endpoint accessible' : `HTTP ${response.status}`,
          httpStatus: response.status
        })
      } catch (error) {
        apiResults.push({
          endpoint: test.name,
          status: 'FAIL',
          message: 'Request failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const passedAPIs = apiResults.filter(r => r.status === 'PASS').length
    results.tests.push({
      name: 'API Endpoints',
      status: passedAPIs >= 3 ? 'PASS' : 'FAIL',
      message: `${passedAPIs}/${apiResults.length} endpoints working`,
      details: apiResults
    })

    // Test 5: System Health
    try {
      const supabase = await createClient()
      const { data: adminUsers } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .eq('is_active', true)

      const { data: departments } = await supabase
        .from('departments')
        .select('id')
        .eq('is_active', true)

      results.tests.push({
        name: 'System Health',
        status: (adminUsers && adminUsers.length > 0) && (departments && departments.length > 0) ? 'PASS' : 'WARN',
        message: `System has ${adminUsers?.length || 0} admin users and ${departments?.length || 0} departments`,
        details: {
          adminUsers: adminUsers?.length || 0,
          departments: departments?.length || 0
        }
      })
    } catch (error) {
      results.tests.push({
        name: 'System Health',
        status: 'FAIL',
        message: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Calculate overall status
    const passedTests = results.tests.filter((t: any) => t.status === 'PASS').length
    const totalTests = results.tests.length
    const overallStatus = passedTests === totalTests ? 'HEALTHY' : 
                        passedTests >= totalTests * 0.8 ? 'WARNING' : 'CRITICAL'

    return NextResponse.json({
      success: true,
      overallStatus,
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: totalTests - passedTests,
        healthPercentage: Math.round((passedTests / totalTests) * 100)
      },
      results
    })

  } catch (error) {
    console.error('Backend test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Backend test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
