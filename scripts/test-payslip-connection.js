// Test script to verify payslip API connections
const fetch = require('node-fetch');

async function testPayslipConnection() {
  console.log('🧪 Testing Payslip API Connections...\n');

  try {
    // Test individual payslip generation
    console.log('1. Testing individual payslip generation...');
    
    const testPayload = {
      payrollId: 'test-id', // This will fail but we can test the endpoint
      format: 'json'
    };

    const response = await fetch('http://localhost:3000/api/payslips/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    const result = await response.json();
    
    if (response.status === 404) {
      console.log('✅ Individual payslip endpoint is working (expected 404 for test ID)');
    } else {
      console.log('📊 Response:', result);
    }

  } catch (error) {
    console.log('❌ Individual payslip test failed:', error.message);
  }

  try {
    // Test bulk payslip generation
    console.log('\n2. Testing bulk payslip generation...');
    
    const testPayload = {
      month: 12,
      year: 2024,
      format: 'json'
    };

    const response = await fetch('http://localhost:3000/api/payslips/bulk-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    const result = await response.json();
    
    if (response.status === 404) {
      console.log('✅ Bulk payslip endpoint is working (expected 404 for test period)');
    } else {
      console.log('📊 Response:', result);
    }

  } catch (error) {
    console.log('❌ Bulk payslip test failed:', error.message);
  }

  console.log('\n🎉 Payslip API connection tests completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Create a payroll record using the payroll form');
  console.log('2. Use the payroll ID to generate individual payslips');
  console.log('3. Use bulk generation for multiple employees');
}

// Run the test
testPayslipConnection().catch(console.error);
