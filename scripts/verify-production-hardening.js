#!/usr/bin/env node

/**
 * Production Hardening Verification Script
 * Validates all hardening measures are in place before deployment
 * Run: node scripts/verify-production-hardening.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 PRODUCTION HARDENING VERIFICATION');
console.log('=====================================\n');

let passCount = 0;
let failCount = 0;
let warnCount = 0;

// Helper functions
const pass = (message) => {
    console.log(`✅ PASS: ${message}`);
    passCount++;
};

const fail = (message) => {
    console.log(`❌ FAIL: ${message}`);
    failCount++;
};

const warn = (message) => {
    console.log(`⚠️  WARN: ${message}`);
    warnCount++;
};

// Check 1: Firebase dependencies locked (no caret)
console.log('📦 Phase 1: Checking Firebase dependencies...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const firebaseVersion = packageJson.dependencies.firebase;
    const firebaseAdminVersion = packageJson.dependencies['firebase-admin'];

    if (firebaseVersion === '11.0.2') {
        pass('Firebase locked to 11.0.2 (no caret)');
    } else {
        fail(`Firebase version is ${firebaseVersion}, should be exactly "11.0.2"`);
    }

    if (firebaseAdminVersion === '13.5.0') {
        pass('Firebase Admin locked to 13.5.0 (no caret)');
    } else {
        fail(`Firebase Admin version is ${firebaseAdminVersion}, should be exactly "13.5.0"`);
    }
} catch (error) {
    fail(`Cannot read package.json: ${error.message}`);
}

// Check 2: iOS Safari localStorage guards
console.log('\n📱 Phase 2: Checking iOS Safari localStorage guards...');
try {
    const unifiedAuthPath = 'public/js/unified-auth.js';
    const unifiedAuthContent = fs.readFileSync(unifiedAuthPath, 'utf8');

    if (unifiedAuthContent.includes('isLocalStorageAvailable()')) {
        pass('iOS Safari localStorage check found in unified-auth.js');
    } else {
        fail('isLocalStorageAvailable() method not found in unified-auth.js');
    }

    if (unifiedAuthContent.includes('__storage_test__')) {
        pass('localStorage availability test implemented');
    } else {
        fail('localStorage test implementation not found');
    }
} catch (error) {
    fail(`Cannot verify iOS Safari guards: ${error.message}`);
}

// Check 3: Network monitor utility
console.log('\n🌐 Phase 3: Checking network monitor utility...');
try {
    const networkMonitorPath = 'public/js/network-monitor.js';
    if (fs.existsSync(networkMonitorPath)) {
        pass('network-monitor.js exists');

        const content = fs.readFileSync(networkMonitorPath, 'utf8');
        if (content.includes('checkBeforeOperation')) {
            pass('Network check before operations implemented');
        } else {
            fail('checkBeforeOperation method not found');
        }

        if (content.includes('handleOnline') && content.includes('handleOffline')) {
            pass('Online/offline handlers implemented');
        } else {
            fail('Online/offline handlers not found');
        }
    } else {
        fail('network-monitor.js not found');
    }

    // Check if dashboard.html includes network-monitor.js
    const dashboardPath = 'public/dashboard.html';
    if (fs.existsSync(dashboardPath)) {
        const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
        if (dashboardContent.includes('network-monitor.js')) {
            pass('dashboard.html includes network-monitor.js');
        } else {
            fail('dashboard.html does not include network-monitor.js');
        }
    }
} catch (error) {
    fail(`Cannot verify network monitor: ${error.message}`);
}

// Check 4: Firestore error guards
console.log('\n🔒 Phase 4: Checking Firestore error guards...');
try {
    const dashboardLoaderPath = 'public/js/dashboard-loader.js';
    const content = fs.readFileSync(dashboardLoaderPath, 'utf8');

    if (content.includes('safeFirestoreOperation')) {
        pass('safeFirestoreOperation wrapper method found');
    } else {
        fail('safeFirestoreOperation method not found in dashboard-loader.js');
    }

    // Check critical methods are wrapped
    const methodsToCheck = [
        'loadUserData',
        'loadApplicationStats',
        'loadEssayStats',
        'loadScholarshipStats',
        'loadTestPrepStats',
        'loadOverallProgress',
        'loadSchoolRecommendations',
        'loadTasks'
    ];

    let wrappedCount = 0;
    methodsToCheck.forEach(method => {
        // Check if method contains safeFirestoreOperation call
        const methodRegex = new RegExp(`async ${method}\\([^)]*\\)\\s*{[^}]*safeFirestoreOperation`, 's');
        if (methodRegex.test(content)) {
            wrappedCount++;
        }
    });

    if (wrappedCount === methodsToCheck.length) {
        pass(`All ${methodsToCheck.length} critical methods wrapped with error guards`);
    } else {
        fail(`Only ${wrappedCount}/${methodsToCheck.length} methods wrapped with error guards`);
    }

    // Check handleTaskToggle has network check
    if (content.includes('handleTaskToggle') && content.includes('networkMonitor')) {
        pass('handleTaskToggle has network availability check');
    } else {
        warn('handleTaskToggle may not have network check');
    }
} catch (error) {
    fail(`Cannot verify Firestore error guards: ${error.message}`);
}

// Check 5: Sentry configuration
console.log('\n📊 Phase 5: Checking Sentry configuration...');
try {
    const errorTrackingPath = 'public/js/error-tracking.js';
    const content = fs.readFileSync(errorTrackingPath, 'utf8');

    if (content.includes('tracesSampleRate')) {
        pass('Sentry sample rate configuration found');

        // Check if it's set to 0.2 (20%) for production hardening
        if (content.includes('0.2')) {
            pass('Sample rate set to 0.2 (20%) for production monitoring');
        } else {
            warn('Sample rate not set to 0.2 - may need adjustment');
        }
    } else {
        fail('Sentry sample rate configuration not found');
    }

    // Check for proper error filtering
    if (content.includes('ignoreErrors')) {
        pass('Sentry error filtering configured');
    } else {
        warn('Sentry error filtering may not be configured');
    }

    // Check Firestore error filtering
    if (content.includes('permission-denied') && content.includes('unavailable')) {
        pass('Firestore errors filtered in Sentry');
    } else {
        warn('Firestore errors may not be filtered');
    }

    // Check network error filtering
    if (content.includes('Network unavailable') || content.includes('Failed to fetch')) {
        pass('Network errors filtered in Sentry');
    } else {
        warn('Network errors may not be filtered');
    }
} catch (error) {
    fail(`Cannot verify Sentry configuration: ${error.message}`);
}

// Check 6: Service worker cache version updated
console.log('\n🔧 Phase 6: Checking service worker cache version...');
try {
    const serviceWorkerPath = 'public/service-worker.js';
    const content = fs.readFileSync(serviceWorkerPath, 'utf8');

    if (content.includes('v2.2.0')) {
        pass('Service worker cache version is v2.2.0');
    } else {
        warn('Service worker cache version may need update to v2.2.0');
    }
} catch (error) {
    fail(`Cannot verify service worker: ${error.message}`);
}

// Check 7: No Firebase version conflicts
console.log('\n🔍 Phase 7: Checking for Firebase version conflicts...');
try {
    const jsFiles = getAllJsFiles('public/js');
    const conflicts = [];

    jsFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        // Check for old Firebase versions (10.x.x)
        const matches = content.match(/firebasejs\/10\.\d+\.\d+/g);
        if (matches) {
            conflicts.push({ file, versions: matches });
        }
    });

    if (conflicts.length === 0) {
        pass('No Firebase 10.x version conflicts found');
    } else {
        fail(`Firebase 10.x versions found in ${conflicts.length} files:`);
        conflicts.forEach(({ file, versions }) => {
            console.log(`   - ${path.relative('.', file)}: ${versions.join(', ')}`);
        });
    }

    // Check all use 11.0.2
    const firebase11Count = jsFiles.reduce((count, file) => {
        const content = fs.readFileSync(file, 'utf8');
        return count + (content.includes('firebasejs/11.0.2') ? 1 : 0);
    }, 0);

    if (firebase11Count > 0) {
        pass(`Firebase 11.0.2 used in ${firebase11Count} files`);
    }
} catch (error) {
    fail(`Cannot check Firebase versions: ${error.message}`);
}

// Check 8: Build script exists and is production-ready
console.log('\n🏗️  Phase 8: Checking production build configuration...');
try {
    const buildScriptPath = 'scripts/build-production.js';
    if (fs.existsSync(buildScriptPath)) {
        pass('Production build script exists');

        const content = fs.readFileSync(buildScriptPath, 'utf8');
        if (content.includes('minify') || content.includes('terser')) {
            pass('Production build includes minification');
        } else {
            warn('Production build may not include minification');
        }
    } else {
        fail('Production build script not found');
    }
} catch (error) {
    fail(`Cannot verify build configuration: ${error.message}`);
}

// Helper: Get all JS files recursively
function getAllJsFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (!filePath.includes('node_modules')) {
                getAllJsFiles(filePath, fileList);
            }
        } else if (file.endsWith('.js')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

// Summary
console.log('\n=====================================');
console.log('VERIFICATION SUMMARY');
console.log('=====================================');
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log(`⚠️  Warnings: ${warnCount}`);
console.log(`📊 Total checks: ${passCount + failCount + warnCount}`);

if (failCount === 0) {
    console.log('\n🎉 ALL CHECKS PASSED - Production hardening complete!');
    console.log('✅ Ready for deployment\n');
    process.exit(0);
} else {
    console.log('\n⚠️  SOME CHECKS FAILED - Please fix issues before deploying\n');
    process.exit(1);
}
