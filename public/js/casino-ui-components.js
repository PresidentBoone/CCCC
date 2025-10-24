/**
 * 🎰 CASINO UI COMPONENTS - Visual Dopamine Triggers
 *
 * This file contains all the UI components and animations that make
 * studying feel like playing a Vegas slot machine.
 *
 * Components:
 * - Streak Counter with Multiplier Display
 * - Variable Reward Popup (Mystery Box)
 * - Daily Wheel Spinner
 * - Jackpot Trigger Animation
 * - Level Up Celebration
 * - Tier Upgrade Fanfare
 * - Coin Explosion Particles
 * - Near-Miss Effects
 *
 * @author Claude Code
 * @version 1.0.0
 */

// ============================================
// STREAK DISPLAY COMPONENT
// ============================================

class StreakDisplay {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentStreak = 0;
        this.currentMultiplier = 1;
        this.streakLabel = '';
    }

    /**
     * Update streak display with animation
     */
    update(streak, multiplier, label) {
        this.currentStreak = streak;
        this.currentMultiplier = multiplier;
        this.streakLabel = label;

        // Update HTML
        this.render();

        // Trigger pulse animation
        this.container.classList.add('streak-pulse');
        setTimeout(() => {
            this.container.classList.remove('streak-pulse');
        }, 600);

        // Play sound
        if (window.soundEnabled && multiplier > 1) {
            this.playStreakSound(multiplier);
        }
    }

    render() {
        const multiplierColor = this.getMultiplierColor(this.currentMultiplier);

        this.container.innerHTML = `
            <div class="streak-container" style="
                background: linear-gradient(135deg, ${multiplierColor}22 0%, ${multiplierColor}44 100%);
                border: 2px solid ${multiplierColor};
                border-radius: 16px;
                padding: 1rem;
                position: relative;
                overflow: hidden;
            ">
                <!-- Animated background particles -->
                <div class="streak-particles" style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    opacity: 0.3;
                "></div>

                <!-- Streak number -->
                <div style="
                    font-size: 2.5rem;
                    font-weight: 900;
                    text-align: center;
                    color: ${multiplierColor};
                    text-shadow: 0 2px 10px ${multiplierColor}66;
                    animation: streak-glow 1.5s ease-in-out infinite;
                ">
                    🔥 ${this.currentStreak}
                </div>

                <!-- Multiplier badge -->
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                ">
                    <div style="
                        background: ${multiplierColor};
                        color: white;
                        padding: 0.25rem 0.75rem;
                        border-radius: 20px;
                        font-weight: 700;
                        font-size: 1rem;
                        box-shadow: 0 4px 12px ${multiplierColor}44;
                    ">
                        ${this.currentMultiplier}x MULTIPLIER
                    </div>
                </div>

                <!-- Streak label -->
                ${this.streakLabel ? `
                <div style="
                    text-align: center;
                    margin-top: 0.5rem;
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    animation: streak-bounce 0.6s ease-in-out;
                ">
                    ${this.streakLabel}
                </div>
                ` : ''}

                <!-- Next milestone -->
                ${this.getNextMilestone()}
            </div>
        `;

        // Add particle effect
        if (this.currentMultiplier >= 3) {
            this.addParticles();
        }
    }

    getMultiplierColor(multiplier) {
        if (multiplier >= 25) return '#FF00FF'; // God mode - magenta
        if (multiplier >= 15) return '#FFD700'; // Legendary - gold
        if (multiplier >= 10) return '#00FFFF'; // Unstoppable - cyan
        if (multiplier >= 5) return '#FF4500';  // Diamond - red-orange
        if (multiplier >= 3) return '#9D4EDD';  // Lightning - purple
        if (multiplier >= 2) return '#FFA500';  // Hot - orange
        return '#10b981';                       // Base - green
    }

    getNextMilestone() {
        const milestones = [5, 10, 15, 20, 30, 50];
        const next = milestones.find(m => m > this.currentStreak);

        if (next) {
            const remaining = next - this.currentStreak;
            return `
                <div style="
                    text-align: center;
                    margin-top: 0.75rem;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                ">
                    ${remaining} more for next bonus! 🎯
                </div>
            `;
        }

        return '';
    }

    addParticles() {
        const particles = this.container.querySelector('.streak-particles');
        if (!particles) return;

        particles.innerHTML = '';

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: ${this.getMultiplierColor(this.currentMultiplier)};
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: particle-float ${2 + Math.random() * 2}s ease-in-out infinite;
                animation-delay: ${Math.random()}s;
            `;
            particles.appendChild(particle);
        }
    }

    playStreakSound(multiplier) {
        // Different sound for different multipliers
        if (multiplier >= 10) {
            window.playSound?.('epic_streak');
        } else if (multiplier >= 5) {
            window.playSound?.('high_streak');
        } else if (multiplier >= 2) {
            window.playSound?.('streak_bonus');
        }
    }

    /**
     * Reset streak with sad animation
     */
    reset() {
        this.currentStreak = 0;
        this.currentMultiplier = 1;
        this.streakLabel = '';

        // Shatter animation
        this.container.classList.add('streak-shatter');
        setTimeout(() => {
            this.container.classList.remove('streak-shatter');
            this.render();
        }, 800);

        // Play sad sound
        if (window.soundEnabled) {
            window.playSound?.('streak_broken');
        }
    }
}

// ============================================
// VARIABLE REWARD POPUP (MYSTERY BOX)
// ============================================

class RewardPopup {
    constructor() {
        this.overlay = null;
    }

    /**
     * Show mystery box opening animation
     */
    async show(rarity, reward) {
        return new Promise((resolve) => {
            // Create overlay
            this.overlay = document.createElement('div');
            this.overlay.className = 'reward-overlay';
            this.overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: overlay-fade-in 0.3s ease-out;
            `;

            // Create content
            this.overlay.innerHTML = this.getRewardHTML(rarity, reward);

            document.body.appendChild(this.overlay);

            // Play opening animation
            this.playOpeningAnimation(rarity);

            // Auto-close after 3 seconds
            setTimeout(() => {
                this.close();
                resolve();
            }, 3000);

            // Click to close
            this.overlay.addEventListener('click', () => {
                this.close();
                resolve();
            });
        });
    }

    getRewardHTML(rarity, reward) {
        const colors = {
            common: '#10b981',
            uncommon: '#3b82f6',
            rare: '#8b5cf6',
            epic: '#f59e0b',
            legendary: '#ef4444'
        };

        const color = colors[rarity] || colors.common;

        let rewardText = '';
        let rewardIcon = '💰';

        if (reward.type === 'coins') {
            rewardText = `+${reward.amount} Coins`;
            rewardIcon = '💰';
        } else if (reward.type === 'xp') {
            rewardText = `+${reward.amount} XP`;
            rewardIcon = '⭐';
        } else if (reward.type === 'badge') {
            rewardText = `New Badge Unlocked!`;
            rewardIcon = '🏅';
        } else if (reward.type === 'avatar') {
            rewardText = `New Avatar Unlocked!`;
            rewardIcon = '🎨';
        }

        return `
            <div class="reward-box" style="
                background: var(--primary-bg);
                border: 4px solid ${color};
                border-radius: 24px;
                padding: 3rem;
                max-width: 500px;
                text-align: center;
                box-shadow: 0 20px 60px ${color}66;
                animation: reward-bounce 0.6s ease-out;
            ">
                <!-- Rarity label -->
                <div style="
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: ${color};
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 1rem;
                    animation: rarity-glow 1.5s ease-in-out infinite;
                ">
                    ${rarity} REWARD!
                </div>

                <!-- Mystery box icon (spinning) -->
                <div style="
                    font-size: 6rem;
                    margin: 2rem 0;
                    animation: box-spin 1s ease-out;
                ">
                    🎁
                </div>

                <!-- Reward revealed -->
                <div style="
                    font-size: 3rem;
                    margin: 1rem 0;
                    animation: reward-appear 0.6s ease-out 0.5s both;
                ">
                    ${rewardIcon}
                </div>

                <div style="
                    font-size: 2rem;
                    font-weight: 700;
                    color: ${color};
                    animation: reward-appear 0.6s ease-out 0.6s both;
                ">
                    ${rewardText}
                </div>

                <!-- Tap to continue -->
                <div style="
                    margin-top: 2rem;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    opacity: 0.7;
                ">
                    Tap anywhere to continue
                </div>
            </div>
        `;
    }

    playOpeningAnimation(rarity) {
        // Play sound based on rarity
        if (window.soundEnabled) {
            if (rarity === 'legendary') {
                window.playSound?.('legendary_drop');
            } else if (rarity === 'epic') {
                window.playSound?.('epic_drop');
            } else if (rarity === 'rare') {
                window.playSound?.('rare_drop');
            } else {
                window.playSound?.('common_drop');
            }
        }

        // Confetti for epic and legendary
        if (window.confettiEnabled && (rarity === 'epic' || rarity === 'legendary')) {
            window.triggerConfetti?.();
        }
    }

    close() {
        if (this.overlay) {
            this.overlay.style.animation = 'overlay-fade-out 0.3s ease-out';
            setTimeout(() => {
                this.overlay?.remove();
                this.overlay = null;
            }, 300);
        }
    }
}

// ============================================
// DAILY WHEEL SPINNER
// ============================================

class DailyWheelSpinner {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.isSpinning = false;
        this.sectors = window.RewardConfig?.dailyWheel || [];
    }

    /**
     * Show the wheel
     */
    show() {
        if (!this.container) return;

        this.container.innerHTML = this.getWheelHTML();
        this.container.style.display = 'flex';

        // Add event listener
        const spinButton = document.getElementById('wheelSpinButton');
        spinButton?.addEventListener('click', () => this.spin());
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    getWheelHTML() {
        return `
            <div style="
                background: rgba(0, 0, 0, 0.95);
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: overlay-fade-in 0.3s ease-out;
            ">
                <div style="
                    background: var(--primary-bg);
                    border-radius: 24px;
                    padding: 3rem;
                    max-width: 600px;
                    width: 90%;
                    text-align: center;
                ">
                    <h2 style="
                        font-size: 2.5rem;
                        font-weight: 900;
                        background: var(--gradient);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        margin-bottom: 2rem;
                    ">
                        🎡 DAILY BONUS WHEEL
                    </h2>

                    <!-- Wheel canvas -->
                    <canvas id="wheelCanvas" width="400" height="400" style="
                        border-radius: 50%;
                        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                    "></canvas>

                    <!-- Spin button -->
                    <button id="wheelSpinButton" style="
                        margin-top: 2rem;
                        padding: 1rem 3rem;
                        font-size: 1.5rem;
                        font-weight: 700;
                        background: var(--gradient);
                        color: white;
                        border: none;
                        border-radius: 12px;
                        cursor: pointer;
                        box-shadow: 0 8px 24px rgba(160, 123, 204, 0.4);
                        transition: all 0.3s ease;
                    ">
                        🎰 SPIN THE WHEEL!
                    </button>

                    <div style="
                        margin-top: 1.5rem;
                        font-size: 0.9rem;
                        color: var(--text-secondary);
                    ">
                        Free spin every 24 hours!
                    </div>

                    <!-- Close button -->
                    <button onclick="this.closest('.reward-overlay').style.display='none'" style="
                        margin-top: 1rem;
                        background: transparent;
                        border: none;
                        color: var(--text-secondary);
                        cursor: pointer;
                    ">
                        Close
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Draw the wheel on canvas
     */
    drawWheel(rotation = 0) {
        const canvas = document.getElementById('wheelCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = canvas.width / 2 - 10;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw sectors
        const sectorAngle = (2 * Math.PI) / this.sectors.length;

        this.sectors.forEach((sector, index) => {
            const startAngle = index * sectorAngle + rotation;
            const endAngle = startAngle + sectorAngle;

            // Alternating colors
            const colors = ['#2a357a', '#a07bcc', '#3b50a3', '#c799e6'];
            ctx.fillStyle = colors[index % colors.length];

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fill();

            // Draw text
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + sectorAngle / 2);
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white';
            ctx.font = 'bold 18px Inter';
            ctx.fillText(this.getSectorLabel(sector), radius / 1.5, 10);
            ctx.restore();
        });

        // Draw center circle
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
        ctx.fill();

        // Draw pointer
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.moveTo(centerX, 10);
        ctx.lineTo(centerX - 15, 40);
        ctx.lineTo(centerX + 15, 40);
        ctx.closePath();
        ctx.fill();
    }

    getSectorLabel(sector) {
        if (sector.reward.type === 'coins') {
            return `💰 ${sector.reward.amount}`;
        } else if (sector.reward.type === 'xp') {
            return `⭐ ${sector.reward.amount} XP`;
        } else if (sector.reward.type === 'jackpotBonus') {
            return `🎰 JACKPOT!`;
        }
        return '?';
    }

    /**
     * Spin the wheel with animation
     */
    async spin() {
        if (this.isSpinning) return;
        this.isSpinning = true;

        const button = document.getElementById('wheelSpinButton');
        button.disabled = true;
        button.textContent = 'SPINNING...';

        // Spin the wheel (5 full rotations + random amount)
        const spins = 5 + Math.random();
        const duration = 4000; // 4 seconds
        const startTime = Date.now();

        // Animation loop
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const rotation = easeOut * spins * 2 * Math.PI;

            this.drawWheel(rotation);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.handleSpinResult();
            }
        };

        // Initial draw
        this.drawWheel(0);

        // Start animation
        setTimeout(() => {
            requestAnimationFrame(animate);
        }, 100);

        // Play spin sound
        if (window.soundEnabled) {
            window.playSound?.('wheel_spin');
        }
    }

    async handleSpinResult() {
        // Call casino engine to get reward
        if (window.casinoEngine) {
            try {
                const result = await window.casinoEngine.spinDailyWheel();

                // Show reward popup
                setTimeout(() => {
                    const popup = new RewardPopup();
                    popup.show('rare', result.reward);
                }, 500);

            } catch (error) {
                alert(error.message);
            }
        }

        this.isSpinning = false;
    }
}

// ============================================
// JACKPOT BONUS ROUND
// ============================================

class JackpotAnimation {
    /**
     * Show jackpot triggered screen
     */
    static async show(coins, xp) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #FFD700 0%, #FF8C00 50%, #FF0000 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: jackpot-flash 0.5s ease-out;
            `;

            overlay.innerHTML = `
                <div style="
                    text-align: center;
                    animation: jackpot-bounce 0.8s ease-out;
                ">
                    <div style="
                        font-size: 6rem;
                        font-weight: 900;
                        color: white;
                        text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                        margin-bottom: 2rem;
                        animation: jackpot-pulse 1s ease-in-out infinite;
                    ">
                        🎰 JACKPOT! 🎰
                    </div>

                    <div style="
                        font-size: 3rem;
                        color: white;
                        font-weight: 700;
                        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
                    ">
                        +${coins} Coins
                    </div>

                    <div style="
                        font-size: 2rem;
                        color: white;
                        font-weight: 700;
                        margin-top: 1rem;
                        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
                    ">
                        +${xp} XP
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // Play jackpot sound
            if (window.soundEnabled) {
                window.playSound?.('jackpot');
            }

            // Massive confetti
            if (window.confettiEnabled) {
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        window.triggerConfetti?.();
                    }, i * 200);
                }
            }

            // Auto-close after 3 seconds
            setTimeout(() => {
                overlay.style.animation = 'overlay-fade-out 0.5s ease-out';
                setTimeout(() => {
                    overlay.remove();
                    resolve();
                }, 500);
            }, 3000);
        });
    }
}

// ============================================
// LEVEL UP CELEBRATION
// ============================================

class LevelUpCelebration {
    static async show(newLevel, tier, tierUpgraded) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: overlay-fade-in 0.3s ease-out;
            `;

            const tierColor = tier?.color || '#FFD700';

            overlay.innerHTML = `
                <div style="
                    text-align: center;
                    animation: level-up-bounce 0.8s ease-out;
                ">
                    <div style="
                        font-size: 5rem;
                        margin-bottom: 2rem;
                        animation: level-up-spin 1s ease-out;
                    ">
                        ${tier?.icon || '⭐'}
                    </div>

                    <div style="
                        font-size: 3rem;
                        font-weight: 900;
                        color: ${tierColor};
                        text-shadow: 0 4px 20px ${tierColor}66;
                        margin-bottom: 1rem;
                    ">
                        LEVEL UP!
                    </div>

                    <div style="
                        font-size: 4rem;
                        font-weight: 900;
                        color: white;
                        text-shadow: 0 4px 20px rgba(255, 255, 255, 0.5);
                    ">
                        Level ${newLevel}
                    </div>

                    ${tierUpgraded ? `
                    <div style="
                        margin-top: 2rem;
                        padding: 1rem 2rem;
                        background: ${tierColor};
                        border-radius: 12px;
                        font-size: 1.5rem;
                        font-weight: 700;
                        color: white;
                        text-transform: uppercase;
                        animation: tier-upgrade-flash 1s ease-in-out infinite;
                    ">
                        ${tier.icon} ${tier.name} TIER UNLOCKED! ${tier.icon}
                    </div>
                    ` : ''}
                </div>
            `;

            document.body.appendChild(overlay);

            // Play level up sound
            if (window.soundEnabled) {
                window.playSound?.(tierUpgraded ? 'tier_upgrade' : 'level_up');
            }

            // Confetti
            if (window.confettiEnabled) {
                window.triggerConfetti?.();
            }

            // Auto-close
            setTimeout(() => {
                overlay.style.animation = 'overlay-fade-out 0.3s ease-out';
                setTimeout(() => {
                    overlay.remove();
                    resolve();
                }, 300);
            }, 3000);
        });
    }
}

// ============================================
// EXPORT TO WINDOW
// ============================================

if (typeof window !== 'undefined') {
    window.StreakDisplay = StreakDisplay;
    window.RewardPopup = RewardPopup;
    window.DailyWheelSpinner = DailyWheelSpinner;
    window.JackpotAnimation = JackpotAnimation;
    window.LevelUpCelebration = LevelUpCelebration;
}
