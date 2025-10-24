/**
 * Casino Module - Streak Bonus Panel Component
 *
 * Displays current streak status and upcoming milestones.
 * Shows fire animation and motivational messages.
 *
 * @module casino/components/StreakBonusPanel
 * @author CollegeClimb Casino Team
 * @version 1.0.0
 */

class StreakBonusPanel {
  /**
   * Create a new StreakBonusPanel component
   *
   * @param {Object} options - Configuration options
   * @param {CasinoEngine} options.engine - Casino engine instance
   * @param {HTMLElement} options.container - Container element
   * @param {Object} options.config - UI configuration (optional)
   *
   * @example
   * const streakPanel = new StreakBonusPanel({
   *   engine: casinoEngine,
   *   container: document.getElementById('streak-panel')
   * });
   * streakPanel.initialize();
   */
  constructor(options = {}) {
    this.engine = options.engine;
    this.container = options.container;
    this.config = options.config || this._getDefaultConfig();

    // Use formatters if available
    const formatters = window.CasinoFormatters || {};
    this._formatStreak = formatters.formatStreak || ((streak) => `🔥 ${streak}`);
    this._formatMultiplier = formatters.formatMultiplier || ((mult) => `${mult}x`);

    // State
    this.currentStreak = 0;
    this.currentMultiplier = 1.0;
    this.nextMilestone = null;
    this.isVisible = false;
    this.unsubscribers = [];
  }

  /**
   * Initialize component
   */
  async initialize() {
    if (!this.engine || !this.container) {
      console.error('StreakBonusPanel: Missing engine or container');
      return;
    }

    // Render initial UI
    this._render();

    // Get initial values
    const progress = this.engine.state.get('progress');
    if (progress) {
      this._updateStreak(progress.currentStreak || 0, false);
    }

    // Subscribe to events
    this._subscribeToEvents();

    console.log('[StreakBonusPanel] Initialized');
  }

  /**
   * Destroy component
   */
  destroy() {
    for (const unsubscribe of this.unsubscribers) {
      unsubscribe();
    }
    this.unsubscribers = [];

    if (this.container) {
      this.container.innerHTML = '';
    }

    console.log('[StreakBonusPanel] Destroyed');
  }

  /**
   * Show the panel with animation
   */
  show() {
    if (this.isVisible) return;

    const panel = this.container.querySelector('[data-streak-panel]');
    if (panel) {
      panel.classList.add('visible');
      this.isVisible = true;
    }
  }

  /**
   * Hide the panel with animation
   */
  hide() {
    if (!this.isVisible) return;

    const panel = this.container.querySelector('[data-streak-panel]');
    if (panel) {
      panel.classList.remove('visible');
      this.isVisible = false;
    }
  }

  /**
   * Trigger celebration animation for milestone
   *
   * @param {Object} streakInfo - Streak information
   */
  celebrateMilestone(streakInfo) {
    const panel = this.container.querySelector('[data-streak-panel]');
    if (!panel) return;

    // Add pulse animation
    panel.classList.add('milestone-achieved');

    // Show label temporarily
    const label = panel.querySelector('[data-streak-label]');
    if (label && streakInfo.label) {
      label.textContent = streakInfo.label;
      label.classList.add('show');

      setTimeout(() => {
        label.classList.remove('show');
      }, 3000);
    }

    // Remove animation class
    setTimeout(() => {
      panel.classList.remove('milestone-achieved');
    }, 1000);
  }

  // ============================================
  // INTERNAL METHODS
  // ============================================

  /**
   * Render the UI
   * @private
   */
  _render() {
    const html = `
      <div class="streak-bonus-panel" data-streak-panel>
        <div class="streak-header">
          <div class="streak-icon" data-streak-icon>🔥</div>
          <div class="streak-info">
            <div class="streak-count" data-streak-count>0</div>
            <div class="streak-multiplier" data-streak-multiplier>1.0x</div>
          </div>
        </div>

        <div class="streak-label" data-streak-label></div>

        <div class="streak-progress" data-streak-progress>
          <div class="streak-progress-bar">
            <div class="streak-progress-fill" data-streak-fill></div>
          </div>
          <div class="streak-progress-text" data-streak-text>
            Next milestone: <span data-milestone-count>3</span>
          </div>
        </div>

        <div class="streak-tip" data-streak-tip>
          Keep answering correctly to increase your multiplier!
        </div>
      </div>
    `;

    this.container.innerHTML = html;

    // Inject styles
    this._injectStyles();
  }

  /**
   * Subscribe to engine events
   * @private
   */
  _subscribeToEvents() {
    // Subscribe to streak changes
    const unsubStreak = this.engine.state.subscribe('progress.currentStreak', (newStreak) => {
      this._updateStreak(newStreak, true);
    });

    // Correct answer - show panel
    const unsubCorrect = this.engine.on('correctAnswer', (data) => {
      this.show();
      this._updateStreak(data.streak, true);

      // Check if milestone reached
      if (data.streakInfo && data.streakInfo.label) {
        this.celebrateMilestone(data.streakInfo);
      }
    });

    // Incorrect answer - hide panel after delay
    const unsubIncorrect = this.engine.on('incorrectAnswer', (data) => {
      if (data.streakBroken) {
        // Show broken streak message
        this._showStreakBroken();

        setTimeout(() => {
          this.hide();
          this._updateStreak(0, true);
        }, 2000);
      }
    });

    this.unsubscribers.push(unsubStreak, unsubCorrect, unsubIncorrect);
  }

  /**
   * Update streak display
   * @private
   */
  _updateStreak(streak, animate = false) {
    this.currentStreak = streak;

    // Get streak info from reward calculator
    const streakInfo = this.engine.rewardCalc.getStreakMultiplier(streak);
    this.currentMultiplier = streakInfo.multiplier;
    this.nextMilestone = streakInfo.nextMilestone;

    // Update count
    const countElement = this.container.querySelector('[data-streak-count]');
    if (countElement) {
      if (animate) {
        countElement.classList.add('pulse');
        setTimeout(() => countElement.classList.remove('pulse'), 300);
      }
      countElement.textContent = streak;
    }

    // Update multiplier
    const multiplierElement = this.container.querySelector('[data-streak-multiplier]');
    if (multiplierElement) {
      multiplierElement.textContent = this._formatMultiplier(this.currentMultiplier);

      // Color based on multiplier
      if (this.currentMultiplier >= 5.0) {
        multiplierElement.style.color = '#EF4444'; // Red
      } else if (this.currentMultiplier >= 3.0) {
        multiplierElement.style.color = '#F59E0B'; // Orange
      } else if (this.currentMultiplier >= 2.0) {
        multiplierElement.style.color = '#10B981'; // Green
      } else {
        multiplierElement.style.color = '#6B7280'; // Gray
      }
    }

    // Update icon (escalating fire)
    const iconElement = this.container.querySelector('[data-streak-icon]');
    if (iconElement) {
      let fireIcon = '🔥';
      if (streak >= 20) fireIcon = '🔥🔥🔥🔥🔥';
      else if (streak >= 15) fireIcon = '🔥🔥🔥🔥';
      else if (streak >= 10) fireIcon = '🔥🔥🔥';
      else if (streak >= 5) fireIcon = '🔥🔥';

      iconElement.textContent = fireIcon;
    }

    // Update progress bar
    this._updateProgressBar();

    // Show/hide panel
    if (streak > 0) {
      this.show();
    }
  }

  /**
   * Update progress bar to next milestone
   * @private
   */
  _updateProgressBar() {
    if (!this.nextMilestone) {
      const progressElement = this.container.querySelector('[data-streak-progress]');
      if (progressElement) {
        progressElement.style.display = 'none';
      }
      return;
    }

    const progressElement = this.container.querySelector('[data-streak-progress]');
    if (progressElement) {
      progressElement.style.display = 'block';
    }

    // Update milestone count text
    const milestoneCountElement = this.container.querySelector('[data-milestone-count]');
    if (milestoneCountElement) {
      milestoneCountElement.textContent = this.nextMilestone.streakCount;
    }

    // Update progress fill
    const fillElement = this.container.querySelector('[data-streak-fill]');
    if (fillElement && this.nextMilestone) {
      // Calculate progress to next milestone
      const currentMilestones = this.engine.rewardCalc.config.streakMultipliers || [];
      const currentMilestoneIndex = currentMilestones.findIndex(
        m => m.streakCount > this.currentStreak
      );

      if (currentMilestoneIndex > 0) {
        const prevMilestone = currentMilestones[currentMilestoneIndex - 1];
        const nextMilestone = currentMilestones[currentMilestoneIndex];

        const range = nextMilestone.streakCount - prevMilestone.streakCount;
        const progress = this.currentStreak - prevMilestone.streakCount;
        const percentage = Math.min(100, (progress / range) * 100);

        fillElement.style.width = `${percentage}%`;
      } else {
        // First milestone
        const percentage = Math.min(100, (this.currentStreak / this.nextMilestone.streakCount) * 100);
        fillElement.style.width = `${percentage}%`;
      }
    }
  }

  /**
   * Show streak broken message
   * @private
   */
  _showStreakBroken() {
    const label = this.container.querySelector('[data-streak-label]');
    if (label) {
      label.textContent = 'Streak Broken! 💔';
      label.style.color = '#EF4444';
      label.classList.add('show');

      setTimeout(() => {
        label.classList.remove('show');
        label.style.color = '';
      }, 2000);
    }

    // Shake animation
    const panel = this.container.querySelector('[data-streak-panel]');
    if (panel) {
      panel.classList.add('shake');
      setTimeout(() => panel.classList.remove('shake'), 500);
    }
  }

  /**
   * Inject CSS styles
   * @private
   */
  _injectStyles() {
    const styleId = 'streak-bonus-panel-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .streak-bonus-panel {
        background: linear-gradient(135deg, #FF6B6B 0%, #F59E0B 100%);
        border-radius: 1rem;
        padding: 1.5rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        color: white;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
        pointer-events: none;
      }

      .streak-bonus-panel.visible {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }

      .streak-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .streak-icon {
        font-size: 3rem;
        line-height: 1;
        animation: streak-float 2s ease-in-out infinite;
      }

      .streak-info {
        flex: 1;
      }

      .streak-count {
        font-size: 2.5rem;
        font-weight: 800;
        line-height: 1;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      }

      .streak-count.pulse {
        animation: streak-pulse 0.3s ease;
      }

      .streak-multiplier {
        font-size: 1.25rem;
        font-weight: 600;
        margin-top: 0.25rem;
        opacity: 0.9;
      }

      .streak-label {
        font-size: 1.125rem;
        font-weight: 700;
        text-align: center;
        margin: 1rem 0;
        padding: 0.5rem;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 0.5rem;
        opacity: 0;
        transform: scale(0.8);
        transition: all 0.3s ease;
      }

      .streak-label.show {
        opacity: 1;
        transform: scale(1);
      }

      .streak-progress {
        margin: 1rem 0;
      }

      .streak-progress-bar {
        height: 8px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 0.5rem;
      }

      .streak-progress-fill {
        height: 100%;
        background: white;
        border-radius: 4px;
        transition: width 0.5s ease;
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
      }

      .streak-progress-text {
        font-size: 0.875rem;
        text-align: center;
        opacity: 0.9;
      }

      .streak-tip {
        font-size: 0.875rem;
        text-align: center;
        opacity: 0.8;
        font-style: italic;
      }

      /* Milestone achievement animation */
      .streak-bonus-panel.milestone-achieved {
        animation: streak-milestone 1s ease;
      }

      /* Shake animation (streak broken) */
      .streak-bonus-panel.shake {
        animation: streak-shake 0.5s ease;
      }

      /* Animations */
      @keyframes streak-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }

      @keyframes streak-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
      }

      @keyframes streak-milestone {
        0%, 100% { transform: scale(1); }
        25% { transform: scale(1.05); }
        50% { transform: scale(0.95); }
        75% { transform: scale(1.02); }
      }

      @keyframes streak-shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
      }

      /* Responsive */
      @media (max-width: 768px) {
        .streak-bonus-panel {
          padding: 1rem;
        }

        .streak-icon {
          font-size: 2rem;
        }

        .streak-count {
          font-size: 2rem;
        }

        .streak-multiplier {
          font-size: 1rem;
        }

        .streak-label {
          font-size: 1rem;
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
      autoShow: true,
      autoHide: false,
      showProgress: true,
      showTips: true
    };
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.StreakBonusPanel = StreakBonusPanel;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StreakBonusPanel;
}
