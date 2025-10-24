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
    // Development: Use config from config.js
    // config.js should already be loaded before this script
    if (window.APP_CONFIG && window.APP_CONFIG.FIREBASE_CONFIG) {
      window.FIREBASE_CONFIG = window.APP_CONFIG.FIREBASE_CONFIG;
      console.log('✅ Development: Using Firebase config from config.js');
    } else {
      console.warn('⚠️ DEVELOPMENT MODE: Waiting for config.js to load...');
      // Give config.js a moment to load if it hasn't yet
      setTimeout(() => {
        if (window.APP_CONFIG && window.APP_CONFIG.FIREBASE_CONFIG) {
          window.FIREBASE_CONFIG = window.APP_CONFIG.FIREBASE_CONFIG;
          console.log('✅ Development: Firebase config loaded');
          window.dispatchEvent(new CustomEvent('firebaseConfigLoaded'));
        } else {
          console.error('❌ config.js not loaded - Firebase will not work');
          window.FIREBASE_CONFIG = null;
        }
      }, 100);
    }
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
