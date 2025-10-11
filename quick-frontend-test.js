#!/usr/bin/env node

// Quick Frontend Validation Script
const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3003';

// Simple HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runQuickTests() {
  console.log('🚀 Quick Frontend Validation for CollegeClimb AI');
  console.log('=' .repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  const tests = [
    {
      name: 'Server Health Check',
      test: async () => {
        const response = await makeRequest(`${BASE_URL}/test`);
        return response.status === 200 && response.data.includes('Server is working');
      }
    },
    {
      name: 'Dashboard Page',
      test: async () => {
        const response = await makeRequest(`${BASE_URL}/`);
        return response.status === 200 && response.data.includes('College Climb');
      }
    },
    {
      name: 'Essay Coach Page',
      test: async () => {
        const response = await makeRequest(`${BASE_URL}/essaycoach.html`);
        return response.status === 200 && response.data.includes('Essay Coach');
      }
    },
    {
      name: 'Timeline Page',
      test: async () => {
        const response = await makeRequest(`${BASE_URL}/adaptive-timeline.html`);
        return response.status === 200 && response.data.includes('Timeline');
      }
    },
    {
      name: 'Test Prep Page',
      test: async () => {
        const response = await makeRequest(`${BASE_URL}/testprep-enhanced.html`);
        return response.status === 200 && response.data.includes('Test Prep');
      }
    },
    {
      name: 'Essay Analysis API',
      test: async () => {
        const response = await makeRequest(`${BASE_URL}/api/essay-analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ essay: 'Test essay content' })
        });
        const data = JSON.parse(response.data);
        return response.status === 200 && data.overallFeedback;
      }
    },
    {
      name: 'Test Prep API',
      test: async () => {
        const response = await makeRequest(`${BASE_URL}/api/testprep-generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject: 'math', difficulty: 'easy', questionCount: 2 })
        });
        const data = JSON.parse(response.data);
        return response.status === 200 && data.questions && data.questions.length > 0;
      }
    },
    {
      name: 'College Search API',
      test: async () => {
        const response = await makeRequest(`${BASE_URL}/api/college-search?query=harvard`);
        const data = JSON.parse(response.data);
        return response.status === 200 && data.colleges;
      }
    }
  ];
  
  for (const testCase of tests) {
    try {
      const result = await testCase.test();
      if (result) {
        console.log(`✅ ${testCase.name}`);
        passed++;
      } else {
        console.log(`❌ ${testCase.name}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${testCase.name}: ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 QUICK VALIDATION RESULTS');
  console.log('=' .repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log(`🎯 Total Tests: ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL QUICK TESTS PASSED! Moving to comprehensive validation...');
  } else {
    console.log('\n⚠️  Some quick tests failed. Check the details above.');
  }
  
  return { passed, failed };
}

// Run if called directly
if (require.main === module) {
  runQuickTests().catch(console.error);
}

module.exports = { runQuickTests };
