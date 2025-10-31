/**
 * Usage Meters - Show subscription usage and limits
 * Displays how much of each resource the user has used
 */

class UsageMeters {
    constructor(db, userId) {
        this.db = db;
        this.userId = userId;
        this.usage = {};
        this.limits = {};
    }

    /**
     * Initialize usage meters
     */
    async initialize() {
        console.log('📊 Initializing usage meters...');

        // Wait for tier enforcement to be ready
        if (!window.tierEnforcement) {
            console.warn('Tier enforcement not loaded yet');
            return;
        }

        await this.loadUsage();
        console.log('✅ Usage meters initialized');
    }

    /**
     * Load current usage from Firestore
     */
    async loadUsage() {
        try {
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

            const userDoc = await getDoc(doc(this.db, 'users', this.userId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                this.usage = userData.usage || {};
            }

            // Get limits from tier enforcement
            const tier = await window.tierEnforcement.getUserTier();
            const tierConfig = window.SUBSCRIPTION_TIERS[tier];
            this.limits = tierConfig.limits;

        } catch (error) {
            console.error('Error loading usage:', error);
        }
    }

    /**
     * Render usage meters in a container
     * @param {HTMLElement} container - Container element
     */
    async render(container) {
        if (!container) return;

        await this.loadUsage();

        const tier = await window.tierEnforcement.getUserTier();
        const tierConfig = window.SUBSCRIPTION_TIERS[tier];

        // Calculate usage for each limit
        const meters = [];

        // Essays meter
        if (this.limits.maxEssays !== Infinity) {
            const essaysUsed = this.usage.maxEssays || 0;
            meters.push(this.createMeter(
                'Essays',
                'fa-pen-fancy',
                essaysUsed,
                this.limits.maxEssays,
                'per month'
            ));
        }

        // Practice questions meter
        if (this.limits.practiceQuestionsPerDay !== Infinity) {
            const today = new Date().toDateString();
            const questionsToday = this.usage.dailyPracticeCount?.[today] || 0;
            meters.push(this.createMeter(
                'Practice Questions',
                'fa-question-circle',
                questionsToday,
                this.limits.practiceQuestionsPerDay,
                'per day'
            ));
        }

        // College list meter
        if (this.limits.maxColleges !== Infinity) {
            const collegesUsed = this.usage.maxColleges || 0;
            meters.push(this.createMeter(
                'College List',
                'fa-university',
                collegesUsed,
                this.limits.maxColleges,
                'colleges'
            ));
        }

        // Applications meter
        if (this.limits.maxApplications !== Infinity) {
            const appsUsed = this.usage.maxApplications || 0;
            meters.push(this.createMeter(
                'Applications',
                'fa-file-alt',
                appsUsed,
                this.limits.maxApplications,
                'tracked'
            ));
        }

        container.innerHTML = `
            <div class="usage-meters-container">
                <div class="usage-meters-header">
                    <h3>📊 Your Usage</h3>
                    <span class="tier-badge tier-${tier}">${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan</span>
                </div>

                ${meters.length > 0 ? `
                    <div class="usage-meters-grid">
                        ${meters.join('')}
                    </div>
                ` : `
                    <div class="usage-unlimited">
                        <i class="fas fa-infinity"></i>
                        <p>Unlimited access to all features!</p>
                    </div>
                `}

                ${tier === 'free' || tier === 'basic' ? `
                    <div class="usage-upgrade-prompt">
                        <p>💡 Want more? <a href="/pricing.html" class="upgrade-link">Upgrade your plan</a></p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Create a single usage meter
     */
    createMeter(label, icon, used, limit, suffix) {
        const percentage = (used / limit) * 100;
        const isNearLimit = percentage >= 80;
        const atLimit = percentage >= 100;

        return `
            <div class="usage-meter ${atLimit ? 'at-limit' : ''} ${isNearLimit ? 'near-limit' : ''}">
                <div class="usage-meter-header">
                    <div class="usage-meter-label">
                        <i class="fas ${icon}"></i>
                        <span>${label}</span>
                    </div>
                    <div class="usage-meter-count">
                        <strong>${used}</strong> / ${limit}
                    </div>
                </div>

                <div class="usage-meter-bar">
                    <div class="usage-meter-progress" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>

                <div class="usage-meter-suffix">${suffix}</div>

                ${atLimit ? `
                    <div class="usage-meter-warning">
                        ⚠️ Limit reached - <a href="/pricing.html">Upgrade</a>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Refresh usage meters
     */
    async refresh() {
        const container = document.querySelector('.usage-meters-container')?.parentElement;
        if (container) {
            await this.render(container);
        }
    }
}

// Add CSS styles
const styles = document.createElement('style');
styles.textContent = `
    .usage-meters-container {
        background: var(--secondary-bg);
        border-radius: 12px;
        padding: 1.5rem;
        margin: 1.5rem 0;
    }

    .usage-meters-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .usage-meters-header h3 {
        margin: 0;
        font-size: 1.25rem;
        color: var(--text-primary);
    }

    .usage-meters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .usage-meter {
        background: var(--primary-bg);
        border-radius: 8px;
        padding: 1rem;
        border: 2px solid transparent;
        transition: all 0.3s;
    }

    .usage-meter:hover {
        border-color: var(--accent-color);
    }

    .usage-meter.near-limit {
        border-color: #f59e0b;
        background: rgba(245, 158, 11, 0.05);
    }

    .usage-meter.at-limit {
        border-color: #ef4444;
        background: rgba(239, 68, 68, 0.05);
    }

    .usage-meter-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
    }

    .usage-meter-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        color: var(--text-primary);
    }

    .usage-meter-label i {
        color: var(--accent-color);
    }

    .usage-meter-count {
        font-size: 0.9rem;
        color: var(--text-secondary);
    }

    .usage-meter-count strong {
        color: var(--text-primary);
        font-size: 1.1rem;
    }

    .usage-meter-bar {
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 0.5rem;
    }

    [data-theme="dark"] .usage-meter-bar {
        background: #374151;
    }

    .usage-meter-progress {
        height: 100%;
        background: linear-gradient(90deg, var(--accent-color), #bb86fc);
        border-radius: 4px;
        transition: width 0.5s ease;
    }

    .usage-meter.near-limit .usage-meter-progress {
        background: linear-gradient(90deg, #f59e0b, #fbbf24);
    }

    .usage-meter.at-limit .usage-meter-progress {
        background: linear-gradient(90deg, #ef4444, #f87171);
    }

    .usage-meter-suffix {
        font-size: 0.85rem;
        color: var(--text-secondary);
    }

    .usage-meter-warning {
        margin-top: 0.75rem;
        padding: 0.5rem;
        background: rgba(239, 68, 68, 0.1);
        border-radius: 4px;
        font-size: 0.85rem;
        color: #ef4444;
        text-align: center;
    }

    .usage-meter-warning a {
        color: #ef4444;
        font-weight: 600;
        text-decoration: underline;
    }

    .usage-unlimited {
        text-align: center;
        padding: 2rem;
        color: var(--text-secondary);
    }

    .usage-unlimited i {
        font-size: 3rem;
        color: var(--accent-color);
        margin-bottom: 1rem;
    }

    .usage-upgrade-prompt {
        text-align: center;
        padding: 1rem;
        background: rgba(160, 123, 204, 0.1);
        border-radius: 8px;
        margin-top: 1rem;
    }

    .usage-upgrade-prompt p {
        margin: 0;
        color: var(--text-secondary);
    }

    .upgrade-link {
        color: var(--accent-color);
        font-weight: 600;
        text-decoration: none;
    }

    .upgrade-link:hover {
        text-decoration: underline;
    }

    /* Tier badge */
    .tier-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 700;
        text-transform: uppercase;
    }

    .tier-badge.tier-free {
        background: #e5e7eb;
        color: #6b7280;
    }

    .tier-badge.tier-basic {
        background: linear-gradient(135deg, #a07bcc 0%, #8b5cf6 100%);
        color: white;
    }

    .tier-badge.tier-pro {
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: #78350f;
    }

    @media (max-width: 768px) {
        .usage-meters-grid {
            grid-template-columns: 1fr;
        }

        .usage-meters-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }
    }
`;
document.head.appendChild(styles);

// Export singleton
const usageMeters = new UsageMeters();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = usageMeters;
} else {
    window.usageMeters = usageMeters;
    window.UsageMeters = UsageMeters;
}
