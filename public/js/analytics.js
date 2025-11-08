/**
 * Google Analytics Integration
 * Tracks user behavior and page views
 */

(function() {
    'use strict';

    // Only enable in production
    if (!window.APP_CONFIG || !window.APP_CONFIG.FEATURES.enableAnalytics) {
        console.log('Analytics disabled (development mode)');
        return;
    }

    const GA_MEASUREMENT_ID = 'G-BSWW7HD90M'; // From Firebase config

    // Load Google Analytics
    const loadGA = () => {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        window.gtag = gtag;

        gtag('js', new Date());
        gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
        console.log('Analytics initialized');
    };

    loadGA();

    // Helper functions
    window.analytics = {
        track: (eventName, params) => {
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, params);
            }
        },
        // Error tracking method (called by error-monitor.js)
        trackError: (errorType, errorMessage, errorDetails) => {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'exception', {
                    description: errorMessage,
                    error_type: errorType,
                    fatal: false,
                    ...errorDetails
                });
            }
        },
        // Test Prep Analytics
        diagnosticComplete: (satScore, actScore, duration) => {
            window.analytics.track('diagnostic_complete', { satScore, actScore, duration });
        },
        practiceSession: (subject, questionCount, accuracy) => {
            window.analytics.track('practice_session', { subject, questionCount, accuracy });
        },
        // Essay Coach Analytics
        essayCreated: (title, wordCount) => {
            window.analytics.track('essay_created', { title, wordCount });
        },
        essaySaved: (title, wordCount, duration) => {
            window.analytics.track('essay_saved', { title, wordCount, duration });
        },
        essayAnalyzed: (title, wordCount, feedbackCount) => {
            window.analytics.track('essay_analyzed', { title, wordCount, feedbackCount });
        },
        aiFeedbackRequested: (feedbackType, wordCount) => {
            window.analytics.track('ai_feedback_requested', { feedbackType, wordCount });
        },
        essayVersionCreated: (essayTitle, versionNumber) => {
            window.analytics.track('essay_version_created', { essayTitle, versionNumber });
        },
        chatMessageSent: (messageLength, category) => {
            window.analytics.track('chat_message_sent', { messageLength, category });
        },
    };

})();
