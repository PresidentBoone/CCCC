/**
 * Tooltip Manager for Essay Coach Highlights
 *
 * Provides smart tooltip positioning with edge detection,
 * scroll/resize synchronization, and accessibility support.
 *
 * @module TooltipManager
 */

(function(window) {
    'use strict';

    /**
     * TooltipManager class
     * Manages tooltip display, positioning, and synchronization
     */
    class TooltipManager {
        constructor() {
            this.tooltip = null;
            this.currentHighlight = null;
            this.isVisible = false;
            this.updateRAF = null;
            this.scrollTimeout = null;

            // Performance tracking
            this.positioningTime = 0;

            // Configuration
            this.config = {
                fadeInDuration: 150,
                fadeOutDuration: 150,
                scrollHideDelay: 100,
                offset: 10,
                arrowSize: 6,
                maxWidth: 280,
                zIndex: 10000
            };

            // Viewport padding for edge detection
            this.viewportPadding = {
                top: 80,  // Account for navbar
                right: 20,
                bottom: 20,
                left: 20
            };

            this.init();
        }

        /**
         * Initialize tooltip manager
         */
        init() {
            this.createTooltipElement();
            this.setupEventListeners();
            console.log('✅ TooltipManager initialized');
        }

        /**
         * Create tooltip DOM element
         */
        createTooltipElement() {
            // Check if tooltip already exists
            if (document.getElementById('essayHighlightTooltip')) {
                this.tooltip = document.getElementById('essayHighlightTooltip');
                return;
            }

            this.tooltip = document.createElement('div');
            this.tooltip.id = 'essayHighlightTooltip';
            this.tooltip.className = 'essay-tooltip';
            this.tooltip.setAttribute('role', 'tooltip');
            this.tooltip.setAttribute('aria-hidden', 'true');

            // Add arrow
            const arrow = document.createElement('div');
            arrow.className = 'essay-tooltip-arrow';
            this.tooltip.appendChild(arrow);

            // Add content container
            const content = document.createElement('div');
            content.className = 'essay-tooltip-content';
            this.tooltip.appendChild(content);

            document.body.appendChild(this.tooltip);
        }

        /**
         * Setup event listeners for scroll and resize
         */
        setupEventListeners() {
            // Window resize handler
            window.addEventListener('resize', () => {
                if (this.isVisible && this.currentHighlight) {
                    this.updatePosition(this.currentHighlight);
                }
            });

            // Scroll handler (debounced)
            window.addEventListener('scroll', () => {
                if (this.isVisible) {
                    this.handleScroll();
                }
            }, { passive: true });
        }

        /**
         * Handle scroll with debouncing
         */
        handleScroll() {
            // Hide tooltip during scroll for performance
            this.tooltip.style.opacity = '0';

            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                if (this.isVisible && this.currentHighlight) {
                    this.updatePosition(this.currentHighlight);
                    this.tooltip.style.opacity = '1';
                }
            }, this.config.scrollHideDelay);
        }

        /**
         * Show tooltip for a highlight element
         * @param {HTMLElement} highlightElement - The highlight element
         * @param {Object} data - Tooltip data {category, feedback, type}
         */
        show(highlightElement, data) {
            if (!highlightElement || !data) return;

            const startTime = performance.now();

            this.currentHighlight = highlightElement;

            // Set content
            this.setContent(data);

            // Position tooltip
            this.updatePosition(highlightElement);

            // Show with fade in
            this.tooltip.setAttribute('aria-hidden', 'false');
            this.tooltip.style.display = 'block';

            // Force reflow for animation
            void this.tooltip.offsetWidth;

            this.tooltip.style.opacity = '1';
            this.isVisible = true;

            this.positioningTime = performance.now() - startTime;
        }

        /**
         * Set tooltip content
         * @param {Object} data - Tooltip data
         */
        setContent(data) {
            const { category, feedback, type } = data;
            const content = this.tooltip.querySelector('.essay-tooltip-content');

            // Add type-specific styling
            this.tooltip.className = `essay-tooltip essay-tooltip-${type || 'default'}`;

            // Get icon based on type
            const icons = {
                'red': '<i class="fas fa-exclamation-triangle"></i>',
                'yellow': '<i class="fas fa-lightbulb"></i>',
                'green': '<i class="fas fa-check-circle"></i>'
            };

            const icon = icons[type] || '<i class="fas fa-info-circle"></i>';

            content.innerHTML = `
                <div class="tooltip-header">
                    ${icon}
                    <strong>${this.escapeHTML(category || 'Feedback')}</strong>
                </div>
                ${feedback ? `<div class="tooltip-body">${this.escapeHTML(feedback)}</div>` : ''}
                <div class="tooltip-hint">Click for detailed feedback</div>
            `;
        }

        /**
         * Update tooltip position with smart edge detection
         * @param {HTMLElement} targetElement - Element to position near
         */
        updatePosition(targetElement) {
            if (!targetElement || !this.tooltip) return;

            const startTime = performance.now();

            // Use RAF for smooth updates
            if (this.updateRAF) {
                cancelAnimationFrame(this.updateRAF);
            }

            this.updateRAF = requestAnimationFrame(() => {
                const rect = targetElement.getBoundingClientRect();
                const tooltipRect = this.tooltip.getBoundingClientRect();

                const viewport = {
                    width: window.innerWidth,
                    height: window.innerHeight
                };

                // Calculate ideal position (above center of highlight)
                let top = rect.top - tooltipRect.height - this.config.offset;
                let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                let position = 'top';

                // Edge detection and adjustment

                // Check top boundary
                if (top < this.viewportPadding.top) {
                    // Position below instead
                    top = rect.bottom + this.config.offset;
                    position = 'bottom';
                }

                // Check bottom boundary
                if (top + tooltipRect.height > viewport.height - this.viewportPadding.bottom) {
                    // Position above
                    top = rect.top - tooltipRect.height - this.config.offset;
                    position = 'top';
                }

                // Check left boundary
                if (left < this.viewportPadding.left) {
                    left = this.viewportPadding.left;
                }

                // Check right boundary
                if (left + tooltipRect.width > viewport.width - this.viewportPadding.right) {
                    left = viewport.width - tooltipRect.width - this.viewportPadding.right;
                }

                // Apply position
                this.tooltip.style.top = `${top}px`;
                this.tooltip.style.left = `${left}px`;

                // Position arrow
                this.positionArrow(rect, left, tooltipRect.width, position);

                // Set data attribute for CSS styling
                this.tooltip.setAttribute('data-position', position);

                this.positioningTime = performance.now() - startTime;
            });
        }

        /**
         * Position the tooltip arrow
         * @param {DOMRect} targetRect - Bounding rect of target element
         * @param {number} tooltipLeft - Tooltip left position
         * @param {number} tooltipWidth - Tooltip width
         * @param {string} position - 'top' or 'bottom'
         */
        positionArrow(targetRect, tooltipLeft, tooltipWidth, position) {
            const arrow = this.tooltip.querySelector('.essay-tooltip-arrow');
            if (!arrow) return;

            // Calculate arrow position (centered on target)
            const targetCenter = targetRect.left + (targetRect.width / 2);
            const arrowLeft = targetCenter - tooltipLeft;

            // Clamp arrow position within tooltip bounds
            const minArrowLeft = this.config.arrowSize + 5;
            const maxArrowLeft = tooltipWidth - this.config.arrowSize - 5;
            const clampedArrowLeft = Math.max(minArrowLeft, Math.min(maxArrowLeft, arrowLeft));

            arrow.style.left = `${clampedArrowLeft}px`;

            // Set arrow direction
            arrow.setAttribute('data-position', position);
        }

        /**
         * Hide tooltip
         */
        hide() {
            if (!this.isVisible) return;

            this.tooltip.style.opacity = '0';
            this.isVisible = false;
            this.currentHighlight = null;

            // Remove from DOM after fade out
            setTimeout(() => {
                if (!this.isVisible) {
                    this.tooltip.style.display = 'none';
                    this.tooltip.setAttribute('aria-hidden', 'true');
                }
            }, this.config.fadeOutDuration);

            // Cancel any pending RAF
            if (this.updateRAF) {
                cancelAnimationFrame(this.updateRAF);
                this.updateRAF = null;
            }
        }

        /**
         * Check if tooltip is currently visible
         * @returns {boolean}
         */
        isShowing() {
            return this.isVisible;
        }

        /**
         * Get performance metrics
         * @returns {Object}
         */
        getPerformanceMetrics() {
            return {
                lastPositioningTime: this.positioningTime,
                isVisible: this.isVisible
            };
        }

        /**
         * Escape HTML to prevent XSS
         * @param {string} str
         * @returns {string}
         */
        escapeHTML(str) {
            if (!str) return '';
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        /**
         * Destroy tooltip manager
         */
        destroy() {
            if (this.tooltip) {
                this.tooltip.remove();
            }

            if (this.updateRAF) {
                cancelAnimationFrame(this.updateRAF);
            }

            clearTimeout(this.scrollTimeout);

            this.currentHighlight = null;
            this.isVisible = false;

            console.log('🗑️ TooltipManager destroyed');
        }
    }

    // Export to window
    window.TooltipManager = TooltipManager;

    console.log('📦 TooltipManager module loaded');

})(window);
