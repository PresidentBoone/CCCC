// Centralized Firebase Configuration with Environment Variables
// This file should be used across all pages to ensure consistency

class FirebaseConfig {
  constructor() {
    // Get configuration from window.FIREBASE_CONFIG (loaded by firebase-env-inject.js)
    if (!window.FIREBASE_CONFIG) {
      console.error('Firebase configuration not loaded. Ensure firebase-env-inject.js is included first.');
      throw new Error('Firebase configuration missing');
    }

    this.config = window.FIREBASE_CONFIG;

    this.app = null;
    this.auth = null;
    this.db = null;
    this.analytics = null;
  }

  async initialize() {
    if (this.app) {
      return this; // Already initialized
    }

    try {
      // Dynamically import Firebase modules
      const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js');
      const { getAuth } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js');
      const { getFirestore } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');
      const { getAnalytics } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js');

      // Check if Firebase is already initialized
      const apps = getApps();
      if (apps.length > 0) {
        this.app = apps[0];
      } else {
        this.app = initializeApp(this.config);
      }

      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);

      // Initialize Analytics only in browser
      if (typeof window !== 'undefined') {
        this.analytics = getAnalytics(this.app);
      }

      // Make available globally for compatibility
      window.firebaseApp = this.app;
      window.firebaseAuth = this.auth;
      window.firebaseDb = this.db;
      window.firebaseAnalytics = this.analytics;

      console.log('✅ Firebase initialized successfully');
      return this;
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      throw error;
    }
  }

  getConfig() {
    return this.config;
  }

  getAuth() {
    return this.auth;
  }

  getDb() {
    return this.db;
  }

  getApp() {
    return this.app;
  }

  getAnalytics() {
    return this.analytics;
  }
}

// Create singleton instance
const firebaseConfig = new FirebaseConfig();

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  firebaseConfig.initialize().catch(error => {
    console.error('Failed to auto-initialize Firebase:', error);
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = firebaseConfig;
}

// Also export as default for ES6 imports
export default firebaseConfig;
