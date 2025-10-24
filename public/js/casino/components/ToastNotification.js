/**
 * Casino Module - Toast Notification Component
 *
 * Displays brief, non-intrusive notifications for casino events.
 * Supports multiple toast types (success, info, warning, error).
 *
 * @module casino/components/ToastNotification
 * @author CollegeClimb Casino Team
 * @version 1.0.0
 */

class ToastNotification {
  /**
   * Create a new ToastNotification component
   *
   * @param {Object} options - Configuration options
   * @param {CasinoEngine} options.engine - Casino engine instance (optional)
   * @param {HTMLElement} options.container - Container element (optional, uses body)
   * @param {Object} options.config - UI configuration (optional)
   *
   * @example
   * const toast = new ToastNotification({
   *   config: { position: 'top-right', duration: 3000 }
   * });
   * toast.initialize();
   * toast.show({ message: 'Coins earned!', type: 'success' });
   */
  constructor(options = {}) {
    this.engine = options.engine;
    this.container = options.container || document.body;
    this.config = options.config || this._getDefaultConfig();

    // State
    this.toastQueue = [];
    this.activeToasts = [];
    this.toastContainer = null;
    this.nextToastId = 0;
    this.unsubscribers = [];
  }

  /**
   * Initialize component
   */
  async initialize() {
    // Create toast container
    this._createToastContainer();

    // Subscribe to engine events if engine provided
    if (this.engine) {
      this._subscribeToEngineEvents();
    }

    console.log('[ToastNotification] Initialized');
  }

  /**
   * Destroy component
   */
  destroy() {
    for (const unsubscribe of this.unsubscribers) {
      unsubscribe();
    }
    this.unsubscribers = [];

    if (this.toastContainer && this.toastContainer.parentNode) {
      this.toastContainer.parentNode.removeChild(this.toastContainer);
    }

    console.log('[ToastNotification] Destroyed');
  }

  /**
   * Show a toast notification
   *
   * @param {Object} options - Toast options
   * @param {string} options.message - Message to display
   * @param {string} options.type - Toast type ('success', 'info', 'warning', 'error')
   * @param {number} options.duration - Duration in ms (optional, default from config)
   * @param {string} options.icon - Custom icon (optional)
   * @param {Function} options.onClick - Click handler (optional)
   *
   * @example
   * toast.show({
   *   message: 'You earned 100 coins!',
   *   type: 'success',
   *   duration: 3000,
   *   icon: '💰'
   * });
   */
  show(options = {}) {
    if (!options.message) {
      console.warn('ToastNotification: No message provided');
      return;
    }

    const toast = {
      id: this.nextToastId++,
      message: options.message,
      type: options.type || 'info',
      duration: options.duration !== undefined ? options.duration : this.config.duration,
      icon: options.icon || this._getDefaultIcon(options.type),
      onClick: options.onClick,
      timestamp: Date.now()
    };

    // Check if we're at max visible toasts
    if (this.activeToasts.length >= this.config.maxVisible) {
      // Queue it
      this.toastQueue.push(toast);
    } else {
      // Show immediately
      this._showToast(toast);
    }

    return toast.id;
  }

  /**
   * Shorthand methods for common toast types
   */
  success(message, duration) {
    return this.show({ message, type: 'success', duration });
  }

  info(message, duration) {
    return this.show({ message, type: 'info', duration });
  }

  warning(message, duration) {
    return this.show({ message, type: 'warning', duration });
  }

  error(message, duration) {
    return this.show({ message, type: 'error', duration });
  }

  /**
   * Dismiss a specific toast by ID
   *
   * @param {number} toastId - Toast ID
   */
  dismiss(toastId) {
    const toast = this.activeToasts.find(t => t.id === toastId);
    if (toast && toast.element) {
      this._hideToast(toast);
    }
  }

  /**
   * Dismiss all active toasts
   */
  dismissAll() {
    const toasts = [...this.activeToasts];
    for (const toast of toasts) {
      this._hideToast(toast);
    }
  }

  // ============================================
  // INTERNAL METHODS
  // ============================================

  /**
   * Create toast container
   * @private
   */
  _createToastContainer() {
    const container = document.createElement('div');
    container.className = `toast-container toast-${this.config.position}`;
    container.setAttribute('data-toast-container', '');

    this.container.appendChild(container);
    this.toastContainer = container;

    // Inject styles
    this._injectStyles();
  }

  /**
   * Subscribe to engine events
   * @private
   */
  _subscribeToEngineEvents() {
    if (!this.engine) return;

    // Correct answer
    const unsubCorrect = this.engine.on('correctAnswer', (data) => {
      const message = `+${data.coins} coins, +${data.xp} XP`;
      this.success(message, 2000);

      // Streak milestone
      if (data.streakInfo && data.streakInfo.label) {
        this.info(data.streakInfo.label, 2500);
      }
    });

    // Level up
    const unsubLevelUp = this.engine.on('levelUp', (data) => {
      this.success(`Level Up! Now level ${data.newLevel}`, 4000);
    });

    // Jackpot trigger
    const unsubJackpot = this.engine.on('jackpotTriggered', (data) => {
      this.success('🎰 JACKPOT ROUND TRIGGERED!', 5000);
    });

    // Daily wheel available
    const unsubWheel = this.engine.on('dailyWheelAvailable', () => {
      this.info('🎡 Daily Wheel available!', 5000);
    });

    // Heart lost
    const unsubHeartLost = this.engine.on('heartLost', (data) => {
      this.warning(`Hearts remaining: ${data.heartsRemaining}`, 2000);
    });

    // Error events
    const unsubError = this.engine.on('error', (data) => {
      this.error(data.message || 'An error occurred', 4000);
    });

    this.unsubscribers.push(
      unsubCorrect,
      unsubLevelUp,
      unsubJackpot,
      unsubWheel,
      unsubHeartLost,
      unsubError
    );
  }

  /**
   * Show a toast
   * @private
   */
  _showToast(toast) {
    // Create toast element
    const element = this._createToastElement(toast);
    toast.element = element;

    // Add to container
    this.toastContainer.appendChild(element);

    // Add to active toasts
    this.activeToasts.push(toast);

    // Trigger entrance animation
    requestAnimationFrame(() => {
      element.classList.add('visible');
    });

    // Auto-dismiss after duration
    if (toast.duration > 0) {
      toast.timeout = setTimeout(() => {
        this._hideToast(toast);
      }, toast.duration);
    }
  }

  /**
   * Hide a toast
   * @private
   */
  _hideToast(toast) {
    if (!toast.element) return;

    // Clear timeout
    if (toast.timeout) {
      clearTimeout(toast.timeout);
    }

    // Trigger exit animation
    toast.element.classList.remove('visible');

    // Remove from DOM after animation
    setTimeout(() => {
      if (toast.element && toast.element.parentNode) {
        toast.element.parentNode.removeChild(toast.element);
      }

      // Remove from active toasts
      const index = this.activeToasts.indexOf(toast);
      if (index !== -1) {
        this.activeToasts.splice(index, 1);
      }

      // Show next queued toast
      this._showNextQueuedToast();
    }, 300);
  }

  /**
   * Show next queued toast
   * @private
   */
  _showNextQueuedToast() {
    if (this.toastQueue.length > 0 && this.activeToasts.length < this.config.maxVisible) {
      const nextToast = this.toastQueue.shift();
      this._showToast(nextToast);
    }
  }

  /**
   * Create toast element
   * @private
   */
  _createToastElement(toast) {
    const element = document.createElement('div');
    element.className = `toast toast-${toast.type}`;
    element.setAttribute('data-toast-id', toast.id);

    element.innerHTML = `
      <div class="toast-icon">${toast.icon}</div>
      <div class="toast-content">
        <div class="toast-message">${this._escapeHtml(toast.message)}</div>
      </div>
      <button class="toast-close" data-toast-close>×</button>
    `;

    // Close button
    const closeBtn = element.querySelector('[data-toast-close]');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._hideToast(toast);
    });

    // Click handler
    if (toast.onClick) {
      element.style.cursor = 'pointer';
      element.addEventListener('click', () => {
        toast.onClick(toast);
        this._hideToast(toast);
      });
    }

    return element;
  }

  /**
   * Get default icon for toast type
   * @private
   */
  _getDefaultIcon(type) {
    const icons = {
      success: '✅',
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌'
    };
    return icons[type] || icons.info;
  }

  /**
   * Escape HTML to prevent XSS
   * @private
   */
  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Inject CSS styles
   * @private
   */
  _injectStyles() {
    const styleId = 'toast-notification-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .toast-container {
        position: fixed;
        z-index: 10001;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        pointer-events: none;
        max-width: 400px;
      }

      /* Position variants */
      .toast-top-right {
        top: 1rem;
        right: 1rem;
      }

      .toast-top-left {
        top: 1rem;
        left: 1rem;
      }

      .toast-bottom-right {
        bottom: 1rem;
        right: 1rem;
      }

      .toast-bottom-left {
        bottom: 1rem;
        left: 1rem;
      }

      /* Toast */
      .toast {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
        background: white;
        border-radius: 0.75rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        pointer-events: auto;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
        max-width: 100%;
        word-wrap: break-word;
      }

      .toast.visible {
        opacity: 1;
        transform: translateX(0);
      }

      /* Toast types */
      .toast-success {
        border-left: 4px solid #10B981;
      }

      .toast-info {
        border-left: 4px solid #3B82F6;
      }

      .toast-warning {
        border-left: 4px solid #F59E0B;
      }

      .toast-error {
        border-left: 4px solid #EF4444;
      }

      .toast-icon {
        font-size: 1.5rem;
        line-height: 1;
        flex-shrink: 0;
      }

      .toast-content {
        flex: 1;
        min-width: 0;
      }

      .toast-message {
        font-size: 0.875rem;
        font-weight: 500;
        color: #1F2937;
        line-height: 1.4;
      }

      .toast-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        line-height: 1;
        color: #6B7280;
        cursor: pointer;
        padding: 0;
        margin: 0;
        flex-shrink: 0;
        transition: color 0.2s ease;
      }

      .toast-close:hover {
        color: #1F2937;
      }

      /* Left position animation */
      .toast-top-left .toast,
      .toast-bottom-left .toast {
        transform: translateX(-100px);
      }

      .toast-top-left .toast.visible,
      .toast-bottom-left .toast.visible {
        transform: translateX(0);
      }

      /* Responsive */
      @media (max-width: 768px) {
        .toast-container {
          left: 1rem !important;
          right: 1rem !important;
          max-width: calc(100% - 2rem);
        }

        .toast {
          padding: 0.875rem 1rem;
          gap: 0.5rem;
        }

        .toast-icon {
          font-size: 1.25rem;
        }

        .toast-message {
          font-size: 0.8125rem;
        }

        .toast-close {
          font-size: 1.25rem;
        }
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .toast {
          background: #1F2937;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .toast-message {
          color: #F3F4F6;
        }

        .toast-close {
          color: #9CA3AF;
        }

        .toast-close:hover {
          color: #F3F4F6;
        }
      }

      /* Animation for progress bar (optional future enhancement) */
      @keyframes toast-progress {
        from { width: 100%; }
        to { width: 0%; }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Get default configuration
   * @private
   */
  _getDefaultConfig() {
    return {
      position: 'top-right',
      duration: 3000,
      maxVisible: 3
    };
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.ToastNotification = ToastNotification;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ToastNotification;
}
