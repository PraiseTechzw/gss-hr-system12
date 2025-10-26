// Simple script to fix RLS policies for payroll table
const { createClient } = require('@supabase/supabase-js')

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY'

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseKey === 'YOUR_SERVICE_ROLE_KEY') {
  console.error('❌ Please set your Supabase credentials in the script or environment variables')
  console.log('Required:')
  console.log('  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.log('  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixRLS() {
  console.log('🔧 Fixing Row Level Security policies for payroll table...\n')
  
  try {
    // Read the SQL script
    const fs = require('fs')
    const path = require('path')
    const sqlScript = fs.readFileSync(path.join(__dirname, 'fix-payroll-rls.sql'), 'utf8')
    
    console.log('📝 Executing RLS fix SQL...')
    
    // Execute the SQL script
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlScript })
    
    if (error) {
      console.error('❌ Error executing SQL:', error.message)
      return false
    }
    
    console.log('✅ RLS policies updated successfully')
    return true
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

async function testPayrollInsert() {
  console.log('\n🧪 Testing payroll insert after RLS fix...')
  
  try {
    // Get a sample employee
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id')
      .limit(1)
    
    if (empError || !employees || employees.length === 0) {
      console.log('⚠️  No employees found. Cannot test insert.')
      return false
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
      notes: 'Test payroll record after RLS fix'
    }
    
    const { data, error } = await supabase
      .from('payroll')
      .insert([testData])
      .select()
    
    if (error) {
      console.error('❌ Error inserting test record:', error.message)
      return false
    }
    
    console.log('✅ Test payroll record inserted successfully')
    console.log('   Record ID:', data[0].id)
    
    // Clean up test record
    await supabase
      .from('payroll')
      .delete()
      .eq('id', data[0].id)
    
    console.log('🧹 Test record cleaned up')
    return true
    
  } catch (error) {
    console.error('❌ Error testing insert:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Starting RLS fix for payroll table...\n')
  
  // Step 1: Fix RLS policies
  const rlsSuccess = await fixRLS()
  if (!rlsSuccess) {
    console.log('\n❌ RLS fix failed. Please check the error above.')
    return
  }
  
  // Step 2: Test payroll insert
  const insertSuccess = await testPayrollInsert()
  if (!insertSuccess) {
    console.log('\n❌ Test insert failed.')
    return
  }
  
  console.log('\n🎉 RLS fix completed successfully!')
  console.log('\n📋 Summary:')
  console.log('✅ RLS policies updated')
  console.log('✅ Payroll insert test successful')
  console.log('\n🔧 Next steps:')
  console.log('1. Test the payroll form in your application')
  console.log('2. Verify all payroll operations work correctly')
}

// Run the script
main().catch(console.error)
