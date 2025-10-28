/**
 * Focus Management Utility
 * WCAG 2.1 AA Compliant Focus Management
 *
 * Features:
 * - Focus restoration after modals/dialogs
 * - Focus indicators
 * - Scroll management on focus
 * - Focus history tracking
 * - Auto-focus management
 *
 * @version 2.0.0
 * Part of CollegeClimb Engineering Overhaul - Phase 2.5
 */

class FocusManager {
    constructor() {
        this.focusHistory = [];
        this.maxHistorySize = 50;
        this.modalStack = [];

        this.init();
    }

    /**
     * Initialize focus management
     */
    init() {
        console.log('[FocusManager] 🎯 Initializing focus management...');

        // Track focus changes
        this.trackFocusChanges();

        // Enhance focus indicators
        this.enhanceFocusIndicators();

        // Monitor modals
        this.monitorModals();

        console.log('[FocusManager] ✅ Focus management ready');
    }

    /**
     * Track focus changes for history
     */
    trackFocusChanges() {
        document.addEventListener('focusin', (e) => {
            const element = e.target;

            // Add to history
            this.focusHistory.push({
                element,
                timestamp: Date.now(),
                tagName: element.tagName,
                id: element.id,
                className: element.className
            });

            // Limit history size
            if (this.focusHistory.length > this.maxHistorySize) {
                this.focusHistory.shift();
            }
        });

        console.log('[FocusManager] 📝 Focus tracking active');
    }

    /**
     * Enhance focus indicators
     */
    enhanceFocusIndicators() {
        const style = document.createElement('style');
        style.textContent = `
            /* Focus indicator enhancements */
            *:focus-visible {
                outline: 3px solid var(--accent-color, #a07bcc) !important;
                outline-offset: 2px !important;
                transition: outline-offset 0.1s ease;
            }

            /* High contrast focus for buttons and links */
            button:focus-visible,
            a:focus-visible {
                outline: 3px solid var(--accent-color, #a07bcc) !important;
                outline-offset: 3px !important;
                box-shadow: 0 0 0 4px rgba(160, 123, 204, 0.2);
            }

            /* Focus indicator for form inputs */
            input:focus-visible,
            select:focus-visible,
            textarea:focus-visible {
                outline: 2px solid var(--accent-color, #a07bcc) !important;
                outline-offset: 0px !important;
                border-color: var(--accent-color, #a07bcc) !important;
            }

            /* Focus indicator for custom controls */
            [role="button"]:focus-visible,
            [role="checkbox"]:focus-visible,
            [role="radio"]:focus-visible,
            [role="tab"]:focus-visible {
                outline: 3px solid var(--accent-color, #a07bcc) !important;
                outline-offset: 2px !important;
            }

            /* Animated focus ring */
            @keyframes focusRing {
                0% { outline-offset: 2px; }
                50% { outline-offset: 4px; }
                100% { outline-offset: 2px; }
            }

            .focus-animated:focus-visible {
                animation: focusRing 0.6s ease-in-out;
            }
        `;
        document.head.appendChild(style);

        console.log('[FocusManager] ✅ Focus indicators enhanced');
    }

    /**
     * Save current focus (before modal/dialog opens)
     * @returns {HTMLElement} Previously focused element
     */
    saveFocus() {
        const activeElement = document.activeElement;
        console.log('[FocusManager] 💾 Saved focus:', activeElement);
        return activeElement;
    }

    /**
     * Restore focus to saved element
     * @param {HTMLElement} element - Element to restore focus to
     * @param {boolean} scroll - Whether to scroll to element
     */
    restoreFocus(element, scroll = true) {
        if (!element || !element.focus) {
            console.warn('[FocusManager] Cannot restore focus - invalid element');
            return;
        }

        try {
            element.focus({
                preventScroll: !scroll
            });

            if (scroll) {
                this.scrollToElement(element);
            }

            console.log('[FocusManager] ↩️ Restored focus to:', element);
        } catch (error) {
            console.error('[FocusManager] Error restoring focus:', error);
        }
    }

    /**
     * Focus first focusable element in container
     * @param {HTMLElement} container - Container element
     * @param {boolean} scroll - Whether to scroll to element
     * @returns {boolean} Success status
     */
    focusFirstIn(container, scroll = true) {
        const focusable = this.getFocusableElements(container);

        if (focusable.length === 0) {
            console.warn('[FocusManager] No focusable elements in container');
            return false;
        }

        focusable[0].focus({
            preventScroll: !scroll
        });

        if (scroll) {
            this.scrollToElement(focusable[0]);
        }

        console.log('[FocusManager] 🎯 Focused first element in container');
        return true;
    }

    /**
     * Focus last focusable element in container
     * @param {HTMLElement} container - Container element
     * @param {boolean} scroll - Whether to scroll to element
     * @returns {boolean} Success status
     */
    focusLastIn(container, scroll = true) {
        const focusable = this.getFocusableElements(container);

        if (focusable.length === 0) {
            console.warn('[FocusManager] No focusable elements in container');
            return false;
        }

        focusable[focusable.length - 1].focus({
            preventScroll: !scroll
        });

        if (scroll) {
            this.scrollToElement(focusable[focusable.length - 1]);
        }

        console.log('[FocusManager] 🎯 Focused last element in container');
        return true;
    }

    /**
     * Get all focusable elements in container
     * @param {HTMLElement} container - Container element
     * @returns {HTMLElement[]} Array of focusable elements
     */
    getFocusableElements(container = document) {
        const selectors = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]'
        ].join(', ');

        return Array.from(container.querySelectorAll(selectors))
            .filter(elem => {
                // Filter out hidden elements
                const style = window.getComputedStyle(elem);
                return style.display !== 'none' && style.visibility !== 'hidden';
            });
    }

    /**
     * Scroll to element smoothly
     * @param {HTMLElement} element - Element to scroll to
     */
    scrollToElement(element) {
        if (!element) return;

        try {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
        } catch (error) {
            // Fallback for browsers that don't support smooth scroll
            element.scrollIntoView(false);
        }
    }

    /**
     * Monitor modals and manage focus
     */
    monitorModals() {
        // Observer for modal/dialog elements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        // Check if it's a modal
                        if (this.isModal(node)) {
                            this.handleModalOpen(node);
                        }

                        // Check children
                        const modals = node.querySelectorAll ? node.querySelectorAll('[role="dialog"], .modal, [data-modal]') : [];
                        modals.forEach(modal => {
                            if (this.isModalVisible(modal)) {
                                this.handleModalOpen(modal);
                            }
                        });
                    }
                });

                mutation.removedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        if (this.isModal(node)) {
                            this.handleModalClose(node);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style', 'aria-hidden']
        });

        console.log('[FocusManager] 👁️ Modal monitoring active');
    }

    /**
     * Check if element is a modal
     * @param {HTMLElement} element - Element to check
     * @returns {boolean} Is modal
     */
    isModal(element) {
        return element.hasAttribute('role') && element.getAttribute('role') === 'dialog' ||
               element.classList.contains('modal') ||
               element.hasAttribute('data-modal');
    }

    /**
     * Check if modal is visible
     * @param {HTMLElement} modal - Modal element
     * @returns {boolean} Is visible
     */
    isModalVisible(modal) {
        const style = window.getComputedStyle(modal);
        const ariaHidden = modal.getAttribute('aria-hidden');

        return style.display !== 'none' &&
               style.visibility !== 'hidden' &&
               ariaHidden !== 'true' &&
               (modal.classList.contains('show') || modal.classList.contains('active'));
    }

    /**
     * Handle modal opening
     * @param {HTMLElement} modal - Modal element
     */
    handleModalOpen(modal) {
        // Save current focus
        const previousFocus = this.saveFocus();

        // Add to modal stack
        this.modalStack.push({
            modal,
            previousFocus
        });

        // Focus first element in modal
        setTimeout(() => {
            this.focusFirstIn(modal);
        }, 100);

        // Set up focus trap
        if (window.keyboardNav) {
            window.keyboardNav.trapFocus(modal, previousFocus);
        }

        console.log('[FocusManager] 🔓 Modal opened, focus managed');
    }

    /**
     * Handle modal closing
     * @param {HTMLElement} modal - Modal element
     */
    handleModalClose(modal) {
        // Find modal in stack
        const index = this.modalStack.findIndex(item => item.modal === modal);

        if (index !== -1) {
            const modalInfo = this.modalStack[index];

            // Restore focus
            setTimeout(() => {
                this.restoreFocus(modalInfo.previousFocus);
            }, 100);

            // Remove from stack
            this.modalStack.splice(index, 1);

            // Release focus trap
            if (window.keyboardNav) {
                window.keyboardNav.releaseFocusTrap();
            }

            console.log('[FocusManager] 🔒 Modal closed, focus restored');
        }
    }

    /**
     * Get focus history
     * @param {number} count - Number of history items to return
     * @returns {Array} Focus history
     */
    getFocusHistory(count = 10) {
        return this.focusHistory.slice(-count);
    }

    /**
     * Clear focus history
     */
    clearFocusHistory() {
        this.focusHistory = [];
        console.log('[FocusManager] 🗑️ Focus history cleared');
    }

    /**
     * Focus element by selector
     * @param {string} selector - CSS selector
     * @param {boolean} scroll - Whether to scroll to element
     * @returns {boolean} Success status
     */
    focusBySelector(selector, scroll = true) {
        const element = document.querySelector(selector);

        if (!element) {
            console.warn(`[FocusManager] Element not found: ${selector}`);
            return false;
        }

        element.focus({
            preventScroll: !scroll
        });

        if (scroll) {
            this.scrollToElement(element);
        }

        return true;
    }

    /**
     * Add focus animation class to element
     * @param {HTMLElement} element - Element to animate
     */
    animateFocus(element) {
        element.classList.add('focus-animated');
        element.focus();

        setTimeout(() => {
            element.classList.remove('focus-animated');
        }, 600);
    }
}

// Initialize globally
if (typeof window !== 'undefined') {
    window.FocusManager = FocusManager;
    window.focusManager = new FocusManager();
    console.log('[FocusManager] 🚀 Focus management loaded');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FocusManager;
}
