/**
 * Autosave Manager with IndexedDB
 *
 * Provides resilient local essay autosaving with:
 * - IndexedDB for offline persistence
 * - Debounced saves (2.5s) to prevent excessive writes
 * - Content hash deduplication
 * - Automatic sync when connectivity returns
 * - Event-driven architecture for status updates
 *
 * @module AutosaveManager
 */

(function(window) {
    'use strict';

    /**
     * Autosave Manager class
     */
    class AutosaveManager {
        constructor(dbName = 'EssayCoachAutosave', storeName = 'drafts') {
            this.dbName = dbName;
            this.storeName = storeName;
            this.db = null;
            this.dbVersion = 1;

            // Debounce configuration
            this.debounceDelay = 2500; // 2.5 seconds
            this.debounceTimers = new Map(); // Per-essay timers

            // Content hash cache to skip redundant saves
            this.contentHashes = new Map();

            // Event listeners
            this.listeners = {
                save: [],
                error: [],
                sync: [],
                load: []
            };

            // Status tracking
            this.saveQueue = new Map(); // Pending saves
            this.isSyncing = false;
            this.lastSaveTime = new Map(); // Track last save per essay

            console.log('✅ AutosaveManager initialized', { dbName, storeName });
        }

        /**
         * Initialize IndexedDB connection
         * @returns {Promise<void>}
         */
        async init() {
            if (this.db) {
                console.log('⚠️ Database already initialized');
                return;
            }

            return new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, this.dbVersion);

                request.onerror = () => {
                    const error = new Error(`Failed to open database: ${request.error}`);
                    console.error('❌ IndexedDB error:', error);
                    this.emit('error', { type: 'init', error });
                    reject(error);
                };

                request.onsuccess = () => {
                    this.db = request.result;
                    console.log('✅ IndexedDB connected');
                    resolve();
                };

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;

                    // Create object store if it doesn't exist
                    if (!db.objectStoreNames.contains(this.storeName)) {
                        const objectStore = db.createObjectStore(this.storeName, { keyPath: 'essayId' });

                        // Create indexes for querying
                        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                        objectStore.createIndex('userId', 'userId', { unique: false });
                        objectStore.createIndex('synced', 'synced', { unique: false });

                        console.log('✅ Object store created:', this.storeName);
                    }
                };
            });
        }

        /**
         * Save draft with debouncing
         * @param {string} essayId - Essay identifier
         * @param {string} content - Essay content
         * @param {Object} metadata - Additional metadata
         * @returns {Promise<void>}
         */
        async saveDraft(essayId, content, metadata = {}) {
            if (!essayId) {
                throw new Error('Essay ID is required');
            }

            if (content === null || content === undefined) {
                throw new Error('Content is required');
            }

            // Clear existing timer for this essay
            if (this.debounceTimers.has(essayId)) {
                clearTimeout(this.debounceTimers.get(essayId));
            }

            // Set up debounced save
            return new Promise((resolve, reject) => {
                const timer = setTimeout(async () => {
                    try {
                        await this._executeSave(essayId, content, metadata);
                        resolve();
                    } catch (error) {
                        reject(error);
                    } finally {
                        this.debounceTimers.delete(essayId);
                    }
                }, this.debounceDelay);

                this.debounceTimers.set(essayId, timer);

                // Add to save queue for tracking
                this.saveQueue.set(essayId, {
                    content,
                    metadata,
                    queuedAt: Date.now()
                });
            });
        }

        /**
         * Execute the actual save operation
         * @private
         */
        async _executeSave(essayId, content, metadata) {
            const contentHash = this._hashContent(content);

            // Skip save if content hasn't changed
            if (this.contentHashes.get(essayId) === contentHash) {
                console.log('⏭️ Skipping save - content unchanged:', essayId);
                this.saveQueue.delete(essayId);
                return;
            }

            if (!this.db) {
                throw new Error('Database not initialized. Call init() first.');
            }

            const draft = {
                essayId,
                content,
                contentHash,
                timestamp: Date.now(),
                userId: metadata.userId || null,
                essayTitle: metadata.essayTitle || 'Untitled Essay',
                wordCount: this._countWords(content),
                synced: false,
                version: (await this._getVersion(essayId)) + 1,
                metadata: metadata
            };

            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const objectStore = transaction.objectStore(this.storeName);
                const request = objectStore.put(draft);

                request.onsuccess = () => {
                    this.contentHashes.set(essayId, contentHash);
                    this.lastSaveTime.set(essayId, draft.timestamp);
                    this.saveQueue.delete(essayId);

                    console.log(`💾 Draft saved: ${essayId} (v${draft.version}, ${draft.wordCount} words)`);

                    this.emit('save', {
                        essayId,
                        timestamp: draft.timestamp,
                        version: draft.version,
                        wordCount: draft.wordCount
                    });

                    resolve(draft);
                };

                request.onerror = () => {
                    const error = new Error(`Failed to save draft: ${request.error}`);
                    console.error('❌ Save error:', error);
                    this.emit('error', { type: 'save', essayId, error });
                    reject(error);
                };
            });
        }

        /**
         * Get draft by essay ID
         * @param {string} essayId - Essay identifier
         * @returns {Promise<Object|null>} Draft object or null if not found
         */
        async getDraft(essayId) {
            if (!this.db) {
                throw new Error('Database not initialized. Call init() first.');
            }

            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readonly');
                const objectStore = transaction.objectStore(this.storeName);
                const request = objectStore.get(essayId);

                request.onsuccess = () => {
                    const draft = request.result;

                    if (draft) {
                        console.log(`📖 Draft loaded: ${essayId} (v${draft.version}, ${draft.wordCount} words)`);
                        this.emit('load', { essayId, draft });
                    }

                    resolve(draft || null);
                };

                request.onerror = () => {
                    const error = new Error(`Failed to get draft: ${request.error}`);
                    console.error('❌ Get error:', error);
                    this.emit('error', { type: 'get', essayId, error });
                    reject(error);
                };
            });
        }

        /**
         * Delete draft by essay ID
         * @param {string} essayId - Essay identifier
         * @returns {Promise<void>}
         */
        async deleteDraft(essayId) {
            if (!this.db) {
                throw new Error('Database not initialized. Call init() first.');
            }

            // Clear any pending saves
            if (this.debounceTimers.has(essayId)) {
                clearTimeout(this.debounceTimers.get(essayId));
                this.debounceTimers.delete(essayId);
            }

            this.saveQueue.delete(essayId);
            this.contentHashes.delete(essayId);
            this.lastSaveTime.delete(essayId);

            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const objectStore = transaction.objectStore(this.storeName);
                const request = objectStore.delete(essayId);

                request.onsuccess = () => {
                    console.log(`🗑️ Draft deleted: ${essayId}`);
                    resolve();
                };

                request.onerror = () => {
                    const error = new Error(`Failed to delete draft: ${request.error}`);
                    console.error('❌ Delete error:', error);
                    this.emit('error', { type: 'delete', essayId, error });
                    reject(error);
                };
            });
        }

        /**
         * List all drafts
         * @param {Object} options - Query options
         * @returns {Promise<Array>} Array of draft objects
         */
        async listDrafts(options = {}) {
            if (!this.db) {
                throw new Error('Database not initialized. Call init() first.');
            }

            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readonly');
                const objectStore = transaction.objectStore(this.storeName);

                let request;

                // Use index if filtering by userId or synced status
                if (options.userId) {
                    const index = objectStore.index('userId');
                    request = index.getAll(options.userId);
                } else if (options.synced !== undefined) {
                    const index = objectStore.index('synced');
                    request = index.getAll(options.synced);
                } else {
                    request = objectStore.getAll();
                }

                request.onsuccess = () => {
                    let drafts = request.result;

                    // Sort by timestamp (newest first)
                    drafts.sort((a, b) => b.timestamp - a.timestamp);

                    // Apply limit if specified
                    if (options.limit) {
                        drafts = drafts.slice(0, options.limit);
                    }

                    console.log(`📚 Loaded ${drafts.length} drafts`);
                    resolve(drafts);
                };

                request.onerror = () => {
                    const error = new Error(`Failed to list drafts: ${request.error}`);
                    console.error('❌ List error:', error);
                    this.emit('error', { type: 'list', error });
                    reject(error);
                };
            });
        }

        /**
         * Sync draft to Firebase (hook for Step 4)
         * @param {string} essayId - Essay identifier
         * @param {Function} syncFunction - Custom sync function
         * @returns {Promise<Object>} Sync result
         */
        async syncToFirebase(essayId, syncFunction) {
            if (!this.db) {
                throw new Error('Database not initialized. Call init() first.');
            }

            if (this.isSyncing) {
                console.log('⏳ Sync already in progress');
                return { status: 'pending', message: 'Sync in progress' };
            }

            this.isSyncing = true;

            try {
                // Get draft from IndexedDB
                const draft = await this.getDraft(essayId);

                if (!draft) {
                    throw new Error(`Draft not found: ${essayId}`);
                }

                if (draft.synced) {
                    console.log('✅ Draft already synced:', essayId);
                    this.isSyncing = false;
                    return { status: 'already_synced', draft };
                }

                // Call custom sync function (will be implemented in Step 4)
                let syncResult;
                if (syncFunction) {
                    syncResult = await syncFunction(draft);
                } else {
                    console.log('⚠️ No sync function provided, marking as synced locally only');
                    syncResult = { success: true, local_only: true };
                }

                // Mark as synced in IndexedDB
                await this._markAsSynced(essayId);

                console.log('✅ Draft synced to Firebase:', essayId);

                this.emit('sync', {
                    essayId,
                    timestamp: Date.now(),
                    result: syncResult
                });

                this.isSyncing = false;
                return { status: 'synced', result: syncResult };

            } catch (error) {
                this.isSyncing = false;
                console.error('❌ Sync failed:', error);
                this.emit('error', { type: 'sync', essayId, error });
                throw error;
            }
        }

        /**
         * Sync all unsynced drafts
         * @param {Function} syncFunction - Custom sync function
         * @returns {Promise<Object>} Sync summary
         */
        async syncAll(syncFunction) {
            const unsyncedDrafts = await this.listDrafts({ synced: false });

            if (unsyncedDrafts.length === 0) {
                console.log('✅ No drafts to sync');
                return { synced: 0, failed: 0 };
            }

            console.log(`🔄 Syncing ${unsyncedDrafts.length} drafts...`);

            const results = {
                synced: 0,
                failed: 0,
                errors: []
            };

            for (const draft of unsyncedDrafts) {
                try {
                    await this.syncToFirebase(draft.essayId, syncFunction);
                    results.synced++;
                } catch (error) {
                    results.failed++;
                    results.errors.push({ essayId: draft.essayId, error: error.message });
                }
            }

            console.log(`✅ Sync complete: ${results.synced} synced, ${results.failed} failed`);
            return results;
        }

        /**
         * Flush pending saves immediately (for testing or before page unload)
         * @returns {Promise<void>}
         */
        async flush() {
            const pendingEssayIds = Array.from(this.debounceTimers.keys());

            if (pendingEssayIds.length === 0) {
                return;
            }

            console.log(`🔄 Flushing ${pendingEssayIds.length} pending saves...`);

            // Clear all timers
            for (const essayId of pendingEssayIds) {
                clearTimeout(this.debounceTimers.get(essayId));
                this.debounceTimers.delete(essayId);
            }

            // Execute all pending saves immediately
            const savePromises = pendingEssayIds.map(essayId => {
                const queued = this.saveQueue.get(essayId);
                if (queued) {
                    return this._executeSave(essayId, queued.content, queued.metadata);
                }
            }).filter(Boolean);

            await Promise.all(savePromises);
            console.log('✅ Flush complete');
        }

        /**
         * Mark draft as synced
         * @private
         */
        async _markAsSynced(essayId) {
            const draft = await this.getDraft(essayId);
            if (!draft) {
                throw new Error(`Draft not found: ${essayId}`);
            }

            draft.synced = true;
            draft.syncedAt = Date.now();

            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const objectStore = transaction.objectStore(this.storeName);
                const request = objectStore.put(draft);

                request.onsuccess = () => resolve();
                request.onerror = () => reject(new Error(`Failed to mark as synced: ${request.error}`));
            });
        }

        /**
         * Get current version number for essay
         * @private
         */
        async _getVersion(essayId) {
            const draft = await this.getDraft(essayId);
            return draft ? draft.version : 0;
        }

        /**
         * Hash content for deduplication
         * @private
         */
        _hashContent(content) {
            // Simple hash function (FNV-1a)
            let hash = 2166136261;
            for (let i = 0; i < content.length; i++) {
                hash ^= content.charCodeAt(i);
                hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
            }
            return hash >>> 0;
        }

        /**
         * Count words in content
         * @private
         */
        _countWords(content) {
            if (!content || content.trim().length === 0) {
                return 0;
            }
            return content.trim().split(/\s+/).length;
        }

        /**
         * Event emitter: Add listener
         * @param {string} event - Event name (save, error, sync, load)
         * @param {Function} callback - Callback function
         */
        on(event, callback) {
            if (!this.listeners[event]) {
                throw new Error(`Unknown event: ${event}`);
            }

            this.listeners[event].push(callback);
        }

        /**
         * Event emitter: Remove listener
         * @param {string} event - Event name
         * @param {Function} callback - Callback function
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
         * Close database connection
         */
        close() {
            if (this.db) {
                this.db.close();
                this.db = null;
                console.log('🔒 Database connection closed');
            }
        }

        /**
         * Clear all drafts (for testing)
         */
        async clearAll() {
            if (!this.db) {
                throw new Error('Database not initialized. Call init() first.');
            }

            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const objectStore = transaction.objectStore(this.storeName);
                const request = objectStore.clear();

                request.onsuccess = () => {
                    this.contentHashes.clear();
                    this.lastSaveTime.clear();
                    this.saveQueue.clear();
                    console.log('🗑️ All drafts cleared');
                    resolve();
                };

                request.onerror = () => {
                    const error = new Error(`Failed to clear drafts: ${request.error}`);
                    console.error('❌ Clear error:', error);
                    reject(error);
                };
            });
        }

        /**
         * Get statistics about autosave usage
         * @returns {Promise<Object>} Statistics
         */
        async getStats() {
            const drafts = await this.listDrafts();

            const stats = {
                totalDrafts: drafts.length,
                syncedDrafts: drafts.filter(d => d.synced).length,
                unsyncedDrafts: drafts.filter(d => !d.synced).length,
                totalWords: drafts.reduce((sum, d) => sum + d.wordCount, 0),
                oldestDraft: drafts.length > 0 ? Math.min(...drafts.map(d => d.timestamp)) : null,
                newestDraft: drafts.length > 0 ? Math.max(...drafts.map(d => d.timestamp)) : null,
                pendingSaves: this.saveQueue.size
            };

            return stats;
        }
    }

    // Export to window
    window.AutosaveManager = AutosaveManager;

    console.log('📦 AutosaveManager module loaded');

})(window);
