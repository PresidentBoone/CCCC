/**
 * Performance Monitoring Utility
 * Tracks and reports performance metrics for CollegeClimb
 *
 * Features:
 * - Page load time tracking
 * - Resource loading metrics
 * - User interaction performance
 * - Console reporting
 *
 * @version 3.0.0
 * Part of CollegeClimb Engineering Overhaul - Phase 3
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoad: {},
            resources: [],
            interactions: [],
            customMarks: {}
        };

        this.init();
    }

    /**
     * Initialize performance monitoring
     */
    init() {
        if (typeof window === 'undefined' || !window.performance) {
            console.warn('[PerformanceMonitor] Performance API not available');
            return;
        }

        // Wait for page load to collect metrics
        if (document.readyState === 'complete') {
            this.collectPageLoadMetrics();
        } else {
            window.addEventListener('load', () => {
                this.collectPageLoadMetrics();
            });
        }

        console.log('[PerformanceMonitor] 📊 Performance monitoring initialized');
    }

    /**
     * Collect page load performance metrics
     */
    collectPageLoadMetrics() {
        if (!window.performance || !window.performance.timing) {
            return;
        }

        const timing = window.performance.timing;
        const navigation = window.performance.navigation;

        // Calculate key metrics
        this.metrics.pageLoad = {
            // DNS lookup time
            dnsTime: timing.domainLookupEnd - timing.domainLookupStart,

            // TCP connection time
            tcpTime: timing.connectEnd - timing.connectStart,

            // Time to first byte (server response time)
            ttfb: timing.responseStart - timing.navigationStart,

            // DOM content loaded
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,

            // Full page load
            loadComplete: timing.loadEventEnd - timing.navigationStart,

            // DOM processing
            domProcessing: timing.domComplete - timing.domLoading,

            // Resource loading
            resourcesLoaded: timing.loadEventEnd - timing.domContentLoadedEventEnd,

            // Navigation type
            navigationType: this.getNavigationType(navigation.type),

            // Redirect count
            redirectCount: navigation.redirectCount
        };

        // Collect resource performance
        this.collectResourceMetrics();

        // Log summary
        this.logPerformanceSummary();
    }

    /**
     * Collect resource loading metrics
     */
    collectResourceMetrics() {
        if (!window.performance || !window.performance.getEntriesByType) {
            return;
        }

        const resources = window.performance.getEntriesByType('resource');

        resources.forEach(resource => {
            this.metrics.resources.push({
                name: resource.name.split('/').pop() || resource.name,
                type: resource.initiatorType,
                duration: Math.round(resource.duration),
                size: resource.transferSize || 0,
                cached: resource.transferSize === 0
            });
        });
    }

    /**
     * Get navigation type name
     */
    getNavigationType(type) {
        const types = {
            0: 'navigate',
            1: 'reload',
            2: 'back_forward',
            255: 'reserved'
        };
        return types[type] || 'unknown';
    }

    /**
     * Mark custom performance point
     */
    mark(name) {
        if (!window.performance || !window.performance.mark) {
            return;
        }

        window.performance.mark(name);
        this.metrics.customMarks[name] = Date.now();
        console.log(`[PerformanceMonitor] ⏱️  Mark: ${name}`);
    }

    /**
     * Measure time between two marks
     */
    measure(name, startMark, endMark) {
        if (!window.performance || !window.performance.measure) {
            return null;
        }

        try {
            window.performance.measure(name, startMark, endMark);
            const measure = window.performance.getEntriesByName(name, 'measure')[0];
            console.log(`[PerformanceMonitor] 📏 Measure "${name}": ${Math.round(measure.duration)}ms`);
            return Math.round(measure.duration);
        } catch (error) {
            console.warn(`[PerformanceMonitor] Failed to measure: ${error.message}`);
            return null;
        }
    }

    /**
     * Track user interaction performance
     */
    trackInteraction(name, callback) {
        const startTime = Date.now();
        const startMark = `${name}-start`;

        this.mark(startMark);

        const result = callback();

        if (result instanceof Promise) {
            return result.then(data => {
                const duration = Date.now() - startTime;
                this.metrics.interactions.push({ name, duration });
                console.log(`[PerformanceMonitor] ⚡ "${name}": ${duration}ms`);
                return data;
            });
        } else {
            const duration = Date.now() - startTime;
            this.metrics.interactions.push({ name, duration });
            console.log(`[PerformanceMonitor] ⚡ "${name}": ${duration}ms`);
            return result;
        }
    }

    /**
     * Log performance summary to console
     */
    logPerformanceSummary() {
        const metrics = this.metrics.pageLoad;

        console.log(`
╔════════════════════════════════════════════════════════╗
║         📊 Performance Metrics                         ║
╠════════════════════════════════════════════════════════╣
║  DNS Lookup:          ${metrics.dnsTime}ms${' '.repeat(28 - String(metrics.dnsTime).length)} ║
║  TCP Connection:      ${metrics.tcpTime}ms${' '.repeat(28 - String(metrics.tcpTime).length)} ║
║  Time to First Byte:  ${metrics.ttfb}ms${' '.repeat(28 - String(metrics.ttfb).length)} ║
║  DOM Content Loaded:  ${metrics.domContentLoaded}ms${' '.repeat(28 - String(metrics.domContentLoaded).length)} ║
║  Page Load Complete:  ${metrics.loadComplete}ms${' '.repeat(28 - String(metrics.loadComplete).length)} ║
║  DOM Processing:      ${metrics.domProcessing}ms${' '.repeat(28 - String(metrics.domProcessing).length)} ║
║  Resources Loaded:    ${metrics.resourcesLoaded}ms${' '.repeat(28 - String(metrics.resourcesLoaded).length)} ║
║                                                         ║
║  Navigation Type:     ${metrics.navigationType}${' '.repeat(28 - metrics.navigationType.length)} ║
║  Redirects:           ${metrics.redirectCount}${' '.repeat(28 - String(metrics.redirectCount).length)} ║
║  Total Resources:     ${this.metrics.resources.length}${' '.repeat(28 - String(this.metrics.resources.length).length)} ║
╚════════════════════════════════════════════════════════╝
        `);

        // Check for performance issues
        this.checkPerformanceIssues();
    }

    /**
     * Check for common performance issues
     */
    checkPerformanceIssues() {
        const issues = [];
        const metrics = this.metrics.pageLoad;

        if (metrics.ttfb > 1000) {
            issues.push('⚠️  Slow server response time (TTFB > 1s)');
        }

        if (metrics.domContentLoaded > 3000) {
            issues.push('⚠️  Slow DOM processing (> 3s)');
        }

        if (metrics.loadComplete > 5000) {
            issues.push('⚠️  Slow page load (> 5s)');
        }

        const largeResources = this.metrics.resources.filter(r => r.duration > 1000);
        if (largeResources.length > 0) {
            issues.push(`⚠️  ${largeResources.length} slow-loading resources (> 1s)`);
        }

        if (issues.length > 0) {
            console.log('\n🚨 Performance Issues Detected:');
            issues.forEach(issue => console.log(`   ${issue}`));
        } else {
            console.log('\n✅ No performance issues detected');
        }
    }

    /**
     * Get performance report
     */
    getReport() {
        return {
            pageLoad: this.metrics.pageLoad,
            resources: this.metrics.resources,
            interactions: this.metrics.interactions,
            customMarks: this.metrics.customMarks
        };
    }

    /**
     * Export metrics as JSON
     */
    exportMetrics() {
        return JSON.stringify(this.getReport(), null, 2);
    }
}

// Initialize globally
if (typeof window !== 'undefined') {
    window.PerformanceMonitor = PerformanceMonitor;
    window.perfMonitor = new PerformanceMonitor();
    console.log('[PerformanceMonitor] 🚀 Performance monitoring loaded');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}
