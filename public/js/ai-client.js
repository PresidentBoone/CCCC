/**
 * AI Client with Retry Logic and Circuit Breaker
 *
 * Provides resilient API calls to essay analysis endpoints with:
 * - Exponential backoff retry (up to 3 attempts)
 * - Circuit breaker pattern (opens after 3 consecutive failures for 60s)
 * - 12-second total timeout
 * - Performance metrics tracking
 *
 * @module AIClient
 */

(function(window) {
    'use strict';

    /**
     * Circuit Breaker States
     */
    const CircuitState = {
        CLOSED: 'CLOSED',     // Normal operation
        OPEN: 'OPEN',         // Failing, reject immediately
        HALF_OPEN: 'HALF_OPEN' // Testing if service recovered
    };

    /**
     * AI Client class with resilience patterns
     */
    class AIClient {
        constructor(config = {}) {
            // Configuration
            this.config = {
                maxRetries: config.maxRetries || 3,
                baseDelay: config.baseDelay || 1000, // 1 second
                maxDelay: config.maxDelay || 8000,   // 8 seconds
                totalTimeout: config.totalTimeout || 12000, // 12 seconds
                circuitBreakerThreshold: config.circuitBreakerThreshold || 3,
                circuitBreakerTimeout: config.circuitBreakerTimeout || 60000, // 60 seconds
                ...config
            };

            // Circuit breaker state
            this.circuitState = CircuitState.CLOSED;
            this.failureCount = 0;
            this.lastFailureTime = null;
            this.successCount = 0;

            // Performance metrics
            this.metrics = {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                retriedRequests: 0,
                circuitOpenEvents: 0,
                averageLatency: 0,
                latencies: []
            };

            console.log('✅ AIClient initialized', this.config);
        }

        /**
         * Analyze essay with resilient API call
         * @param {string} essay - Essay text to analyze
         * @param {Object} options - Additional options
         * @returns {Promise<Object>} Analysis results with highlights
         */
        async analyzeEssay(essay, options = {}) {
            if (!essay || essay.trim().length === 0) {
                throw new Error('Essay text is required');
            }

            const endpoint = options.endpoint || '/api/essay/analyze';
            const requestBody = {
                essay: essay,
                userId: options.userId,
                essayId: options.essayId,
                analysisType: options.analysisType || 'full',
                timestamp: Date.now()
            };

            try {
                const result = await this.retryableFetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(options.headers || {})
                    },
                    body: JSON.stringify(requestBody)
                });

                return result;
            } catch (error) {
                console.error('❌ Essay analysis failed:', error.message);
                throw error;
            }
        }

        /**
         * Retryable fetch with exponential backoff
         * @param {string} url - API endpoint
         * @param {Object} options - Fetch options
         * @returns {Promise<Object>} Response data
         */
        async retryableFetch(url, options = {}) {
            const startTime = performance.now();
            this.metrics.totalRequests++;

            // Check circuit breaker
            if (this.circuitState === CircuitState.OPEN) {
                if (this.shouldAttemptReset()) {
                    console.log('🔄 Circuit breaker: transitioning to HALF_OPEN');
                    this.circuitState = CircuitState.HALF_OPEN;
                } else {
                    const error = new Error('Circuit breaker is OPEN - request rejected');
                    error.circuitOpen = true;
                    this.recordFailure(startTime);
                    throw error;
                }
            }

            let lastError = null;
            let attempt = 0;

            while (attempt <= this.config.maxRetries) {
                try {
                    // Check if we've exceeded total timeout
                    const elapsed = performance.now() - startTime;
                    if (elapsed >= this.config.totalTimeout) {
                        throw new Error(`Total timeout of ${this.config.totalTimeout}ms exceeded`);
                    }

                    // Calculate remaining timeout for this attempt
                    const remainingTimeout = this.config.totalTimeout - elapsed;
                    const attemptTimeout = Math.min(remainingTimeout, 5000); // Max 5s per attempt

                    if (attempt > 0) {
                        this.metrics.retriedRequests++;
                        console.log(`🔄 Retry attempt ${attempt}/${this.config.maxRetries} for ${url}`);
                    }

                    // Make the request with timeout
                    const response = await this.fetchWithTimeout(url, options, attemptTimeout);

                    // Success
                    const latency = performance.now() - startTime;
                    this.recordSuccess(latency);

                    return response;

                } catch (error) {
                    lastError = error;
                    attempt++;

                    console.warn(`⚠️ Request failed (attempt ${attempt}/${this.config.maxRetries + 1}):`, error.message);

                    // Don't retry on certain errors
                    if (this.isNonRetryableError(error)) {
                        console.log('🚫 Non-retryable error, aborting');
                        break;
                    }

                    // If we have retries left, wait with exponential backoff
                    if (attempt <= this.config.maxRetries) {
                        const delay = this.calculateBackoffDelay(attempt);
                        const elapsed = performance.now() - startTime;

                        // Don't wait if we're close to total timeout
                        if (elapsed + delay < this.config.totalTimeout) {
                            console.log(`⏳ Waiting ${delay}ms before retry...`);
                            await this.sleep(delay);
                        } else {
                            console.log('⏱️ Skipping backoff - approaching total timeout');
                        }
                    }
                }
            }

            // All retries failed
            this.recordFailure(performance.now() - startTime);
            throw lastError || new Error('Request failed after all retries');
        }

        /**
         * Fetch with timeout
         * @param {string} url - API endpoint
         * @param {Object} options - Fetch options
         * @param {number} timeout - Timeout in milliseconds
         * @returns {Promise<Object>} Response data
         */
        async fetchWithTimeout(url, options, timeout) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            try {
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                // Check HTTP status
                if (!response.ok) {
                    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                    error.status = response.status;
                    error.response = response;
                    throw error;
                }

                // Parse JSON response
                const data = await response.json();
                return data;

            } catch (error) {
                clearTimeout(timeoutId);

                if (error.name === 'AbortError') {
                    const timeoutError = new Error(`Request timeout after ${timeout}ms`);
                    timeoutError.timeout = true;
                    throw timeoutError;
                }

                throw error;
            }
        }

        /**
         * Calculate exponential backoff delay
         * @param {number} attempt - Current attempt number (1-indexed)
         * @returns {number} Delay in milliseconds
         */
        calculateBackoffDelay(attempt) {
            // Exponential: 1s, 2s, 4s, 8s...
            const exponentialDelay = this.config.baseDelay * Math.pow(2, attempt - 1);

            // Add jitter (±20%) to prevent thundering herd
            const jitter = exponentialDelay * 0.2 * (Math.random() * 2 - 1);

            const delay = exponentialDelay + jitter;

            // Cap at maxDelay
            return Math.min(delay, this.config.maxDelay);
        }

        /**
         * Check if error should not be retried
         * @param {Error} error - Error object
         * @returns {boolean} True if non-retryable
         */
        isNonRetryableError(error) {
            // Don't retry client errors (4xx except 429)
            if (error.status >= 400 && error.status < 500 && error.status !== 429) {
                return true;
            }

            // Don't retry validation errors
            if (error.message && error.message.includes('required')) {
                return true;
            }

            return false;
        }

        /**
         * Check if circuit breaker should attempt reset
         * @returns {boolean} True if should attempt
         */
        shouldAttemptReset() {
            if (this.circuitState !== CircuitState.OPEN) {
                return false;
            }

            const timeSinceFailure = Date.now() - this.lastFailureTime;
            return timeSinceFailure >= this.config.circuitBreakerTimeout;
        }

        /**
         * Record successful request
         * @param {number} latency - Request latency in milliseconds
         */
        recordSuccess(latency) {
            this.metrics.successfulRequests++;
            this.metrics.latencies.push(latency);

            // Keep only last 100 latencies for moving average
            if (this.metrics.latencies.length > 100) {
                this.metrics.latencies.shift();
            }

            // Update average latency
            this.metrics.averageLatency =
                this.metrics.latencies.reduce((a, b) => a + b, 0) / this.metrics.latencies.length;

            // Circuit breaker state management
            if (this.circuitState === CircuitState.HALF_OPEN) {
                console.log('✅ Circuit breaker: transitioning to CLOSED (request succeeded)');
                this.circuitState = CircuitState.CLOSED;
                this.failureCount = 0;
            } else if (this.circuitState === CircuitState.CLOSED) {
                // Reset failure count on success
                this.failureCount = 0;
            }

            console.log(`✅ Request successful (${latency.toFixed(2)}ms) - Circuit: ${this.circuitState}`);
        }

        /**
         * Record failed request
         * @param {number} latency - Request latency in milliseconds
         */
        recordFailure(latency) {
            this.metrics.failedRequests++;
            this.failureCount++;
            this.lastFailureTime = Date.now();

            console.warn(`❌ Request failed (${latency.toFixed(2)}ms) - Failures: ${this.failureCount}/${this.config.circuitBreakerThreshold}`);

            // Open circuit breaker if threshold exceeded
            if (this.failureCount >= this.config.circuitBreakerThreshold) {
                if (this.circuitState !== CircuitState.OPEN) {
                    console.error(`🔴 Circuit breaker OPEN - too many failures (${this.failureCount})`);
                    this.circuitState = CircuitState.OPEN;
                    this.metrics.circuitOpenEvents++;
                }
            }
        }

        /**
         * Sleep utility
         * @param {number} ms - Milliseconds to sleep
         * @returns {Promise<void>}
         */
        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        /**
         * Get performance metrics
         * @returns {Object} Performance metrics
         */
        getMetrics() {
            return {
                ...this.metrics,
                circuitState: this.circuitState,
                failureCount: this.failureCount,
                successRate: this.metrics.totalRequests > 0
                    ? (this.metrics.successfulRequests / this.metrics.totalRequests * 100).toFixed(2) + '%'
                    : 'N/A'
            };
        }

        /**
         * Reset circuit breaker (manual override)
         */
        resetCircuitBreaker() {
            console.log('🔄 Circuit breaker manually reset');
            this.circuitState = CircuitState.CLOSED;
            this.failureCount = 0;
            this.lastFailureTime = null;
        }

        /**
         * Reset all metrics
         */
        resetMetrics() {
            this.metrics = {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                retriedRequests: 0,
                circuitOpenEvents: 0,
                averageLatency: 0,
                latencies: []
            };
            console.log('📊 Metrics reset');
        }
    }

    // Export to window
    window.AIClient = AIClient;
    window.CircuitState = CircuitState;

    console.log('📦 AIClient module loaded');

})(window);
