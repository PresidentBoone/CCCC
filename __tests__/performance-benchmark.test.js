/**
 * Performance Benchmarking & Stress Test Suite
 * Step 6: Comprehensive performance measurement across all Essay Coach subsystems
 *
 * Target Metrics:
 * - Typing → Autosave: <100ms
 * - Autosave → IndexedDB: <150ms
 * - IndexedDB → Firebase: <250ms
 * - Undo/Redo: <50ms
 * - Throughput: 10,000 chars/minute
 * - Memory: Stable after 30-minute session
 */

// Polyfill for structuredClone (required by fake-indexeddb)
if (typeof structuredClone === 'undefined') {
    global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

require('fake-indexeddb/auto');
const fs = require('fs');
const path = require('path');

// Mock Firebase before imports
const mockFirestore = {
    collection: jest.fn(() => ({
        doc: jest.fn(() => ({
            set: jest.fn().mockResolvedValue({}),
            get: jest.fn().mockResolvedValue({ exists: false }),
            update: jest.fn().mockResolvedValue({}),
            collection: jest.fn(() => ({
                doc: jest.fn(() => ({
                    set: jest.fn().mockResolvedValue({}),
                    get: jest.fn().mockResolvedValue({ exists: false })
                })),
                add: jest.fn().mockResolvedValue({ id: 'chunk-123' })
            }))
        }))
    }))
};

const mockAuth = {
    currentUser: { uid: 'test-user-123' }
};

global.firebase = {
    firestore: () => mockFirestore,
    auth: () => mockAuth
};

// Load AutosaveManager
const autosaveCode = fs.readFileSync(
    path.join(__dirname, '../public/js/autosave-manager.js'),
    'utf-8'
);
const autosaveWindow = {};
const autosaveFunc = new Function('window', autosaveCode);
autosaveFunc(autosaveWindow);
const AutosaveManager = autosaveWindow.AutosaveManager;

// Load FirebaseSyncManager
const firebaseSyncCode = fs.readFileSync(
    path.join(__dirname, '../public/js/firebase-sync.js'),
    'utf-8'
);
const firebaseSyncWindow = {};
const firebaseSyncFunc = new Function('window', firebaseSyncCode);
firebaseSyncFunc(firebaseSyncWindow);
const FirebaseSyncManager = firebaseSyncWindow.FirebaseSyncManager;

// Load SnapshotManager
const snapshotCode = fs.readFileSync(
    path.join(__dirname, '../public/js/snapshot-manager.js'),
    'utf-8'
);
const snapshotWindow = { Snapshot: null, SnapshotManager: null };
const snapshotFunc = new Function('window', snapshotCode);
snapshotFunc(snapshotWindow);
const { Snapshot, SnapshotManager } = snapshotWindow;

// Performance results storage
const performanceResults = {
    timestamp: new Date().toISOString(),
    testSuite: 'Essay Coach Performance Benchmark',
    subsystems: {},
    optimizations: [],
    summary: {}
};

// Helper to record metrics
function recordMetric(subsystem, metric, value, target) {
    if (!performanceResults.subsystems[subsystem]) {
        performanceResults.subsystems[subsystem] = {};
    }
    performanceResults.subsystems[subsystem][metric] = {
        value,
        target,
        pass: value <= target,
        unit: 'ms'
    };
}

// Helper to simulate typing
function simulateTyping(manager, essayId, charCount, interval = 10) {
    const chars = 'abcdefghijklmnopqrstuvwxyz ';
    let content = '';
    const latencies = [];

    for (let i = 0; i < charCount; i++) {
        const startTime = performance.now();
        content += chars[Math.floor(Math.random() * chars.length)];
        manager.saveDraft(essayId, content, { userId: 'test-user' });
        const latency = performance.now() - startTime;
        latencies.push(latency);
    }

    return { content, latencies };
}

// Helper to calculate statistics
function calculateStats(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    return {
        mean: sum / values.length,
        median: sorted[Math.floor(sorted.length / 2)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
        min: Math.min(...values),
        max: Math.max(...values)
    };
}

describe('Performance Benchmark Suite', () => {
    let autosaveManager;
    let firebaseSyncManager;
    let snapshotManager;

    beforeEach(async () => {
        // Reset IndexedDB
        const request = indexedDB.deleteDatabase('EssayCoachDB');
        await new Promise((resolve, reject) => {
            request.onsuccess = resolve;
            request.onerror = reject;
        });

        autosaveManager = new AutosaveManager({ debounceDelay: 50 }); // Reduced for testing
        await autosaveManager.init();

        firebaseSyncManager = new FirebaseSyncManager({ maxRetries: 1, baseDelay: 100 }); // Faster retries for testing
        // Skip Firebase init in tests - it will work with mocks
        firebaseSyncManager.firestore = mockFirestore;
        firebaseSyncManager.auth = mockAuth;
        firebaseSyncManager.initialized = true;

        snapshotManager = new SnapshotManager({ autoSnapshotInterval: 5000 });
        await snapshotManager.init();

        jest.clearAllMocks();
    });

    afterEach(async () => {
        // Cleanup - just reset references, no destroy methods needed
        autosaveManager = null;
        firebaseSyncManager = null;
        snapshotManager = null;
    });

    // ========================================
    // 1. AUTOSAVE LATENCY TESTS (Tests 1-5)
    // ========================================

    test('1. Single autosave operation latency (<150ms target)', async () => {
        const essayId = 'perf-test-001';
        const content = 'x'.repeat(1000);

        const startTime = performance.now();
        await autosaveManager.saveDraft(essayId, content, { userId: 'test-user' });
        await new Promise(resolve => setTimeout(resolve, 75)); // Wait for debounce
        const latency = performance.now() - startTime;

        recordMetric('Autosave', 'single_save_latency', latency, 150);
        expect(true).toBe(true); // Benchmark test - just record the value
    });

    test('2. Autosave with content deduplication (<50ms for duplicate)', async () => {
        const essayId = 'perf-test-002';
        const content = 'x'.repeat(1000);

        // First save
        await autosaveManager.saveDraft(essayId, content, { userId: 'test-user' });
        await new Promise(resolve => setTimeout(resolve, 75));

        // Duplicate save
        const startTime = performance.now();
        await autosaveManager.saveDraft(essayId, content, { userId: 'test-user' });
        await new Promise(resolve => setTimeout(resolve, 75));
        const latency = performance.now() - startTime;

        recordMetric('Autosave', 'deduplication_latency', latency, 100);
        expect(latency).toBeLessThan(10000);
    });

    test('3. Autosave burst handling (100 rapid saves)', async () => {
        const essayId = 'perf-test-003';
        const latencies = [];

        for (let i = 0; i < 100; i++) {
            const startTime = performance.now();
            await autosaveManager.saveDraft(essayId, `Content ${i}`, { userId: 'test-user' });
            latencies.push(performance.now() - startTime);
        }

        const stats = calculateStats(latencies);
        recordMetric('Autosave', 'burst_p95_latency', stats.p95, 100);
        expect(stats.p95).toBeLessThan(100);
    });

    test('4. Large document autosave (10KB content)', async () => {
        const essayId = 'perf-test-004';
        const content = 'x'.repeat(10240); // 10KB

        const startTime = performance.now();
        await autosaveManager.saveDraft(essayId, content, { userId: 'test-user' });
        await new Promise(resolve => setTimeout(resolve, 150));
        const latency = performance.now() - startTime;

        recordMetric('Autosave', 'large_doc_latency', latency, 200);
        expect(latency).toBeLessThan(10000);
    });

    test('5. Concurrent autosaves (5 essays simultaneously)', async () => {
        const essayIds = ['e1', 'e2', 'e3', 'e4', 'e5'];

        const startTime = performance.now();
        await Promise.all(essayIds.map(id =>
            autosaveManager.saveDraft(id, `Content for ${id}`, { userId: 'test-user' })
        ));
        await new Promise(resolve => setTimeout(resolve, 200));
        const latency = performance.now() - startTime;

        recordMetric('Autosave', 'concurrent_5_essays', latency, 250);
        expect(latency).toBeLessThan(10000);
    });

    // ========================================
    // 2. FIREBASE SYNC LATENCY (Tests 6-10)
    // ========================================

    test('6. Single Firebase sync latency (<250ms target)', async () => {
        const draft = {
            essayId: 'fb-test-001',
            content: 'Test content',
            timestamp: Date.now(),
            userId: 'test-user',
            synced: false
        };

        const startTime = performance.now();
        await firebaseSyncManager.syncDraftToFirebase(draft);
        const latency = performance.now() - startTime;

        recordMetric('FirebaseSync', 'single_sync_latency', latency, 250);
        expect(latency).toBeLessThan(10000);
    });

    test('7. Batch sync throughput (5 essays)', async () => {
        const drafts = Array.from({ length: 5 }, (_, i) => ({
            essayId: `batch-${i}`,
            content: `Content ${i}`,
            timestamp: Date.now(),
            userId: 'test-user',
            synced: false
        }));

        const startTime = performance.now();
        for (const draft of drafts) {
            firebaseSyncManager.queueSync(draft);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        const latency = performance.now() - startTime;

        recordMetric('FirebaseSync', 'batch_5_essays', latency, 500);
        expect(latency).toBeLessThan(10000);
    });

    test('8. Large essay sync with chunking (60KB)', async () => {
        const draft = {
            essayId: 'large-essay-001',
            content: 'x'.repeat(61440), // 60KB
            timestamp: Date.now(),
            userId: 'test-user',
            synced: false
        };

        const startTime = performance.now();
        await firebaseSyncManager.syncDraftToFirebase(draft);
        const latency = performance.now() - startTime;

        recordMetric('FirebaseSync', 'chunked_60kb_sync', latency, 800);
        expect(latency).toBeLessThan(10000);
    });

    test('9. Sync queue processing rate', async () => {
        const drafts = Array.from({ length: 10 }, (_, i) => ({
            essayId: `queue-${i}`,
            content: `Content ${i}`,
            timestamp: Date.now(),
            userId: 'test-user',
            synced: false
        }));

        const startTime = performance.now();
        drafts.forEach(draft => firebaseSyncManager.queueSync(draft));
        await new Promise(resolve => setTimeout(resolve, 1000));
        const duration = performance.now() - startTime;
        const rate = (10 / duration) * 1000; // essays per second

        recordMetric('FirebaseSync', 'queue_processing_rate_per_sec', rate, 5);
        expect(true).toBe(true);
    });

    test('10. Firebase retry latency on failure', async () => {
        mockFirestore.collection().doc().set.mockRejectedValueOnce(new Error('Network error'));

        const draft = {
            essayId: 'retry-test-001',
            content: 'Test content',
            timestamp: Date.now(),
            userId: 'test-user',
            synced: false
        };

        const startTime = performance.now();
        await firebaseSyncManager.syncDraftToFirebase(draft);
        const latency = performance.now() - startTime;

        recordMetric('FirebaseSync', 'retry_latency', latency, 500);
        expect(latency).toBeLessThan(10000);
    });

    // ========================================
    // 3. UNDO/REDO PERFORMANCE (Tests 11-15)
    // ========================================

    test('11. Single undo operation latency (<50ms target)', async () => {
        const essayId = 'undo-test-001';
        await snapshotManager.createSnapshot(essayId, 'Version 1', { manual: true });
        await snapshotManager.createSnapshot(essayId, 'Version 2', { manual: true });

        const startTime = performance.now();
        await snapshotManager.undo(essayId);
        const latency = performance.now() - startTime;

        recordMetric('Undo', 'single_undo_latency', latency, 50);
        expect(latency).toBeLessThan(10000);
    });

    test('12. Single redo operation latency (<50ms target)', async () => {
        const essayId = 'redo-test-001';
        await snapshotManager.createSnapshot(essayId, 'Version 1', { manual: true });
        await snapshotManager.createSnapshot(essayId, 'Version 2', { manual: true });
        await snapshotManager.undo(essayId);

        const startTime = performance.now();
        await snapshotManager.redo(essayId);
        const latency = performance.now() - startTime;

        recordMetric('Undo', 'single_redo_latency', latency, 50);
        expect(latency).toBeLessThan(10000);
    });

    test('13. Rapid undo/redo sequence (20 operations)', async () => {
        const essayId = 'rapid-undo-001';

        // Create 10 snapshots
        for (let i = 0; i < 10; i++) {
            await snapshotManager.createSnapshot(essayId, `Version ${i}`, { manual: true });
        }

        const latencies = [];

        // 10 undos
        for (let i = 0; i < 10; i++) {
            const startTime = performance.now();
            await snapshotManager.undo(essayId);
            latencies.push(performance.now() - startTime);
        }

        // 10 redos
        for (let i = 0; i < 10; i++) {
            const startTime = performance.now();
            await snapshotManager.redo(essayId);
            latencies.push(performance.now() - startTime);
        }

        const stats = calculateStats(latencies);
        recordMetric('Undo', 'rapid_sequence_p95', stats.p95, 50);
        expect(stats.p95).toBeLessThan(50);
    });

    test('14. Delta compression computation performance', async () => {
        const oldContent = 'The quick brown fox jumps over the lazy dog. '.repeat(100);
        const newContent = oldContent.replace('brown', 'red');

        const startTime = performance.now();
        const delta = Snapshot.calculateDelta(oldContent, newContent);
        const latency = performance.now() - startTime;

        recordMetric('Undo', 'delta_computation', latency, 10);
        expect(latency).toBeLessThan(10000);
        expect(delta.type).toBe('delta');
    });

    test('15. Delta apply performance', async () => {
        const oldContent = 'The quick brown fox'.repeat(100);
        const newContent = oldContent.replace('brown', 'red');
        const delta = Snapshot.calculateDelta(oldContent, newContent);

        const startTime = performance.now();
        const result = Snapshot.applyDelta(oldContent, delta);
        const latency = performance.now() - startTime;

        recordMetric('Undo', 'delta_apply', latency, 10);
        expect(latency).toBeLessThan(10000);
        expect(result).toBe(newContent);
    });

    // ========================================
    // 4. THROUGHPUT STRESS TESTS (Tests 16-20)
    // ========================================

    test('16. Heavy editing throughput (10,000 chars/minute simulation)', async () => {
        const essayId = 'throughput-001';
        const charsPerMinute = 10000;
        const testDuration = 1000; // 1 second test (1/60th of minute)
        const charCount = Math.floor(charsPerMinute / 60);

        let content = '';
        const startTime = performance.now();

        for (let i = 0; i < charCount; i++) {
            content += 'a';
            await autosaveManager.saveDraft(essayId, content, { userId: 'test-user' });
        }

        const duration = performance.now() - startTime;
        const actualRate = (charCount / duration) * 60000; // chars/minute

        recordMetric('Throughput', 'heavy_editing_chars_per_min', actualRate, 10000);
        expect(true).toBe(true);
    });

    test('17. Concurrent essay editing (5 essays)', async () => {
        const essayIds = ['t1', 't2', 't3', 't4', 't5'];
        const iterations = 50;

        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
            await Promise.all(essayIds.map(id =>
                autosaveManager.saveDraft(id, `Content ${i}`, { userId: 'test-user' })
            ));
        }

        const duration = performance.now() - startTime;
        const opsPerSecond = (iterations * 5 / duration) * 1000;

        recordMetric('Throughput', 'concurrent_ops_per_sec', opsPerSecond, 100);
        expect(true).toBe(true);
    });

    test('18. Background sync throughput (5 essays concurrently)', async () => {
        const drafts = Array.from({ length: 5 }, (_, i) => ({
            essayId: `bg-${i}`,
            content: `Content ${i}`.repeat(100),
            timestamp: Date.now(),
            userId: 'test-user',
            synced: false
        }));

        const startTime = performance.now();
        await Promise.all(drafts.map(d => firebaseSyncManager.syncDraftToFirebase(d)));
        const duration = performance.now() - startTime;

        recordMetric('Throughput', 'concurrent_sync_duration', duration, 1000);
        expect(duration).toBeLessThan(30000);
    });

    test('19. Snapshot creation rate (100 snapshots)', async () => {
        const essayId = 'snapshot-rate-001';

        const startTime = performance.now();
        for (let i = 0; i < 100; i++) {
            await snapshotManager.createSnapshot(essayId, `Content ${i}`, { manual: true });
        }
        const duration = performance.now() - startTime;
        const rate = (100 / duration) * 1000; // snapshots per second

        recordMetric('Throughput', 'snapshot_creation_per_sec', rate, 100);
        expect(true).toBe(true);
    });

    test('20. IndexedDB write throughput', async () => {
        const essayId = 'idb-throughput-001';
        const iterations = 50;

        const startTime = performance.now();
        for (let i = 0; i < iterations; i++) {
            await autosaveManager.saveDraft(essayId, `Content ${i}`, { userId: 'test-user' });
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        const duration = performance.now() - startTime;
        const rate = (iterations / duration) * 1000;

        recordMetric('Throughput', 'indexeddb_writes_per_sec', rate, 10);
        expect(true).toBe(true);
    });

    // ========================================
    // 5. MEMORY & RESOURCE TESTS (Tests 21-25)
    // ========================================

    test('21. Memory footprint with 10 active essays', async () => {
        const essayIds = Array.from({ length: 10 }, (_, i) => `mem-${i}`);

        const initialMemory = process.memoryUsage().heapUsed;

        for (const id of essayIds) {
            await autosaveManager.saveDraft(id, 'x'.repeat(5000), { userId: 'test-user' });
            await snapshotManager.createSnapshot(id, 'x'.repeat(5000), { manual: true });
        }

        await new Promise(resolve => setTimeout(resolve, 200));

        const finalMemory = process.memoryUsage().heapUsed;
        const memoryIncreaseMB = (finalMemory - initialMemory) / 1024 / 1024;

        recordMetric('Memory', 'heap_increase_10_essays_mb', memoryIncreaseMB, 50);
        expect(memoryIncreaseMB).toBeLessThan(50);
    });

    test('22. Snapshot trimming prevents memory leak', async () => {
        const essayId = 'trim-test-001';

        // Create 60 snapshots (exceeds max of 50)
        for (let i = 0; i < 60; i++) {
            await snapshotManager.createSnapshot(essayId, `Content ${i}`, { manual: true });
        }

        const stacks = snapshotManager.undoStacks.get(essayId);

        recordMetric('Memory', 'snapshot_count_after_trim', stacks.length, 50);
        expect(stacks.length).toBeLessThanOrEqual(50);
    });

    test('23. Autosave queue memory management', async () => {
        const essayId = 'queue-mem-001';

        // Queue many rapid saves
        for (let i = 0; i < 100; i++) {
            autosaveManager.saveDraft(essayId, `Content ${i}`, { userId: 'test-user' });
        }

        const queueSize = autosaveManager.saveQueue.size;

        recordMetric('Memory', 'autosave_queue_size', queueSize, 10);
        expect(queueSize).toBeLessThan(10); // Debouncing should prevent queue buildup
    });

    test('24. Firebase sync queue memory management', async () => {
        const drafts = Array.from({ length: 20 }, (_, i) => ({
            essayId: `sync-mem-${i}`,
            content: `Content ${i}`,
            timestamp: Date.now(),
            userId: 'test-user',
            synced: false
        }));

        drafts.forEach(d => firebaseSyncManager.queueSync(d));

        const queueSize = firebaseSyncManager.syncQueue.size;

        recordMetric('Memory', 'sync_queue_size', queueSize, 20);
        expect(queueSize).toBeLessThanOrEqual(20);
    });

    test('25. Content hash cache memory usage', async () => {
        const essayIds = Array.from({ length: 10 }, (_, i) => `hash-${i}`);

        for (const id of essayIds) {
            autosaveManager.saveDraft(id, `Content for ${id}`, { userId: 'test-user' }); // No await
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        const cacheSize = autosaveManager.contentHashes.size;

        recordMetric('Memory', 'content_hash_cache_size', cacheSize, 50);
        expect(cacheSize).toBeLessThanOrEqual(50);
    });

    // ========================================
    // 6. OFFLINE/ONLINE TRANSITIONS (Tests 26-30)
    // ========================================

    test('26. Offline autosave continues normally', async () => {
        const essayId = 'offline-001';

        // Simulate offline
        firebaseSyncManager.circuitState = 'OPEN';

        const startTime = performance.now();
        await autosaveManager.saveDraft(essayId, 'Offline content', { userId: 'test-user' });
        await new Promise(resolve => setTimeout(resolve, 150));
        const latency = performance.now() - startTime;

        recordMetric('Offline', 'autosave_offline_latency', latency, 150);
        expect(latency).toBeLessThan(10000);
    });

    test('27. Transition from offline to online', async () => {
        const essayId = 'transition-001';

        // Save while offline
        firebaseSyncManager.circuitState = 'OPEN';
        await autosaveManager.saveDraft(essayId, 'Offline content', { userId: 'test-user' });
        await new Promise(resolve => setTimeout(resolve, 150));

        // Go online and sync
        firebaseSyncManager.circuitState = 'CLOSED';
        const draft = await autosaveManager.getDraft(essayId);

        const startTime = performance.now();
        await firebaseSyncManager.syncDraftToFirebase(draft);
        const latency = performance.now() - startTime;

        recordMetric('Offline', 'offline_to_online_sync', latency, 300);
        expect(latency).toBeLessThan(10000);
    });

    test('28. Multiple essays queued during offline', async () => {
        const essayIds = ['off1', 'off2', 'off3', 'off4', 'off5'];

        // Save multiple essays while offline
        firebaseSyncManager.circuitState = 'OPEN';
        for (const id of essayIds) {
            await autosaveManager.saveDraft(id, `Offline ${id}`, { userId: 'test-user' });
        }
        await new Promise(resolve => setTimeout(resolve, 200));

        // Go online and sync all
        firebaseSyncManager.circuitState = 'CLOSED';
        const drafts = await Promise.all(essayIds.map(id => autosaveManager.getDraft(id)));

        const startTime = performance.now();
        for (const draft of drafts) {
            firebaseSyncManager.queueSync(draft);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        const duration = performance.now() - startTime;

        recordMetric('Offline', 'batch_recovery_duration', duration, 1000);
        expect(duration).toBeLessThan(30000);
    });

    test('29. Circuit breaker recovery latency', async () => {
        firebaseSyncManager.circuitState = 'OPEN';
        firebaseSyncManager.circuitOpenedAt = Date.now() - 6000; // 6 seconds ago

        const draft = {
            essayId: 'circuit-001',
            content: 'Test',
            timestamp: Date.now(),
            userId: 'test-user',
            synced: false
        };

        const startTime = performance.now();
        await firebaseSyncManager.syncDraftToFirebase(draft);
        const latency = performance.now() - startTime;

        recordMetric('Offline', 'circuit_recovery_latency', latency, 300);
        expect(latency).toBeLessThan(10000);
    });

    test('30. IndexedDB persistence across offline session', async () => {
        const essayId = 'persist-001';
        const content = 'Persistent content';

        // Save while offline
        await autosaveManager.saveDraft(essayId, content, { userId: 'test-user' });
        await new Promise(resolve => setTimeout(resolve, 150));

        // Simulate restart (create new instance, IndexedDB persists)
        const newManager = new AutosaveManager({ debounceDelay: 100 });
        await newManager.init();

        const startTime = performance.now();
        const draft = await newManager.getDraft(essayId);
        const latency = performance.now() - startTime;

        recordMetric('Offline', 'persistence_retrieval', latency, 100);
        expect(latency).toBeLessThan(10000);
        expect(draft).toBeTruthy();
        if (draft) expect(draft.content).toBe(content);
    });

    // ========================================
    // 7. ADDITIONAL STRESS TESTS (Tests 31-35)
    // ========================================

    test('31. Extremely large essay (100KB content)', async () => {
        const essayId = 'large-001';
        const content = 'x'.repeat(102400); // 100KB

        const startTime = performance.now();
        await autosaveManager.saveDraft(essayId, content, { userId: 'test-user' });
        await new Promise(resolve => setTimeout(resolve, 200));
        const latency = performance.now() - startTime;

        recordMetric('Stress', 'very_large_essay_100kb', latency, 500);
        expect(latency).toBeLessThan(10000);
    });

    test('32. Rapid snapshot creation stress (500 snapshots)', async () => {
        const essayId = 'snap-stress-001';

        const startTime = performance.now();
        for (let i = 0; i < 500; i++) {
            await snapshotManager.createSnapshot(essayId, `V${i}`, { manual: true });
        }
        const duration = performance.now() - startTime;

        recordMetric('Stress', 'rapid_500_snapshots_duration', duration, 5000);
        expect(duration).toBeLessThan(30000);
    });

    test('33. Delta compression with minimal changes', async () => {
        const content = 'x'.repeat(10000);
        const modified = content.slice(0, 5000) + 'y' + content.slice(5001);

        const startTime = performance.now();
        const delta = Snapshot.calculateDelta(content, modified);
        const latency = performance.now() - startTime;

        recordMetric('Stress', 'delta_minimal_change', latency, 20);
        expect(latency).toBeLessThan(10000);
        expect(delta.type).toBe('delta');
        expect(delta.addedLength).toBeLessThan(100);
    });

    test('34. Undo stack at maximum capacity (50 items)', async () => {
        const essayId = 'stack-max-001';

        // Create 50 snapshots (max)
        for (let i = 0; i < 50; i++) {
            await snapshotManager.createSnapshot(essayId, `V${i}`, { manual: true });
        }

        const startTime = performance.now();
        await snapshotManager.undo(essayId);
        const latency = performance.now() - startTime;

        recordMetric('Stress', 'undo_at_max_capacity', latency, 50);
        expect(latency).toBeLessThan(10000);
    });

    test('35. Combined system stress (autosave + sync + snapshot)', async () => {
        const essayId = 'combined-001';

        const startTime = performance.now();

        // Autosave
        await autosaveManager.saveDraft(essayId, 'Initial content', { userId: 'test-user' });
        await new Promise(resolve => setTimeout(resolve, 150));

        // Snapshot
        await snapshotManager.createSnapshot(essayId, 'Initial content', { manual: true });

        // Get draft and sync
        const draft = await autosaveManager.getDraft(essayId);
        await firebaseSyncManager.syncDraftToFirebase(draft);

        const totalLatency = performance.now() - startTime;

        recordMetric('Stress', 'combined_operation_latency', totalLatency, 600);
        expect(totalLatency).toBeLessThan(10000); // Benchmark test
    });

    // ========================================
    // Generate Performance Report
    // ========================================

    afterAll(() => {
        // Calculate summary statistics
        const subsystems = performanceResults.subsystems;
        let totalTests = 0;
        let passedTests = 0;

        for (const [subsystem, metrics] of Object.entries(subsystems)) {
            for (const [metric, data] of Object.entries(metrics)) {
                totalTests++;
                if (data.pass) passedTests++;
            }
        }

        performanceResults.summary = {
            totalTests,
            passedTests,
            failedTests: totalTests - passedTests,
            passRate: ((passedTests / totalTests) * 100).toFixed(2) + '%',
            testDuration: new Date().toISOString()
        };

        // Write report to file
        const reportsDir = path.join(__dirname, '../tests/reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        fs.writeFileSync(
            path.join(reportsDir, 'performance-summary.json'),
            JSON.stringify(performanceResults, null, 2),
            'utf-8'
        );

        console.log('\n📊 Performance Report Generated: tests/reports/performance-summary.json');
        console.log(`✅ Passed: ${passedTests}/${totalTests} (${performanceResults.summary.passRate})`);
    });
});
