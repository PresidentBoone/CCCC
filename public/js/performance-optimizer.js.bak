/**
 * Performance Optimizer - Week 4 Quality Enhancement
 * Implements image optimization, lazy loading, and caching strategies
 * 
 * Usage:
 * PerformanceOptimizer.lazyLoadImages();
 * PerformanceOptimizer.optimizeImages();
 * PerformanceOptimizer.enableCaching('/api/data', data);
 */

class PerformanceOptimizer {
    constructor() {
        this.cache = new Map();
        this.observers = new Map();
        this.init();
    }

    /**
     * Initialize performance optimizations
     */
    init() {
        // Enable lazy loading
        this.setupLazyLoading();
        
        // Setup intersection observer for animations
        this.setupAnimationObserver();
        
        // Optimize images
        this.optimizeImages();
        
        // Setup resource hints
        this.setupResourceHints();
        
        // Monitor performance
        this.monitorPerformance();
    }

    /**
     * Setup lazy loading for images
     */
    setupLazyLoading() {
        if ('loading' in HTMLImageElement.prototype) {
            // Native lazy loading support
            const images = document.querySelectorAll('img[data-src]');
            images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.loading = 'lazy';
            });
        } else {
            // Fallback to Intersection Observer
            this.lazyLoadWithObserver();
        }
    }

    /**
     * Lazy load images using Intersection Observer
     */
    lazyLoadWithObserver() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                        img.removeAttribute('data-srcset');
                    }
                    
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        const lazyImages = document.querySelectorAll('img.lazy, img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
        
        this.observers.set('images', imageObserver);
    }

    /**
     * Setup animation observer for performance
     */
    setupAnimationObserver() {
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1
        });

        const animatedElements = document.querySelectorAll('[data-animate]');
        animatedElements.forEach(el => animationObserver.observe(el));
        
        this.observers.set('animations', animationObserver);
    }

    /**
     * Optimize images
     */
    optimizeImages() {
        const images = document.querySelectorAll('img:not([width]):not([height])');
        
        images.forEach(img => {
            // Add width and height to prevent layout shift
            if (img.naturalWidth && img.naturalHeight) {
                const aspectRatio = img.naturalHeight / img.naturalWidth;
                img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
            }
            
            // Add decoding attribute for better performance
            img.decoding = 'async';
        });
    }

    /**
     * Setup resource hints (preconnect, prefetch)
     */
    setupResourceHints() {
        const criticalDomains = [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
            'https://cdnjs.cloudflare.com'
        ];
        
        criticalDomains.forEach(domain => {
            // Check if hint already exists
            if (!document.querySelector(`link[href="${domain}"]`)) {
                const link = document.createElement('link');
                link.rel = 'preconnect';
                link.href = domain;
                link.crossOrigin = 'anonymous';
                document.head.appendChild(link);
            }
        });
    }

    /**
     * Cache API response
     */
    enableCaching(key, data, ttl = 300000) { // 5 minutes default
        const cacheEntry = {
            data,
            timestamp: Date.now(),
            ttl
        };
        
        this.cache.set(key, cacheEntry);
        
        // Also store in localStorage for persistence
        try {
            localStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry));
        } catch (error) {
            console.warn('Failed to cache in localStorage:', error);
        }
    }

    /**
     * Get cached data
     */
    getCached(key) {
        // Check in-memory cache first
        let cacheEntry = this.cache.get(key);
        
        // Fallback to localStorage
        if (!cacheEntry) {
            try {
                const stored = localStorage.getItem(`cache_${key}`);
                if (stored) {
                    cacheEntry = JSON.parse(stored);
                    this.cache.set(key, cacheEntry);
                }
            } catch (error) {
                return null;
            }
        }
        
        if (!cacheEntry) return null;
        
        // Check if expired
        if (Date.now() - cacheEntry.timestamp > cacheEntry.ttl) {
            this.cache.delete(key);
            localStorage.removeItem(`cache_${key}`);
            return null;
        }
        
        return cacheEntry.data;
    }

    /**
     * Clear cache
     */
    clearCache(key = null) {
        if (key) {
            this.cache.delete(key);
            localStorage.removeItem(`cache_${key}`);
        } else {
            this.cache.clear();
            Object.keys(localStorage).forEach(k => {
                if (k.startsWith('cache_')) {
                    localStorage.removeItem(k);
                }
            });
        }
    }

    /**
     * Debounce function for performance
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function for performance
     */
    throttle(func, limit = 300) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Request idle callback wrapper
     */
    requestIdleCallback(callback, options = {}) {
        if ('requestIdleCallback' in window) {
            return window.requestIdleCallback(callback, options);
        } else {
            // Fallback for Safari
            return setTimeout(() => {
                callback({
                    didTimeout: false,
                    timeRemaining: () => 50
                });
            }, 1);
        }
    }

    /**
     * Defer non-critical scripts
     */
    deferScript(src, callback) {
        const script = document.createElement('script');
        script.src = src;
        script.defer = true;
        
        if (callback) {
            script.onload = callback;
        }
        
        document.body.appendChild(script);
    }

    /**
     * Preload critical resources
     */
    preloadResource(href, as, type = null) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as;
        
        if (type) {
            link.type = type;
        }
        
        document.head.appendChild(link);
    }

    /**
     * Monitor performance metrics
     */
    monitorPerformance() {
        // Monitor Core Web Vitals
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint (LCP)
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    
                    if (window.Analytics) {
                        window.Analytics.trackEvent('lcp_measured', {
                            value: lastEntry.renderTime || lastEntry.loadTime,
                            element: lastEntry.element?.tagName
                        });
                    }
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                // LCP not supported
            }

            // First Input Delay (FID)
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (window.Analytics) {
                            window.Analytics.trackEvent('fid_measured', {
                                value: entry.processingStart - entry.startTime,
                                name: entry.name
                            });
                        }
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                // FID not supported
            }

            // Cumulative Layout Shift (CLS)
            try {
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });

                // Report CLS on page unload
                window.addEventListener('beforeunload', () => {
                    if (window.Analytics) {
                        window.Analytics.trackEvent('cls_measured', {
                            value: clsValue
                        });
                    }
                });
            } catch (e) {
                // CLS not supported
            }
        }

        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            try {
                const longTaskObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (window.Analytics) {
                            window.Analytics.trackEvent('long_task', {
                                duration: entry.duration,
                                name: entry.name
                            });
                        }
                    });
                });
                longTaskObserver.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // Long tasks not supported
            }
        }
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        const metrics = {};
        
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            
            metrics.dns = timing.domainLookupEnd - timing.domainLookupStart;
            metrics.tcp = timing.connectEnd - timing.connectStart;
            metrics.ttfb = timing.responseStart - timing.requestStart;
            metrics.download = timing.responseEnd - timing.responseStart;
            metrics.domProcessing = timing.domComplete - timing.domLoading;
            metrics.totalLoad = timing.loadEventEnd - timing.navigationStart;
        }
        
        if (window.performance && window.performance.memory) {
            metrics.memory = {
                used: window.performance.memory.usedJSHeapSize,
                total: window.performance.memory.totalJSHeapSize,
                limit: window.performance.memory.jsHeapSizeLimit
            };
        }
        
        return metrics;
    }

    /**
     * Optimize DOM manipulation
     */
    batchDOMUpdates(updates) {
        requestAnimationFrame(() => {
            updates.forEach(update => update());
        });
    }

    /**
     * Virtual scrolling helper
     */
    createVirtualScroller(container, items, renderItem, itemHeight = 50) {
        const containerHeight = container.clientHeight;
        const visibleItems = Math.ceil(containerHeight / itemHeight) + 2;
        let scrollTop = 0;
        
        const render = () => {
            const startIndex = Math.floor(scrollTop / itemHeight);
            const endIndex = Math.min(startIndex + visibleItems, items.length);
            
            container.innerHTML = '';
            
            for (let i = startIndex; i < endIndex; i++) {
                const item = renderItem(items[i], i);
                item.style.position = 'absolute';
                item.style.top = `${i * itemHeight}px`;
                item.style.height = `${itemHeight}px`;
                container.appendChild(item);
            }
        };
        
        container.addEventListener('scroll', this.throttle(() => {
            scrollTop = container.scrollTop;
            render();
        }, 16));
        
        // Set container height
        container.style.position = 'relative';
        container.style.height = `${items.length * itemHeight}px`;
        
        render();
    }

    /**
     * Cleanup observers
     */
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        this.cache.clear();
    }
}

// Create global instance
window.PerformanceOptimizer = new PerformanceOptimizer();

// Export
export default window.PerformanceOptimizer;
