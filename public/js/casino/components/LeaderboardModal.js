/**
 * Casino Module - Leaderboard Modal Component
 *
 * Displays weekly and all-time leaderboards with rankings.
 * Features user highlighting, prize indicators, and responsive table.
 *
 * @module casino/components/LeaderboardModal
 * @author CollegeClimb Casino Team
 * @version 1.0.0
 */

class LeaderboardModal {
  /**
   * Create a new LeaderboardModal component
   *
   * @param {Object} options - Configuration options
   * @param {CasinoEngine} options.engine - Casino engine instance
   * @param {HTMLElement} options.container - Container element (optional, uses body)
   * @param {Object} options.config - Configuration (optional)
   *
   * @example
   * const leaderboard = new LeaderboardModal({
   *   engine: casinoEngine
   * });
   * leaderboard.initialize();
   */
  constructor(options = {}) {
    this.engine = options.engine;
    this.container = options.container || document.body;
    this.config = options.config || this._getDefaultConfig();

    // Use formatters if available
    const formatters = window.CasinoFormatters || {};
    this._formatNumber = formatters.formatNumber || ((n) => n.toString());
    this._formatLevel = formatters.formatLevel || ((l) => `Lv ${l}`);
    this._getTierEmoji = formatters.getTierEmoji || ((t) => '🥉');

    // State
    this.modalElement = null;
    this.isOpen = false;
    this.currentTab = 'weekly'; // 'weekly' | 'allTime'
    this.weeklyData = [];
    this.allTimeData = [];
    this.currentUserRank = null;
    this.isLoading = false;

    this.unsubscribers = [];
  }

  /**
   * Initialize component
   */
  async initialize() {
    if (!this.engine) {
      console.error('LeaderboardModal: Missing engine');
      return;
    }

    // Create modal
    this._createModal();

    console.log('[LeaderboardModal] Initialized');
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

    console.log('[LeaderboardModal] Destroyed');
  }

  /**
   * Open leaderboard modal
   *
   * @param {string} tab - Initial tab ('weekly' | 'allTime')
   */
  async open(tab = 'weekly') {
    if (this.isOpen) return;

    this.isOpen = true;
    this.currentTab = tab;

    // Show modal
    this.modalElement.classList.add('visible');

    // Switch to tab
    this._switchTab(tab);

    // Load data
    await this._loadLeaderboardData();
  }

  /**
   * Close leaderboard modal
   */
  close() {
    if (!this.isOpen) return;

    this.modalElement.classList.remove('visible');
    this.isOpen = false;
  }

  /**
   * Refresh leaderboard data
   */
  async refresh() {
    await this._loadLeaderboardData();
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
    modal.className = 'leaderboard-modal';
    modal.setAttribute('data-leaderboard-modal', '');

    modal.innerHTML = `
      <div class="leaderboard-overlay" data-overlay></div>
      <div class="leaderboard-content" data-content>
        <button class="leaderboard-close" data-close-btn>×</button>

        <div class="leaderboard-header">
          <h2 class="leaderboard-title">🏆 Leaderboard</h2>
          <p class="leaderboard-subtitle">See how you rank against other students</p>
        </div>

        <!-- Tabs -->
        <div class="leaderboard-tabs">
          <button class="leaderboard-tab active" data-tab="weekly">
            📅 Weekly
          </button>
          <button class="leaderboard-tab" data-tab="allTime">
            🌟 All-Time
          </button>
        </div>

        <!-- Current user rank -->
        <div class="leaderboard-user-rank" data-user-rank style="display: none;">
          <div class="user-rank-label">Your Rank:</div>
          <div class="user-rank-value" data-user-rank-value>#-</div>
        </div>

        <!-- Loading -->
        <div class="leaderboard-loading" data-loading style="display: none;">
          <div class="loading-spinner"></div>
          <p>Loading rankings...</p>
        </div>

        <!-- Error -->
        <div class="leaderboard-error" data-error style="display: none;">
          <p>Failed to load leaderboard</p>
          <button class="retry-btn" data-retry-btn>Retry</button>
        </div>

        <!-- Leaderboard table -->
        <div class="leaderboard-table-container" data-table-container>
          <table class="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student</th>
                <th>Level</th>
                <th>XP</th>
                <th>Prize</th>
              </tr>
            </thead>
            <tbody data-table-body>
              <!-- Rows will be inserted here -->
            </tbody>
          </table>
        </div>

        <!-- Empty state -->
        <div class="leaderboard-empty" data-empty style="display: none;">
          <p>No rankings yet. Be the first!</p>
        </div>

        <!-- Footer -->
        <div class="leaderboard-footer">
          <button class="leaderboard-refresh" data-refresh-btn>
            🔄 Refresh
          </button>
        </div>
      </div>
    `;

    this.container.appendChild(modal);
    this.modalElement = modal;

    // Event listeners
    const overlay = modal.querySelector('[data-overlay]');
    const closeBtn = modal.querySelector('[data-close-btn]');
    const refreshBtn = modal.querySelector('[data-refresh-btn]');
    const retryBtn = modal.querySelector('[data-retry-btn]');
    const tabs = modal.querySelectorAll('[data-tab]');

    overlay.addEventListener('click', () => this.close());
    closeBtn.addEventListener('click', () => this.close());
    refreshBtn.addEventListener('click', () => this.refresh());
    retryBtn.addEventListener('click', () => this.refresh());

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        this._switchTab(tabName);
      });
    });

    // Inject styles
    this._injectStyles();
  }

  /**
   * Switch tab
   * @private
   */
  _switchTab(tabName) {
    this.currentTab = tabName;

    // Update tab buttons
    const tabs = this.modalElement.querySelectorAll('[data-tab]');
    tabs.forEach(tab => {
      if (tab.getAttribute('data-tab') === tabName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Render data for current tab
    this._renderLeaderboard();
  }

  /**
   * Load leaderboard data from Firebase
   * @private
   */
  async _loadLeaderboardData() {
    this._showLoading(true);
    this._hideError();

    try {
      // Load weekly leaderboard
      if (this.currentTab === 'weekly') {
        const weeklyResult = await this.engine.firebaseSync.getWeeklyLeaderboard(100);
        this.weeklyData = weeklyResult.entries || [];
        this.currentUserRank = weeklyResult.userRank || null;
      }

      // Load all-time leaderboard
      if (this.currentTab === 'allTime') {
        const allTimeResult = await this.engine.firebaseSync.getAllTimeLeaderboard(100);
        this.allTimeData = allTimeResult.entries || [];
        this.currentUserRank = allTimeResult.userRank || null;
      }

      // Render
      this._renderLeaderboard();
      this._showLoading(false);

    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      this._showError(true);
      this._showLoading(false);
    }
  }

  /**
   * Render leaderboard table
   * @private
   */
  _renderLeaderboard() {
    const tableBody = this.modalElement.querySelector('[data-table-body]');
    const tableContainer = this.modalElement.querySelector('[data-table-container]');
    const emptyState = this.modalElement.querySelector('[data-empty]');
    const userRankDiv = this.modalElement.querySelector('[data-user-rank]');
    const userRankValue = this.modalElement.querySelector('[data-user-rank-value]');

    if (!tableBody) return;

    const data = this.currentTab === 'weekly' ? this.weeklyData : this.allTimeData;

    // Show/hide empty state
    if (data.length === 0) {
      tableContainer.style.display = 'none';
      emptyState.style.display = 'block';
      userRankDiv.style.display = 'none';
      return;
    }

    tableContainer.style.display = 'block';
    emptyState.style.display = 'none';

    // Show user rank
    if (this.currentUserRank) {
      userRankDiv.style.display = 'flex';
      if (userRankValue) {
        userRankValue.textContent = `#${this.currentUserRank}`;
      }
    } else {
      userRankDiv.style.display = 'none';
    }

    // Build table rows
    let html = '';
    const currentUserId = this.engine.userId;

    for (let i = 0; i < data.length; i++) {
      const entry = data[i];
      const rank = i + 1;
      const isCurrentUser = entry.userId === currentUserId;
      const prize = this._getPrizeForRank(rank);

      html += `
        <tr class="${isCurrentUser ? 'current-user' : ''}">
          <td class="rank-cell">
            <span class="rank-badge ${this._getRankClass(rank)}">
              ${this._getRankDisplay(rank)}
            </span>
          </td>
          <td class="name-cell">
            ${this._escapeHtml(entry.displayName || 'Anonymous')}
            ${isCurrentUser ? '<span class="you-badge">YOU</span>' : ''}
          </td>
          <td class="level-cell">
            ${this._getTierEmoji(entry.tier || 'bronze')} ${this._formatLevel(entry.level || 1)}
          </td>
          <td class="xp-cell">
            ${this._formatNumber(entry.xp || 0)}
          </td>
          <td class="prize-cell">
            ${prize ? `<span class="prize-badge">${prize}</span>` : '-'}
          </td>
        </tr>
      `;
    }

    tableBody.innerHTML = html;
  }

  /**
   * Get rank display (1st, 2nd, 3rd, or #)
   * @private
   */
  _getRankDisplay(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  }

  /**
   * Get rank CSS class
   * @private
   */
  _getRankClass(rank) {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    if (rank <= 10) return 'rank-top10';
    return '';
  }

  /**
   * Get prize for rank
   * @private
   */
  _getPrizeForRank(rank) {
    const prizes = this.config.prizes || {};

    if (rank === 1) return prizes[1] || '5000 💰';
    if (rank === 2) return prizes[2] || '3000 💰';
    if (rank === 3) return prizes[3] || '2000 💰';
    if (rank <= 10) return prizes['4-10'] || '1000 💰';
    if (rank <= 50) return prizes['11-50'] || '500 💰';

    return null;
  }

  /**
   * Show/hide loading state
   * @private
   */
  _showLoading(show) {
    this.isLoading = show;

    const loading = this.modalElement.querySelector('[data-loading]');
    const tableContainer = this.modalElement.querySelector('[data-table-container]');

    if (loading) loading.style.display = show ? 'block' : 'none';
    if (tableContainer) tableContainer.style.display = show ? 'none' : 'block';
  }

  /**
   * Show/hide error state
   * @private
   */
  _showError(show) {
    const error = this.modalElement.querySelector('[data-error]');
    if (error) error.style.display = show ? 'block' : 'none';
  }

  /**
   * Hide error state
   * @private
   */
  _hideError() {
    this._showError(false);
  }

  /**
   * Escape HTML to prevent XSS
   * @private
   */
  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Inject CSS styles
   * @private
   */
  _injectStyles() {
    const styleId = 'leaderboard-modal-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .leaderboard-modal {
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

      .leaderboard-modal.visible {
        opacity: 1;
        pointer-events: auto;
      }

      .leaderboard-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
      }

      .leaderboard-content {
        position: relative;
        width: 90%;
        max-width: 800px;
        max-height: 90vh;
        background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
        border-radius: 1.5rem;
        padding: 2rem;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        overflow-y: auto;
      }

      .leaderboard-close {
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

      .leaderboard-close:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: scale(1.1);
      }

      .leaderboard-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .leaderboard-title {
        font-size: 2rem;
        font-weight: 800;
        color: white;
        margin: 0 0 0.5rem 0;
      }

      .leaderboard-subtitle {
        font-size: 1rem;
        color: #9CA3AF;
        margin: 0;
      }

      /* Tabs */
      .leaderboard-tabs {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .leaderboard-tab {
        flex: 1;
        padding: 0.75rem 1.5rem;
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid transparent;
        border-radius: 0.5rem;
        color: #9CA3AF;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .leaderboard-tab:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .leaderboard-tab.active {
        background: rgba(245, 158, 11, 0.2);
        border-color: #F59E0B;
        color: #F59E0B;
      }

      /* User rank */
      .leaderboard-user-rank {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 1rem;
        margin-bottom: 1.5rem;
        background: rgba(59, 130, 246, 0.2);
        border-radius: 0.5rem;
        border: 2px solid #3B82F6;
      }

      .user-rank-label {
        font-size: 1rem;
        color: #D1D5DB;
      }

      .user-rank-value {
        font-size: 1.5rem;
        font-weight: 800;
        color: #3B82F6;
      }

      /* Loading */
      .leaderboard-loading {
        text-align: center;
        padding: 3rem;
        color: #9CA3AF;
      }

      .loading-spinner {
        width: 40px;
        height: 40px;
        margin: 0 auto 1rem auto;
        border: 4px solid rgba(255, 255, 255, 0.1);
        border-top-color: #F59E0B;
        border-radius: 50%;
        animation: leaderboard-spin 1s linear infinite;
      }

      /* Error */
      .leaderboard-error {
        text-align: center;
        padding: 3rem;
        color: #EF4444;
      }

      .retry-btn {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background: #EF4444;
        color: white;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
      }

      /* Table */
      .leaderboard-table-container {
        overflow-x: auto;
        border-radius: 0.75rem;
        background: rgba(0, 0, 0, 0.2);
      }

      .leaderboard-table {
        width: 100%;
        border-collapse: collapse;
        color: white;
      }

      .leaderboard-table thead {
        background: rgba(255, 255, 255, 0.05);
      }

      .leaderboard-table th {
        padding: 1rem;
        text-align: left;
        font-size: 0.875rem;
        font-weight: 600;
        color: #9CA3AF;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .leaderboard-table td {
        padding: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      }

      .leaderboard-table tr:hover {
        background: rgba(255, 255, 255, 0.03);
      }

      .leaderboard-table tr.current-user {
        background: rgba(59, 130, 246, 0.1);
        border: 2px solid #3B82F6;
      }

      .rank-badge {
        display: inline-block;
        min-width: 40px;
        text-align: center;
        font-size: 1.25rem;
        font-weight: 700;
      }

      .rank-badge.rank-1 { color: #FFD700; }
      .rank-badge.rank-2 { color: #C0C0C0; }
      .rank-badge.rank-3 { color: #CD7F32; }
      .rank-badge.rank-top10 { color: #F59E0B; }

      .you-badge {
        display: inline-block;
        margin-left: 0.5rem;
        padding: 0.125rem 0.5rem;
        background: #3B82F6;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        font-weight: 700;
      }

      .prize-badge {
        padding: 0.25rem 0.75rem;
        background: rgba(245, 158, 11, 0.2);
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: #F59E0B;
      }

      /* Empty state */
      .leaderboard-empty {
        text-align: center;
        padding: 3rem;
        color: #9CA3AF;
      }

      /* Footer */
      .leaderboard-footer {
        margin-top: 1.5rem;
        text-align: center;
      }

      .leaderboard-refresh {
        padding: 0.75rem 1.5rem;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 0.5rem;
        color: white;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .leaderboard-refresh:hover {
        background: rgba(255, 255, 255, 0.15);
      }

      /* Animations */
      @keyframes leaderboard-spin {
        to { transform: rotate(360deg); }
      }

      /* Responsive */
      @media (max-width: 768px) {
        .leaderboard-content {
          padding: 1.5rem;
        }

        .leaderboard-title {
          font-size: 1.5rem;
        }

        .leaderboard-table th,
        .leaderboard-table td {
          padding: 0.75rem 0.5rem;
          font-size: 0.875rem;
        }

        .rank-badge {
          font-size: 1rem;
          min-width: 30px;
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
      prizes: {
        1: '5000 💰',
        2: '3000 💰',
        3: '2000 💰',
        '4-10': '1000 💰',
        '11-50': '500 💰'
      }
    };
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.LeaderboardModal = LeaderboardModal;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LeaderboardModal;
}
