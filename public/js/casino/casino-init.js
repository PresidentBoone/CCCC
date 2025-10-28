/**
 * Casino Module Initialization & Integration
 * Wires casino gamification into Test Prep Practice page
 * Part of CollegeClimb Engineering Overhaul - Phase 1.5
 *
 * @version 2.0.0
 * @author CollegeClimb Engineering Team
 *
 * Dependencies:
 * - CasinoEngine (core/CasinoEngine.js)
 * - StateManager (core/StateManager.js)
 * - FirebaseSync (core/FirebaseSync.js)
 * - All UI components
 */

class CasinoIntegration {
    constructor() {
        this.engine = null;
        this.initialized = false;
        this.currentQuestionId = null;
        this.sessionStartTime = null;
        this.questionsAnswered = 0;

        // Bind methods
        this.handleQuestionAnswered = this.handleQuestionAnswered.bind(this);
        this.handleStreakUpdate = this.handleStreakUpdate.bind(this);
        this.handleLevelUp = this.handleLevelUp.bind(this);
        this.handleRewardEarned = this.handleRewardEarned.bind(this);
    }

    /**
     * Initialize casino module with Firebase user
     * @param {Object} firebaseUser - Firebase auth user object
     * @returns {Promise<boolean>} Success status
     */
    async initialize(firebaseUser) {
        if (this.initialized) {
            console.warn('[CasinoIntegration] Already initialized');
            return true;
        }

        if (!firebaseUser || !firebaseUser.uid) {
            console.error('[CasinoIntegration] Invalid Firebase user');
            return false;
        }

        try {
            console.log('[CasinoIntegration] 🎰 Initializing casino module...');

            // Check dependencies
            if (!window.CasinoEngine) {
                throw new Error('CasinoEngine not loaded');
            }

            // Initialize engine
            this.engine = new window.CasinoEngine(firebaseUser.uid);
            await this.engine.initialize();

            // Wire up event listeners
            this.wireEventListeners();

            // Update UI with initial state
            this.updateUI();

            this.initialized = true;
            this.sessionStartTime = Date.now();

            console.log('[CasinoIntegration] ✅ Casino module initialized');
            return true;

        } catch (error) {
            console.error('[CasinoIntegration] ❌ Initialization failed:', error);
            return false;
        }
    }

    /**
     * Wire casino event listeners to state changes
     */
    wireEventListeners() {
        if (!this.engine || !this.engine.state) {
            console.error('[CasinoIntegration] Cannot wire events - engine not ready');
            return;
        }

        const stateManager = this.engine.state;

        // Listen to state changes
        stateManager.subscribe('progress', this.handleProgressUpdate.bind(this));
        stateManager.subscribe('streak', this.handleStreakUpdate);
        stateManager.subscribe('level', this.handleLevelUp);
        stateManager.subscribe('rewards', this.handleRewardEarned);

        console.log('[CasinoIntegration] 🔗 Event listeners wired');
    }

    /**
     * Handle question answered event (called from testprep-practice.html)
     * @param {Object} questionData - Question metadata
     * @param {boolean} isCorrect - Whether answer was correct
     * @param {number} timeSpentMs - Time spent on question
     */
    async handleQuestionAnswered(questionData, isCorrect, timeSpentMs = 0) {
        if (!this.initialized || !this.engine) {
            console.warn('[CasinoIntegration] Cannot process question - not initialized');
            return null;
        }

        try {
            // Prepare question context
            const context = {
                questionId: questionData.id || `q_${Date.now()}`,
                subject: questionData.subject || 'SAT',
                difficulty: questionData.difficulty || 'medium',
                isCorrect: isCorrect,
                timeSpent: Math.floor(timeSpentMs / 1000), // Convert to seconds
                timestamp: Date.now()
            };

            this.currentQuestionId = context.questionId;
            this.questionsAnswered++;

            console.log('[CasinoIntegration] 📝 Processing question:', context);

            // Process through casino engine
            const reward = await this.engine.processQuestion(context);

            if (reward) {
                console.log('[CasinoIntegration] 🎁 Reward earned:', reward);
                this.showRewardFeedback(reward);
            }

            return reward;

        } catch (error) {
            console.error('[CasinoIntegration] Error processing question:', error);
            return null;
        }
    }

    /**
     * Show visual feedback for reward
     * @param {Object} reward - Reward data from engine
     */
    showRewardFeedback(reward) {
        if (!reward) return;

        // Show toast notification
        if (window.CasinoToast) {
            let message = '';
            let type = 'success';

            if (reward.coins > 0) {
                message = `+${reward.coins} coins earned!`;
            }

            if (reward.bonusMultiplier > 1) {
                message += ` (${reward.bonusMultiplier}x streak bonus!)`;
                type = 'bonus';
            }

            if (reward.rarity && reward.rarity !== 'common') {
                message = `${reward.rarity.toUpperCase()} REWARD! ${message}`;
                type = 'rare';
            }

            window.CasinoToast.show(message, type);
        }

        // Trigger confetti for rare rewards
        if (reward.rarity === 'legendary' || reward.rarity === 'epic') {
            if (window.CasinoConfetti) {
                window.CasinoConfetti.burst({
                    particleCount: reward.rarity === 'legendary' ? 150 : 100,
                    spread: 90,
                    origin: { y: 0.6 }
                });
            }
        }
    }

    /**
     * Handle progress update
     * @param {Object} progress - Updated progress data
     */
    handleProgressUpdate(progress) {
        console.log('[CasinoIntegration] 📊 Progress updated:', progress);
        this.updateUI();
    }

    /**
     * Handle streak update
     * @param {Object} streak - Streak data
     */
    handleStreakUpdate(streak) {
        console.log('[CasinoIntegration] 🔥 Streak updated:', streak);

        // Show streak milestone notifications
        if (streak.currentStreak % 5 === 0 && streak.currentStreak > 0) {
            if (window.CasinoToast) {
                window.CasinoToast.show(
                    `🔥 ${streak.currentStreak} question streak! ${streak.multiplier}x multiplier active!`,
                    'streak'
                );
            }
        }

        this.updateUI();
    }

    /**
     * Handle level up event
     * @param {Object} levelData - Level data
     */
    handleLevelUp(levelData) {
        console.log('[CasinoIntegration] 🎉 LEVEL UP!', levelData);

        // Show level up celebration
        if (window.CasinoLevelUp) {
            window.CasinoLevelUp.show(levelData);
        }

        if (window.CasinoConfetti) {
            window.CasinoConfetti.burst({
                particleCount: 200,
                spread: 120,
                origin: { y: 0.5 }
            });
        }

        this.updateUI();
    }

    /**
     * Handle reward earned
     * @param {Object} reward - Reward data
     */
    handleRewardEarned(reward) {
        console.log('[CasinoIntegration] 💎 Reward earned:', reward);
        this.showRewardFeedback(reward);
    }

    /**
     * Update UI elements with current state
     */
    updateUI() {
        if (!this.engine || !this.engine.state) return;

        const state = this.engine.state.getState();

        // Update navbar stats
        this.updateNavbarStats(state.progress);

        // Update streak panel
        this.updateStreakPanel(state.streak);

        // Update any progress bars or indicators
        this.updateProgressIndicators(state.progress);
    }

    /**
     * Update navbar stats display
     * @param {Object} progress - Progress data
     */
    updateNavbarStats(progress) {
        // Update coins display
        const coinsElement = document.getElementById('navbar-coins');
        if (coinsElement) {
            coinsElement.textContent = window.CasinoFormatters
                ? window.CasinoFormatters.formatNumber(progress.coins)
                : progress.coins.toLocaleString();
        }

        // Update level display
        const levelElement = document.getElementById('navbar-level');
        if (levelElement) {
            levelElement.textContent = progress.level;
        }

        // Update XP bar
        const xpBar = document.getElementById('navbar-xp-bar');
        const xpText = document.getElementById('navbar-xp-text');
        if (xpBar && xpText) {
            const xpToNext = progress.xpToNextLevel || 100;
            const currentXP = progress.xpInLevel || 0;
            const percentage = Math.min((currentXP / xpToNext) * 100, 100);

            xpBar.style.width = `${percentage}%`;
            xpText.textContent = `${currentXP} / ${xpToNext} XP`;
        }
    }

    /**
     * Update streak panel display
     * @param {Object} streak - Streak data
     */
    updateStreakPanel(streak) {
        const streakElement = document.getElementById('current-streak');
        if (streakElement) {
            streakElement.textContent = streak.currentStreak || 0;
        }

        const multiplierElement = document.getElementById('streak-multiplier');
        if (multiplierElement) {
            multiplierElement.textContent = `${streak.multiplier}x`;
        }

        const bestStreakElement = document.getElementById('best-streak');
        if (bestStreakElement) {
            bestStreakElement.textContent = streak.bestStreak || 0;
        }
    }

    /**
     * Update progress indicators (XP bar, level progress, etc.)
     * @param {Object} progress - Progress data
     */
    updateProgressIndicators(progress) {
        // Update main XP progress bar (if exists on page)
        const mainXpBar = document.getElementById('main-xp-bar');
        if (mainXpBar) {
            const percentage = Math.min((progress.xpInLevel / progress.xpToNextLevel) * 100, 100);
            mainXpBar.style.width = `${percentage}%`;
        }

        // Update tier badge
        const tierBadge = document.getElementById('tier-badge');
        if (tierBadge) {
            tierBadge.textContent = progress.tier || 'Bronze';
            tierBadge.className = `tier-badge tier-${(progress.tier || 'bronze').toLowerCase()}`;
        }
    }

    /**
     * Trigger daily wheel (if available)
     * @returns {Promise<Object>} Spin result
     */
    async spinDailyWheel() {
        if (!this.initialized || !this.engine) {
            console.warn('[CasinoIntegration] Cannot spin wheel - not initialized');
            return null;
        }

        try {
            console.log('[CasinoIntegration] 🎡 Spinning daily wheel...');

            const result = await this.engine.spinDailyWheel();

            if (result) {
                console.log('[CasinoIntegration] 🎁 Wheel result:', result);

                // Show wheel UI
                if (window.CasinoDailyWheel) {
                    window.CasinoDailyWheel.show(result);
                }
            }

            return result;

        } catch (error) {
            console.error('[CasinoIntegration] Error spinning wheel:', error);
            return null;
        }
    }

    /**
     * Open mystery reward (if earned)
     * @param {string} rewardId - Reward ID to open
     * @returns {Promise<Object>} Opened reward
     */
    async openMysteryReward(rewardId) {
        if (!this.initialized || !this.engine) {
            console.warn('[CasinoIntegration] Cannot open reward - not initialized');
            return null;
        }

        try {
            console.log('[CasinoIntegration] 🎁 Opening mystery reward:', rewardId);

            const result = await this.engine.openMysteryReward(rewardId);

            if (result) {
                console.log('[CasinoIntegration] 💎 Reward revealed:', result);

                // Show mystery reward modal
                if (window.CasinoMysteryReward) {
                    window.CasinoMysteryReward.show(result);
                }
            }

            return result;

        } catch (error) {
            console.error('[CasinoIntegration] Error opening reward:', error);
            return null;
        }
    }

    /**
     * Open leaderboard modal
     */
    async openLeaderboard() {
        if (!this.initialized || !this.engine) {
            console.warn('[CasinoIntegration] Cannot open leaderboard - not initialized');
            return;
        }

        try {
            console.log('[CasinoIntegration] 🏆 Opening leaderboard...');

            if (window.CasinoLeaderboard) {
                await window.CasinoLeaderboard.show(this.engine.userId);
            }

        } catch (error) {
            console.error('[CasinoIntegration] Error opening leaderboard:', error);
        }
    }

    /**
     * Get current session stats
     * @returns {Object} Session statistics
     */
    getSessionStats() {
        const sessionTime = this.sessionStartTime
            ? Date.now() - this.sessionStartTime
            : 0;

        return {
            questionsAnswered: this.questionsAnswered,
            sessionTimeMs: sessionTime,
            sessionTimeMinutes: Math.floor(sessionTime / 60000),
            currentStreak: this.engine?.state?.getState().streak.currentStreak || 0,
            coinsEarned: this.engine?.state?.getState().progress.coins || 0
        };
    }

    /**
     * Cleanup and save state
     */
    async cleanup() {
        if (!this.initialized) return;

        console.log('[CasinoIntegration] 🧹 Cleaning up...');

        try {
            // Force save current state
            if (this.engine && this.engine.sync) {
                await this.engine.sync.saveProgress(
                    this.engine.state.getState().progress
                );
            }

            // Log session stats
            const stats = this.getSessionStats();
            console.log('[CasinoIntegration] 📊 Session stats:', stats);

            this.initialized = false;
            console.log('[CasinoIntegration] ✅ Cleanup complete');

        } catch (error) {
            console.error('[CasinoIntegration] Cleanup error:', error);
        }
    }

    /**
     * Get current engine state
     * @returns {Object} Current state snapshot
     */
    getState() {
        if (!this.engine || !this.engine.state) return null;
        return this.engine.state.getState();
    }

    /**
     * Check if initialized
     * @returns {boolean} Initialization status
     */
    isInitialized() {
        return this.initialized;
    }
}

// Create global singleton instance
if (typeof window !== 'undefined') {
    window.CasinoIntegration = new CasinoIntegration();
    console.log('[CasinoIntegration] 🚀 Integration module loaded');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CasinoIntegration;
}
