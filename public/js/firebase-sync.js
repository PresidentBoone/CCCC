/**
 * Firebase Sync Module
 *
 * Provides non-blocking background sync of essay drafts to Firebase Firestore.
 * Integrates with AutosaveManager's sync hooks and AIClient's resilience patterns.
 *
 * Features:
 * - Asynchronous background sync (never blocks UI)
 * - Automatic retry with exponential backoff
 * - Circuit breaker integration
 * - Event-driven status updates
 * - Offline queue management
 * - Large file upload optimization
 *
 * @module FirebaseSync
 */

(function(window) {
    'use strict';

    /**
     * Firebase Sync Manager
     */
    class FirebaseSyncManager {
        constructor(config = {}) {
            // Configuration
            this.config = {
                maxRetries: config.maxRetries || 3,
                baseDelay: config.baseDelay || 1000,
                maxDelay: config.maxDelay || 8000,
                timeout: config.timeout || 15000, // 15 seconds per sync
                batchSize: config.batchSize || 5,
                chunkSize: config.chunkSize || 50000, // 50KB chunks for large essays
                ...config
            };

            // Firebase instances (to be initialized)
            this.auth = null;
            this.firestore = null;
            this.initialized = false;

            // Sync queue and status
            this.syncQueue = new Map(); // essayId -> draft
            this.isSyncing = false;
            this.activeSyncs = new Set();

            // Circuit breaker state (simple implementation)
            this.circuitState = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
            this.failureCount = 0;
            this.circuitBreakerThreshold = 3;
            this.circuitBreakerTimeout = 60000; // 60 seconds
            this.lastFailureTime = null;

            // Performance metrics
            this.metrics = {
                totalSyncs: 0,
                successfulSyncs: 0,
                failedSyncs: 0,
                retriedSyncs: 0,
                averageLatency: 0,
                latencies: []
            };

            // Event listeners
            this.listeners = {
                sync: [],
                error: [],
                queued: [],
                dequeued: []
            };

            console.log('✅ FirebaseSyncManager initialized', this.config);
        }

        /**
         * Initialize Firebase connection
         * @param {Object} firebaseApp - Firebase app instance
         * @returns {Promise<void>}
         */
        async init(firebaseApp) {
            if (this.initialized) {
                console.log('⚠️ Firebase already initialized');
                return;
            }

            try {
                // Import Firebase modules
                if (!window.firebase) {
                    throw new Error('Firebase SDK not loaded');
                }

                // Get auth and firestore instances
                this.auth = window.firebase.auth();
                this.firestore = window.firebase.firestore();

                // Wait for auth state
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Firebase auth timeout'));
                    }, 10000);

                    const unsubscribe = this.auth.onAuthStateChanged((user) => {
                        clearTimeout(timeout);
                        unsubscribe();
                        if (user) {
                            console.log('✅ Firebase authenticated:', user.uid);
                            resolve();
                        } else {
                            console.log('⚠️ No Firebase user - sync will be limited');
                            resolve(); // Still initialize, but syncs will fail until auth
                        }
                    });
                });

                this.initialized = true;
                console.log('✅ Firebase initialized');
            } catch (error) {
                console.error('❌ Firebase initialization failed:', error);
                throw error;
            }
        }

        /**
         * Sync single draft to Firebase
         * @param {Object} draft - Draft object from IndexedDB
         * @returns {Promise<Object>} Sync result
         */
        async syncDraftToFirebase(draft) {
            if (!this.initialized) {
                throw new Error('Firebase not initialized. Call init() first.');
            }

            const startTime = performance.now();
            this.metrics.totalSyncs++;

            // Check circuit breaker
            if (this.circuitState === 'OPEN') {
                if (this.shouldAttemptReset()) {
                    console.log('🔄 Circuit breaker: transitioning to HALF_OPEN');
                    this.circuitState = 'HALF_OPEN';
                } else {
                    const error = new Error('Circuit breaker is OPEN - sync rejected');
                    error.circuitOpen = true;
                    this.recordFailure(startTime);
                    throw error;
                }
            }

            // Validate user is authenticated
            const user = this.auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            // Add to active syncs
            this.activeSyncs.add(draft.essayId);

            try {
                const result = await this._executeSync(draft, user.uid);
                this.recordSuccess(performance.now() - startTime);
                return result;
            } catch (error) {
                this.recordFailure(performance.now() - startTime);
                throw error;
            } finally {
                this.activeSyncs.delete(draft.essayId);
            }
        }

        /**
         * Execute sync with retry logic
         * @private
         */
        async _executeSync(draft, userId) {
            let lastError = null;
            let attempt = 0;

            while (attempt <= this.config.maxRetries) {
                try {
                    if (attempt > 0) {
                        this.metrics.retriedSyncs++;
                        console.log(`🔄 Retry attempt ${attempt}/${this.config.maxRetries} for ${draft.essayId}`);
                    }

                    // Perform the actual Firebase upload
                    const result = await this._uploadToFirestore(draft, userId);

                    console.log(`✅ Synced to Firebase: ${draft.essayId} (v${draft.version})`);

                    this.emit('sync', {
                        essayId: draft.essayId,
                        version: draft.version,
                        timestamp: Date.now(),
                        result
                    });

                    return result;

                } catch (error) {
                    lastError = error;
                    attempt++;

                    console.warn(`⚠️ Sync failed (attempt ${attempt}/${this.config.maxRetries + 1}):`, error.message);

                    // Don't retry on certain errors
                    if (this.isNonRetryableError(error)) {
                        console.log('🚫 Non-retryable error, aborting');
                        break;
                    }

                    // If we have retries left, wait with exponential backoff
                    if (attempt <= this.config.maxRetries) {
                        const delay = this.calculateBackoffDelay(attempt);
                        console.log(`⏳ Waiting ${delay}ms before retry...`);
                        await this.sleep(delay);
                    }
                }
            }

            // All retries failed
            this.emit('error', {
                type: 'sync',
                essayId: draft.essayId,
                error: lastError
            });

            throw lastError || new Error('Sync failed after all retries');
        }

        /**
         * Upload draft to Firestore
         * @private
         */
        async _uploadToFirestore(draft, userId) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

            try {
                // Prepare document data
                const docData = {
                    userId,
                    essayId: draft.essayId,
                    content: draft.content,
                    essayTitle: draft.essayTitle || 'Untitled Essay',
                    wordCount: draft.wordCount,
                    version: draft.version,
                    timestamp: draft.timestamp,
                    syncedAt: Date.now(),
                    metadata: draft.metadata || {}
                };

                // Handle large essays with chunking
                if (draft.content.length > this.config.chunkSize) {
                    return await this._uploadLargeEssay(draft, userId, docData);
                }

                // Standard upload
                const docRef = this.firestore
                    .collection('users')
                    .doc(userId)
                    .collection('essays')
                    .doc(draft.essayId);

                // Use timeout race
                await Promise.race([
                    docRef.set(docData, { merge: true }),
                    new Promise((_, reject) => {
                        controller.signal.addEventListener('abort', () => {
                            reject(new Error('Firestore upload timeout'));
                        });
                    })
                ]);

                clearTimeout(timeoutId);

                return {
                    success: true,
                    essayId: draft.essayId,
                    firestorePath: docRef.path,
                    syncedAt: docData.syncedAt
                };

            } catch (error) {
                clearTimeout(timeoutId);

                if (error.message.includes('timeout')) {
                    error.timeout = true;
                }

                throw error;
            }
        }

        /**
         * Upload large essay in chunks
         * @private
         */
        async _uploadLargeEssay(draft, userId, baseDocData) {
            console.log(`📦 Uploading large essay: ${draft.essayId} (${draft.content.length} chars)`);

            const chunks = [];
            const content = draft.content;
            const chunkSize = this.config.chunkSize;

            // Split into chunks
            for (let i = 0; i < content.length; i += chunkSize) {
                chunks.push(content.substring(i, i + chunkSize));
            }

            // Upload main document without full content
            const mainDocRef = this.firestore
                .collection('users')
                .doc(userId)
                .collection('essays')
                .doc(draft.essayId);

            await mainDocRef.set({
                ...baseDocData,
                content: '', // Don't store full content in main doc
                isChunked: true,
                chunkCount: chunks.length
            }, { merge: true });

            // Upload chunks
            const chunkPromises = chunks.map((chunk, index) => {
                const chunkRef = mainDocRef.collection('chunks').doc(`chunk_${index}`);
                return chunkRef.set({
                    content: chunk,
                    chunkIndex: index,
                    timestamp: Date.now()
                });
            });

            await Promise.all(chunkPromises);

            console.log(`✅ Uploaded ${chunks.length} chunks for ${draft.essayId}`);

            return {
                success: true,
                essayId: draft.essayId,
                firestorePath: mainDocRef.path,
                chunked: true,
                chunkCount: chunks.length,
                syncedAt: baseDocData.syncedAt
            };
        }

        /**
         * Batch sync multiple drafts
         * @param {Array} drafts - Array of draft objects
         * @returns {Promise<Object>} Batch sync results
         */
        async syncBatch(drafts) {
            if (!this.initialized) {
                throw new Error('Firebase not initialized');
            }

            if (drafts.length === 0) {
                return { synced: 0, failed: 0, errors: [] };
            }

            console.log(`🔄 Batch syncing ${drafts.length} drafts...`);

            const results = {
                synced: 0,
                failed: 0,
                errors: []
            };

            // Process in batches to avoid overwhelming Firebase
            const batchSize = this.config.batchSize;
            for (let i = 0; i < drafts.length; i += batchSize) {
                const batch = drafts.slice(i, i + batchSize);

                const batchResults = await Promise.allSettled(
                    batch.map(draft => this.syncDraftToFirebase(draft))
                );

                batchResults.forEach((result, index) => {
                    if (result.status === 'fulfilled') {
                        results.synced++;
                    } else {
                        results.failed++;
                        results.errors.push({
                            essayId: batch[index].essayId,
                            error: result.reason.message
                        });
                    }
                });

                // Brief delay between batches
                if (i + batchSize < drafts.length) {
                    await this.sleep(100);
                }
            }

            console.log(`✅ Batch sync complete: ${results.synced} synced, ${results.failed} failed`);
            return results;
        }

        /**
         * Add draft to sync queue (background processing)
         * @param {Object} draft - Draft to queue
         */
        queueSync(draft) {
            this.syncQueue.set(draft.essayId, draft);

            this.emit('queued', {
                essayId: draft.essayId,
                queueSize: this.syncQueue.size
            });

            // Trigger background processing
            this._processSyncQueue();
        }

        /**
         * Process sync queue in background
         * @private
         */
        async _processSyncQueue() {
            if (this.isSyncing || this.syncQueue.size === 0) {
                return;
            }

            this.isSyncing = true;

            try {
                // Process queue in batches
                const draftsToSync = Array.from(this.syncQueue.values());
                this.syncQueue.clear();

                await this.syncBatch(draftsToSync);

            } catch (error) {
                console.error('❌ Queue processing error:', error);
            } finally {
                this.isSyncing = false;

                // Check if more items were added during processing
                if (this.syncQueue.size > 0) {
                    setTimeout(() => this._processSyncQueue(), 1000);
                }
            }
        }

        /**
         * Calculate exponential backoff delay
         * @private
         */
        calculateBackoffDelay(attempt) {
            const exponentialDelay = this.config.baseDelay * Math.pow(2, attempt - 1);
            const jitter = exponentialDelay * 0.2 * (Math.random() * 2 - 1);
            const delay = exponentialDelay + jitter;
            return Math.min(delay, this.config.maxDelay);
        }

        /**
         * Check if error should not be retried
         * @private
         */
        isNonRetryableError(error) {
            // Don't retry auth errors
            if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
                return true;
            }

            // Don't retry invalid data errors
            if (error.code === 'invalid-argument') {
                return true;
            }

            return false;
        }

        /**
         * Check if circuit breaker should attempt reset
         * @private
         */
        shouldAttemptReset() {
            if (this.circuitState !== 'OPEN') {
                return false;
            }

            const timeSinceFailure = Date.now() - this.lastFailureTime;
            return timeSinceFailure >= this.circuitBreakerTimeout;
        }

        /**
         * Record successful sync
         * @private
         */
        recordSuccess(latency) {
            this.metrics.successfulSyncs++;
            this.metrics.latencies.push(latency);

            // Keep only last 100 latencies
            if (this.metrics.latencies.length > 100) {
                this.metrics.latencies.shift();
            }

            // Update average latency
            this.metrics.averageLatency =
                this.metrics.latencies.reduce((a, b) => a + b, 0) / this.metrics.latencies.length;

            // Circuit breaker state management
            if (this.circuitState === 'HALF_OPEN') {
                console.log('✅ Circuit breaker: transitioning to CLOSED (sync succeeded)');
                this.circuitState = 'CLOSED';
                this.failureCount = 0;
            } else if (this.circuitState === 'CLOSED') {
                this.failureCount = 0;
            }

            console.log(`✅ Sync successful (${latency.toFixed(2)}ms) - Circuit: ${this.circuitState}`);
        }

        /**
         * Record failed sync
         * @private
         */
        recordFailure(latency) {
            this.metrics.failedSyncs++;
            this.failureCount++;
            this.lastFailureTime = Date.now();

            console.warn(`❌ Sync failed (${latency.toFixed(2)}ms) - Failures: ${this.failureCount}/${this.circuitBreakerThreshold}`);

            // Open circuit breaker if threshold exceeded
            if (this.failureCount >= this.circuitBreakerThreshold) {
                if (this.circuitState !== 'OPEN') {
                    console.error(`🔴 Circuit breaker OPEN - too many failures (${this.failureCount})`);
                    this.circuitState = 'OPEN';
                }
            }
        }

        /**
         * Sleep utility
         * @private
         */
        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        /**
         * Event emitter: Add listener
         */
        on(event, callback) {
            if (!this.listeners[event]) {
                throw new Error(`Unknown event: ${event}`);
            }
            this.listeners[event].push(callback);
        }

        /**
         * Event emitter: Remove listener
         */
        off(event, callback) {
            if (!this.listeners[event]) {
                throw new Error(`Unknown event: ${event}`);
            }
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }

        /**
         * Event emitter: Emit event
         * @private
         */
        emit(event, data) {
            if (!this.listeners[event]) {
                return;
            }

            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        }

        /**
         * Get performance metrics
         * @returns {Object} Metrics
         */
        getMetrics() {
            return {
                ...this.metrics,
                circuitState: this.circuitState,
                queueSize: this.syncQueue.size,
                activeSyncs: this.activeSyncs.size,
                successRate: this.metrics.totalSyncs > 0
                    ? (this.metrics.successfulSyncs / this.metrics.totalSyncs * 100).toFixed(2) + '%'
                    : 'N/A'
            };
        }

        /**
         * Reset circuit breaker manually
         */
        resetCircuitBreaker() {
            console.log('🔄 Circuit breaker manually reset');
            this.circuitState = 'CLOSED';
            this.failureCount = 0;
            this.lastFailureTime = null;
        }

        /**
         * Clear sync queue
         */
        clearQueue() {
            const size = this.syncQueue.size;
            this.syncQueue.clear();
            console.log(`🗑️ Cleared ${size} items from sync queue`);
        }
    }

    /**
     * Helper function to create sync function for AutosaveManager
     * @param {FirebaseSyncManager} syncManager - Initialized sync manager
     * @returns {Function} Sync function compatible with AutosaveManager
     */
    function createSyncFunction(syncManager) {
        return async (draft) => {
            if (!syncManager.initialized) {
                throw new Error('FirebaseSyncManager not initialized');
            }

            return await syncManager.syncDraftToFirebase(draft);
        };
    }

    /**
     * Helper function to setup automatic background sync
     * @param {AutosaveManager} autosaveManager - AutosaveManager instance
     * @param {FirebaseSyncManager} syncManager - FirebaseSyncManager instance
     */
    function setupAutoSync(autosaveManager, syncManager) {
        // Listen for save events and queue sync
        autosaveManager.on('save', (data) => {
            // Get the draft and queue it for sync
            autosaveManager.getDraft(data.essayId).then(draft => {
                if (draft && !draft.synced) {
                    console.log(`📤 Queueing draft for sync: ${data.essayId}`);
                    syncManager.queueSync(draft);
                }
            }).catch(error => {
                console.error('Error queueing sync:', error);
            });
        });

        // Listen for online/offline events
        window.addEventListener('online', async () => {
            console.log('🌐 Connection restored - syncing unsynced drafts...');

            try {
                const unsyncedDrafts = await autosaveManager.listDrafts({ synced: false });
                if (unsyncedDrafts.length > 0) {
                    await syncManager.syncBatch(unsyncedDrafts);

                    // Mark as synced in IndexedDB
                    for (const draft of unsyncedDrafts) {
                        await autosaveManager._markAsSynced(draft.essayId);
                    }
                }
            } catch (error) {
                console.error('Error syncing on reconnection:', error);
            }
        });

        console.log('✅ Auto-sync configured');
    }

    // Export to window
    window.FirebaseSyncManager = FirebaseSyncManager;
    window.createSyncFunction = createSyncFunction;
    window.setupAutoSync = setupAutoSync;

    console.log('📦 FirebaseSync module loaded');

})(window);
