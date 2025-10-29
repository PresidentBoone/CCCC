/**
 * Highlight Overlay System for Essay Coach
 *
 * Replaces contentEditable approach with a performant overlay architecture:
 * - Native <textarea> for editing (fast, no lag)
 * - Positioned <div> overlay for highlights
 * - Scroll synchronization
 * - Single-pass rendering algorithm
 *
 * @module HighlightOverlay
 */

(function(window) {
    'use strict';

    /**
     * Category display names for highlights
     */
    const CATEGORY_NAMES = {
        'cliche': 'Cliché',
        'weak_verb': 'Weak Verb',
        'vague': 'Vague Statement',
        'show_dont_tell': 'Show, Don\'t Tell',
        'grammar': 'Grammar',
        'unclear': 'Unclear',
        'strength': 'Strength'
    };

    /**
     * HighlightOverlay class
     * Manages the overlay-based highlight system
     */
    class HighlightOverlay {
        constructor(textareaId) {
            this.textareaId = textareaId;
            this.textarea = null;
            this.overlay = null;
            this.overlayWrapper = null;
            this.highlights = [];
            this.isInitialized = false;

            // Performance tracking
            this.renderTime = 0;
            this.lastRenderStart = 0;
        }

        /**
         * Initialize the overlay system
         */
        init() {
            this.textarea = document.getElementById(this.textareaId);
            if (!this.textarea) {
                console.error(`❌ Textarea with id "${this.textareaId}" not found`);
                return false;
            }

            // Create overlay structure
            this.createOverlayStructure();

            // Set up scroll sync
            this.setupScrollSync();

            // Set up resize observer
            this.setupResizeObserver();

            this.isInitialized = true;
            console.log('✅ HighlightOverlay initialized');
            return true;
        }

        /**
         * Create the overlay structure
         */
        createOverlayStructure() {
            // Wrap textarea in a container if not already wrapped
            let wrapper = this.textarea.parentElement;
            if (!wrapper.classList.contains('highlight-overlay-wrapper')) {
                wrapper = document.createElement('div');
                wrapper.className = 'highlight-overlay-wrapper';
                this.textarea.parentNode.insertBefore(wrapper, this.textarea);
                wrapper.appendChild(this.textarea);
            }
            this.overlayWrapper = wrapper;

            // Create overlay div
            this.overlay = document.createElement('div');
            this.overlay.id = 'highlightOverlay';
            this.overlay.className = 'highlight-overlay';
            this.overlay.setAttribute('aria-hidden', 'true');

            // Insert overlay before textarea
            wrapper.insertBefore(this.overlay, this.textarea);

            // Make textarea transparent and positioned
            this.textarea.style.position = 'relative';
            this.textarea.style.background = 'transparent';
            this.textarea.style.zIndex = '2';

            // Set wrapper position
            wrapper.style.position = 'relative';
        }

        /**
         * Set up scroll synchronization
         */
        setupScrollSync() {
            let scrollTimeout;

            this.textarea.addEventListener('scroll', () => {
                // Sync overlay scroll immediately
                this.overlay.scrollTop = this.textarea.scrollTop;
                this.overlay.scrollLeft = this.textarea.scrollLeft;

                // Debounce tooltip updates
                clearTimeout(scrollTimeout);
                this.overlay.classList.add('scrolling');

                scrollTimeout = setTimeout(() => {
                    this.overlay.classList.remove('scrolling');
                }, 150);
            });
        }

        /**
         * Set up resize observer for responsive updates
         */
        setupResizeObserver() {
            if (typeof ResizeObserver === 'undefined') return;

            const observer = new ResizeObserver(() => {
                this.syncOverlayDimensions();
            });

            observer.observe(this.textarea);
        }

        /**
         * Sync overlay dimensions with textarea
         */
        syncOverlayDimensions() {
            if (!this.overlay || !this.textarea) return;

            const computed = window.getComputedStyle(this.textarea);

            // Copy dimensions and padding
            this.overlay.style.width = computed.width;
            this.overlay.style.height = computed.height;
            this.overlay.style.padding = computed.padding;
            this.overlay.style.border = computed.border;
            this.overlay.style.fontSize = computed.fontSize;
            this.overlay.style.fontFamily = computed.fontFamily;
            this.overlay.style.lineHeight = computed.lineHeight;
            this.overlay.style.letterSpacing = computed.letterSpacing;
            this.overlay.style.wordSpacing = computed.wordSpacing;
        }

        /**
         * Apply highlights using single-pass algorithm
         * @param {Array} highlights - Array of highlight objects
         */
        applyHighlights(highlights) {
            console.log('🎨 Applying highlights:', highlights);

            if (!this.isInitialized) {
                console.error('❌ HighlightOverlay not initialized');
                return;
            }

            if (!highlights || highlights.length === 0) {
                console.log('⚠️ No highlights to apply');
                this.clearHighlights();
                return;
            }

            this.highlights = highlights;
            this.lastRenderStart = performance.now();

            const text = this.textarea.value;
            if (!text || text.trim().length === 0) {
                console.error('❌ No essay text to highlight');
                return;
            }

            // Render highlights using single-pass algorithm
            const highlightedHTML = this.renderHighlightsSinglePass(text, highlights);

            // Update overlay
            this.overlay.innerHTML = highlightedHTML;

            // Sync dimensions
            this.syncOverlayDimensions();

            // Sync scroll position
            this.overlay.scrollTop = this.textarea.scrollTop;
            this.overlay.scrollLeft = this.textarea.scrollLeft;

            // Attach event listeners to highlights
            this.attachHighlightListeners();

            this.renderTime = performance.now() - this.lastRenderStart;
            console.log(`✅ Applied ${highlights.length} highlights in ${this.renderTime.toFixed(2)}ms`);
        }

        /**
         * Single-pass highlight rendering algorithm
         * O(n log n) time complexity (sorting) + O(n) for rendering
         *
         * @param {string} text - Original text
         * @param {Array} highlights - Array of highlight objects
         * @returns {string} HTML string with highlights
         */
        renderHighlightsSinglePass(text, highlights) {
            // Validate and normalize highlights
            const validHighlights = this.validateHighlights(text, highlights);

            if (validHighlights.length === 0) {
                return this.escapeHTML(text);
            }

            // Sort by start index (ascending order for single pass)
            const sorted = [...validHighlights].sort((a, b) => a.startIndex - a.startIndex);

            // Build result using array (faster than string concatenation)
            const result = [];
            let lastIndex = 0;

            sorted.forEach((highlight, idx) => {
                const { startIndex, endIndex, type, category } = highlight;

                // Add text before highlight
                if (startIndex > lastIndex) {
                    result.push(this.escapeHTML(text.substring(lastIndex, startIndex)));
                }

                // Handle overlapping highlights
                const actualStart = Math.max(startIndex, lastIndex);
                const actualEnd = endIndex;

                if (actualStart < actualEnd) {
                    // Add highlight
                    const categoryDisplay = CATEGORY_NAMES[category] || category || 'Feedback';
                    const highlightedText = text.substring(actualStart, actualEnd);

                    result.push(
                        `<mark class="essay-highlight highlight-${type}" ` +
                        `data-index="${idx}" ` +
                        `data-category="${categoryDisplay}" ` +
                        `data-start="${actualStart}" ` +
                        `data-end="${actualEnd}" ` +
                        `role="mark" ` +
                        `aria-label="${categoryDisplay}: ${this.escapeHTML(highlightedText)}" ` +
                        `tabindex="0">` +
                        `${this.escapeHTML(highlightedText)}` +
                        `</mark>`
                    );

                    lastIndex = actualEnd;
                }
            });

            // Add remaining text
            if (lastIndex < text.length) {
                result.push(this.escapeHTML(text.substring(lastIndex)));
            }

            return result.join('');
        }

        /**
         * Validate highlights and filter invalid ones
         * @param {string} text - Original text
         * @param {Array} highlights - Array of highlight objects
         * @returns {Array} Valid highlights
         */
        validateHighlights(text, highlights) {
            return highlights.filter(h => {
                // Check required properties
                if (typeof h.startIndex !== 'number' || typeof h.endIndex !== 'number') {
                    console.warn('Invalid highlight indices:', h);
                    return false;
                }

                // Check bounds
                if (h.startIndex < 0 || h.endIndex > text.length || h.startIndex >= h.endIndex) {
                    console.warn('Highlight indices out of bounds:', h);
                    return false;
                }

                // Check type
                if (!h.type || !['red', 'yellow', 'green'].includes(h.type)) {
                    console.warn('Invalid highlight type:', h);
                    return false;
                }

                return true;
            });
        }

        /**
         * Attach event listeners to highlight elements
         */
        attachHighlightListeners() {
            const highlightElements = this.overlay.querySelectorAll('.essay-highlight');

            highlightElements.forEach(element => {
                // Click handler
                element.addEventListener('click', (e) => {
                    this.handleHighlightClick(e.target);
                });

                // Keyboard handler
                element.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.handleHighlightClick(e.target);
                    }
                });

                // Hover handlers
                element.addEventListener('mouseenter', (e) => {
                    this.handleHighlightHover(e.target);
                });

                element.addEventListener('mouseleave', () => {
                    this.handleHighlightHoverOut();
                });

                // Focus handlers for keyboard navigation
                element.addEventListener('focus', (e) => {
                    this.handleHighlightHover(e.target);
                });

                element.addEventListener('blur', () => {
                    this.handleHighlightHoverOut();
                });
            });
        }

        /**
         * Handle highlight click
         * @param {HTMLElement} highlight - The clicked highlight element
         */
        handleHighlightClick(highlight) {
            const index = parseInt(highlight.getAttribute('data-index'));
            if (isNaN(index)) return;

            // Dispatch custom event for feedback scroll
            const event = new CustomEvent('highlightClick', {
                detail: { index, highlight }
            });
            window.dispatchEvent(event);

            // Visual feedback
            highlight.style.animation = 'pulse 0.5s ease-in-out';
            setTimeout(() => {
                highlight.style.animation = '';
            }, 500);
        }

        /**
         * Handle highlight hover
         * @param {HTMLElement} highlight - The hovered highlight element
         */
        handleHighlightHover(highlight) {
            const category = highlight.getAttribute('data-category');
            const index = highlight.getAttribute('data-index');

            // Dispatch custom event for tooltip
            const event = new CustomEvent('highlightHover', {
                detail: {
                    category,
                    index,
                    element: highlight
                }
            });
            window.dispatchEvent(event);
        }

        /**
         * Handle highlight hover out
         */
        handleHighlightHoverOut() {
            // Dispatch custom event for tooltip hide
            const event = new CustomEvent('highlightHoverOut');
            window.dispatchEvent(event);
        }

        /**
         * Clear all highlights
         */
        clearHighlights() {
            if (this.overlay) {
                this.overlay.innerHTML = '';
            }
            this.highlights = [];
            console.log('🧹 Highlights cleared');
        }

        /**
         * Escape HTML to prevent XSS
         * @param {string} str - String to escape
         * @returns {string} Escaped string
         */
        escapeHTML(str) {
            if (!str) return '';

            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        /**
         * Update highlights after text edit (preserve positions)
         * @param {string} newText - New text content
         * @param {number} editStart - Start position of edit
         * @param {number} editEnd - End position of edit before change
         * @param {number} lengthDelta - Change in length (can be negative)
         */
        updateHighlightsAfterEdit(newText, editStart, editEnd, lengthDelta) {
            if (this.highlights.length === 0) return;

            const updatedHighlights = [];

            this.highlights.forEach(highlight => {
                // Highlight ends before edit - no change needed
                if (highlight.endIndex <= editStart) {
                    updatedHighlights.push(highlight);
                    return;
                }

                // Highlight starts after edit - shift by delta
                if (highlight.startIndex >= editEnd) {
                    updatedHighlights.push({
                        ...highlight,
                        startIndex: highlight.startIndex + lengthDelta,
                        endIndex: highlight.endIndex + lengthDelta
                    });
                    return;
                }

                // Highlight overlaps edit region - invalidate it
                console.log('Highlight invalidated by edit:', highlight);
            });

            // Update stored highlights
            this.highlights = updatedHighlights;

            // Re-render if we still have highlights
            if (updatedHighlights.length > 0) {
                this.applyHighlights(updatedHighlights);
            } else {
                this.clearHighlights();
            }
        }

        /**
         * Set up text edit tracking
         * @param {Function} callback - Callback when edits occur
         */
        setupEditTracking(callback) {
            if (!this.textarea) return;

            let lastText = this.textarea.value;

            this.textarea.addEventListener('input', (e) => {
                const newText = this.textarea.value;
                const selectionStart = this.textarea.selectionStart || 0;

                // Calculate edit position and delta
                const lengthDelta = newText.length - lastText.length;

                // Find edit start (first difference)
                let editStart = 0;
                while (editStart < lastText.length && editStart < newText.length) {
                    if (lastText[editStart] !== newText[editStart]) break;
                    editStart++;
                }

                // Find edit end in old text
                let editEnd = editStart;
                if (lengthDelta < 0) {
                    // Deletion
                    editEnd = editStart - lengthDelta;
                } else {
                    // Insertion
                    editEnd = editStart;
                }

                // Update highlights if we have any
                if (this.highlights.length > 0) {
                    this.updateHighlightsAfterEdit(newText, editStart, editEnd, lengthDelta);
                }

                // Call callback if provided
                if (callback) {
                    callback(newText, editStart, editEnd, lengthDelta);
                }

                lastText = newText;
            });
        }

        /**
         * Get performance metrics
         * @returns {Object} Performance metrics
         */
        getPerformanceMetrics() {
            return {
                lastRenderTime: this.renderTime,
                highlightCount: this.highlights.length,
                isInitialized: this.isInitialized
            };
        }

        /**
         * Destroy the overlay system
         */
        destroy() {
            if (this.overlay) {
                this.overlay.remove();
            }

            if (this.textarea) {
                this.textarea.style.position = '';
                this.textarea.style.background = '';
                this.textarea.style.zIndex = '';
            }

            this.isInitialized = false;
            console.log('🗑️ HighlightOverlay destroyed');
        }
    }

    // Export to window
    window.HighlightOverlay = HighlightOverlay;

    console.log('📦 HighlightOverlay module loaded');

})(window);
