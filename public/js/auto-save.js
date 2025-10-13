/**
 * Auto-Save System
 * Automatically saves user data with debouncing, offline support, and conflict resolution
 * 
 * Usage:
 * const autoSaver = new AutoSave({
 *     saveFunction: async (data) => { ... },
 *     debounceMs: 3000,
 *     statusElement: document.getElementById('saveStatus')
 * });
 * 
 * autoSaver.markDirty(); // Mark data as needing save
 * autoSaver.save(); // Force immediate save
 */

class AutoSave {
    constructor(options = {}) {
        this.saveFunction = options.saveFunction || this.defaultSaveFunction;
        this.debounceMs = options.debounceMs || 3000; // 3 seconds default
        this.statusElement = options.statusElement;
        this.dataGetter = options.dataGetter || (() => ({}));
        this.onError = options.onError || this.defaultErrorHandler;
        this.onSuccess = options.onSuccess || this.defaultSuccessHandler;
        
        this.isDirty = false;
        this.isSaving = false;
        this.lastSaveTime = null;
        this.saveTimer = null;
        this.saveQueue = [];
        this.isOnline = navigator.onLine;
        
        this.setupEventListeners();
        this.startAutoSaveLoop();
    }

    /**
     * Setup online/offline listeners
     */
    setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateStatus('Back online - syncing...', 'info');
            this.processSaveQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateStatus('Offline - will sync when reconnected', 'warning');
        });

        // Save before page unload if dirty
        window.addEventListener('beforeunload', (e) => {
            if (this.isDirty && !this.isSaving) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        });

        // Handle visibility change (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isDirty) {
                // Save immediately when user switches tabs
                this.save({ immediate: true });
            }
        });
    }

    /**
     * Mark data as dirty (needs saving)
     */
    markDirty() {
        this.isDirty = true;
        this.updateStatus('Unsaved changes', 'pending');
        this.scheduleSave();
    }

    /**
     * Schedule a debounced save
     */
    scheduleSave() {
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
        }

        this.saveTimer = setTimeout(() => {
            this.save();
        }, this.debounceMs);
    }

    /**
     * Save immediately or add to queue if offline
     */
    async save(options = {}) {
        const immediate = options.immediate || false;

        if (this.saveTimer && immediate) {
            clearTimeout(this.saveTimer);
            this.saveTimer = null;
        }

        if (!this.isDirty) {
            return; // Nothing to save
        }

        if (this.isSaving && !immediate) {
            return; // Already saving
        }

        if (!this.isOnline) {
            this.addToQueue();
            return;
        }

        try {
            this.isSaving = true;
            this.updateStatus('Saving...', 'saving');

            const data = this.dataGetter();
            await this.saveFunction(data);

            this.isDirty = false;
            this.isSaving = false;
            this.lastSaveTime = new Date();
            
            this.updateStatus('All changes saved', 'success');
            this.onSuccess(data);

            // Auto-hide success message after 3 seconds
            setTimeout(() => {
                if (!this.isDirty) {
                    this.updateStatus('', 'idle');
                }
            }, 3000);

        } catch (error) {
            this.isSaving = false;
            console.error('Auto-save error:', error);
            
            this.updateStatus('Save failed - will retry', 'error');
            this.onError(error);
            
            // Add to queue for retry
            this.addToQueue();
        }
    }

    /**
     * Add save operation to queue for offline/retry
     */
    addToQueue() {
        const data = this.dataGetter();
        this.saveQueue.push({
            data: data,
            timestamp: Date.now()
        });

        // Store in localStorage as backup
        try {
            localStorage.setItem('autosave_queue', JSON.stringify(this.saveQueue));
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    }

    /**
     * Process queued saves when back online
     */
    async processSaveQueue() {
        if (this.saveQueue.length === 0) {
            // Check localStorage for queued items
            try {
                const stored = localStorage.getItem('autosave_queue');
                if (stored) {
                    this.saveQueue = JSON.parse(stored);
                }
            } catch (e) {
                console.warn('Could not load from localStorage:', e);
            }
        }

        if (this.saveQueue.length === 0) {
            return;
        }

        this.updateStatus(`Syncing ${this.saveQueue.length} changes...`, 'saving');

        // Process queue in order
        while (this.saveQueue.length > 0 && this.isOnline) {
            const item = this.saveQueue[0];
            
            try {
                await this.saveFunction(item.data);
                this.saveQueue.shift(); // Remove from queue
            } catch (error) {
                console.error('Queue processing error:', error);
                this.updateStatus('Sync failed - will retry', 'error');
                break; // Stop processing on error
            }
        }

        if (this.saveQueue.length === 0) {
            localStorage.removeItem('autosave_queue');
            this.updateStatus('All changes synced', 'success');
        }
    }

    /**
     * Auto-save loop (backup to debouncing)
     */
    startAutoSaveLoop() {
        setInterval(() => {
            if (this.isDirty && !this.isSaving && this.isOnline) {
                this.save();
            }
        }, 30000); // Check every 30 seconds
    }

    /**
     * Update status indicator
     */
    updateStatus(message, type = 'idle') {
        if (!this.statusElement) return;

        const icons = {
            idle: '',
            pending: '⏱️',
            saving: '💾',
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const colors = {
            idle: '#666',
            pending: '#f59e0b',
            saving: '#3b82f6',
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        this.statusElement.innerHTML = message ? `
            <span style="color: ${colors[type]}; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;">
                <span>${icons[type]}</span>
                <span>${message}</span>
            </span>
        ` : '';

        // Add timestamp for success
        if (type === 'success' && this.lastSaveTime) {
            const timeStr = this.lastSaveTime.toLocaleTimeString();
            this.statusElement.innerHTML += `
                <span style="color: #999; font-size: 0.8rem; margin-left: 0.5rem;">
                    at ${timeStr}
                </span>
            `;
        }
    }

    /**
     * Default save function (override this)
     */
    async defaultSaveFunction(data) {
        console.log('AutoSave: Saving data', data);
        // Override this with actual save logic
        return Promise.resolve();
    }

    /**
     * Default error handler
     */
    defaultErrorHandler(error) {
        console.error('AutoSave error:', error);
    }

    /**
     * Default success handler
     */
    defaultSuccessHandler(data) {
        console.log('AutoSave: Save successful', data);
    }

    /**
     * Force save and stop auto-save
     */
    async destroy() {
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
        }
        
        if (this.isDirty) {
            await this.save({ immediate: true });
        }
    }

    /**
     * Get last save time
     */
    getLastSaveTime() {
        return this.lastSaveTime;
    }

    /**
     * Check if there are unsaved changes
     */
    hasUnsavedChanges() {
        return this.isDirty;
    }
}

// Make available globally
window.AutoSave = AutoSave;

// Export for module usage
export default AutoSave;
