#!/usr/bin/env node

/**
 * AI Integration Validation Script
 * 
 * This script validates that all AI modules are properly integrated
 * into the College Climb platform.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating AI Integration...\n');

const results = {
    modules: [],
    pages: [],
    errors: [],
    warnings: []
};

// Check if AI modules exist
const modulesToCheck = [
    'public/js/ai-engine.js',
    'public/js/user-profile-manager.js',
    'public/js/testprep-manager.js',
    'public/js/college-discovery.js',
    'public/js/timeline-generator.js',
    'public/js/app-init.js',
    'public/js/navbar-init.js'
];

console.log('📦 Checking AI Modules...');
modulesToCheck.forEach(module => {
    const exists = fs.existsSync(path.join(__dirname, module));
    results.modules.push({
        name: module,
        exists,
        status: exists ? '✅' : '❌'
    });
    
    if (exists) {
        const content = fs.readFileSync(path.join(__dirname, module), 'utf8');
        const size = (content.length / 1024).toFixed(2);
        console.log(`  ${exists ? '✅' : '❌'} ${module} (${size} KB)`);
        
        // Check for class definition
        if (module.includes('ai-engine.js') && !content.includes('class AIEngine')) {
            results.errors.push(`${module} missing AIEngine class`);
        }
        if (module.includes('user-profile-manager.js') && !content.includes('class UserProfileManager')) {
            results.errors.push(`${module} missing UserProfileManager class`);
        }
        if (module.includes('testprep-manager.js') && !content.includes('class TestPrepManager')) {
            results.errors.push(`${module} missing TestPrepManager class`);
        }
        if (module.includes('college-discovery.js') && !content.includes('class CollegeDiscovery')) {
            results.errors.push(`${module} missing CollegeDiscovery class`);
        }
        if (module.includes('timeline-generator.js') && !content.includes('class TimelineGenerator')) {
            results.errors.push(`${module} missing TimelineGenerator class`);
        }
    } else {
        results.errors.push(`Module not found: ${module}`);
        console.log(`  ❌ ${module} - NOT FOUND`);
    }
});

console.log('\n📄 Checking Page Integrations...');

// Check if pages have AI module imports
const pagesToCheck = [
    'public/essaycoach.html',
    'public/discovery.html',
    'public/dashboard.html',
    'public/adaptive-timeline.html',
    'public/testprep-enhanced.html'
];

const requiredImports = {
    'essaycoach.html': ['ai-engine.js', 'user-profile-manager.js', 'app-init.js', 'navbar-init.js'],
    'discovery.html': ['ai-engine.js', 'college-discovery.js', 'user-profile-manager.js'],
    'dashboard.html': ['ai-engine.js', 'timeline-generator.js', 'college-discovery.js', 'testprep-manager.js'],
    'adaptive-timeline.html': ['timeline-generator.js', 'ai-engine.js'],
    'testprep-enhanced.html': ['testprep-manager.js', 'ai-engine.js']
};

pagesToCheck.forEach(page => {
    const exists = fs.existsSync(path.join(__dirname, page));
    if (!exists) {
        results.errors.push(`Page not found: ${page}`);
        console.log(`  ❌ ${page} - NOT FOUND`);
        return;
    }
    
    const content = fs.readFileSync(path.join(__dirname, page), 'utf8');
    const pageName = path.basename(page);
    const required = requiredImports[pageName] || [];
    
    const missingImports = [];
    const foundImports = [];
    
    required.forEach(importFile => {
        if (content.includes(`src="js/${importFile}"`)) {
            foundImports.push(importFile);
        } else {
            missingImports.push(importFile);
        }
    });
    
    results.pages.push({
        name: page,
        exists,
        hasImports: missingImports.length === 0,
        foundImports,
        missingImports
    });
    
    if (missingImports.length === 0) {
        console.log(`  ✅ ${page} (${foundImports.length} imports)`);
    } else {
        console.log(`  ⚠️  ${page} - Missing: ${missingImports.join(', ')}`);
        results.warnings.push(`${page} missing imports: ${missingImports.join(', ')}`);
    }
    
    // Check for Firebase initialization
    if (!content.includes('initializeApp') && !content.includes('firebaseApp')) {
        results.warnings.push(`${page} may be missing Firebase initialization`);
    }
    
    // Check for AI Engine initialization
    if (required.includes('ai-engine.js') && !content.includes('new window.AIEngine') && !content.includes('aiEngine')) {
        results.warnings.push(`${page} may not initialize AI Engine`);
    }
});

console.log('\n📊 Validation Summary\n');

console.log(`Modules: ${results.modules.filter(m => m.exists).length}/${results.modules.length} found`);
console.log(`Pages: ${results.pages.filter(p => p.hasImports).length}/${results.pages.length} properly integrated`);
console.log(`Errors: ${results.errors.length}`);
console.log(`Warnings: ${results.warnings.length}`);

if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(err => console.log(`  - ${err}`));
}

if (results.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    results.warnings.forEach(warn => console.log(`  - ${warn}`));
}

if (results.errors.length === 0) {
    console.log('\n✅ All AI modules are properly integrated!');
    console.log('\n🚀 Next Steps:');
    console.log('  1. Test each page in a browser');
    console.log('  2. Verify Firebase connectivity');
    console.log('  3. Test AI Engine functionality');
    console.log('  4. Check console for errors');
    console.log('  5. Validate user data persistence');
    process.exit(0);
} else {
    console.log('\n❌ Integration incomplete. Please fix errors above.');
    process.exit(1);
}
