/**
 * Tests for AIClient with Retry Logic and Circuit Breaker
 * Simplified approach: test core functionality without full browser environment
 */

// Mock performance.now() for Node
global.performance = global.performance || {
    now: () => Date.now()
};

// Mock fetch
global.fetch = jest.fn();

// Mock AbortController
global.AbortController = class AbortController {
    constructor() {
        this.signal = { aborted: false };
    }
    abort() {
        this.signal.aborted = true;
    }
};

describe('AIClient', () => {
    let AIClient, CircuitState;

    beforeAll(() => {
        // Load module by requiring and executing
        const fs = require('fs');
        const path = require('path');
        const moduleCode = fs.readFileSync(
            path.join(__dirname, '../public/js/ai-client.js'),
            'utf8'
        );

        // Create a mock window object
        const mockWindow = {};

        // Execute the IIFE with our mock window
        const func = new Function('window', moduleCode + '; return window;');
        const result = func(mockWindow);

        AIClient = result.AIClient || mockWindow.AIClient;
        CircuitState = result.CircuitState || mockWindow.CircuitState;

        if (!AIClient) {
            throw new Error('AIClient not loaded');
        }
    });

    beforeEach(() => {
        // Reset fetch mock
        global.fetch.mockReset();
        jest.clearAllTimers();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Initialization', () => {
        test('creates instance with default config', () => {
            const client = new AIClient();

            expect(client.config.maxRetries).toBe(3);
            expect(client.config.baseDelay).toBe(1000);
            expect(client.config.totalTimeout).toBe(12000);
            expect(client.circuitState).toBe(CircuitState.CLOSED);
        });

        test('creates instance with custom config', () => {
            const client = new AIClient({
                maxRetries: 5,
                baseDelay: 500,
                totalTimeout: 10000
            });

            expect(client.config.maxRetries).toBe(5);
            expect(client.config.baseDelay).toBe(500);
            expect(client.config.totalTimeout).toBe(10000);
        });

        test('initializes metrics correctly', () => {
            const client = new AIClient();
            const metrics = client.getMetrics();

            expect(metrics.totalRequests).toBe(0);
            expect(metrics.successfulRequests).toBe(0);
            expect(metrics.failedRequests).toBe(0);
            expect(metrics.circuitState).toBe(CircuitState.CLOSED);
        });
    });

    describe('Successful requests', () => {
        test('makes successful API call', async () => {
            const client = new AIClient();
            const mockResponse = { highlights: [], score: 85 };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await client.retryableFetch('/api/test', { method: 'GET' });

            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(client.metrics.successfulRequests).toBe(1);
            expect(client.metrics.totalRequests).toBe(1);
        });

        test('analyzeEssay calls retryableFetch correctly', async () => {
            const client = new AIClient();
            const mockResponse = { highlights: [], analysis: 'Good essay' };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const essay = 'This is a test essay.';
            const result = await client.analyzeEssay(essay);

            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledTimes(1);

            const callArgs = global.fetch.mock.calls[0];
            expect(callArgs[0]).toBe('/api/essay/analyze');

            const body = JSON.parse(callArgs[1].body);
            expect(body.essay).toBe(essay);
        });

        test('throws error for empty essay', async () => {
            const client = new AIClient();

            await expect(client.analyzeEssay('')).rejects.toThrow('Essay text is required');
            await expect(client.analyzeEssay('   ')).rejects.toThrow('Essay text is required');
        });
    });

    describe('Retry logic', () => {
        test('retries on network failure', async () => {
            const client = new AIClient({ baseDelay: 10 });

            // Fail twice, succeed on third attempt
            global.fetch
                .mockRejectedValueOnce(new Error('Network error'))
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true })
                });

            const result = await client.retryableFetch('/api/test', { method: 'GET' });

            expect(result).toEqual({ success: true });
            expect(global.fetch).toHaveBeenCalledTimes(3);
            expect(client.metrics.retriedRequests).toBe(2);
            expect(client.metrics.successfulRequests).toBe(1);
        });

        test('calculates exponential backoff correctly', () => {
            const client = new AIClient({ baseDelay: 1000 });

            const delay1 = client.calculateBackoffDelay(1);
            const delay2 = client.calculateBackoffDelay(2);
            const delay3 = client.calculateBackoffDelay(3);

            // Should be approximately 1s, 2s, 4s (with jitter)
            expect(delay1).toBeGreaterThanOrEqual(800);
            expect(delay1).toBeLessThanOrEqual(1200);

            expect(delay2).toBeGreaterThanOrEqual(1600);
            expect(delay2).toBeLessThanOrEqual(2400);

            expect(delay3).toBeGreaterThanOrEqual(3200);
            expect(delay3).toBeLessThanOrEqual(4800);
        });

        test('respects maxRetries limit', async () => {
            const client = new AIClient({ maxRetries: 2, baseDelay: 10 });

            global.fetch.mockRejectedValue(new Error('Network error'));

            await expect(
                client.retryableFetch('/api/test', { method: 'GET' })
            ).rejects.toThrow();

            // Initial attempt + 2 retries = 3 total calls
            expect(global.fetch).toHaveBeenCalledTimes(3);
            expect(client.metrics.failedRequests).toBe(1);
        });

        test('does not retry on 4xx errors (except 429)', async () => {
            const client = new AIClient({ baseDelay: 10 });

            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                json: async () => ({})
            });

            await expect(
                client.retryableFetch('/api/test', { method: 'GET' })
            ).rejects.toThrow('HTTP 400');

            // Should not retry
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        test('retries on 5xx errors', async () => {
            const client = new AIClient({ maxRetries: 2, baseDelay: 10 });

            // 500 error twice, then success
            global.fetch
                .mockResolvedValueOnce({
                    ok: false,
                    status: 500,
                    statusText: 'Internal Server Error',
                    json: async () => ({})
                })
                .mockResolvedValueOnce({
                    ok: false,
                    status: 503,
                    statusText: 'Service Unavailable',
                    json: async () => ({})
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true })
                });

            const result = await client.retryableFetch('/api/test', { method: 'GET' });

            expect(result).toEqual({ success: true });
            expect(global.fetch).toHaveBeenCalledTimes(3);
        });
    });

    describe('Circuit breaker', () => {
        test('opens circuit after threshold failures', async () => {
            const client = new AIClient({
                circuitBreakerThreshold: 3,
                maxRetries: 0,
                baseDelay: 10
            });

            global.fetch.mockRejectedValue(new Error('Service down'));

            // Make 3 failed requests
            for (let i = 0; i < 3; i++) {
                try {
                    await client.retryableFetch('/api/test', { method: 'GET' });
                } catch (e) {
                    // Expected
                }
            }

            expect(client.circuitState).toBe(CircuitState.OPEN);
            expect(client.metrics.circuitOpenEvents).toBe(1);
        });

        test('rejects requests when circuit is open', async () => {
            const client = new AIClient({
                circuitBreakerThreshold: 2,
                maxRetries: 0,
                baseDelay: 10
            });

            global.fetch.mockRejectedValue(new Error('Service down'));

            // Open the circuit
            for (let i = 0; i < 2; i++) {
                try {
                    await client.retryableFetch('/api/test', { method: 'GET' });
                } catch (e) {
                    // Expected
                }
            }

            expect(client.circuitState).toBe(CircuitState.OPEN);

            // Next request should be rejected immediately
            await expect(
                client.retryableFetch('/api/test', { method: 'GET' })
            ).rejects.toThrow('Circuit breaker is OPEN');

            // Fetch should not be called for the rejected request
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });

        test('transitions to HALF_OPEN after timeout', async () => {
            const client = new AIClient({
                circuitBreakerThreshold: 2,
                circuitBreakerTimeout: 100, // 100ms for testing
                maxRetries: 0,
                baseDelay: 10
            });

            global.fetch.mockRejectedValue(new Error('Service down'));

            // Open the circuit
            for (let i = 0; i < 2; i++) {
                try {
                    await client.retryableFetch('/api/test', { method: 'GET' });
                } catch (e) {
                    // Expected
                }
            }

            expect(client.circuitState).toBe(CircuitState.OPEN);

            // Wait for circuit breaker timeout
            await new Promise(resolve => setTimeout(resolve, 150));

            // Mock successful response
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            });

            // Should transition to HALF_OPEN and allow request
            const result = await client.retryableFetch('/api/test', { method: 'GET' });

            expect(result).toEqual({ success: true });
            expect(client.circuitState).toBe(CircuitState.CLOSED);
        });

        test('manual circuit breaker reset', async () => {
            const client = new AIClient({
                circuitBreakerThreshold: 2,
                maxRetries: 0
            });

            global.fetch.mockRejectedValue(new Error('Service down'));

            // Open the circuit
            for (let i = 0; i < 2; i++) {
                try {
                    await client.retryableFetch('/api/test', { method: 'GET' });
                } catch (e) {
                    // Expected
                }
            }

            expect(client.circuitState).toBe(CircuitState.OPEN);

            // Manual reset
            client.resetCircuitBreaker();

            expect(client.circuitState).toBe(CircuitState.CLOSED);
            expect(client.failureCount).toBe(0);
        });
    });

    describe('Performance metrics', () => {
        test('tracks request metrics correctly', async () => {
            const client = new AIClient({ baseDelay: 10 });

            global.fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true })
                })
                .mockRejectedValueOnce(new Error('Network error'))
                .mockRejectedValueOnce(new Error('Network error'))
                .mockRejectedValueOnce(new Error('Network error'))
                .mockRejectedValueOnce(new Error('Network error'));

            // Successful request
            await client.retryableFetch('/api/test', { method: 'GET' });

            // Failed request with retries (will exhaust all retries)
            try {
                await client.retryableFetch('/api/test', { method: 'GET' });
            } catch (e) {
                // Expected
            }

            const metrics = client.getMetrics();

            expect(metrics.totalRequests).toBe(2);
            expect(metrics.successfulRequests).toBe(1);
            expect(metrics.failedRequests).toBe(1);
            expect(metrics.retriedRequests).toBeGreaterThan(0);
        });

        test('calculates average latency', async () => {
            const client = new AIClient();

            global.fetch.mockResolvedValue({
                ok: true,
                json: async () => ({ success: true })
            });

            // Make multiple requests
            for (let i = 0; i < 5; i++) {
                await client.retryableFetch('/api/test', { method: 'GET' });
            }

            const metrics = client.getMetrics();

            expect(metrics.averageLatency).toBeGreaterThan(0);
            expect(metrics.latencies.length).toBe(5);
        });

        test('resets metrics correctly', () => {
            const client = new AIClient();

            client.metrics.totalRequests = 10;
            client.metrics.successfulRequests = 8;
            client.metrics.failedRequests = 2;

            client.resetMetrics();

            const metrics = client.getMetrics();
            expect(metrics.totalRequests).toBe(0);
            expect(metrics.successfulRequests).toBe(0);
            expect(metrics.failedRequests).toBe(0);
        });
    });

    describe('Edge cases', () => {
        test('handles rapid concurrent requests', async () => {
            const client = new AIClient();

            global.fetch.mockResolvedValue({
                ok: true,
                json: async () => ({ success: true })
            });

            // Make 10 concurrent requests
            const promises = [];
            for (let i = 0; i < 10; i++) {
                promises.push(client.retryableFetch('/api/test', { method: 'GET' }));
            }

            await Promise.all(promises);

            const metrics = client.getMetrics();
            expect(metrics.totalRequests).toBe(10);
            expect(metrics.successfulRequests).toBe(10);
        });
    });
});
