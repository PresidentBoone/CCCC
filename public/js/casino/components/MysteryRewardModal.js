/**
 * Casino Module - Mystery Reward Modal Component
 *
 * Animated modal for revealing mystery box rewards.
 * Features box opening animation, rarity reveal, and reward display.
 *
 * @module casino/components/MysteryRewardModal
 * @author CollegeClimb Casino Team
 * @version 1.0.0
 */

class MysteryRewardModal {
  /**
   * Create a new MysteryRewardModal component
   *
   * @param {Object} options - Configuration options
   * @param {CasinoEngine} options.engine - Casino engine instance
   * @param {HTMLElement} options.container - Container element (optional, uses body)
   * @param {Object} options.config - UI configuration (optional)
   *
   * @example
   * const modal = new MysteryRewardModal({
   *   engine: casinoEngine
   * });
   * modal.initialize();
   */
  constructor(options = {}) {
    this.engine = options.engine;
    this.container = options.container || document.body;
    this.config = options.config || this._getDefaultConfig();

    // Use formatters if available
    const formatters = window.CasinoFormatters || {};
    this._formatCoins = formatters.formatCoins || ((n) => `💰 ${n}`);
    this._formatXP = formatters.formatXP || ((n) => `⭐ ${n} XP`);
    this._formatRarity = formatters.formatRarity || ((r) => ({ label: r.toUpperCase(), color: '#6B7280', emoji: '⚪' }));

    // State
    this.isOpen = false;
    this.isAnimating = false;
    this.modalElement = null;
    this.unsubscribers = [];
  }

  /**
   * Initialize component
   */
  async initialize() {
    if (!this.engine) {
      console.error('MysteryRewardModal: Missing engine');
      return;
    }

    // Create modal element
    this._createModal();

    // Subscribe to events
    this._subscribeToEvents();

    console.log('[MysteryRewardModal] Initialized');
  }

  /**
   * Destroy component
   */
  destroy() {
    for (const unsubscribe of this.unsubscribers) {
      unsubscribe();
    }
    this.unsubscribers = [];

    if (this.modalElement && this.modalElement.parentNode) {
      this.modalElement.parentNode.removeChild(this.modalElement);
    }

    console.log('[MysteryRewardModal] Destroyed');
  }

  /**
   * Show mystery reward with animation
   *
   * @param {Object} reward - Reward data
   * @param {string} reward.rarity - Rarity level
   * @param {string} reward.type - Reward type
   * @param {number} reward.amount - Reward amount (if applicable)
   * @param {string} reward.itemId - Item ID (if applicable)
   */
  async show(reward) {
    if (this.isOpen || this.isAnimating) return;

    this.isOpen = true;
    this.isAnimating = true;

    // Show modal
    this.modalElement.classList.add('visible');

    // Play opening animation
    await this._playOpeningAnimation();

    // Reveal rarity
    await this._revealRarity(reward.rarity);

    // Reveal reward
    await this._revealReward(reward);

    this.isAnimating = false;

    // Auto-close after delay
    if (this.config.autoClose) {
      setTimeout(() => {
        this.close();
      }, this.config.autoCloseDelay);
    }
  }

  /**
   * Close the modal
   */
  close() {
    if (!this.isOpen || this.isAnimating) return;

    this.modalElement.classList.remove('visible');
    this.isOpen = false;

    // Reset for next use
    setTimeout(() => {
      this._resetModal();
    }, 300);
  }

  // ============================================
  // INTERNAL METHODS
  // ============================================

  /**
   * Create modal element
   * @private
   */
  _createModal() {
    const modal = document.createElement('div');
    modal.className = 'mystery-reward-modal';
    modal.setAttribute('data-mystery-modal', '');

    modal.innerHTML = `
      <div class="mystery-modal-overlay" data-overlay></div>
      <div class="mystery-modal-content" data-content>
        <!-- Box container -->
        <div class="mystery-box-container" data-box-container>
          <div class="mystery-box" data-box>
            <div class="mystery-box-lid" data-lid>
              <div class="mystery-box-shine"></div>
              ?
            </div>
            <div class="mystery-box-base" data-base></div>
          </div>
        </div>

        <!-- Rarity reveal -->
        <div class="mystery-rarity-reveal" data-rarity-reveal>
          <div class="rarity-glow" data-rarity-glow></div>
          <div class="rarity-emoji" data-rarity-emoji>⚪</div>
          <div class="rarity-label" data-rarity-label>COMMON</div>
        </div>

        <!-- Reward reveal -->
        <div class="mystery-reward-reveal" data-reward-reveal>
          <div class="reward-icon" data-reward-icon>💰</div>
          <div class="reward-amount" data-reward-amount>+100</div>
          <div class="reward-description" data-reward-description>Coins</div>
        </div>

        <!-- Close button -->
        <button class="mystery-close-btn" data-close-btn>
          Continue
        </button>
      </div>
    `;

    this.container.appendChild(modal);
    this.modalElement = modal;

    // Event listeners
    const overlay = modal.querySelector('[data-overlay]');
    const closeBtn = modal.querySelector('[data-close-btn]');

    overlay.addEventListener('click', () => {
      if (this.config.closeOnOverlayClick && !this.isAnimating) {
        this.close();
      }
    });

    closeBtn.addEventListener('click', () => {
      if (!this.isAnimating) {
        this.close();
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
    // Show modal when mystery reward is triggered
    const unsubCorrect = this.engine.on('correctAnswer', (data) => {
      if (data.mysteryReward && data.mysteryReward.triggered) {
        // Delay to let other animations finish
        setTimeout(() => {
          this.show(data.mysteryReward);
        }, 500);
      }
    });

    this.unsubscribers.push(unsubCorrect);
  }

  /**
   * Play box opening animation
   * @private
   */
  async _playOpeningAnimation() {
    const box = this.modalElement.querySelector('[data-box]');
    const lid = this.modalElement.querySelector('[data-lid]');

    if (!box || !lid) return;

    // Show box
    box.classList.add('shake');

    // Wait for shake
    await this._sleep(1000);

    // Open lid
    lid.classList.add('open');

    // Wait for lid to open
    await this._sleep(500);
  }

  /**
   * Reveal rarity with glow effect
   * @private
   */
  async _revealRarity(rarity) {
    const rarityReveal = this.modalElement.querySelector('[data-rarity-reveal]');
    const rarityGlow = this.modalElement.querySelector('[data-rarity-glow]');
    const rarityEmoji = this.modalElement.querySelector('[data-rarity-emoji]');
    const rarityLabel = this.modalElement.querySelector('[data-rarity-label]');

    if (!rarityReveal) return;

    // Get rarity info
    const rarityInfo = this._formatRarity(rarity);

    // Hide box, show rarity
    const boxContainer = this.modalElement.querySelector('[data-box-container]');
    if (boxContainer) {
      boxContainer.classList.add('hidden');
    }

    rarityReveal.classList.add('visible');

    // Set rarity styling
    if (rarityGlow) {
      rarityGlow.style.background = `radial-gradient(circle, ${rarityInfo.color}80, transparent)`;
    }

    if (rarityEmoji) {
      rarityEmoji.textContent = rarityInfo.emoji;
    }

    if (rarityLabel) {
      rarityLabel.textContent = rarityInfo.label;
      rarityLabel.style.color = rarityInfo.color;
    }

    // Wait for reveal
    await this._sleep(1500);
  }

  /**
   * Reveal actual reward
   * @private
   */
  async _revealReward(reward) {
    const rarityReveal = this.modalElement.querySelector('[data-rarity-reveal]');
    const rewardReveal = this.modalElement.querySelector('[data-reward-reveal]');
    const rewardIcon = this.modalElement.querySelector('[data-reward-icon]');
    const rewardAmount = this.modalElement.querySelector('[data-reward-amount]');
    const rewardDescription = this.modalElement.querySelector('[data-reward-description]');

    if (!rewardReveal) return;

    // Hide rarity, show reward
    if (rarityReveal) {
      rarityReveal.classList.remove('visible');
    }

    rewardReveal.classList.add('visible');

    // Set reward content
    let icon = '🎁';
    let amount = '';
    let description = '';

    switch (reward.type) {
      case 'coins':
        icon = '💰';
        amount = `+${reward.amount}`;
        description = 'Coins';
        break;

      case 'xp':
        icon = '⭐';
        amount = `+${reward.amount}`;
        description = 'XP';
        break;

      case 'item':
        icon = '🎁';
        amount = reward.itemName || 'Item';
        description = reward.itemDescription || 'Special item';
        break;

      case 'badge':
        icon = '🏆';
        amount = reward.badgeName || 'Badge';
        description = 'Achievement unlocked';
        break;

      case 'avatar':
        icon = '🖼️';
        amount = reward.avatarName || 'Avatar';
        description = 'New avatar frame';
        break;

      case 'theme':
        icon = '🎨';
        amount = reward.themeName || 'Theme';
        description = 'New theme unlocked';
        break;

      default:
        icon = '🎁';
        amount = 'Mystery Prize';
        description = 'Congratulations!';
    }

    if (rewardIcon) rewardIcon.textContent = icon;
    if (rewardAmount) rewardAmount.textContent = amount;
    if (rewardDescription) rewardDescription.textContent = description;

    // Confetti effect
    if (this.config.showConfetti && reward.rarity !== 'common') {
      this._triggerConfetti(reward.rarity);
    }

    // Wait before allowing close
    await this._sleep(1000);

    // Show close button
    const closeBtn = this.modalElement.querySelector('[data-close-btn]');
    if (closeBtn) {
      closeBtn.classList.add('visible');
    }
  }

  /**
   * Reset modal to initial state
   * @private
   */
  _resetModal() {
    const boxContainer = this.modalElement.querySelector('[data-box-container]');
    const rarityReveal = this.modalElement.querySelector('[data-rarity-reveal]');
    const rewardReveal = this.modalElement.querySelector('[data-reward-reveal]');
    const box = this.modalElement.querySelector('[data-box]');
    const lid = this.modalElement.querySelector('[data-lid]');
    const closeBtn = this.modalElement.querySelector('[data-close-btn]');

    if (boxContainer) boxContainer.classList.remove('hidden');
    if (rarityReveal) rarityReveal.classList.remove('visible');
    if (rewardReveal) rewardReveal.classList.remove('visible');
    if (box) box.classList.remove('shake');
    if (lid) lid.classList.remove('open');
    if (closeBtn) closeBtn.classList.remove('visible');
  }

  /**
   * Trigger confetti animation
   * @private
   */
  _triggerConfetti(rarity) {
    // Use ConfettiSystem if available
    if (window.ConfettiSystem) {
      const confetti = new window.ConfettiSystem();
      confetti.burst({ particleCount: 50 });
    } else {
      console.log('[MysteryRewardModal] Confetti system not available');
    }
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
    const styleId = 'mystery-reward-modal-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .mystery-reward-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }

      .mystery-reward-modal.visible {
        opacity: 1;
        pointer-events: auto;
      }

      .mystery-modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
      }

      .mystery-modal-content {
        position: relative;
        width: 90%;
        max-width: 500px;
        background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
        border-radius: 1.5rem;
        padding: 3rem;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        text-align: center;
      }

      /* Mystery Box */
      .mystery-box-container {
        transition: opacity 0.3s ease, transform 0.3s ease;
      }

      .mystery-box-container.hidden {
        opacity: 0;
        transform: scale(0.8);
        pointer-events: none;
      }

      .mystery-box {
        position: relative;
        width: 200px;
        height: 200px;
        margin: 0 auto;
      }

      .mystery-box.shake {
        animation: mystery-shake 0.5s ease infinite;
      }

      .mystery-box-lid {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 180px;
        height: 80px;
        background: linear-gradient(135deg, #9333EA 0%, #7C3AED 100%);
        border-radius: 10px 10px 0 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
        color: white;
        font-weight: bold;
        box-shadow: 0 10px 30px rgba(147, 51, 234, 0.5);
        transition: transform 0.5s ease;
        transform-origin: bottom center;
        overflow: hidden;
      }

      .mystery-box-lid.open {
        transform: translateX(-50%) rotateX(-120deg);
      }

      .mystery-box-shine {
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        animation: mystery-shine 2s ease infinite;
      }

      .mystery-box-base {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 180px;
        height: 140px;
        background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
        border-radius: 0 0 10px 10px;
        box-shadow: 0 10px 30px rgba(109, 40, 217, 0.5);
      }

      /* Rarity Reveal */
      .mystery-rarity-reveal {
        opacity: 0;
        transform: scale(0.5);
        transition: all 0.5s ease;
        pointer-events: none;
      }

      .mystery-rarity-reveal.visible {
        opacity: 1;
        transform: scale(1);
      }

      .rarity-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 300px;
        height: 300px;
        border-radius: 50%;
        animation: rarity-pulse 2s ease infinite;
      }

      .rarity-emoji {
        font-size: 6rem;
        line-height: 1;
        margin-bottom: 1rem;
        animation: rarity-float 2s ease infinite;
      }

      .rarity-label {
        font-size: 2rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-shadow: 0 0 20px currentColor;
      }

      /* Reward Reveal */
      .mystery-reward-reveal {
        opacity: 0;
        transform: scale(0.5);
        transition: all 0.5s ease;
        pointer-events: none;
      }

      .mystery-reward-reveal.visible {
        opacity: 1;
        transform: scale(1);
      }

      .reward-icon {
        font-size: 6rem;
        line-height: 1;
        margin-bottom: 1rem;
        animation: reward-bounce 0.6s ease;
      }

      .reward-amount {
        font-size: 3rem;
        font-weight: 800;
        color: #F59E0B;
        margin-bottom: 0.5rem;
        text-shadow: 0 0 20px #F59E0B;
      }

      .reward-description {
        font-size: 1.25rem;
        color: #9CA3AF;
      }

      /* Close Button */
      .mystery-close-btn {
        margin-top: 2rem;
        padding: 1rem 2rem;
        background: linear-gradient(135deg, #10B981 0%, #059669 100%);
        color: white;
        border: none;
        border-radius: 0.75rem;
        font-size: 1.125rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateY(20px);
      }

      .mystery-close-btn.visible {
        opacity: 1;
        transform: translateY(0);
      }

      .mystery-close-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
      }

      /* Animations */
      @keyframes mystery-shake {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-5deg); }
        75% { transform: rotate(5deg); }
      }

      @keyframes mystery-shine {
        0% { left: -100%; }
        100% { left: 200%; }
      }

      @keyframes rarity-pulse {
        0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
        50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
      }

      @keyframes rarity-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }

      @keyframes reward-bounce {
        0%, 100% { transform: scale(1); }
        25% { transform: scale(1.2); }
        50% { transform: scale(0.9); }
        75% { transform: scale(1.1); }
      }

      /* Responsive */
      @media (max-width: 768px) {
        .mystery-modal-content {
          padding: 2rem;
        }

        .mystery-box {
          width: 150px;
          height: 150px;
        }

        .mystery-box-lid {
          width: 140px;
          height: 60px;
          font-size: 2rem;
        }

        .mystery-box-base {
          width: 140px;
          height: 100px;
        }

        .rarity-emoji {
          font-size: 4rem;
        }

        .rarity-label {
          font-size: 1.5rem;
        }

        .reward-icon {
          font-size: 4rem;
        }

        .reward-amount {
          font-size: 2rem;
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
      autoClose: false,
      autoCloseDelay: 5000,
      closeOnOverlayClick: false,
      showConfetti: true
    };
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.MysteryRewardModal = MysteryRewardModal;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MysteryRewardModal;
}
