/**
 * Tests for AutosaveManager with IndexedDB
 */

// Polyfill for structuredClone (required by fake-indexeddb)
if (typeof structuredClone === 'undefined') {
    global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Mock IndexedDB for Node environment
require('fake-indexeddb/auto');

describe('AutosaveManager', () => {
    let AutosaveManager;
    let manager;

    beforeAll(() => {
        // Load module
        const fs = require('fs');
        const path = require('path');
        const moduleCode = fs.readFileSync(
            path.join(__dirname, '../public/js/autosave-manager.js'),
            'utf8'
        );

        // Create mock window
        const mockWindow = {};
        const func = new Function('window', moduleCode + '; return window;');
        const result = func(mockWindow);

        AutosaveManager = result.AutosaveManager || mockWindow.AutosaveManager;

        if (!AutosaveManager) {
            throw new Error('AutosaveManager not loaded');
        }
    });

    beforeEach(async () => {
        // Create fresh manager instance with unique DB name per test
        const dbName = `TestDB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        manager = new AutosaveManager(dbName, 'drafts');
        await manager.init();
    });

    afterEach(async () => {
        if (manager && manager.db) {
            await manager.clearAll();
            manager.close();
        }
    });

    describe('Initialization', () => {
        test('creates instance with default config', () => {
            const mgr = new AutosaveManager();
            expect(mgr.dbName).toBe('EssayCoachAutosave');
            expect(mgr.storeName).toBe('drafts');
            expect(mgr.debounceDelay).toBe(2500);
        });

        test('creates instance with custom config', () => {
            const mgr = new AutosaveManager('CustomDB', 'customStore');
            expect(mgr.dbName).toBe('CustomDB');
            expect(mgr.storeName).toBe('customStore');
        });

        test('initializes IndexedDB connection', async () => {
            expect(manager.db).toBeTruthy();
            expect(manager.db.name).toContain('TestDB_');
        });

        test('prevents double initialization', async () => {
            const firstDb = manager.db;
            await manager.init();
            expect(manager.db).toBe(firstDb);
        });
    });

    describe('Draft CRUD operations', () => {
        test('saves and retrieves draft', async () => {
            const essayId = 'essay-001';
            const content = 'This is my test essay.';

            // Save with immediate flush
            const savePromise = manager.saveDraft(essayId, content, { userId: 'user-123' });
            await manager.flush();
            await savePromise;

            const draft = await manager.getDraft(essayId);

            expect(draft).toBeTruthy();
            expect(draft.essayId).toBe(essayId);
            expect(draft.content).toBe(content);
            expect(draft.userId).toBe('user-123');
            expect(draft.wordCount).toBe(5);
            expect(draft.synced).toBe(false);
            expect(draft.version).toBe(1);
        });

        test('returns null for non-existent draft', async () => {
            const draft = await manager.getDraft('non-existent');
            expect(draft).toBeNull();
        });

        test('deletes draft', async () => {
            const essayId = 'essay-002';

            const savePromise = manager.saveDraft(essayId, 'Content to delete');
            await manager.flush();
            await savePromise;

            let draft = await manager.getDraft(essayId);
            expect(draft).toBeTruthy();

            await manager.deleteDraft(essayId);

            draft = await manager.getDraft(essayId);
            expect(draft).toBeNull();
        });

        test('increments version on each save', async () => {
            const essayId = 'essay-003';

            // First save
            const save1 = manager.saveDraft(essayId, 'Version 1');
            await manager.flush();
            await save1;

            let draft = await manager.getDraft(essayId);
            expect(draft.version).toBe(1);

            // Second save
            const save2 = manager.saveDraft(essayId, 'Version 2');
            await manager.flush();
            await save2;

            draft = await manager.getDraft(essayId);
            expect(draft.version).toBe(2);

            // Third save
            const save3 = manager.saveDraft(essayId, 'Version 3');
            await manager.flush();
            await save3;

            draft = await manager.getDraft(essayId);
            expect(draft.version).toBe(3);
        });

        test('calculates word count correctly', async () => {
            const testCases = [
                { content: '', words: 0 },
                { content: 'Hello', words: 1 },
                { content: 'Hello world', words: 2 },
                { content: 'This is a test essay.', words: 5 },
                { content: '  Multiple   spaces   between   words  ', words: 4 }
            ];

            for (let i = 0; i < testCases.length; i++) {
                const essayId = `essay-wordcount-${i}`;
                const { content, words } = testCases[i];

                const savePromise = manager.saveDraft(essayId, content);
                await manager.flush();
                await savePromise;

                const draft = await manager.getDraft(essayId);
                expect(draft.wordCount).toBe(words);
            }
        });
    });

    describe('Debouncing', () => {
        test('debounces rapid saves', async () => {
            const essayId = 'essay-debounce';

            // Trigger multiple saves rapidly
            manager.saveDraft(essayId, 'First');
            manager.saveDraft(essayId, 'Second');
            manager.saveDraft(essayId, 'Third');
            const finalSave = manager.saveDraft(essayId, 'Final version');

            // Flush to execute immediately
            await manager.flush();
            await finalSave;

            const draft = await manager.getDraft(essayId);

            // Only the last save should be executed
            expect(draft.content).toBe('Final version');
            expect(draft.version).toBe(1); // Only one actual save
        });

        test('waits for debounce delay before saving', async () => {
            // Use shorter delay for testing
            manager.debounceDelay = 100;

            const essayId = 'essay-delay';
            const startTime = Date.now();

            manager.saveDraft(essayId, 'Content');

            // Don't flush - wait for natural debounce
            await new Promise(resolve => setTimeout(resolve, 150));

            const elapsed = Date.now() - startTime;
            expect(elapsed).toBeGreaterThanOrEqual(100);

            const draft = await manager.getDraft(essayId);
            expect(draft).toBeTruthy();
        });

        test('clears pending timer on delete', async () => {
            const essayId = 'essay-clear-timer';

            // Start a save but don't flush
            manager.saveDraft(essayId, 'Content');

            expect(manager.debounceTimers.has(essayId)).toBe(true);

            await manager.deleteDraft(essayId);

            expect(manager.debounceTimers.has(essayId)).toBe(false);
            expect(manager.saveQueue.has(essayId)).toBe(false);
        });
    });

    describe('Content deduplication', () => {
        test('skips save if content unchanged', async () => {
            const essayId = 'essay-dedup';
            const content = 'Unchanged content';

            // First save
            const save1 = manager.saveDraft(essayId, content);
            await manager.flush();
            await save1;

            const draft1 = await manager.getDraft(essayId);
            expect(draft1.version).toBe(1);

            // Second save with same content
            const save2 = manager.saveDraft(essayId, content);
            await manager.flush();
            await save2;

            const draft2 = await manager.getDraft(essayId);
            // Version should still be 1 (no actual save)
            expect(draft2.version).toBe(1);
        });

        test('saves if content changed', async () => {
            const essayId = 'essay-changed';

            const save1 = manager.saveDraft(essayId, 'Original content');
            await manager.flush();
            await save1;

            const save2 = manager.saveDraft(essayId, 'Modified content');
            await manager.flush();
            await save2;

            const draft = await manager.getDraft(essayId);
            expect(draft.version).toBe(2);
            expect(draft.content).toBe('Modified content');
        });
    });

    describe('List drafts', () => {
        test('lists all drafts', async () => {
            // Create multiple drafts
            const saves = [
                manager.saveDraft('essay-1', 'Essay 1'),
                manager.saveDraft('essay-2', 'Essay 2'),
                manager.saveDraft('essay-3', 'Essay 3')
            ];

            await manager.flush();
            await Promise.all(saves);

            const drafts = await manager.listDrafts();
            expect(drafts.length).toBe(3);
        });

        test('sorts drafts by timestamp (newest first)', async () => {
            // Create drafts with delays to ensure different timestamps
            const save1 = manager.saveDraft('essay-old', 'Old');
            await manager.flush();
            await save1;

            await new Promise(resolve => setTimeout(resolve, 10));

            const save2 = manager.saveDraft('essay-new', 'New');
            await manager.flush();
            await save2;

            const drafts = await manager.listDrafts();

            expect(drafts[0].essayId).toBe('essay-new');
            expect(drafts[1].essayId).toBe('essay-old');
        });

        test('filters by userId', async () => {
            const saves = [
                manager.saveDraft('essay-1', 'Content 1', { userId: 'user-A' }),
                manager.saveDraft('essay-2', 'Content 2', { userId: 'user-B' }),
                manager.saveDraft('essay-3', 'Content 3', { userId: 'user-A' })
            ];

            await manager.flush();
            await Promise.all(saves);

            const draftsForUserA = await manager.listDrafts({ userId: 'user-A' });
            expect(draftsForUserA.length).toBe(2);
            expect(draftsForUserA.every(d => d.userId === 'user-A')).toBe(true);
        });

        test('filters by synced status', async () => {
            const save1 = manager.saveDraft('essay-1', 'Content 1');
            await manager.flush();
            await save1;

            const save2 = manager.saveDraft('essay-2', 'Content 2');
            await manager.flush();
            await save2;

            // Mark one as synced
            await manager._markAsSynced('essay-1');

            const unsynced = await manager.listDrafts({ synced: false });
            expect(unsynced.length).toBe(1);
            expect(unsynced[0].essayId).toBe('essay-2');

            const synced = await manager.listDrafts({ synced: true });
            expect(synced.length).toBe(1);
            expect(synced[0].essayId).toBe('essay-1');
        });

        test('applies limit', async () => {
            const saves = Array.from({ length: 10 }, (_, i) =>
                manager.saveDraft(`essay-${i}`, `Content ${i}`)
            );

            await manager.flush();
            await Promise.all(saves);

            const limited = await manager.listDrafts({ limit: 3 });
            expect(limited.length).toBe(3);
        });
    });

    describe('Sync functionality', () => {
        test('syncs draft to Firebase with custom function', async () => {
            const essayId = 'essay-sync';

            const save = manager.saveDraft(essayId, 'Content to sync');
            await manager.flush();
            await save;

            const mockSyncFn = jest.fn(async (draft) => {
                return { success: true, firebaseId: 'fb-123' };
            });

            const result = await manager.syncToFirebase(essayId, mockSyncFn);

            expect(result.status).toBe('synced');
            expect(mockSyncFn).toHaveBeenCalledTimes(1);

            const draft = await manager.getDraft(essayId);
            expect(draft.synced).toBe(true);
            expect(draft.syncedAt).toBeTruthy();
        });

        test('skips already synced drafts', async () => {
            const essayId = 'essay-already-synced';

            const save = manager.saveDraft(essayId, 'Content');
            await manager.flush();
            await save;

            const mockSyncFn = jest.fn(async () => ({ success: true }));

            // First sync
            await manager.syncToFirebase(essayId, mockSyncFn);

            // Second sync should skip
            const result = await manager.syncToFirebase(essayId, mockSyncFn);

            expect(result.status).toBe('already_synced');
            expect(mockSyncFn).toHaveBeenCalledTimes(1); // Only once
        });

        test('syncs all unsynced drafts', async () => {
            const saves = [
                manager.saveDraft('essay-1', 'Content 1'),
                manager.saveDraft('essay-2', 'Content 2'),
                manager.saveDraft('essay-3', 'Content 3')
            ];

            await manager.flush();
            await Promise.all(saves);

            const mockSyncFn = jest.fn(async () => ({ success: true }));

            const results = await manager.syncAll(mockSyncFn);

            expect(results.synced).toBe(3);
            expect(results.failed).toBe(0);
            expect(mockSyncFn).toHaveBeenCalledTimes(3);
        });

        test('handles sync errors gracefully', async () => {
            const essayId = 'essay-sync-error';

            const save = manager.saveDraft(essayId, 'Content');
            await manager.flush();
            await save;

            const mockSyncFn = jest.fn(async () => {
                throw new Error('Network error');
            });

            await expect(
                manager.syncToFirebase(essayId, mockSyncFn)
            ).rejects.toThrow('Network error');

            const draft = await manager.getDraft(essayId);
            expect(draft.synced).toBe(false);
        });

        test('tracks sync failures in syncAll', async () => {
            const saves = [
                manager.saveDraft('essay-1', 'Content 1'),
                manager.saveDraft('essay-2', 'Content 2')
            ];

            await manager.flush();
            await Promise.all(saves);

            let callCount = 0;
            const mockSyncFn = jest.fn(async (draft) => {
                callCount++;
                if (callCount === 1) {
                    throw new Error('Sync failed');
                }
                return { success: true };
            });

            const results = await manager.syncAll(mockSyncFn);

            expect(results.synced).toBe(1);
            expect(results.failed).toBe(1);
            expect(results.errors.length).toBe(1);
        });
    });

    describe('Event system', () => {
        test('emits save event', async () => {
            const saveListener = jest.fn();
            manager.on('save', saveListener);

            const essayId = 'essay-event';
            const save = manager.saveDraft(essayId, 'Content');
            await manager.flush();
            await save;

            expect(saveListener).toHaveBeenCalledTimes(1);
            expect(saveListener).toHaveBeenCalledWith(
                expect.objectContaining({
                    essayId,
                    version: 1,
                    wordCount: 1
                })
            );
        });

        test('emits load event', async () => {
            const loadListener = jest.fn();
            manager.on('load', loadListener);

            const essayId = 'essay-load-event';
            const save = manager.saveDraft(essayId, 'Content');
            await manager.flush();
            await save;

            await manager.getDraft(essayId);

            expect(loadListener).toHaveBeenCalledTimes(1);
        });

        test('emits sync event', async () => {
            const syncListener = jest.fn();
            manager.on('sync', syncListener);

            const essayId = 'essay-sync-event';
            const save = manager.saveDraft(essayId, 'Content');
            await manager.flush();
            await save;

            await manager.syncToFirebase(essayId, async () => ({ success: true }));

            expect(syncListener).toHaveBeenCalledTimes(1);
        });

        test('emits error event', async () => {
            const errorListener = jest.fn();
            manager.on('error', errorListener);

            const essayId = 'essay-error-event';
            const save = manager.saveDraft(essayId, 'Content');
            await manager.flush();
            await save;

            const mockSyncFn = async () => { throw new Error('Sync error'); };

            try {
                await manager.syncToFirebase(essayId, mockSyncFn);
            } catch (e) {
                // Expected
            }

            expect(errorListener).toHaveBeenCalledTimes(1);
            expect(errorListener).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'sync',
                    essayId
                })
            );
        });

        test('removes event listener', async () => {
            const listener = jest.fn();
            manager.on('save', listener);

            manager.off('save', listener);

            const save = manager.saveDraft('essay-off', 'Content');
            await manager.flush();
            await save;

            expect(listener).not.toHaveBeenCalled();
        });

        test('throws error for unknown event', () => {
            expect(() => {
                manager.on('unknown', () => {});
            }).toThrow('Unknown event: unknown');
        });
    });

    describe('Flush functionality', () => {
        test('flushes all pending saves', async () => {
            manager.saveDraft('essay-1', 'Content 1');
            manager.saveDraft('essay-2', 'Content 2');
            manager.saveDraft('essay-3', 'Content 3');

            expect(manager.saveQueue.size).toBe(3);

            await manager.flush();

            expect(manager.saveQueue.size).toBe(0);

            const drafts = await manager.listDrafts();
            expect(drafts.length).toBe(3);
        });

        test('handles empty flush gracefully', async () => {
            await expect(manager.flush()).resolves.not.toThrow();
        });
    });

    describe('Statistics', () => {
        test('returns correct statistics', async () => {
            const saves = [
                manager.saveDraft('essay-1', 'Hello world'),
                manager.saveDraft('essay-2', 'This is a longer essay with more words'),
                manager.saveDraft('essay-3', 'Short')
            ];

            await manager.flush();
            await Promise.all(saves);

            // Mark one as synced
            await manager._markAsSynced('essay-1');

            const stats = await manager.getStats();

            expect(stats.totalDrafts).toBe(3);
            expect(stats.syncedDrafts).toBe(1);
            expect(stats.unsyncedDrafts).toBe(2);
            expect(stats.totalWords).toBe(11); // 2 + 8 + 1
            expect(stats.oldestDraft).toBeLessThanOrEqual(stats.newestDraft);
        });

        test('returns empty stats for no drafts', async () => {
            const stats = await manager.getStats();

            expect(stats.totalDrafts).toBe(0);
            expect(stats.syncedDrafts).toBe(0);
            expect(stats.unsyncedDrafts).toBe(0);
            expect(stats.totalWords).toBe(0);
            expect(stats.oldestDraft).toBeNull();
            expect(stats.newestDraft).toBeNull();
        });
    });

    describe('Edge cases', () => {
        test('throws error when saving without essayId', async () => {
            await expect(
                manager.saveDraft('', 'Content')
            ).rejects.toThrow('Essay ID is required');

            await expect(
                manager.saveDraft(null, 'Content')
            ).rejects.toThrow('Essay ID is required');
        });

        test('throws error when saving without content', async () => {
            await expect(
                manager.saveDraft('essay-1', null)
            ).rejects.toThrow('Content is required');

            await expect(
                manager.saveDraft('essay-1', undefined)
            ).rejects.toThrow('Content is required');
        });

        test('handles large essay content', async () => {
            const essayId = 'essay-large';
            const largeContent = 'word '.repeat(10000); // 10,000 words

            const save = manager.saveDraft(essayId, largeContent);
            await manager.flush();
            await save;

            const draft = await manager.getDraft(essayId);

            expect(draft).toBeTruthy();
            expect(draft.wordCount).toBe(10000);
            expect(draft.content.length).toBeGreaterThan(40000);
        });

        test('handles special characters in content', async () => {
            const essayId = 'essay-special';
            const specialContent = 'Test with émojis 🎓📚 and spëcial çharacters!';

            const save = manager.saveDraft(essayId, specialContent);
            await manager.flush();
            await save;

            const draft = await manager.getDraft(essayId);

            expect(draft.content).toBe(specialContent);
        });

        test('handles concurrent operations', async () => {
            // Start multiple operations concurrently
            const operations = [
                manager.saveDraft('essay-1', 'Content 1'),
                manager.saveDraft('essay-2', 'Content 2'),
                manager.saveDraft('essay-3', 'Content 3')
            ];

            await manager.flush();
            await Promise.all(operations);

            const drafts = await manager.listDrafts();
            expect(drafts.length).toBe(3);
        });

        test('database operations fail gracefully when not initialized', async () => {
            const uninitializedMgr = new AutosaveManager('Uninitialized');

            await expect(
                uninitializedMgr.getDraft('essay-1')
            ).rejects.toThrow('Database not initialized');

            await expect(
                uninitializedMgr.listDrafts()
            ).rejects.toThrow('Database not initialized');
        });
    });

    describe('Cleanup', () => {
        test('clears all drafts', async () => {
            const saves = [
                manager.saveDraft('essay-1', 'Content 1'),
                manager.saveDraft('essay-2', 'Content 2')
            ];

            await manager.flush();
            await Promise.all(saves);

            let drafts = await manager.listDrafts();
            expect(drafts.length).toBe(2);

            await manager.clearAll();

            drafts = await manager.listDrafts();
            expect(drafts.length).toBe(0);
        });

        test('closes database connection', () => {
            const db = manager.db;
            expect(db).toBeTruthy();

            manager.close();

            expect(manager.db).toBeNull();
        });
    });
});
