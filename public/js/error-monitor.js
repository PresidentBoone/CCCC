/**
 * 🚨 Error Monitor
 * Comprehensive error tracking and monitoring (Sentry-like)
 * Part of the Billion-Dollar Platform Infrastructure
 */

class ErrorMonitor {
    constructor() {
        this.errors = [];
        this.maxErrors = 50;
        this.enabled = true;
        this.reportEndpoint = '/api/error-report'; // Optional backend endpoint
        this.init();
    }

    init() {
        this.setupErrorHandlers();
        this.setupConsoleProxy();
        this.setupNetworkMonitoring();
    }

    /**
     * Setup Global Error Handlers
     */
    setupErrorHandlers() {
        // Catch JavaScript errors
        window.addEventListener('error', (event) => {
            this.captureError({
                type: 'javascript_error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: new Date().toISOString()
            });
        });

        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.captureError({
                type: 'unhandled_promise',
                message: event.reason?.message || 'Unhandled Promise Rejection',
                reason: String(event.reason),
                stack: event.reason?.stack,
                timestamp: new Date().toISOString()
            });
        });

        // Catch resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.captureError({
                    type: 'resource_error',
                    message: `Failed to load: ${event.target.tagName}`,
                    src: event.target.src || event.target.href,
                    timestamp: new Date().toISOString()
                });
            }
        }, true);
    }

    /**
     * Capture and Log Errors
     */
    captureError(error) {
        if (!this.enabled) return;

        // Enrich error with context
        const enrichedError = {
            ...error,
            url: window.location.href,
            userAgent: navigator.userAgent,
            userId: this.getUserId(),
            sessionId: this.getSessionId(),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            memory: this.getMemoryInfo(),
            timestamp: error.timestamp || new Date().toISOString()
        };

        // Store error
        this.errors.push(enrichedError);
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // Log to console in development
        if (window.location.hostname === 'localhost') {
            console.error('🚨 Error captured:', enrichedError);
        }

        // Track in analytics
        if (window.analytics) {
            window.analytics.trackError(
                enrichedError.type,
                enrichedError.message,
                enrichedError
            );
        }

        // Report to backend (optional)
        this.reportError(enrichedError);

        // Show user-friendly message for critical errors
        if (this.isCriticalError(enrichedError)) {
            this.showErrorMessage(enrichedError);
        }
    }

    /**
     * Manually Capture Exceptions
     */
    captureException(error, context = {}) {
        this.captureError({
            type: 'manual_exception',
            message: error.message || String(error),
            stack: error.stack,
            context,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Capture Custom Messages
     */
    captureMessage(message, level = 'info', context = {}) {
        this.captureError({
            type: 'message',
            level,
            message,
            context,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Setup Console Proxy (to catch console.error)
     */
    setupConsoleProxy() {
        const originalError = console.error;
        console.error = (...args) => {
            this.captureMessage(
                args.map(arg => String(arg)).join(' '),
                'error',
                { source: 'console.error' }
            );
            originalError.apply(console, args);
        };

        const originalWarn = console.warn;
        console.warn = (...args) => {
            this.captureMessage(
                args.map(arg => String(arg)).join(' '),
                'warning',
                { source: 'console.warn' }
            );
            originalWarn.apply(console, args);
        };
    }

    /**
     * Monitor Network Requests
     */
    setupNetworkMonitoring() {
        // Intercept fetch
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const startTime = Date.now();
            const url = args[0];
            
            try {
                const response = await originalFetch(...args);
                const duration = Date.now() - startTime;

                // Log slow requests
                if (duration > 3000) {
                    this.captureMessage(
                        `Slow network request: ${url}`,
                        'warning',
                        { url, duration, status: response.status }
                    );
                }

                // Log failed requests
                if (!response.ok) {
                    this.captureError({
                        type: 'network_error',
                        message: `HTTP ${response.status}: ${url}`,
                        url,
                        status: response.status,
                        statusText: response.statusText,
                        duration,
                        timestamp: new Date().toISOString()
                    });
                }

                return response;
            } catch (error) {
                this.captureError({
                    type: 'network_error',
                    message: `Network request failed: ${url}`,
                    url,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                throw error;
            }
        };
    }

    /**
     * Check if Error is Critical
     */
    isCriticalError(error) {
        const criticalTypes = [
            'firebase_auth_error',
            'payment_error',
            'data_loss_error'
        ];
        
        return criticalTypes.includes(error.type) ||
               error.message?.toLowerCase().includes('critical') ||
               error.message?.toLowerCase().includes('fatal');
    }

    /**
     * Show User-Friendly Error Message
     */
    showErrorMessage(error) {
        // Check if we should show this error to the user
        if (!this.shouldShowToUser(error)) return;

        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="error-content">
                <div class="error-icon">⚠️</div>
                <div class="error-text">
                    <strong>Oops! Something went wrong</strong>
                    <p>${this.getUserFriendlyMessage(error)}</p>
                </div>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add styles
        if (!document.getElementById('error-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'error-notification-styles';
            styles.textContent = `
                .error-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #fff;
                    border-left: 4px solid #ef4444;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    border-radius: 8px;
                    padding: 16px;
                    max-width: 400px;
                    z-index: 10000;
                    animation: slideIn 0.3s ease-out;
                }
                .error-content {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }
                .error-icon {
                    font-size: 24px;
                    flex-shrink: 0;
                }
                .error-text strong {
                    display: block;
                    color: #1f2937;
                    margin-bottom: 4px;
                }
                .error-text p {
                    color: #6b7280;
                    margin: 0;
                    font-size: 14px;
                }
                .error-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: #9ca3af;
                    cursor: pointer;
                    padding: 0;
                    line-height: 1;
                    flex-shrink: 0;
                }
                .error-close:hover {
                    color: #6b7280;
                }
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    shouldShowToUser(error) {
        // Don't show technical errors
        const hideTypes = ['console_message', 'message'];
        if (hideTypes.includes(error.type)) return false;

        // Don't show too many errors at once
        const recentNotifications = document.querySelectorAll('.error-notification');
        if (recentNotifications.length >= 3) return false;

        return true;
    }

    getUserFriendlyMessage(error) {
        const messages = {
            network_error: "We're having trouble connecting. Please check your internet connection and try again.",
            javascript_error: "Something unexpected happened. Please refresh the page and try again.",
            resource_error: "Some content failed to load. Please refresh the page.",
            firebase_auth_error: "There was a problem with authentication. Please try logging in again.",
            default: "An error occurred. Please try again or contact support if the problem persists."
        };

        return messages[error.type] || messages.default;
    }

    /**
     * Report Error to Backend
     */
    async reportError(error) {
        // Disable error reporting until backend endpoint is set up
        // TODO: Implement /api/error-report endpoint before enabling
        return;

        /* Uncomment when backend is ready:
        // Only report in production
        if (window.location.hostname === 'localhost') return;

        try {
            await fetch(this.reportEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(error)
            });
        } catch (e) {
            // Silently fail if reporting doesn't work
        }
        */
    }

    /**
     * Helper Methods
     */
    getUserId() {
        if (window.firebase && window.firebase.auth().currentUser) {
            return window.firebase.auth().currentUser.uid;
        }
        return localStorage.getItem('anonymous_id') || 'unknown';
    }

    getSessionId() {
        return sessionStorage.getItem('session_id') || 'unknown';
    }

    getMemoryInfo() {
        if (performance.memory) {
            return {
                usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB',
                totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576) + 'MB'
            };
        }
        return null;
    }

    /**
     * Get Error Report
     */
    getErrors(filter = {}) {
        let filtered = this.errors;

        if (filter.type) {
            filtered = filtered.filter(e => e.type === filter.type);
        }

        if (filter.level) {
            filtered = filtered.filter(e => e.level === filter.level);
        }

        return filtered;
    }

    /**
     * Clear Errors
     */
    clearErrors() {
        this.errors = [];
    }

    /**
     * Enable/Disable Monitoring
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.errorMonitor = new ErrorMonitor();
    });
} else {
    window.errorMonitor = new ErrorMonitor();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorMonitor;
}
