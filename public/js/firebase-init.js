/**
 * Firebase Initialization Module
 * Centralizes Firebase configuration for the entire app
 *
 * SECURITY: Configuration now loaded from environment variables via /api/config
 * No hardcoded credentials in source code
 */

// Get Firebase configuration from window.FIREBASE_CONFIG (loaded by firebase-env-inject.js)
// This is set by the /api/config endpoint which pulls from environment variables
const firebaseConfig = window.FIREBASE_CONFIG;

if (!firebaseConfig) {
    console.error('Firebase configuration not loaded. Ensure firebase-env-inject.js is included before this script.');
    throw new Error('Firebase configuration missing');
}

// Export for ES modules
export { firebaseConfig };

// Also make available globally for non-module scripts
window.firebaseConfig = firebaseConfig;

/**
 * Initialize Firebase and export commonly used services
 * Call this function once in your app initialization
 */
export async function initializeFirebase() {
    try {
        // Dynamically import Firebase modules
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js');
        const { getAuth } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js');
        const { getFirestore } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');
        const { getAnalytics } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js');

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        let analytics = null;

        // Initialize analytics only in production
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            try {
                analytics = getAnalytics(app);
            } catch (e) {
                console.warn('Analytics not available');
            }
        }

        console.log('✅ Firebase initialized successfully');

        return { app, auth, db, analytics };
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        throw error;
    }
}

// Auto-initialize if not in module context
if (typeof module === 'undefined' && !document.currentScript?.type?.includes('module')) {
    console.log('🔥 Firebase config loaded (global mode)');
}
