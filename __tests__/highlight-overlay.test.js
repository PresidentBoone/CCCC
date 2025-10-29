/**
 * Tests for HighlightOverlay system
 */

// Polyfills for JSDOM
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { JSDOM } = require('jsdom');

describe('HighlightOverlay', () => {
    let HighlightOverlay;
    let window, document;

    beforeAll(() => {
        // Create JSDOM environment
        const dom = new JSDOM('<!DOCTYPE html><html><body><textarea id="essayTextarea"></textarea></body></html>', {
            url: 'http://localhost',
            pretendToBeVisual: true
        });

        window = dom.window;
        document = window.document;

        // Set up global window
        global.window = window;
        global.document = document;

        // Mock ResizeObserver
        window.ResizeObserver = class ResizeObserver {
            constructor(callback) {
                this.callback = callback;
            }
            observe() {}
            unobserve() {}
            disconnect() {}
        };

        // Load the module
        const fs = require('fs');
        const path = require('path');
        const moduleCode = fs.readFileSync(
            path.join(__dirname, '../public/js/highlight-overlay.js'),
            'utf8'
        );

        // Execute module in the JSDOM context
        const script = new window.Function(moduleCode + '\n//# sourceURL=highlight-overlay.js');
        script.call(window);

        HighlightOverlay = window.HighlightOverlay;
    });

    beforeEach(() => {
        // Reset textarea value before each test
        const textarea = document.getElementById('essayTextarea');
        if (textarea) {
            textarea.value = 'This is a test essay with some cliché phrases and vague statements that need improvement.';
        }
    });

    describe('Initialization', () => {
        test('creates instance with textarea id', () => {
            const overlay = new HighlightOverlay('essayTextarea');
            expect(overlay.textareaId).toBe('essayTextarea');
            expect(overlay.isInitialized).toBe(false);
        });

        test('initializes successfully', () => {
            const overlay = new HighlightOverlay('essayTextarea');
            const result = overlay.init();
            expect(result).toBe(true);
            expect(overlay.isInitialized).toBe(true);
        });

        test('fails initialization with missing textarea', () => {
            const overlay = new HighlightOverlay('nonexistent');
            const result = overlay.init();
            expect(result).toBe(false);
            expect(overlay.isInitialized).toBe(false);
        });
    });

    describe('Single-pass rendering algorithm', () => {
        let overlay;

        beforeEach(() => {
            overlay = new HighlightOverlay('essayTextarea');
            overlay.init();
        });

        test('renders highlights correctly', () => {
            const text = 'This is a test essay.';
            const highlights = [
                { startIndex: 5, endIndex: 7, type: 'red', category: 'weak_verb' },
                { startIndex: 10, endIndex: 14, type: 'yellow', category: 'vague' }
            ];

            const result = overlay.renderHighlightsSinglePass(text, highlights);

            expect(result).toContain('highlight-red');
            expect(result).toContain('highlight-yellow');
            expect(result).toContain('Weak Verb');
            expect(result).toContain('Vague Statement');
        });

        test('handles empty highlights array', () => {
            const text = 'This is a test essay.';
            const result = overlay.renderHighlightsSinglePass(text, []);

            // Should escape HTML and return plain text
            expect(result).not.toContain('<mark');
            expect(result).toContain('This is a test essay.');
        });

        test('handles overlapping highlights', () => {
            const text = 'This is a test essay.';
            const highlights = [
                { startIndex: 5, endIndex: 14, type: 'red', category: 'weak_verb' },
                { startIndex: 10, endIndex: 14, type: 'yellow', category: 'vague' }
            ];

            const result = overlay.renderHighlightsSinglePass(text, highlights);

            // Should handle overlaps gracefully
            expect(result).toContain('highlight-red');
            expect(result).toContain('highlight-yellow');
        });

        test('validates highlights before rendering', () => {
            const text = 'This is a test essay.';
            const highlights = [
                { startIndex: 5, endIndex: 7, type: 'red', category: 'weak_verb' }, // Valid
                { startIndex: -1, endIndex: 5, type: 'red', category: 'invalid' },  // Invalid: negative start
                { startIndex: 10, endIndex: 100, type: 'red', category: 'invalid' }, // Invalid: out of bounds
                { startIndex: 15, endIndex: 10, type: 'red', category: 'invalid' }  // Invalid: start > end
            ];

            const validated = overlay.validateHighlights(text, highlights);

            // Only first highlight should be valid
            expect(validated.length).toBe(1);
            expect(validated[0].startIndex).toBe(5);
        });

        test('escapes HTML in text', () => {
            const text = '<script>alert("xss")</script>';
            const result = overlay.renderHighlightsSinglePass(text, []);

            expect(result).not.toContain('<script>');
            expect(result).toContain('&lt;script&gt;');
        });

        test('handles multi-line highlights', () => {
            const text = 'Line 1\nLine 2\nLine 3';
            const highlights = [
                { startIndex: 4, endIndex: 13, type: 'yellow', category: 'vague' } // Spans across lines
            ];

            const result = overlay.renderHighlightsSinglePass(text, highlights);

            expect(result).toContain('highlight-yellow');
            // Should include the newline character
            expect(result).toContain('1\nLine');
        });
    });

    describe('Performance metrics', () => {
        test('tracks render time', () => {
            const overlay = new HighlightOverlay('essayTextarea');
            overlay.init();

            const highlights = [
                { startIndex: 5, endIndex: 10, type: 'red', category: 'weak_verb' }
            ];

            overlay.applyHighlights(highlights);

            const metrics = overlay.getPerformanceMetrics();
            expect(metrics.lastRenderTime).toBeGreaterThan(0);
            expect(metrics.highlightCount).toBe(1);
            expect(metrics.isInitialized).toBe(true);
        });
    });

    describe('Clear highlights', () => {
        test('clears highlights and resets state', () => {
            const overlay = new HighlightOverlay('essayTextarea');
            overlay.init();

            const highlights = [
                { startIndex: 5, endIndex: 10, type: 'red', category: 'weak_verb' }
            ];

            overlay.applyHighlights(highlights);
            expect(overlay.highlights.length).toBe(1);

            overlay.clearHighlights();
            expect(overlay.highlights.length).toBe(0);
            expect(overlay.overlay.innerHTML).toBe('');
        });
    });

    describe('XSS Prevention', () => {
        test('escapes HTML in highlight text', () => {
            const overlay = new HighlightOverlay('essayTextarea');
            const malicious = '<img src=x onerror="alert(1)">';
            const escaped = overlay.escapeHTML(malicious);

            expect(escaped).not.toContain('<img');
            expect(escaped).toContain('&lt;img');
        });

        test('handles null and undefined safely', () => {
            const overlay = new HighlightOverlay('essayTextarea');
            expect(overlay.escapeHTML(null)).toBe('');
            expect(overlay.escapeHTML(undefined)).toBe('');
            expect(overlay.escapeHTML('')).toBe('');
        });
    });

    describe('Scroll synchronization', () => {
        test('sets up scroll listener', () => {
            const overlay = new HighlightOverlay('essayTextarea');
            const textarea = document.getElementById('essayTextarea');

            // Spy on addEventListener before init
            const addEventListenerSpy = jest.spyOn(textarea, 'addEventListener');

            overlay.init();

            // Check that addEventListener was called with 'scroll'
            const scrollListenerCalls = addEventListenerSpy.mock.calls.filter(
                call => call[0] === 'scroll'
            );

            expect(scrollListenerCalls.length).toBeGreaterThan(0);

            addEventListenerSpy.mockRestore();
        });
    });

    describe('Edge cases', () => {
        test('handles empty text', () => {
            const overlay = new HighlightOverlay('essayTextarea');
            overlay.init();

            const textarea = document.getElementById('essayTextarea');
            textarea.value = '';
            overlay.applyHighlights([
                { startIndex: 0, endIndex: 5, type: 'red', category: 'test' }
            ]);

            // Should handle gracefully without errors
            expect(overlay.overlay.innerHTML).toBe('');
        });

        test('handles very long text with many highlights', () => {
            const overlay = new HighlightOverlay('essayTextarea');
            overlay.init();

            const textarea = document.getElementById('essayTextarea');

            // Create long text (1000 words)
            const longText = 'word '.repeat(1000);
            textarea.value = longText;

            // Create 50 highlights
            const highlights = [];
            for (let i = 0; i < 50; i++) {
                highlights.push({
                    startIndex: i * 10,
                    endIndex: i * 10 + 5,
                    type: ['red', 'yellow', 'green'][i % 3],
                    category: 'test'
                });
            }

            const startTime = performance.now();
            overlay.applyHighlights(highlights);
            const endTime = performance.now();

            // Should complete in reasonable time (<100ms)
            expect(endTime - startTime).toBeLessThan(100);

            const metrics = overlay.getPerformanceMetrics();
            expect(metrics.highlightCount).toBe(50);
        });

        test('handles highlights at text boundaries', () => {
            const text = 'Hello World';
            const overlay = new HighlightOverlay('essayTextarea');
            overlay.init();

            const highlights = [
                { startIndex: 0, endIndex: 5, type: 'red', category: 'test' },  // Start
                { startIndex: 6, endIndex: 11, type: 'green', category: 'test' } // End
            ];

            const result = overlay.renderHighlightsSinglePass(text, highlights);

            expect(result).toContain('Hello');
            expect(result).toContain('World');
            expect(result).toContain('highlight-red');
            expect(result).toContain('highlight-green');
        });
    });

    describe('Accessibility', () => {
        test('adds aria attributes to highlights', () => {
            const overlay = new HighlightOverlay('essayTextarea');
            overlay.init();

            const text = 'This is a test.';
            const highlights = [
                { startIndex: 5, endIndex: 7, type: 'red', category: 'weak_verb' }
            ];

            const result = overlay.renderHighlightsSinglePass(text, highlights);

            expect(result).toContain('role="mark"');
            expect(result).toContain('aria-label=');
            expect(result).toContain('tabindex="0"');
        });
    });
});
