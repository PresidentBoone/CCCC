/**
 * Tests for Application Configuration
 */

describe('App Configuration', () => {
  beforeEach(() => {
    // Clear any previous config
    delete global.window;
    global.window = { location: { hostname: 'localhost' } };

    // Load config
    require('../public/js/config.js');
  });

  test('detects development environment on localhost', () => {
    expect(window.APP_CONFIG.ENV.isDevelopment).toBe(true);
    expect(window.APP_CONFIG.ENV.isProduction).toBe(false);
  });

  test('has Firebase configuration', () => {
    const config = window.APP_CONFIG.FIREBASE_CONFIG;

    expect(config).toHaveProperty('apiKey');
    expect(config).toHaveProperty('authDomain');
    expect(config).toHaveProperty('projectId');
    expect(config).toHaveProperty('storageBucket');
    expect(config).toHaveProperty('messagingSenderId');
    expect(config).toHaveProperty('appId');
  });

  test('Firebase config values are not empty', () => {
    const config = window.APP_CONFIG.FIREBASE_CONFIG;

    expect(config.apiKey.length).toBeGreaterThan(0);
    expect(config.projectId).toBe('college-climb-cc');
  });

  test('has feature flags', () => {
    const features = window.APP_CONFIG.FEATURES;

    expect(features).toHaveProperty('enableErrorTracking');
    expect(features).toHaveProperty('enableAnalytics');
    expect(features).toHaveProperty('enableDebugLogs');
    expect(features).toHaveProperty('enableServiceWorker');
  });

  test('debug logs enabled in development', () => {
    expect(window.APP_CONFIG.FEATURES.enableDebugLogs).toBe(true);
  });

  test('error tracking disabled in development', () => {
    expect(window.APP_CONFIG.FEATURES.enableErrorTracking).toBe(false);
  });

  test('analytics disabled in development', () => {
    expect(window.APP_CONFIG.FEATURES.enableAnalytics).toBe(false);
  });
});

describe('Production Environment Detection', () => {
  beforeEach(() => {
    delete global.window;
    global.window = { location: { hostname: 'college-climb.com' } };
    delete require.cache[require.resolve('../public/js/config.js')];
    require('../public/js/config.js');
  });

  test('detects production environment on real domain', () => {
    expect(window.APP_CONFIG.ENV.isDevelopment).toBe(false);
    expect(window.APP_CONFIG.ENV.isProduction).toBe(true);
  });

  test('enables error tracking in production', () => {
    expect(window.APP_CONFIG.FEATURES.enableErrorTracking).toBe(true);
  });

  test('enables analytics in production', () => {
    expect(window.APP_CONFIG.FEATURES.enableAnalytics).toBe(true);
  });

  test('disables debug logs in production', () => {
    expect(window.APP_CONFIG.FEATURES.enableDebugLogs).toBe(false);
  });
});
