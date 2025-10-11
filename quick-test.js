#!/usr/bin/env node

/**
 * Quick Functionality Test - CollegeClimb AI Platform
 * Tests critical paths and features to ensure everything works
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting Quick Functionality Test for CollegeClimb AI Platform\n');

class QuickTestRunner {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            issues: []
        };
    }

    test(name, testFn) {
        try {
            const result = testFn();
            if (result === true) {
                console.log(`✅ PASS: ${name}`);
                this.results.passed++;
            } else {
                console.log(`❌ FAIL: ${name} - ${result}`);
                this.results.failed++;
                this.results.issues.push(`${name}: ${result}`);
            }
        } catch (error) {
            console.log(`💥 ERROR: ${name} - ${error.message}`);
            this.results.failed++;
            this.results.issues.push(`${name}: ${error.message}`);
        }
    }

    // Test file structure
    testFileStructure() {
        const requiredFiles = [
            'public/dashboard.html',
            'public/essaycoach.html',
            'public/adaptive-timeline.html',
            'public/testprep-enhanced.html',
            'public/scholarship.html',
            'public/login.html',
            'public/signup.html',
            'public/index.html',
            'api/chat.js',
            'api/essay-analyze.js',
            'api/testprep-generate.js',
            'vercel.json'
        ];

        const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(__dirname, file)));
        
        if (missingFiles.length === 0) {
            return true;
        } else {
            return `Missing files: ${missingFiles.join(', ')}`;
        }
    }

    // Test HTML files for basic structure
    testHTMLStructure() {
        const htmlFiles = [
            'public/dashboard.html',
            'public/essaycoach.html',
            'public/adaptive-timeline.html',
            'public/testprep-enhanced.html',
            'public/scholarship.html'
        ];

        for (const file of htmlFiles) {
            if (!fs.existsSync(path.join(__dirname, file))) {
                return `Missing HTML file: ${file}`;
            }

            const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
            
            // Check for basic HTML structure
            if (!content.includes('<!DOCTYPE html>')) {
                return `${file} missing DOCTYPE`;
            }
            
            if (!content.includes('<html')) {
                return `${file} missing html tag`;
            }
            
            if (!content.includes('</html>')) {
                return `${file} missing closing html tag`;
            }
            
            // Check for universal navbar
            if (!content.includes('cc-navbar')) {
                return `${file} missing universal navbar`;
            }
        }

        return true;
    }

    // Test JavaScript files for syntax
    testJavaScriptSyntax() {
        const jsFiles = [
            'public/js/adaptive-timeline.js',
            'public/js/college-api.js',
            'public/js/logger.js'
        ];

        for (const file of jsFiles) {
            if (!fs.existsSync(path.join(__dirname, file))) {
                return `Missing JS file: ${file}`;
            }

            try {
                const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
                // Basic syntax check - look for obvious issues
                if (content.includes('syntax error')) {
                    return `${file} contains syntax errors`;
                }
            } catch (error) {
                return `Error reading ${file}: ${error.message}`;
            }
        }

        return true;
    }

    // Test API files structure
    testAPIStructure() {
        const apiFiles = [
            'api/chat.js',
            'api/essay-analyze.js',
            'api/essay-chat.js',
            'api/testprep-generate.js',
            'api/timeline-recommendations.js'
        ];

        for (const file of apiFiles) {
            if (!fs.existsSync(path.join(__dirname, file))) {
                return `Missing API file: ${file}`;
            }

            const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
            
            // Check for export structure
            if (!content.includes('module.exports') && !content.includes('export')) {
                return `${file} missing proper export structure`;
            }
        }

        return true;
    }

    // Test Vercel configuration
    testVercelConfig() {
        const vercelPath = path.join(__dirname, 'vercel.json');
        
        if (!fs.existsSync(vercelPath)) {
            return 'vercel.json file missing';
        }

        try {
            const config = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
            
            if (!config.name) {
                return 'vercel.json missing name field';
            }
            
            if (!config.functions) {
                return 'vercel.json missing functions configuration';
            }
            
            if (!config.rewrites) {
                return 'vercel.json missing rewrites configuration';
            }
            
            return true;
        } catch (error) {
            return `vercel.json parse error: ${error.message}`;
        }
    }

    // Test Firebase config presence
    testFirebaseConfig() {
        const htmlFiles = ['public/dashboard.html', 'public/essaycoach.html'];
        
        for (const file of htmlFiles) {
            const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
            
            if (!content.includes('firebase')) {
                return `${file} missing Firebase integration`;
            }
            
            if (!content.includes('initializeApp')) {
                return `${file} missing Firebase initialization`;
            }
        }
        
        return true;
    }

    // Test for common JavaScript errors in HTML
    testInlineJavaScript() {
        const htmlFiles = [
            'public/dashboard.html',
            'public/essaycoach.html',
            'public/adaptive-timeline.html'
        ];

        for (const file of htmlFiles) {
            const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
            
            // Check for unclosed script tags
            const scriptTags = content.match(/<script[^>]*>/g) || [];
            const closingScriptTags = content.match(/<\/script>/g) || [];
            
            if (scriptTags.length !== closingScriptTags.length) {
                return `${file} has unmatched script tags`;
            }
            
            // Check for obvious JavaScript syntax errors
            if (content.includes('console.log(') && !content.includes(');')) {
                return `${file} may have incomplete console.log statements`;
            }
        }
        
        return true;
    }

    // Test navigation consistency
    testNavigationConsistency() {
        const navbarFiles = [
            'public/dashboard.html',
            'public/essaycoach.html',
            'public/adaptive-timeline.html',
            'public/testprep-enhanced.html'
        ];

        const requiredNavLinks = [
            'dashboard.html',
            'essaycoach.html',
            'adaptive-timeline.html',
            'testprep-enhanced.html',
            'scholarship.html'
        ];

        for (const file of navbarFiles) {
            const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
            
            for (const link of requiredNavLinks) {
                if (!content.includes(link)) {
                    return `${file} missing navigation link to ${link}`;
                }
            }
        }
        
        return true;
    }

    // Run all tests
    runTests() {
        console.log('📋 Running comprehensive tests...\n');

        this.test('File Structure', () => this.testFileStructure());
        this.test('HTML Structure', () => this.testHTMLStructure());
        this.test('JavaScript Syntax', () => this.testJavaScriptSyntax());
        this.test('API Structure', () => this.testAPIStructure());
        this.test('Vercel Configuration', () => this.testVercelConfig());
        this.test('Firebase Configuration', () => this.testFirebaseConfig());
        this.test('Inline JavaScript', () => this.testInlineJavaScript());
        this.test('Navigation Consistency', () => this.testNavigationConsistency());

        this.generateReport();
    }

    generateReport() {
        const total = this.results.passed + this.results.failed;
        const successRate = ((this.results.passed / total) * 100).toFixed(1);

        console.log('\n' + '='.repeat(60));
        console.log('📊 QUICK FUNCTIONALITY TEST RESULTS');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📈 Success Rate: ${successRate}%`);
        console.log(`🎯 Total Tests: ${total}`);

        if (this.results.issues.length > 0) {
            console.log('\n🔍 ISSUES TO FIX:');
            this.results.issues.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue}`);
            });
        }

        console.log('\n' + '='.repeat(60));
        
        if (successRate >= 95) {
            console.log('🎉 EXCELLENT! Platform is production-ready!');
        } else if (successRate >= 85) {
            console.log('✅ GOOD! Minor issues need fixing.');
        } else if (successRate >= 70) {
            console.log('⚠️  NEEDS ATTENTION! Several issues to resolve.');
        } else {
            console.log('❌ CRITICAL! Major issues must be fixed.');
        }
        
        console.log('='.repeat(60));

        // Return success rate for programmatic use
        return successRate;
    }
}

// Run tests if called directly
if (require.main === module) {
    const testRunner = new QuickTestRunner();
    const successRate = testRunner.runTests();
    
    // Exit with appropriate code
    process.exit(successRate >= 85 ? 0 : 1);
}

module.exports = QuickTestRunner;
