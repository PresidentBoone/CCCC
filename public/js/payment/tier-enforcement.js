/**
 * Tier Enforcement System
 * Enforces subscription tier limits and feature access across the application
 */

class TierEnforcement {
    constructor() {
        this.userTier = 'free';
        this.userSubscription = null;
        this.usageCache = {};
    }

    /**
     * Initialize tier enforcement for current user
     * @param {string} userId - User ID
     * @param {Object} db - Firestore database instance
     */
    async initialize(userId, db) {
        this.userId = userId;
        this.db = db;

        // Fetch subscription status
        await this.fetchSubscriptionStatus();

        // Set up usage tracking
        await this.loadUsageData();

        console.log(`🔒 Tier enforcement initialized: ${this.userTier}`);
    }

    /**
     * Fetch subscription status from server
     */
    async fetchSubscriptionStatus() {
        try {
            const response = await fetch(`/api/stripe/subscription-status?userId=${this.userId}`);

            if (response.ok) {
                this.userSubscription = await response.json();
                this.userTier = this.userSubscription.tier || 'free';
            } else {
                console.warn('Failed to fetch subscription status, defaulting to free tier');
                this.userTier = 'free';
            }
        } catch (error) {
            console.error('Subscription fetch error:', error);
            this.userTier = 'free';
        }
    }

    /**
     * Load usage data from Firestore
     */
    async loadUsageData() {
        if (!this.db || !this.userId) return;

        try {
            const userDoc = await this.db.collection('users').doc(this.userId).get();

            if (userDoc.exists) {
                const data = userDoc.data();
                this.usageCache = data.usage || {};
            }
        } catch (error) {
            console.error('Failed to load usage data:', error);
        }
    }

    /**
     * Check if user has access to a feature
     * @param {string} feature - Feature identifier
     * @returns {boolean} Whether user has access
     */
    hasFeatureAccess(feature) {
        if (!window.SubscriptionConfig) {
            console.warn('Subscription config not loaded');
            return true; // Fail open during development
        }

        return window.SubscriptionConfig.hasFeatureAccess(this.userTier, feature);
    }

    /**
     * Check if user is within usage limits
     * @param {string} limitType - Type of limit
     * @param {number} requestedAmount - Amount user wants to use (default 1)
     * @returns {Object} { allowed: boolean, remaining: number, limit: number }
     */
    checkLimit(limitType, requestedAmount = 1) {
        if (!window.SubscriptionConfig) {
            return { allowed: true, remaining: 999999, limit: 999999 };
        }

        const currentUsage = this.getCurrentUsage(limitType);
        const isWithinLimit = window.SubscriptionConfig.isWithinLimit(
            this.userTier,
            limitType,
            currentUsage + requestedAmount
        );

        const remaining = window.SubscriptionConfig.getRemainingQuota(
            this.userTier,
            limitType,
            currentUsage
        );

        const config = window.SubscriptionConfig.getTierConfig(this.userTier);
        const limit = config.limits[limitType] || 999999;

        return {
            allowed: isWithinLimit,
            remaining: Math.max(0, remaining - requestedAmount),
            limit,
            current: currentUsage
        };
    }

    /**
     * Get current usage for a limit type
     * @param {string} limitType - Type of limit
     * @returns {number} Current usage count
     */
    getCurrentUsage(limitType) {
        // Check if this is a daily limit
        if (limitType.includes('PerDay')) {
            const today = new Date().toISOString().split('T')[0];
            const dailyKey = `${limitType}_${today}`;
            return this.usageCache[dailyKey] || 0;
        }

        // Check if this is a monthly limit
        if (limitType.includes('PerMonth')) {
            const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
            const monthlyKey = `${limitType}_${thisMonth}`;
            return this.usageCache[monthlyKey] || 0;
        }

        // Total count limit (e.g., maxEssays, maxApplications)
        const countKey = limitType.replace('max', 'total');
        return this.usageCache[countKey] || 0;
    }

    /**
     * Increment usage counter
     * @param {string} limitType - Type of limit
     * @param {number} amount - Amount to increment (default 1)
     */
    async incrementUsage(limitType, amount = 1) {
        let usageKey;

        // Determine usage key based on limit type
        if (limitType.includes('PerDay')) {
            const today = new Date().toISOString().split('T')[0];
            usageKey = `${limitType}_${today}`;
        } else if (limitType.includes('PerMonth')) {
            const thisMonth = new Date().toISOString().slice(0, 7);
            usageKey = `${limitType}_${thisMonth}`;
        } else {
            usageKey = limitType.replace('max', 'total');
        }

        // Update local cache
        this.usageCache[usageKey] = (this.usageCache[usageKey] || 0) + amount;

        // Update Firestore
        if (this.db && this.userId) {
            try {
                await this.db.collection('users').doc(this.userId).set({
                    usage: {
                        [usageKey]: this.usageCache[usageKey]
                    }
                }, { merge: true });
            } catch (error) {
                console.error('Failed to update usage:', error);
            }
        }
    }

    /**
     * Show upgrade prompt to user
     * @param {string} feature - Feature that requires upgrade
     */
    showUpgradePrompt(feature) {
        // Check if upgrade modal already exists
        if (document.getElementById('tier-upgrade-modal')) {
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'tier-upgrade-modal';
        modal.innerHTML = `
            <div class="tier-modal-overlay">
                <div class="tier-modal-content">
                    <button class="tier-modal-close">&times;</button>
                    <div class="tier-modal-icon">🚀</div>
                    <h2>Upgrade Required</h2>
                    <p>This feature requires a higher subscription tier.</p>
                    <p class="tier-feature-name">${this.getFeatureDisplayName(feature)}</p>
                    <div class="tier-modal-buttons">
                        <a href="/pricing.html" class="tier-upgrade-btn">View Plans</a>
                        <button class="tier-cancel-btn">Maybe Later</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        const closeBtn = modal.querySelector('.tier-modal-close');
        const cancelBtn = modal.querySelector('.tier-cancel-btn');

        const closeModal = () => {
            modal.remove();
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        modal.querySelector('.tier-modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                closeModal();
            }
        });

        // Auto-close after 30 seconds
        setTimeout(closeModal, 30000);
    }

    /**
     * Show limit reached notification
     * @param {string} limitType - Type of limit reached
     * @param {Object} limitInfo - Information about the limit
     */
    showLimitReached(limitType, limitInfo) {
        const message = this.getLimitMessage(limitType, limitInfo);

        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'tier-limit-toast';
        toast.innerHTML = `
            <div class="tier-toast-icon">⚠️</div>
            <div class="tier-toast-content">
                <strong>Limit Reached</strong>
                <p>${message}</p>
            </div>
            <a href="/pricing.html" class="tier-toast-upgrade">Upgrade</a>
        `;

        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Remove after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 5000);
    }

    /**
     * Get display name for feature
     */
    getFeatureDisplayName(feature) {
        const names = {
            'adaptiveLearning': 'Adaptive Learning',
            'aiReviews': 'AI Essay Reviews',
            'detailedInsights': 'Detailed College Insights',
            'deadlineReminders': 'Deadline Reminders',
            'documentManagement': 'Document Management',
            'matchScoring': 'Scholarship Match Scoring',
            'advancedAnalytics': 'Advanced Analytics',
            'exportData': 'Data Export',
            'prioritySupport': 'Priority Support'
        };

        return names[feature] || feature;
    }

    /**
     * Get limit message
     */
    getLimitMessage(limitType, limitInfo) {
        const messages = {
            'maxEssays': `You've reached your limit of ${limitInfo.limit} essays.`,
            'maxApplications': `You've reached your limit of ${limitInfo.limit} applications.`,
            'maxColleges': `You've saved ${limitInfo.limit} colleges (max for your tier).`,
            'maxScholarships': `You've saved ${limitInfo.limit} scholarships (max for your tier).`,
            'aiReviewsPerMonth': `You've used all ${limitInfo.limit} AI reviews for this month.`,
            'practiceQuestionsPerDay': `You've completed ${limitInfo.limit} practice questions today.`
        };

        return messages[limitType] || `You've reached your ${this.userTier} tier limit.`;
    }

    /**
     * Get subscription tier name
     */
    getTierName() {
        const names = {
            'free': 'Free',
            'basic': 'Basic',
            'pro': 'Pro'
        };

        return names[this.userTier] || 'Free';
    }

    /**
     * Check if subscription is active
     */
    isSubscriptionActive() {
        if (!this.userSubscription) return this.userTier === 'free';

        const status = this.userSubscription.status;
        return status === 'active' || status === 'trialing';
    }
}

// Add styles for modals and toasts
const styles = document.createElement('style');
styles.textContent = `
    .tier-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100000;
        animation: fadeIn 0.3s ease;
    }

    .tier-modal-content {
        background: white;
        border-radius: 16px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        position: relative;
        animation: slideUp 0.3s ease;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    [data-theme="dark"] .tier-modal-content {
        background: #1a1a1a;
        color: white;
    }

    .tier-modal-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        font-size: 2rem;
        cursor: pointer;
        color: #666;
        transition: color 0.3s;
    }

    .tier-modal-close:hover {
        color: #000;
    }

    [data-theme="dark"] .tier-modal-close {
        color: #aaa;
    }

    [data-theme="dark"] .tier-modal-close:hover {
        color: #fff;
    }

    .tier-modal-icon {
        font-size: 4rem;
        text-align: center;
        margin-bottom: 1rem;
    }

    .tier-modal-content h2 {
        text-align: center;
        margin-bottom: 1rem;
        color: #2a357a;
    }

    [data-theme="dark"] .tier-modal-content h2 {
        color: #bb86fc;
    }

    .tier-modal-content p {
        text-align: center;
        margin-bottom: 0.5rem;
        color: #666;
    }

    [data-theme="dark"] .tier-modal-content p {
        color: #aaa;
    }

    .tier-feature-name {
        font-weight: 700;
        font-size: 1.1rem;
        color: #a07bcc !important;
        margin-bottom: 1.5rem !important;
    }

    .tier-modal-buttons {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
    }

    .tier-upgrade-btn, .tier-cancel-btn {
        flex: 1;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;
        border: none;
        font-size: 1rem;
    }

    .tier-upgrade-btn {
        background: linear-gradient(135deg, #2a357a 0%, #a07bcc 100%);
        color: white;
        text-decoration: none;
        display: block;
    }

    .tier-upgrade-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(160, 123, 204, 0.3);
    }

    .tier-cancel-btn {
        background: #f0f0f0;
        color: #333;
    }

    [data-theme="dark"] .tier-cancel-btn {
        background: #333;
        color: #fff;
    }

    .tier-cancel-btn:hover {
        background: #e0e0e0;
    }

    [data-theme="dark"] .tier-cancel-btn:hover {
        background: #444;
    }

    .tier-limit-toast {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: white;
        border-radius: 12px;
        padding: 1rem 1.5rem;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 1rem;
        z-index: 99999;
        max-width: 400px;
        transform: translateY(120%);
        opacity: 0;
        transition: all 0.3s ease;
    }

    [data-theme="dark"] .tier-limit-toast {
        background: #1a1a1a;
        color: white;
    }

    .tier-limit-toast.show {
        transform: translateY(0);
        opacity: 1;
    }

    .tier-toast-icon {
        font-size: 2rem;
    }

    .tier-toast-content {
        flex: 1;
    }

    .tier-toast-content strong {
        display: block;
        margin-bottom: 0.25rem;
        color: #2a357a;
    }

    [data-theme="dark"] .tier-toast-content strong {
        color: #bb86fc;
    }

    .tier-toast-content p {
        margin: 0;
        font-size: 0.9rem;
        color: #666;
    }

    [data-theme="dark"] .tier-toast-content p {
        color: #aaa;
    }

    .tier-toast-upgrade {
        padding: 0.5rem 1rem;
        background: linear-gradient(135deg, #2a357a 0%, #a07bcc 100%);
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.9rem;
        white-space: nowrap;
        transition: all 0.3s;
    }

    .tier-toast-upgrade:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(160, 123, 204, 0.3);
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(styles);

// Export singleton instance
const tierEnforcement = new TierEnforcement();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = tierEnforcement;
} else {
    window.tierEnforcement = tierEnforcement;
}
