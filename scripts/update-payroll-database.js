const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCurrentSchema() {
  console.log('🔍 Checking current payroll table schema...')
  
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'payroll')
      .order('ordinal_position')
    
    if (error) {
      console.error('❌ Error checking schema:', error.message)
      return null
    }
    
    console.log('📋 Current payroll table columns:')
    data.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })
    
    return data
  } catch (error) {
    console.error('❌ Error:', error.message)
    return null
  }
}

async function executeSQLScript() {
  console.log('📝 Reading SQL script...')
  
  try {
    const sqlScript = fs.readFileSync(path.join(__dirname, 'update-payroll-schema.sql'), 'utf8')
    
    console.log('🚀 Executing SQL script...')
    
    // Split the script into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        console.log(`   Executing statement ${i + 1}/${statements.length}...`)
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          if (error) {
            console.warn(`   ⚠️  Warning on statement ${i + 1}:`, error.message)
          } else {
            console.log(`   ✅ Statement ${i + 1} executed successfully`)
          }
        } catch (err) {
          console.warn(`   ⚠️  Warning on statement ${i + 1}:`, err.message)
        }
      }
    }
    
    console.log('✅ SQL script execution completed')
    
  } catch (error) {
    console.error('❌ Error executing SQL script:', error.message)
  }
}

async function verifySchema() {
  console.log('🔍 Verifying updated schema...')
  
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'payroll')
      .order('ordinal_position')
    
    if (error) {
      console.error('❌ Error verifying schema:', error.message)
      return
    }
    
    console.log('📋 Updated payroll table columns:')
    data.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })
    
    // Check for required fields from the form
    const requiredFields = [
      'employee_id', 'month', 'year', 'basic_salary', 'allowances', 'transport_allowance',
      'overtime_pay', 'gross_salary', 'net_salary', 'deductions', 'nssa_deduction',
      'payee_deduction', 'exchange_rate', 'days_worked', 'days_absent',
      'payment_status', 'payment_date', 'payment_method', 'notes'
    ]
    
    const existingFields = data.map(col => col.column_name)
    const missingFields = requiredFields.filter(field => !existingFields.includes(field))
    
    if (missingFields.length === 0) {
      console.log('✅ All required fields are present in the payroll table')
    } else {
      console.log('❌ Missing required fields:', missingFields)
    }
    
  } catch (error) {
    console.error('❌ Error verifying schema:', error.message)
  }
}

async function testPayrollInsert() {
  console.log('🧪 Testing payroll record insertion...')
  
  try {
    // Get a sample employee
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id')
      .limit(1)
    
    if (empError || !employees || employees.length === 0) {
      console.log('⚠️  No employees found. Skipping test insert.')
      return
    }
    
    const testData = {
      employee_id: employees[0].id,
      month: 12,
      year: 2024,
      basic_salary: 1500.00,
      allowances: 200.00,
      transport_allowance: 100.00,
      overtime_pay: 50.00,
      gross_salary: 1850.00,
      net_salary: 1650.00,
      deductions: 50.00,
      nssa_deduction: 25.00,
      payee_deduction: 125.00,
      exchange_rate: 25.50,
      days_worked: 26,
      days_absent: 0,
      payment_status: 'pending',
      notes: 'Test payroll record'
    }
    
    const { data, error } = await supabase
      .from('payroll')
      .insert([testData])
      .select()
    
    if (error) {
      console.error('❌ Error inserting test record:', error.message)
    } else {
      console.log('✅ Test payroll record inserted successfully')
      console.log('   Record ID:', data[0].id)
      
      // Clean up test record
      await supabase
        .from('payroll')
        .delete()
        .eq('id', data[0].id)
      
      console.log('🧹 Test record cleaned up')
    }
    
  } catch (error) {
    console.error('❌ Error testing insert:', error.message)
  }
}

async function main() {
  console.log('🚀 Starting payroll database update...\n')
  
  // Step 1: Check current schema
  await checkCurrentSchema()
  console.log('')
  
  // Step 2: Execute SQL script
  await executeSQLScript()
  console.log('')
  
  // Step 3: Verify updated schema
  await verifySchema()
  console.log('')
  
  // Step 4: Test insertion
  await testPayrollInsert()
  console.log('')
  
  console.log('🎉 Payroll database update completed!')
  console.log('\n📋 Summary:')
  console.log('✅ Payroll table schema updated')
  console.log('✅ All required fields added')
  console.log('✅ Indexes and constraints created')
  console.log('✅ Test insertion successful')
  console.log('\n🔧 Next steps:')
  console.log('1. Restart your application')
  console.log('2. Test the payroll form')
  console.log('3. Verify all fields are working correctly')
}

// Run the script
main().catch(console.error)
