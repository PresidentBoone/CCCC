/**
 * Casino Module - Jackpot Round Overlay Component
 *
 * Full-screen overlay for timed bonus quiz rounds.
 * Features countdown timer, score tracking, and special jackpot styling.
 *
 * @module casino/components/JackpotRoundOverlay
 * @author CollegeClimb Casino Team
 * @version 1.0.0
 */

class JackpotRoundOverlay {
  /**
   * Create a new JackpotRoundOverlay component
   *
   * @param {Object} options - Configuration options
   * @param {CasinoEngine} options.engine - Casino engine instance
   * @param {HTMLElement} options.container - Container element (optional, uses body)
   * @param {Function} options.onQuestionRequest - Callback to request next question
   * @param {Object} options.config - Configuration (optional)
   *
   * @example
   * const jackpot = new JackpotRoundOverlay({
   *   engine: casinoEngine,
   *   onQuestionRequest: () => loadNextQuestion()
   * });
   * jackpot.initialize();
   */
  constructor(options = {}) {
    this.engine = options.engine;
    this.container = options.container || document.body;
    this.onQuestionRequest = options.onQuestionRequest || (() => {});
    this.config = options.config || this._getDefaultConfig();

    // Use formatters if available
    const formatters = window.CasinoFormatters || {};
    this._formatNumber = formatters.formatNumber || ((n) => n.toString());
    this._formatTime = formatters.formatTime || ((s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`);

    // State
    this.overlayElement = null;
    this.isActive = false;
    this.isPaused = false;

    // Round data
    this.roundData = null;
    this.startTime = null;
    this.duration = 0;
    this.remainingTime = 0;
    this.questionsAnswered = 0;
    this.correctAnswers = 0;
    this.totalQuestions = 0;
    this.currentScore = 0;

    // Timer
    this.timerInterval = null;

    this.unsubscribers = [];
  }

  /**
   * Initialize component
   */
  async initialize() {
    if (!this.engine) {
      console.error('JackpotRoundOverlay: Missing engine');
      return;
    }

    // Create overlay element
    this._createElement();

    // Subscribe to events
    this._subscribeToEvents();

    console.log('[JackpotRoundOverlay] Initialized');
  }

  /**
   * Destroy component
   */
  destroy() {
    this._stopTimer();

    for (const unsubscribe of this.unsubscribers) {
      unsubscribe();
    }
    this.unsubscribers = [];

    if (this.overlayElement && this.overlayElement.parentNode) {
      this.overlayElement.parentNode.removeChild(this.overlayElement);
    }

    console.log('[JackpotRoundOverlay] Destroyed');
  }

  /**
   * Start jackpot round
   *
   * @param {Object} roundData - Round configuration
   * @param {number} roundData.duration - Duration in seconds
   * @param {number} roundData.questionCount - Number of questions
   * @param {Object} roundData.rewards - Reward structure
   */
  async start(roundData) {
    if (this.isActive) {
      console.warn('Jackpot round already active');
      return;
    }

    this.isActive = true;
    this.roundData = roundData;
    this.duration = roundData.duration || 180;
    this.totalQuestions = roundData.questionCount || 10;
    this.startTime = Date.now();
    this.remainingTime = this.duration;
    this.questionsAnswered = 0;
    this.correctAnswers = 0;
    this.currentScore = 0;

    // Show overlay
    this.overlayElement.classList.add('visible');

    // Update UI
    this._updateDisplay();

    // Start countdown timer
    this._startTimer();

    // Show intro animation
    await this._playIntroAnimation();

    // Request first question
    if (this.onQuestionRequest) {
      this.onQuestionRequest();
    }
  }

  /**
   * End jackpot round
   *
   * @param {boolean} completed - Whether round was completed vs timed out
   */
  async end(completed = false) {
    if (!this.isActive) return;

    this._stopTimer();

    // Show results
    await this._showResults(completed);

    // Log event
    await this.engine.firebaseSync.logEvent('jackpot_round_complete', {
      duration: this.duration,
      questionsAnswered: this.questionsAnswered,
      correctAnswers: this.correctAnswers,
      score: this.currentScore,
      completed
    });

    // Hide overlay after delay
    setTimeout(() => {
      this.overlayElement.classList.remove('visible');
      this.isActive = false;
      this._reset();
    }, 5000);
  }

  /**
   * Record answer
   *
   * @param {boolean} correct - Whether answer was correct
   * @param {number} points - Points earned (optional)
   */
  recordAnswer(correct, points = 0) {
    if (!this.isActive) return;

    this.questionsAnswered++;

    if (correct) {
      this.correctAnswers++;
      this.currentScore += points || this.roundData.rewards?.perCorrect?.coins || 100;

      // Show success feedback
      this._showFeedback('correct');
    } else {
      // Show incorrect feedback
      this._showFeedback('incorrect');
    }

    // Update display
    this._updateDisplay();

    // Check if round complete
    if (this.questionsAnswered >= this.totalQuestions) {
      this.end(true);
    } else {
      // Request next question after delay
      setTimeout(() => {
        if (this.onQuestionRequest) {
          this.onQuestionRequest();
        }
      }, 1500);
    }
  }

  /**
   * Pause round (for interruptions)
   */
  pause() {
    if (!this.isActive || this.isPaused) return;

    this.isPaused = true;
    this._stopTimer();

    const pauseOverlay = this.overlayElement.querySelector('[data-pause-overlay]');
    if (pauseOverlay) {
      pauseOverlay.style.display = 'flex';
    }
  }

  /**
   * Resume round
   */
  resume() {
    if (!this.isActive || !this.isPaused) return;

    this.isPaused = false;
    this._startTimer();

    const pauseOverlay = this.overlayElement.querySelector('[data-pause-overlay]');
    if (pauseOverlay) {
      pauseOverlay.style.display = 'none';
    }
  }

  // ============================================
  // INTERNAL METHODS
  // ============================================

  /**
   * Create overlay element
   * @private
   */
  _createElement() {
    const element = document.createElement('div');
    element.className = 'jackpot-round-overlay';
    element.setAttribute('data-jackpot-overlay', '');

    element.innerHTML = `
      <div class="jackpot-background">
        <div class="jackpot-glow"></div>
        <div class="jackpot-particles"></div>
      </div>

      <div class="jackpot-header">
        <div class="jackpot-badge">
          <span class="jackpot-icon">🎰</span>
          <span class="jackpot-label">JACKPOT ROUND</span>
        </div>

        <div class="jackpot-stats">
          <div class="jackpot-timer" data-timer>
            <span class="timer-icon">⏱️</span>
            <span class="timer-value" data-timer-value>3:00</span>
          </div>

          <div class="jackpot-progress" data-progress>
            <span class="progress-icon">📝</span>
            <span class="progress-value" data-progress-value>0 / 10</span>
          </div>

          <div class="jackpot-score" data-score>
            <span class="score-icon">💰</span>
            <span class="score-value" data-score-value>0</span>
          </div>
        </div>
      </div>

      <div class="jackpot-content" data-content>
        <!-- Quiz questions will be injected here by parent -->
        <div class="jackpot-intro" data-intro>
          <h1 class="intro-title">🎰 JACKPOT ROUND! 🎰</h1>
          <p class="intro-message">Answer as many questions as you can!</p>
          <p class="intro-details">
            <strong data-question-count>10</strong> questions in <strong data-duration>3:00</strong>
          </p>
          <div class="intro-rewards">
            <p>Rewards:</p>
            <p>✅ Per Correct: <strong data-reward-correct>100 coins</strong></p>
            <p>🏆 Completion: <strong data-reward-completion>500 coins</strong></p>
            <p>💯 Perfect Round: <strong data-reward-perfect>1500 coins</strong></p>
          </div>
        </div>
      </div>

      <!-- Feedback overlay -->
      <div class="jackpot-feedback" data-feedback style="display: none;">
        <div class="feedback-icon" data-feedback-icon">✅</div>
        <div class="feedback-text" data-feedback-text">Correct!</div>
      </div>

      <!-- Results overlay -->
      <div class="jackpot-results" data-results style="display: none;">
        <h2 class="results-title">Round Complete!</h2>
        <div class="results-stats">
          <div class="results-stat">
            <div class="stat-value" data-results-correct>0</div>
            <div class="stat-label">Correct</div>
          </div>
          <div class="results-stat">
            <div class="stat-value" data-results-total>0</div>
            <div class="stat-label">Total Questions</div>
          </div>
          <div class="results-stat">
            <div class="stat-value" data-results-score>0</div>
            <div class="stat-label">Total Coins</div>
          </div>
        </div>
        <div class="results-message" data-results-message">Great job!</div>
      </div>

      <!-- Pause overlay -->
      <div class="jackpot-pause" data-pause-overlay style="display: none;">
        <h2>⏸️ Paused</h2>
        <button class="pause-resume-btn" data-resume-btn>Resume</button>
      </div>

      <!-- Exit button -->
      <button class="jackpot-exit" data-exit-btn title="Exit (forfeit round)">
        ❌
      </button>
    `;

    this.container.appendChild(element);
    this.overlayElement = element;

    // Event listeners
    const exitBtn = element.querySelector('[data-exit-btn]');
    const resumeBtn = element.querySelector('[data-resume-btn]');

    exitBtn.addEventListener('click', () => this._confirmExit());
    resumeBtn.addEventListener('click', () => this.resume());

    // Inject styles
    this._injectStyles();
  }

  /**
   * Subscribe to engine events
   * @private
   */
  _subscribeToEvents() {
    const unsubJackpot = this.engine.on('jackpotTriggered', async (data) => {
      await this.start(data);
    });

    this.unsubscribers.push(unsubJackpot);
  }

  /**
   * Start countdown timer
   * @private
   */
  _startTimer() {
    this._stopTimer(); // Clear any existing timer

    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      this.remainingTime = Math.max(0, this.duration - elapsed);

      this._updateTimer();

      // Time's up
      if (this.remainingTime <= 0) {
        this.end(false);
      }
    }, 100);
  }

  /**
   * Stop countdown timer
   * @private
   */
  _stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Update timer display
   * @private
   */
  _updateTimer() {
    const timerValue = this.overlayElement.querySelector('[data-timer-value]');
    if (!timerValue) return;

    timerValue.textContent = this._formatTime(this.remainingTime);

    // Change color based on time remaining
    const timerElement = this.overlayElement.querySelector('[data-timer]');
    if (timerElement) {
      if (this.remainingTime <= 10) {
        timerElement.classList.add('critical');
      } else if (this.remainingTime <= 30) {
        timerElement.classList.add('warning');
      } else {
        timerElement.classList.remove('critical', 'warning');
      }
    }
  }

  /**
   * Update display
   * @private
   */
  _updateDisplay() {
    // Update progress
    const progressValue = this.overlayElement.querySelector('[data-progress-value]');
    if (progressValue) {
      progressValue.textContent = `${this.questionsAnswered} / ${this.totalQuestions}`;
    }

    // Update score
    const scoreValue = this.overlayElement.querySelector('[data-score-value]');
    if (scoreValue) {
      scoreValue.textContent = this._formatNumber(this.currentScore);
    }
  }

  /**
   * Play intro animation
   * @private
   */
  async _playIntroAnimation() {
    const intro = this.overlayElement.querySelector('[data-intro]');
    if (!intro) return;

    // Update intro content
    const questionCount = this.overlayElement.querySelector('[data-question-count]');
    const duration = this.overlayElement.querySelector('[data-duration]');
    const rewardCorrect = this.overlayElement.querySelector('[data-reward-correct]');
    const rewardCompletion = this.overlayElement.querySelector('[data-reward-completion]');
    const rewardPerfect = this.overlayElement.querySelector('[data-reward-perfect]');

    if (questionCount) questionCount.textContent = this.totalQuestions;
    if (duration) duration.textContent = this._formatTime(this.duration);

    if (this.roundData.rewards) {
      if (rewardCorrect) rewardCorrect.textContent = `${this.roundData.rewards.perCorrect?.coins || 100} coins`;
      if (rewardCompletion) rewardCompletion.textContent = `${this.roundData.rewards.completion?.coins || 500} coins`;
      if (rewardPerfect) rewardPerfect.textContent = `${this.roundData.rewards.perfect?.coins || 1500} coins`;
    }

    // Show intro
    intro.style.display = 'block';

    // Wait for user to read
    await this._sleep(3000);

    // Hide intro
    intro.style.display = 'none';
  }

  /**
   * Show answer feedback
   * @private
   */
  _showFeedback(type) {
    const feedback = this.overlayElement.querySelector('[data-feedback]');
    const feedbackIcon = this.overlayElement.querySelector('[data-feedback-icon]');
    const feedbackText = this.overlayElement.querySelector('[data-feedback-text]');

    if (!feedback) return;

    if (type === 'correct') {
      if (feedbackIcon) feedbackIcon.textContent = '✅';
      if (feedbackText) feedbackText.textContent = 'Correct!';
      feedback.className = 'jackpot-feedback correct';
    } else {
      if (feedbackIcon) feedbackIcon.textContent = '❌';
      if (feedbackText) feedbackText.textContent = 'Incorrect';
      feedback.className = 'jackpot-feedback incorrect';
    }

    feedback.style.display = 'flex';

    setTimeout(() => {
      feedback.style.display = 'none';
    }, 1000);
  }

  /**
   * Show results
   * @private
   */
  async _showResults(completed) {
    const results = this.overlayElement.querySelector('[data-results]');
    const resultsCorrect = this.overlayElement.querySelector('[data-results-correct]');
    const resultsTotal = this.overlayElement.querySelector('[data-results-total]');
    const resultsScore = this.overlayElement.querySelector('[data-results-score]');
    const resultsMessage = this.overlayElement.querySelector('[data-results-message]');

    if (!results) return;

    // Update results
    if (resultsCorrect) resultsCorrect.textContent = this.correctAnswers;
    if (resultsTotal) resultsTotal.textContent = this.questionsAnswered;
    if (resultsScore) resultsScore.textContent = this._formatNumber(this.currentScore);

    // Determine message
    let message = 'Great effort!';
    if (this.correctAnswers === this.totalQuestions) {
      message = '🎉 PERFECT ROUND! 🎉';
    } else if (this.correctAnswers >= this.totalQuestions * 0.8) {
      message = 'Excellent work!';
    } else if (this.correctAnswers >= this.totalQuestions * 0.5) {
      message = 'Good job!';
    } else if (!completed) {
      message = "Time's up!";
    }

    if (resultsMessage) resultsMessage.textContent = message;

    // Show results
    results.style.display = 'block';

    // Confetti for good performance
    if (this.correctAnswers >= this.totalQuestions * 0.7 && window.ConfettiSystem) {
      const confetti = new window.ConfettiSystem();
      confetti.burst({ particleCount: 150 });
    }
  }

  /**
   * Confirm exit
   * @private
   */
  _confirmExit() {
    const confirmed = confirm('Are you sure you want to exit? You will forfeit this jackpot round.');
    if (confirmed) {
      this.end(false);
    }
  }

  /**
   * Reset state
   * @private
   */
  _reset() {
    this.roundData = null;
    this.startTime = null;
    this.duration = 0;
    this.remainingTime = 0;
    this.questionsAnswered = 0;
    this.correctAnswers = 0;
    this.totalQuestions = 0;
    this.currentScore = 0;
    this.isPaused = false;

    const results = this.overlayElement.querySelector('[data-results]');
    if (results) results.style.display = 'none';
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
    const styleId = 'jackpot-round-overlay-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .jackpot-round-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9999;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }

      .jackpot-round-overlay.visible {
        opacity: 1;
        pointer-events: auto;
      }

      .jackpot-background {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #1F2937 0%, #0F172A 100%);
        overflow: hidden;
      }

      .jackpot-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 800px;
        height: 800px;
        background: radial-gradient(circle, rgba(245,158,11,0.2), transparent);
        animation: jackpot-glow-pulse 3s ease infinite;
      }

      .jackpot-header {
        position: relative;
        padding: 1.5rem;
        background: rgba(0, 0, 0, 0.3);
        border-bottom: 2px solid #F59E0B;
      }

      .jackpot-badge {
        text-align: center;
        margin-bottom: 1rem;
      }

      .jackpot-icon {
        font-size: 2rem;
        margin-right: 0.5rem;
      }

      .jackpot-label {
        font-size: 1.5rem;
        font-weight: 800;
        color: #F59E0B;
        text-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
        letter-spacing: 0.1em;
      }

      .jackpot-stats {
        display: flex;
        justify-content: center;
        gap: 2rem;
        flex-wrap: wrap;
      }

      .jackpot-timer,
      .jackpot-progress,
      .jackpot-score {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 0.5rem;
        font-size: 1.125rem;
        font-weight: 600;
        color: white;
      }

      .jackpot-timer.warning {
        background: rgba(245, 158, 11, 0.2);
        color: #F59E0B;
      }

      .jackpot-timer.critical {
        background: rgba(239, 68, 68, 0.2);
        color: #EF4444;
        animation: jackpot-timer-pulse 1s ease infinite;
      }

      .jackpot-content {
        position: relative;
        padding: 2rem;
        min-height: calc(100vh - 200px);
      }

      .jackpot-intro {
        text-align: center;
        color: white;
        max-width: 600px;
        margin: 2rem auto;
      }

      .intro-title {
        font-size: 3rem;
        font-weight: 900;
        margin: 0 0 1rem 0;
        color: #F59E0B;
        text-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
      }

      .intro-message {
        font-size: 1.5rem;
        margin: 1rem 0;
      }

      .intro-details {
        font-size: 1.25rem;
        margin: 1.5rem 0;
      }

      .intro-rewards {
        margin-top: 2rem;
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 0.75rem;
      }

      .intro-rewards p {
        margin: 0.5rem 0;
      }

      /* Feedback */
      .jackpot-feedback {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 2rem 3rem;
        background: rgba(0, 0, 0, 0.9);
        border-radius: 1rem;
        z-index: 10;
        animation: jackpot-feedback-appear 0.3s ease;
      }

      .jackpot-feedback.correct {
        border: 3px solid #10B981;
      }

      .jackpot-feedback.incorrect {
        border: 3px solid #EF4444;
      }

      .feedback-icon {
        font-size: 4rem;
      }

      .feedback-text {
        font-size: 2rem;
        font-weight: 700;
        color: white;
      }

      /* Results */
      .jackpot-results {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        padding: 3rem;
        background: rgba(0, 0, 0, 0.95);
        border-radius: 1.5rem;
        border: 3px solid #F59E0B;
        min-width: 400px;
        animation: jackpot-results-appear 0.5s ease;
      }

      .results-title {
        font-size: 2.5rem;
        font-weight: 800;
        color: #F59E0B;
        margin: 0 0 2rem 0;
      }

      .results-stats {
        display: flex;
        justify-content: space-around;
        gap: 2rem;
        margin: 2rem 0;
      }

      .results-stat {
        flex: 1;
      }

      .stat-value {
        font-size: 3rem;
        font-weight: 800;
        color: white;
        margin-bottom: 0.5rem;
      }

      .stat-label {
        font-size: 0.875rem;
        color: #9CA3AF;
        text-transform: uppercase;
      }

      .results-message {
        font-size: 1.5rem;
        font-weight: 600;
        color: white;
        margin-top: 2rem;
      }

      /* Pause */
      .jackpot-pause {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        padding: 3rem;
        background: rgba(0, 0, 0, 0.95);
        border-radius: 1.5rem;
        color: white;
      }

      .pause-resume-btn {
        margin-top: 2rem;
        padding: 1rem 2rem;
        background: #10B981;
        color: white;
        border: none;
        border-radius: 0.5rem;
        font-size: 1.25rem;
        font-weight: 600;
        cursor: pointer;
      }

      /* Exit button */
      .jackpot-exit {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: rgba(239, 68, 68, 0.2);
        border: 2px solid #EF4444;
        border-radius: 0.5rem;
        padding: 0.5rem 1rem;
        font-size: 1.125rem;
        color: white;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .jackpot-exit:hover {
        background: rgba(239, 68, 68, 0.4);
      }

      /* Animations */
      @keyframes jackpot-glow-pulse {
        0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
        50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.1); }
      }

      @keyframes jackpot-timer-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }

      @keyframes jackpot-feedback-appear {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }

      @keyframes jackpot-results-appear {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }

      /* Responsive */
      @media (max-width: 768px) {
        .jackpot-stats {
          gap: 1rem;
        }

        .jackpot-timer,
        .jackpot-progress,
        .jackpot-score {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .intro-title {
          font-size: 2rem;
        }

        .jackpot-results {
          min-width: 90%;
          padding: 2rem;
        }

        .results-stats {
          flex-direction: column;
          gap: 1rem;
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
      duration: 180,
      questionCount: 10
    };
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.JackpotRoundOverlay = JackpotRoundOverlay;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JackpotRoundOverlay;
}
