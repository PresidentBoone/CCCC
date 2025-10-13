/**
 * 📊 Analytics Tracker
 * Comprehensive analytics and user behavior tracking
 * Part of the Billion-Dollar Platform Infrastructure
 */

class AnalyticsTracker {
    constructor() {
        this.gaId = 'G-E0B2RQM9XS'; // Google Analytics ID
        this.sessionStart = Date.now();
        this.events = [];
        this.userProperties = {};
        this.init();
    }

    init() {
        this.setupGoogleAnalytics();
        this.trackPageView();
        this.setupEventListeners();
        this.trackUserBehavior();
        this.setupScrollTracking();
    }

    /**
     * Setup Google Analytics
     */
    setupGoogleAnalytics() {
        // Check if GA is already loaded
        if (window.gtag) {
            console.log('✅ Google Analytics already initialized');
            return;
        }

        // Load GA script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaId}`;
        document.head.appendChild(script);

        // Initialize GA
        window.dataLayer = window.dataLayer || [];
        function gtag() {
            window.dataLayer.push(arguments);
        }
        window.gtag = gtag;

        gtag('js', new Date());
        gtag('config', this.gaId, {
            send_page_view: false, // We'll handle this manually
            anonymize_ip: true
        });

        console.log('✅ Google Analytics initialized');
    }

    /**
     * Track Page Views
     */
    trackPageView(customData = {}) {
        const pageData = {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname,
            ...customData
        };

        if (window.gtag) {
            gtag('event', 'page_view', pageData);
        }

        // Track in local events
        this.logEvent('page_view', pageData);
    }

    /**
     * Track Custom Events
     */
    trackEvent(eventName, eventData = {}) {
        const enrichedData = {
            ...eventData,
            timestamp: new Date().toISOString(),
            user_id: this.getUserId(),
            session_id: this.getSessionId()
        };

        if (window.gtag) {
            gtag('event', eventName, enrichedData);
        }

        this.logEvent(eventName, enrichedData);
    }

    /**
     * Track User Actions
     */
    trackAction(action, category, label = '', value = null) {
        const eventData = {
            event_category: category,
            event_label: label
        };

        if (value !== null) {
            eventData.value = value;
        }

        this.trackEvent(action, eventData);
    }

    /**
     * Track Conversions
     */
    trackConversion(conversionName, value = 0, currency = 'USD') {
        this.trackEvent('conversion', {
            conversion_name: conversionName,
            value: value,
            currency: currency
        });

        // Track in Firebase if available
        if (window.firebase && window.firebase.auth().currentUser) {
            const userId = window.firebase.auth().currentUser.uid;
            window.firebase.firestore().collection('conversions').add({
                userId,
                conversionName,
                value,
                currency,
                timestamp: new Date()
            });
        }
    }

    /**
     * Track Feature Usage
     */
    trackFeatureUsage(featureName, details = {}) {
        this.trackEvent('feature_usage', {
            feature_name: featureName,
            ...details
        });
    }

    /**
     * Track Errors
     */
    trackError(errorType, errorMessage, errorDetails = {}) {
        this.trackEvent('error', {
            error_type: errorType,
            error_message: errorMessage,
            ...errorDetails
        });

        // Also log to console in development
        if (window.location.hostname === 'localhost') {
            console.error('Error tracked:', errorType, errorMessage, errorDetails);
        }
    }

    /**
     * Track User Timing
     */
    trackTiming(category, variable, timeMs, label = '') {
        this.trackEvent('timing_complete', {
            timing_category: category,
            timing_var: variable,
            value: timeMs,
            timing_label: label
        });
    }

    /**
     * Setup Automatic Event Tracking
     */
    setupEventListeners() {
        // Track button clicks
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button, a.btn, .cta-button');
            if (button) {
                const buttonText = button.textContent.trim();
                const buttonId = button.id || 'unnamed';
                
                this.trackAction('button_click', 'engagement', buttonText || buttonId);
            }

            // Track navigation links
            const link = e.target.closest('a');
            if (link && link.href && !link.href.startsWith('javascript:')) {
                this.trackAction('navigation_click', 'navigation', link.textContent.trim());
            }
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const formId = form.id || form.name || 'unnamed_form';
            
            this.trackAction('form_submit', 'engagement', formId);
        });

        // Track video plays
        document.addEventListener('play', (e) => {
            if (e.target.tagName === 'VIDEO') {
                this.trackAction('video_play', 'engagement', e.target.src || 'video');
            }
        }, true);

        // Track errors
        window.addEventListener('error', (e) => {
            this.trackError('javascript_error', e.message, {
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno
            });
        });

        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.trackError('promise_rejection', e.reason?.message || 'Unknown error', {
                reason: String(e.reason)
            });
        });
    }

    /**
     * Track User Behavior
     */
    trackUserBehavior() {
        // Track time on page
        let timeOnPage = 0;
        const interval = setInterval(() => {
            timeOnPage += 10;
        }, 10000); // Every 10 seconds

        // Track when user leaves
        window.addEventListener('beforeunload', () => {
            clearInterval(interval);
            this.trackTiming('user_engagement', 'time_on_page', timeOnPage * 1000);
        });

        // Track visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackAction('page_hidden', 'engagement');
            } else {
                this.trackAction('page_visible', 'engagement');
            }
        });

        // Track rage clicks (user frustration)
        let clickCount = 0;
        let clickTimer = null;
        document.addEventListener('click', () => {
            clickCount++;
            
            if (clickCount >= 5) {
                this.trackEvent('rage_click', {
                    location: window.location.pathname
                });
                clickCount = 0;
            }

            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 2000);
        });
    }

    /**
     * Track Scroll Depth
     */
    setupScrollTracking() {
        const milestones = [25, 50, 75, 100];
        const tracked = new Set();

        const checkScroll = () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            milestones.forEach(milestone => {
                if (scrollPercent >= milestone && !tracked.has(milestone)) {
                    tracked.add(milestone);
                    this.trackAction('scroll_depth', 'engagement', `${milestone}%`, milestone);
                }
            });
        };

        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(checkScroll, 100);
        }, { passive: true });
    }

    /**
     * Track User Properties
     */
    setUserProperty(property, value) {
        this.userProperties[property] = value;

        if (window.gtag) {
            gtag('set', 'user_properties', {
                [property]: value
            });
        }
    }

    /**
     * Identify User (on login)
     */
    identifyUser(userId, userTraits = {}) {
        this.setUserProperty('user_id', userId);

        if (window.gtag) {
            gtag('config', this.gaId, {
                user_id: userId
            });
        }

        // Set additional traits
        Object.keys(userTraits).forEach(key => {
            this.setUserProperty(key, userTraits[key]);
        });

        this.trackEvent('user_identified', {
            user_id: userId
        });
    }

    /**
     * Track College Application Events
     */
    trackCollegeEvent(eventType, collegeData = {}) {
        const events = {
            college_viewed: 'User viewed college details',
            college_favorited: 'User favorited a college',
            college_compared: 'User compared colleges',
            application_started: 'User started application',
            application_submitted: 'User submitted application'
        };

        this.trackEvent(eventType, {
            description: events[eventType],
            ...collegeData
        });
    }

    /**
     * Track Essay Events
     */
    trackEssayEvent(eventType, essayData = {}) {
        const events = {
            essay_created: 'User created new essay',
            essay_analyzed: 'User analyzed essay with AI',
            essay_improved: 'Essay score improved',
            essay_completed: 'User completed essay'
        };

        this.trackEvent(eventType, {
            description: events[eventType],
            ...essayData
        });
    }

    /**
     * Track Test Prep Events
     */
    trackTestPrepEvent(eventType, testData = {}) {
        const events = {
            test_started: 'User started test prep session',
            question_answered: 'User answered question',
            test_completed: 'User completed test prep session',
            score_improved: 'Test score improved'
        };

        this.trackEvent(eventType, {
            description: events[eventType],
            ...testData
        });
    }

    /**
     * Helper Methods
     */
    getUserId() {
        if (window.firebase && window.firebase.auth().currentUser) {
            return window.firebase.auth().currentUser.uid;
        }
        
        // Return anonymous ID from localStorage
        let anonId = localStorage.getItem('anonymous_id');
        if (!anonId) {
            anonId = 'anon_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('anonymous_id', anonId);
        }
        return anonId;
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('session_id', sessionId);
        }
        return sessionId;
    }

    logEvent(eventName, eventData) {
        this.events.push({
            name: eventName,
            data: eventData,
            timestamp: Date.now()
        });

        // Keep only last 100 events in memory
        if (this.events.length > 100) {
            this.events.shift();
        }

        // Log to console in development
        if (window.location.hostname === 'localhost') {
            console.log('📊 Analytics:', eventName, eventData);
        }
    }

    /**
     * Get Analytics Report
     */
    getReport() {
        return {
            sessionDuration: Date.now() - this.sessionStart,
            eventCount: this.events.length,
            recentEvents: this.events.slice(-10),
            userProperties: this.userProperties
        };
    }
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.analytics = new AnalyticsTracker();
    });
} else {
    window.analytics = new AnalyticsTracker();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsTracker;
}
