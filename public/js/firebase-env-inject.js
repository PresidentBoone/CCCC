/**
 * Firebase Environment Variable Injection
 *
 * IMPORTANT: This file needs to be processed by a build script to inject
 * environment variables. For Vercel, you need to create an API endpoint
 * that serves this dynamically, OR use a build step to replace placeholders.
 *
 * CURRENT APPROACH: Placeholders that will be replaced at build time.
 * You MUST run a build script or configure Vercel to replace these.
 */

(function() {
  'use strict';

  // TEMPORARY: For local development, you can hardcode test values here
  // For production, these MUST be replaced by build process or API call

  // Check if we're on localhost (development mode)
  const isDevelopment = window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1';

  if (isDevelopment) {
    // Development: Show error that env vars need to be set
    console.warn('⚠️ DEVELOPMENT MODE: Firebase config not set');
    console.warn('For local testing, temporarily add your Firebase config here');

    window.FIREBASE_CONFIG = null;

    // Uncomment and fill in for local testing:
    /*
    window.FIREBASE_CONFIG = {
      apiKey: "your-dev-api-key",
      authDomain: "your-project.firebaseapp.com",
      projectId: "your-project-id",
      storageBucket: "your-project.firebasestorage.app",
      messagingSenderId: "your-sender-id",
      appId: "your-app-id",
      measurementId: "your-measurement-id"
    };
    */
  } else {
    // Production: These will be replaced by Vercel environment variables
    // through a build script or API endpoint

    // Fetch config from API endpoint (safer approach for Vercel)
    fetch('/api/config')
      .then(response => response.json())
      .then(config => {
        window.FIREBASE_CONFIG = config.firebase;
        console.log('✅ Firebase configuration loaded from API');

        // Trigger custom event so pages know config is ready
        window.dispatchEvent(new CustomEvent('firebaseConfigLoaded'));
      })
      .catch(error => {
        console.error('❌ Failed to load Firebase configuration:', error);
        console.error('App will not function without Firebase config');
        window.FIREBASE_CONFIG = null;
      });
  }

  // Make configuration available globally
  window.getFirebaseConfig = function() {
    return window.FIREBASE_CONFIG;
  };

})();
