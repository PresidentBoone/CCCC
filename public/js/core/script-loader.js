/**
 * Centralized Script Loader
 * Manages async script loading, dependencies, and load order
 * Part of CollegeClimb Engineering Overhaul - Phase 1.2
 *
 * @version 2.0.0
 * @author CollegeClimb Engineering Team
 */

class ScriptLoader {
    constructor() {
        this.loaded = new Set();
        this.loading = new Map();
        this.failed = new Set();
        this.startTime = Date.now();

        // Performance tracking
        this.metrics = {
            totalScripts: 0,
            loadedScripts: 0,
            failedScripts: 0,
            totalLoadTime: 0
        };
    }

    /**
     * Load a single script asynchronously
     * @param {string} src - Script source URL
     * @param {Object} options - Loading options
     * @returns {Promise} Resolves when script is loaded
     */
    async load(src, options = {}) {
        // Check if already loaded
        if (this.loaded.has(src)) {
            console.log(`[ScriptLoader] ✅ Already loaded: ${src}`);
            return Promise.resolve();
        }

        // Check if currently loading
        if (this.loading.has(src)) {
            console.log(`[ScriptLoader] ⏳ Already loading: ${src}`);
            return this.loading.get(src);
        }

        // Check if previously failed
        if (this.failed.has(src) && !options.retry) {
            return Promise.reject(new Error(`Script previously failed: ${src}`));
        }

        const scriptStartTime = Date.now();

        // Create load promise
        const promise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = options.async !== false;
            script.defer = options.defer || false;

            if (options.type) {
                script.type = options.type;
            }

            if (options.crossorigin) {
                script.crossOrigin = options.crossorigin;
            }

            script.onload = () => {
                const loadTime = Date.now() - scriptStartTime;
                this.loaded.add(src);
                this.loading.delete(src);
                this.metrics.loadedScripts++;
                this.metrics.totalLoadTime += loadTime;

                console.log(`[ScriptLoader] ✅ Loaded: ${src} (${loadTime}ms)`);
                resolve();
            };

            script.onerror = (error) => {
                const loadTime = Date.now() - scriptStartTime;
                this.loading.delete(src);
                this.failed.add(src);
                this.metrics.failedScripts++;

                console.error(`[ScriptLoader] ❌ Failed: ${src} (${loadTime}ms)`, error);

                // Remove failed script element
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }

                reject(new Error(`Failed to load script: ${src}`));
            };

            // Add to document
            const target = options.target || document.head;
            target.appendChild(script);
            this.metrics.totalScripts++;
        });

        this.loading.set(src, promise);
        return promise;
    }

    /**
     * Load multiple scripts in sequence
     * @param {Array} scripts - Array of script URLs or objects with {src, options}
     * @returns {Promise} Resolves when all scripts are loaded
     */
    async loadSequence(scripts) {
        console.log(`[ScriptLoader] 📦 Loading ${scripts.length} scripts in sequence...`);

        for (const script of scripts) {
            try {
                if (typeof script === 'string') {
                    await this.load(script);
                } else {
                    await this.load(script.src, script.options || {});
                }
            } catch (error) {
                console.error(`[ScriptLoader] Sequence interrupted:`, error);
                throw error;
            }
        }

        console.log(`[ScriptLoader] ✅ Sequence complete`);
    }

    /**
     * Load multiple scripts in parallel
     * @param {Array} scripts - Array of script URLs or objects
     * @returns {Promise} Resolves when all scripts are loaded
     */
    async loadParallel(scripts) {
        console.log(`[ScriptLoader] ⚡ Loading ${scripts.length} scripts in parallel...`);

        const promises = scripts.map(script => {
            if (typeof script === 'string') {
                return this.load(script).catch(err => {
                    console.warn(`[ScriptLoader] Parallel load failed (continuing):`, err.message);
                    return null; // Don't break Promise.all
                });
            } else {
                return this.load(script.src, script.options || {}).catch(err => {
                    console.warn(`[ScriptLoader] Parallel load failed (continuing):`, err.message);
                    return null;
                });
            }
        });

        await Promise.all(promises);
        console.log(`[ScriptLoader] ✅ Parallel load complete`);
    }

    /**
     * Load a script with dependencies
     * @param {string} src - Script source
     * @param {Array} dependencies - Array of dependency script URLs
     * @param {Object} options - Loading options
     * @returns {Promise}
     */
    async loadWithDependencies(src, dependencies = [], options = {}) {
        console.log(`[ScriptLoader] 🔗 Loading ${src} with ${dependencies.length} dependencies...`);

        // Load dependencies first
        if (dependencies.length > 0) {
            await this.loadSequence(dependencies);
        }

        // Load main script
        await this.load(src, options);

        console.log(`[ScriptLoader] ✅ Loaded ${src} with dependencies`);
    }

    /**
     * Check if a script is loaded
     * @param {string} src - Script source
     * @returns {boolean}
     */
    isLoaded(src) {
        return this.loaded.has(src);
    }

    /**
     * Check if a script is currently loading
     * @param {string} src - Script source
     * @returns {boolean}
     */
    isLoading(src) {
        return this.loading.has(src);
    }

    /**
     * Get loading metrics
     * @returns {Object} Performance metrics
     */
    getMetrics() {
        const totalTime = Date.now() - this.startTime;
        const avgLoadTime = this.metrics.loadedScripts > 0
            ? Math.round(this.metrics.totalLoadTime / this.metrics.loadedScripts)
            : 0;

        return {
            ...this.metrics,
            totalTime,
            avgLoadTime,
            successRate: this.metrics.totalScripts > 0
                ? Math.round((this.metrics.loadedScripts / this.metrics.totalScripts) * 100)
                : 100
        };
    }

    /**
     * Print performance report
     */
    printReport() {
        const metrics = this.getMetrics();

        console.log(`
╔════════════════════════════════════════════════════════╗
║         SCRIPT LOADER PERFORMANCE REPORT               ║
╠════════════════════════════════════════════════════════╣
║ Total Scripts:      ${metrics.totalScripts.toString().padStart(6)}                          ║
║ Loaded:             ${metrics.loadedScripts.toString().padStart(6)} (${metrics.successRate}%)                   ║
║ Failed:             ${metrics.failedScripts.toString().padStart(6)}                          ║
║ Average Load Time:  ${metrics.avgLoadTime.toString().padStart(6)}ms                        ║
║ Total Time:         ${metrics.totalTime.toString().padStart(6)}ms                        ║
╚════════════════════════════════════════════════════════╝
        `);
    }

    /**
     * Clear all loaded scripts (for testing/dev)
     */
    reset() {
        this.loaded.clear();
        this.loading.clear();
        this.failed.clear();
        this.metrics = {
            totalScripts: 0,
            loadedScripts: 0,
            failedScripts: 0,
            totalLoadTime: 0
        };
        console.log('[ScriptLoader] 🔄 Reset complete');
    }
}

// Create global singleton instance
if (typeof window !== 'undefined') {
    window.scriptLoader = new ScriptLoader();
    console.log('[ScriptLoader] 🚀 Initialized');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScriptLoader;
}
