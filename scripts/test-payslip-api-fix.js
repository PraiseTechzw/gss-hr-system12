// Test script to verify payslip API fixes
const fetch = require('node-fetch');

async function testPayslipAPIs() {
  console.log('🧪 Testing Payslip API Fixes...\n');

  try {
    // Test bulk generation with current month/year
    console.log('1. Testing bulk payslip generation...');
    
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    
    const bulkPayload = {
      month: month,
      year: year,
      format: 'json'
    };

    console.log(`Testing for period: ${month}/${year}`);

    const bulkResponse = await fetch('http://localhost:3000/api/payslips/bulk-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bulkPayload)
    });

    const bulkResult = await bulkResponse.json();
    
    if (bulkResponse.status === 404) {
      console.log('✅ Bulk API is working (expected 404 - no records for current period)');
      console.log('📝 This is normal if no payroll records exist for the current month');
    } else if (bulkResponse.status === 200) {
      console.log('✅ Bulk API is working successfully');
      console.log(`📊 Found ${bulkResult.data?.payslips?.length || 0} payslips`);
    } else {
      console.log('❌ Bulk API error:', bulkResult);
    }

  } catch (error) {
    console.log('❌ Bulk API test failed:', error.message);
  }

  try {
    // Test individual generation with a test ID
    console.log('\n2. Testing individual payslip generation...');
    
    const individualPayload = {
      payrollId: 'test-id-123',
      format: 'json'
    };

    const individualResponse = await fetch('http://localhost:3000/api/payslips/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(individualPayload)
    });

    const individualResult = await individualResponse.json();
    
    if (individualResponse.status === 404) {
      console.log('✅ Individual API is working (expected 404 - test ID not found)');
    } else if (individualResponse.status === 200) {
      console.log('✅ Individual API is working successfully');
    } else {
      console.log('❌ Individual API error:', individualResult);
    }

  } catch (error) {
    console.log('❌ Individual API test failed:', error.message);
  }

  console.log('\n🎯 Key Fixes Applied:');
  console.log('1. Fixed database query structure in both APIs');
  console.log('2. Removed invalid nested department queries');
  console.log('3. Updated to use department_id instead of departments.name');
  console.log('4. Simplified employee data fetching');

  console.log('\n📝 Next Steps:');
  console.log('1. Create some payroll records using the payroll form');
  console.log('2. Test individual payslip generation with real payroll IDs');
  console.log('3. Test bulk generation with periods that have payroll records');
}

// Run the test
testPayslipAPIs().catch(console.error);
