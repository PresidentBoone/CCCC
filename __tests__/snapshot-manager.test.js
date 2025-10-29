/**
 * Tests for SnapshotManager with Undo/Redo System
 */

// Polyfill for structuredClone
if (typeof structuredClone === 'undefined') {
    global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Mock IndexedDB
require('fake-indexeddb/auto');

describe('SnapshotManager', () => {
    let SnapshotManager, Snapshot, setupKeyboardShortcuts, setupAutoSnapshot;
    let manager;

    beforeAll(() => {
        // Load module
        const fs = require('fs');
        const path = require('path');
        const moduleCode = fs.readFileSync(
            path.join(__dirname, '../public/js/snapshot-manager.js'),
            'utf8'
        );

        // Mock window and document
        const mockWindow = {
            performance: global.performance
        };

        global.document = {
            addEventListener: jest.fn()
        };

        const func = new Function('window', moduleCode + '; return window;');
        const result = func(mockWindow);

        SnapshotManager = result.SnapshotManager;
        Snapshot = result.Snapshot;
        setupKeyboardShortcuts = result.setupKeyboardShortcuts;
        setupAutoSnapshot = result.setupAutoSnapshot;

        if (!SnapshotManager) {
            throw new Error('SnapshotManager not loaded');
        }
    });

    beforeEach(async () => {
        // Create fresh manager with unique DB
        const dbName = `TestSnapshots_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        manager = new SnapshotManager(dbName, 'snapshots');
        await manager.init();
    });

    afterEach(async () => {
        if (manager && manager.db) {
            manager.close();
        }
    });

    describe('Initialization', () => {
        test('creates instance with default config', () => {
            expect(manager.dbName).toContain('TestSnapshots_');
            expect(manager.config.maxSnapshotsPerEssay).toBe(50);
            expect(manager.config.minEditDistance).toBe(10);
        });

        test('initializes IndexedDB connection', () => {
            expect(manager.db).toBeTruthy();
        });

        test('prevents double initialization', async () => {
            const firstDb = manager.db;
            await manager.init();
            expect(manager.db).toBe(firstDb);
        });
    });

    describe('Snapshot class', () => {
        test('creates snapshot with required fields', () => {
            const snapshot = new Snapshot({
                essayId: 'essay-001',
                content: 'Test content',
                timestamp: Date.now()
            });

            expect(snapshot.snapshotId).toBeTruthy();
            expect(snapshot.essayId).toBe('essay-001');
            expect(snapshot.content).toBe('Test content');
            expect(snapshot.wordCount).toBe(2);
        });

        test('calculates word count correctly', () => {
            const snapshot = new Snapshot({
                essayId: 'essay-001',
                content: 'This is a test essay with multiple words.'
            });

            expect(snapshot.wordCount).toBe(8);
        });

        test('generates unique snapshot IDs', () => {
            const s1 = new Snapshot({ essayId: 'e1', content: 'a' });
            const s2 = new Snapshot({ essayId: 'e1', content: 'b' });

            expect(s1.snapshotId).not.toBe(s2.snapshotId);
        });
    });

    describe('Delta calculation', () => {
        test('calculates full delta for new content', () => {
            const delta = Snapshot.calculateDelta(null, 'New content');

            expect(delta.type).toBe('full');
            expect(delta.content).toBe('New content');
        });

        test('calculates delta for appended text', () => {
            const oldContent = 'Hello world';
            const newContent = 'Hello world!';

            const delta = Snapshot.calculateDelta(oldContent, newContent);

            expect(delta.type).toBe('delta');
            expect(delta.prefix).toBe(11);
            expect(delta.added).toBe('!');
            expect(delta.removed).toBe('');
        });

        test('calculates delta for prepended text', () => {
            const oldContent = 'world';
            const newContent = 'Hello world';

            const delta = Snapshot.calculateDelta(oldContent, newContent);

            expect(delta.type).toBe('delta');
            expect(delta.added).toContain('Hello');
        });

        test('calculates delta for middle insertion', () => {
            const oldContent = 'Hello world';
            const newContent = 'Hello beautiful world';

            const delta = Snapshot.calculateDelta(oldContent, newContent);

            expect(delta.type).toBe('delta');
            expect(delta.added).toContain('beautiful');
        });

        test('calculates delta for deletion', () => {
            const oldContent = 'Hello beautiful world';
            const newContent = 'Hello world';

            const delta = Snapshot.calculateDelta(oldContent, newContent);

            expect(delta.type).toBe('delta');
            expect(delta.removed).toContain('beautiful');
        });

        test('applies delta correctly', () => {
            const oldContent = 'Hello world';
            const delta = {
                type: 'delta',
                prefix: 6,
                suffix: 5,
                removed: '',
                added: 'beautiful ',
                removedLength: 0,
                addedLength: 10
            };

            const newContent = Snapshot.applyDelta(oldContent, delta);

            expect(newContent).toBe('Hello beautiful world');
        });

        test('applies full delta', () => {
            const delta = { type: 'full', content: 'Complete new text' };
            const result = Snapshot.applyDelta('old', delta);

            expect(result).toBe('Complete new text');
        });
    });

    describe('Snapshot creation', () => {
        test('creates snapshot successfully', async () => {
            const snapshot = await manager.createSnapshot('essay-001', 'Test content', { manual: true });

            expect(snapshot).toBeTruthy();
            expect(snapshot.essayId).toBe('essay-001');
            expect(snapshot.content).toBe('Test content');
        });

        test('adds snapshot to undo stack', async () => {
            await manager.createSnapshot('essay-001', 'Content 1', { manual: true });

            const undoStack = manager.undoStacks.get('essay-001');
            expect(undoStack.length).toBe(1);
        });

        test('clears redo stack on new snapshot', async () => {
            await manager.createSnapshot('essay-001', 'Content 1', { manual: true });
            await manager.createSnapshot('essay-001', 'Content 2', { manual: true });

            // Undo once
            await manager.undo('essay-001');

            // Redo stack should have one item
            expect(manager.redoStacks.get('essay-001').length).toBe(1);

            // Create new snapshot - should clear redo stack
            await manager.createSnapshot('essay-001', 'Content 3', { manual: true });

            expect(manager.redoStacks.get('essay-001').length).toBe(0);
        });

        test('skips snapshot if content unchanged significantly', async () => {
            await manager.createSnapshot('essay-001', 'Hello world', { manual: true });

            // Small change (< minEditDistance)
            const snapshot = await manager.createSnapshot('essay-001', 'Hello world!');

            expect(snapshot).toBeNull();
        });

        test('creates snapshot for significant changes', async () => {
            await manager.createSnapshot('essay-001', 'Hello', { manual: true });

            // Significant change (>= minEditDistance)
            const snapshot = await manager.createSnapshot('essay-001', 'Hello world, this is a test', { manual: true });

            expect(snapshot).toBeTruthy();
        });

        test('respects snapshot interval throttling', async () => {
            manager.config.snapshotInterval = 1000; // 1 second

            await manager.createSnapshot('essay-001', 'Content 1', { manual: true });

            // Immediate snapshot should be skipped (not manual)
            const snapshot = await manager.createSnapshot('essay-001', 'Content 2 with significant changes');

            expect(snapshot).toBeNull();
        });

        test('allows manual snapshots to bypass throttling', async () => {
            manager.config.snapshotInterval = 10000; // 10 seconds

            await manager.createSnapshot('essay-001', 'Content 1', { manual: true });

            // Manual snapshot should work immediately
            const snapshot = await manager.createSnapshot('essay-001', 'Content 2', { manual: true });

            expect(snapshot).toBeTruthy();
        });
    });

    describe('Undo/Redo operations', () => {
        test('undo reverts to previous snapshot', async () => {
            await manager.createSnapshot('essay-001', 'Version 1', { manual: true });
            await manager.createSnapshot('essay-001', 'Version 2', { manual: true });

            const result = await manager.undo('essay-001');

            expect(result.content).toBe('Version 1');
        });

        test('undo returns null if nothing to undo', async () => {
            await manager.createSnapshot('essay-001', 'Version 1', { manual: true });

            const result = await manager.undo('essay-001');

            expect(result).toBeNull();
        });

        test('redo restores undone snapshot', async () => {
            await manager.createSnapshot('essay-001', 'Version 1', { manual: true });
            await manager.createSnapshot('essay-001', 'Version 2', { manual: true });

            await manager.undo('essay-001');
            const result = await manager.redo('essay-001');

            expect(result.content).toBe('Version 2');
        });

        test('redo returns null if nothing to redo', async () => {
            await manager.createSnapshot('essay-001', 'Version 1', { manual: true });

            const result = await manager.redo('essay-001');

            expect(result).toBeNull();
        });

        test('multiple undo/redo operations', async () => {
            await manager.createSnapshot('essay-001', 'V1', { manual: true });
            await manager.createSnapshot('essay-001', 'V2', { manual: true });
            await manager.createSnapshot('essay-001', 'V3', { manual: true });

            // Undo twice
            await manager.undo('essay-001');
            const undo2 = await manager.undo('essay-001');
            expect(undo2.content).toBe('V1');

            // Redo twice
            await manager.redo('essay-001');
            const redo2 = await manager.redo('essay-001');
            expect(redo2.content).toBe('V3');
        });

        test('undo latency is fast (<50ms target)', async () => {
            // Create snapshots
            for (let i = 0; i < 5; i++) {
                await manager.createSnapshot('essay-001', `Version ${i}`, { manual: true });
            }

            const startTime = performance.now();
            await manager.undo('essay-001');
            const latency = performance.now() - startTime;

            expect(latency).toBeLessThan(50);
        });

        test('tracks undo metrics', async () => {
            await manager.createSnapshot('essay-001', 'V1', { manual: true });
            await manager.createSnapshot('essay-001', 'V2', { manual: true });

            await manager.undo('essay-001');

            const metrics = manager.getMetrics();
            expect(metrics.undoOperations).toBe(1);
            expect(metrics.averageUndoLatency).toBeGreaterThan(0);
        });
    });

    describe('Snapshot listing and retrieval', () => {
        test('lists snapshots for essay', async () => {
            await manager.createSnapshot('essay-001', 'V1', { manual: true });
            await manager.createSnapshot('essay-001', 'V2', { manual: true });
            await manager.createSnapshot('essay-001', 'V3', { manual: true });

            const snapshots = await manager.listSnapshots('essay-001');

            expect(snapshots.length).toBe(3);
        });

        test('sorts snapshots by timestamp (newest first)', async () => {
            await manager.createSnapshot('essay-001', 'V1', { manual: true });
            await new Promise(resolve => setTimeout(resolve, 10));
            await manager.createSnapshot('essay-001', 'V2', { manual: true });
            await new Promise(resolve => setTimeout(resolve, 10));
            await manager.createSnapshot('essay-001', 'V3', { manual: true });

            const snapshots = await manager.listSnapshots('essay-001');

            expect(snapshots[0].content).toBe('V3');
            expect(snapshots[1].content).toBe('V2');
            expect(snapshots[2].content).toBe('V1');
        });

        test('applies limit to snapshot list', async () => {
            for (let i = 0; i < 10; i++) {
                await manager.createSnapshot('essay-001', `V${i}`, { manual: true });
            }

            const snapshots = await manager.listSnapshots('essay-001', { limit: 5 });

            expect(snapshots.length).toBe(5);
        });

        test('retrieves snapshot by ID', async () => {
            const created = await manager.createSnapshot('essay-001', 'Test', { manual: true });

            const retrieved = await manager.getSnapshot(created.snapshotId);

            expect(retrieved.content).toBe('Test');
            expect(retrieved.snapshotId).toBe(created.snapshotId);
        });

        test('returns null for non-existent snapshot', async () => {
            const result = await manager.getSnapshot('non-existent');

            expect(result).toBeNull();
        });
    });

    describe('Snapshot trimming', () => {
        test('trims snapshots when exceeding max', async () => {
            manager.config.maxSnapshotsPerEssay = 5;

            // Create 7 snapshots
            for (let i = 0; i < 7; i++) {
                await manager.createSnapshot('essay-001', `Version ${i}`, { manual: true });
            }

            const snapshots = await manager.listSnapshots('essay-001');

            expect(snapshots.length).toBe(5);
        });

        test('keeps newest snapshots when trimming', async () => {
            manager.config.maxSnapshotsPerEssay = 3;

            await manager.createSnapshot('essay-001', 'V0', { manual: true });
            await manager.createSnapshot('essay-001', 'V1', { manual: true });
            await manager.createSnapshot('essay-001', 'V2', { manual: true });
            await manager.createSnapshot('essay-001', 'V3', { manual: true });

            const snapshots = await manager.listSnapshots('essay-001');

            // Should have V1, V2, V3 (V0 trimmed)
            expect(snapshots.length).toBe(3);
            expect(snapshots.some(s => s.content === 'V0')).toBe(false);
        });

        test('emits trim event', async () => {
            manager.config.maxSnapshotsPerEssay = 2;

            const trimListener = jest.fn();
            manager.on('trim', trimListener);

            await manager.createSnapshot('essay-001', 'V0', { manual: true });
            await manager.createSnapshot('essay-001', 'V1', { manual: true });
            await manager.createSnapshot('essay-001', 'V2', { manual: true });

            expect(trimListener).toHaveBeenCalled();
        });
    });

    describe('Snapshot sync queue', () => {
        test('queues snapshot for sync', async () => {
            const snapshot = await manager.createSnapshot('essay-001', 'Test', { manual: true });

            manager.queueSnapshotSync(snapshot);

            expect(manager.snapshotQueue.has(snapshot.snapshotId)).toBe(true);
        });

        test('gets unsynced snapshots', async () => {
            await manager.createSnapshot('essay-001', 'V1', { manual: true });
            await manager.createSnapshot('essay-001', 'V2', { manual: true });

            const unsynced = await manager.getUnsyncedSnapshots('essay-001');

            expect(unsynced.length).toBe(2);
            expect(unsynced.every(s => !s.synced)).toBe(true);
        });

        test('marks snapshot as synced', async () => {
            const snapshot = await manager.createSnapshot('essay-001', 'Test', { manual: true });

            await manager.markAsSynced(snapshot.snapshotId);

            const retrieved = await manager.getSnapshot(snapshot.snapshotId);
            expect(retrieved.synced).toBe(true);
            expect(retrieved.syncedAt).toBeTruthy();
        });
    });

    describe('Snapshot loading', () => {
        test('loads snapshots into undo stack', async () => {
            await manager.createSnapshot('essay-001', 'V1', { manual: true });
            await manager.createSnapshot('essay-001', 'V2', { manual: true });
            await manager.createSnapshot('essay-001', 'V3', { manual: true });

            // Clear in-memory stacks
            manager.undoStacks.clear();
            manager.currentSnapshots.clear();

            // Reload from DB
            await manager.loadSnapshots('essay-001');

            const undoStack = manager.undoStacks.get('essay-001');
            expect(undoStack.length).toBe(3);
            expect(manager.currentSnapshots.get('essay-001').content).toBe('V3');
        });

        test('limits loaded snapshots to undo stack size', async () => {
            manager.config.undoStackSize = 5;

            // Create 10 snapshots
            for (let i = 0; i < 10; i++) {
                await manager.createSnapshot('essay-001', `V${i}`, { manual: true });
            }

            manager.undoStacks.clear();
            await manager.loadSnapshots('essay-001');

            const undoStack = manager.undoStacks.get('essay-001');
            expect(undoStack.length).toBe(5);
        });
    });

    describe('Event system', () => {
        test('emits snapshot event', async () => {
            const listener = jest.fn();
            manager.on('snapshot', listener);

            await manager.createSnapshot('essay-001', 'Test', { manual: true });

            expect(listener).toHaveBeenCalledWith(
                expect.objectContaining({
                    essayId: 'essay-001'
                })
            );
        });

        test('emits undo event', async () => {
            const listener = jest.fn();
            manager.on('undo', listener);

            await manager.createSnapshot('essay-001', 'V1', { manual: true });
            await manager.createSnapshot('essay-001', 'V2', { manual: true });
            await manager.undo('essay-001');

            expect(listener).toHaveBeenCalledWith(
                expect.objectContaining({
                    essayId: 'essay-001',
                    content: 'V1'
                })
            );
        });

        test('emits redo event', async () => {
            const listener = jest.fn();
            manager.on('redo', listener);

            await manager.createSnapshot('essay-001', 'V1', { manual: true });
            await manager.createSnapshot('essay-001', 'V2', { manual: true });
            await manager.undo('essay-001');
            await manager.redo('essay-001');

            expect(listener).toHaveBeenCalledWith(
                expect.objectContaining({
                    essayId: 'essay-001',
                    content: 'V2'
                })
            );
        });

        test('removes event listener', () => {
            const listener = jest.fn();
            manager.on('snapshot', listener);
            manager.off('snapshot', listener);

            expect(manager.listeners.snapshot.length).toBe(0);
        });

        test('throws error for unknown event', () => {
            expect(() => {
                manager.on('unknown', () => {});
            }).toThrow('Unknown event: unknown');
        });
    });

    describe('Performance and rapid edits', () => {
        test('handles rapid snapshot creation', async () => {
            const startTime = performance.now();

            for (let i = 0; i < 100; i++) {
                await manager.createSnapshot('essay-001', `Content ${i}`, { manual: true });
            }

            const duration = performance.now() - startTime;
            console.log(`Created 100 snapshots in ${duration.toFixed(2)}ms`);

            expect(duration).toBeLessThan(5000); // Should complete in <5 seconds
        });

        test('handles large content efficiently', async () => {
            const largeContent = 'A'.repeat(10000); // 10KB

            const startTime = performance.now();
            await manager.createSnapshot('essay-001', largeContent, { manual: true });
            const duration = performance.now() - startTime;

            expect(duration).toBeLessThan(100);
        });

        test('delta calculation is efficient for large text', () => {
            const text1 = 'A'.repeat(5000);
            const text2 = 'A'.repeat(5000) + 'B'.repeat(100);

            const startTime = performance.now();
            const delta = Snapshot.calculateDelta(text1, text2);
            const duration = performance.now() - startTime;

            expect(duration).toBeLessThan(50);
            expect(delta.type).toBe('delta');
        });
    });

    describe('Edge cases', () => {
        test('handles empty content', async () => {
            const snapshot = await manager.createSnapshot('essay-001', '', { manual: true });

            expect(snapshot.wordCount).toBe(0);
        });

        test('handles special characters', async () => {
            const content = 'Test with émojis 🎓📚 and spëcial çharacters!';

            const snapshot = await manager.createSnapshot('essay-001', content, { manual: true });

            expect(snapshot.content).toBe(content);
        });

        test('handles concurrent undo requests', async () => {
            await manager.createSnapshot('essay-001', 'V1', { manual: true });
            await manager.createSnapshot('essay-001', 'V2', { manual: true });
            await manager.createSnapshot('essay-001', 'V3', { manual: true });

            // Concurrent undo calls
            const results = await Promise.all([
                manager.undo('essay-001'),
                manager.undo('essay-001')
            ]);

            // Both should succeed but stack should be consistent
            expect(manager.undoStacks.get('essay-001').length).toBeGreaterThan(0);
        });

        test('handles deletion of snapshots', async () => {
            const snapshot = await manager.createSnapshot('essay-001', 'Test', { manual: true });

            await manager.deleteSnapshot(snapshot.snapshotId);

            const retrieved = await manager.getSnapshot(snapshot.snapshotId);
            expect(retrieved).toBeNull();
        });

        test('clears all snapshots for essay', async () => {
            await manager.createSnapshot('essay-001', 'V1', { manual: true });
            await manager.createSnapshot('essay-001', 'V2', { manual: true });

            await manager.clearSnapshots('essay-001');

            const snapshots = await manager.listSnapshots('essay-001');
            expect(snapshots.length).toBe(0);
            expect(manager.undoStacks.has('essay-001')).toBe(false);
        });
    });

    describe('Helper functions', () => {
        test('setupKeyboardShortcuts registers listeners', () => {
            const getCurrentEssayId = jest.fn(() => 'essay-001');

            setupKeyboardShortcuts(manager, getCurrentEssayId);

            expect(global.document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
        });

        test('setupAutoSnapshot integrates with autosave', () => {
            const mockAutosave = {
                on: jest.fn(),
                getDraft: jest.fn()
            };

            setupAutoSnapshot(mockAutosave, manager);

            expect(mockAutosave.on).toHaveBeenCalledWith('save', expect.any(Function));
        });
    });
});
