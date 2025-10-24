/**
 * Application Configuration
 *
 * SECURITY NOTE: Firebase API keys are PUBLIC and should be restricted via:
 * 1. Firebase Console -> Project Settings -> General -> Web API Key restrictions
 * 2. Firebase Console -> Firestore -> Rules (must have proper security rules)
 * 3. Firebase Console -> Authentication -> Authorized domains
 *
 * The API key here is PUBLIC by design but Firebase services are protected by:
 * - Firestore security rules
 * - Authentication requirements
 * - Domain restrictions
 */

// Function to detect environment (re-callable for testing)
function detectEnvironment() {
    if (typeof window !== 'undefined' && window.location) {
        const hostname = window.location.hostname;
        return {
            isDevelopment: hostname === 'localhost' || hostname === '127.0.0.1',
            isProduction: hostname !== 'localhost' && hostname !== '127.0.0.1'
        };
    }
    // Default for Node.js environment (tests)
    return {
        isDevelopment: true,
        isProduction: false
    };
}

// Detect environment
const ENV = detectEnvironment();

// Firebase Configuration
// NOTE: This is intentionally exposed - Firebase handles security via rules, not key secrecy
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDqL5ZoTKp36sk8J5TxuHn_y6ji4i9h20s",
    authDomain: "collegeclimb-ai.firebaseapp.com",
    projectId: "collegeclimb-ai",
    storageBucket: "collegeclimb-ai.firebasestorage.app",
    messagingSenderId: "187139654658",
    appId: "1:187139654658:web:4a6cf4c43095f03212931b",
    measurementId: "G-E0B2RQM9XS"
};

// API Endpoints
const API_BASE_URL = ENV.isDevelopment ? 'http://localhost:3000' : '';

// Feature Flags
const FEATURES = {
    enableErrorTracking: ENV.isProduction,
    enableAnalytics: ENV.isProduction,
    enableDebugLogs: ENV.isDevelopment,
    enableServiceWorker: ENV.isProduction
};

// Export configuration
if (typeof window !== 'undefined') {
    window.APP_CONFIG = {
        ENV,
        FIREBASE_CONFIG,
        API_BASE_URL,
        FEATURES
    };

    // Also set window.FIREBASE_CONFIG for backward compatibility with unified-auth.js
    window.FIREBASE_CONFIG = FIREBASE_CONFIG;

    // Debug info
    if (ENV.isDevelopment) {
        console.log('🔧 Running in DEVELOPMENT mode');
        console.log('📍 API Base URL:', API_BASE_URL);
        console.log('✅ Firebase config loaded');
    } else {
        console.log('🚀 Running in PRODUCTION mode');
    }
}

// Export for Node.js (for testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ENV,
        FIREBASE_CONFIG,
        API_BASE_URL,
        FEATURES
    };
}
