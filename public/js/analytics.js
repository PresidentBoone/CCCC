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
        diagnosticComplete: (satScore, actScore, duration) => {
            window.analytics.track('diagnostic_complete', { satScore, actScore, duration });
        },
        practiceSession: (subject, questionCount, accuracy) => {
            window.analytics.track('practice_session', { subject, questionCount, accuracy });
        },
    };

})();
