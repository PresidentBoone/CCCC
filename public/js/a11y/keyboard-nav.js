/**
 * Keyboard Navigation Utility
 * WCAG 2.1 AA Compliant Keyboard Navigation
 *
 * Features:
 * - Tab navigation enhancements
 * - Skip links for main content
 * - Escape key handlers for modals
 * - Arrow key navigation for lists/menus
 * - Enter/Space activation for custom controls
 *
 * @version 2.0.0
 * Part of CollegeClimb Engineering Overhaul - Phase 2.3
 */

class KeyboardNavigation {
    constructor() {
        this.focusableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]'
        ].join(', ');

        this.trapStack = [];
        this.skipLinksAdded = false;

        this.init();
    }

    /**
     * Initialize keyboard navigation
     */
    init() {
        console.log('[KeyboardNav] 🎹 Initializing keyboard navigation...');

        // Add skip links
        this.addSkipLinks();

        // Set up global keyboard handlers
        this.setupGlobalHandlers();

        // Enhance interactive elements
        this.enhanceInteractiveElements();

        // Monitor dynamic content
        this.observeDOMChanges();

        console.log('[KeyboardNav] ✅ Keyboard navigation ready');
    }

    /**
     * Add skip links for screen readers and keyboard users
     */
    addSkipLinks() {
        if (this.skipLinksAdded) return;

        const skipNav = document.createElement('nav');
        skipNav.className = 'skip-nav';
        skipNav.setAttribute('aria-label', 'Skip navigation');
        skipNav.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#main-nav" class="skip-link">Skip to navigation</a>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .skip-nav {
                position: absolute;
                top: 0;
                left: 0;
                z-index: 10000;
            }

            .skip-link {
                position: absolute;
                top: -40px;
                left: 0;
                background: var(--accent-bg, #2a357a);
                color: white;
                padding: 8px 16px;
                text-decoration: none;
                border-radius: 0 0 4px 0;
                font-weight: 600;
                transition: top 0.2s ease;
                z-index: 10001;
            }

            .skip-link:focus {
                top: 0;
                outline: 2px solid white;
                outline-offset: 2px;
            }
        `;

        document.head.appendChild(style);
        document.body.insertBefore(skipNav, document.body.firstChild);

        this.skipLinksAdded = true;
        console.log('[KeyboardNav] ✅ Skip links added');
    }

    /**
     * Set up global keyboard event handlers
     */
    setupGlobalHandlers() {
        // Escape key handler for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscape();
            }
        });

        // Tab key handler for focus visibility
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-nav-active');
            }
        });

        // Mouse handler to remove keyboard nav styles
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-nav-active');
        });

        // Add focus visibility styles
        const style = document.createElement('style');
        style.textContent = `
            body:not(.keyboard-nav-active) *:focus {
                outline: none;
            }

            .keyboard-nav-active *:focus {
                outline: 2px solid var(--accent-color, #a07bcc) !important;
                outline-offset: 2px !important;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Handle Escape key press
     */
    handleEscape() {
        // Close modals
        const modals = document.querySelectorAll('[role="dialog"][aria-hidden="false"], .modal.show, .modal.active');
        modals.forEach(modal => {
            const closeButton = modal.querySelector('[data-dismiss="modal"], .close, .modal-close');
            if (closeButton) {
                closeButton.click();
            }
        });

        // Release focus trap
        if (this.trapStack.length > 0) {
            this.releaseFocusTrap();
        }
    }

    /**
     * Enhance interactive elements for keyboard accessibility
     */
    enhanceInteractiveElements() {
        // Enhance custom dropdowns
        document.querySelectorAll('[role="menu"], [role="listbox"]').forEach(menu => {
            this.enhanceMenu(menu);
        });

        // Enhance custom buttons (div/span with click handlers)
        document.querySelectorAll('[onclick]:not(button):not(a)').forEach(elem => {
            this.makeKeyboardAccessible(elem);
        });

        // Enhance tab panels
        document.querySelectorAll('[role="tablist"]').forEach(tablist => {
            this.enhanceTablist(tablist);
        });
    }

    /**
     * Make an element keyboard accessible
     * @param {HTMLElement} element - Element to enhance
     */
    makeKeyboardAccessible(element) {
        // Add tabindex if not present
        if (!element.hasAttribute('tabindex') && !element.matches('button, a, input, select, textarea')) {
            element.setAttribute('tabindex', '0');
        }

        // Add role if not present
        if (!element.hasAttribute('role')) {
            element.setAttribute('role', 'button');
        }

        // Add keyboard handler if not already added
        if (!element.dataset.keyboardEnhanced) {
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    element.click();
                }
            });
            element.dataset.keyboardEnhanced = 'true';
        }
    }

    /**
     * Enhance menu/dropdown with arrow key navigation
     * @param {HTMLElement} menu - Menu element
     */
    enhanceMenu(menu) {
        const items = menu.querySelectorAll('[role="menuitem"], [role="option"], a, button');

        if (items.length === 0) return;

        items.forEach((item, index) => {
            item.addEventListener('keydown', (e) => {
                let targetIndex = index;

                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        targetIndex = (index + 1) % items.length;
                        items[targetIndex].focus();
                        break;

                    case 'ArrowUp':
                        e.preventDefault();
                        targetIndex = (index - 1 + items.length) % items.length;
                        items[targetIndex].focus();
                        break;

                    case 'Home':
                        e.preventDefault();
                        items[0].focus();
                        break;

                    case 'End':
                        e.preventDefault();
                        items[items.length - 1].focus();
                        break;
                }
            });
        });
    }

    /**
     * Enhance tablist with arrow key navigation
     * @param {HTMLElement} tablist - Tablist element
     */
    enhanceTablist(tablist) {
        const tabs = tablist.querySelectorAll('[role="tab"]');

        if (tabs.length === 0) return;

        tabs.forEach((tab, index) => {
            tab.addEventListener('keydown', (e) => {
                let targetIndex = index;

                switch (e.key) {
                    case 'ArrowRight':
                    case 'ArrowDown':
                        e.preventDefault();
                        targetIndex = (index + 1) % tabs.length;
                        tabs[targetIndex].click();
                        tabs[targetIndex].focus();
                        break;

                    case 'ArrowLeft':
                    case 'ArrowUp':
                        e.preventDefault();
                        targetIndex = (index - 1 + tabs.length) % tabs.length;
                        tabs[targetIndex].click();
                        tabs[targetIndex].focus();
                        break;

                    case 'Home':
                        e.preventDefault();
                        tabs[0].click();
                        tabs[0].focus();
                        break;

                    case 'End':
                        e.preventDefault();
                        tabs[tabs.length - 1].click();
                        tabs[tabs.length - 1].focus();
                        break;
                }
            });
        });
    }

    /**
     * Trap focus within a container (for modals/dialogs)
     * @param {HTMLElement} container - Container to trap focus within
     * @param {HTMLElement} returnFocus - Element to return focus to when released
     */
    trapFocus(container, returnFocus = document.activeElement) {
        const focusable = container.querySelectorAll(this.focusableSelectors);
        const firstFocusable = focusable[0];
        const lastFocusable = focusable[focusable.length - 1];

        const handler = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        };

        container.addEventListener('keydown', handler);

        // Store trap info
        this.trapStack.push({
            container,
            handler,
            returnFocus
        });

        // Focus first element
        if (firstFocusable) {
            firstFocusable.focus();
        }

        console.log('[KeyboardNav] 🔒 Focus trapped in container');
    }

    /**
     * Release focus trap
     */
    releaseFocusTrap() {
        if (this.trapStack.length === 0) return;

        const trap = this.trapStack.pop();
        trap.container.removeEventListener('keydown', trap.handler);

        // Return focus
        if (trap.returnFocus && trap.returnFocus.focus) {
            trap.returnFocus.focus();
        }

        console.log('[KeyboardNav] 🔓 Focus trap released');
    }

    /**
     * Get all focusable elements in a container
     * @param {HTMLElement} container - Container element
     * @returns {HTMLElement[]} Array of focusable elements
     */
    getFocusableElements(container = document) {
        return Array.from(container.querySelectorAll(this.focusableSelectors));
    }

    /**
     * Move focus to next focusable element
     */
    focusNext() {
        const focusable = this.getFocusableElements();
        const currentIndex = focusable.indexOf(document.activeElement);
        const nextIndex = (currentIndex + 1) % focusable.length;
        focusable[nextIndex].focus();
    }

    /**
     * Move focus to previous focusable element
     */
    focusPrevious() {
        const focusable = this.getFocusableElements();
        const currentIndex = focusable.indexOf(document.activeElement);
        const previousIndex = (currentIndex - 1 + focusable.length) % focusable.length;
        focusable[previousIndex].focus();
    }

    /**
     * Observe DOM changes to enhance new elements
     */
    observeDOMChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        // Enhance new interactive elements
                        if (node.matches && node.matches('[onclick]:not(button):not(a)')) {
                            this.makeKeyboardAccessible(node);
                        }

                        // Enhance new menus
                        if (node.matches && node.matches('[role="menu"], [role="listbox"]')) {
                            this.enhanceMenu(node);
                        }

                        // Enhance new tablists
                        if (node.matches && node.matches('[role="tablist"]')) {
                            this.enhanceTablist(node);
                        }

                        // Check children
                        if (node.querySelectorAll) {
                            node.querySelectorAll('[onclick]:not(button):not(a)').forEach(elem => {
                                this.makeKeyboardAccessible(elem);
                            });

                            node.querySelectorAll('[role="menu"], [role="listbox"]').forEach(menu => {
                                this.enhanceMenu(menu);
                            });

                            node.querySelectorAll('[role="tablist"]').forEach(tablist => {
                                this.enhanceTablist(tablist);
                            });
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('[KeyboardNav] 👁️ DOM observer active');
    }
}

// Initialize globally
if (typeof window !== 'undefined') {
    window.KeyboardNavigation = KeyboardNavigation;
    window.keyboardNav = new KeyboardNavigation();
    console.log('[KeyboardNav] 🚀 Keyboard navigation loaded');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KeyboardNavigation;
}
