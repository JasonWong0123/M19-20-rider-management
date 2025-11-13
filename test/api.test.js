/**
 * API Test Script
 * 
 * Purpose: Simple test script to verify all API endpoints are working
 * 
 * Usage: node test/api.test.js
 * 
 * Note: This is a basic test script for demo purposes.
 * For production, consider using Jest, Mocha, or similar testing frameworks.
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Test configuration
const tests = [
  {
    name: 'API Info',
    method: 'GET',
    path: '/api',
    expectedStatus: 200
  },
  {
    name: 'Get Ongoing Orders',
    method: 'GET',
    path: '/api/rider/orders?status=ongoing',
    expectedStatus: 200
  },
  {
    name: 'Get Completed Orders',
    method: 'GET',
    path: '/api/rider/orders?status=completed',
    expectedStatus: 200
  },
  {
    name: 'Get Order Details',
    method: 'GET',
    path: '/api/rider/order/ORD001',
    expectedStatus: 200
  },
  {
    name: 'Get Order Statistics',
    method: 'GET',
    path: '/api/rider/orders/statistics',
    expectedStatus: 200
  },
  {
    name: 'Get Real-time Income',
    method: 'GET',
    path: '/api/rider/income/realtime',
    expectedStatus: 200
  },
  {
    name: 'Get Income Trend - Daily',
    method: 'GET',
    path: '/api/rider/income/trend?period=daily',
    expectedStatus: 200
  },
  {
    name: 'Get Income Trend - Weekly',
    method: 'GET',
    path: '/api/rider/income/trend?period=weekly',
    expectedStatus: 200
  },
  {
    name: 'Get Income Trend - Monthly',
    method: 'GET',
    path: '/api/rider/income/trend?period=monthly',
    expectedStatus: 200
  },
  {
    name: 'Get Withdrawal Records',
    method: 'GET',
    path: '/api/rider/income/records',
    expectedStatus: 200
  },
  {
    name: 'Submit Withdrawal Request',
    method: 'POST',
    path: '/api/rider/income/withdraw',
    expectedStatus: 201,
    body: JSON.stringify({
      amount: 25.50,
      accountInfo: 'Test Bank Account: **** 9999'
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  },
  {
    name: 'Test 404 Error',
    method: 'GET',
    path: '/api/nonexistent',
    expectedStatus: 404
  }
];

/**
 * Make HTTP request
 */
function makeRequest(test) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + test.path);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method: test.method,
      headers: test.headers || {}
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (test.body) {
      req.write(test.body);
    }

    req.end();
  });
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      console.log(`  ${test.method} ${test.path}`);
      
      const result = await makeRequest(test);
      
      if (result.statusCode === test.expectedStatus) {
        console.log(`  ✅ PASS - Status: ${result.statusCode}`);
        
        // Log some response data for successful tests
        if (result.data && typeof result.data === 'object' && result.data.success) {
          if (result.data.data) {
            console.log(`  📊 Response: ${JSON.stringify(result.data.data).substring(0, 100)}...`);
          }
        }
        
        passed++;
      } else {
        console.log(`  ❌ FAIL - Expected: ${test.expectedStatus}, Got: ${result.statusCode}`);
        if (result.data) {
          console.log(`  📝 Response: ${JSON.stringify(result.data).substring(0, 200)}...`);
        }
        failed++;
      }
    } catch (error) {
      console.log(`  ❌ ERROR - ${error.message}`);
      failed++;
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Summary
  console.log('='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${tests.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! API is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the server and try again.');
  }
  
  process.exit(failed === 0 ? 0 : 1);
}

// Check if server is running first
function checkServer() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      resolve(true);
    });

    req.on('error', () => {
      reject(new Error('Server is not running on http://localhost:3000'));
    });

    req.on('timeout', () => {
      reject(new Error('Server connection timeout'));
    });

    req.end();
  });
}

// Main execution
async function main() {
  try {
    console.log('🔍 Checking if server is running...');
    await checkServer();
    console.log('✅ Server is running\n');
    
    await runTests();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure the server is running:');
    console.log('   npm start');
    console.log('   or');
    console.log('   npm run dev');
    process.exit(1);
  }
}

main();
