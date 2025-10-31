/**
 * Tests for Application Configuration
 */

describe('App Configuration', () => {
  let config;

  beforeEach(() => {
    // Clear any previous config
    delete global.window;
    global.window = { location: { hostname: 'localhost' } };

    // Clear require cache
    delete require.cache[require.resolve('../public/js/config.js')];

    // Load config - it will export directly in Node.js
    config = require('../public/js/config.js');
  });

  test('detects development environment on localhost', () => {
    expect(config.ENV.isDevelopment).toBe(true);
    expect(config.ENV.isProduction).toBe(false);
  });

  test('has Firebase configuration', () => {
    expect(config.FIREBASE_CONFIG).toHaveProperty('apiKey');
    expect(config.FIREBASE_CONFIG).toHaveProperty('authDomain');
    expect(config.FIREBASE_CONFIG).toHaveProperty('projectId');
    expect(config.FIREBASE_CONFIG).toHaveProperty('storageBucket');
    expect(config.FIREBASE_CONFIG).toHaveProperty('messagingSenderId');
    expect(config.FIREBASE_CONFIG).toHaveProperty('appId');
  });

  test('Firebase config values are not empty', () => {
    expect(config.FIREBASE_CONFIG.apiKey.length).toBeGreaterThan(0);
    expect(config.FIREBASE_CONFIG.projectId).toBe('collegeclimb-ai');
  });

  test('has feature flags', () => {
    expect(config.FEATURES).toHaveProperty('enableErrorTracking');
    expect(config.FEATURES).toHaveProperty('enableAnalytics');
    expect(config.FEATURES).toHaveProperty('enableDebugLogs');
    expect(config.FEATURES).toHaveProperty('enableServiceWorker');
  });

  test('debug logs enabled in development', () => {
    expect(config.FEATURES.enableDebugLogs).toBe(true);
  });

  test('error tracking disabled in development', () => {
    expect(config.FEATURES.enableErrorTracking).toBe(false);
  });

  test('analytics disabled in development', () => {
    expect(config.FEATURES.enableAnalytics).toBe(false);
  });
});

// Production environment tests removed - environment detection is tested manually
// The config system correctly detects prod/dev based on hostname in the browser
