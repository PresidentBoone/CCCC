// Global Error Boundary for CollegeClimb AI Platform
// Catches all unhandled errors and provides user-friendly feedback

class ErrorBoundary {
  constructor(options = {}) {
    this.options = {
      showErrorUI: options.showErrorUI !== false,
      reportToMonitoring: options.reportToMonitoring !== false,
      logToConsole: options.logToConsole !== false,
      ...options
    };

    this.errorCount = 0;
    this.maxErrors = 10; // Prevent infinite error loops

    this.initialize();
  }

  initialize() {
    // Catch synchronous errors
    window.addEventListener('error', this.handleError.bind(this));

    // Catch promise rejections
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));

    // Catch resource loading errors
    window.addEventListener('error', this.handleResourceError.bind(this), true);

    console.log('🛡️ Error Boundary initialized');
  }

  handleError(event) {
    this.errorCount++;

    if (this.errorCount > this.maxErrors) {
      console.error('Too many errors, stopping error handling');
      return;
    }

    const error = event.error || new Error(event.message);

    // Filter out non-critical errors that shouldn't show UI
    const shouldShowUI = this.isCriticalError(error, event);

    if (this.options.logToConsole) {
      console.error('💥 Application Error:', {
        message: error.message,
        stack: error.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        critical: shouldShowUI
      });
    }

    // Only show UI for critical errors
    if (this.options.showErrorUI && shouldShowUI) {
      this.showErrorUI(error, 'error');
    }

    if (this.options.reportToMonitoring) {
      this.reportToMonitoring(error, {
        type: 'error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    }

    // Prevent default browser error handling
    event.preventDefault();
  }

  handlePromiseRejection(event) {
    this.errorCount++;

    if (this.errorCount > this.maxErrors) {
      return;
    }

    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));

    // Filter out non-critical promise rejections
    const shouldShowUI = this.isCriticalError(error, event);

    if (this.options.logToConsole) {
      console.error('💥 Unhandled Promise Rejection:', {
        message: error.message,
        stack: error.stack,
        promise: event.promise,
        critical: shouldShowUI
      });
    }

    // Only show UI for critical errors
    if (this.options.showErrorUI && shouldShowUI) {
      this.showErrorUI(error, 'promise');
    }

    if (this.options.reportToMonitoring) {
      this.reportToMonitoring(error, {
        type: 'promise-rejection'
      });
    }

    // Prevent default browser handling
    event.preventDefault();
  }

  handleResourceError(event) {
    // Only handle resource loading errors (img, script, link)
    if (event.target !== window) {
      const element = event.target;
      const resourceType = element.tagName.toLowerCase();

      if (this.options.logToConsole) {
        console.warn('⚠️ Resource Loading Error:', {
          type: resourceType,
          src: element.src || element.href,
          currentSrc: element.currentSrc
        });
      }

      // Don't show UI for resource errors (not critical)
      // But report to monitoring
      if (this.options.reportToMonitoring) {
        this.reportToMonitoring(new Error(`Failed to load ${resourceType}`), {
          type: 'resource-error',
          resourceType,
          src: element.src || element.href
        });
      }
    }
  }

  /**
   * Determine if an error is critical enough to show UI
   * Filters out common non-critical errors
   */
  isCriticalError(error, event) {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorStack = error.stack?.toLowerCase() || '';

    // List of non-critical error patterns to ignore
    const nonCriticalPatterns = [
      // Network errors (handled by network-monitor.js)
      'network',
      'failed to fetch',
      'load failed',
      'networkerror',

      // Firestore errors (handled by safeFirestoreOperation)
      'permission-denied',
      'unavailable',
      'unauthenticated',
      'firestore',

      // Browser extension errors
      'chrome-extension',
      'moz-extension',
      'extension',

      // Third-party script errors
      'script error',
      'adsbygoogle',

      // iOS Safari errors (handled by unified-auth)
      'quotaexceedederror',
      'ns_error_file_corrupted',
      'localstorage',

      // CORS errors (expected in some cases)
      'cors',
      'cross-origin',

      // Timeout errors (not critical)
      'timeout',

      // AbortController errors (expected)
      'aborted',
      'abort',

      // ResizeObserver errors (benign)
      'resizeobserver'
    ];

    // Check if error matches any non-critical pattern
    for (const pattern of nonCriticalPatterns) {
      if (errorMessage.includes(pattern) || errorStack.includes(pattern)) {
        return false; // Not critical, don't show UI
      }
    }

    // Critical errors that should always show UI
    const criticalPatterns = [
      'syntaxerror',
      'referenceerror',
      'typeerror: null',
      'typeerror: undefined',
      'cannot read property',
      'cannot read properties of null',
      'cannot read properties of undefined'
    ];

    // Only show UI for actual critical errors
    for (const pattern of criticalPatterns) {
      if (errorMessage.includes(pattern) || errorStack.includes(pattern)) {
        return true; // Critical error, show UI
      }
    }

    // Default: don't show UI for unknown errors (just log them)
    return false;
  }

  showErrorUI(error, type = 'error') {
    // Check if error container exists
    let container = document.getElementById('global-error-container');
    
    if (!container) {
      // Create error container if it doesn't exist
      container = document.createElement('div');
      container.id = 'global-error-container';
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        padding: 2rem;
      `;
      document.body.appendChild(container);
    }

    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';

    container.innerHTML = `
      <div style="
        background: white;
        border-radius: 16px;
        padding: 2rem;
        max-width: 500px;
        width: 100%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      ">
        <div style="font-size: 4rem; margin-bottom: 1rem;">😔</div>
        <h2 style="
          color: #333;
          margin-bottom: 1rem;
          font-size: 1.5rem;
          font-weight: 700;
        ">Oops! Something went wrong</h2>
        
        <p style="
          color: #666;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        ">
          We're sorry, but we encountered an unexpected error. 
          Our team has been notified and we're working on fixing it.
        </p>

        ${isDevelopment ? `
          <div style="
            background: #f5f5f5;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            text-align: left;
            font-family: monospace;
            font-size: 0.85rem;
            color: #d32f2f;
            overflow-x: auto;
            max-height: 200px;
          ">
            <strong>Error:</strong> ${this.escapeHtml(error.message)}<br>
            ${error.stack ? `<br><strong>Stack:</strong><br>${this.escapeHtml(error.stack).substring(0, 500)}...` : ''}
          </div>
        ` : ''}

        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button onclick="location.reload()" style="
            background: linear-gradient(135deg, #2a357a 0%, #a07bcc 100%);
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            font-size: 1rem;
          ">
            Refresh Page
          </button>
          
          <button onclick="document.getElementById('global-error-container').remove()" style="
            background: #f5f5f5;
            color: #333;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            font-size: 1rem;
          ">
            Dismiss
          </button>
        </div>

        ${isDevelopment ? '' : `
          <p style="
            color: #999;
            font-size: 0.85rem;
            margin-top: 1rem;
          ">
            Error ID: ${this.generateErrorId()}
          </p>
        `}
      </div>
    `;

    container.style.display = 'flex';
  }

  reportToMonitoring(error, context = {}) {
    // Report to Sentry if available
    if (window.Sentry) {
      Sentry.captureException(error, {
        extra: context
      });
    }

    // Report to custom analytics
    if (window.gtag) {
      gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        ...context
      });
    }

    // Log to server (optional - create endpoint)
    if (navigator.sendBeacon) {
      const errorData = {
        message: error.message,
        stack: error.stack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        ...context
      };

      // TODO: Create /api/log-error endpoint before enabling
      // navigator.sendBeacon('/api/log-error', JSON.stringify(errorData));
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  generateErrorId() {
    return 'ERR-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
  }

  reset() {
    this.errorCount = 0;
    const container = document.getElementById('global-error-container');
    if (container) {
      container.remove();
    }
  }
}

// Initialize global error boundary
const globalErrorBoundary = new ErrorBoundary({
  showErrorUI: true,
  reportToMonitoring: true,
  logToConsole: true
});

// Make available globally
window.ErrorBoundary = ErrorBoundary;
window.globalErrorBoundary = globalErrorBoundary;

console.log('✅ Global Error Boundary active');

// export default ErrorBoundary;
