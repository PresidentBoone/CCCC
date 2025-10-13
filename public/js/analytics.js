/**
 * Analytics & Tracking System - Week 4 Quality Enhancement
 * Tracks user behavior, errors, and performance metrics
 * 
 * Privacy-focused, client-side analytics with optional backend sync
 * 
 * Usage:
 * Analytics.trackEvent('essay_analyzed', { wordCount: 500, type: 'personal' });
 * Analytics.trackPageView('/dashboard');
 * Analytics.trackError(error, 'critical');
 */

class AnalyticsTracker {
    constructor() {
        this.events = [];
        this.session = {
            id: this.generateSessionId(),
            startTime: Date.now(),
            pageViews: [],
            events: [],
            errors: []
        };
        
        this.user = {
            id: null,
            firstVisit: this.getFirstVisit(),
            returning: this.isReturningUser()
        };
        
        this.performance = {
            pageLoadTime: 0,
            timeToInteractive: 0,
            apiCalls: []
        };
        
        this.init();
    }

    /**
     * Initialize analytics
     */
    init() {
        // Track page load performance
        this.trackPageLoad();
        
        // Track page view
        this.trackPageView(window.location.pathname);
        
        // Setup event listeners
        this.setupListeners();
        
        // Periodic sync to backend
        this.startPeriodicSync();
        
        // Track user engagement
        this.trackEngagement();
    }

    /**
     * Track page load performance
     */
    trackPageLoad() {
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
            const timeToInteractive = timing.domInteractive - timing.navigationStart;
            
            this.performance.pageLoadTime = loadTime;
            this.performance.domReadyTime = domReady;
            this.performance.timeToInteractive = timeToInteractive;
            
            this.trackEvent('page_performance', {
                loadTime,
                domReady,
                timeToInteractive,
                url: window.location.pathname
            });
        }
    }

    /**
     * Track custom event
     */
    trackEvent(eventName, properties = {}) {
        const event = {
            name: eventName,
            properties: {
                ...properties,
                timestamp: Date.now(),
                url: window.location.pathname,
                sessionId: this.session.id
            }
        };
        
        this.session.events.push(event);
        this.events.push(event);
        
        // Log to console in development
        if (this.isDevelopment()) {
            console.log('📊 Analytics Event:', eventName, properties);
        }
        
        // Store in localStorage for persistence
        this.saveToStorage();
        
        return event;
    }

    /**
     * Track page view
     */
    trackPageView(path) {
        const pageView = {
            path,
            timestamp: Date.now(),
            referrer: document.referrer,
            sessionId: this.session.id
        };
        
        this.session.pageViews.push(pageView);
        
        this.trackEvent('page_view', {
            path,
            referrer: document.referrer,
            title: document.title
        });
    }

    /**
     * Track error
     */
    trackError(error, severity = 'error', context = {}) {
        const errorEvent = {
            message: error.message || error,
            stack: error.stack,
            severity,
            context,
            timestamp: Date.now(),
            url: window.location.pathname,
            userAgent: navigator.userAgent,
            sessionId: this.session.id
        };
        
        this.session.errors.push(errorEvent);
        
        this.trackEvent('error_occurred', {
            error: error.message || error,
            severity,
            context
        });
        
        // Send critical errors immediately
        if (severity === 'critical') {
            this.syncToBackend();
        }
    }

    /**
     * Track API call performance
     */
    trackApiCall(endpoint, duration, success, statusCode) {
        const apiCall = {
            endpoint,
            duration,
            success,
            statusCode,
            timestamp: Date.now()
        };
        
        this.performance.apiCalls.push(apiCall);
        
        this.trackEvent('api_call', {
            endpoint,
            duration,
            success,
            statusCode
        });
    }

    /**
     * Track user engagement
     */
    trackEngagement() {
        let lastActivity = Date.now();
        let totalActiveTime = 0;
        let isActive = true;
        
        // Track mouse/keyboard activity
        const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        activityEvents.forEach(eventType => {
            document.addEventListener(eventType, () => {
                const now = Date.now();
                if (now - lastActivity > 30000) { // 30 seconds of inactivity
                    this.trackEvent('user_became_active');
                }
                lastActivity = now;
                isActive = true;
            });
        });
        
        // Track time on page
        setInterval(() => {
            if (isActive) {
                totalActiveTime += 10;
            }
            
            // Reset activity flag
            if (Date.now() - lastActivity > 10000) { // 10 seconds
                isActive = false;
            }
        }, 10000);
        
        // Track session duration on page unload
        window.addEventListener('beforeunload', () => {
            this.trackEvent('session_end', {
                duration: Date.now() - this.session.startTime,
                activeTime: totalActiveTime * 1000,
                pageViews: this.session.pageViews.length,
                events: this.session.events.length
            });
            
            this.syncToBackend();
        });
    }

    /**
     * Track conversion/goal completion
     */
    trackConversion(goalName, value = null) {
        this.trackEvent('conversion', {
            goal: goalName,
            value,
            timestamp: Date.now()
        });
        
        // Store conversion for funnel analysis
        const conversions = this.getConversions();
        conversions.push({
            goal: goalName,
            value,
            timestamp: Date.now()
        });
        localStorage.setItem('cc_conversions', JSON.stringify(conversions));
    }

    /**
     * Track feature usage
     */
    trackFeatureUsage(featureName, action = 'used') {
        this.trackEvent('feature_usage', {
            feature: featureName,
            action,
            timestamp: Date.now()
        });
    }

    /**
     * Setup event listeners for automatic tracking
     */
    setupListeners() {
        // Track link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link) {
                this.trackEvent('link_click', {
                    url: link.href,
                    text: link.textContent.trim(),
                    external: !link.href.startsWith(window.location.origin)
                });
            }
            
            // Track button clicks
            const button = e.target.closest('button');
            if (button) {
                this.trackEvent('button_click', {
                    text: button.textContent.trim(),
                    id: button.id,
                    class: button.className
                });
            }
        });
        
        // Track form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            this.trackEvent('form_submit', {
                formId: form.id,
                formName: form.name,
                action: form.action
            });
        });
        
        // Track visibility changes (tab switching)
        document.addEventListener('visibilitychange', () => {
            this.trackEvent('visibility_change', {
                hidden: document.hidden
            });
        });
    }

    /**
     * Get user data
     */
    setUser(userId, properties = {}) {
        this.user.id = userId;
        this.user.properties = properties;
        
        // Store in localStorage
        localStorage.setItem('cc_user', JSON.stringify(this.user));
        
        this.trackEvent('user_identified', { userId });
    }

    /**
     * Generate session ID
     */
    generateSessionId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get first visit timestamp
     */
    getFirstVisit() {
        let firstVisit = localStorage.getItem('cc_first_visit');
        if (!firstVisit) {
            firstVisit = Date.now().toString();
            localStorage.setItem('cc_first_visit', firstVisit);
        }
        return parseInt(firstVisit);
    }

    /**
     * Check if returning user
     */
    isReturningUser() {
        const visits = localStorage.getItem('cc_visit_count') || '0';
        const count = parseInt(visits) + 1;
        localStorage.setItem('cc_visit_count', count.toString());
        return count > 1;
    }

    /**
     * Get conversions
     */
    getConversions() {
        try {
            return JSON.parse(localStorage.getItem('cc_conversions') || '[]');
        } catch {
            return [];
        }
    }

    /**
     * Save to localStorage
     */
    saveToStorage() {
        try {
            // Keep only last 100 events to avoid storage limits
            const recentEvents = this.events.slice(-100);
            localStorage.setItem('cc_analytics', JSON.stringify({
                session: this.session,
                user: this.user,
                performance: this.performance,
                events: recentEvents
            }));
        } catch (error) {
            console.warn('Failed to save analytics to storage:', error);
        }
    }

    /**
     * Sync to backend
     */
    async syncToBackend() {
        try {
            const data = {
                session: this.session,
                user: this.user,
                performance: this.performance,
                events: this.events
            };
            
            // Only sync if there are events
            if (this.events.length === 0) return;
            
            // Send to backend (implement your endpoint)
            if (this.isDevelopment()) {
                console.log('📤 Would sync analytics to backend:', data);
                return;
            }
            
            // Uncomment when backend is ready
            /*
            const response = await fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                // Clear synced events
                this.events = [];
            }
            */
            
        } catch (error) {
            console.error('Failed to sync analytics:', error);
        }
    }

    /**
     * Start periodic sync
     */
    startPeriodicSync() {
        // Sync every 5 minutes
        setInterval(() => {
            this.syncToBackend();
        }, 5 * 60 * 1000);
    }

    /**
     * Get analytics summary
     */
    getSummary() {
        return {
            session: {
                id: this.session.id,
                duration: Date.now() - this.session.startTime,
                pageViews: this.session.pageViews.length,
                events: this.session.events.length,
                errors: this.session.errors.length
            },
            user: {
                id: this.user.id,
                returning: this.user.returning,
                daysSinceFirstVisit: Math.floor((Date.now() - this.user.firstVisit) / (1000 * 60 * 60 * 24))
            },
            performance: {
                pageLoadTime: this.performance.pageLoadTime,
                avgApiResponseTime: this.getAvgApiResponseTime()
            }
        };
    }

    /**
     * Get average API response time
     */
    getAvgApiResponseTime() {
        if (this.performance.apiCalls.length === 0) return 0;
        
        const total = this.performance.apiCalls.reduce((sum, call) => sum + call.duration, 0);
        return Math.round(total / this.performance.apiCalls.length);
    }

    /**
     * Check if development mode
     */
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname.includes('dev');
    }

    /**
     * Export analytics data
     */
    exportData() {
        const data = {
            session: this.session,
            user: this.user,
            performance: this.performance,
            events: this.events,
            summary: this.getSummary()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Create global instance
window.Analytics = new AnalyticsTracker();

// Export
export default window.Analytics;
