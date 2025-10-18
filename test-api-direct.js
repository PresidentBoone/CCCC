#!/usr/bin/env node

/**
 * Direct API Test - Test API handlers without web server
 */

import apiHandler from './api/index.js';

console.log('🧪 Testing College Climb API Directly...\n');

// Mock request and response objects
const mockReq = {
  method: 'GET',
  url: '/api/',
  headers: {},
  body: {}
};

const mockRes = {
  headers: {},
  statusCode: 200,
  
  setHeader(name, value) {
    this.headers[name] = value;
  },
  
  status(code) {
    this.statusCode = code;
    return this;
  },
  
  json(data) {
    console.log(`✅ Response Status: ${this.statusCode}`);
    console.log(`📋 Response Data:`, JSON.stringify(data, null, 2));
    console.log(`📨 Response Headers:`, this.headers);
    return this;
  },
  
  end(data) {
    console.log(`✅ Response Status: ${this.statusCode}`);
    if (data) console.log(`📄 Response Body:`, data);
    return this;
  }
};

// Test API
async function testAPI() {
  try {
    console.log('📡 Testing API endpoint: GET /api/');
    await apiHandler(mockReq, mockRes);
    console.log('\n🎉 API test completed successfully!');
  } catch (error) {
    console.error('\n❌ API test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAPI();
