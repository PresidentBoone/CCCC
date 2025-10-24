/**
 * 🎰 CASINO GAME ENGINE - CollegeClimb Test Prep
 *
 * This is the core engine that transforms studying into an addictive casino experience.
 * Maintains educational integrity while maximizing engagement through ethical gamification.
 *
 * @author Claude Code
 * @version 1.0.0
 * @license MIT
 */

// ============================================
// DATA MODELS & INTERFACES
// ============================================

/**
 * User Progress Data Structure
 * Stored in Firebase Firestore under /users/{uid}/casinoProgress
 */
const UserProgressModel = {
    // Currency
    coins: 0,                    // Earned through correct answers
    gems: 0,                     // Premium currency (future monetization)

    // Progression
    level: 1,                    // Overall level (1-100+)
    xp: 0,                       // Current XP
    xpToNextLevel: 100,          // XP required for next level
    tier: 'bronze',              // bronze, silver, gold, platinum, diamond

    // Streak System
    currentStreak: 0,            // Consecutive correct answers
    longestStreak: 0,            // Personal best
    streakMultiplier: 1,         // Current point multiplier (1x, 2x, 3x, etc.)

    // Stats
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
    accuracy: 0,                 // Percentage
    totalStudyTime: 0,           // Minutes

    // Daily Engagement
    lastLoginDate: null,         // ISO date string
    dailyLoginStreak: 0,         // Consecutive days logged in
    dailyWheelSpinAvailable: true,
    lastWheelSpinDate: null,

    // Achievements & Badges
    unlockedBadges: [],          // Array of badge IDs
    unlockedAvatars: [],         // Array of avatar IDs
    currentAvatar: 'default',

    // Jackpot System
    questionsUntilJackpot: 10,   // Countdown to bonus round
    totalJackpotsWon: 0,

    // Cosmetics (owned items)
    ownedThemes: ['default'],
    ownedAnimations: ['default'],
    currentTheme: 'default',

    // Leaderboard
    weeklyScore: 0,              // Resets every week
    allTimeScore: 0,
    rank: null                   // Calculated from leaderboard
};

/**
 * Reward Configuration
 * Defines all possible rewards and their probabilities
 */
const RewardConfig = {
    // Variable reward system - triggered on correct answers
    variableRewards: {
        common: {
            probability: 0.60,   // 60% chance
            rewards: [
                { type: 'coins', amount: 50 },
                { type: 'coins', amount: 75 },
                { type: 'xp', amount: 25 }
            ]
        },
        uncommon: {
            probability: 0.25,   // 25% chance
            rewards: [
                { type: 'coins', amount: 150 },
                { type: 'xp', amount: 50 },
                { type: 'xpMultiplier', multiplier: 2, duration: 3 } // Next 3 questions
            ]
        },
        rare: {
            probability: 0.10,   // 10% chance
            rewards: [
                { type: 'coins', amount: 300 },
                { type: 'xp', amount: 100 },
                { type: 'badge', id: 'lucky_student' }
            ]
        },
        epic: {
            probability: 0.04,   // 4% chance
            rewards: [
                { type: 'coins', amount: 500 },
                { type: 'xp', amount: 200 },
                { type: 'avatar', id: 'gold_crown' }
            ]
        },
        legendary: {
            probability: 0.01,   // 1% chance
            rewards: [
                { type: 'coins', amount: 1000 },
                { type: 'xp', amount: 500 },
                { type: 'jackpotBonus', immediate: true }
            ]
        }
    },

    // Streak multipliers
    streakTiers: [
        { threshold: 5, multiplier: 2, label: '🔥 Hot Streak!' },
        { threshold: 10, multiplier: 3, label: '⚡ Lightning Round!' },
        { threshold: 15, multiplier: 5, label: '💎 Diamond Mind!' },
        { threshold: 20, multiplier: 10, label: '🏆 UNSTOPPABLE!' },
        { threshold: 30, multiplier: 15, label: '🌟 LEGENDARY!' },
        { threshold: 50, multiplier: 25, label: '👑 GOD MODE!' }
    ],

    // Daily wheel rewards
    dailyWheel: [
        { sector: 1, reward: { type: 'coins', amount: 100 }, probability: 0.20 },
        { sector: 2, reward: { type: 'coins', amount: 200 }, probability: 0.20 },
        { sector: 3, reward: { type: 'coins', amount: 500 }, probability: 0.15 },
        { sector: 4, reward: { type: 'xp', amount: 100 }, probability: 0.15 },
        { sector: 5, reward: { type: 'coins', amount: 1000 }, probability: 0.10 },
        { sector: 6, reward: { type: 'xp', amount: 300 }, probability: 0.10 },
        { sector: 7, reward: { type: 'jackpotBonus' }, probability: 0.05 },
        { sector: 8, reward: { type: 'coins', amount: 5000 }, probability: 0.05 }
    ]
};

/**
 * Level & Tier System Configuration
 */
const LevelSystem = {
    // XP required for each level (exponential growth)
    getXPForLevel: (level) => {
        return Math.floor(100 * Math.pow(1.15, level - 1));
    },

    // Tier progression
    tiers: [
        { name: 'bronze', minLevel: 1, maxLevel: 10, color: '#CD7F32', icon: '🥉' },
        { name: 'silver', minLevel: 11, maxLevel: 25, color: '#C0C0C0', icon: '🥈' },
        { name: 'gold', minLevel: 26, maxLevel: 50, color: '#FFD700', icon: '🥇' },
        { name: 'platinum', minLevel: 51, maxLevel: 75, color: '#E5E4E2', icon: '💎' },
        { name: 'diamond', minLevel: 76, maxLevel: 100, color: '#B9F2FF', icon: '💠' },
        { name: 'legend', minLevel: 101, maxLevel: Infinity, color: '#FF00FF', icon: '👑' }
    ],

    getTierForLevel: (level) => {
        return LevelSystem.tiers.find(tier =>
            level >= tier.minLevel && level <= tier.maxLevel
        );
    }
};

// ============================================
// CASINO GAME ENGINE CLASS
// ============================================

class CasinoGameEngine {
    constructor(firebaseDb, userId) {
        this.db = firebaseDb;
        this.userId = userId;
        this.progress = { ...UserProgressModel };
        this.listeners = new Map();
        this.soundEnabled = true;
        this.confettiEnabled = true;

        // Load user progress from Firebase
        this.loadProgress();
    }

    // ============================================
    // CORE FUNCTIONS
    // ============================================

    /**
     * Load user progress from Firebase
     */
    async loadProgress() {
        try {
            const doc = await this.db.collection('users').doc(this.userId)
                .collection('casinoProgress').doc('current').get();

            if (doc.exists) {
                this.progress = { ...UserProgressModel, ...doc.data() };
            } else {
                // New user - initialize
                await this.saveProgress();
            }

            this.emit('progressLoaded', this.progress);
        } catch (error) {
            console.error('Failed to load progress:', error);
        }
    }

    /**
     * Save user progress to Firebase
     */
    async saveProgress() {
        try {
            await this.db.collection('users').doc(this.userId)
                .collection('casinoProgress').doc('current').set(this.progress);
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
    }

    /**
     * Process a correct answer
     * This is the main dopamine trigger!
     */
    async processCorrectAnswer(questionDifficulty, timeSpent) {
        // Increment streak
        this.progress.currentStreak++;
        if (this.progress.currentStreak > this.progress.longestStreak) {
            this.progress.longestStreak = this.progress.currentStreak;
        }

        // Update stats
        this.progress.totalQuestionsAnswered++;
        this.progress.correctAnswers++;
        this.progress.accuracy = (this.progress.correctAnswers / this.progress.totalQuestionsAnswered) * 100;

        // Calculate base reward
        const baseCoins = 50 + (questionDifficulty * 10); // Harder questions = more coins
        const baseXP = 25 + (questionDifficulty * 5);

        // Check for streak multiplier
        const streakBonus = this.getStreakMultiplier();
        this.progress.streakMultiplier = streakBonus.multiplier;

        // Apply multiplier
        let coins = Math.floor(baseCoins * this.progress.streakMultiplier);
        let xp = Math.floor(baseXP * this.progress.streakMultiplier);

        // Roll for variable reward
        const variableReward = this.rollVariableReward();

        // Add rewards
        this.progress.coins += coins;
        this.progress.xp += xp;

        // Check for level up
        const leveledUp = this.checkLevelUp();

        // Decrement jackpot counter
        this.progress.questionsUntilJackpot--;
        const jackpotTriggered = this.progress.questionsUntilJackpot <= 0;

        // Save progress
        await this.saveProgress();

        // Emit events for UI updates
        this.emit('correctAnswer', {
            baseCoins,
            baseXP,
            multiplier: this.progress.streakMultiplier,
            totalCoins: coins,
            totalXP: xp,
            streak: this.progress.currentStreak,
            streakBonus: streakBonus,
            variableReward: variableReward,
            leveledUp: leveledUp,
            jackpotTriggered: jackpotTriggered,
            progress: this.progress
        });

        return {
            coins,
            xp,
            variableReward,
            leveledUp,
            jackpotTriggered,
            streakBonus
        };
    }

    /**
     * Process an incorrect answer
     * Break the streak but still encourage the player
     */
    async processIncorrectAnswer() {
        // Reset streak
        const streakBroken = this.progress.currentStreak > 0;
        const brokenStreak = this.progress.currentStreak;
        this.progress.currentStreak = 0;
        this.progress.streakMultiplier = 1;

        // Update stats
        this.progress.totalQuestionsAnswered++;
        this.progress.accuracy = (this.progress.correctAnswers / this.progress.totalQuestionsAnswered) * 100;

        // Save progress
        await this.saveProgress();

        // Emit event
        this.emit('incorrectAnswer', {
            streakBroken,
            brokenStreak,
            progress: this.progress
        });

        return { streakBroken, brokenStreak };
    }

    /**
     * Get current streak multiplier and bonus info
     */
    getStreakMultiplier() {
        const streak = this.progress.currentStreak;

        // Find the highest tier the user has reached
        let currentTier = RewardConfig.streakTiers[0];
        for (const tier of RewardConfig.streakTiers) {
            if (streak >= tier.threshold) {
                currentTier = tier;
            } else {
                break;
            }
        }

        return currentTier;
    }

    /**
     * Roll for variable reward (slot machine style)
     */
    rollVariableReward() {
        const roll = Math.random();
        let cumulative = 0;

        for (const [rarity, config] of Object.entries(RewardConfig.variableRewards)) {
            cumulative += config.probability;
            if (roll <= cumulative) {
                // Pick random reward from this rarity tier
                const reward = config.rewards[Math.floor(Math.random() * config.rewards.length)];

                // Apply reward
                this.applyReward(reward);

                return {
                    rarity,
                    reward,
                    probability: config.probability
                };
            }
        }

        // Fallback (should never happen)
        return null;
    }

    /**
     * Apply a reward to user progress
     */
    applyReward(reward) {
        switch (reward.type) {
            case 'coins':
                this.progress.coins += reward.amount;
                break;
            case 'xp':
                this.progress.xp += reward.amount;
                break;
            case 'badge':
                if (!this.progress.unlockedBadges.includes(reward.id)) {
                    this.progress.unlockedBadges.push(reward.id);
                }
                break;
            case 'avatar':
                if (!this.progress.unlockedAvatars.includes(reward.id)) {
                    this.progress.unlockedAvatars.push(reward.id);
                }
                break;
        }
    }

    /**
     * Check if user leveled up
     */
    checkLevelUp() {
        const xpNeeded = LevelSystem.getXPForLevel(this.progress.level);

        if (this.progress.xp >= xpNeeded) {
            this.progress.xp -= xpNeeded;
            this.progress.level++;

            // Check for tier upgrade
            const newTier = LevelSystem.getTierForLevel(this.progress.level);
            const oldTier = this.progress.tier;
            this.progress.tier = newTier.name;

            // Update XP requirement
            this.progress.xpToNextLevel = LevelSystem.getXPForLevel(this.progress.level);

            // Tier upgrade?
            const tierUpgraded = oldTier !== newTier.name;

            this.emit('levelUp', {
                newLevel: this.progress.level,
                tier: newTier,
                tierUpgraded,
                progress: this.progress
            });

            return {
                newLevel: this.progress.level,
                tier: newTier,
                tierUpgraded
            };
        }

        return null;
    }

    /**
     * Spin the daily bonus wheel
     */
    async spinDailyWheel() {
        const today = new Date().toDateString();

        // Check if already spun today
        if (this.progress.lastWheelSpinDate === today) {
            throw new Error('Already spun today! Come back tomorrow.');
        }

        // Update daily login streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (this.progress.lastLoginDate === yesterday.toDateString()) {
            this.progress.dailyLoginStreak++;
        } else {
            this.progress.dailyLoginStreak = 1;
        }

        this.progress.lastLoginDate = today;
        this.progress.lastWheelSpinDate = today;

        // Roll for reward (weighted probability)
        const roll = Math.random();
        let cumulative = 0;
        let selectedReward = null;

        for (const sector of RewardConfig.dailyWheel) {
            cumulative += sector.probability;
            if (roll <= cumulative) {
                selectedReward = sector;
                break;
            }
        }

        // Apply reward
        this.applyReward(selectedReward.reward);

        // Save progress
        await this.saveProgress();

        // Emit event
        this.emit('wheelSpun', {
            reward: selectedReward,
            dailyLoginStreak: this.progress.dailyLoginStreak,
            progress: this.progress
        });

        return selectedReward;
    }

    /**
     * Trigger jackpot bonus round
     */
    async triggerJackpot() {
        // Reset counter
        this.progress.questionsUntilJackpot = 10 + Math.floor(Math.random() * 11); // 10-20
        this.progress.totalJackpotsWon++;

        // Calculate jackpot reward (scales with level)
        const jackpotCoins = 500 + (this.progress.level * 50);
        const jackpotXP = 200 + (this.progress.level * 20);

        this.progress.coins += jackpotCoins;
        this.progress.xp += jackpotXP;

        await this.saveProgress();

        this.emit('jackpotTriggered', {
            coins: jackpotCoins,
            xp: jackpotXP,
            progress: this.progress
        });

        return { coins: jackpotCoins, xp: jackpotXP };
    }

    // ============================================
    // EVENT SYSTEM
    // ============================================

    /**
     * Subscribe to events
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Emit events
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            for (const callback of this.listeners.get(event)) {
                callback(data);
            }
        }
    }

    /**
     * Get current progress snapshot
     */
    getProgress() {
        return { ...this.progress };
    }
}

// ============================================
// EXPORT
// ============================================

// Make available globally for testprep.html
if (typeof window !== 'undefined') {
    window.CasinoGameEngine = CasinoGameEngine;
    window.LevelSystem = LevelSystem;
    window.RewardConfig = RewardConfig;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CasinoGameEngine,
        LevelSystem,
        RewardConfig,
        UserProgressModel
    };
}
