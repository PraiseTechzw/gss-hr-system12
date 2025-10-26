const { createClient } = require('@supabase/supabase-js')

async function testDashboardConnection() {
  console.log('🧪 Testing Dashboard Database Connections...\n')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    console.log('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY')
    return
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Test basic connection
    console.log('1. Testing basic connection...')
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Connection failed:', testError.message)
      return
    }
    console.log('✅ Basic connection successful')
    
    // Test dashboard tables
    console.log('\n2. Testing dashboard tables...')
    const tables = [
      'user_profiles',
      'departments', 
      'employees',
      'attendance',
      'payroll',
      'deployments',
      'leave_requests',
      'system_activity'
    ]
    
    const results = {}
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
          results[table] = { error: error.message }
        } else {
          console.log(`✅ ${table}: ${count || 0} records`)
          results[table] = { count: count || 0 }
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`)
        results[table] = { error: err.message }
      }
    }
    
    // Test dashboard stats calculation
    console.log('\n3. Testing dashboard statistics...')
    try {
      const [employees, departments, attendance, payroll] = await Promise.all([
        supabase.from('employees').select('*', { count: 'exact' }),
        supabase.from('departments').select('*', { count: 'exact' }),
        supabase.from('attendance').select('*', { count: 'exact' }),
        supabase.from('payroll').select('*', { count: 'exact' })
      ])
      
      const stats = {
        employees: employees.count || 0,
        departments: departments.count || 0,
        attendance: attendance.count || 0,
        payroll: payroll.count || 0
      }
      
      console.log('📊 Dashboard Statistics:')
      console.log(`   Employees: ${stats.employees}`)
      console.log(`   Departments: ${stats.departments}`)
      console.log(`   Attendance Records: ${stats.attendance}`)
      console.log(`   Payroll Records: ${stats.payroll}`)
      
    } catch (err) {
      console.error('❌ Error calculating stats:', err.message)
    }
    
    console.log('\n✅ Dashboard connection test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testDashboardConnection()
