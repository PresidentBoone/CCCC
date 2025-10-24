/**
 * Casino Module - Reward Calculator
 *
 * Deterministic reward calculation system (no true randomness).
 * All "random" rewards are seeded by user actions for auditability.
 * Calculates coins, XP, levels, tiers, and mystery rewards.
 *
 * @module casino/core/RewardCalculator
 * @author CollegeClimb Casino Team
 * @version 1.0.0
 */

class RewardCalculator {
  /**
   * Create a new RewardCalculator
   *
   * @param {Object} rewardConfig - Reward configuration from Firebase /casino-config/reward-tables
   *
   * @example
   * const calc = new RewardCalculator(rewardConfig);
   * const seed = calc.generateRewardSeed('user123', 'q_456', Date.now());
   * const rarity = calc.determineMysteryRarity(seed);
   */
  constructor(rewardConfig) {
    this.config = rewardConfig || this._getDefaultConfig();

    // Get helper functions
    const helpers = window.CasinoHelpers || {};
    this._hashString = helpers.hashString || this._fallbackHash;
    this._normalizeHash = helpers.normalizeHash || this._fallbackNormalize;
    this._clamp = helpers.clamp || ((val, min, max) => Math.min(Math.max(val, min), max));
  }

  // ============================================
  // DETERMINISTIC REWARD GENERATION
  // ============================================

  /**
   * Generate deterministic seed for rewards
   * Same inputs always produce same seed (no Math.random())
   *
   * @param {string} userId - User ID
   * @param {string} questionId - Question ID
   * @param {number} timestamp - Timestamp (ms)
   * @returns {number} Normalized seed (0-1)
   *
   * @example
   * const seed = calc.generateRewardSeed('user123', 'q_sat_math_42', 1729800000);
   * // → 0.6273... (deterministic, always same for these inputs)
   */
  generateRewardSeed(userId, questionId, timestamp) {
    const seedString = `${userId}-${questionId}-${timestamp}`;
    const hash = this._hashString(seedString);
    return this._normalizeHash(hash);
  }

  /**
   * Determine mystery reward rarity based on seed
   * Uses cumulative probability distribution
   *
   * @param {number} seed - Seed from generateRewardSeed() (0-1)
   * @returns {string} Rarity: common, uncommon, rare, epic, legendary
   *
   * @example
   * const rarity = calc.determineMysteryRarity(0.75);
   * // → 'uncommon' (seed falls in uncommon range)
   */
  determineMysteryRarity(seed) {
    const rewards = this.config.mysteryRewards;
    let cumulative = 0;

    for (const rarity of ['common', 'uncommon', 'rare', 'epic', 'legendary']) {
      cumulative += rewards[rarity]?.probability || 0;
      if (seed <= cumulative) {
        return rarity;
      }
    }

    return 'common'; // fallback
  }

  /**
   * Select specific reward from rarity tier
   * Uses seed to pick from available rewards for that rarity
   *
   * @param {string} rarity - Rarity tier
   * @param {number} seed - Seed for selection
   * @returns {Object} Reward object {type, amount/id, rarity}
   *
   * @example
   * const reward = calc.selectRewardFromRarity('rare', 0.5);
   * // → {type: 'coins', amount: 350, rarity: 'rare'}
   */
  selectRewardFromRarity(rarity, seed) {
    const rarityConfig = this.config.mysteryRewards[rarity];
    if (!rarityConfig || !rarityConfig.rewards) {
      return { type: 'coins', amount: 50, rarity: 'common' };
    }

    const rewards = rarityConfig.rewards;
    const index = Math.floor(seed * rewards.length);
    const selectedReward = rewards[index] || rewards[0];

    // Calculate amount if min/max range provided
    let amount = selectedReward.amount;
    if (selectedReward.min && selectedReward.max) {
      const range = selectedReward.max - selectedReward.min;
      amount = selectedReward.min + Math.floor(seed * range);
    }

    return {
      type: selectedReward.type,
      amount: amount,
      id: selectedReward.id || selectedReward.itemId || selectedReward.badgeId || selectedReward.avatarId || selectedReward.themeId,
      rarity: rarity
    };
  }

  /**
   * Roll for mystery reward (complete flow)
   * Returns null if no reward triggered
   *
   * @param {string} userId - User ID
   * @param {string} questionId - Question ID
   * @param {number} timestamp - Timestamp (optional, defaults to now)
   * @returns {Object|null} Reward object or null
   */
  rollMysteryReward(userId, questionId, timestamp = Date.now()) {
    const seed = this.generateRewardSeed(userId, questionId, timestamp);
    const rarity = this.determineMysteryRarity(seed);

    // Use second seed for reward selection within rarity
    const selectionSeed = this._normalizeHash(this._hashString(`${seed}-${rarity}`));
    const reward = this.selectRewardFromRarity(rarity, selectionSeed);

    return reward;
  }

  // ============================================
  // BASE REWARD CALCULATION
  // ============================================

  /**
   * Calculate base coin reward for correct answer
   *
   * @param {number|string} difficulty - Question difficulty (1-10 or 'easy'/'medium'/'hard')
   * @param {number} timeSpent - Time spent in seconds
   * @returns {number} Base coin amount
   *
   * @example
   * calc.calculateBaseCoins(5, 47); // → 100
   * calc.calculateBaseCoins('hard', 120); // → 150
   */
  calculateBaseCoins(difficulty, timeSpent = 0) {
    // Convert string difficulty to number
    const difficultyMap = { easy: 3, medium: 5, hard: 8 };
    const difficultyNum = typeof difficulty === 'string'
      ? (difficultyMap[difficulty] || 5)
      : this._clamp(difficulty, 1, 10);

    // Base coins scale with difficulty
    let baseCoins = 50 + (difficultyNum * 10);

    // Time bonus (faster = more coins, up to 20% bonus)
    if (timeSpent > 0) {
      const optimalTime = 60; // 60 seconds is optimal
      if (timeSpent < optimalTime) {
        const speedBonus = Math.floor(baseCoins * 0.2 * (1 - timeSpent / optimalTime));
        baseCoins += speedBonus;
      }
    }

    return Math.floor(baseCoins);
  }

  /**
   * Calculate base XP reward for correct answer
   *
   * @param {number|string} difficulty - Question difficulty
   * @param {number} timeSpent - Time spent in seconds
   * @returns {number} Base XP amount
   */
  calculateBaseXP(difficulty, timeSpent = 0) {
    const difficultyMap = { easy: 3, medium: 5, hard: 8 };
    const difficultyNum = typeof difficulty === 'string'
      ? (difficultyMap[difficulty] || 5)
      : this._clamp(difficulty, 1, 10);

    // Base XP scales with difficulty
    let baseXP = 25 + (difficultyNum * 5);

    // Time bonus (similar to coins)
    if (timeSpent > 0 && timeSpent < 60) {
      const speedBonus = Math.floor(baseXP * 0.2 * (1 - timeSpent / 60));
      baseXP += speedBonus;
    }

    return Math.floor(baseXP);
  }

  // ============================================
  // STREAK CALCULATIONS
  // ============================================

  /**
   * Get streak multiplier based on current streak
   *
   * @param {number} streak - Current streak count
   * @returns {Object} {multiplier, label, milestone}
   *
   * @example
   * calc.getStreakMultiplier(5);
   * // → {multiplier: 2.0, label: 'Hot Streak! 🔥🔥', milestone: true}
   */
  getStreakMultiplier(streak) {
    const multipliers = this.config.streakMultipliers || [
      { streakCount: 1, multiplier: 1.0, label: null },
      { streakCount: 3, multiplier: 1.5, label: 'Getting Warm 🔥' },
      { streakCount: 5, multiplier: 2.0, label: 'Hot Streak! 🔥🔥' },
      { streakCount: 10, multiplier: 3.0, label: 'On Fire! 🔥🔥🔥' },
      { streakCount: 15, multiplier: 5.0, label: 'Blazing! 🔥🔥🔥🔥' },
      { streakCount: 20, multiplier: 10.0, label: 'UNSTOPPABLE! 🔥🔥🔥🔥🔥' }
    ];

    // Find highest applicable multiplier
    let current = multipliers[0];
    let milestone = false;

    for (const config of multipliers) {
      if (streak >= config.streakCount) {
        milestone = (streak === config.streakCount); // Exactly at milestone
        current = config;
      } else {
        break;
      }
    }

    return {
      multiplier: current.multiplier,
      label: current.label,
      milestone: milestone,
      nextMilestone: this._getNextMilestone(streak, multipliers)
    };
  }

  /**
   * Get next streak milestone
   *
   * @private
   */
  _getNextMilestone(currentStreak, multipliers) {
    for (const config of multipliers) {
      if (currentStreak < config.streakCount) {
        return {
          streakRequired: config.streakCount,
          multiplier: config.multiplier,
          label: config.label
        };
      }
    }
    return null; // At max multiplier
  }

  /**
   * Calculate total multiplier (streak + daily + events)
   *
   * @param {number} streakMultiplier - Streak multiplier
   * @param {number} dailyMultiplier - Daily login bonus multiplier
   * @param {number} eventMultiplier - Special event multiplier
   * @returns {number} Total multiplier
   */
  getTotalMultiplier(streakMultiplier = 1, dailyMultiplier = 1, eventMultiplier = 1) {
    return streakMultiplier * dailyMultiplier * eventMultiplier;
  }

  // ============================================
  // LEVEL & TIER CALCULATIONS
  // ============================================

  /**
   * Calculate XP required for a specific level
   * Uses exponential curve for scaling
   *
   * @param {number} level - Target level
   * @returns {number} Total XP required to reach that level
   *
   * @example
   * calc.calculateXPForLevel(1); // → 0
   * calc.calculateXPForLevel(10); // → 2,500
   * calc.calculateXPForLevel(50); // → 50,000
   */
  calculateXPForLevel(level) {
    if (level <= 1) return 0;

    // Check config first
    if (this.config.levelRequirements) {
      const req = this.config.levelRequirements.find(r => r.level === level);
      if (req) return req.xpRequired;
    }

    // Exponential formula: XP = 100 * (level^2) - 100
    return Math.floor(100 * Math.pow(level, 2) - 100);
  }

  /**
   * Calculate level from total XP
   *
   * @param {number} totalXP - Total XP earned
   * @returns {number} Current level
   */
  calculateLevelFromXP(totalXP) {
    if (totalXP <= 0) return 1;

    // Binary search for level (efficient for large XP values)
    let low = 1;
    let high = 100; // Max level

    while (low < high) {
      const mid = Math.floor((low + high + 1) / 2);
      const requiredXP = this.calculateXPForLevel(mid);

      if (totalXP >= requiredXP) {
        low = mid;
      } else {
        high = mid - 1;
      }
    }

    return low;
  }

  /**
   * Calculate XP needed for next level
   *
   * @param {number} currentLevel - Current level
   * @param {number} currentXP - Current total XP
   * @returns {number} XP needed for next level
   */
  calculateXPToNextLevel(currentLevel, currentXP) {
    const nextLevelXP = this.calculateXPForLevel(currentLevel + 1);
    return Math.max(0, nextLevelXP - currentXP);
  }

  /**
   * Get tier for level
   *
   * @param {number} level - Current level
   * @returns {string} Tier name (bronze, silver, gold, platinum, diamond, legend)
   *
   * @example
   * calc.getTierForLevel(5); // → 'bronze'
   * calc.getTierForLevel(15); // → 'silver'
   */
  getTierForLevel(level) {
    if (level >= 75) return 'legend';
    if (level >= 50) return 'diamond';
    if (level >= 30) return 'platinum';
    if (level >= 20) return 'gold';
    if (level >= 10) return 'silver';
    return 'bronze';
  }

  /**
   * Check if level up causes tier upgrade
   *
   * @param {number} oldLevel - Previous level
   * @param {number} newLevel - New level
   * @returns {Object|null} Tier upgrade info or null
   */
  checkTierUpgrade(oldLevel, newLevel) {
    const oldTier = this.getTierForLevel(oldLevel);
    const newTier = this.getTierForLevel(newLevel);

    if (oldTier !== newTier) {
      return {
        oldTier: oldTier,
        newTier: newTier,
        tierUpgraded: true
      };
    }

    return null;
  }

  /**
   * Calculate tier progress (0-1 within current tier)
   *
   * @param {number} level - Current level
   * @returns {number} Progress (0-1)
   */
  calculateTierProgress(level) {
    const tier = this.getTierForLevel(level);
    const tierRanges = {
      bronze: { min: 1, max: 9 },
      silver: { min: 10, max: 19 },
      gold: { min: 20, max: 29 },
      platinum: { min: 30, max: 49 },
      diamond: { min: 50, max: 74 },
      legend: { min: 75, max: 100 }
    };

    const range = tierRanges[tier];
    if (!range) return 0;

    const progress = (level - range.min) / (range.max - range.min + 1);
    return this._clamp(progress, 0, 1);
  }

  // ============================================
  // DAILY WHEEL CALCULATIONS
  // ============================================

  /**
   * Determine daily wheel prize (deterministic based on date)
   *
   * @param {string} userId - User ID
   * @param {string} date - ISO date string (YYYY-MM-DD)
   * @returns {Object} Prize object {id, type, amount, label}
   *
   * @example
   * const prize = calc.determineDailyWheelPrize('user123', '2025-10-24');
   * // → {id: 3, type: 'xp', amount: 150, label: '150 XP'}
   */
  determineDailyWheelPrize(userId, date) {
    const prizes = this.config.dailyWheelPrizes || this._getDefaultWheelPrizes();

    // Generate seed from userId + date (deterministic per user per day)
    const seed = this.generateRewardSeed(userId, `wheel-${date}`, 0);

    // Calculate prize index based on cumulative probability
    let cumulative = 0;
    for (const prize of prizes) {
      cumulative += prize.probability;
      if (seed <= cumulative) {
        return prize;
      }
    }

    return prizes[0]; // fallback to first prize
  }

  /**
   * Get default wheel prizes
   *
   * @private
   */
  _getDefaultWheelPrizes() {
    return [
      { id: 1, type: 'coins', amount: 100, probability: 0.25, label: '100 Coins' },
      { id: 2, type: 'coins', amount: 250, probability: 0.20, label: '250 Coins' },
      { id: 3, type: 'xp', amount: 150, probability: 0.20, label: '150 XP' },
      { id: 4, type: 'coins', amount: 500, probability: 0.15, label: '500 Coins' },
      { id: 5, type: 'item', itemId: 'xp_booster', probability: 0.10, label: 'XP Booster' },
      { id: 6, type: 'coins', amount: 1000, probability: 0.05, label: '1000 Coins!' },
      { id: 7, type: 'xp', amount: 500, probability: 0.04, label: '500 XP!' },
      { id: 8, type: 'jackpot', probability: 0.01, label: 'JACKPOT!' }
    ];
  }

  // ============================================
  // JACKPOT CALCULATIONS
  // ============================================

  /**
   * Calculate jackpot reward based on user level
   *
   * @param {number} level - User level
   * @param {number} streak - Current streak (bonus)
   * @returns {Object} {coins, xp, multiplier}
   */
  calculateJackpotReward(level, streak = 0) {
    // Base jackpot scales with level
    const baseCoins = 500 + (level * 50);
    const baseXP = 250 + (level * 25);

    // Streak bonus (up to 2x for streak >= 10)
    const streakBonus = Math.min(2.0, 1.0 + (streak / 20));

    return {
      coins: Math.floor(baseCoins * streakBonus),
      xp: Math.floor(baseXP * streakBonus),
      multiplier: streakBonus
    };
  }

  /**
   * Calculate next jackpot trigger (deterministic)
   *
   * @param {string} userId - User ID
   * @param {number} totalQuestionsAnswered - Total questions answered
   * @returns {number} Questions until jackpot
   */
  calculateNextJackpotTrigger(userId, totalQuestionsAnswered) {
    // Generate seed from userId + question count
    const seed = this.generateRewardSeed(userId, 'jackpot', totalQuestionsAnswered);

    // Jackpot triggers between 15-20 questions
    const min = 15;
    const max = 20;
    const questionsUntil = min + Math.floor(seed * (max - min + 1));

    return questionsUntil;
  }

  // ============================================
  // VALIDATION
  // ============================================

  /**
   * Validate reward claim (server-side verification)
   *
   * @param {Object} claimData - Reward claim data
   * @returns {boolean} True if valid
   */
  validateRewardClaim(claimData) {
    const { userId, questionId, timestamp, rarity, rewardType, amount } = claimData;

    // Regenerate seed to verify
    const expectedSeed = this.generateRewardSeed(userId, questionId, timestamp);
    const expectedRarity = this.determineMysteryRarity(expectedSeed);

    // Verify rarity matches
    if (rarity !== expectedRarity) {
      return false;
    }

    // Verify reward is valid for rarity
    const rarityConfig = this.config.mysteryRewards[rarity];
    if (!rarityConfig) {
      return false;
    }

    const validReward = rarityConfig.rewards.find(r => r.type === rewardType);
    if (!validReward) {
      return false;
    }

    // Verify amount is in valid range
    if (validReward.min && validReward.max) {
      if (amount < validReward.min || amount > validReward.max) {
        return false;
      }
    }

    return true;
  }

  // ============================================
  // FALLBACKS & DEFAULTS
  // ============================================

  /**
   * Get default reward configuration
   *
   * @private
   */
  _getDefaultConfig() {
    return {
      mysteryRewards: {
        common: {
          probability: 0.60,
          rewards: [
            { type: 'coins', min: 50, max: 100 },
            { type: 'xp', min: 25, max: 50 }
          ]
        },
        uncommon: {
          probability: 0.25,
          rewards: [
            { type: 'coins', min: 150, max: 250 },
            { type: 'xp', min: 75, max: 125 }
          ]
        },
        rare: {
          probability: 0.10,
          rewards: [
            { type: 'coins', min: 300, max: 500 },
            { type: 'xp', min: 150, max: 250 }
          ]
        },
        epic: {
          probability: 0.04,
          rewards: [
            { type: 'coins', min: 500, max: 1000 },
            { type: 'xp', min: 250, max: 500 }
          ]
        },
        legendary: {
          probability: 0.01,
          rewards: [
            { type: 'coins', min: 1000, max: 2000 },
            { type: 'xp', min: 500, max: 1000 }
          ]
        }
      },
      streakMultipliers: [
        { streakCount: 1, multiplier: 1.0, label: null },
        { streakCount: 3, multiplier: 1.5, label: 'Getting Warm 🔥' },
        { streakCount: 5, multiplier: 2.0, label: 'Hot Streak! 🔥🔥' },
        { streakCount: 10, multiplier: 3.0, label: 'On Fire! 🔥🔥🔥' },
        { streakCount: 15, multiplier: 5.0, label: 'Blazing! 🔥🔥🔥🔥' },
        { streakCount: 20, multiplier: 10.0, label: 'UNSTOPPABLE! 🔥🔥🔥🔥🔥' }
      ]
    };
  }

  /**
   * Fallback hash function
   *
   * @private
   */
  _fallbackHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

  /**
   * Fallback normalize function
   *
   * @private
   */
  _fallbackNormalize(hash) {
    return Math.abs(hash) / 2147483647;
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.RewardCalculator = RewardCalculator;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RewardCalculator;
}
