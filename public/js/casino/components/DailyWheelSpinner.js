/**
 * Casino Module - Daily Wheel Spinner Component
 *
 * Canvas-based spinning wheel for daily bonus rewards.
 * Features physics-based spinning, segment highlighting, and prize reveal.
 *
 * @module casino/components/DailyWheelSpinner
 * @author CollegeClimb Casino Team
 * @version 1.0.0
 */

class DailyWheelSpinner {
  /**
   * Create a new DailyWheelSpinner component
   *
   * @param {Object} options - Configuration options
   * @param {CasinoEngine} options.engine - Casino engine instance
   * @param {HTMLElement} options.container - Container element (optional, uses body)
   * @param {Object} options.config - Wheel configuration (optional)
   *
   * @example
   * const wheel = new DailyWheelSpinner({
   *   engine: casinoEngine,
   *   config: CasinoConfig.dailyWheel
   * });
   * wheel.initialize();
   */
  constructor(options = {}) {
    this.engine = options.engine;
    this.container = options.container || document.body;
    this.config = options.config || this._getDefaultConfig();

    // Canvas elements
    this.modalElement = null;
    this.canvas = null;
    this.ctx = null;

    // Wheel state
    this.segments = this.config.segments || [];
    this.rotation = 0; // Current rotation in radians
    this.spinVelocity = 0;
    this.isSpinning = false;
    this.isOpen = false;
    this.canSpin = false;
    this.selectedSegment = null;

    // Animation
    this.animationFrame = null;
    this.lastSpinTime = null;

    // Physics
    this.friction = 0.97; // Deceleration rate
    this.minVelocity = 0.01; // Stop threshold

    this.unsubscribers = [];
  }

  /**
   * Initialize component
   */
  async initialize() {
    if (!this.engine) {
      console.error('DailyWheelSpinner: Missing engine');
      return;
    }

    // Create modal
    this._createModal();

    // Subscribe to events
    this._subscribeToEvents();

    // Check if wheel is available
    await this._checkAvailability();

    console.log('[DailyWheelSpinner] Initialized');
  }

  /**
   * Destroy component
   */
  destroy() {
    this._stopAnimation();

    for (const unsubscribe of this.unsubscribers) {
      unsubscribe();
    }
    this.unsubscribers = [];

    if (this.modalElement && this.modalElement.parentNode) {
      this.modalElement.parentNode.removeChild(this.modalElement);
    }

    console.log('[DailyWheelSpinner] Destroyed');
  }

  /**
   * Open the wheel modal
   */
  async open() {
    if (this.isOpen) return;

    // Check if available
    const available = await this._checkAvailability();
    if (!available) {
      console.warn('Daily wheel not available yet');
      return;
    }

    this.isOpen = true;
    this.modalElement.classList.add('visible');

    // Render wheel
    this._renderWheel();

    // Start animation loop
    this._startAnimation();
  }

  /**
   * Close the wheel modal
   */
  close() {
    if (!this.isOpen) return;

    this.modalElement.classList.remove('visible');
    this.isOpen = false;

    // Stop animation
    this._stopAnimation();

    // Reset state
    setTimeout(() => {
      this.rotation = 0;
      this.spinVelocity = 0;
      this.isSpinning = false;
      this.selectedSegment = null;
    }, 300);
  }

  /**
   * Spin the wheel
   */
  async spin() {
    if (!this.canSpin || this.isSpinning) return;

    this.isSpinning = true;
    this.canSpin = false;

    // Hide spin button
    const spinBtn = this.modalElement.querySelector('[data-spin-btn]');
    if (spinBtn) spinBtn.classList.add('hidden');

    // Get reward from engine
    const result = await this.engine.spinDailyWheel();

    if (!result.success) {
      console.error('Failed to spin wheel:', result.error);
      this.isSpinning = false;
      this.canSpin = true;
      if (spinBtn) spinBtn.classList.remove('hidden');
      return;
    }

    // Determine winning segment
    const winningSegment = this.segments.find(s => s.id === result.segmentId);
    if (!winningSegment) {
      console.error('Winning segment not found');
      return;
    }

    // Calculate target rotation
    const segmentIndex = this.segments.indexOf(winningSegment);
    const segmentAngle = (Math.PI * 2) / this.segments.length;
    const targetAngle = (segmentIndex * segmentAngle) + (segmentAngle / 2);

    // Add multiple full rotations for dramatic effect
    const fullRotations = 5 + Math.random() * 3; // 5-8 rotations
    const finalRotation = (Math.PI * 2 * fullRotations) + targetAngle;

    // Set initial velocity based on distance
    this.spinVelocity = 0.4 + Math.random() * 0.2; // Random initial speed

    // Spin to target
    await this._spinToTarget(finalRotation);

    // Show result
    this.selectedSegment = winningSegment;
    await this._showResult(result);
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
    modal.className = 'daily-wheel-modal';
    modal.setAttribute('data-wheel-modal', '');

    modal.innerHTML = `
      <div class="wheel-modal-overlay" data-overlay></div>
      <div class="wheel-modal-content" data-content>
        <button class="wheel-close-btn" data-close-btn>×</button>

        <div class="wheel-header">
          <h2 class="wheel-title">🎡 Daily Bonus Wheel</h2>
          <p class="wheel-subtitle">Spin once per day for rewards!</p>
        </div>

        <div class="wheel-container" data-wheel-container>
          <!-- Pointer/arrow -->
          <div class="wheel-pointer">▼</div>

          <!-- Canvas -->
          <canvas data-wheel-canvas width="500" height="500"></canvas>

          <!-- Center button (decorative) -->
          <div class="wheel-center">
            <div class="wheel-center-text">SPIN</div>
          </div>
        </div>

        <!-- Spin button -->
        <button class="wheel-spin-btn" data-spin-btn>
          Spin the Wheel!
        </button>

        <!-- Cooldown message -->
        <div class="wheel-cooldown" data-cooldown style="display: none;">
          <p>Come back tomorrow for another spin!</p>
          <p class="wheel-cooldown-time" data-cooldown-time></p>
        </div>

        <!-- Result display -->
        <div class="wheel-result" data-result style="display: none;">
          <div class="wheel-result-icon" data-result-icon>🎁</div>
          <div class="wheel-result-label" data-result-label>You won:</div>
          <div class="wheel-result-amount" data-result-amount>100 Coins</div>
          <button class="wheel-claim-btn" data-claim-btn>Claim Reward</button>
        </div>
      </div>
    `;

    this.container.appendChild(modal);
    this.modalElement = modal;

    // Get canvas
    this.canvas = modal.querySelector('[data-wheel-canvas]');
    this.ctx = this.canvas.getContext('2d');

    // Event listeners
    const overlay = modal.querySelector('[data-overlay]');
    const closeBtn = modal.querySelector('[data-close-btn]');
    const spinBtn = modal.querySelector('[data-spin-btn]');
    const claimBtn = modal.querySelector('[data-claim-btn]');

    overlay.addEventListener('click', () => this.close());
    closeBtn.addEventListener('click', () => this.close());
    spinBtn.addEventListener('click', () => this.spin());
    claimBtn.addEventListener('click', () => {
      this.close();
      // Rewards already claimed via engine.spinDailyWheel()
    });

    // Inject styles
    this._injectStyles();
  }

  /**
   * Subscribe to engine events
   * @private
   */
  _subscribeToEvents() {
    // Daily wheel available
    const unsubAvailable = this.engine.on('dailyWheelAvailable', () => {
      this.canSpin = true;
    });

    this.unsubscribers.push(unsubAvailable);
  }

  /**
   * Check if wheel is available
   * @private
   */
  async _checkAvailability() {
    const progress = this.engine.state.get('progress');
    if (!progress) return false;

    const lastSpin = progress.daily?.lastWheelSpin;
    if (!lastSpin) {
      this.canSpin = true;
      return true;
    }

    const now = Date.now();
    const cooldownMs = this.config.cooldownHours * 60 * 60 * 1000;
    const timeSinceLastSpin = now - lastSpin;

    if (timeSinceLastSpin >= cooldownMs) {
      this.canSpin = true;
      return true;
    }

    // Show cooldown
    this._showCooldown(cooldownMs - timeSinceLastSpin);
    return false;
  }

  /**
   * Show cooldown message
   * @private
   */
  _showCooldown(remainingMs) {
    const spinBtn = this.modalElement.querySelector('[data-spin-btn]');
    const cooldown = this.modalElement.querySelector('[data-cooldown]');
    const cooldownTime = this.modalElement.querySelector('[data-cooldown-time]');

    if (spinBtn) spinBtn.style.display = 'none';
    if (cooldown) cooldown.style.display = 'block';

    if (cooldownTime) {
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      cooldownTime.textContent = `${hours}h ${minutes}m remaining`;
    }
  }

  /**
   * Start animation loop
   * @private
   */
  _startAnimation() {
    const animate = () => {
      this._update();
      this._renderWheel();
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  /**
   * Stop animation loop
   * @private
   */
  _stopAnimation() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Update wheel physics
   * @private
   */
  _update() {
    if (!this.isSpinning) return;

    // Apply friction
    this.spinVelocity *= this.friction;

    // Update rotation
    this.rotation += this.spinVelocity;

    // Normalize rotation (0 to 2π)
    this.rotation = this.rotation % (Math.PI * 2);
  }

  /**
   * Spin to target rotation
   * @private
   */
  async _spinToTarget(targetRotation) {
    return new Promise((resolve) => {
      const startRotation = this.rotation;
      const startTime = Date.now();
      const duration = 4000 + Math.random() * 2000; // 4-6 seconds

      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);

        this.rotation = startRotation + (targetRotation * eased);
        this.rotation = this.rotation % (Math.PI * 2);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.isSpinning = false;
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Render wheel on canvas
   * @private
   */
  _renderWheel() {
    if (!this.ctx || !this.canvas) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    // Save context
    this.ctx.save();

    // Move to center
    this.ctx.translate(centerX, centerY);

    // Rotate
    this.ctx.rotate(this.rotation);

    // Draw segments
    const segmentAngle = (Math.PI * 2) / this.segments.length;

    for (let i = 0; i < this.segments.length; i++) {
      const segment = this.segments[i];
      const startAngle = i * segmentAngle;
      const endAngle = (i + 1) * segmentAngle;

      // Draw segment
      this.ctx.beginPath();
      this.ctx.arc(0, 0, radius, startAngle, endAngle);
      this.ctx.lineTo(0, 0);
      this.ctx.closePath();

      // Fill with segment color
      this.ctx.fillStyle = segment.color || this._getSegmentColor(i);
      this.ctx.fill();

      // Stroke
      this.ctx.strokeStyle = '#1F2937';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();

      // Draw text
      this.ctx.save();
      this.ctx.rotate(startAngle + segmentAngle / 2);
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 14px sans-serif';
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      this.ctx.shadowBlur = 4;
      this.ctx.fillText(segment.label || '', radius - 10, 0);
      this.ctx.restore();
    }

    // Draw outer ring
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
    this.ctx.strokeStyle = '#F59E0B';
    this.ctx.lineWidth = 8;
    this.ctx.stroke();

    // Restore context
    this.ctx.restore();
  }

  /**
   * Show result
   * @private
   */
  async _showResult(result) {
    const resultDiv = this.modalElement.querySelector('[data-result]');
    const resultIcon = this.modalElement.querySelector('[data-result-icon]');
    const resultAmount = this.modalElement.querySelector('[data-result-amount]');

    if (!resultDiv) return;

    // Determine display
    let icon = '🎁';
    let amountText = '';

    switch (result.reward.type) {
      case 'coins':
        icon = '💰';
        amountText = `${result.reward.amount} Coins`;
        break;
      case 'xp':
        icon = '⭐';
        amountText = `${result.reward.amount} XP`;
        break;
      case 'multiplier':
        icon = '⚡';
        amountText = `${result.reward.multiplier}x Multiplier`;
        break;
      case 'jackpot':
        icon = '🎰';
        amountText = 'JACKPOT!';
        break;
      case 'mystery':
        icon = '🎁';
        amountText = 'Mystery Prize!';
        break;
      default:
        amountText = 'Special Reward';
    }

    if (resultIcon) resultIcon.textContent = icon;
    if (resultAmount) resultAmount.textContent = amountText;

    // Show result
    resultDiv.style.display = 'block';

    // Confetti
    if (window.ConfettiSystem) {
      const confetti = new window.ConfettiSystem();
      confetti.burst({ particleCount: 100 });
    }
  }

  /**
   * Get segment color (alternating pattern if not specified)
   * @private
   */
  _getSegmentColor(index) {
    const colors = [
      '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
      '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B',
      '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'
    ];
    return colors[index % colors.length];
  }

  /**
   * Inject CSS styles
   * @private
   */
  _injectStyles() {
    const styleId = 'daily-wheel-spinner-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .daily-wheel-modal {
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

      .daily-wheel-modal.visible {
        opacity: 1;
        pointer-events: auto;
      }

      .wheel-modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(10px);
      }

      .wheel-modal-content {
        position: relative;
        width: 90%;
        max-width: 600px;
        background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
        border-radius: 1.5rem;
        padding: 2rem;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        text-align: center;
      }

      .wheel-close-btn {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        font-size: 1.5rem;
        color: white;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .wheel-close-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: scale(1.1);
      }

      .wheel-header {
        margin-bottom: 2rem;
      }

      .wheel-title {
        font-size: 2rem;
        font-weight: 800;
        color: white;
        margin: 0 0 0.5rem 0;
      }

      .wheel-subtitle {
        font-size: 1rem;
        color: #9CA3AF;
        margin: 0;
      }

      .wheel-container {
        position: relative;
        width: 100%;
        max-width: 500px;
        margin: 0 auto 2rem auto;
      }

      .wheel-pointer {
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 3rem;
        color: #F59E0B;
        z-index: 10;
        filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.5));
      }

      canvas[data-wheel-canvas] {
        display: block;
        width: 100%;
        height: auto;
        max-width: 500px;
        margin: 0 auto;
      }

      .wheel-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #F59E0B, #EF4444);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 20px rgba(245, 158, 11, 0.6);
        border: 4px solid white;
      }

      .wheel-center-text {
        font-size: 0.875rem;
        font-weight: 800;
        color: white;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .wheel-spin-btn {
        padding: 1rem 3rem;
        background: linear-gradient(135deg, #10B981 0%, #059669 100%);
        color: white;
        border: none;
        border-radius: 0.75rem;
        font-size: 1.25rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
      }

      .wheel-spin-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 40px rgba(16, 185, 129, 0.6);
      }

      .wheel-spin-btn:active {
        transform: translateY(0);
      }

      .wheel-spin-btn.hidden {
        display: none;
      }

      .wheel-cooldown {
        color: #9CA3AF;
      }

      .wheel-cooldown p {
        margin: 0.5rem 0;
      }

      .wheel-cooldown-time {
        font-size: 1.125rem;
        font-weight: 600;
        color: #F59E0B;
      }

      .wheel-result {
        animation: wheel-result-appear 0.5s ease;
      }

      .wheel-result-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }

      .wheel-result-label {
        font-size: 1.125rem;
        color: #9CA3AF;
        margin-bottom: 0.5rem;
      }

      .wheel-result-amount {
        font-size: 2.5rem;
        font-weight: 800;
        color: #F59E0B;
        margin-bottom: 1.5rem;
        text-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
      }

      .wheel-claim-btn {
        padding: 1rem 2rem;
        background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
        color: white;
        border: none;
        border-radius: 0.75rem;
        font-size: 1.125rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .wheel-claim-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
      }

      @keyframes wheel-result-appear {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* Responsive */
      @media (max-width: 768px) {
        .wheel-modal-content {
          padding: 1.5rem;
        }

        .wheel-title {
          font-size: 1.5rem;
        }

        .wheel-subtitle {
          font-size: 0.875rem;
        }

        .wheel-pointer {
          font-size: 2rem;
        }

        .wheel-center {
          width: 60px;
          height: 60px;
        }

        .wheel-center-text {
          font-size: 0.75rem;
        }

        .wheel-spin-btn {
          padding: 0.875rem 2rem;
          font-size: 1.125rem;
        }

        .wheel-result-icon {
          font-size: 3rem;
        }

        .wheel-result-amount {
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
      cooldownHours: 24,
      segments: [
        { id: 1, label: '50 Coins', color: '#10B981' },
        { id: 2, label: '100 Coins', color: '#3B82F6' },
        { id: 3, label: '100 XP', color: '#8B5CF6' },
        { id: 4, label: '200 Coins', color: '#10B981' },
        { id: 5, label: '200 XP', color: '#8B5CF6' },
        { id: 6, label: '1.5x (1hr)', color: '#F59E0B' },
        { id: 7, label: '500 Coins', color: '#10B981' },
        { id: 8, label: '500 XP', color: '#8B5CF6' },
        { id: 9, label: '2x (30min)', color: '#F59E0B' },
        { id: 10, label: 'JACKPOT', color: '#EF4444' },
        { id: 11, label: '1000 Coins', color: '#10B981' },
        { id: 12, label: 'MYSTERY', color: '#9333EA' }
      ]
    };
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.DailyWheelSpinner = DailyWheelSpinner;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DailyWheelSpinner;
}
