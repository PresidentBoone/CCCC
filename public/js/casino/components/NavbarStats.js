/**
 * Casino Module - Navbar Stats Component
 *
 * Displays casino statistics (coins, XP, level, streak, hearts) in the navbar.
 * Subscribes to CasinoEngine events and animates value changes.
 *
 * @module casino/components/NavbarStats
 * @author CollegeClimb Casino Team
 * @version 1.0.0
 */

class NavbarStats {
  /**
   * Create a new NavbarStats component
   *
   * @param {Object} options - Configuration options
   * @param {CasinoEngine} options.engine - Casino engine instance
   * @param {HTMLElement} options.container - Container element for stats
   * @param {Object} options.config - UI configuration (optional)
   *
   * @example
   * const navbar = new NavbarStats({
   *   engine: casinoEngine,
   *   container: document.getElementById('casino-stats'),
   *   config: CasinoConfig.ui.navbar
   * });
   * navbar.initialize();
   */
  constructor(options = {}) {
    this.engine = options.engine;
    this.container = options.container;
    this.config = options.config || this._getDefaultConfig();

    // Use helpers if available
    const helpers = window.CasinoHelpers || {};
    const formatters = window.CasinoFormatters || {};
    this._throttle = helpers.throttle || this._fallbackThrottle;
    this._formatCoins = formatters.formatCoins || ((n) => `💰 ${n}`);
    this._formatXP = formatters.formatXP || ((xp, max) => `${xp} / ${max} XP`);
    this._formatLevel = formatters.formatLevel || ((level) => `Lv ${level}`);
    this._formatStreak = formatters.formatStreak || ((streak) => `🔥 ${streak}`);

    // State
    this.currentValues = {
      coins: 0,
      xp: 0,
      level: 1,
      streak: 0,
      hearts: 5
    };

    this.elements = {};
    this.unsubscribers = [];
    this.animationQueue = [];
    this.isAnimating = false;
  }

  /**
   * Initialize component
   * Renders UI and subscribes to engine events
   */
  async initialize() {
    if (!this.engine || !this.container) {
      console.error('NavbarStats: Missing engine or container');
      return;
    }

    // Render initial UI
    this._render();

    // Get initial values from engine
    const progress = this.engine.state.get('progress');
    if (progress) {
      this._updateAllValues(progress, false); // No animation on init
    }

    // Subscribe to state changes
    this._subscribeToStateChanges();

    // Subscribe to engine events
    this._subscribeToEngineEvents();

    console.log('[NavbarStats] Initialized');
  }

  /**
   * Destroy component
   * Unsubscribes from events and removes UI
   */
  destroy() {
    // Unsubscribe from all events
    for (const unsubscribe of this.unsubscribers) {
      unsubscribe();
    }
    this.unsubscribers = [];

    // Clear container
    if (this.container) {
      this.container.innerHTML = '';
    }

    console.log('[NavbarStats] Destroyed');
  }

  /**
   * Update a specific stat value
   *
   * @param {string} stat - Stat name ('coins', 'xp', 'level', 'streak', 'hearts')
   * @param {number} newValue - New value
   * @param {boolean} animate - Whether to animate the change
   */
  updateStat(stat, newValue, animate = true) {
    const oldValue = this.currentValues[stat];
    if (oldValue === newValue) return;

    this.currentValues[stat] = newValue;

    if (animate && this.config.animateUpdates) {
      this._animateValueChange(stat, oldValue, newValue);
    } else {
      this._updateDisplay(stat, newValue);
    }
  }

  /**
   * Flash a stat element (highlight effect)
   *
   * @param {string} stat - Stat name
   * @param {string} color - Flash color (default: '#F59E0B')
   */
  flashStat(stat, color = '#F59E0B') {
    const element = this.elements[stat];
    if (!element) return;

    element.style.transition = 'none';
    element.style.backgroundColor = color;
    element.style.transform = 'scale(1.1)';

    setTimeout(() => {
      element.style.transition = 'all 0.3s ease';
      element.style.backgroundColor = '';
      element.style.transform = '';
    }, 50);
  }

  // ============================================
  // INTERNAL METHODS
  // ============================================

  /**
   * Render the navbar stats UI
   * @private
   */
  _render() {
    const html = `
      <div class="casino-navbar-stats" data-casino-navbar>
        ${this.config.showCoins ? this._renderStatItem('coins', '💰', '0') : ''}
        ${this.config.showXP ? this._renderStatItem('xp', '⭐', '0 / 0 XP') : ''}
        ${this.config.showLevel ? this._renderStatItem('level', '🎓', 'Lv 1') : ''}
        ${this.config.showStreak ? this._renderStatItem('streak', '🔥', '0') : ''}
        ${this.config.showHearts ? this._renderStatItem('hearts', '❤️', '5') : ''}
      </div>
    `;

    this.container.innerHTML = html;

    // Cache element references
    this.elements.coins = this.container.querySelector('[data-stat="coins"]');
    this.elements.xp = this.container.querySelector('[data-stat="xp"]');
    this.elements.level = this.container.querySelector('[data-stat="level"]');
    this.elements.streak = this.container.querySelector('[data-stat="streak"]');
    this.elements.hearts = this.container.querySelector('[data-stat="hearts"]');

    // Add CSS if not already present
    this._injectStyles();
  }

  /**
   * Render a single stat item
   * @private
   */
  _renderStatItem(stat, emoji, initialValue) {
    return `
      <div class="casino-stat-item" data-stat="${stat}">
        <span class="casino-stat-emoji">${emoji}</span>
        <span class="casino-stat-value">${initialValue}</span>
      </div>
    `;
  }

  /**
   * Subscribe to state changes
   * @private
   */
  _subscribeToStateChanges() {
    // Throttled update function (max 60fps)
    const throttledUpdate = this._throttle((path, newValue) => {
      if (path === 'progress.coins') {
        this.updateStat('coins', newValue, true);
      } else if (path === 'progress.xp') {
        const level = this.engine.state.get('progress.level');
        const nextLevelXP = this.engine.rewardCalc.calculateXPForLevel(level + 1);
        this.updateStat('xp', newValue, true);
        this._updateXPDisplay(newValue, nextLevelXP);
      } else if (path === 'progress.level') {
        this.updateStat('level', newValue, true);
      } else if (path === 'progress.currentStreak') {
        this.updateStat('streak', newValue, true);
      } else if (path === 'progress.hearts') {
        this.updateStat('hearts', newValue, true);
      }
    }, 16); // ~60fps

    // Subscribe to individual paths
    const unsubCoins = this.engine.state.subscribe('progress.coins', throttledUpdate);
    const unsubXP = this.engine.state.subscribe('progress.xp', throttledUpdate);
    const unsubLevel = this.engine.state.subscribe('progress.level', throttledUpdate);
    const unsubStreak = this.engine.state.subscribe('progress.currentStreak', throttledUpdate);
    const unsubHearts = this.engine.state.subscribe('progress.hearts', throttledUpdate);

    this.unsubscribers.push(unsubCoins, unsubXP, unsubLevel, unsubStreak, unsubHearts);
  }

  /**
   * Subscribe to engine events
   * @private
   */
  _subscribeToEngineEvents() {
    // Correct answer - flash coins and XP
    const unsubCorrect = this.engine.on('correctAnswer', (data) => {
      this.flashStat('coins', '#10B981');
      this.flashStat('xp', '#3B82F6');
      if (data.streak > 1) {
        this.flashStat('streak', '#F59E0B');
      }
    });

    // Incorrect answer - flash hearts if enabled
    const unsubIncorrect = this.engine.on('incorrectAnswer', (data) => {
      if (this.config.showHearts) {
        this.flashStat('hearts', '#EF4444');
      }
      if (data.streakBroken) {
        this.flashStat('streak', '#6B7280');
      }
    });

    // Level up - flash level
    const unsubLevelUp = this.engine.on('levelUp', (data) => {
      this.flashStat('level', '#9333EA');
    });

    this.unsubscribers.push(unsubCorrect, unsubIncorrect, unsubLevelUp);
  }

  /**
   * Update all values at once
   * @private
   */
  _updateAllValues(progress, animate = false) {
    if (this.config.showCoins) {
      this.updateStat('coins', progress.coins || 0, animate);
    }
    if (this.config.showXP) {
      const xp = progress.xp || 0;
      const level = progress.level || 1;
      const nextLevelXP = this.engine.rewardCalc.calculateXPForLevel(level + 1);
      this.updateStat('xp', xp, animate);
      this._updateXPDisplay(xp, nextLevelXP);
    }
    if (this.config.showLevel) {
      this.updateStat('level', progress.level || 1, animate);
    }
    if (this.config.showStreak) {
      this.updateStat('streak', progress.currentStreak || 0, animate);
    }
    if (this.config.showHearts) {
      this.updateStat('hearts', progress.hearts || 5, animate);
    }
  }

  /**
   * Update display for a stat
   * @private
   */
  _updateDisplay(stat, value) {
    const element = this.elements[stat];
    if (!element) return;

    const valueElement = element.querySelector('.casino-stat-value');
    if (!valueElement) return;

    let displayValue = value;
    switch (stat) {
      case 'coins':
        displayValue = this._formatCoins(value, false);
        break;
      case 'xp':
        // XP display is handled by _updateXPDisplay
        return;
      case 'level':
        displayValue = this._formatLevel(value);
        break;
      case 'streak':
        displayValue = this._formatStreak(value);
        break;
      case 'hearts':
        displayValue = '❤️'.repeat(value) + '🤍'.repeat(5 - value);
        break;
    }

    valueElement.textContent = displayValue;
  }

  /**
   * Update XP display with progress bar
   * @private
   */
  _updateXPDisplay(currentXP, nextLevelXP) {
    const element = this.elements.xp;
    if (!element) return;

    const valueElement = element.querySelector('.casino-stat-value');
    if (!valueElement) return;

    const level = this.currentValues.level;
    const currentLevelXP = this.engine.rewardCalc.calculateXPForLevel(level);
    const xpInLevel = currentXP - currentLevelXP;
    const xpNeeded = nextLevelXP - currentLevelXP;
    const percentage = Math.min(100, (xpInLevel / xpNeeded) * 100);

    valueElement.textContent = this._formatXP(xpInLevel, xpNeeded);

    // Add progress bar if not exists
    let progressBar = element.querySelector('.casino-xp-progress');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.className = 'casino-xp-progress';
      progressBar.innerHTML = '<div class="casino-xp-progress-fill"></div>';
      element.appendChild(progressBar);
    }

    const fill = progressBar.querySelector('.casino-xp-progress-fill');
    if (fill) {
      fill.style.width = `${percentage}%`;
    }
  }

  /**
   * Animate value change with number counter
   * @private
   */
  _animateValueChange(stat, oldValue, newValue) {
    if (stat === 'xp' || stat === 'level') {
      // XP and level have custom animations
      this._updateDisplay(stat, newValue);
      return;
    }

    const element = this.elements[stat];
    if (!element) return;

    const valueElement = element.querySelector('.casino-stat-value');
    if (!valueElement) return;

    const duration = 500; // ms
    const startTime = Date.now();
    const delta = newValue - oldValue;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(oldValue + (delta * eased));

      this._updateDisplay(stat, currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this._updateDisplay(stat, newValue);
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Inject CSS styles
   * @private
   */
  _injectStyles() {
    const styleId = 'casino-navbar-stats-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .casino-navbar-stats {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.5rem 1rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 0.5rem;
        backdrop-filter: blur(10px);
      }

      .casino-stat-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0.75rem;
        border-radius: 0.375rem;
        background: rgba(255, 255, 255, 0.05);
        transition: all 0.3s ease;
        cursor: default;
      }

      .casino-stat-item:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
      }

      .casino-stat-emoji {
        font-size: 1.25rem;
        line-height: 1;
      }

      .casino-stat-value {
        font-size: 0.875rem;
        font-weight: 600;
        color: white;
        white-space: nowrap;
      }

      .casino-xp-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 0 0 0.375rem 0.375rem;
        overflow: hidden;
      }

      .casino-xp-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #3B82F6, #8B5CF6);
        transition: width 0.5s ease;
        border-radius: 0 0 0.375rem 0.375rem;
      }

      [data-stat="xp"] {
        position: relative;
        padding-bottom: 0.5rem;
      }

      /* Flash animation */
      @keyframes casino-stat-flash {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      /* Responsive */
      @media (max-width: 768px) {
        .casino-navbar-stats {
          gap: 0.5rem;
          padding: 0.375rem 0.75rem;
        }

        .casino-stat-item {
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
        }

        .casino-stat-emoji {
          font-size: 1rem;
        }

        .casino-stat-value {
          font-size: 0.75rem;
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
      showCoins: true,
      showXP: true,
      showLevel: true,
      showStreak: true,
      showHearts: true,
      animateUpdates: true
    };
  }

  /**
   * Fallback throttle function
   * @private
   */
  _fallbackThrottle(func, wait) {
    let lastTime = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastTime >= wait) {
        lastTime = now;
        return func(...args);
      }
    };
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.NavbarStats = NavbarStats;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NavbarStats;
}
