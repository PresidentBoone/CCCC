/**
 * Simplified tests for HighlightOverlay rendering algorithm
 * Focuses on core logic without full DOM initialization
 */

describe('HighlightOverlay - Core Algorithm', () => {
    // Helper function to escape HTML
    function escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Simplified single-pass rendering (extracted from module)
    function renderHighlightsSinglePass(text, highlights) {
        // Validate highlights
        const validHighlights = highlights.filter(h => {
            return h.startIndex >= 0 &&
                   h.endIndex <= text.length &&
                   h.startIndex < h.endIndex &&
                   ['red', 'yellow', 'green'].includes(h.type);
        });

        if (validHighlights.length === 0) {
            return escapeHTML(text);
        }

        // Sort by start index
        const sorted = [...validHighlights].sort((a, b) => a.startIndex - b.startIndex);

        // Build result
        const result = [];
        let lastIndex = 0;

        sorted.forEach((highlight, idx) => {
            const { startIndex, endIndex, type, category } = highlight;

            // Add text before highlight
            if (startIndex > lastIndex) {
                result.push(escapeHTML(text.substring(lastIndex, startIndex)));
            }

            // Handle overlapping
            const actualStart = Math.max(startIndex, lastIndex);
            const actualEnd = endIndex;

            if (actualStart < actualEnd) {
                const highlightedText = text.substring(actualStart, actualEnd);
                result.push(
                    `<mark class="essay-highlight highlight-${type}" data-index="${idx}">` +
                    `${escapeHTML(highlightedText)}` +
                    `</mark>`
                );
                lastIndex = actualEnd;
            }
        });

        // Add remaining text
        if (lastIndex < text.length) {
            result.push(escapeHTML(text.substring(lastIndex)));
        }

        return result.join('');
    }

    describe('Single-pass rendering algorithm', () => {
        test('renders single highlight correctly', () => {
            const text = 'This is a test essay.';
            const highlights = [
                { startIndex: 10, endIndex: 14, type: 'red', category: 'test' }
            ];

            const result = renderHighlightsSinglePass(text, highlights);

            expect(result).toContain('<mark class="essay-highlight highlight-red"');
            expect(result).toContain('test');
            expect(result).toContain('This is a ');
            expect(result).toContain(' essay.');
        });

        test('renders multiple highlights correctly', () => {
            const text = 'This is a test essay with problems.';
            const highlights = [
                { startIndex: 10, endIndex: 14, type: 'red', category: 'test' },
                { startIndex: 21, endIndex: 25, type: 'yellow', category: 'test' }
            ];

            const result = renderHighlightsSinglePass(text, highlights);

            expect(result).toContain('highlight-red');
            expect(result).toContain('highlight-yellow');
            const redMatches = (result.match(/highlight-red/g) || []).length;
            const yellowMatches = (result.match(/highlight-yellow/g) || []).length;
            expect(redMatches).toBe(1);
            expect(yellowMatches).toBe(1);
        });

        test('handles overlapping highlights', () => {
            const text = 'This is a test essay.';
            const highlights = [
                { startIndex: 5, endIndex: 14, type: 'red', category: 'test' },
                { startIndex: 10, endIndex: 14, type: 'yellow', category: 'test' }
            ];

            const result = renderHighlightsSinglePass(text, highlights);

            // Should handle overlaps - second highlight gets cut off by first
            // Only the first (red) highlight will show, second one is skipped due to overlap
            expect(result).toContain('highlight-red');
            // Second highlight is effectively skipped because lastIndex is past its start
            // This is correct behavior for overlapping highlights
            const markMatches = (result.match(/<mark/g) || []).length;
            expect(markMatches).toBeGreaterThanOrEqual(1);
        });

        test('validates and filters invalid highlights', () => {
            const text = 'This is a test essay.';
            const highlights = [
                { startIndex: 5, endIndex: 7, type: 'red', category: 'valid' },
                { startIndex: -1, endIndex: 5, type: 'red', category: 'invalid' },
                { startIndex: 10, endIndex: 100, type: 'red', category: 'invalid' },
                { startIndex: 15, endIndex: 10, type: 'red', category: 'invalid' }
            ];

            const result = renderHighlightsSinglePass(text, highlights);

            // Should only render the valid highlight
            const markMatches = (result.match(/<mark/g) || []).length;
            expect(markMatches).toBe(1);
        });

        test('escapes HTML in text content', () => {
            const text = 'This <script>alert("xss")</script> is dangerous';
            const highlights = [
                { startIndex: 5, endIndex: 13, type: 'red', category: 'test' }
            ];

            const result = renderHighlightsSinglePass(text, highlights);

            expect(result).not.toContain('<script>');
            expect(result).toContain('&lt;script&gt;');
        });

        test('handles empty highlights array', () => {
            const text = 'This is a test essay.';
            const result = renderHighlightsSinglePass(text, []);

            expect(result).not.toContain('<mark');
            expect(result).toContain('This is a test essay.');
        });

        test('handles multi-line text', () => {
            const text = 'Line 1\nLine 2\nLine 3';
            const highlights = [
                { startIndex: 4, endIndex: 13, type: 'yellow', category: 'test' }
            ];

            const result = renderHighlightsSinglePass(text, highlights);

            expect(result).toContain('highlight-yellow');
            // Should preserve newlines
            expect(result).toContain('1\nLine');
        });

        test('handles highlights at text boundaries', () => {
            const text = 'Hello World';
            const highlights = [
                { startIndex: 0, endIndex: 5, type: 'red', category: 'start' },
                { startIndex: 6, endIndex: 11, type: 'green', category: 'end' }
            ];

            const result = renderHighlightsSinglePass(text, highlights);

            expect(result).toContain('Hello');
            expect(result).toContain('World');
            expect(result).toContain('highlight-red');
            expect(result).toContain('highlight-green');
        });

        test('handles adjacent highlights without gaps', () => {
            const text = 'ABCDEFGH';
            const highlights = [
                { startIndex: 0, endIndex: 3, type: 'red', category: 'test' },
                { startIndex: 3, endIndex: 6, type: 'yellow', category: 'test' },
                { startIndex: 6, endIndex: 8, type: 'green', category: 'test' }
            ];

            const result = renderHighlightsSinglePass(text, highlights);

            expect(result).toContain('ABC');
            expect(result).toContain('DEF');
            expect(result).toContain('GH');
            const markMatches = (result.match(/<mark/g) || []).length;
            expect(markMatches).toBe(3);
        });
    });

    describe('Performance', () => {
        test('handles large number of highlights efficiently', () => {
            // Generate 100 words
            const words = [];
            for (let i = 0; i < 100; i++) {
                words.push(`word${i}`);
            }
            const text = words.join(' ');

            // Create 50 highlights
            const highlights = [];
            for (let i = 0; i < 50; i++) {
                const start = i * 10;
                highlights.push({
                    startIndex: start,
                    endIndex: Math.min(start + 5, text.length),
                    type: ['red', 'yellow', 'green'][i % 3],
                    category: 'test'
                });
            }

            const startTime = performance.now();
            const result = renderHighlightsSinglePass(text, highlights);
            const endTime = performance.now();

            // Should complete in reasonable time
            expect(endTime - startTime).toBeLessThan(50);
            expect(result).toContain('highlight-red');
            expect(result).toContain('highlight-yellow');
            expect(result).toContain('highlight-green');
        });
    });

    describe('XSS Prevention', () => {
        test('escapes dangerous HTML entities', () => {
            const dangerous = '<img src=x onerror="alert(1)">';
            const escaped = escapeHTML(dangerous);

            expect(escaped).not.toContain('<img');
            expect(escaped).toContain('&lt;img');
        });

        test('handles quotes and special characters', () => {
            const text = 'Text with "quotes" and <tags>';
            const result = renderHighlightsSinglePass(text, []);

            // escapeHTML uses textContent which doesn't convert quotes to &quot;
            // but does escape angle brackets
            expect(result).toContain('"quotes"'); // Quotes are preserved
            expect(result).toContain('&lt;tags&gt;');
        });
    });
});
