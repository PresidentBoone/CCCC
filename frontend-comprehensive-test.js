#!/usr/bin/env node

// Comprehensive Frontend Functionality Tester for CollegeClimb AI
// Tests all JavaScript functionality, API integration, and user workflows

const puppeteer = require('puppeteer');
const fs = require('fs');

const BASE_URL = 'http://localhost:3003';

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  results: []
};

// Helper function to log test results
function logTest(testName, passed, details = '') {
  const result = {
    test: testName,
    status: passed ? 'PASSED' : 'FAILED',
    details: details,
    timestamp: new Date().toISOString()
  };
  
  testResults.results.push(result);
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}: ${details}`);
  }
}

// Test API endpoints
async function testAPIEndpoints() {
  console.log('\n🔌 Testing API Endpoints...');
  
  try {
    // Test essay analysis
    const essayResponse = await fetch(`${BASE_URL}/api/essay-analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ essay: 'Test essay content' })
    });
    
    if (essayResponse.ok) {
      const data = await essayResponse.json();
      logTest('Essay Analysis API', data.highlights && data.overallFeedback);
    } else {
      logTest('Essay Analysis API', false, `HTTP ${essayResponse.status}`);
    }
    
    // Test test prep generation
    const testprepResponse = await fetch(`${BASE_URL}/api/testprep-generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: 'math', difficulty: 'medium', questionCount: 3 })
    });
    
    if (testprepResponse.ok) {
      const data = await testprepResponse.json();
      logTest('Test Prep Generation API', data.questions && data.questions.length > 0);
    } else {
      logTest('Test Prep Generation API', false, `HTTP ${testprepResponse.status}`);
    }
    
    // Test college search
    const collegeResponse = await fetch(`${BASE_URL}/api/college-search?query=harvard`);
    
    if (collegeResponse.ok) {
      const data = await collegeResponse.json();
      logTest('College Search API', data.colleges && data.total >= 0);
    } else {
      logTest('College Search API', false, `HTTP ${collegeResponse.status}`);
    }
    
  } catch (error) {
    logTest('API Endpoints', false, error.message);
  }
}

// Test page loading and navigation
async function testPageNavigation() {
  console.log('\n🌐 Testing Page Navigation...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Test major pages
    const pages = [
      { name: 'Dashboard', url: `${BASE_URL}/`, expectedTitle: 'College Climb' },
      { name: 'Essay Coach', url: `${BASE_URL}/essaycoach.html`, expectedTitle: 'AI Essay Coach' },
      { name: 'Timeline', url: `${BASE_URL}/adaptive-timeline.html`, expectedTitle: 'Adaptive Timeline' },
      { name: 'Test Prep', url: `${BASE_URL}/testprep-enhanced.html`, expectedTitle: 'AI-Powered Test Prep' },
      { name: 'Scholarships', url: `${BASE_URL}/scholarship.html`, expectedTitle: 'Scholarship Finder' },
      { name: 'Profile', url: `${BASE_URL}/profile.html`, expectedTitle: 'Profile' }
    ];
    
    for (const pageTest of pages) {
      try {
        await page.goto(pageTest.url, { waitUntil: 'networkidle2', timeout: 10000 });
        const title = await page.title();
        const passed = title.includes(pageTest.expectedTitle);
        logTest(`${pageTest.name} Page Load`, passed, passed ? title : `Expected: ${pageTest.expectedTitle}, Got: ${title}`);
      } catch (error) {
        logTest(`${pageTest.name} Page Load`, false, error.message);
      }
    }
    
  } catch (error) {
    logTest('Page Navigation Setup', false, error.message);
  } finally {
    if (browser) await browser.close();
  }
}

// Test navbar functionality
async function testNavbarFunctionality() {
  console.log('\n🧭 Testing Navbar Functionality...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    
    // Test theme toggle
    const themeToggle = await page.$('#ccThemeToggle');
    if (themeToggle) {
      logTest('Theme Toggle Element', true);
      
      // Test theme switching
      await page.click('#ccThemeToggle');
      const bodyTheme = await page.evaluate(() => document.body.getAttribute('data-theme'));
      logTest('Theme Toggle Functionality', bodyTheme === 'light' || bodyTheme === 'dark');
    } else {
      logTest('Theme Toggle Element', false, 'Element not found');
    }
    
    // Test profile dropdown
    const profileButton = await page.$('#ccProfileButton');
    if (profileButton) {
      logTest('Profile Dropdown Element', true);
    } else {
      logTest('Profile Dropdown Element', false, 'Element not found');
    }
    
    // Test navigation links
    const navLinks = await page.$$('.cc-dropdown-link');
    logTest('Navigation Links', navLinks.length >= 5, `Found ${navLinks.length} nav links`);
    
  } catch (error) {
    logTest('Navbar Functionality', false, error.message);
  } finally {
    if (browser) await browser.close();
  }
}

// Test essay coach functionality
async function testEssayCoach() {
  console.log('\n✍️ Testing Essay Coach Functionality...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(`${BASE_URL}/essaycoach.html`, { waitUntil: 'networkidle2' });
    
    // Test essay textarea
    const essayTextarea = await page.$('#essayText, #essay-content, textarea');
    if (essayTextarea) {
      logTest('Essay Textarea Element', true);
      
      // Test typing in essay
      await page.type('#essayText, #essay-content, textarea', 'This is a test essay about my goals.');
      const content = await page.$eval('#essayText, #essay-content, textarea', el => el.value);
      logTest('Essay Input Functionality', content.includes('test essay'));
    } else {
      logTest('Essay Textarea Element', false, 'Textarea not found');
    }
    
    // Test analyze button
    const analyzeButton = await page.$('[onclick*="analyze"], .analyze-btn, #analyzeBtn');
    logTest('Analyze Button Element', !!analyzeButton);
    
    // Test chat functionality
    const chatInput = await page.$('#chatInput, .chat-input');
    logTest('Chat Input Element', !!chatInput);
    
  } catch (error) {
    logTest('Essay Coach', false, error.message);
  } finally {
    if (browser) await browser.close();
  }
}

// Test timeline functionality
async function testTimelineFunctionality() {
  console.log('\n📅 Testing Timeline Functionality...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(`${BASE_URL}/adaptive-timeline.html`, { waitUntil: 'networkidle2' });
    
    // Test student type selector
    const studentTypeSelect = await page.$('#studentType, select[name="studentType"]');
    logTest('Student Type Selector', !!studentTypeSelect);
    
    // Test graduation year selector
    const graduationYearSelect = await page.$('#graduationYear, select[name="graduationYear"]');
    logTest('Graduation Year Selector', !!graduationYearSelect);
    
    // Test generate timeline button
    const generateButton = await page.$('[onclick*="generate"], .generate-btn, #generateTimeline');
    logTest('Generate Timeline Button', !!generateButton);
    
    // Test timeline display area
    const timelineDisplay = await page.$('#timelineDisplay, .timeline-container, #timeline');
    logTest('Timeline Display Area', !!timelineDisplay);
    
  } catch (error) {
    logTest('Timeline Functionality', false, error.message);
  } finally {
    if (browser) await browser.close();
  }
}

// Test test prep functionality
async function testTestPrepFunctionality() {
  console.log('\n📊 Testing Test Prep Functionality...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(`${BASE_URL}/testprep-enhanced.html`, { waitUntil: 'networkidle2' });
    
    // Test subject selection
    const subjectSelect = await page.$('#subject, select[name="subject"]');
    logTest('Subject Selector', !!subjectSelect);
    
    // Test difficulty selection
    const difficultySelect = await page.$('#difficulty, select[name="difficulty"]');
    logTest('Difficulty Selector', !!difficultySelect);
    
    // Test generate questions button
    const generateButton = await page.$('[onclick*="generate"], .generate-btn, #generateQuestions');
    logTest('Generate Questions Button', !!generateButton);
    
    // Test questions display area
    const questionsDisplay = await page.$('#questionsDisplay, .questions-container, #questions');
    logTest('Questions Display Area', !!questionsDisplay);
    
  } catch (error) {
    logTest('Test Prep Functionality', false, error.message);
  } finally {
    if (browser) await browser.close();
  }
}

// Test mobile responsiveness
async function testMobileResponsiveness() {
  console.log('\n📱 Testing Mobile Responsiveness...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Set mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    
    // Test navbar on mobile
    const navbar = await page.$('.cc-navbar, nav');
    if (navbar) {
      const navbarStyles = await page.evaluate(() => {
        const nav = document.querySelector('.cc-navbar, nav');
        return nav ? window.getComputedStyle(nav).display : 'none';
      });
      logTest('Mobile Navbar Display', navbarStyles !== 'none');
    }
    
    // Test responsive grid layouts
    const dashboardGrid = await page.$('.dashboard-grid, .stats-overview');
    if (dashboardGrid) {
      const gridStyles = await page.evaluate(() => {
        const grid = document.querySelector('.dashboard-grid, .stats-overview');
        return grid ? window.getComputedStyle(grid).display : 'none';
      });
      logTest('Mobile Grid Layout', gridStyles !== 'none');
    }
    
  } catch (error) {
    logTest('Mobile Responsiveness', false, error.message);
  } finally {
    if (browser) await browser.close();
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Frontend Testing for CollegeClimb AI');
  console.log('=' .repeat(60));
  
  try {
    // Run all test suites
    await testAPIEndpoints();
    await testPageNavigation();
    await testNavbarFunctionality();
    await testEssayCoach();
    await testTimelineFunctionality();
    await testTestPrepFunctionality();
    await testMobileResponsiveness();
    
    // Generate final report
    console.log('\n' + '=' .repeat(60));
    console.log('📊 COMPREHENSIVE FRONTEND TEST RESULTS');
    console.log('=' .repeat(60));
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
    console.log(`🎯 Total Tests: ${testResults.passed + testResults.failed}`);
    
    // Save detailed results
    const reportData = {
      summary: {
        passed: testResults.passed,
        failed: testResults.failed,
        successRate: ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1),
        totalTests: testResults.passed + testResults.failed,
        timestamp: new Date().toISOString()
      },
      results: testResults.results
    };
    
    fs.writeFileSync('frontend-test-results.json', JSON.stringify(reportData, null, 2));
    
    console.log('\n📄 Detailed results saved to: frontend-test-results.json');
    
    if (testResults.failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Frontend is production-ready!');
    } else {
      console.log('\n⚠️  Some tests failed. Review the detailed results above.');
    }
    
  } catch (error) {
    console.error('❌ Test suite error:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, testResults };
