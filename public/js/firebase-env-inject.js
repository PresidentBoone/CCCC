// Firebase Environment Variable Injection
// This script MUST be loaded before firebase-config-secure.js
// It injects environment variables into window.FIREBASE_CONFIG

(function() {
  'use strict';

  // Check if running in browser
  if (typeof window === 'undefined') {
    console.error('This script must run in a browser environment');
    return;
  }

  // Firebase configuration - using actual values for development
  // In production, these will be replaced by Vercel environment variables
  window.FIREBASE_CONFIG = {
    apiKey: 'AIzaSyDqL5ZoTKp36sk8J5TxuHn_y6ji4i9h20s',
    authDomain: 'collegeclimb-ai.firebaseapp.com',
    projectId: 'collegeclimb-ai',
    storageBucket: 'collegeclimb-ai.firebasestorage.app',
    messagingSenderId: '187139654658',
    appId: '1:187139654658:web:4a6cf4c43095f03212931b',
    measurementId: 'G-E0B2RQM9XS'
  };

  // Validate that configuration is complete
  const isPlaceholder = (value) => !value || value.startsWith('__') || value === 'your_' || value.includes('_here');

  const hasPlaceholders = Object.values(window.FIREBASE_CONFIG).some(isPlaceholder);

  if (hasPlaceholders) {
    console.error(
      '❌ CRITICAL ERROR: Firebase environment variables not configured!\\n' +
      'Please set the following in your Vercel Dashboard:\\n' +
      '- NEXT_PUBLIC_FIREBASE_API_KEY\\n' +
      '- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN\\n' +
      '- NEXT_PUBLIC_FIREBASE_PROJECT_ID\\n' +
      '- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET\\n' +
      '- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID\\n' +
      '- NEXT_PUBLIC_FIREBASE_APP_ID\\n' +
      '- NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID\\n\\n' +
      'For development, create a .env file (see .env.example)'
    );

    // Show user-friendly error
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#d32f2f;color:white;padding:1rem;text-align:center;z-index:9999;font-family:system-ui';
    errorDiv.innerHTML = '<strong>Configuration Error</strong><br>Please contact support if this persists.';
    document.body.prepend(errorDiv);

    // Don't allow app to continue with invalid config
    window.FIREBASE_CONFIG = null;
  }
})();
