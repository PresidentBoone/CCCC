#!/usr/bin/env node

/**
 * Essay Coach Comprehensive Test Suite
 * Tests all enhanced feedback functionality
 */

const SAMPLE_ESSAY = `
I have always been passionate about helping others. Throughout my high school career, I worked hard to make a difference in my community. I volunteered at the local food bank and helped people who needed assistance.

My experiences taught me the value of hard work and dedication. I learned that making a difference is important. These lessons will help me succeed in college and beyond.

I am excited to attend your prestigious university because it has great programs and will help me achieve my goals. I know I will be a good fit for your school.
`;

const EXPECTED_FEEDBACK_STRUCTURE = {
  highlights: [
    {
      text: expect.any(String),
      type: expect.stringMatching(/^(red|yellow|green)$/),
      category: expect.stringMatching(/^(cliche|weak_verb|vague|show_dont_tell|grammar|unclear|strength)$/),
      why: expect.any(String),
      how: expect.any(String),
      suggestion: expect.any(String),
      startIndex: expect.any(Number),
      endIndex: expect.any(Number)
    }
  ],
  overallFeedback: expect.any(String),
  collegeSpecificAdvice: expect.any(String),
  strengthsToLeanInto: expect.any(Array),
  areasToImprove: expect.any(Array),
  nextSteps: expect.any(Array)
};

console.log('🧪 Essay Coach Test Suite\n');
console.log('=' .repeat(60));

// Test 1: API Endpoint Availability
console.log('\n📋 Test 1: API Endpoint Check');
console.log('Testing: /api/essay-analyze');

fetch('http://localhost:3000/api/essay-analyze', {
  method: 'OPTIONS'
})
.then(response => {
  if (response.ok) {
    console.log('✅ API endpoint is available');
  } else {
    console.log('❌ API endpoint not responding');
  }
})
.catch(error => {
  console.log('⚠️  Cannot test API (server may not be running)');
  console.log('   Run: npm run dev (or vercel dev) to start server');
});

// Test 2: Check HTML Structure
console.log('\n📋 Test 2: Frontend Structure Check');
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'public', 'essaycoach.html');

if (fs.existsSync(htmlPath)) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  
  const checks = [
    { name: 'Feedback cards container', pattern: /highlightsFeedback/g },
    { name: 'displayAnalysisResults function', pattern: /function displayAnalysisResults/g },
    { name: 'applyHighlights function', pattern: /function applyHighlights/g },
    { name: 'scrollToFeedbackCard function', pattern: /function scrollToFeedbackCard/g },
    { name: 'Category badges CSS', pattern: /\.feedback-type-badge/g },
    { name: 'Flash animation', pattern: /@keyframes flash/g },
    { name: 'WHY section rendering', pattern: /Why this is highlighted/g },
    { name: 'HOW section rendering', pattern: /How to improve/g },
    { name: 'SUGGESTION section rendering', pattern: /Suggestion:/g },
    { name: 'Click handler for highlights', pattern: /data-highlight-index/g }
  ];
  
  let allPassed = true;
  checks.forEach(check => {
    const found = html.match(check.pattern);
    if (found && found.length > 0) {
      console.log(`✅ ${check.name}: Found (${found.length} occurrence${found.length > 1 ? 's' : ''})`);
    } else {
      console.log(`❌ ${check.name}: NOT FOUND`);
      allPassed = false;
    }
  });
  
  console.log(allPassed ? '\n✅ All structure checks passed!' : '\n❌ Some structure checks failed');
} else {
  console.log('❌ essaycoach.html not found');
}

// Test 3: API Response Structure
console.log('\n📋 Test 3: API Response Structure');
console.log('Testing with sample essay...\n');

const testAPI = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/essay-analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        essay: SAMPLE_ESSAY,
        colleges: ['Harvard', 'Stanford'],
        prompt: 'Discuss a challenge you overcame'
      })
    });

    if (!response.ok) {
      console.log(`❌ API returned error: ${response.status}`);
      return;
    }

    const result = await response.json();
    
    console.log('Response Structure:');
    console.log(`- highlights: ${result.highlights ? result.highlights.length : 0} items`);
    console.log(`- overallFeedback: ${result.overallFeedback ? 'Present' : 'Missing'}`);
    console.log(`- collegeSpecificAdvice: ${result.collegeSpecificAdvice ? 'Present' : 'Missing'}`);
    console.log(`- strengthsToLeanInto: ${result.strengthsToLeanInto ? result.strengthsToLeanInto.length : 0} items`);
    console.log(`- areasToImprove: ${result.areasToImprove ? result.areasToImprove.length : 0} items`);
    console.log(`- nextSteps: ${result.nextSteps ? result.nextSteps.length : 0} items`);
    
    if (result.highlights && result.highlights.length > 0) {
      console.log('\nFirst Highlight Structure:');
      const h = result.highlights[0];
      console.log(`  ✓ text: ${h.text ? 'Present' : 'Missing'}`);
      console.log(`  ✓ type: ${h.type || 'Missing'}`);
      console.log(`  ✓ category: ${h.category || 'Missing'}`);
      console.log(`  ✓ why: ${h.why ? 'Present' : 'Missing'}`);
      console.log(`  ✓ how: ${h.how ? 'Present' : 'Missing'}`);
      console.log(`  ✓ suggestion: ${h.suggestion ? 'Present' : 'Missing'}`);
      console.log(`  ✓ startIndex: ${h.startIndex !== undefined ? 'Present' : 'Missing'}`);
      console.log(`  ✓ endIndex: ${h.endIndex !== undefined ? 'Present' : 'Missing'}`);
      
      // Validate completeness
      const hasAllFields = h.text && h.type && h.category && h.why && h.how && 
                          h.startIndex !== undefined && h.endIndex !== undefined;
      
      if (hasAllFields) {
        console.log('\n✅ Highlight has all required fields!');
      } else {
        console.log('\n❌ Highlight is missing required fields');
      }
    }
    
  } catch (error) {
    console.log('⚠️  Cannot test API response:', error.message);
    console.log('   Make sure the server is running: npm run dev');
  }
};

// Test 4: CSS Variables
console.log('\n📋 Test 4: CSS Variable Consistency');
if (fs.existsSync(htmlPath)) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  
  const badVariables = html.match(/var\(--card-bg\)/g);
  const goodVariables = html.match(/var\(--primary-bg\)/g);
  
  if (badVariables && badVariables.length > 0) {
    console.log(`❌ Found ${badVariables.length} instance(s) of deprecated --card-bg variable`);
  } else {
    console.log('✅ No deprecated CSS variables found');
  }
  
  if (goodVariables && goodVariables.length > 0) {
    console.log(`✅ Found ${goodVariables.length} instance(s) of --primary-bg variable`);
  }
}

// Test 5: JavaScript Completeness
console.log('\n📋 Test 5: JavaScript Function Completeness');
if (fs.existsSync(htmlPath)) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  
  const incompleteFunctions = [
    html.match(/function\s+\w+\s*\([^)]*\)\s*{\s*}/g), // Empty functions
    html.match(/\{…\}/g), // Placeholder syntax
    html.match(/TODO:/gi), // TODO comments
    html.match(/FIXME:/gi) // FIXME comments
  ];
  
  const hasIncomplete = incompleteFunctions.some(matches => matches && matches.length > 0);
  
  if (hasIncomplete) {
    console.log('❌ Found incomplete code patterns:');
    incompleteFunctions.forEach((matches, i) => {
      if (matches) {
        const labels = ['Empty functions', 'Placeholders', 'TODOs', 'FIXMEs'];
        console.log(`   - ${labels[i]}: ${matches.length}`);
      }
    });
  } else {
    console.log('✅ No incomplete code patterns found');
  }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 TEST SUMMARY\n');
console.log('Tests completed. Review results above.\n');
console.log('🔧 MANUAL TESTING REQUIRED:');
console.log('   1. Start dev server: npm run dev (or vercel dev)');
console.log('   2. Open: http://localhost:3000/essaycoach.html');
console.log('   3. Paste sample essay and analyze');
console.log('   4. Verify feedback cards show WHY/HOW/SUGGESTION');
console.log('   5. Click highlights to test scroll-to-card');
console.log('   6. Check color coding (red/yellow/green)');
console.log('\n📝 Sample Essay for Testing:');
console.log('---');
console.log(SAMPLE_ESSAY.trim());
console.log('---\n');

// Run async test
setTimeout(() => {
  testAPI();
}, 100);
