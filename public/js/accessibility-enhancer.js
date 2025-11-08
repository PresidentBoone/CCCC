/**
 * Accessibility Enhancer - Week 4 Quality Enhancement
 * Implements ARIA labels, keyboard navigation, and screen reader support
 * 
 * Usage:
 * AccessibilityEnhancer.init();
 * AccessibilityEnhancer.addARIA(element, 'label', 'Submit form');
 * AccessibilityEnhancer.enableKeyboardNav();
 */

class AccessibilityEnhancer {
    constructor() {
        this.focusableElements = [];
        this.skipLinks = [];
        this.announcer = null;
        this.init();
    }

    /**
     * Initialize accessibility enhancements
     */
    init() {
        // Wait for DOM to be ready before initializing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initEnhancements());
        } else {
            this.initEnhancements();
        }
    }

    /**
     * Run all accessibility enhancements (after DOM is ready)
     */
    initEnhancements() {
        // Create screen reader announcer
        this.createAnnouncer();

        // Add skip links
        this.addSkipLinks();

        // Enhance keyboard navigation
        this.enhanceKeyboardNav();

        // Add focus indicators
        this.addFocusIndicators();

        // Fix missing ARIA labels
        this.fixMissingARIA();

        // Enable focus trapping in modals
        this.setupModalFocusTrap();

        // Add keyboard shortcuts help
        this.addKeyboardShortcutsHelp();
    }

    /**
     * Create live region for screen reader announcements
     */
    createAnnouncer() {
        if (document.getElementById('a11y-announcer')) return;
        
        this.announcer = document.createElement('div');
        this.announcer.id = 'a11y-announcer';
        this.announcer.setAttribute('role', 'status');
        this.announcer.setAttribute('aria-live', 'polite');
        this.announcer.setAttribute('aria-atomic', 'true');
        this.announcer.className = 'sr-only';
        this.announcer.style.cssText = `
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
        `;

        // Safely append to body
        if (document.body) {
            document.body.appendChild(this.announcer);
        } else {
            console.warn('Accessibility: document.body not ready, deferring announcer creation');
        }
    }

    /**
     * Announce message to screen readers
     */
    announce(message, priority = 'polite') {
        if (!this.announcer) this.createAnnouncer();
        
        this.announcer.setAttribute('aria-live', priority);
        this.announcer.textContent = '';
        
        // Clear and set new message
        setTimeout(() => {
            this.announcer.textContent = message;
        }, 100);
        
        console.log('📢 A11y Announcement:', message);
    }

    /**
     * Add skip links for keyboard navigation
     */
    addSkipLinks() {
        if (document.querySelector('.skip-links')) return;
        
        const skipLinksContainer = document.createElement('nav');
        skipLinksContainer.className = 'skip-links';
        skipLinksContainer.setAttribute('aria-label', 'Skip links');
        
        const skipLinks = [
            { href: '#main-content', text: 'Skip to main content' },
            { href: '#navigation', text: 'Skip to navigation' },
            { href: '#footer', text: 'Skip to footer' }
        ];
        
        const ul = document.createElement('ul');
        skipLinks.forEach(link => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.text;
            a.className = 'skip-link';
            li.appendChild(a);
            ul.appendChild(li);
        });
        
        skipLinksContainer.appendChild(ul);
        document.body.insertBefore(skipLinksContainer, document.body.firstChild);
        
        // Add styles
        this.addSkipLinkStyles();
    }

    /**
     * Add skip link styles
     */
    addSkipLinkStyles() {
        if (document.getElementById('skip-link-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'skip-link-styles';
        style.textContent = `
            .skip-links {
                position: absolute;
                top: 0;
                left: 0;
                z-index: 999999;
            }
            
            .skip-links ul {
                list-style: none;
                margin: 0;
                padding: 0;
            }
            
            .skip-link {
                position: absolute;
                left: -9999px;
                top: 0;
                background: var(--accent-bg, #2a357a);
                color: white;
                padding: 0.75rem 1.5rem;
                text-decoration: none;
                font-weight: 600;
                border-radius: 0 0 8px 0;
                z-index: 999999;
            }
            
            .skip-link:focus {
                left: 0;
                outline: 3px solid var(--accent-color, #a07bcc);
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Enhance keyboard navigation
     */
    enhanceKeyboardNav() {
        // Add keyboard event listeners
        document.addEventListener('keydown', (e) => {
            // Escape key to close modals
            if (e.key === 'Escape') {
                this.closeTopModal();
            }
            
            // Tab key navigation
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
            
            // Arrow key navigation for lists
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                this.handleArrowNavigation(e);
            }
            
            // Ctrl+/ or Cmd+/ for keyboard shortcuts help
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.showKeyboardShortcuts();
            }
        });
        
        // Track focus for better UX
        document.addEventListener('focus', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.announce(`${e.target.getAttribute('aria-label') || e.target.name || 'Input'} focused`, 'polite');
            }
        }, true);
    }

    /**
     * Handle tab navigation
     */
    handleTabNavigation(e) {
        const focusableElements = this.getFocusableElements();
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // If in modal, trap focus
        const modal = document.querySelector('.modal:not([style*="display: none"])');
        if (modal) {
            const modalFocusable = Array.from(modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            ));
            
            if (modalFocusable.length > 0) {
                const modalFirst = modalFocusable[0];
                const modalLast = modalFocusable[modalFocusable.length - 1];
                
                if (e.shiftKey && document.activeElement === modalFirst) {
                    e.preventDefault();
                    modalLast.focus();
                } else if (!e.shiftKey && document.activeElement === modalLast) {
                    e.preventDefault();
                    modalFirst.focus();
                }
            }
        }
    }

    /**
     * Handle arrow key navigation
     */
    handleArrowNavigation(e) {
        const target = e.target;
        
        // Check if in a list or menu
        if (target.matches('[role="menuitem"], [role="option"], [role="tab"]')) {
            e.preventDefault();
            
            const parent = target.closest('[role="menu"], [role="listbox"], [role="tablist"]');
            const items = Array.from(parent.querySelectorAll('[role="menuitem"], [role="option"], [role="tab"]'));
            const currentIndex = items.indexOf(target);
            
            let nextIndex;
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                nextIndex = (currentIndex + 1) % items.length;
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                nextIndex = (currentIndex - 1 + items.length) % items.length;
            }
            
            if (nextIndex !== undefined) {
                items[nextIndex].focus();
            }
        }
    }

    /**
     * Get all focusable elements
     */
    getFocusableElements() {
        return Array.from(document.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ));
    }

    /**
     * Add focus indicators
     */
    addFocusIndicators() {
        if (document.getElementById('focus-indicator-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'focus-indicator-styles';
        style.textContent = `
            /* High visibility focus indicators */
            *:focus-visible {
                outline: 3px solid var(--accent-color, #a07bcc);
                outline-offset: 2px;
                border-radius: 4px;
            }
            
            /* Button focus */
            button:focus-visible,
            .btn:focus-visible {
                outline: 3px solid var(--accent-color, #a07bcc);
                outline-offset: 2px;
                box-shadow: 0 0 0 6px rgba(160, 123, 204, 0.2);
            }
            
            /* Link focus */
            a:focus-visible {
                outline: 3px solid var(--accent-color, #a07bcc);
                outline-offset: 2px;
                text-decoration: underline;
                text-decoration-thickness: 2px;
            }
            
            /* Skip mouse focus for mouse users */
            *:focus:not(:focus-visible) {
                outline: none;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Fix missing ARIA labels
     */
    fixMissingARIA() {
        // Fix buttons without labels
        const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        buttons.forEach(button => {
            if (!button.textContent.trim() && !button.querySelector('img[alt]')) {
                const icon = button.querySelector('i, svg');
                if (icon) {
                    const className = icon.className;
                    const label = this.guessLabelFromIcon(className);
                    if (label) {
                        button.setAttribute('aria-label', label);
                    }
                }
            }
        });
        
        // Fix images without alt text
        const images = document.querySelectorAll('img:not([alt])');
        images.forEach(img => {
            img.setAttribute('alt', '');
            console.warn('Image without alt text:', img.src);
        });
        
        // Fix form inputs without labels
        const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
        inputs.forEach(input => {
            const label = input.closest('label') || document.querySelector(`label[for="${input.id}"]`);
            if (!label && input.name) {
                input.setAttribute('aria-label', this.formatFieldName(input.name));
            }
        });
        
        // Add role to navigation
        const navs = document.querySelectorAll('nav:not([role])');
        navs.forEach(nav => nav.setAttribute('role', 'navigation'));
        
        // Add role to main content
        const main = document.querySelector('main');
        if (main && !main.hasAttribute('role')) {
            main.setAttribute('role', 'main');
            main.id = main.id || 'main-content';
        }
    }

    /**
     * Guess label from icon class
     */
    guessLabelFromIcon(className) {
        const iconMap = {
            'search': 'Search',
            'menu': 'Menu',
            'close': 'Close',
            'edit': 'Edit',
            'delete': 'Delete',
            'save': 'Save',
            'add': 'Add',
            'remove': 'Remove',
            'settings': 'Settings',
            'user': 'User profile',
            'home': 'Home',
            'logout': 'Logout',
            'login': 'Login',
            'heart': 'Like',
            'share': 'Share',
            'download': 'Download',
            'upload': 'Upload',
            'refresh': 'Refresh',
            'print': 'Print'
        };
        
        for (const [key, label] of Object.entries(iconMap)) {
            if (className.toLowerCase().includes(key)) {
                return label;
            }
        }
        
        return null;
    }

    /**
     * Format field name for label
     */
    formatFieldName(name) {
        return name
            .replace(/([A-Z])/g, ' $1')
            .replace(/[_-]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .trim();
    }

    /**
     * Setup modal focus trap
     */
    setupModalFocusTrap() {
        // Observe for modal creation
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.matches('.modal, [role="dialog"]')) {
                        this.trapFocusInModal(node);
                    }
                });
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * Trap focus in modal
     */
    trapFocusInModal(modal) {
        // Add ARIA attributes
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        
        // Focus first focusable element
        const focusable = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusable.length > 0) {
            setTimeout(() => focusable[0].focus(), 100);
        }
    }

    /**
     * Close top modal
     */
    closeTopModal() {
        const modals = Array.from(document.querySelectorAll('.modal, [role="dialog"]'))
            .filter(m => m.style.display !== 'none');
        
        if (modals.length > 0) {
            const topModal = modals[modals.length - 1];
            const closeBtn = topModal.querySelector('[data-dismiss], .close, .modal-close');
            if (closeBtn) {
                closeBtn.click();
            }
        }
    }

    /**
     * Add keyboard shortcuts help
     */
    addKeyboardShortcutsHelp() {
        this.shortcuts = [
            { keys: 'Tab', description: 'Navigate forward' },
            { keys: 'Shift + Tab', description: 'Navigate backward' },
            { keys: 'Enter', description: 'Activate button/link' },
            { keys: 'Escape', description: 'Close modal/dialog' },
            { keys: 'Arrow Keys', description: 'Navigate lists/menus' },
            { keys: 'Ctrl/Cmd + /', description: 'Show keyboard shortcuts' }
        ];
    }

    /**
     * Show keyboard shortcuts modal
     */
    showKeyboardShortcuts() {
        const existing = document.getElementById('keyboard-shortcuts-modal');
        if (existing) {
            existing.remove();
            return;
        }
        
        const modal = document.createElement('div');
        modal.id = 'keyboard-shortcuts-modal';
        modal.className = 'keyboard-shortcuts-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'shortcuts-title');
        modal.setAttribute('aria-modal', 'true');
        
        modal.innerHTML = `
            <div class="shortcuts-content">
                <h2 id="shortcuts-title">Keyboard Shortcuts</h2>
                <button class="close-shortcuts" aria-label="Close keyboard shortcuts">×</button>
                <div class="shortcuts-list">
                    ${this.shortcuts.map(shortcut => `
                        <div class="shortcut-item">
                            <kbd>${shortcut.keys}</kbd>
                            <span>${shortcut.description}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close handler
        modal.querySelector('.close-shortcuts').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        // Add styles
        this.addShortcutsStyles();
        
        this.announce('Keyboard shortcuts dialog opened');
    }

    /**
     * Add shortcuts modal styles
     */
    addShortcutsStyles() {
        if (document.getElementById('shortcuts-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'shortcuts-styles';
        style.textContent = `
            .keyboard-shortcuts-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
            }
            
            .shortcuts-content {
                background: var(--primary-bg, white);
                padding: 2rem;
                border-radius: 16px;
                max-width: 500px;
                width: 90%;
                position: relative;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            
            .shortcuts-content h2 {
                margin-top: 0;
                color: var(--text-primary, #333);
            }
            
            .close-shortcuts {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                font-size: 2rem;
                cursor: pointer;
                color: var(--text-secondary, #666);
                padding: 0.5rem;
            }
            
            .shortcuts-list {
                display: grid;
                gap: 1rem;
            }
            
            .shortcut-item {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .shortcut-item kbd {
                background: var(--secondary-bg, #f8f9ff);
                border: 2px solid var(--border-color, #e5e7eb);
                padding: 0.5rem 1rem;
                border-radius: 6px;
                font-family: monospace;
                font-weight: 600;
                min-width: 120px;
                text-align: center;
            }
            
            .shortcut-item span {
                color: var(--text-secondary, #666);
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Add ARIA attribute to element
     */
    addARIA(element, attribute, value) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el) {
            el.setAttribute(`aria-${attribute}`, value);
        }
    }

    /**
     * Check color contrast
     */
    checkColorContrast(foreground, background) {
        // Simple contrast checker (implement full WCAG algorithm if needed)
        const getLuminance = (hex) => {
            const rgb = parseInt(hex.slice(1), 16);
            const r = (rgb >> 16) & 0xff;
            const g = (rgb >> 8) & 0xff;
            const b = (rgb >> 0) & 0xff;
            
            const [rs, gs, bs] = [r, g, b].map(c => {
                c = c / 255;
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });
            
            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        };
        
        const l1 = getLuminance(foreground);
        const l2 = getLuminance(background);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        
        return {
            ratio: ratio.toFixed(2),
            aa: ratio >= 4.5,
            aaa: ratio >= 7
        };
    }
}

// Create global instance
window.AccessibilityEnhancer = new AccessibilityEnhancer();

// Export
// export default window.AccessibilityEnhancer;
