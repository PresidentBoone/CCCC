/**
 * Casino Module - Configuration
 *
 * Central configuration for the casino gamification system.
 * All balance parameters, feature flags, and settings are defined here.
 *
 * @module casino/casino-config
 * @author CollegeClimb Casino Team
 * @version 1.0.0
 */

const CasinoConfig = {
  /**
   * ============================================
   * FEATURE FLAGS
   * ============================================
   * Toggle features on/off without code changes
   */
  features: {
    // Master switch - disable entire casino system
    enabled: true,

    // Individual feature toggles
    streakBonuses: true,
    mysteryRewards: true,
    dailyWheel: true,
    jackpotRounds: true,
    leaderboards: true,
    levelSystem: true,
    rewardShop: true,
    heartsSystem: true,
    soundEffects: true,
    animations: true,
    confetti: true,

    // Social features
    shareProgress: true,
    friendReferrals: false, // Not implemented yet

    // Advanced features
    historyTracking: true,
    offlineSupport: true,
    debugMode: false
  },

  /**
   * ============================================
   * REWARD BALANCE
   * ============================================
   * Base reward amounts for correct answers
   */
  rewards: {
    // Base coins per difficulty level
    baseCoins: {
      1: 10,
      2: 15,
      3: 20,
      4: 30,
      5: 40,
      6: 50,
      7: 60,
      8: 80,
      9: 100,
      10: 120
    },

    // Base XP per difficulty level
    baseXP: {
      1: 20,
      2: 30,
      3: 40,
      4: 60,
      5: 80,
      6: 100,
      7: 120,
      8: 160,
      9: 200,
      10: 250
    },

    // Time bonus multipliers (for fast correct answers)
    timeBonus: {
      enabled: true,
      thresholds: [
        { maxSeconds: 10, multiplier: 2.0, label: 'Lightning Fast ⚡' },
        { maxSeconds: 20, multiplier: 1.5, label: 'Quick ⏱️' },
        { maxSeconds: 30, multiplier: 1.2, label: 'Speedy 🚀' },
        { maxSeconds: 60, multiplier: 1.0, label: null }
      ]
    },

    // Perfect streak bonus (no mistakes in session)
    perfectBonus: {
      enabled: true,
      minimumQuestions: 10,
      coinBonus: 500,
      xpBonus: 1000,
      message: 'Perfect Session! 🎯'
    }
  },

  /**
   * ============================================
   * STREAK MULTIPLIERS
   * ============================================
   * Progressive multipliers for consecutive correct answers
   */
  streakMultipliers: [
    { streakCount: 1, multiplier: 1.0, label: null },
    { streakCount: 3, multiplier: 1.5, label: 'Getting Warm 🔥' },
    { streakCount: 5, multiplier: 2.0, label: 'Hot Streak! 🔥🔥' },
    { streakCount: 10, multiplier: 3.0, label: 'On Fire! 🔥🔥🔥' },
    { streakCount: 15, multiplier: 5.0, label: 'Blazing! 🔥🔥🔥🔥' },
    { streakCount: 20, multiplier: 10.0, label: 'UNSTOPPABLE! 🔥🔥🔥🔥🔥' }
  ],

  /**
   * ============================================
   * MYSTERY REWARDS
   * ============================================
   * Random bonus rewards after correct answers
   */
  mysteryRewards: {
    // Trigger chance (30% chance per correct answer)
    triggerChance: 0.30,

    // Rarity probabilities (must sum to 1.0)
    common: {
      probability: 0.60, // 60%
      label: 'Common',
      color: '#6B7280',
      emoji: '⚪',
      rewards: [
        { type: 'coins', min: 20, max: 50, weight: 1 },
        { type: 'xp', min: 30, max: 80, weight: 1 }
      ]
    },
    uncommon: {
      probability: 0.25, // 25%
      label: 'Uncommon',
      color: '#10B981',
      emoji: '🟢',
      rewards: [
        { type: 'coins', min: 50, max: 100, weight: 1 },
        { type: 'xp', min: 80, max: 150, weight: 1 }
      ]
    },
    rare: {
      probability: 0.10, // 10%
      label: 'Rare',
      color: '#3B82F6',
      emoji: '🔵',
      rewards: [
        { type: 'coins', min: 100, max: 250, weight: 1 },
        { type: 'xp', min: 150, max: 300, weight: 1 },
        { type: 'item', id: 'hint_pack_small', weight: 0.3 }
      ]
    },
    epic: {
      probability: 0.04, // 4%
      label: 'Epic',
      color: '#9333EA',
      emoji: '🟣',
      rewards: [
        { type: 'coins', min: 250, max: 500, weight: 1 },
        { type: 'xp', min: 300, max: 600, weight: 1 },
        { type: 'item', id: 'hint_pack_medium', weight: 0.4 }
      ]
    },
    legendary: {
      probability: 0.01, // 1%
      label: 'Legendary',
      color: '#F59E0B',
      emoji: '🟡',
      rewards: [
        { type: 'coins', min: 500, max: 1000, weight: 1 },
        { type: 'xp', min: 600, max: 1200, weight: 1 },
        { type: 'item', id: 'hint_pack_large', weight: 0.3 },
        { type: 'badge', id: 'lucky_legend', weight: 0.2 }
      ]
    }
  },

  /**
   * ============================================
   * LEVEL SYSTEM
   * ============================================
   * Progression and tier system
   */
  levels: {
    // XP calculation: 100 * level^2 - 100
    xpFormula: {
      base: 100,
      exponent: 2,
      offset: -100
    },

    // Level-up rewards
    levelUpRewards: {
      baseCoins: 100, // 100 * level
      baseXP: 0, // No bonus XP (would cause instant level-ups)
      unlockedFeatures: {
        5: { feature: 'dailyWheel', message: 'Daily Wheel unlocked! 🎡' },
        10: { feature: 'mysteryRewards', message: 'Mystery Rewards unlocked! 🎁' },
        20: { feature: 'jackpotRounds', message: 'Jackpot Rounds unlocked! 💰' },
        30: { feature: 'rewardShop', message: 'Reward Shop unlocked! 🛍️' }
      }
    },

    // Tier system
    tiers: [
      { tier: 'bronze', minLevel: 1, maxLevel: 9, emoji: '🥉', color: '#CD7F32' },
      { tier: 'silver', minLevel: 10, maxLevel: 19, emoji: '🥈', color: '#C0C0C0' },
      { tier: 'gold', minLevel: 20, maxLevel: 29, emoji: '🥇', color: '#FFD700' },
      { tier: 'platinum', minLevel: 30, maxLevel: 49, emoji: '💎', color: '#E5E4E2' },
      { tier: 'diamond', minLevel: 50, maxLevel: 74, emoji: '💠', color: '#B9F2FF' },
      { tier: 'legend', minLevel: 75, maxLevel: 100, emoji: '👑', color: '#FF6B6B' }
    ]
  },

  /**
   * ============================================
   * DAILY WHEEL
   * ============================================
   * Daily bonus spin rewards
   */
  dailyWheel: {
    // Minimum level required to unlock
    minimumLevel: 5,

    // Cooldown period (24 hours)
    cooldownHours: 24,

    // Wheel segments (12 segments)
    segments: [
      { id: 1, type: 'coins', amount: 50, probability: 0.15, label: '50 Coins', color: '#10B981' },
      { id: 2, type: 'coins', amount: 100, probability: 0.15, label: '100 Coins', color: '#3B82F6' },
      { id: 3, type: 'xp', amount: 100, probability: 0.15, label: '100 XP', color: '#8B5CF6' },
      { id: 4, type: 'coins', amount: 200, probability: 0.10, label: '200 Coins', color: '#10B981' },
      { id: 5, type: 'xp', amount: 200, probability: 0.10, label: '200 XP', color: '#8B5CF6' },
      { id: 6, type: 'multiplier', multiplier: 1.5, duration: 3600, probability: 0.08, label: '1.5x (1hr)', color: '#F59E0B' },
      { id: 7, type: 'coins', amount: 500, probability: 0.07, label: '500 Coins', color: '#10B981' },
      { id: 8, type: 'xp', amount: 500, probability: 0.07, label: '500 XP', color: '#8B5CF6' },
      { id: 9, type: 'multiplier', multiplier: 2.0, duration: 1800, probability: 0.05, label: '2x (30min)', color: '#F59E0B' },
      { id: 10, type: 'jackpot', probability: 0.04, label: 'JACKPOT 🎰', color: '#EF4444' },
      { id: 11, type: 'coins', amount: 1000, probability: 0.03, label: '1000 Coins', color: '#10B981' },
      { id: 12, type: 'mystery', probability: 0.01, label: 'MYSTERY 🎁', color: '#9333EA' }
    ]
  },

  /**
   * ============================================
   * JACKPOT ROUNDS
   * ============================================
   * Bonus timed quiz rounds
   */
  jackpotRounds: {
    // Minimum level required
    minimumLevel: 20,

    // Trigger chance (5% after correct answer if streak >= 5)
    triggerChance: 0.05,
    minimumStreak: 5,

    // Round settings
    duration: 180, // 3 minutes
    questionCount: 10,

    // Rewards
    rewards: {
      perCorrect: {
        coins: 100,
        xp: 150
      },
      completion: {
        coins: 500,
        xp: 1000
      },
      perfect: {
        coins: 1500,
        xp: 3000,
        badge: 'jackpot_master'
      }
    },

    // Visual theme
    theme: {
      backgroundColor: '#1F2937',
      accentColor: '#F59E0B',
      overlayOpacity: 0.95
    }
  },

  /**
   * ============================================
   * HEARTS SYSTEM
   * ============================================
   * Lives/attempts system (optional)
   */
  hearts: {
    enabled: true,
    maxHearts: 5,
    startingHearts: 5,

    // Regeneration
    regeneration: {
      enabled: true,
      intervalMinutes: 30, // 1 heart every 30 minutes
      maxRegenPerDay: 10
    },

    // Heart refills (purchasable)
    refills: {
      enabled: true,
      costCoins: 100,
      refillAmount: 1
    },

    // What happens at 0 hearts
    onEmpty: {
      action: 'cooldown', // 'cooldown' | 'disable' | 'warning'
      cooldownMinutes: 60
    }
  },

  /**
   * ============================================
   * LEADERBOARDS
   * ============================================
   * Weekly and all-time rankings
   */
  leaderboards: {
    enabled: true,

    // Leaderboard types
    types: {
      weekly: {
        enabled: true,
        topCount: 100,
        resetDay: 1, // Monday (0 = Sunday, 1 = Monday, etc.)
        rewards: {
          1: { coins: 5000, xp: 10000, badge: 'weekly_champion' },
          2: { coins: 3000, xp: 6000 },
          3: { coins: 2000, xp: 4000 },
          '4-10': { coins: 1000, xp: 2000 },
          '11-50': { coins: 500, xp: 1000 }
        }
      },
      allTime: {
        enabled: true,
        topCount: 1000
      }
    },

    // What metrics to rank by
    metrics: {
      xp: { enabled: true, label: 'Total XP' },
      level: { enabled: true, label: 'Level' },
      streak: { enabled: true, label: 'Best Streak' }
    }
  },

  /**
   * ============================================
   * REWARD SHOP
   * ============================================
   * Purchasable items with coins
   */
  shop: {
    enabled: true,
    minimumLevel: 30,

    items: [
      {
        id: 'hint_single',
        name: '1 Hint',
        description: 'Reveal a hint for any question',
        costCoins: 50,
        type: 'consumable',
        available: true,
        icon: '💡'
      },
      {
        id: 'hint_pack_small',
        name: '5 Hints',
        description: 'Pack of 5 hints',
        costCoins: 200,
        type: 'consumable',
        available: true,
        icon: '💡'
      },
      {
        id: 'skip_single',
        name: 'Skip Question',
        description: 'Skip a difficult question without penalty',
        costCoins: 100,
        type: 'consumable',
        available: true,
        icon: '⏭️'
      },
      {
        id: 'time_freeze',
        name: 'Time Freeze',
        description: 'Pause timer for 30 seconds',
        costCoins: 150,
        type: 'consumable',
        available: true,
        icon: '⏸️'
      },
      {
        id: 'heart_refill',
        name: 'Heart Refill',
        description: 'Restore 1 heart',
        costCoins: 100,
        type: 'consumable',
        available: true,
        icon: '❤️'
      },
      {
        id: 'multiplier_1hr',
        name: '1.5x Multiplier (1hr)',
        description: 'Boost all rewards by 1.5x for 1 hour',
        costCoins: 500,
        type: 'temporary',
        available: true,
        icon: '⚡'
      },
      {
        id: 'avatar_gold_star',
        name: 'Gold Star Avatar',
        description: 'Exclusive avatar frame',
        costCoins: 2000,
        type: 'cosmetic',
        available: true,
        icon: '⭐'
      },
      {
        id: 'theme_dark_casino',
        name: 'Dark Casino Theme',
        description: 'Exclusive dark theme with casino flair',
        costCoins: 5000,
        type: 'cosmetic',
        available: true,
        icon: '🎰'
      }
    ]
  },

  /**
   * ============================================
   * VALIDATION LIMITS
   * ============================================
   * Anti-cheat security limits
   */
  validation: {
    maxCoinIncrement: 5000,
    maxXPIncrement: 2000,
    maxLevelIncrement: 1,
    maxStreakValue: 1000,
    timestampMaxAgeMinutes: 5,
    minAnswerTimeSeconds: 2,
    maxAnswerTimeSeconds: 600
  },

  /**
   * ============================================
   * UI SETTINGS
   * ============================================
   * Animation and display preferences
   */
  ui: {
    // Navbar stats
    navbar: {
      showCoins: true,
      showXP: true,
      showLevel: true,
      showStreak: true,
      showHearts: true,
      animateUpdates: true
    },

    // Notifications
    notifications: {
      enabled: true,
      position: 'top-right', // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
      duration: 3000, // milliseconds
      maxVisible: 3
    },

    // Animations
    animations: {
      coinSpin: { enabled: true, duration: 800 },
      confetti: { enabled: true, duration: 3000, particleCount: 100 },
      levelUp: { enabled: true, duration: 2000 },
      streakFlash: { enabled: true, duration: 500 }
    },

    // Sound effects
    sound: {
      enabled: true,
      volume: 0.5, // 0.0 - 1.0
      effects: {
        coinEarn: true,
        levelUp: true,
        streakMilestone: true,
        mysteryReward: true,
        jackpotTrigger: true,
        wheelSpin: true
      }
    }
  },

  /**
   * ============================================
   * FIREBASE SETTINGS
   * ============================================
   * Database and sync configuration
   */
  firebase: {
    // Save debounce (prevent excessive writes)
    debounceSaveMs: 2000,

    // Offline support
    offlineSupport: true,
    maxOfflineQueueSize: 100,

    // Real-time subscriptions
    realtimeSync: true,

    // Audit logging
    auditLogging: {
      enabled: true,
      events: [
        'correct_answer',
        'incorrect_answer',
        'level_up',
        'mystery_reward',
        'jackpot_trigger',
        'daily_wheel_spin',
        'shop_purchase'
      ]
    }
  },

  /**
   * ============================================
   * DEBUG SETTINGS
   * ============================================
   * Development and testing options
   */
  debug: {
    enabled: false,

    // Console logging
    verboseLogging: false,
    logEvents: false,
    logStateChanges: false,

    // Test mode overrides
    testMode: {
      enabled: false,
      unlockAllFeatures: false,
      infiniteCoins: false,
      maxLevelStart: false,
      forceMysteryRewards: false,
      forceJackpots: false
    },

    // Performance monitoring
    performance: {
      enabled: false,
      logSlowOperations: true,
      slowThresholdMs: 100
    }
  },

  /**
   * ============================================
   * EMERGENCY CONTROLS
   * ============================================
   * Kill switches and fallbacks
   */
  emergency: {
    // Master kill switch
    killSwitch: false,

    // Fallback mode (disable all rewards, keep tracking only)
    fallbackMode: false,

    // Maintenance message
    maintenanceMode: {
      enabled: false,
      message: 'Casino features are temporarily unavailable. Your progress is safe!'
    }
  }
};

// Export for browser
if (typeof window !== 'undefined') {
  window.CasinoConfig = CasinoConfig;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CasinoConfig;
}
