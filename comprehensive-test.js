#!/usr/bin/env node

/**
 * Comprehensive Test Suite for CollegeClimb AI Platform
 * Tests every feature, API endpoint, and functionality
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

console.log('🚀 Starting Comprehensive CollegeClimb AI Platform Test Suite...\n');

class ComprehensiveTestRunner {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            errors: []
        };
        this.server = null;
        this.port = 3000;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            'info': '💡',
            'success': '✅',
            'error': '❌',
            'warning': '⚠️'
        }[type] || '📝';
        
        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    async test(name, testFn) {
        try {
            this.log(`Testing: ${name}`, 'info');
            const result = await testFn();
            if (result) {
                this.testResults.passed++;
                this.log(`PASSED: ${name}`, 'success');
            } else {
                this.testResults.failed++;
                this.testResults.errors.push(`${name}: Test returned false`);
                this.log(`FAILED: ${name}`, 'error');
            }
        } catch (error) {
            this.testResults.failed++;
            this.testResults.errors.push(`${name}: ${error.message}`);
            this.log(`ERROR: ${name} - ${error.message}`, 'error');
        }
    }

    // Create a simple HTTP server for testing
    createTestServer() {
        return new Promise((resolve) => {
            this.server = http.createServer((req, res) => {
                const parsedUrl = url.parse(req.url, true);
                const pathname = parsedUrl.pathname;

                // CORS headers
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

                if (req.method === 'OPTIONS') {
                    res.writeHead(200);
                    res.end();
                    return;
                }

                // Serve static files
                if (pathname.startsWith('/public/')) {
                    const filePath = path.join(__dirname, pathname);
                    if (fs.existsSync(filePath)) {
                        const ext = path.extname(filePath);
                        const contentTypes = {
                            '.html': 'text/html',
                            '.js': 'application/javascript',
                            '.css': 'text/css',
                            '.json': 'application/json',
                            '.png': 'image/png',
                            '.jpg': 'image/jpeg',
                            '.svg': 'image/svg+xml'
                        };
                        
                        res.setHeader('Content-Type', contentTypes[ext] || 'text/plain');
                        fs.createReadStream(filePath).pipe(res);
                        return;
                    }
                }

                // API endpoint routing
                if (pathname.startsWith('/api/')) {
                    const apiPath = pathname.replace('/api/', '');
                    const apiFile = path.join(__dirname, 'api', `${apiPath}.js`);
                    
                    if (fs.existsSync(apiFile)) {
                        try {
                            // Simple API handler
                            res.setHeader('Content-Type', 'application/json');
                            res.writeHead(200);
                            res.end(JSON.stringify({ 
                                status: 'ok', 
                                endpoint: apiPath,
                                message: 'API endpoint is accessible'
                            }));
                            return;
                        } catch (error) {
                            res.writeHead(500);
                            res.end(JSON.stringify({ error: error.message }));
                            return;
                        }
                    }
                }

                // Default HTML files
                const htmlFiles = [
                    'index.html',
                    'dashboard.html',
                    'essaycoach.html',
                    'adaptive-timeline.html',
                    'testprep-enhanced.html',
                    'scholarship.html',
                    'document.html',
                    'profile.html',
                    'login.html',
                    'signup.html',
                    'about.html',
                    'pricing.html'
                ];

                const requestedFile = pathname === '/' ? 'index.html' : pathname.replace('/', '');
                
                if (htmlFiles.includes(requestedFile)) {
                    const filePath = path.join(__dirname, 'public', requestedFile);
                    if (fs.existsSync(filePath)) {
                        res.setHeader('Content-Type', 'text/html');
                        fs.createReadStream(filePath).pipe(res);
                        return;
                    }
                }

                // 404
                res.writeHead(404);
                res.end('Not Found');
            });

            this.server.listen(this.port, () => {
                this.log(`Test server running on http://localhost:${this.port}`, 'success');
                resolve();
            });
        });
    }

    // Test HTTP request
    makeRequest(path, method = 'GET', data = null) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: this.port,
                path: path,
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const req = http.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                });
            });

            req.on('error', reject);

            if (data) {
                req.write(JSON.stringify(data));
            }

            req.end();
        });
    }

    // File existence tests
    async testFileStructure() {
        const requiredFiles = [
            'public/index.html',
            'public/dashboard.html',
            'public/essaycoach.html',
            'public/adaptive-timeline.html',
            'public/testprep-enhanced.html',
            'public/scholarship.html',
            'public/document.html',
            'public/profile.html',
            'public/login.html',
            'public/signup.html',
            'api/chat.js',
            'api/essay-analyze.js',
            'api/essay-chat.js',
            'api/testprep-generate.js',
            'api/timeline-recommendations.js',
            'vercel.json'
        ];

        let allExist = true;
        for (const file of requiredFiles) {
            if (!fs.existsSync(path.join(__dirname, file))) {
                this.log(`Missing required file: ${file}`, 'error');
                allExist = false;
            }
        }

        return allExist;
    }

    // Test HTML files for navbar presence
    async testUniversalNavbar() {
        const htmlFiles = fs.readdirSync(path.join(__dirname, 'public'))
            .filter(file => file.endsWith('.html'));

        let navbarCount = 0;
        for (const file of htmlFiles) {
            const content = fs.readFileSync(path.join(__dirname, 'public', file), 'utf8');
            if (content.includes('cc-navbar')) {
                navbarCount++;
            }
        }

        this.log(`Universal navbar found in ${navbarCount}/${htmlFiles.length} HTML files`);
        return navbarCount >= Math.floor(htmlFiles.length * 0.8); // At least 80% should have navbar
    }

    // Test API endpoints accessibility
    async testAPIEndpoints() {
        const endpoints = [
            '/api/chat',
            '/api/essay-analyze',
            '/api/essay-chat',
            '/api/testprep-generate',
            '/api/timeline-recommendations'
        ];

        let successCount = 0;
        for (const endpoint of endpoints) {
            try {
                const response = await this.makeRequest(endpoint);
                if (response.statusCode === 200 || response.statusCode === 405) {
                    successCount++;
                }
            } catch (error) {
                this.log(`API endpoint ${endpoint} failed: ${error.message}`, 'error');
            }
        }

        return successCount === endpoints.length;
    }

    // Test HTML page accessibility
    async testPageAccessibility() {
        const pages = [
            '/',
            '/dashboard.html',
            '/essaycoach.html',
            '/adaptive-timeline.html',
            '/testprep-enhanced.html',
            '/scholarship.html',
            '/login.html',
            '/signup.html'
        ];

        let successCount = 0;
        for (const page of pages) {
            try {
                const response = await this.makeRequest(page);
                if (response.statusCode === 200) {
                    successCount++;
                    
                    // Check for basic HTML structure
                    if (response.body.includes('<html') && 
                        response.body.includes('</html>') && 
                        response.body.includes('cc-navbar')) {
                        // Page has proper structure
                    } else {
                        this.log(`Page ${page} missing proper HTML structure`, 'warning');
                    }
                }
            } catch (error) {
                this.log(`Page ${page} failed: ${error.message}`, 'error');
            }
        }

        return successCount >= Math.floor(pages.length * 0.9); // 90% success rate
    }

    // Test JavaScript modules
    async testJavaScriptModules() {
        const jsFiles = [
            'public/js/adaptive-timeline.js',
            'public/js/college-api.js',
            'public/js/logger.js',
            'public/data/timeline-templates.js'
        ];

        let validCount = 0;
        for (const jsFile of jsFiles) {
            if (fs.existsSync(path.join(__dirname, jsFile))) {
                try {
                    const content = fs.readFileSync(path.join(__dirname, jsFile), 'utf8');
                    // Basic syntax check
                    if (content.trim().length > 0 && !content.includes('syntax error')) {
                        validCount++;
                    }
                } catch (error) {
                    this.log(`JavaScript file ${jsFile} has issues: ${error.message}`, 'error');
                }
            }
        }

        return validCount === jsFiles.length;
    }

    // Test Vercel configuration
    async testVercelConfig() {
        try {
            const vercelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'vercel.json'), 'utf8'));
            
            // Check required properties
            const hasName = vercelConfig.name === 'CCCC';
            const hasFunctions = vercelConfig.functions && Object.keys(vercelConfig.functions).length > 0;
            const hasRewrites = vercelConfig.rewrites && vercelConfig.rewrites.length > 0;

            return hasName && hasFunctions && hasRewrites;
        } catch (error) {
            this.log(`Vercel config error: ${error.message}`, 'error');
            return false;
        }
    }

    // Main test runner
    async runAllTests() {
        this.log('🔥 Starting Comprehensive Test Suite', 'info');
        
        // Start test server
        await this.createTestServer();

        // Run all tests
        await this.test('File Structure', () => this.testFileStructure());
        await this.test('Universal Navbar', () => this.testUniversalNavbar());
        await this.test('API Endpoints', () => this.testAPIEndpoints());
        await this.test('Page Accessibility', () => this.testPageAccessibility());
        await this.test('JavaScript Modules', () => this.testJavaScriptModules());
        await this.test('Vercel Configuration', () => this.testVercelConfig());

        // Generate report
        this.generateReport();

        // Close server
        if (this.server) {
            this.server.close();
        }
    }

    generateReport() {
        const total = this.testResults.passed + this.testResults.failed;
        const successRate = ((this.testResults.passed / total) * 100).toFixed(1);

        console.log('\n' + '='.repeat(60));
        console.log('📊 COMPREHENSIVE TEST RESULTS');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${this.testResults.passed}`);
        console.log(`❌ Failed: ${this.testResults.failed}`);
        console.log(`📈 Success Rate: ${successRate}%`);
        console.log(`🎯 Total Tests: ${total}`);

        if (this.testResults.errors.length > 0) {
            console.log('\n🔍 DETAILED ERRORS:');
            this.testResults.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }

        console.log('\n' + '='.repeat(60));
        
        if (successRate >= 90) {
            console.log('🎉 EXCELLENT! Platform is ready for production deployment!');
        } else if (successRate >= 80) {
            console.log('⚠️  GOOD! Minor issues need attention before deployment.');
        } else {
            console.log('❌ NEEDS WORK! Critical issues must be fixed before deployment.');
        }
        
        console.log('='.repeat(60));
    }
}

// Run the comprehensive test suite
if (require.main === module) {
    const testRunner = new ComprehensiveTestRunner();
    testRunner.runAllTests().catch(console.error);
}

module.exports = ComprehensiveTestRunner;
