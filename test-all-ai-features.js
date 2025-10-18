#!/usr/bin/env node

/**
 * Comprehensive AI Feature Test Suite
 * Tests all AI-powered endpoints with real OpenAI integration
 */

const BASE_URL = 'http://localhost:3001';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAPI(endpoint, method, data, testName) {
  log(`\n${'━'.repeat(60)}`, 'cyan');
  log(`🧪 Testing: ${testName}`, 'bold');
  log(`${'━'.repeat(60)}`, 'cyan');
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const responseTime = Date.now() - startTime;
    
    const result = await response.json();
    
    if (response.ok) {
      log(`✅ SUCCESS (${responseTime}ms)`, 'green');
      log(`\nResponse Preview:`, 'blue');
      
      // Pretty print relevant fields
      if (result.response) {
        log(`AI Response: ${result.response.substring(0, 200)}...`, 'cyan');
      }
      if (result.highlights) {
        log(`Highlights Found: ${result.highlights.length}`, 'cyan');
        if (result.highlights[0]) {
          log(`  - Type: ${result.highlights[0].type} (${result.highlights[0].category})`, 'yellow');
          log(`  - Text: "${result.highlights[0].text.substring(0, 50)}..."`, 'yellow');
        }
      }
      if (result.overallFeedback) {
        log(`Overall Feedback: ${result.overallFeedback.substring(0, 150)}...`, 'cyan');
      }
      if (result.questions) {
        log(`Questions Generated: ${result.questions.length}`, 'cyan');
        if (result.questions[0]) {
          log(`  - Question 1: ${result.questions[0].question}`, 'yellow');
        }
      }
      
      return { success: true, responseTime, result };
    } else {
      log(`❌ FAILED (${responseTime}ms)`, 'red');
      log(`Error: ${JSON.stringify(result, null, 2)}`, 'red');
      return { success: false, responseTime, error: result };
    }
  } catch (error) {
    log(`❌ EXCEPTION: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  log('\n' + '═'.repeat(70), 'bold');
  log('🚀 COLLEGE CLIMB AI FEATURE TEST SUITE', 'bold');
  log('═'.repeat(70) + '\n', 'bold');
  
  const results = [];
  
  // Test 1: Essay Analysis
  results.push(await testAPI(
    '/api/essay-analyze',
    'POST',
    {
      essay: "Ever since I built my first robot in middle school, I've been fascinated by how technology can solve real-world problems. Last summer, I developed an app to help elderly residents in my community order groceries during the pandemic. Seeing my grandmother use it daily made me realize the profound impact software can have on people's lives.",
      prompt: "Describe a moment that shaped your academic interests",
      colleges: ["MIT", "Stanford"],
      userProfile: {
        grade: "12",
        gpa: "3.9",
        interests: ["Computer Science", "Robotics"]
      }
    },
    'Essay Analysis API'
  ));
  
  // Test 2: AI Chat Counseling
  results.push(await testAPI(
    '/api/chat',
    'POST',
    {
      message: "I'm interested in studying biology but I'm worried about job prospects. Should I switch to computer science?",
      conversationHistory: [],
      userContext: {
        grade: "11",
        gpa: "3.7",
        interests: ["Biology", "Research"]
      }
    },
    'AI Chat Counseling'
  ));
  
  // Test 3: Follow-up Chat
  results.push(await testAPI(
    '/api/chat',
    'POST',
    {
      message: "What specific biology programs should I look at?",
      conversationHistory: [
        {
          role: "user",
          content: "I'm interested in studying biology but I'm worried about job prospects."
        },
        {
          role: "assistant",
          content: "Biology offers many career paths in research, medicine, and biotechnology."
        }
      ]
    },
    'AI Chat with Conversation History'
  ));
  
  // Test 4: Test Prep Generation
  results.push(await testAPI(
    '/api/testprep-generate',
    'POST',
    {
      testType: "SAT",
      section: "Math",
      difficulty: "medium",
      count: 2
    },
    'Test Prep Question Generation'
  ));
  
  // Summary
  log('\n' + '═'.repeat(70), 'bold');
  log('📊 TEST SUMMARY', 'bold');
  log('═'.repeat(70) + '\n', 'bold');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgTime = results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / results.length;
  
  log(`Total Tests: ${results.length}`, 'cyan');
  log(`Passed: ${successful}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`Average Response Time: ${avgTime.toFixed(0)}ms`, 'blue');
  
  if (successful === results.length) {
    log('\n🎉 ALL AI FEATURES ARE WORKING! 🎉', 'green');
    log('✅ Your CollegeClimb AI platform is fully operational!', 'green');
  } else {
    log('\n⚠️  Some tests failed. Review the errors above.', 'yellow');
  }
  
  log('\n' + '═'.repeat(70) + '\n', 'bold');
}

// Run tests
runAllTests().catch(console.error);
