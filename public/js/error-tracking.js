/**
 * Error Tracking Integration
 * Integrates with Sentry for production error monitoring
 *
 * Setup Instructions:
 * 1. Sign up at https://sentry.io (free tier available)
 * 2. Create a new JavaScript project
 * 3. Copy your DSN from the setup wizard
 * 4. Replace SENTRY_DSN below with your actual DSN
 * 5. Include this script in your HTML: <script src="/js/error-tracking.js"></script>
 */

(function() {
    'use strict';

    // Only enable in production
    if (!window.APP_CONFIG || !window.APP_CONFIG.FEATURES.enableErrorTracking) {
        console.log('📊 Error tracking disabled (development mode)');
        return;
    }

    // Sentry DSN - REPLACE WITH YOUR ACTUAL DSN
    const SENTRY_DSN = 'https://your-dsn@your-project.ingest.sentry.io/your-project-id';

    // Initialize Sentry
    const initSentry = () => {
        if (typeof Sentry === 'undefined') {
            console.warn('⚠️ Sentry SDK not loaded. Add Sentry SDK script before error-tracking.js');
            return;
        }

        Sentry.init({
            dsn: SENTRY_DSN,
            environment: window.APP_CONFIG.ENV.isProduction ? 'production' : 'development',

            // Sample rate for performance monitoring (10% in production)
            tracesSampleRate: window.APP_CONFIG.ENV.isProduction ? 0.1 : 1.0,

            // Replay sessions for debugging
            replaysSessionSampleRate: 0.1, // 10% of sessions
            replaysOnErrorSampleRate: 1.0, // 100% of error sessions

            // Integrate with browser APIs
            integrations: [
                new Sentry.BrowserTracing(),
                new Sentry.Replay(),
            ],

            // Filter out noise
            ignoreErrors: [
                // Browser extensions
                'top.GLOBALS',
                'chrome-extension',
                'moz-extension',
                // Network errors (handled elsewhere)
                'NetworkError',
                'Failed to fetch',
                // Ad blockers
                'adsbygoogle',
            ],

            // Add context
            beforeSend(event, hint) {
                // Add user context if available
                if (window.currentUser) {
                    event.user = {
                        id: window.currentUser.uid,
                        email: window.currentUser.email,
                    };
                }

                // Add test prep context
                if (window.testPrepData) {
                    event.contexts = event.contexts || {};
                    event.contexts.testprep = {
                        level: window.testPrepData.level,
                        xp: window.testPrepData.totalXP,
                        hearts: window.testPrepData.hearts,
                    };
                }

                return event;
            },
        });

        console.log('✅ Sentry error tracking initialized');
    };

    // Load Sentry SDK dynamically
    const loadSentrySDK = () => {
        const script = document.createElement('script');
        script.src = 'https://browser.sentry-cdn.com/7.x.x/bundle.min.js';
        script.crossOrigin = 'anonymous';
        script.onload = initSentry;
        script.onerror = () => console.error('❌ Failed to load Sentry SDK');
        document.head.appendChild(script);
    };

    // Initialize error tracking
    loadSentrySDK();

    // Fallback: Log errors to console if Sentry fails
    window.addEventListener('error', (event) => {
        console.error('💥 Uncaught error:', {
            message: event.message,
            filename: event.filename,
            line: event.lineno,
            column: event.colno,
            error: event.error,
        });
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.error('💥 Unhandled promise rejection:', {
            reason: event.reason,
            promise: event.promise,
        });
    });

    // Export helper for manual error reporting
    window.reportError = (error, context = {}) => {
        if (typeof Sentry !== 'undefined') {
            Sentry.captureException(error, { extra: context });
        } else {
            console.error('Error:', error, 'Context:', context);
        }
    };

})();
