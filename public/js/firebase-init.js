/**
 * Firebase Initialization Module
 * Centralizes Firebase configuration for the entire app
 *
 * SECURITY: These keys are safe to expose in frontend as they're client-side Firebase keys
 * Backend security rules in Firebase console protect the actual data
 */

// Firebase configuration
// These are PUBLIC keys - security is handled by Firebase security rules
const firebaseConfig = {
    apiKey: "AIzaSyDqL5ZoTKp36sk8J5TxuHn_y6ji4i9h20s",
    authDomain: "collegeclimb-ai.firebaseapp.com",
    projectId: "collegeclimb-ai",
    storageBucket: "collegeclimb-ai.appspot.com",
    messagingSenderId: "187139654658",
    appId: "1:187139654658:web:4a6cf4c43095f03212931b",
    measurementId: "G-E0B2RQM9XS"
};

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
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js');
        const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js');
        const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js');
        const { getAnalytics } = await import('https://www.gstatic.com/firebasejs/10.12.1/firebase-analytics.js');

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
