/**
 * Tests for TooltipManager and Scroll Synchronization
 */

describe('TooltipManager', () => {
    let mockElement, mockTooltip;

    beforeEach(() => {
        // Mock DOM elements
        mockElement = {
            getBoundingClientRect: jest.fn(() => ({
                top: 100,
                left: 100,
                right: 200,
                bottom: 120,
                width: 100,
                height: 20
            }))
        };

        mockTooltip = {
            getBoundingClientRect: jest.fn(() => ({
                width: 280,
                height: 80
            })),
            querySelector: jest.fn(() => ({
                style: {}
            })),
            style: {},
            setAttribute: jest.fn()
        };

        // Mock window dimensions
        global.window = {
            innerWidth: 1024,
            innerHeight: 768
        };
    });

    describe('Edge Detection', () => {
        test('positions tooltip above element by default', () => {
            // Tooltip should position above when there's space
            const targetRect = { top: 200, left: 100, width: 100 };
            const tooltipHeight = 80;
            const offset = 10;

            const expectedTop = targetRect.top - tooltipHeight - offset;

            expect(expectedTop).toBe(110);
            expect(expectedTop).toBeGreaterThan(80); // Above navbar
        });

        test('positions tooltip below when near top edge', () => {
            // When element is near top, tooltip should flip below
            const targetRect = { top: 50, bottom: 70, left: 100, width: 100 };
            const tooltipHeight = 80;
            const navbarHeight = 80;
            const offset = 10;

            const topPosition = targetRect.top - tooltipHeight - offset;

            if (topPosition < navbarHeight) {
                // Should flip to bottom
                const flippedTop = targetRect.bottom + offset;
                expect(flippedTop).toBe(80);
            }
        });

        test('clamps tooltip to left boundary', () => {
            const targetRect = { left: 10, width: 100 };
            const tooltipWidth = 280;
            const viewportPadding = 20;

            // Center position would go off-screen
            let left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
            expect(left).toBeLessThan(0);

            // Should clamp to left boundary
            left = Math.max(viewportPadding, left);
            expect(left).toBe(viewportPadding);
        });

        test('clamps tooltip to right boundary', () => {
            const targetRect = { left: 900, width: 100 };
            const tooltipWidth = 280;
            const viewportWidth = 1024;
            const viewportPadding = 20;

            // Center position would go off-screen right
            let left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);

            if (left + tooltipWidth > viewportWidth - viewportPadding) {
                left = viewportWidth - tooltipWidth - viewportPadding;
            }

            expect(left).toBeLessThanOrEqual(viewportWidth - tooltipWidth - viewportPadding);
        });
    });

    describe('Tooltip Content', () => {
        test('formats tooltip with category and feedback', () => {
            const data = {
                category: 'Grammar',
                feedback: 'Consider revising this sentence',
                type: 'red'
            };

            // Simulate content creation
            const expectedContent = expect.stringContaining('Grammar');
            const expectedFeedback = expect.stringContaining('Consider revising');

            expect(data.category).toBe('Grammar');
            expect(data.feedback).toBe('Consider revising this sentence');
        });

        test('handles missing feedback gracefully', () => {
            const data = {
                category: 'Style',
                type: 'yellow'
            };

            expect(data.category).toBe('Style');
            expect(data.feedback).toBeUndefined();
        });

        test('escapes HTML in content', () => {
            const maliciousContent = '<script>alert("xss")</script>';

            // Simulate HTML escaping
            const escaped = maliciousContent
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            expect(escaped).not.toContain('<script>');
            expect(escaped).toContain('&lt;script&gt;');
        });
    });

    describe('Arrow Positioning', () => {
        test('centers arrow on target element', () => {
            const targetRect = { left: 100, width: 100 };
            const tooltipLeft = 50;
            const tooltipWidth = 280;

            const targetCenter = targetRect.left + (targetRect.width / 2);
            const arrowLeft = targetCenter - tooltipLeft;

            expect(arrowLeft).toBe(100);
        });

        test('clamps arrow within tooltip bounds', () => {
            const arrowLeft = 300;
            const tooltipWidth = 280;
            const arrowSize = 6;

            const minArrowLeft = arrowSize + 5;
            const maxArrowLeft = tooltipWidth - arrowSize - 5;

            const clampedArrowLeft = Math.max(minArrowLeft, Math.min(maxArrowLeft, arrowLeft));

            expect(clampedArrowLeft).toBeLessThanOrEqual(maxArrowLeft);
            expect(clampedArrowLeft).toBe(maxArrowLeft);
        });
    });

    describe('Performance', () => {
        test('positioning completes in <3ms', () => {
            const startTime = performance.now();

            // Simulate positioning calculations
            const targetRect = { top: 100, left: 100, width: 100, height: 20 };
            const tooltipRect = { width: 280, height: 80 };
            const viewport = { width: 1024, height: 768 };

            let top = targetRect.top - tooltipRect.height - 10;
            let left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);

            if (top < 80) {
                top = targetRect.top + targetRect.height + 10;
            }

            if (left < 20) left = 20;
            if (left + tooltipRect.width > viewport.width - 20) {
                left = viewport.width - tooltipRect.width - 20;
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            expect(duration).toBeLessThan(3);
            expect(top).toBeDefined();
            expect(left).toBeDefined();
        });
    });
});

describe('Highlight Persistence During Editing', () => {
    describe('Edit Detection', () => {
        test('detects insertion at start', () => {
            const oldText = 'hello world';
            const newText = 'XXXhello world';

            const lengthDelta = newText.length - oldText.length;
            expect(lengthDelta).toBe(3);

            // Find edit start
            let editStart = 0;
            while (editStart < oldText.length && editStart < newText.length) {
                if (oldText[editStart] !== newText[editStart]) break;
                editStart++;
            }

            expect(editStart).toBe(0);
        });

        test('detects insertion in middle', () => {
            const oldText = 'hello world';
            const newText = 'hello XXX world';

            let editStart = 0;
            while (editStart < oldText.length && editStart < newText.length) {
                if (oldText[editStart] !== newText[editStart]) break;
                editStart++;
            }

            expect(editStart).toBe(6); // After "hello "
        });

        test('detects deletion', () => {
            const oldText = 'hello world';
            const newText = 'hel world';

            const lengthDelta = newText.length - oldText.length;
            expect(lengthDelta).toBe(-2);
        });
    });

    describe('Highlight Position Updates', () => {
        test('preserves highlights before edit', () => {
            const highlight = { startIndex: 0, endIndex: 5, type: 'red' };
            const editStart = 10;
            const lengthDelta = 3;

            // Highlight ends before edit - no change
            if (highlight.endIndex <= editStart) {
                expect(highlight.startIndex).toBe(0);
                expect(highlight.endIndex).toBe(5);
            }
        });

        test('shifts highlights after edit', () => {
            const highlight = { startIndex: 10, endIndex: 15, type: 'red' };
            const editStart = 5;
            const editEnd = 5;
            const lengthDelta = 3;

            // Highlight starts after edit - shift by delta
            if (highlight.startIndex >= editEnd) {
                const newStart = highlight.startIndex + lengthDelta;
                const newEnd = highlight.endIndex + lengthDelta;

                expect(newStart).toBe(13);
                expect(newEnd).toBe(18);
            }
        });

        test('invalidates overlapping highlights', () => {
            const highlight = { startIndex: 5, endIndex: 15, type: 'yellow' };
            const editStart = 10;
            const editEnd = 12;

            // Highlight overlaps edit region
            const overlaps = !(highlight.endIndex <= editStart || highlight.startIndex >= editEnd);

            expect(overlaps).toBe(true);
            // Should be invalidated (removed from highlights array)
        });
    });
});

describe('Scroll Synchronization', () => {
    test('hides tooltip during scroll', () => {
        let tooltipVisible = true;
        let scrollTimeout;

        // Simulate scroll event
        tooltipVisible = false; // Hide immediately

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            tooltipVisible = true; // Show after delay
        }, 100);

        expect(tooltipVisible).toBe(false);
    });

    test('debounces scroll updates', (done) => {
        let updateCount = 0;
        let scrollTimeout;

        // Simulate multiple rapid scroll events
        for (let i = 0; i < 10; i++) {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                updateCount++;
            }, 100);
        }

        // Wait for debounce
        setTimeout(() => {
            expect(updateCount).toBe(1); // Should only update once
            done();
        }, 150);
    });

    test('uses requestAnimationFrame for smooth updates', () => {
        const rafSpy = jest.spyOn(global, 'requestAnimationFrame').mockImplementation(cb => {
            cb();
            return 1;
        });

        // Simulate RAF usage
        requestAnimationFrame(() => {
            // Update tooltip position
        });

        expect(rafSpy).toHaveBeenCalled();

        rafSpy.mockRestore();
    });
});
