/**
 * Casino Module - Main Game Engine
 *
 * Coordinates all casino mechanics: rewards, streaks, levels, jackpots.
 * Integrates StateManager, RewardCalculator, and FirebaseSync.
 * Emits events for UI components to subscribe to.
 *
 * @module casino/core/CasinoEngine
 * @author CollegeClimb Casino Team
 * @version 1.0.0
 */

class CasinoEngine {
  /**
   * Create a new CasinoEngine instance
   *
   * @param {Object} options - Configuration options
   * @param {string} options.userId - User ID (required)
   * @param {Object} options.firebaseDb - Firestore database (required)
   * @param {string} options.displayName - User display name (optional)
   * @param {Object} options.rewardConfig - Custom reward config (optional)
   *
   * @example
   * const engine = new CasinoEngine({
   *   userId: 'user123',
   *   firebaseDb: db,
   *   displayName: 'John D.'
   * });
   *
   * await engine.initialize();
   */
  constructor(options = {}) {
    if (!options.userId) {
      throw new Error('userId is required');
    }
    if (!options.firebaseDb) {
      throw new Error('firebaseDb is required');
    }

    this.userId = options.userId;
    this.db = options.firebaseDb;
    this.displayName = options.displayName || 'Anonymous';

    // Initialize core modules
    this.state = new (window.StateManager || StateManager)({});
    this.rewardCalc = new (window.RewardCalculator || RewardCalculator)(options.rewardConfig);
    this.firebaseSync = new (window.FirebaseSync || FirebaseSync)(
      this.db,
      this.userId,
      this.displayName
    );

    // Event system
    this.eventListeners = new Map();

    // Session tracking
    this.session = {
      startTime: Date.now(),
      questionsAnswered: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      coinsEarned: 0,
      xpEarned: 0
    };

    // Initialization flag
    this.initialized = false;

    console.log('🎰 CasinoEngine created for user:', this.userId);
  }

  // ============================================
  // LIFECYCLE METHODS
  // ============================================

  /**
   * Initialize the casino engine
   * Loads user progress from Firebase and sets up state
   *
   * @returns {Promise<void>}
   *
   * @example
   * await engine.initialize();
   * console.log('Coins:', engine.getCoins());
   */
  async initialize() {
    if (this.initialized) {
      console.warn('CasinoEngine already initialized');
      return;
    }

    try {
      // Initialize Firebase sync
      await this.firebaseSync.initialize();

      // Load user progress
      const progress = await this.firebaseSync.loadProgress();

      // Set initial state
      this.state.setAll({ progress });

      // Subscribe to state changes for auto-save
      this._setupAutoSave();

      // Check daily login
      await this._checkDailyLogin();

      this.initialized = true;

      this.emit('initialized', { progress });
      console.log('✅ CasinoEngine initialized');
    } catch (error) {
      console.error('Failed to initialize CasinoEngine:', error);
      throw error;
    }
  }

  /**
   * Destroy the engine and cleanup
   */
  destroy() {
    this.firebaseSync.destroy();
    this.eventListeners.clear();
    this.initialized = false;
    console.log('CasinoEngine destroyed');
  }

  // ============================================
  // CORE GAME METHODS
  // ============================================

  /**
   * Process correct answer
   * Awards coins, XP, checks for level ups, mystery rewards, jackpots
   *
   * @param {Object} questionData - Question data
   * @param {string} questionData.questionId - Question ID
   * @param {number|string} questionData.difficulty - Difficulty (1-10 or easy/medium/hard)
   * @param {number} questionData.timeSpent - Time spent in seconds
   * @param {string} questionData.subject - Subject (optional)
   * @returns {Promise<Object>} Reward data
   *
   * @example
   * const result = await engine.processCorrectAnswer({
   *   questionId: 'q_sat_math_42',
   *   difficulty: 5,
   *   timeSpent: 47,
   *   subject: 'sat-math'
   * });
   *
   * console.log(`Earned: ${result.coins} coins, ${result.xp} XP`);
   * console.log(`Streak: ${result.streak}, Multiplier: ${result.multiplier}x`);
   */
  async processCorrectAnswer(questionData) {
    this._ensureInitialized();

    const { questionId, difficulty, timeSpent, subject } = questionData;
    const progress = this.state.get('progress');

    // Increment streak
    const newStreak = progress.currentStreak + 1;
    if (newStreak > progress.longestStreak) {
      this.state.set('progress.longestStreak', newStreak);
    }
    this.state.set('progress.currentStreak', newStreak);

    // Get streak multiplier
    const streakInfo = this.rewardCalc.getStreakMultiplier(newStreak);
    this.state.set('progress.streakMultiplier', streakInfo.multiplier);

    // Calculate base rewards
    const baseCoins = this.rewardCalc.calculateBaseCoins(difficulty, timeSpent);
    const baseXP = this.rewardCalc.calculateBaseXP(difficulty, timeSpent);

    // Apply multipliers
    const totalMultiplier = this.rewardCalc.getTotalMultiplier(
      streakInfo.multiplier,
      progress.daily?.dailyBonusMultiplier || 1.0,
      1.0 // event multiplier (future)
    );

    const earnedCoins = Math.floor(baseCoins * totalMultiplier);
    const earnedXP = Math.floor(baseXP * totalMultiplier);

    // Update coins and XP
    this.state.update('progress.coins', (coins) => coins + earnedCoins);
    this.state.update('progress.xp', (xp) => xp + earnedXP);
    this.state.update('progress.totalXpEarned', (xp) => xp + earnedXP);

    // Update stats
    this.state.update('progress.stats.totalQuestionsAnswered', (n) => n + 1);
    this.state.update('progress.stats.correctAnswers', (n) => n + 1);
    this._updateAccuracy();

    // Update session
    this.session.questionsAnswered++;
    this.session.correctAnswers++;
    this.session.coinsEarned += earnedCoins;
    this.session.xpEarned += earnedXP;

    // Check for level up
    const levelUpData = this._checkLevelUp();

    // Roll for mystery reward
    const mysteryReward = this.rewardCalc.rollMysteryReward(
      this.userId,
      questionId,
      Date.now()
    );

    // Apply mystery reward
    if (mysteryReward) {
      await this._applyMysteryReward(mysteryReward);
    }

    // Check jackpot trigger
    const jackpotData = await this._checkJackpotTrigger();

    // Update last answer timestamp
    this.state.set('progress.lastAnswerTimestamp', new Date().toISOString());

    // Log to Firebase history
    await this.firebaseSync.logEvent('correct_answer', {
      questionId,
      difficulty,
      timeSpent,
      subject,
      coins: earnedCoins,
      xp: earnedXP,
      streak: newStreak,
      multiplier: totalMultiplier
    });

    // Prepare result object
    const result = {
      coins: earnedCoins,
      xp: earnedXP,
      baseCoins,
      baseXP,
      multiplier: totalMultiplier,
      streak: newStreak,
      streakInfo,
      mysteryReward,
      levelUpData,
      jackpotData,
      progress: this.state.get('progress')
    };

    // Emit event
    this.emit('correctAnswer', result);

    return result;
  }

  /**
   * Process incorrect answer
   * Breaks streak, loses heart, updates stats
   *
   * @param {Object} questionData - Question data
   * @returns {Promise<Object>} Result data
   *
   * @example
   * const result = await engine.processIncorrectAnswer({
   *   questionId: 'q_sat_math_43'
   * });
   *
   * console.log('Streak broken:', result.streakBroken);
   */
  async processIncorrectAnswer(questionData) {
    this._ensureInitialized();

    const { questionId } = questionData;
    const progress = this.state.get('progress');

    // Check if streak was active
    const streakBroken = progress.currentStreak > 0;
    const brokenStreakValue = progress.currentStreak;

    // Reset streak
    this.state.set('progress.currentStreak', 0);
    this.state.set('progress.streakMultiplier', 1.0);

    // Update stats
    this.state.update('progress.stats.totalQuestionsAnswered', (n) => n + 1);
    this.state.update('progress.stats.incorrectAnswers', (n) => n + 1);
    this._updateAccuracy();

    // Update session
    this.session.questionsAnswered++;
    this.session.incorrectAnswers++;

    // Log to Firebase
    await this.firebaseSync.logEvent('incorrect_answer', {
      questionId,
      streakBroken,
      brokenStreakValue
    });

    const result = {
      streakBroken,
      brokenStreakValue,
      progress: this.state.get('progress')
    };

    this.emit('incorrectAnswer', result);

    return result;
  }

  /**
   * Trigger jackpot bonus round
   *
   * @returns {Promise<Object>} Jackpot reward data
   *
   * @example
   * const jackpot = await engine.triggerJackpot();
   * console.log(`Jackpot: ${jackpot.coins} coins!`);
   */
  async triggerJackpot() {
    this._ensureInitialized();

    const progress = this.state.get('progress');

    // Calculate jackpot reward
    const jackpotReward = this.rewardCalc.calculateJackpotReward(
      progress.level,
      progress.currentStreak
    );

    // Award jackpot
    this.state.update('progress.coins', (coins) => coins + jackpotReward.coins);
    this.state.update('progress.xp', (xp) => xp + jackpotReward.xp);
    this.state.update('progress.totalXpEarned', (xp) => xp + jackpotReward.xp);

    // Update jackpot stats
    this.state.update('progress.jackpot.totalJackpotsTriggered', (n) => n + 1);
    this.state.set('progress.jackpot.lastJackpotDate', new Date().toISOString());

    // Record highest jackpot
    if (jackpotReward.coins > (progress.jackpot?.highestJackpotCoins || 0)) {
      this.state.set('progress.jackpot.highestJackpotCoins', jackpotReward.coins);
    }

    // Calculate next jackpot trigger
    const nextJackpot = this.rewardCalc.calculateNextJackpotTrigger(
      this.userId,
      progress.stats.totalQuestionsAnswered
    );
    this.state.set('progress.jackpot.questionsUntilNext', nextJackpot);

    // Log event
    await this.firebaseSync.logEvent('jackpot_triggered', jackpotReward);

    // Check for level up (jackpot gives XP)
    const levelUpData = this._checkLevelUp();

    const result = {
      ...jackpotReward,
      levelUpData
    };

    this.emit('jackpotTriggered', result);

    return result;
  }

  /**
   * Spin daily bonus wheel
   *
   * @returns {Promise<Object>} Prize data
   *
   * @example
   * const prize = await engine.spinDailyWheel();
   * console.log(`Won: ${prize.label}`);
   */
  async spinDailyWheel() {
    this._ensureInitialized();

    const progress = this.state.get('progress');
    const today = new Date().toISOString().split('T')[0];

    // Check if already spun today
    if (progress.daily?.dailyWheelLastSpin === today) {
      throw new Error('Already spun the wheel today');
    }

    // Determine prize (deterministic based on user + date)
    const prize = this.rewardCalc.determineDailyWheelPrize(this.userId, today);

    // Apply prize
    switch (prize.type) {
      case 'coins':
        this.state.update('progress.coins', (coins) => coins + prize.amount);
        break;
      case 'xp':
        this.state.update('progress.xp', (xp) => xp + prize.amount);
        this.state.update('progress.totalXpEarned', (xp) => xp + prize.amount);
        break;
      case 'item':
        // Add item to inventory
        if (prize.itemId) {
          this.state.update(`progress.inventory.${prize.itemId}`, (n) => (n || 0) + 1);
        }
        break;
      case 'jackpot':
        // Trigger immediate jackpot
        await this.triggerJackpot();
        break;
    }

    // Update daily wheel stats
    this.state.set('progress.daily.dailyWheelLastSpin', today);
    this.state.update('progress.daily.dailyWheelSpinsTotal', (n) => (n || 0) + 1);

    // Log event
    await this.firebaseSync.logEvent('daily_wheel_spin', prize);

    // Check for level up (if XP awarded)
    const levelUpData = prize.type === 'xp' ? this._checkLevelUp() : null;

    const result = {
      prize,
      levelUpData
    };

    this.emit('dailyWheelSpin', result);

    return result;
  }

  /**
   * Purchase item from shop
   *
   * @param {string} itemId - Item ID
   * @returns {Promise<Object>} Purchase result
   */
  async purchaseShopItem(itemId) {
    this._ensureInitialized();

    const progress = this.state.get('progress');

    // Get shop items (would be from Firebase in production)
    // For now, use basic validation
    const itemCosts = {
      streak_freeze: 500,
      xp_booster: 300,
      heart_refill: 200,
      mystery_box: 1000
    };

    const cost = itemCosts[itemId];
    if (!cost) {
      throw new Error(`Unknown item: ${itemId}`);
    }

    if (progress.coins < cost) {
      throw new Error(`Insufficient coins (need ${cost}, have ${progress.coins})`);
    }

    // Deduct coins
    this.state.update('progress.coins', (coins) => coins - cost);

    // Add item to inventory
    this.state.update(`progress.inventory.${itemId}`, (n) => (n || 0) + 1);

    // Log event
    await this.firebaseSync.logEvent('shop_purchase', {
      itemId,
      cost
    });

    const result = {
      itemId,
      cost,
      newBalance: this.state.get('progress.coins')
    };

    this.emit('shopPurchase', result);

    return result;
  }

  // ============================================
  // GETTERS
  // ============================================

  /**
   * Get current coins
   *
   * @returns {number} Coins
   */
  getCoins() {
    return this.state.get('progress.coins', 0);
  }

  /**
   * Get current level
   *
   * @returns {number} Level
   */
  getLevel() {
    return this.state.get('progress.level', 1);
  }

  /**
   * Get current XP
   *
   * @returns {number} XP
   */
  getXP() {
    return this.state.get('progress.xp', 0);
  }

  /**
   * Get current streak
   *
   * @returns {number} Streak
   */
  getStreak() {
    return this.state.get('progress.currentStreak', 0);
  }

  /**
   * Get complete progress object
   *
   * @returns {Object} Progress
   */
  getProgress() {
    return this.state.get('progress');
  }

  /**
   * Get session stats
   *
   * @returns {Object} Session stats
   */
  getSessionStats() {
    return { ...this.session };
  }

  // ============================================
  // EVENT SYSTEM
  // ============================================

  /**
   * Subscribe to events
   *
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   *
   * @example
   * const unsub = engine.on('correctAnswer', (data) => {
   *   console.log('Correct!', data);
   * });
   *
   * // Later:
   * unsub();
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }

    this.eventListeners.get(event).add(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from event
   *
   * @param {string} event - Event name
   * @param {Function} callback - Callback to remove
   */
  off(event, callback) {
    const callbacks = this.eventListeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Emit event to all subscribers
   *
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    const callbacks = this.eventListeners.get(event);
    if (callbacks) {
      for (const callback of callbacks) {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for '${event}':`, error);
        }
      }
    }
  }

  // ============================================
  // INTERNAL METHODS
  // ============================================

  /**
   * Ensure engine is initialized
   *
   * @private
   */
  _ensureInitialized() {
    if (!this.initialized) {
      throw new Error('CasinoEngine not initialized. Call initialize() first.');
    }
  }

  /**
   * Set up auto-save (debounced saves on state changes)
   *
   * @private
   */
  _setupAutoSave() {
    this.state.subscribe('progress', (newProgress) => {
      // Debounced save to Firebase
      this.firebaseSync.saveProgressDebounced(newProgress, true);
    });
  }

  /**
   * Check daily login and update streak
   *
   * @private
   */
  async _checkDailyLogin() {
    const progress = this.state.get('progress');
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = progress.daily?.lastLoginDate;

    if (lastLogin !== today) {
      // New day
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastLogin === yesterdayStr) {
        // Consecutive day
        this.state.update('progress.daily.consecutiveDays', (n) => n + 1);
      } else {
        // Streak broken
        this.state.set('progress.daily.consecutiveDays', 1);
      }

      this.state.set('progress.daily.lastLoginDate', today);

      // Apply daily bonus multiplier (1.5x for 24 hours)
      this.state.set('progress.daily.dailyBonusMultiplier', 1.5);

      this.emit('dailyLogin', {
        consecutiveDays: this.state.get('progress.daily.consecutiveDays')
      });
    }
  }

  /**
   * Update accuracy percentage
   *
   * @private
   */
  _updateAccuracy() {
    const stats = this.state.get('progress.stats');
    const accuracy = (stats.correctAnswers / stats.totalQuestionsAnswered) * 100;
    this.state.set('progress.stats.accuracy', Math.round(accuracy * 10) / 10);
  }

  /**
   * Check for level up
   *
   * @private
   * @returns {Object|null} Level up data or null
   */
  _checkLevelUp() {
    const progress = this.state.get('progress');
    const currentLevel = progress.level;
    const totalXP = progress.totalXpEarned;

    const newLevel = this.rewardCalc.calculateLevelFromXP(totalXP);

    if (newLevel > currentLevel) {
      this.state.set('progress.level', newLevel);

      // Check tier upgrade
      const tierUpgrade = this.rewardCalc.checkTierUpgrade(currentLevel, newLevel);
      if (tierUpgrade) {
        this.state.set('progress.tier', tierUpgrade.newTier);
      }

      // Calculate XP to next level
      const xpToNext = this.rewardCalc.calculateXPToNextLevel(newLevel, totalXP);
      this.state.set('progress.xpToNextLevel', xpToNext);

      // Calculate tier progress
      const tierProgress = this.rewardCalc.calculateTierProgress(newLevel);
      this.state.set('progress.tierProgress', tierProgress);

      const levelUpData = {
        oldLevel: currentLevel,
        newLevel: newLevel,
        tier: progress.tier,
        tierUpgrade: tierUpgrade
      };

      this.emit('levelUp', levelUpData);

      return levelUpData;
    }

    return null;
  }

  /**
   * Check if jackpot should trigger
   *
   * @private
   * @returns {Promise<Object|null>} Jackpot data or null
   */
  async _checkJackpotTrigger() {
    const progress = this.state.get('progress');

    // Decrement counter
    const questionsUntil = progress.jackpot?.questionsUntilNext || 15;
    const newCount = questionsUntil - 1;

    this.state.set('progress.jackpot.questionsUntilNext', newCount);

    if (newCount <= 0) {
      // Trigger jackpot
      return await this.triggerJackpot();
    }

    return null;
  }

  /**
   * Apply mystery reward
   *
   * @private
   */
  async _applyMysteryReward(reward) {
    switch (reward.type) {
      case 'coins':
        this.state.update('progress.coins', (coins) => coins + reward.amount);
        break;
      case 'xp':
        this.state.update('progress.xp', (xp) => xp + reward.amount);
        this.state.update('progress.totalXpEarned', (xp) => xp + reward.amount);
        break;
      case 'item':
        if (reward.id) {
          this.state.update(`progress.inventory.${reward.id}`, (n) => (n || 0) + 1);
        }
        break;
      case 'badge':
        if (reward.id && !this.state.get('progress.achievements.unlockedBadges').includes(reward.id)) {
          this.state.update('progress.achievements.unlockedBadges', (badges) => [...badges, reward.id]);
        }
        break;
      case 'avatar':
        if (reward.id && !this.state.get('progress.achievements.unlockedAvatars').includes(reward.id)) {
          this.state.update('progress.achievements.unlockedAvatars', (avatars) => [...avatars, reward.id]);
        }
        break;
      case 'theme':
        if (reward.id && !this.state.get('progress.achievements.unlockedThemes').includes(reward.id)) {
          this.state.update('progress.achievements.unlockedThemes', (themes) => [...themes, reward.id]);
        }
        break;
    }
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.CasinoEngine = CasinoEngine;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CasinoEngine;
}
