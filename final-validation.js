#!/usr/bin/env node

// Comprehensive Final Validation Script for CollegeClimb AI Platform
// This script validates all features, APIs, and functionality

const BASE_URL = 'http://localhost:3003';

// Test results tracking
const results = {
    passed: 0,
    failed: 0,
    tests: []
};

function logResult(testName, success, details = '') {
    const result = { test: testName, status: success ? 'PASS' : 'FAIL', details, timestamp: new Date().toISOString() };
    results.tests.push(result);
    
    if (success) {
        results.passed++;
        console.log(`✅ ${testName}`);
    } else {
        results.failed++;
        console.log(`❌ ${testName}: ${details}`);
    }
}

// HTTP request helper
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const http = require('http');
        const req = http.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
        });
        req.on('error', reject);
        if (options.body) req.write(options.body);
        req.end();
    });
}

async function validatePlatform() {
    console.log('🚀 CollegeClimb AI Platform - Final Validation');
    console.log('=' .repeat(60));
    
    // 1. Server Health Check
    try {
        const response = await makeRequest(`${BASE_URL}/test`);
        const success = response.status === 200 && response.data.includes('Server is working');
        logResult('Server Health Check', success, success ? '' : `Status: ${response.status}`);
    } catch (error) {
        logResult('Server Health Check', false, error.message);
    }
    
    // 2. Page Loading Tests
    const pages = [
        { name: 'Dashboard', url: '/', title: 'College Climb' },
        { name: 'Essay Coach', url: '/essaycoach.html', title: 'Essay Coach' },
        { name: 'Adaptive Timeline', url: '/adaptive-timeline.html', title: 'Timeline' },
        { name: 'Test Prep Enhanced', url: '/testprep-enhanced.html', title: 'Test Prep' },
        { name: 'Test Prep Practice', url: '/testprep-practice.html', title: 'Practice Session' },
        { name: 'Scholarship Finder', url: '/scholarship.html', title: 'Scholarship' },
        { name: 'Profile', url: '/profile.html', title: 'Profile' },
        { name: 'Documents', url: '/document.html', title: 'Document' },
        { name: 'Login', url: '/login.html', title: 'Login' },
        { name: 'Signup', url: '/signup.html', title: 'Signup' },
        { name: 'Landing Page', url: '/index.html', title: 'College Climb' },
        { name: 'About', url: '/about.html', title: 'About' }
    ];
    
    for (const page of pages) {
        try {
            const response = await makeRequest(`${BASE_URL}${page.url}`);
            const success = response.status === 200 && response.data.includes(page.title);
            logResult(`${page.name} Page`, success, success ? '' : `Status: ${response.status}, Missing: ${page.title}`);
        } catch (error) {
            logResult(`${page.name} Page`, false, error.message);
        }
    }
    
    // 3. API Endpoint Tests
    const apiTests = [
        {
            name: 'Essay Analysis API',
            url: '/api/essay-analyze',
            method: 'POST',
            body: { essay: 'This is a comprehensive test essay about my journey and aspirations.' },
            validator: (data) => data.overallFeedback && data.highlights && data.strengthsToLeanInto
        },
        {
            name: 'Essay Chat API',
            url: '/api/essay-chat',
            method: 'POST',
            body: { message: 'How can I improve my essay introduction?' },
            validator: (data) => data.response && data.response.length > 10
        },
        {
            name: 'Test Prep Generation API',
            url: '/api/testprep-generate',
            method: 'POST',
            body: { subject: 'math', difficulty: 'medium', questionCount: 3, testType: 'sat' },
            validator: (data) => data.questions && data.questions.length === 3 && data.metadata
        },
        {
            name: 'Timeline Recommendations API',
            url: '/api/timeline-recommendations',
            method: 'POST',
            body: { studentType: 'RD', graduationYear: '2026', currentMonth: 11 },
            validator: (data) => data.tasks && data.tasks.length > 0 && data.metadata
        },
        {
            name: 'College Search API',
            url: '/api/college-search?query=harvard&type=private',
            method: 'GET',
            validator: (data) => data.colleges && data.total >= 0
        }
    ];
    
    for (const test of apiTests) {
        try {
            const options = {
                method: test.method,
                headers: { 'Content-Type': 'application/json' }
            };
            
            if (test.body) {
                options.body = JSON.stringify(test.body);
            }
            
            const response = await makeRequest(`${BASE_URL}${test.url}`, options);
            
            if (response.status === 200) {
                const data = JSON.parse(response.data);
                const success = test.validator(data);
                logResult(test.name, success, success ? '' : 'Validation failed');
            } else {
                logResult(test.name, false, `HTTP ${response.status}`);
            }
        } catch (error) {
            logResult(test.name, false, error.message);
        }
    }
    
    // 4. Static Asset Tests
    const assets = [
        '/images/whiteclearcc.png',
        '/images/blackcc.png',
        '/images/default-avatar.png',
        '/js/adaptive-timeline.js',
        '/js/college-api.js',
        '/js/logger.js',
        '/data/schools.json',
        '/data/timeline-templates.js'
    ];
    
    for (const asset of assets) {
        try {
            const response = await makeRequest(`${BASE_URL}${asset}`);
            const success = response.status === 200;
            logResult(`Asset: ${asset}`, success, success ? '' : `Status: ${response.status}`);
        } catch (error) {
            logResult(`Asset: ${asset}`, false, error.message);
        }
    }
    
    // 5. Advanced API Feature Tests
    console.log('\n🔬 Advanced Feature Tests...');
    
    // Test essay analysis with longer content
    try {
        const longEssay = `
            Throughout my high school journey, I have discovered that my passion lies in the intersection of technology and social impact. This realization came to me during my sophomore year when I volunteered at a local community center, teaching elderly residents how to use smartphones and tablets.
            
            Initially, I was nervous about working with older adults, unsure if I could effectively communicate complex technological concepts. However, as I began working with residents like Mrs. Chen, a 78-year-old grandmother who wanted to video call her family in China, I realized that technology is not just about code and algorithms—it's about connecting people and breaking down barriers.
            
            The breakthrough moment came when Mrs. Chen successfully made her first video call. The joy on her face as she saw her granddaughter for the first time in years was indescribable. In that moment, I understood that technology has the power to transform lives, and I wanted to be part of that transformation.
            
            This experience led me to develop a mobile app called "TechBridge" that provides simplified tutorials for seniors to learn essential digital skills. Working with a team of fellow students, we created step-by-step video guides, practice exercises, and a support network that connects tech-savvy volunteers with seniors who need help.
            
            The project taught me valuable lessons about user-centered design, the importance of accessibility, and how to translate complex ideas into simple, actionable steps. More importantly, it reinforced my belief that the best technology solutions are those that address real human needs and create meaningful connections.
            
            As I look toward college and my future career, I am excited to continue exploring how technology can be used to solve social problems and bridge generational divides. I believe that [College Name] is the perfect place for me to develop these interests further, as your computer science program emphasizes both technical excellence and social responsibility.
        `;
        
        const response = await makeRequest(`${BASE_URL}/api/essay-analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ essay: longEssay, targetSchools: ['Stanford', 'MIT'] })
        });
        
        if (response.status === 200) {
            const data = JSON.parse(response.data);
            const hasDetailedFeedback = data.overallFeedback.length > 50 && 
                                      data.strengthsToLeanInto.length > 0 && 
                                      data.areasToImprove.length > 0 && 
                                      data.nextSteps.length > 0;
            logResult('Advanced Essay Analysis', hasDetailedFeedback, hasDetailedFeedback ? '' : 'Insufficient detail in analysis');
        } else {
            logResult('Advanced Essay Analysis', false, `HTTP ${response.status}`);
        }
    } catch (error) {
        logResult('Advanced Essay Analysis', false, error.message);
    }
    
    // Test multiple question types in test prep
    const subjects = ['math', 'reading'];
    const difficulties = ['easy', 'medium', 'hard'];
    
    for (const subject of subjects) {
        for (const difficulty of difficulties) {
            try {
                const response = await makeRequest(`${BASE_URL}/api/testprep-generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subject, difficulty, questionCount: 2, testType: 'sat' })
                });
                
                if (response.status === 200) {
                    const data = JSON.parse(response.data);
                    const success = data.questions.length === 2 && 
                                  data.questions.every(q => q.question && q.options && q.correctAnswer && q.explanation);
                    logResult(`Test Prep: ${subject} ${difficulty}`, success, success ? '' : 'Missing question components');
                } else {
                    logResult(`Test Prep: ${subject} ${difficulty}`, false, `HTTP ${response.status}`);
                }
            } catch (error) {
                logResult(`Test Prep: ${subject} ${difficulty}`, false, error.message);
            }
        }
    }
    
    // 6. Generate Final Report
    console.log('\n' + '=' .repeat(60));
    console.log('📊 FINAL VALIDATION RESULTS');
    console.log('=' .repeat(60));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
    console.log(`🎯 Total Tests: ${results.passed + results.failed}`);
    
    // Categorize results
    const categories = {
        'Server & Pages': results.tests.filter(t => t.test.includes('Health') || t.test.includes('Page')),
        'API Endpoints': results.tests.filter(t => t.test.includes('API')),
        'Static Assets': results.tests.filter(t => t.test.includes('Asset')),
        'Advanced Features': results.tests.filter(t => t.test.includes('Advanced') || t.test.includes('Test Prep:'))
    };
    
    console.log('\n📋 Results by Category:');
    Object.entries(categories).forEach(([category, tests]) => {
        const passed = tests.filter(t => t.status === 'PASS').length;
        const total = tests.length;
        const rate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
        console.log(`   ${category}: ${passed}/${total} (${rate}%)`);
    });
    
    // Save detailed results
    const fs = require('fs');
    const reportData = {
        summary: {
            timestamp: new Date().toISOString(),
            totalTests: results.passed + results.failed,
            passed: results.passed,
            failed: results.failed,
            successRate: ((results.passed / (results.passed + results.failed)) * 100).toFixed(1)
        },
        categories,
        detailedResults: results.tests
    };
    
    fs.writeFileSync('final-validation-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Detailed report saved: final-validation-report.json');
    
    if (results.failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! CollegeClimb AI Platform is FULLY FUNCTIONAL!');
        console.log('🚀 Ready for production deployment!');
    } else {
        console.log(`\n⚠️  ${results.failed} tests failed. Platform needs attention before deployment.`);
        
        // Show failed tests
        const failedTests = results.tests.filter(t => t.status === 'FAIL');
        console.log('\n❌ Failed Tests:');
        failedTests.forEach(test => {
            console.log(`   • ${test.test}: ${test.details}`);
        });
    }
    
    return results;
}

// Run validation if called directly
if (require.main === module) {
    validatePlatform().catch(console.error);
}

module.exports = { validatePlatform };
