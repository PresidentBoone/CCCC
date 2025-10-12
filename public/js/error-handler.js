// Centralized Error Handler for CollegeClimb AI Platform
// Provides consistent error handling across all pages and APIs

class ErrorHandler {
  constructor() {
    this.errorMessages = {
      // Authentication errors
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      
      // Firestore errors
      'permission-denied': 'You don\'t have permission to perform this action.',
      'not-found': 'The requested data could not be found.',
      'already-exists': 'This item already exists.',
      'resource-exhausted': 'Too many requests. Please slow down.',
      'unavailable': 'Service temporarily unavailable. Please try again.',
      
      // Validation errors
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'MISSING_REQUIRED_FIELD': 'Please fill in all required fields.',
      'INVALID_FORMAT': 'Invalid format. Please check your input.',
      
      // API errors
      'NETWORK_ERROR': 'Network error. Please check your connection.',
      'TIMEOUT_ERROR': 'Request timed out. Please try again.',
      'SERVER_ERROR': 'Server error. Our team has been notified.',
      'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait before trying again.',
      
      // Default
      'DEFAULT': 'Something went wrong. Please try again.'
    };
  }

  /**
   * Handle and display error to user
   * @param {Error} error - The error object
   * @param {Object} context - Additional context about the error
   */
  handle(error, context = {}) {
    const errorInfo = this.parseError(error);

    // Log to console in development
    if (this.isDevelopment()) {
      console.error('Error occurred:', {
        error,
        errorInfo,
        context
      });
    }

    // Show user-friendly message
    this.showToast(errorInfo.message, 'error');

    // Report to monitoring service
    this.reportError(error, { ...errorInfo, ...context });

    // Track in analytics
    this.trackError(errorInfo, context);

    return errorInfo;
  }

  /**
   * Parse error into user-friendly format
   */
  parseError(error) {
    let message = this.errorMessages.DEFAULT;
    let code = 'UNKNOWN_ERROR';
    let shouldRetry = false;

    if (typeof error === 'string') {
      message = error;
    } else if (error?.code) {
      code = error.code;
      message = this.errorMessages[error.code] || error.message || this.errorMessages.DEFAULT;
      shouldRetry = this.isRetryableError(error.code);
    } else if (error?.message) {
      message = error.message;
    }

    return {
      message,
      code,
      shouldRetry,
      stack: error?.stack
    };
  }

  /**
   * Determine if error is retryable
   */
  isRetryableError(code) {
    const retryable = [
      'unavailable',
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'resource-exhausted',
      'auth/network-request-failed'
    ];
    return retryable.includes(code);
  }

  /**
   * Show toast notification to user
   */
  showToast(message, type = 'info', duration = 5000) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.error-handler-toast');
    existingToasts.forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `error-handler-toast error-handler-toast-${type}`;
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };

    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      color: #333;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      z-index: 999998;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-width: 300px;
      max-width: 500px;
      border-left: 4px solid ${colors[type]};
      transform: translateX(120%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: 'Inter', sans-serif;
      font-size: 0.95rem;
    `;

    toast.innerHTML = `
      <span style="font-size: 1.5rem;">${icons[type]}</span>
      <span style="flex: 1;">${this.escapeHtml(message)}</span>
      <button onclick="this.parentElement.remove()" style="
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #999;
        padding: 0;
        line-height: 1;
      ">&times;</button>
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 10);

    // Auto dismiss
    setTimeout(() => {
      toast.style.transform = 'translateX(120%)';
      setTimeout(() => toast.remove(), 300);
    }, duration);

    return toast;
  }

  /**
   * Show inline error message
   */
  showInlineError(element, message) {
    // Remove existing error
    const existing = element.parentElement.querySelector('.inline-error');
    if (existing) existing.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'inline-error';
    errorDiv.style.cssText = `
      color: #ef4444;
      font-size: 0.85rem;
      margin-top: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    `;
    errorDiv.innerHTML = `<span>⚠️</span><span>${this.escapeHtml(message)}</span>`;

    element.parentElement.appendChild(errorDiv);

    // Highlight input
    element.style.borderColor = '#ef4444';
    setTimeout(() => {
      element.style.borderColor = '';
    }, 3000);
  }

  /**
   * Report error to monitoring service
   */
  reportError(error, context) {
    // Report to Sentry if available
    if (window.Sentry) {
      Sentry.captureException(error, {
        extra: context
      });
    }

    // Report to custom backend (if available)
    if (navigator.sendBeacon && !this.isDevelopment()) {
      const errorData = {
        message: error?.message || String(error),
        stack: error?.stack,
        code: error?.code,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        ...context
      };

      try {
        navigator.sendBeacon('/api/log-error', JSON.stringify(errorData));
      } catch (e) {
        console.error('Failed to report error:', e);
      }
    }
  }

  /**
   * Track error in analytics
   */
  trackError(errorInfo, context) {
    if (window.gtag) {
      gtag('event', 'exception', {
        description: errorInfo.message,
        fatal: false,
        error_code: errorInfo.code,
        ...context
      });
    }
  }

  /**
   * Check if in development mode
   */
  isDevelopment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Async error wrapper for functions
   */
  async wrap(fn, context = {}) {
    try {
      return await fn();
    } catch (error) {
      this.handle(error, context);
      throw error; // Re-throw for caller to handle if needed
    }
  }

  /**
   * Show loading state while executing async function
   */
  async withLoading(fn, element, loadingText = 'Loading...') {
    const originalText = element.innerHTML;
    element.disabled = true;
    element.innerHTML = `
      <span style="display: inline-flex; align-items: center; gap: 0.5rem;">
        <span style="
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        "></span>
        ${loadingText}
      </span>
    `;

    // Add spin animation if not exists
    if (!document.querySelector('#spin-animation')) {
      const style = document.createElement('style');
      style.id = 'spin-animation';
      style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
      document.head.appendChild(style);
    }

    try {
      const result = await fn();
      return result;
    } catch (error) {
      this.handle(error);
      throw error;
    } finally {
      element.disabled = false;
      element.innerHTML = originalText;
    }
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Make available globally
window.ErrorHandler = ErrorHandler;
window.errorHandler = errorHandler;

// Helper functions for easy access
window.handleError = (error, context) => errorHandler.handle(error, context);
window.showToast = (message, type, duration) => errorHandler.showToast(message, type, duration);
window.showInlineError = (element, message) => errorHandler.showInlineError(element, message);

console.log('✅ Error Handler initialized');

export default errorHandler;
