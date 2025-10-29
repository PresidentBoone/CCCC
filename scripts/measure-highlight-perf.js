/**
 * Performance measurement for highlight rendering
 * Run with: node scripts/measure-highlight-perf.js
 */

// Simple performance test for the rendering algorithm
function escapeHTML(str) {
    if (!str) return '';
    // Simulate DOM escaping
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}

function renderHighlightsSinglePass(text, highlights) {
    const validHighlights = highlights.filter(h => {
        return h.startIndex >= 0 &&
               h.endIndex <= text.length &&
               h.startIndex < h.endIndex &&
               ['red', 'yellow', 'green'].includes(h.type);
    });

    if (validHighlights.length === 0) {
        return escapeHTML(text);
    }

    const sorted = [...validHighlights].sort((a, b) => a.startIndex - b.startIndex);
    const result = [];
    let lastIndex = 0;

    sorted.forEach((highlight, idx) => {
        const { startIndex, endIndex, type } = highlight;

        if (startIndex > lastIndex) {
            result.push(escapeHTML(text.substring(lastIndex, startIndex)));
        }

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

    if (lastIndex < text.length) {
        result.push(escapeHTML(text.substring(lastIndex)));
    }

    return result.join('');
}

// Generate test essay (600 words, ~4000 characters)
function generateTestEssay(wordCount) {
    const words = [];
    for (let i = 0; i < wordCount; i++) {
        words.push(`word${i}`);
    }
    return words.join(' ');
}

// Generate highlights
function generateHighlights(text, count) {
    const highlights = [];
    const step = Math.floor(text.length / count);

    for (let i = 0; i < count; i++) {
        const start = i * step;
        const end = Math.min(start + 15, text.length);

        if (start < end) {
            highlights.push({
                startIndex: start,
                endIndex: end,
                type: ['red', 'yellow', 'green'][i % 3],
                category: 'test'
            });
        }
    }

    return highlights;
}

// Run performance tests
console.log('📊 Highlight Rendering Performance Test\n');
console.log('========================================\n');

// Test 1: 600-word essay with 30 highlights (typical use case)
const essay600 = generateTestEssay(600);
const highlights30 = generateHighlights(essay600, 30);

console.log('Test 1: 600-word essay, 30 highlights');
console.log(`  Essay length: ${essay600.length} characters`);
console.log(`  Highlight count: ${highlights30.length}`);

const iterations = 100;
const times = [];

for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    renderHighlightsSinglePass(essay600, highlights30);
    const end = performance.now();
    times.push(end - start);
}

const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
const minTime = Math.min(...times);
const maxTime = Math.max(...times);

console.log(`  Average time: ${avgTime.toFixed(2)}ms`);
console.log(`  Min time: ${minTime.toFixed(2)}ms`);
console.log(`  Max time: ${maxTime.toFixed(2)}ms`);
console.log(`  ✅ Target: <10ms (${avgTime < 10 ? 'PASS' : 'FAIL'})\n`);

// Test 2: Large essay with many highlights (stress test)
const essay1000 = generateTestEssay(1000);
const highlights50 = generateHighlights(essay1000, 50);

console.log('Test 2: 1000-word essay, 50 highlights');
console.log(`  Essay length: ${essay1000.length} characters`);
console.log(`  Highlight count: ${highlights50.length}`);

const times2 = [];
for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    renderHighlightsSinglePass(essay1000, highlights50);
    const end = performance.now();
    times2.push(end - start);
}

const avgTime2 = times2.reduce((a, b) => a + b, 0) / times2.length;
console.log(`  Average time: ${avgTime2.toFixed(2)}ms`);
console.log(`  ✅ Target: <50ms (${avgTime2 < 50 ? 'PASS' : 'FAIL'})\n`);

// Test 3: Tooltip positioning performance
console.log('Test 3: Tooltip positioning overhead');
console.log('  Testing smart positioning with edge detection');

const tooltipPositioningTimes = [];
for (let i = 0; i < iterations; i++) {
    const start = performance.now();

    // Simulate tooltip positioning calculations
    const targetRect = { top: 100 + (i % 500), left: 100 + (i % 800), width: 100, height: 20 };
    const tooltipRect = { width: 280, height: 80 };
    const viewport = { width: 1024, height: 768 };
    const viewportPadding = { top: 80, right: 20, bottom: 20, left: 20 };
    const offset = 10;

    let top = targetRect.top - tooltipRect.height - offset;
    let left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
    let position = 'top';

    // Edge detection
    if (top < viewportPadding.top) {
        top = targetRect.top + targetRect.height + offset;
        position = 'bottom';
    }
    if (top + tooltipRect.height > viewport.height - viewportPadding.bottom) {
        top = targetRect.top - tooltipRect.height - offset;
        position = 'top';
    }
    if (left < viewportPadding.left) {
        left = viewportPadding.left;
    }
    if (left + tooltipRect.width > viewport.width - viewportPadding.right) {
        left = viewport.width - tooltipRect.width - viewportPadding.right;
    }

    const end = performance.now();
    tooltipPositioningTimes.push(end - start);
}

const avgTooltipTime = tooltipPositioningTimes.reduce((a, b) => a + b, 0) / tooltipPositioningTimes.length;
console.log(`  Average time: ${avgTooltipTime.toFixed(3)}ms`);
console.log(`  ✅ Target: <3ms (${avgTooltipTime < 3 ? 'PASS' : 'FAIL'})\n`);

// Summary
console.log('========================================');
console.log('📈 Performance Summary:');
console.log(`  Typical use case (highlight render): ${avgTime.toFixed(2)}ms`);
console.log(`  Stress test (highlight render): ${avgTime2.toFixed(2)}ms`);
console.log(`  Tooltip positioning: ${avgTooltipTime.toFixed(3)}ms`);
console.log(`  Total overhead with tooltips: ${(avgTime + avgTooltipTime).toFixed(2)}ms`);
console.log(`  \n  ${avgTime < 10 && avgTime2 < 50 && avgTooltipTime < 3 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
