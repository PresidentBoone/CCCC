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

// Detect environment
const ENV = {
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
};

// Firebase Configuration
// NOTE: This is intentionally exposed - Firebase handles security via rules, not key secrecy
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDYH_-88yBPK36KKUCYILqqV2aZiw4jQYs",
    authDomain: "college-climb-cc.firebaseapp.com",
    projectId: "college-climb-cc",
    storageBucket: "college-climb-cc.firebasestorage.app",
    messagingSenderId: "574834349559",
    appId: "1:574834349559:web:6ce1d00de2b3a0f62cf91b",
    measurementId: "G-BSWW7HD90M"
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
window.APP_CONFIG = {
    ENV,
    FIREBASE_CONFIG,
    API_BASE_URL,
    FEATURES
};

// Debug info
if (ENV.isDevelopment) {
    console.log('🔧 Running in DEVELOPMENT mode');
    console.log('📍 API Base URL:', API_BASE_URL);
} else {
    console.log('🚀 Running in PRODUCTION mode');
}
