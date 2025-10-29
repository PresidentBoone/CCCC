/**
 * Tests for FirebaseSync with retry logic and circuit breaker
 */

describe('FirebaseSyncManager', () => {
    let FirebaseSyncManager, createSyncFunction, setupAutoSync;
    let syncManager;
    let mockFirebase;
    let mockAuth;
    let mockFirestore;

    beforeAll(() => {
        // Load module
        const fs = require('fs');
        const path = require('path');
        const moduleCode = fs.readFileSync(
            path.join(__dirname, '../public/js/firebase-sync.js'),
            'utf8'
        );

        // Create mock window
        const mockWindow = {
            firebase: null, // Will be mocked
            addEventListener: jest.fn(),
            performance: global.performance
        };

        const func = new Function('window', moduleCode + '; return window;');
        const result = func(mockWindow);

        FirebaseSyncManager = result.FirebaseSyncManager;
        createSyncFunction = result.createSyncFunction;
        setupAutoSync = result.setupAutoSync;

        if (!FirebaseSyncManager) {
            throw new Error('FirebaseSyncManager not loaded');
        }
    });

    beforeEach(() => {
        // Mock Firestore
        mockFirestore = {
            collection: jest.fn().mockReturnThis(),
            doc: jest.fn().mockReturnThis(),
            set: jest.fn().mockResolvedValue({}),
            get: jest.fn().mockResolvedValue({ exists: true, data: () => ({}) })
        };

        // Mock Auth
        mockAuth = {
            currentUser: { uid: 'test-user-123' },
            onAuthStateChanged: jest.fn((callback) => {
                callback({ uid: 'test-user-123' });
                return jest.fn(); // unsubscribe function
            })
        };

        // Mock Firebase
        mockFirebase = {
            auth: jest.fn(() => mockAuth),
            firestore: jest.fn(() => mockFirestore)
        };

        global.window = {
            firebase: mockFirebase,
            addEventListener: jest.fn(),
            performance: global.performance
        };

        // Create fresh manager
        syncManager = new FirebaseSyncManager();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        test('creates instance with default config', () => {
            expect(syncManager.config.maxRetries).toBe(3);
            expect(syncManager.config.baseDelay).toBe(1000);
            expect(syncManager.config.timeout).toBe(15000);
            expect(syncManager.circuitState).toBe('CLOSED');
        });

        test('creates instance with custom config', () => {
            const custom = new FirebaseSyncManager({
                maxRetries: 5,
                baseDelay: 500,
                timeout: 10000
            });

            expect(custom.config.maxRetries).toBe(5);
            expect(custom.config.baseDelay).toBe(500);
            expect(custom.config.timeout).toBe(10000);
        });

        test('initializes Firebase connection', async () => {
            await syncManager.init();

            expect(syncManager.initialized).toBe(true);
            expect(mockFirebase.auth).toHaveBeenCalled();
            expect(mockFirebase.firestore).toHaveBeenCalled();
        });

        test('prevents double initialization', async () => {
            await syncManager.init();
            const firstAuth = syncManager.auth;

            await syncManager.init();
            expect(syncManager.auth).toBe(firstAuth);
        });

        test('throws error when Firebase SDK not loaded', async () => {
            global.window.firebase = null;

            await expect(syncManager.init()).rejects.toThrow('Firebase SDK not loaded');
        });
    });

    describe('Single draft sync', () => {
        beforeEach(async () => {
            await syncManager.init();
        });

        test('syncs draft successfully', async () => {
            const draft = {
                essayId: 'essay-001',
                content: 'This is a test essay.',
                essayTitle: 'Test Essay',
                wordCount: 5,
                version: 1,
                timestamp: Date.now(),
                metadata: {}
            };

            const result = await syncManager.syncDraftToFirebase(draft);

            expect(result.success).toBe(true);
            expect(result.essayId).toBe('essay-001');
            expect(mockFirestore.collection).toHaveBeenCalledWith('users');
            expect(mockFirestore.set).toHaveBeenCalled();
        });

        test('includes all draft data in upload', async () => {
            const draft = {
                essayId: 'essay-002',
                content: 'Essay content here',
                essayTitle: 'My Essay',
                wordCount: 3,
                version: 2,
                timestamp: 123456,
                metadata: { category: 'college' }
            };

            await syncManager.syncDraftToFirebase(draft);

            const setCall = mockFirestore.set.mock.calls[0];
            expect(setCall[0]).toMatchObject({
                userId: 'test-user-123',
                essayId: 'essay-002',
                content: 'Essay content here',
                essayTitle: 'My Essay',
                wordCount: 3,
                version: 2
            });
        });

        test('throws error when not initialized', async () => {
            const uninitManager = new FirebaseSyncManager();
            const draft = { essayId: 'test', content: 'test' };

            await expect(
                uninitManager.syncDraftToFirebase(draft)
            ).rejects.toThrow('Firebase not initialized');
        });

        test('throws error when user not authenticated', async () => {
            mockAuth.currentUser = null;

            const draft = { essayId: 'test', content: 'test' };

            await expect(
                syncManager.syncDraftToFirebase(draft)
            ).rejects.toThrow('User not authenticated');
        });
    });

    describe('Retry logic', () => {
        beforeEach(async () => {
            await syncManager.init();
        });

        test('retries on transient failure', async () => {
            mockFirestore.set
                .mockRejectedValueOnce(new Error('Network error'))
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce({});

            const draft = {
                essayId: 'essay-retry',
                content: 'Test',
                wordCount: 1,
                version: 1,
                timestamp: Date.now()
            };

            const result = await syncManager.syncDraftToFirebase(draft);

            expect(result.success).toBe(true);
            expect(mockFirestore.set).toHaveBeenCalledTimes(3);
            expect(syncManager.metrics.retriedSyncs).toBe(2);
        });

        test('respects maxRetries limit', async () => {
            syncManager.config.maxRetries = 2;
            syncManager.config.baseDelay = 10;

            mockFirestore.set.mockRejectedValue(new Error('Network error'));

            const draft = {
                essayId: 'essay-fail',
                content: 'Test',
                wordCount: 1,
                version: 1,
                timestamp: Date.now()
            };

            await expect(
                syncManager.syncDraftToFirebase(draft)
            ).rejects.toThrow();

            // Initial attempt + 2 retries = 3 total
            expect(mockFirestore.set).toHaveBeenCalledTimes(3);
        });

        test('does not retry on permission denied', async () => {
            const error = new Error('Permission denied');
            error.code = 'permission-denied';

            mockFirestore.set.mockRejectedValue(error);

            const draft = {
                essayId: 'essay-perm',
                content: 'Test',
                wordCount: 1,
                version: 1,
                timestamp: Date.now()
            };

            await expect(
                syncManager.syncDraftToFirebase(draft)
            ).rejects.toThrow('Permission denied');

            // Should not retry
            expect(mockFirestore.set).toHaveBeenCalledTimes(1);
        });

        test('calculates exponential backoff correctly', () => {
            const delay1 = syncManager.calculateBackoffDelay(1);
            const delay2 = syncManager.calculateBackoffDelay(2);
            const delay3 = syncManager.calculateBackoffDelay(3);

            // With jitter, should be approximately 1s, 2s, 4s
            expect(delay1).toBeGreaterThanOrEqual(800);
            expect(delay1).toBeLessThanOrEqual(1200);

            expect(delay2).toBeGreaterThanOrEqual(1600);
            expect(delay2).toBeLessThanOrEqual(2400);

            expect(delay3).toBeGreaterThanOrEqual(3200);
            expect(delay3).toBeLessThanOrEqual(4800);
        });
    });

    describe('Circuit breaker', () => {
        beforeEach(async () => {
            await syncManager.init();
            syncManager.config.maxRetries = 0; // Fail fast
            syncManager.config.baseDelay = 10;
        });

        test('opens circuit after threshold failures', async () => {
            mockFirestore.set.mockRejectedValue(new Error('Service down'));

            const draft = {
                essayId: 'essay-cb',
                content: 'Test',
                wordCount: 1,
                version: 1,
                timestamp: Date.now()
            };

            // Make 3 failed attempts
            for (let i = 0; i < 3; i++) {
                try {
                    await syncManager.syncDraftToFirebase(draft);
                } catch (e) {
                    // Expected
                }
            }

            expect(syncManager.circuitState).toBe('OPEN');
        });

        test('rejects syncs when circuit is open', async () => {
            mockFirestore.set.mockRejectedValue(new Error('Service down'));

            const draft = {
                essayId: 'essay-cb2',
                content: 'Test',
                wordCount: 1,
                version: 1,
                timestamp: Date.now()
            };

            // Open circuit
            for (let i = 0; i < 3; i++) {
                try {
                    await syncManager.syncDraftToFirebase(draft);
                } catch (e) {
                    // Expected
                }
            }

            expect(syncManager.circuitState).toBe('OPEN');

            // Next attempt should be rejected immediately
            await expect(
                syncManager.syncDraftToFirebase(draft)
            ).rejects.toThrow('Circuit breaker is OPEN');

            // Firestore should not be called for rejected sync
            expect(mockFirestore.set).toHaveBeenCalledTimes(3);
        });

        test('transitions to HALF_OPEN after timeout', async () => {
            syncManager.circuitBreakerTimeout = 100; // 100ms for testing
            mockFirestore.set.mockRejectedValue(new Error('Service down'));

            const draft = {
                essayId: 'essay-cb3',
                content: 'Test',
                wordCount: 1,
                version: 1,
                timestamp: Date.now()
            };

            // Open circuit
            for (let i = 0; i < 3; i++) {
                try {
                    await syncManager.syncDraftToFirebase(draft);
                } catch (e) {
                    // Expected
                }
            }

            expect(syncManager.circuitState).toBe('OPEN');

            // Wait for timeout
            await new Promise(resolve => setTimeout(resolve, 150));

            // Mock success
            mockFirestore.set.mockResolvedValueOnce({});

            // Should transition to HALF_OPEN and allow sync
            const result = await syncManager.syncDraftToFirebase(draft);

            expect(result.success).toBe(true);
            expect(syncManager.circuitState).toBe('CLOSED');
        });

        test('manual circuit breaker reset', () => {
            syncManager.circuitState = 'OPEN';
            syncManager.failureCount = 5;

            syncManager.resetCircuitBreaker();

            expect(syncManager.circuitState).toBe('CLOSED');
            expect(syncManager.failureCount).toBe(0);
        });
    });

    describe('Large essay handling', () => {
        beforeEach(async () => {
            await syncManager.init();
        });

        test('chunks large essays', async () => {
            const largeContent = 'A'.repeat(100000); // 100KB

            mockFirestore.collection.mockReturnValue({
                doc: jest.fn().mockReturnValue({
                    set: jest.fn().mockResolvedValue({}),
                    collection: jest.fn().mockReturnValue({
                        doc: jest.fn().mockReturnValue({
                            set: jest.fn().mockResolvedValue({})
                        })
                    })
                })
            });

            const draft = {
                essayId: 'essay-large',
                content: largeContent,
                essayTitle: 'Large Essay',
                wordCount: 1000,
                version: 1,
                timestamp: Date.now()
            };

            const result = await syncManager.syncDraftToFirebase(draft);

            expect(result.chunked).toBe(true);
            expect(result.chunkCount).toBeGreaterThan(1);
        });
    });

    describe('Batch sync', () => {
        beforeEach(async () => {
            await syncManager.init();
        });

        test('syncs multiple drafts', async () => {
            const drafts = [
                { essayId: 'essay-1', content: 'Test 1', wordCount: 2, version: 1, timestamp: Date.now() },
                { essayId: 'essay-2', content: 'Test 2', wordCount: 2, version: 1, timestamp: Date.now() },
                { essayId: 'essay-3', content: 'Test 3', wordCount: 2, version: 1, timestamp: Date.now() }
            ];

            const results = await syncManager.syncBatch(drafts);

            expect(results.synced).toBe(3);
            expect(results.failed).toBe(0);
        });

        test('tracks partial batch failures', async () => {
            let callCount = 0;
            mockFirestore.set.mockImplementation(() => {
                callCount++;
                if (callCount === 2) {
                    return Promise.reject(new Error('Sync failed'));
                }
                return Promise.resolve({});
            });

            const drafts = [
                { essayId: 'essay-1', content: 'Test 1', wordCount: 2, version: 1, timestamp: Date.now() },
                { essayId: 'essay-2', content: 'Test 2', wordCount: 2, version: 1, timestamp: Date.now() },
                { essayId: 'essay-3', content: 'Test 3', wordCount: 2, version: 1, timestamp: Date.now() }
            ];

            const results = await syncManager.syncBatch(drafts);

            expect(results.synced).toBe(2);
            expect(results.failed).toBe(1);
            expect(results.errors.length).toBe(1);
        });

        test('handles empty batch', async () => {
            const results = await syncManager.syncBatch([]);

            expect(results.synced).toBe(0);
            expect(results.failed).toBe(0);
        });
    });

    describe('Queue management', () => {
        beforeEach(async () => {
            await syncManager.init();
        });

        test('adds draft to queue', () => {
            const draft = {
                essayId: 'essay-queue',
                content: 'Test',
                wordCount: 1,
                version: 1,
                timestamp: Date.now()
            };

            syncManager.queueSync(draft);

            expect(syncManager.syncQueue.has('essay-queue')).toBe(true);
        });

        test('emits queued event', () => {
            const queueListener = jest.fn();
            syncManager.on('queued', queueListener);

            const draft = {
                essayId: 'essay-queue2',
                content: 'Test',
                wordCount: 1,
                version: 1,
                timestamp: Date.now()
            };

            syncManager.queueSync(draft);

            expect(queueListener).toHaveBeenCalledWith(
                expect.objectContaining({
                    essayId: 'essay-queue2',
                    queueSize: 1
                })
            );
        });

        test('clears queue', () => {
            syncManager.syncQueue.set('essay-1', {});
            syncManager.syncQueue.set('essay-2', {});

            syncManager.clearQueue();

            expect(syncManager.syncQueue.size).toBe(0);
        });
    });

    describe('Event system', () => {
        beforeEach(async () => {
            await syncManager.init();
        });

        test('emits sync event on successful sync', async () => {
            const syncListener = jest.fn();
            syncManager.on('sync', syncListener);

            const draft = {
                essayId: 'essay-event',
                content: 'Test',
                wordCount: 1,
                version: 1,
                timestamp: Date.now()
            };

            await syncManager.syncDraftToFirebase(draft);

            expect(syncListener).toHaveBeenCalledWith(
                expect.objectContaining({
                    essayId: 'essay-event',
                    version: 1
                })
            );
        });

        test('emits error event on sync failure', async () => {
            const errorListener = jest.fn();
            syncManager.on('error', errorListener);

            mockFirestore.set.mockRejectedValue(new Error('Sync error'));
            syncManager.config.maxRetries = 0;

            const draft = {
                essayId: 'essay-error',
                content: 'Test',
                wordCount: 1,
                version: 1,
                timestamp: Date.now()
            };

            try {
                await syncManager.syncDraftToFirebase(draft);
            } catch (e) {
                // Expected
            }

            expect(errorListener).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'sync',
                    essayId: 'essay-error'
                })
            );
        });

        test('removes event listener', () => {
            const listener = jest.fn();
            syncManager.on('sync', listener);
            syncManager.off('sync', listener);

            // Listener should not be called
            expect(syncManager.listeners.sync.length).toBe(0);
        });

        test('throws error for unknown event', () => {
            expect(() => {
                syncManager.on('unknown', () => {});
            }).toThrow('Unknown event: unknown');
        });
    });

    describe('Performance metrics', () => {
        beforeEach(async () => {
            await syncManager.init();
        });

        test('tracks sync metrics', async () => {
            const draft = {
                essayId: 'essay-metrics',
                content: 'Test',
                wordCount: 1,
                version: 1,
                timestamp: Date.now()
            };

            await syncManager.syncDraftToFirebase(draft);

            const metrics = syncManager.getMetrics();

            expect(metrics.totalSyncs).toBe(1);
            expect(metrics.successfulSyncs).toBe(1);
            expect(metrics.averageLatency).toBeGreaterThan(0);
        });

        test('calculates success rate', async () => {
            mockFirestore.set
                .mockResolvedValueOnce({})
                .mockRejectedValueOnce(new Error('Fail'));

            syncManager.config.maxRetries = 0;

            const draft1 = {
                essayId: 'essay-1',
                content: 'Test',
                wordCount: 1,
                version: 1,
                timestamp: Date.now()
            };

            const draft2 = {
                essayId: 'essay-2',
                content: 'Test',
                wordCount: 1,
                version: 1,
                timestamp: Date.now()
            };

            await syncManager.syncDraftToFirebase(draft1);

            try {
                await syncManager.syncDraftToFirebase(draft2);
            } catch (e) {
                // Expected
            }

            const metrics = syncManager.getMetrics();

            expect(metrics.totalSyncs).toBe(2);
            expect(metrics.successfulSyncs).toBe(1);
            expect(metrics.successRate).toBe('50.00%');
        });
    });

    describe('Helper functions', () => {
        test('createSyncFunction returns valid function', async () => {
            await syncManager.init();

            const syncFn = createSyncFunction(syncManager);

            expect(typeof syncFn).toBe('function');

            const draft = {
                essayId: 'essay-helper',
                content: 'Test',
                wordCount: 1,
                version: 1,
                timestamp: Date.now()
            };

            const result = await syncFn(draft);

            expect(result.success).toBe(true);
        });

        test('createSyncFunction throws if not initialized', async () => {
            const uninitManager = new FirebaseSyncManager();
            const syncFn = createSyncFunction(uninitManager);

            const draft = { essayId: 'test', content: 'test' };

            await expect(syncFn(draft)).rejects.toThrow('FirebaseSyncManager not initialized');
        });
    });

    describe('Edge cases', () => {
        beforeEach(async () => {
            await syncManager.init();
        });

        test('handles timeout errors', async () => {
            syncManager.config.timeout = 10;

            mockFirestore.set.mockImplementation(() => {
                return new Promise(resolve => setTimeout(resolve, 100));
            });

            const draft = {
                essayId: 'essay-timeout',
                content: 'Test',
                wordCount: 1,
                version: 1,
                timestamp: Date.now()
            };

            await expect(
                syncManager.syncDraftToFirebase(draft)
            ).rejects.toThrow();
        });

        test('handles concurrent syncs for different essays', async () => {
            const drafts = [
                { essayId: 'essay-a', content: 'A', wordCount: 1, version: 1, timestamp: Date.now() },
                { essayId: 'essay-b', content: 'B', wordCount: 1, version: 1, timestamp: Date.now() },
                { essayId: 'essay-c', content: 'C', wordCount: 1, version: 1, timestamp: Date.now() }
            ];

            const results = await Promise.all(
                drafts.map(draft => syncManager.syncDraftToFirebase(draft))
            );

            expect(results.length).toBe(3);
            results.forEach(result => {
                expect(result.success).toBe(true);
            });
        });

        test('tracks active syncs', async () => {
            let resolveSync;
            const syncPromise = new Promise(resolve => {
                resolveSync = resolve;
            });

            mockFirestore.set.mockReturnValue(syncPromise);

            const draft = {
                essayId: 'essay-active',
                content: 'Test',
                wordCount: 1,
                version: 1,
                timestamp: Date.now()
            };

            const syncTask = syncManager.syncDraftToFirebase(draft);

            // Check active syncs before completion
            await new Promise(resolve => setTimeout(resolve, 10));
            expect(syncManager.activeSyncs.has('essay-active')).toBe(true);

            // Complete sync
            resolveSync({});
            await syncTask;

            // Should be removed from active syncs
            expect(syncManager.activeSyncs.has('essay-active')).toBe(false);
        });
    });
});
