/**
 * Casino Module - Level Up Celebration Component
 *
 * Full-screen celebration animation for level ups.
 * Features confetti, number animation, tier upgrade reveal, and rewards.
 *
 * @module casino/components/LevelUpCelebration
 * @author CollegeClimb Casino Team
 * @version 1.0.0
 */

class LevelUpCelebration {
  /**
   * Create a new LevelUpCelebration component
   *
   * @param {Object} options - Configuration options
   * @param {CasinoEngine} options.engine - Casino engine instance
   * @param {HTMLElement} options.container - Container element (optional, uses body)
   * @param {Object} options.config - Configuration (optional)
   *
   * @example
   * const celebration = new LevelUpCelebration({
   *   engine: casinoEngine
   * });
   * celebration.initialize();
   */
  constructor(options = {}) {
    this.engine = options.engine;
    this.container = options.container || document.body;
    this.config = options.config || this._getDefaultConfig();

    // Use formatters if available
    const formatters = window.CasinoFormatters || {};
    this._getTierEmoji = formatters.getTierEmoji || ((tier) => '🥉');
    this._formatNumber = formatters.formatNumber || ((n) => n.toString());

    // State
    this.celebrationElement = null;
    this.isPlaying = false;
    this.unsubscribers = [];
  }

  /**
   * Initialize component
   */
  async initialize() {
    if (!this.engine) {
      console.error('LevelUpCelebration: Missing engine');
      return;
    }

    // Create celebration element
    this._createElement();

    // Subscribe to level up events
    this._subscribeToEvents();

    console.log('[LevelUpCelebration] Initialized');
  }

  /**
   * Destroy component
   */
  destroy() {
    for (const unsubscribe of this.unsubscribers) {
      unsubscribe();
    }
    this.unsubscribers = [];

    if (this.celebrationElement && this.celebrationElement.parentNode) {
      this.celebrationElement.parentNode.removeChild(this.celebrationElement);
    }

    console.log('[LevelUpCelebration] Destroyed');
  }

  /**
   * Play level up celebration
   *
   * @param {Object} data - Level up data
   * @param {number} data.oldLevel - Previous level
   * @param {number} data.newLevel - New level
   * @param {string} data.oldTier - Previous tier (optional)
   * @param {string} data.newTier - New tier (optional)
   * @param {Object} data.rewards - Rewards earned (optional)
   */
  async play(data) {
    if (this.isPlaying) return;

    this.isPlaying = true;

    // Show celebration
    this.celebrationElement.classList.add('visible');

    // Update content
    this._updateContent(data);

    // Trigger confetti
    if (this.config.showConfetti) {
      this._triggerConfetti(data.newTier);
    }

    // Play animation sequence
    await this._playAnimationSequence(data);

    // Auto-hide after duration
    setTimeout(() => {
      this.hide();
    }, this.config.duration);
  }

  /**
   * Hide celebration
   */
  hide() {
    if (!this.isPlaying) return;

    this.celebrationElement.classList.remove('visible');
    this.isPlaying = false;

    // Reset after transition
    setTimeout(() => {
      this._reset();
    }, 300);
  }

  // ============================================
  // INTERNAL METHODS
  // ============================================

  /**
   * Create celebration element
   * @private
   */
  _createElement() {
    const element = document.createElement('div');
    element.className = 'level-up-celebration';
    element.setAttribute('data-level-celebration', '');

    element.innerHTML = `
      <div class="celebration-overlay"></div>
      <div class="celebration-content">
        <!-- Main level display -->
        <div class="celebration-badge" data-badge>
          <div class="celebration-glow"></div>
          <div class="celebration-level" data-level>1</div>
        </div>

        <!-- Level up text -->
        <div class="celebration-text" data-text>
          <h1 class="celebration-title">LEVEL UP!</h1>
          <p class="celebration-subtitle" data-subtitle>You reached level <span data-new-level>1</span></p>
        </div>

        <!-- Tier upgrade (if applicable) -->
        <div class="celebration-tier" data-tier-upgrade style="display: none;">
          <div class="tier-badge" data-tier-badge>
            <span data-tier-emoji>🥉</span>
          </div>
          <p class="tier-label" data-tier-label>Bronze Tier</p>
          <p class="tier-message">Tier Upgraded!</p>
        </div>

        <!-- Rewards -->
        <div class="celebration-rewards" data-rewards style="display: none;">
          <p class="rewards-label">Rewards:</p>
          <div class="rewards-list" data-rewards-list></div>
        </div>

        <!-- Continue button -->
        <button class="celebration-continue" data-continue>
          Continue
        </button>
      </div>
    `;

    this.container.appendChild(element);
    this.celebrationElement = element;

    // Event listeners
    const continueBtn = element.querySelector('[data-continue]');
    continueBtn.addEventListener('click', () => this.hide());

    // Click anywhere to dismiss
    const overlay = element.querySelector('.celebration-overlay');
    overlay.addEventListener('click', () => {
      if (this.config.clickToDismiss) {
        this.hide();
      }
    });

    // Inject styles
    this._injectStyles();
  }

  /**
   * Subscribe to engine events
   * @private
   */
  _subscribeToEvents() {
    const unsubLevelUp = this.engine.on('levelUp', (data) => {
      this.play(data);
    });

    this.unsubscribers.push(unsubLevelUp);
  }

  /**
   * Update celebration content
   * @private
   */
  _updateContent(data) {
    const { oldLevel, newLevel, oldTier, newTier, rewards } = data;

    // Update level number
    const levelElement = this.celebrationElement.querySelector('[data-level]');
    const newLevelSpan = this.celebrationElement.querySelector('[data-new-level]');

    if (levelElement) {
      this._animateNumber(levelElement, oldLevel, newLevel, 1000);
    }

    if (newLevelSpan) {
      newLevelSpan.textContent = newLevel;
    }

    // Check for tier upgrade
    if (oldTier && newTier && oldTier !== newTier) {
      this._showTierUpgrade(newTier);
    }

    // Show rewards
    if (rewards) {
      this._showRewards(rewards);
    }
  }

  /**
   * Show tier upgrade
   * @private
   */
  _showTierUpgrade(newTier) {
    const tierUpgrade = this.celebrationElement.querySelector('[data-tier-upgrade]');
    const tierEmoji = this.celebrationElement.querySelector('[data-tier-emoji]');
    const tierLabel = this.celebrationElement.querySelector('[data-tier-label]');

    if (!tierUpgrade) return;

    tierUpgrade.style.display = 'block';

    if (tierEmoji) {
      tierEmoji.textContent = this._getTierEmoji(newTier);
    }

    if (tierLabel) {
      tierLabel.textContent = `${newTier.charAt(0).toUpperCase() + newTier.slice(1)} Tier`;
    }
  }

  /**
   * Show rewards
   * @private
   */
  _showRewards(rewards) {
    const rewardsDiv = this.celebrationElement.querySelector('[data-rewards]');
    const rewardsList = this.celebrationElement.querySelector('[data-rewards-list]');

    if (!rewardsDiv || !rewardsList) return;

    rewardsDiv.style.display = 'block';

    // Build rewards HTML
    let rewardsHTML = '';

    if (rewards.coins) {
      rewardsHTML += `<div class="reward-item">💰 ${this._formatNumber(rewards.coins)} Coins</div>`;
    }

    if (rewards.xp) {
      rewardsHTML += `<div class="reward-item">⭐ ${this._formatNumber(rewards.xp)} XP</div>`;
    }

    if (rewards.items && rewards.items.length > 0) {
      for (const item of rewards.items) {
        rewardsHTML += `<div class="reward-item">🎁 ${item.name || 'Item'}</div>`;
      }
    }

    if (rewards.unlockedFeature) {
      rewardsHTML += `<div class="reward-item">🔓 ${rewards.unlockedFeature}</div>`;
    }

    rewardsList.innerHTML = rewardsHTML;
  }

  /**
   * Play animation sequence
   * @private
   */
  async _playAnimationSequence(data) {
    const badge = this.celebrationElement.querySelector('[data-badge]');
    const text = this.celebrationElement.querySelector('[data-text]');
    const tierUpgrade = this.celebrationElement.querySelector('[data-tier-upgrade]');
    const rewards = this.celebrationElement.querySelector('[data-rewards]');
    const continueBtn = this.celebrationElement.querySelector('[data-continue]');

    // Sequence timing
    await this._sleep(100);

    // 1. Show badge with scale animation
    if (badge) {
      badge.classList.add('animate-in');
    }

    await this._sleep(500);

    // 2. Show text
    if (text) {
      text.classList.add('animate-in');
    }

    await this._sleep(800);

    // 3. Show tier upgrade (if applicable)
    if (tierUpgrade && tierUpgrade.style.display !== 'none') {
      tierUpgrade.classList.add('animate-in');
    }

    await this._sleep(600);

    // 4. Show rewards (if applicable)
    if (rewards && rewards.style.display !== 'none') {
      rewards.classList.add('animate-in');
    }

    await this._sleep(400);

    // 5. Show continue button
    if (continueBtn) {
      continueBtn.classList.add('animate-in');
    }
  }

  /**
   * Animate number from old to new
   * @private
   */
  _animateNumber(element, oldValue, newValue, duration) {
    const startTime = Date.now();
    const delta = newValue - oldValue;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(oldValue + (delta * eased));

      element.textContent = currentValue;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = newValue;
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Trigger confetti
   * @private
   */
  _triggerConfetti(tier) {
    if (!window.ConfettiSystem) {
      console.log('[LevelUpCelebration] ConfettiSystem not available');
      return;
    }

    // More confetti for higher tiers
    let particleCount = 100;
    if (tier === 'legend') particleCount = 300;
    else if (tier === 'diamond') particleCount = 250;
    else if (tier === 'platinum') particleCount = 200;
    else if (tier === 'gold') particleCount = 150;

    const confetti = new window.ConfettiSystem();
    confetti.burst({ particleCount });

    // Second burst after delay
    setTimeout(() => {
      confetti.burst({ particleCount: particleCount / 2 });
    }, 500);
  }

  /**
   * Reset celebration
   * @private
   */
  _reset() {
    const elements = this.celebrationElement.querySelectorAll('.animate-in');
    for (const el of elements) {
      el.classList.remove('animate-in');
    }

    const tierUpgrade = this.celebrationElement.querySelector('[data-tier-upgrade]');
    const rewards = this.celebrationElement.querySelector('[data-rewards]');

    if (tierUpgrade) tierUpgrade.style.display = 'none';
    if (rewards) rewards.style.display = 'none';
  }

  /**
   * Sleep helper
   * @private
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Inject CSS styles
   * @private
   */
  _injectStyles() {
    const styleId = 'level-up-celebration-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .level-up-celebration {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }

      .level-up-celebration.visible {
        opacity: 1;
        pointer-events: auto;
      }

      .celebration-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle, rgba(147,51,234,0.3), rgba(0,0,0,0.9));
        backdrop-filter: blur(10px);
      }

      .celebration-content {
        position: relative;
        text-align: center;
        color: white;
      }

      /* Badge */
      .celebration-badge {
        position: relative;
        width: 200px;
        height: 200px;
        margin: 0 auto 2rem auto;
        opacity: 0;
        transform: scale(0);
        transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .celebration-badge.animate-in {
        opacity: 1;
        transform: scale(1);
      }

      .celebration-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 250px;
        height: 250px;
        background: radial-gradient(circle, rgba(147,51,234,0.6), transparent);
        border-radius: 50%;
        animation: celebration-pulse 2s ease infinite;
      }

      .celebration-level {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 180px;
        height: 180px;
        background: linear-gradient(135deg, #9333EA 0%, #7C3AED 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 5rem;
        font-weight: 900;
        color: white;
        text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        border: 8px solid #F59E0B;
        box-shadow: 0 0 40px rgba(245, 158, 11, 0.6);
      }

      /* Text */
      .celebration-text {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.5s ease;
      }

      .celebration-text.animate-in {
        opacity: 1;
        transform: translateY(0);
      }

      .celebration-title {
        font-size: 4rem;
        font-weight: 900;
        margin: 0 0 1rem 0;
        background: linear-gradient(135deg, #F59E0B, #EF4444);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-shadow: 0 4px 20px rgba(245, 158, 11, 0.5);
        animation: celebration-glow 2s ease infinite;
      }

      .celebration-subtitle {
        font-size: 1.5rem;
        color: #D1D5DB;
        margin: 0;
      }

      /* Tier upgrade */
      .celebration-tier {
        margin: 2rem 0;
        opacity: 0;
        transform: scale(0.8);
        transition: all 0.5s ease;
      }

      .celebration-tier.animate-in {
        opacity: 1;
        transform: scale(1);
      }

      .tier-badge {
        width: 100px;
        height: 100px;
        margin: 0 auto 1rem auto;
        background: linear-gradient(135deg, #F59E0B, #EF4444);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
        border: 4px solid white;
        box-shadow: 0 10px 40px rgba(245, 158, 11, 0.5);
      }

      .tier-label {
        font-size: 1.5rem;
        font-weight: 700;
        color: #F59E0B;
        margin: 0.5rem 0;
      }

      .tier-message {
        font-size: 1.125rem;
        color: #9CA3AF;
        margin: 0;
      }

      /* Rewards */
      .celebration-rewards {
        margin: 2rem 0;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.5s ease;
      }

      .celebration-rewards.animate-in {
        opacity: 1;
        transform: translateY(0);
      }

      .rewards-label {
        font-size: 1.25rem;
        font-weight: 600;
        color: #D1D5DB;
        margin: 0 0 1rem 0;
      }

      .rewards-list {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: center;
      }

      .reward-item {
        padding: 0.75rem 1.5rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 0.5rem;
        font-size: 1.125rem;
        font-weight: 600;
        backdrop-filter: blur(10px);
      }

      /* Continue button */
      .celebration-continue {
        margin-top: 2rem;
        padding: 1rem 3rem;
        background: linear-gradient(135deg, #10B981 0%, #059669 100%);
        color: white;
        border: none;
        border-radius: 0.75rem;
        font-size: 1.25rem;
        font-weight: 700;
        cursor: pointer;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.5s ease;
        box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
      }

      .celebration-continue.animate-in {
        opacity: 1;
        transform: translateY(0);
      }

      .celebration-continue:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 40px rgba(16, 185, 129, 0.6);
      }

      /* Animations */
      @keyframes celebration-pulse {
        0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
      }

      @keyframes celebration-glow {
        0%, 100% { filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.5)); }
        50% { filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.8)); }
      }

      /* Responsive */
      @media (max-width: 768px) {
        .celebration-badge {
          width: 150px;
          height: 150px;
        }

        .celebration-glow {
          width: 200px;
          height: 200px;
        }

        .celebration-level {
          width: 130px;
          height: 130px;
          font-size: 3.5rem;
          border: 6px solid #F59E0B;
        }

        .celebration-title {
          font-size: 2.5rem;
        }

        .celebration-subtitle {
          font-size: 1.125rem;
        }

        .tier-badge {
          width: 80px;
          height: 80px;
          font-size: 2.5rem;
        }

        .tier-label {
          font-size: 1.25rem;
        }

        .reward-item {
          font-size: 1rem;
          padding: 0.5rem 1rem;
        }

        .celebration-continue {
          padding: 0.875rem 2rem;
          font-size: 1.125rem;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Get default configuration
   * @private
   */
  _getDefaultConfig() {
    return {
      duration: 4000,
      showConfetti: true,
      clickToDismiss: false
    };
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.LevelUpCelebration = LevelUpCelebration;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LevelUpCelebration;
}
