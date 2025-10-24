/**
 * Casino Module - Firebase Sync
 *
 * Handles all Firestore operations for the casino system.
 * Provides optimistic updates, real-time subscriptions, and offline support.
 *
 * @module casino/core/FirebaseSync
 * @author CollegeClimb Casino Team
 * @version 1.0.0
 */

class FirebaseSync {
  /**
   * Create a new FirebaseSync instance
   *
   * @param {Object} db - Firestore database instance
   * @param {string} userId - User ID
   * @param {string} displayName - User display name (optional)
   *
   * @example
   * const sync = new FirebaseSync(db, 'user123', 'John D.');
   * await sync.initialize();
   */
  constructor(db, userId, displayName = 'Anonymous') {
    if (!db) {
      throw new Error('Firestore database instance required');
    }
    if (!userId) {
      throw new Error('User ID required');
    }

    this.db = db;
    this.userId = userId;
    this.displayName = displayName;

    // Firestore references
    this.progressRef = null;
    this.historyRef = null;
    this.leaderboardRef = null;

    // Subscriptions
    this.progressUnsubscribe = null;
    this.leaderboardUnsubscribe = null;

    // Offline queue
    this.offlineQueue = [];
    this.isOnline = navigator.onLine;

    // Helpers
    const helpers = window.CasinoHelpers || {};
    this._debounce = helpers.debounce || this._fallbackDebounce;
    this._getISOWeekNumber = helpers.getISOWeekNumber || this._fallbackWeekNumber;

    // Debounced save (prevent excessive writes)
    this.debouncedSave = this._debounce(
      this._performSave.bind(this),
      2000 // 2 second debounce
    );

    // Listen for online/offline events
    this._setupNetworkListeners();
  }

  /**
   * Initialize Firestore references
   *
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      // Progress document reference
      this.progressRef = this.db
        .collection('users')
        .doc(this.userId)
        .collection('casinoProgress')
        .doc('current');

      // History collection reference
      this.historyRef = this.db
        .collection('users')
        .doc(this.userId)
        .collection('casinoHistory');

      // Leaderboard reference
      this.leaderboardRef = this.db.collection('leaderboards');

      console.log('✅ FirebaseSync initialized for user:', this.userId);
    } catch (error) {
      console.error('Failed to initialize FirebaseSync:', error);
      throw error;
    }
  }

  // ============================================
  // PROGRESS OPERATIONS
  // ============================================

  /**
   * Load user progress from Firestore
   *
   * @returns {Promise<Object>} User progress data
   *
   * @example
   * const progress = await sync.loadProgress();
   * // → {coins: 1250, level: 12, xp: 3420, ...}
   */
  async loadProgress() {
    try {
      const doc = await this.progressRef.get();

      if (doc.exists) {
        const data = doc.data();
        console.log('✅ Loaded progress from Firestore:', data);
        return data;
      } else {
        console.log('⚠️ No progress found, returning default');
        return this._getDefaultProgress();
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
      throw error;
    }
  }

  /**
   * Save user progress to Firestore
   *
   * @param {Object} data - Progress data to save
   * @param {boolean} merge - Merge with existing data (default true)
   * @returns {Promise<void>}
   *
   * @example
   * await sync.saveProgress({ coins: 1500 }, true); // merge
   * await sync.saveProgress(fullProgressObject, false); // overwrite
   */
  async saveProgress(data, merge = true) {
    if (!this.isOnline) {
      console.warn('Offline: Queueing save operation');
      this.offlineQueue.push({ type: 'saveProgress', data, merge });
      return;
    }

    try {
      // Add timestamp
      const saveData = {
        ...data,
        lastUpdated: this._getServerTimestamp()
      };

      await this.progressRef.set(saveData, { merge });
      console.log('✅ Progress saved to Firestore');
    } catch (error) {
      console.error('Failed to save progress:', error);
      // Queue for retry
      this.offlineQueue.push({ type: 'saveProgress', data, merge });
      throw error;
    }
  }

  /**
   * Save progress with debouncing (prevents excessive writes)
   *
   * @param {Object} data - Progress data
   * @param {boolean} merge - Merge flag
   */
  saveProgressDebounced(data, merge = true) {
    this.debouncedSave(data, merge);
  }

  /**
   * Internal save method (called by debounced function)
   *
   * @private
   */
  async _performSave(data, merge) {
    await this.saveProgress(data, merge);
  }

  /**
   * Update a specific field in progress
   *
   * @param {string} field - Field path (e.g., 'coins', 'progress.xp')
   * @param {*} value - New value
   * @returns {Promise<void>}
   *
   * @example
   * await sync.updateField('coins', 1500);
   * await sync.updateField('stats.accuracy', 85.5);
   */
  async updateField(field, value) {
    const updateData = {};
    updateData[field] = value;
    updateData['lastUpdated'] = this._getServerTimestamp();

    return this.saveProgress(updateData, true);
  }

  /**
   * Increment a numeric field
   *
   * @param {string} field - Field to increment
   * @param {number} delta - Amount to increment
   * @returns {Promise<void>}
   */
  async incrementField(field, delta) {
    try {
      // Use Firestore increment (atomic operation)
      if (this.db.FieldValue && this.db.FieldValue.increment) {
        const updateData = {};
        updateData[field] = this.db.FieldValue.increment(delta);
        await this.progressRef.update(updateData);
      } else {
        // Fallback: load, increment, save
        const progress = await this.loadProgress();
        const currentValue = progress[field] || 0;
        await this.updateField(field, currentValue + delta);
      }
    } catch (error) {
      console.error(`Failed to increment field ${field}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time progress updates
   *
   * @param {Function} callback - Callback(newData)
   * @returns {Function} Unsubscribe function
   *
   * @example
   * const unsub = sync.subscribeToProgress((newProgress) => {
   *   console.log('Progress updated:', newProgress);
   * });
   *
   * // Later:
   * unsub();
   */
  subscribeToProgress(callback) {
    if (this.progressUnsubscribe) {
      console.warn('Already subscribed to progress updates');
      return this.progressUnsubscribe;
    }

    this.progressUnsubscribe = this.progressRef.onSnapshot(
      (doc) => {
        if (doc.exists) {
          const data = doc.data();
          callback(data);
        }
      },
      (error) => {
        console.error('Progress subscription error:', error);
      }
    );

    return () => this.unsubscribeFromProgress();
  }

  /**
   * Unsubscribe from progress updates
   */
  unsubscribeFromProgress() {
    if (this.progressUnsubscribe) {
      this.progressUnsubscribe();
      this.progressUnsubscribe = null;
    }
  }

  // ============================================
  // HISTORY / AUDIT LOG
  // ============================================

  /**
   * Log an event to audit history
   *
   * @param {string} eventType - Event type (e.g., 'correct_answer', 'level_up')
   * @param {Object} eventData - Event data
   * @returns {Promise<string>} Event document ID
   *
   * @example
   * await sync.logEvent('correct_answer', {
   *   questionId: 'q_456',
   *   difficulty: 5,
   *   coins: 150,
   *   xp: 75
   * });
   */
  async logEvent(eventType, eventData) {
    try {
      const eventDoc = {
        eventType: eventType,
        userId: this.userId,
        timestamp: this._getServerTimestamp(),
        data: eventData
      };

      const docRef = await this.historyRef.add(eventDoc);
      return docRef.id;
    } catch (error) {
      console.error('Failed to log event:', error);
      // Don't throw - logging failures shouldn't break game flow
      return null;
    }
  }

  /**
   * Get user event history
   *
   * @param {number} limit - Maximum number of events (default 50)
   * @param {string} eventType - Filter by event type (optional)
   * @returns {Promise<Array>} Array of event objects
   *
   * @example
   * const history = await sync.getHistory(20, 'correct_answer');
   */
  async getHistory(limit = 50, eventType = null) {
    try {
      let query = this.historyRef
        .orderBy('timestamp', 'desc')
        .limit(limit);

      if (eventType) {
        query = query.where('eventType', '==', eventType);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Failed to get history:', error);
      return [];
    }
  }

  // ============================================
  // LEADERBOARD OPERATIONS
  // ============================================

  /**
   * Get weekly leaderboard
   *
   * @param {number} limit - Number of entries (default 100)
   * @returns {Promise<Array>} Leaderboard entries
   *
   * @example
   * const top100 = await sync.getWeeklyLeaderboard(100);
   */
  async getWeeklyLeaderboard(limit = 100) {
    try {
      const weekNumber = this._getISOWeekNumber(new Date());

      const snapshot = await this.leaderboardRef
        .doc('weekly')
        .collection(weekNumber.toString())
        .orderBy('weeklyXP', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map((doc, index) => ({
        rank: index + 1,
        userId: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Failed to get weekly leaderboard:', error);
      return [];
    }
  }

  /**
   * Get all-time leaderboard
   *
   * @param {number} limit - Number of entries
   * @returns {Promise<Array>} Leaderboard entries
   */
  async getAllTimeLeaderboard(limit = 100) {
    try {
      const snapshot = await this.leaderboardRef
        .doc('alltime')
        .collection('entries')
        .orderBy('allTimeScore', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map((doc, index) => ({
        rank: index + 1,
        userId: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Failed to get all-time leaderboard:', error);
      return [];
    }
  }

  /**
   * Get user's current rank
   *
   * @param {string} userId - User ID (defaults to current user)
   * @returns {Promise<Object>} {weeklyRank, allTimeRank}
   */
  async getUserRank(userId = null) {
    const targetUserId = userId || this.userId;

    try {
      const weekNumber = this._getISOWeekNumber(new Date());

      // Get weekly rank
      const weeklyDoc = await this.leaderboardRef
        .doc('weekly')
        .collection(weekNumber.toString())
        .doc(targetUserId)
        .get();

      // Get all-time rank
      const allTimeDoc = await this.leaderboardRef
        .doc('alltime')
        .collection('entries')
        .doc(targetUserId)
        .get();

      return {
        weeklyRank: weeklyDoc.exists ? weeklyDoc.data().rank : null,
        weeklyScore: weeklyDoc.exists ? weeklyDoc.data().weeklyXP : 0,
        allTimeRank: allTimeDoc.exists ? allTimeDoc.data().rank : null,
        allTimeScore: allTimeDoc.exists ? allTimeDoc.data().allTimeScore : 0
      };
    } catch (error) {
      console.error('Failed to get user rank:', error);
      return { weeklyRank: null, allTimeRank: null };
    }
  }

  /**
   * Update leaderboard entry (called by Cloud Function usually)
   *
   * @param {number} score - Score to update
   * @param {string} category - 'weekly' or 'alltime'
   * @returns {Promise<void>}
   */
  async updateLeaderboardScore(score, category = 'weekly') {
    try {
      const weekNumber = this._getISOWeekNumber(new Date());

      const collectionPath = category === 'weekly'
        ? `weekly/${weekNumber}/`
        : 'alltime/entries/';

      const docRef = this.leaderboardRef
        .doc(category)
        .collection(category === 'weekly' ? weekNumber.toString() : 'entries')
        .doc(this.userId);

      const updateData = {
        userId: this.userId,
        displayName: this.displayName,
        [category === 'weekly' ? 'weeklyXP' : 'allTimeScore']: score,
        lastUpdated: this._getServerTimestamp()
      };

      await docRef.set(updateData, { merge: true });
    } catch (error) {
      console.error('Failed to update leaderboard:', error);
    }
  }

  // ============================================
  // SHOP OPERATIONS
  // ============================================

  /**
   * Get shop items
   *
   * @returns {Promise<Array>} Shop items
   */
  async getShopItems() {
    try {
      const snapshot = await this.db
        .collection('casino-config')
        .doc('shop-items')
        .collection('items')
        .where('available', '==', true)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Failed to get shop items:', error);
      return [];
    }
  }

  /**
   * Get reward configuration
   *
   * @returns {Promise<Object>} Reward config
   */
  async getRewardConfig() {
    try {
      const doc = await this.db
        .collection('casino-config')
        .doc('reward-tables')
        .collection('versions')
        .doc('v2')
        .get();

      if (doc.exists) {
        return doc.data();
      }

      return null;
    } catch (error) {
      console.error('Failed to get reward config:', error);
      return null;
    }
  }

  // ============================================
  // OFFLINE SUPPORT
  // ============================================

  /**
   * Set up network listeners
   *
   * @private
   */
  _setupNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('🌐 Back online');
      this.isOnline = true;
      this._processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      console.log('📡 Offline mode');
      this.isOnline = false;
    });
  }

  /**
   * Process queued operations when back online
   *
   * @private
   */
  async _processOfflineQueue() {
    if (this.offlineQueue.length === 0) return;

    console.log(`Processing ${this.offlineQueue.length} queued operations...`);

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const operation of queue) {
      try {
        switch (operation.type) {
          case 'saveProgress':
            await this.saveProgress(operation.data, operation.merge);
            break;
          case 'logEvent':
            await this.logEvent(operation.eventType, operation.data);
            break;
          default:
            console.warn('Unknown operation type:', operation.type);
        }
      } catch (error) {
        console.error('Failed to process queued operation:', error);
        // Re-queue failed operations
        this.offlineQueue.push(operation);
      }
    }

    console.log('✅ Offline queue processed');
  }

  /**
   * Get offline queue size
   *
   * @returns {number} Number of queued operations
   */
  getOfflineQueueSize() {
    return this.offlineQueue.length;
  }

  /**
   * Clear offline queue
   */
  clearOfflineQueue() {
    this.offlineQueue = [];
  }

  // ============================================
  // CLEANUP
  // ============================================

  /**
   * Cleanup subscriptions and listeners
   */
  destroy() {
    this.unsubscribeFromProgress();

    if (this.leaderboardUnsubscribe) {
      this.leaderboardUnsubscribe();
      this.leaderboardUnsubscribe = null;
    }

    // Remove network listeners
    // (In production, store references to remove properly)

    console.log('FirebaseSync destroyed');
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Get server timestamp
   *
   * @private
   */
  _getServerTimestamp() {
    // Use Firestore server timestamp if available
    if (this.db.FieldValue && this.db.FieldValue.serverTimestamp) {
      return this.db.FieldValue.serverTimestamp();
    }

    // Fallback to client timestamp
    return new Date().toISOString();
  }

  /**
   * Get default progress object
   *
   * @private
   */
  _getDefaultProgress() {
    return {
      userId: this.userId,
      coins: 0,
      gems: 0,
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      totalXpEarned: 0,
      tier: 'bronze',
      tierProgress: 0,
      currentStreak: 0,
      longestStreak: 0,
      streakMultiplier: 1.0,
      lastAnswerTimestamp: null,
      stats: {
        totalQuestionsAnswered: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        accuracy: 0,
        totalStudyTimeMinutes: 0,
        sessionsCompleted: 0
      },
      daily: {
        lastLoginDate: new Date().toISOString().split('T')[0],
        consecutiveDays: 1,
        dailyWheelLastSpin: null,
        dailyBonusMultiplier: 1.0
      },
      jackpot: {
        questionsUntilNext: 15,
        totalJackpotsTriggered: 0,
        totalJackpotsCompleted: 0
      },
      achievements: {
        unlockedBadges: [],
        unlockedAvatars: ['default'],
        unlockedThemes: ['default'],
        currentAvatar: 'default',
        currentTheme: 'default'
      },
      inventory: {
        streakFreeze: 0,
        xpBooster: 0,
        heartRefill: 0,
        mysteryBox: 0
      },
      settings: {
        displayNameOnLeaderboard: true,
        soundEffectsEnabled: true,
        confettiEnabled: true,
        reducedMotion: false
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Fallback debounce
   *
   * @private
   */
  _fallbackDebounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /**
   * Fallback week number calculation
   *
   * @private
   */
  _fallbackWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.FirebaseSync = FirebaseSync;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FirebaseSync;
}
