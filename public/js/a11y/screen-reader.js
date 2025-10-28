/**
 * Screen Reader Support Utility
 * WCAG 2.1 AA Compliant Screen Reader Enhancements
 *
 * Features:
 * - Live region announcements
 * - ARIA label management
 * - Dynamic content updates
 * - Status messages
 * - Error announcements
 *
 * @version 2.0.0
 * Part of CollegeClimb Engineering Overhaul - Phase 2.4
 */

class ScreenReaderSupport {
    constructor() {
        this.liveRegion = null;
        this.statusRegion = null;
        this.alertRegion = null;

        this.init();
    }

    /**
     * Initialize screen reader support
     */
    init() {
        console.log('[ScreenReader] 📢 Initializing screen reader support...');

        // Create live regions
        this.createLiveRegions();

        // Enhance existing ARIA
        this.enhanceARIA();

        // Monitor dynamic content
        this.observeContentChanges();

        console.log('[ScreenReader] ✅ Screen reader support ready');
    }

    /**
     * Create ARIA live regions for announcements
     */
    createLiveRegions() {
        // Polite live region (for non-urgent updates)
        this.liveRegion = document.createElement('div');
        this.liveRegion.setAttribute('role', 'status');
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('aria-atomic', 'true');
        this.liveRegion.className = 'sr-only';
        this.liveRegion.id = 'sr-live-region';

        // Status region (for status messages)
        this.statusRegion = document.createElement('div');
        this.statusRegion.setAttribute('role', 'status');
        this.statusRegion.setAttribute('aria-live', 'polite');
        this.statusRegion.setAttribute('aria-atomic', 'true');
        this.statusRegion.className = 'sr-only';
        this.statusRegion.id = 'sr-status-region';

        // Alert region (for urgent announcements)
        this.alertRegion = document.createElement('div');
        this.alertRegion.setAttribute('role', 'alert');
        this.alertRegion.setAttribute('aria-live', 'assertive');
        this.alertRegion.setAttribute('aria-atomic', 'true');
        this.alertRegion.className = 'sr-only';
        this.alertRegion.id = 'sr-alert-region';

        // Add screen reader only styles
        const style = document.createElement('style');
        style.textContent = `
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border-width: 0;
            }

            .sr-only-focusable:focus {
                position: static;
                width: auto;
                height: auto;
                padding: inherit;
                margin: inherit;
                overflow: visible;
                clip: auto;
                white-space: normal;
            }
        `;
        document.head.appendChild(style);

        // Append to body
        document.body.appendChild(this.liveRegion);
        document.body.appendChild(this.statusRegion);
        document.body.appendChild(this.alertRegion);

        console.log('[ScreenReader] ✅ Live regions created');
    }

    /**
     * Announce message to screen readers
     * @param {string} message - Message to announce
     * @param {string} priority - 'polite' or 'assertive'
     */
    announce(message, priority = 'polite') {
        if (!message) return;

        const region = priority === 'assertive' ? this.alertRegion : this.liveRegion;

        // Clear previous message
        region.textContent = '';

        // Announce new message (after a small delay for screen readers to detect change)
        setTimeout(() => {
            region.textContent = message;
            console.log(`[ScreenReader] 📢 Announced (${priority}): "${message}"`);

            // Clear after 10 seconds to avoid clutter
            setTimeout(() => {
                region.textContent = '';
            }, 10000);
        }, 100);
    }

    /**
     * Announce status message
     * @param {string} message - Status message
     */
    announceStatus(message) {
        if (!message) return;

        this.statusRegion.textContent = '';
        setTimeout(() => {
            this.statusRegion.textContent = message;
            console.log(`[ScreenReader] 📊 Status: "${message}"`);

            setTimeout(() => {
                this.statusRegion.textContent = '';
            }, 10000);
        }, 100);
    }

    /**
     * Announce alert (urgent)
     * @param {string} message - Alert message
     */
    announceAlert(message) {
        this.announce(message, 'assertive');
    }

    /**
     * Announce success message
     * @param {string} message - Success message
     */
    announceSuccess(message) {
        this.announce(`Success: ${message}`, 'polite');
    }

    /**
     * Announce error message
     * @param {string} message - Error message
     */
    announceError(message) {
        this.announce(`Error: ${message}`, 'assertive');
    }

    /**
     * Announce loading state
     * @param {string} message - Loading message
     */
    announceLoading(message = 'Loading...') {
        this.announceStatus(message);
    }

    /**
     * Announce page change
     * @param {string} pageName - Name of the new page
     */
    announcePageChange(pageName) {
        this.announce(`Navigated to ${pageName}`, 'assertive');
    }

    /**
     * Enhance existing ARIA labels and roles
     */
    enhanceARIA() {
        // Add ARIA labels to elements missing them
        document.querySelectorAll('button, a').forEach(elem => {
            if (!elem.getAttribute('aria-label') && !elem.getAttribute('aria-labelledby')) {
                const text = elem.textContent.trim();
                const title = elem.getAttribute('title');

                if (!text && title) {
                    elem.setAttribute('aria-label', title);
                } else if (!text && !title) {
                    // Element has no accessible name - try to infer
                    const icon = elem.querySelector('i, svg');
                    if (icon) {
                        const classes = icon.className;
                        if (classes.includes('close') || classes.includes('times')) {
                            elem.setAttribute('aria-label', 'Close');
                        } else if (classes.includes('menu') || classes.includes('bars')) {
                            elem.setAttribute('aria-label', 'Menu');
                        } else if (classes.includes('search')) {
                            elem.setAttribute('aria-label', 'Search');
                        }
                    }
                }
            }
        });

        // Add ARIA labels to form inputs missing them
        document.querySelectorAll('input, select, textarea').forEach(elem => {
            if (!elem.getAttribute('aria-label') && !elem.getAttribute('aria-labelledby')) {
                // Check for label element
                const id = elem.getAttribute('id');
                if (id) {
                    const label = document.querySelector(`label[for="${id}"]`);
                    if (!label) {
                        // Add aria-label from placeholder or name
                        const placeholder = elem.getAttribute('placeholder');
                        const name = elem.getAttribute('name');

                        if (placeholder) {
                            elem.setAttribute('aria-label', placeholder);
                        } else if (name) {
                            // Convert name to readable label (e.g., 'firstName' -> 'First Name')
                            const label = name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                            elem.setAttribute('aria-label', label);
                        }
                    }
                }
            }
        });

        // Add role="img" and alt text to decorative icons
        document.querySelectorAll('i.fa, i.fas, i.far, i.fab').forEach(icon => {
            if (!icon.getAttribute('role') && !icon.getAttribute('aria-hidden')) {
                // If icon is inside a button/link with text, mark as decorative
                const parent = icon.closest('button, a');
                if (parent && parent.textContent.trim().length > 0) {
                    icon.setAttribute('aria-hidden', 'true');
                } else {
                    // Icon is standalone, try to give it a label
                    const classes = icon.className;
                    if (classes.includes('close') || classes.includes('times')) {
                        icon.setAttribute('role', 'img');
                        icon.setAttribute('aria-label', 'Close');
                    } else if (classes.includes('menu') || classes.includes('bars')) {
                        icon.setAttribute('role', 'img');
                        icon.setAttribute('aria-label', 'Menu');
                    } else {
                        icon.setAttribute('aria-hidden', 'true');
                    }
                }
            }
        });

        // Ensure main content area has role="main" or is a <main> element
        const mainContent = document.getElementById('main-content') || document.querySelector('main');
        if (mainContent && !mainContent.hasAttribute('role')) {
            if (mainContent.tagName !== 'MAIN') {
                mainContent.setAttribute('role', 'main');
            }
        }

        // Ensure navigation has role="navigation"
        const nav = document.querySelector('nav, [id*="nav"], [class*="nav"]');
        if (nav && !nav.hasAttribute('role') && nav.tagName !== 'NAV') {
            nav.setAttribute('role', 'navigation');
            if (!nav.getAttribute('aria-label')) {
                nav.setAttribute('aria-label', 'Main navigation');
            }
        }

        console.log('[ScreenReader] ✅ ARIA enhancements applied');
    }

    /**
     * Monitor content changes and announce them
     */
    observeContentChanges() {
        // Monitor form validation errors
        document.addEventListener('invalid', (e) => {
            const input = e.target;
            const message = input.validationMessage;
            if (message) {
                this.announceError(`${input.getAttribute('aria-label') || input.name || 'Field'}: ${message}`);
            }
        }, true);

        // Monitor successful form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.checkValidity()) {
                const formName = form.getAttribute('aria-label') || form.name || 'Form';
                this.announceStatus(`${formName} submitted successfully`);
            }
        });

        console.log('[ScreenReader] 👁️ Content change monitoring active');
    }

    /**
     * Add description to an element
     * @param {HTMLElement} element - Element to describe
     * @param {string} description - Description text
     */
    addDescription(element, description) {
        const id = `desc-${Math.random().toString(36).substr(2, 9)}`;
        const descElement = document.createElement('span');
        descElement.id = id;
        descElement.className = 'sr-only';
        descElement.textContent = description;

        element.appendChild(descElement);
        element.setAttribute('aria-describedby', id);
    }

    /**
     * Update page title and announce change
     * @param {string} title - New page title
     */
    updatePageTitle(title) {
        document.title = title;
        this.announcePageChange(title);
    }

    /**
     * Mark element as busy/loading
     * @param {HTMLElement} element - Element to mark
     * @param {boolean} busy - Whether element is busy
     */
    setBusy(element, busy = true) {
        if (busy) {
            element.setAttribute('aria-busy', 'true');
            const label = element.getAttribute('aria-label') || element.textContent.trim();
            this.announceLoading(`${label} is loading`);
        } else {
            element.setAttribute('aria-busy', 'false');
            const label = element.getAttribute('aria-label') || element.textContent.trim();
            this.announceStatus(`${label} finished loading`);
        }
    }

    /**
     * Announce progress
     * @param {number} value - Current progress value
     * @param {number} max - Maximum progress value
     * @param {string} label - Progress label
     */
    announceProgress(value, max, label = 'Progress') {
        const percentage = Math.round((value / max) * 100);
        this.announceStatus(`${label}: ${percentage}% complete`);
    }
}

// Initialize globally
if (typeof window !== 'undefined') {
    window.ScreenReaderSupport = ScreenReaderSupport;
    window.screenReader = new ScreenReaderSupport();
    console.log('[ScreenReader] 🚀 Screen reader support loaded');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScreenReaderSupport;
}
