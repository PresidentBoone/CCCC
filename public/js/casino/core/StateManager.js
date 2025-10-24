/**
 * Casino Module - State Manager
 *
 * Centralized reactive state management for the casino system.
 * Provides subscribe/unsubscribe patterns for state changes.
 * Supports nested object access with dot notation.
 *
 * @module casino/core/StateManager
 * @author CollegeClimb Casino Team
 * @version 1.0.0
 */

class StateManager {
  /**
   * Create a new StateManager instance
   *
   * @param {Object} initialState - Initial state object
   *
   * @example
   * const state = new StateManager({
   *   coins: 100,
   *   progress: { xp: 0, level: 1 }
   * });
   */
  constructor(initialState = {}) {
    // Use helper functions if available, otherwise fallback
    const helpers = window.CasinoHelpers || {};
    this._deepClone = helpers.deepClone || this._fallbackDeepClone;
    this._getNestedValue = helpers.getNestedValue || this._fallbackGetNested;
    this._setNestedValue = helpers.setNestedValue || this._fallbackSetNested;

    // Internal state (deep clone to prevent external mutations)
    this._state = this._deepClone(initialState);

    // Subscription system
    this._subscribers = new Map(); // path -> Set of callbacks
    this._nextSubscriberId = 0;
    this._subscriberIds = new Map(); // subscriberId -> {path, callback}

    // History for undo/redo (optional feature)
    this._history = [];
    this._historyIndex = -1;
    this._maxHistorySize = 50;
    this._historyEnabled = false;
  }

  /**
   * Get value at path (dot notation supported)
   *
   * @param {string} path - Path to value (e.g., 'progress.xp')
   * @param {*} defaultValue - Default if path not found
   * @returns {*} Value at path
   *
   * @example
   * state.get('progress.xp'); // → 100
   * state.get('missing.path', 0); // → 0
   */
  get(path, defaultValue = undefined) {
    if (!path) {
      return this._deepClone(this._state);
    }

    return this._getNestedValue(this._state, path, defaultValue);
  }

  /**
   * Set value at path (triggers subscribers)
   *
   * @param {string} path - Path to set (e.g., 'progress.xp')
   * @param {*} value - New value
   * @returns {boolean} True if value changed
   *
   * @example
   * state.set('coins', 150); // triggers 'coins' subscribers
   * state.set('progress.xp', 100); // triggers 'progress.xp' subscribers
   */
  set(path, value) {
    const oldValue = this.get(path);

    // Check if value actually changed (avoid unnecessary updates)
    if (this._isEqual(oldValue, value)) {
      return false;
    }

    // Save to history if enabled
    if (this._historyEnabled) {
      this._saveToHistory();
    }

    // Update state
    if (path === '' || path === null || path === undefined) {
      this._state = this._deepClone(value);
    } else {
      this._setNestedValue(this._state, path, value);
    }

    // Notify subscribers
    this._notifySubscribers(path, value, oldValue);

    return true;
  }

  /**
   * Update value using updater function
   *
   * @param {string} path - Path to update
   * @param {Function} updater - Function that receives current value and returns new value
   * @returns {boolean} True if value changed
   *
   * @example
   * state.update('coins', (coins) => coins + 50);
   * state.update('progress.xp', (xp) => xp + 100);
   */
  update(path, updater) {
    if (typeof updater !== 'function') {
      throw new Error('Updater must be a function');
    }

    const currentValue = this.get(path);
    const newValue = updater(currentValue);

    return this.set(path, newValue);
  }

  /**
   * Get entire state object (deep cloned to prevent mutations)
   *
   * @returns {Object} Complete state object
   */
  getAll() {
    return this._deepClone(this._state);
  }

  /**
   * Replace entire state object
   *
   * @param {Object} newState - New state object
   * @returns {boolean} True if state changed
   */
  setAll(newState) {
    const oldState = this._deepClone(this._state);

    if (this._historyEnabled) {
      this._saveToHistory();
    }

    this._state = this._deepClone(newState);

    // Notify all subscribers
    this._notifyAllSubscribers(newState, oldState);

    return true;
  }

  /**
   * Subscribe to state changes at path
   *
   * @param {string} path - Path to watch (e.g., 'coins', 'progress.xp')
   * @param {Function} callback - Callback(newValue, oldValue, path)
   * @returns {Function} Unsubscribe function
   *
   * @example
   * const unsub = state.subscribe('coins', (newCoins, oldCoins) => {
   *   console.log(`Coins changed: ${oldCoins} → ${newCoins}`);
   * });
   *
   * // Later:
   * unsub(); // unsubscribe
   */
  subscribe(path, callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    // Get or create subscriber set for this path
    if (!this._subscribers.has(path)) {
      this._subscribers.set(path, new Set());
    }

    // Generate unique ID for this subscription
    const subscriberId = this._nextSubscriberId++;

    // Store callback with wrapper for ID tracking
    const wrappedCallback = {
      id: subscriberId,
      callback: callback
    };

    this._subscribers.get(path).add(wrappedCallback);
    this._subscriberIds.set(subscriberId, { path, wrappedCallback });

    // Return unsubscribe function
    return () => this.unsubscribe(subscriberId);
  }

  /**
   * Unsubscribe using subscriber ID
   *
   * @param {number} subscriberId - ID returned from subscribe()
   * @returns {boolean} True if unsubscribed
   */
  unsubscribe(subscriberId) {
    const info = this._subscriberIds.get(subscriberId);
    if (!info) {
      return false;
    }

    const { path, wrappedCallback } = info;
    const subscribers = this._subscribers.get(path);

    if (subscribers) {
      subscribers.delete(wrappedCallback);

      // Clean up empty subscriber sets
      if (subscribers.size === 0) {
        this._subscribers.delete(path);
      }
    }

    this._subscriberIds.delete(subscriberId);
    return true;
  }

  /**
   * Unsubscribe all subscribers for a path
   *
   * @param {string} path - Path to clear subscribers
   * @returns {number} Number of subscribers removed
   */
  unsubscribeAll(path) {
    const subscribers = this._subscribers.get(path);
    if (!subscribers) {
      return 0;
    }

    const count = subscribers.size;

    // Remove subscriber ID mappings
    for (const wrapped of subscribers) {
      this._subscriberIds.delete(wrapped.id);
    }

    this._subscribers.delete(path);
    return count;
  }

  /**
   * Reset state to initial values
   *
   * @param {Object} initialState - State to reset to (optional, uses constructor state)
   */
  reset(initialState = null) {
    const oldState = this._deepClone(this._state);

    if (initialState !== null) {
      this._state = this._deepClone(initialState);
    } else {
      this._state = {};
    }

    this._history = [];
    this._historyIndex = -1;

    this._notifyAllSubscribers(this._state, oldState);
  }

  /**
   * Create snapshot of current state
   *
   * @returns {Object} Deep clone of current state
   */
  snapshot() {
    return this._deepClone(this._state);
  }

  /**
   * Restore state from snapshot
   *
   * @param {Object} snapshot - Previously saved snapshot
   */
  restore(snapshot) {
    this.setAll(snapshot);
  }

  /**
   * Enable history tracking (for undo/redo)
   *
   * @param {number} maxSize - Maximum history size (default 50)
   */
  enableHistory(maxSize = 50) {
    this._historyEnabled = true;
    this._maxHistorySize = maxSize;
  }

  /**
   * Disable history tracking
   */
  disableHistory() {
    this._historyEnabled = false;
    this._history = [];
    this._historyIndex = -1;
  }

  /**
   * Undo last change (if history enabled)
   *
   * @returns {boolean} True if undo successful
   */
  undo() {
    if (!this._historyEnabled || this._historyIndex < 0) {
      return false;
    }

    const snapshot = this._history[this._historyIndex];
    this._historyIndex--;

    // Restore without adding to history
    const wasEnabled = this._historyEnabled;
    this._historyEnabled = false;
    this.setAll(snapshot);
    this._historyEnabled = wasEnabled;

    return true;
  }

  /**
   * Redo last undone change (if history enabled)
   *
   * @returns {boolean} True if redo successful
   */
  redo() {
    if (!this._historyEnabled || this._historyIndex >= this._history.length - 1) {
      return false;
    }

    this._historyIndex++;
    const snapshot = this._history[this._historyIndex];

    // Restore without adding to history
    const wasEnabled = this._historyEnabled;
    this._historyEnabled = false;
    this.setAll(snapshot);
    this._historyEnabled = wasEnabled;

    return true;
  }

  /**
   * Get number of active subscriptions
   *
   * @returns {number} Total subscriber count
   */
  getSubscriberCount() {
    let count = 0;
    for (const subscribers of this._subscribers.values()) {
      count += subscribers.size;
    }
    return count;
  }

  /**
   * Get debug info
   *
   * @returns {Object} Debug information
   */
  getDebugInfo() {
    return {
      subscriberCount: this.getSubscriberCount(),
      subscribedPaths: Array.from(this._subscribers.keys()),
      historyEnabled: this._historyEnabled,
      historySize: this._history.length,
      historyIndex: this._historyIndex,
      stateKeys: Object.keys(this._state)
    };
  }

  // ============================================
  // INTERNAL METHODS
  // ============================================

  /**
   * Notify subscribers for a specific path
   * Also notifies parent and child paths
   *
   * @private
   */
  _notifySubscribers(path, newValue, oldValue) {
    // Notify exact path subscribers
    const exactSubscribers = this._subscribers.get(path);
    if (exactSubscribers) {
      for (const wrapped of exactSubscribers) {
        try {
          wrapped.callback(newValue, oldValue, path);
        } catch (error) {
          console.error(`Error in state subscriber for path '${path}':`, error);
        }
      }
    }

    // Notify parent path subscribers (e.g., 'progress' when 'progress.xp' changes)
    const pathParts = path.split('.');
    for (let i = pathParts.length - 1; i > 0; i--) {
      const parentPath = pathParts.slice(0, i).join('.');
      const parentSubscribers = this._subscribers.get(parentPath);

      if (parentSubscribers) {
        const parentNewValue = this.get(parentPath);
        const parentOldValue = oldValue; // Simplified, ideally should reconstruct old parent

        for (const wrapped of parentSubscribers) {
          try {
            wrapped.callback(parentNewValue, parentOldValue, parentPath);
          } catch (error) {
            console.error(`Error in state subscriber for parent path '${parentPath}':`, error);
          }
        }
      }
    }
  }

  /**
   * Notify all subscribers
   *
   * @private
   */
  _notifyAllSubscribers(newState, oldState) {
    for (const [path, subscribers] of this._subscribers.entries()) {
      const newValue = this._getNestedValue(newState, path);
      const oldValue = this._getNestedValue(oldState, path);

      if (!this._isEqual(newValue, oldValue)) {
        for (const wrapped of subscribers) {
          try {
            wrapped.callback(newValue, oldValue, path);
          } catch (error) {
            console.error(`Error in state subscriber for path '${path}':`, error);
          }
        }
      }
    }
  }

  /**
   * Save current state to history
   *
   * @private
   */
  _saveToHistory() {
    // Truncate forward history if we're not at the end
    if (this._historyIndex < this._history.length - 1) {
      this._history = this._history.slice(0, this._historyIndex + 1);
    }

    // Add current state to history
    this._history.push(this._deepClone(this._state));
    this._historyIndex++;

    // Limit history size
    if (this._history.length > this._maxHistorySize) {
      this._history.shift();
      this._historyIndex--;
    }
  }

  /**
   * Check if two values are equal (shallow comparison)
   *
   * @private
   */
  _isEqual(a, b) {
    if (a === b) return true;
    if (a === null || b === null) return a === b;
    if (typeof a !== typeof b) return false;
    if (typeof a !== 'object') return a === b;

    // For objects/arrays, do shallow comparison
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (a[key] !== b[key]) return false;
    }

    return true;
  }

  /**
   * Fallback deep clone (if helpers not available)
   *
   * @private
   */
  _fallbackDeepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => this._fallbackDeepClone(item));

    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this._fallbackDeepClone(obj[key]);
      }
    }
    return cloned;
  }

  /**
   * Fallback get nested value
   *
   * @private
   */
  _fallbackGetNested(obj, path, defaultValue) {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current === null || current === undefined) {
        return defaultValue;
      }
      current = current[key];
    }

    return current !== undefined ? current : defaultValue;
  }

  /**
   * Fallback set nested value
   *
   * @private
   */
  _fallbackSetNested(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = obj;

    for (const key of keys) {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[lastKey] = value;
    return obj;
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.StateManager = StateManager;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StateManager;
}
