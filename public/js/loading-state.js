/**
 * Loading State Manager
 * Provides consistent loading states across the platform
 * 
 * Usage:
 * LoadingState.show(element, 'Loading...');
 * LoadingState.hide(element);
 * 
 * Or with automatic cleanup:
 * await LoadingState.wrap(element, async () => {
 *     // Your async operation
 * }, 'Processing...');
 */

class LoadingStateManager {
    constructor() {
        this.activeStates = new Map();
        this.originalContent = new Map();
    }

    /**
     * Show loading state on an element
     * @param {HTMLElement|string} element - Element or selector
     * @param {string} message - Loading message
     * @param {Object} options - Additional options
     */
    show(element, message = 'Loading...', options = {}) {
        const el = this.getElement(element);
        if (!el) return;

        // Store original content if not already stored
        if (!this.originalContent.has(el)) {
            this.originalContent.set(el, {
                innerHTML: el.innerHTML,
                disabled: el.disabled,
                className: el.className
            });
        }

        // Add loading class
        el.classList.add('loading-state');

        // Disable if it's a button or input
        if (el.tagName === 'BUTTON' || el.tagName === 'INPUT') {
            el.disabled = true;
        }

        // Create loading HTML
        const spinnerType = options.spinnerType || 'default';
        const spinnerHTML = this.getSpinner(spinnerType);

        el.innerHTML = `
            <div class="loading-container" style="display: flex; align-items: center; justify-content: center; gap: 0.75rem;">
                ${spinnerHTML}
                <span class="loading-message">${message}</span>
            </div>
        `;

        this.activeStates.set(el, true);
    }

    /**
     * Hide loading state and restore original content
     * @param {HTMLElement|string} element - Element or selector
     */
    hide(element) {
        const el = this.getElement(element);
        if (!el) return;

        const original = this.originalContent.get(el);
        if (original) {
            el.innerHTML = original.innerHTML;
            el.disabled = original.disabled;
            el.className = original.className;
            this.originalContent.delete(el);
        }

        el.classList.remove('loading-state');
        this.activeStates.delete(el);
    }

    /**
     * Update loading message without resetting state
     * @param {HTMLElement|string} element - Element or selector
     * @param {string} message - New message
     */
    updateMessage(element, message) {
        const el = this.getElement(element);
        if (!el) return;

        const messageEl = el.querySelector('.loading-message');
        if (messageEl) {
            messageEl.textContent = message;
        }
    }

    /**
     * Wrap an async operation with loading state
     * @param {HTMLElement|string} element - Element or selector
     * @param {Function} operation - Async operation to perform
     * @param {string} message - Loading message
     * @returns {Promise} - Result of operation
     */
    async wrap(element, operation, message = 'Loading...') {
        const el = this.getElement(element);
        
        try {
            this.show(el, message);
            const result = await operation();
            return result;
        } catch (error) {
            throw error;
        } finally {
            this.hide(el);
        }
    }

    /**
     * Show loading overlay on entire page
     * @param {string} message - Loading message
     */
    showPageLoading(message = 'Loading...') {
        // Remove existing overlay if any
        this.hidePageLoading();

        const overlay = document.createElement('div');
        overlay.id = 'page-loading-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            animation: fadeIn 0.2s ease;
        `;

        overlay.innerHTML = `
            <div style="
                background: var(--primary-bg, white);
                padding: 2rem 3rem;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                text-align: center;
                max-width: 400px;
            ">
                ${this.getSpinner('large')}
                <p style="
                    margin-top: 1.5rem;
                    color: var(--text-primary, #333);
                    font-size: 1.1rem;
                    font-weight: 600;
                ">${message}</p>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
    }

    /**
     * Hide page loading overlay
     */
    hidePageLoading() {
        const overlay = document.getElementById('page-loading-overlay');
        if (overlay) {
            overlay.style.animation = 'fadeOut 0.2s ease';
            setTimeout(() => {
                overlay.remove();
                document.body.style.overflow = '';
            }, 200);
        }
    }

    /**
     * Show inline loading indicator
     * @param {HTMLElement|string} container - Container element
     * @param {string} message - Loading message
     */
    showInline(container, message = 'Loading...') {
        const el = this.getElement(container);
        if (!el) return;

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'inline-loading';
        loadingDiv.style.cssText = `
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem;
            color: var(--text-secondary, #666);
        `;
        loadingDiv.innerHTML = `
            ${this.getSpinner('small')}
            <span>${message}</span>
        `;

        el.appendChild(loadingDiv);
    }

    /**
     * Hide inline loading indicator
     * @param {HTMLElement|string} container - Container element
     */
    hideInline(container) {
        const el = this.getElement(container);
        if (!el) return;

        const loadingDiv = el.querySelector('.inline-loading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    /**
     * Get spinner HTML based on type
     * @param {string} type - Spinner type (small, default, large)
     * @returns {string} - HTML for spinner
     */
    getSpinner(type = 'default') {
        const sizes = {
            small: '16px',
            default: '24px',
            large: '48px'
        };

        const size = sizes[type] || sizes.default;

        return `
            <div class="spinner" style="
                width: ${size};
                height: ${size};
                border: 3px solid rgba(160, 123, 204, 0.3);
                border-top-color: var(--accent-color, #a07bcc);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            "></div>
        `;
    }

    /**
     * Get element from string selector or element
     * @param {HTMLElement|string} element - Element or selector
     * @returns {HTMLElement|null}
     */
    getElement(element) {
        if (typeof element === 'string') {
            return document.querySelector(element);
        }
        return element;
    }

    /**
     * Check if element is in loading state
     * @param {HTMLElement|string} element - Element or selector
     * @returns {boolean}
     */
    isLoading(element) {
        const el = this.getElement(element);
        return this.activeStates.has(el);
    }

    /**
     * Clear all loading states
     */
    clearAll() {
        this.activeStates.forEach((_, el) => {
            this.hide(el);
        });
        this.hidePageLoading();
    }
}

// Add CSS animations if not already present
if (!document.getElementById('loading-state-styles')) {
    const style = document.createElement('style');
    style.id = 'loading-state-styles';
    style.textContent = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }

        .loading-state {
            opacity: 0.7;
            pointer-events: none;
        }

        .loading-container {
            animation: fadeIn 0.2s ease;
        }
    `;
    document.head.appendChild(style);
}

// Create global instance
window.LoadingState = new LoadingStateManager();

// Export for module usage
export default window.LoadingState;
