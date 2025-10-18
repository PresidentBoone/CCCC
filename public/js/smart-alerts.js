/**
 * Smart Alerts System
 * Proactively notifies users about deadlines, missing info, and opportunities
 */

class SmartAlerts {
    constructor(db, userId, userData) {
        this.db = db;
        this.userId = userId;
        this.userData = userData;
        this.alerts = [];
        this.notificationBadge = null;
        this.alertsPanel = null;
    }

    async initialize() {
        console.log('🔔 Initializing Smart Alerts...');

        // Create alerts UI
        this.createAlertsUI();

        // Generate alerts
        await this.generateAlerts();

        // Update UI
        this.updateAlertsDisplay();

        // Set up periodic checks (every hour)
        setInterval(() => this.checkForNewAlerts(), 60 * 60 * 1000);

        console.log('✅ Smart Alerts initialized with', this.alerts.length, 'alerts');
    }

    createAlertsUI() {
        // Create notification badge on navbar
        const navbar = document.querySelector('.cc-navbar');
        if (!navbar) return;

        // Create alerts button
        const alertsButton = document.createElement('button');
        alertsButton.className = 'smart-alerts-button';
        alertsButton.setAttribute('aria-label', 'View alerts');
        alertsButton.innerHTML = `
            <i class="fas fa-bell"></i>
            <span class="alerts-badge" id="alertsBadge" style="display: none;">0</span>
        `;
        alertsButton.onclick = () => this.toggleAlertsPanel();

        // Insert before theme toggle
        const themeToggle = document.getElementById('ccThemeToggle');
        if (themeToggle) {
            navbar.insertBefore(alertsButton, themeToggle);
        }

        this.notificationBadge = document.getElementById('alertsBadge');

        // Create alerts panel
        const panel = document.createElement('div');
        panel.className = 'smart-alerts-panel';
        panel.id = 'smartAlertsPanel';
        panel.innerHTML = `
            <div class="alerts-panel-header">
                <h3>🔔 Smart Alerts</h3>
                <button class="alerts-close-btn" onclick="window.smartAlerts.closeAlertsPanel()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="alerts-panel-body" id="alertsPanelBody">
                <div class="alerts-loading">
                    <div class="spinner"></div>
                    <p>Loading alerts...</p>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
        this.alertsPanel = panel;

        // Add styles
        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('smart-alerts-styles')) return;

        const style = document.createElement('style');
        style.id = 'smart-alerts-styles';
        style.textContent = `
            .smart-alerts-button {
                position: relative;
                background: none;
                border: none;
                color: var(--text-primary);
                font-size: 1.3rem;
                cursor: pointer;
                padding: 8px 12px;
                margin-right: 10px;
                border-radius: 8px;
                transition: all 0.3s ease;
            }

            .smart-alerts-button:hover {
                background: var(--surface-secondary);
                transform: scale(1.05);
            }

            .alerts-badge {
                position: absolute;
                top: 5px;
                right: 5px;
                background: #ef4444;
                color: white;
                font-size: 0.7rem;
                font-weight: 600;
                padding: 2px 6px;
                border-radius: 10px;
                min-width: 18px;
                text-align: center;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            .smart-alerts-panel {
                position: fixed;
                top: 0;
                right: -400px;
                width: 400px;
                height: 100vh;
                background: var(--surface-primary);
                box-shadow: -4px 0 20px rgba(0,0,0,0.2);
                z-index: 10000;
                transition: right 0.3s ease;
                display: flex;
                flex-direction: column;
            }

            .smart-alerts-panel.open {
                right: 0;
            }

            .alerts-panel-header {
                padding: 20px;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: var(--surface-secondary);
            }

            .alerts-panel-header h3 {
                margin: 0;
                font-size: 1.2rem;
                color: var(--text-primary);
            }

            .alerts-close-btn {
                background: none;
                border: none;
                color: var(--text-secondary);
                font-size: 1.5rem;
                cursor: pointer;
                padding: 5px;
                transition: color 0.2s;
            }

            .alerts-close-btn:hover {
                color: var(--text-primary);
            }

            .alerts-panel-body {
                flex: 1;
                overflow-y: auto;
                padding: 15px;
            }

            .alert-item {
                background: var(--surface-secondary);
                border-radius: 12px;
                padding: 15px;
                margin-bottom: 12px;
                border-left: 4px solid;
                animation: slideIn 0.3s ease;
                cursor: pointer;
                transition: transform 0.2s;
            }

            .alert-item:hover {
                transform: translateX(-5px);
            }

            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            .alert-item.critical {
                border-left-color: #ef4444;
            }

            .alert-item.warning {
                border-left-color: #f59e0b;
            }

            .alert-item.info {
                border-left-color: #3b82f6;
            }

            .alert-item.success {
                border-left-color: #10b981;
            }

            .alert-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 8px;
            }

            .alert-icon {
                font-size: 1.3rem;
            }

            .alert-title {
                font-weight: 600;
                color: var(--text-primary);
                flex: 1;
            }

            .alert-time {
                font-size: 0.75rem;
                color: var(--text-secondary);
            }

            .alert-message {
                color: var(--text-secondary);
                font-size: 0.9rem;
                margin-bottom: 10px;
                line-height: 1.5;
            }

            .alert-actions {
                display: flex;
                gap: 8px;
            }

            .alert-action-btn {
                padding: 6px 12px;
                border-radius: 6px;
                border: none;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s;
                font-weight: 500;
            }

            .alert-action-btn.primary {
                background: var(--accent-color);
                color: white;
            }

            .alert-action-btn.primary:hover {
                background: var(--accent-hover);
            }

            .alert-action-btn.secondary {
                background: var(--surface-primary);
                color: var(--text-secondary);
                border: 1px solid var(--border-color);
            }

            .alert-action-btn.secondary:hover {
                background: var(--surface-secondary);
            }

            .alerts-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px;
                text-align: center;
            }

            .alerts-empty {
                text-align: center;
                padding: 40px 20px;
                color: var(--text-secondary);
            }

            .alerts-empty-icon {
                font-size: 3rem;
                margin-bottom: 15px;
                opacity: 0.5;
            }

            @media (max-width: 768px) {
                .smart-alerts-panel {
                    width: 100%;
                    right: -100%;
                }
            }
        `;

        document.head.appendChild(style);
    }

    async generateAlerts() {
        this.alerts = [];

        try {
            // Import Firebase functions
            const { collection, query, where, getDocs, Timestamp } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

            const now = Date.now();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // 1. Check for upcoming application deadlines
            await this.checkDeadlines(collection, query, where, getDocs, Timestamp);

            // 2. Check for incomplete profile
            this.checkIncompleteProfile();

            // 3. Check for test prep opportunities
            this.checkTestPrepOpportunities();

            // 4. Check for scholarship opportunities
            await this.checkScholarshipOpportunities(collection, query, where, getDocs, Timestamp);

            // 5. Check for essay reviews needed
            await this.checkEssayReviews(collection, query, getDocs);

            // 6. Check for achievement milestones
            await this.checkAchievements(collection, query, getDocs);

            // Sort alerts by priority
            this.alerts.sort((a, b) => {
                const priorityOrder = { critical: 0, warning: 1, info: 2, success: 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            });

        } catch (error) {
            console.error('Error generating alerts:', error);
        }
    }

    async checkDeadlines(collection, query, where, getDocs, Timestamp) {
        try {
            const applicationsRef = collection(this.db, 'users', this.userId, 'applications');
            const q = query(applicationsRef, where('status', '!=', 'submitted'));
            const snapshot = await getDocs(q);

            const now = Date.now();
            const oneWeek = 7 * 24 * 60 * 60 * 1000;
            const twoWeeks = 14 * 24 * 60 * 60 * 1000;

            snapshot.forEach(doc => {
                const app = doc.data();
                if (app.deadline) {
                    const deadlineDate = app.deadline.toDate ? app.deadline.toDate() : new Date(app.deadline);
                    const timeUntil = deadlineDate.getTime() - now;

                    if (timeUntil < 0) {
                        // Deadline passed
                        this.alerts.push({
                            id: `deadline-passed-${doc.id}`,
                            priority: 'critical',
                            icon: '🚨',
                            title: 'Deadline Passed!',
                            message: `The deadline for ${app.schoolName} has passed. Update the status or remove this application.`,
                            time: 'Overdue',
                            actions: [
                                {
                                    label: 'View Application',
                                    type: 'primary',
                                    action: () => this.openApplicationTracker(doc.id)
                                }
                            ]
                        });
                    } else if (timeUntil < oneWeek) {
                        // Less than 1 week
                        const daysLeft = Math.ceil(timeUntil / (24 * 60 * 60 * 1000));
                        this.alerts.push({
                            id: `deadline-soon-${doc.id}`,
                            priority: 'critical',
                            icon: '⏰',
                            title: 'Urgent Deadline!',
                            message: `${app.schoolName} application due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}!`,
                            time: `${daysLeft}d left`,
                            actions: [
                                {
                                    label: 'Work on It',
                                    type: 'primary',
                                    action: () => this.openApplicationTracker(doc.id)
                                },
                                {
                                    label: 'Dismiss',
                                    type: 'secondary',
                                    action: () => this.dismissAlert(`deadline-soon-${doc.id}`)
                                }
                            ]
                        });
                    } else if (timeUntil < twoWeeks) {
                        // Less than 2 weeks
                        const daysLeft = Math.ceil(timeUntil / (24 * 60 * 60 * 1000));
                        this.alerts.push({
                            id: `deadline-upcoming-${doc.id}`,
                            priority: 'warning',
                            icon: '📅',
                            title: 'Upcoming Deadline',
                            message: `${app.schoolName} application due in ${daysLeft} days.`,
                            time: `${daysLeft}d left`,
                            actions: [
                                {
                                    label: 'Review',
                                    type: 'primary',
                                    action: () => this.openApplicationTracker(doc.id)
                                }
                            ]
                        });
                    }
                }
            });
        } catch (error) {
            console.error('Error checking deadlines:', error);
        }
    }

    checkIncompleteProfile() {
        const requiredFields = ['gpa', 'satScore', 'intendedMajor', 'academicInterests'];
        const missingFields = [];

        requiredFields.forEach(field => {
            if (!this.userData[field] ||
                (Array.isArray(this.userData[field]) && this.userData[field].length === 0)) {
                missingFields.push(field);
            }
        });

        if (missingFields.length > 0) {
            const fieldNames = {
                gpa: 'GPA',
                satScore: 'SAT/ACT Score',
                intendedMajor: 'Intended Major',
                academicInterests: 'Academic Interests'
            };

            this.alerts.push({
                id: 'incomplete-profile',
                priority: 'warning',
                icon: '📝',
                title: 'Complete Your Profile',
                message: `Add your ${missingFields.map(f => fieldNames[f]).join(', ')} to get better recommendations.`,
                time: 'Now',
                actions: [
                    {
                        label: 'Update Profile',
                        type: 'primary',
                        action: () => window.location.href = '/profile'
                    },
                    {
                        label: 'Later',
                        type: 'secondary',
                        action: () => this.dismissAlert('incomplete-profile')
                    }
                ]
            });
        }
    }

    checkTestPrepOpportunities() {
        const sat = this.userData.satScore || 0;
        const act = this.userData.actScore || 0;

        // If scores are below competitive range, suggest test prep
        if ((sat > 0 && sat < 1400) || (act > 0 && act < 30)) {
            this.alerts.push({
                id: 'test-prep-opportunity',
                priority: 'info',
                icon: '📚',
                title: 'Boost Your Test Scores',
                message: 'Improving your scores could unlock better scholarship opportunities. Try our AI-powered test prep!',
                time: 'Recommended',
                actions: [
                    {
                        label: 'Start Practice',
                        type: 'primary',
                        action: () => window.location.href = '/testprep'
                    },
                    {
                        label: 'Not Now',
                        type: 'secondary',
                        action: () => this.dismissAlert('test-prep-opportunity')
                    }
                ]
            });
        }
    }

    async checkScholarshipOpportunities(collection, query, where, getDocs, Timestamp) {
        try {
            // Check if user has applied to scholarships recently
            const scholarshipsRef = collection(this.db, 'users', this.userId, 'scholarships');
            const snapshot = await getDocs(scholarshipsRef);

            if (snapshot.empty) {
                this.alerts.push({
                    id: 'scholarship-opportunity',
                    priority: 'info',
                    icon: '💰',
                    title: 'Explore Scholarships',
                    message: 'Discover scholarships worth over $12.4M! Start applying today.',
                    time: 'New',
                    actions: [
                        {
                            label: 'Browse Scholarships',
                            type: 'primary',
                            action: () => window.location.href = '/scholarships'
                        }
                    ]
                });
            }
        } catch (error) {
            console.error('Error checking scholarships:', error);
        }
    }

    async checkEssayReviews(collection, query, getDocs) {
        try {
            const essaysRef = collection(this.db, 'users', this.userId, 'essays');
            const snapshot = await getDocs(essaysRef);

            let needsReview = 0;
            snapshot.forEach(doc => {
                const essay = doc.data();
                if (!essay.reviewed && essay.content && essay.content.length > 100) {
                    needsReview++;
                }
            });

            if (needsReview > 0) {
                this.alerts.push({
                    id: 'essay-review-needed',
                    priority: 'info',
                    icon: '✍️',
                    title: 'Essays Need Review',
                    message: `You have ${needsReview} essay${needsReview !== 1 ? 's' : ''} ready for AI review.`,
                    time: 'Ready',
                    actions: [
                        {
                            label: 'Review Essays',
                            type: 'primary',
                            action: () => window.location.href = '/essay-coach'
                        }
                    ]
                });
            }
        } catch (error) {
            console.error('Error checking essays:', error);
        }
    }

    async checkAchievements(collection, query, getDocs) {
        try {
            // Check for milestone achievements
            const applicationsRef = collection(this.db, 'users', this.userId, 'applications');
            const appsSnapshot = await getDocs(applicationsRef);

            if (appsSnapshot.size === 5) {
                this.alerts.push({
                    id: 'achievement-5-apps',
                    priority: 'success',
                    icon: '🎉',
                    title: 'Achievement Unlocked!',
                    message: 'You\'ve tracked 5 college applications! Keep up the great work!',
                    time: 'New',
                    actions: [
                        {
                            label: 'Awesome!',
                            type: 'primary',
                            action: () => this.dismissAlert('achievement-5-apps')
                        }
                    ]
                });
            }

            if (appsSnapshot.size === 10) {
                this.alerts.push({
                    id: 'achievement-10-apps',
                    priority: 'success',
                    icon: '🏆',
                    title: 'Double Digits!',
                    message: '10 applications tracked! You\'re crushing it!',
                    time: 'New',
                    actions: [
                        {
                            label: 'Thanks!',
                            type: 'primary',
                            action: () => this.dismissAlert('achievement-10-apps')
                        }
                    ]
                });
            }
        } catch (error) {
            console.error('Error checking achievements:', error);
        }
    }

    async checkForNewAlerts() {
        const oldCount = this.alerts.length;
        await this.generateAlerts();
        const newCount = this.alerts.length;

        if (newCount > oldCount) {
            this.updateAlertsDisplay();
            // Show toast notification
            if (window.showToast) {
                window.showToast(`You have ${newCount - oldCount} new alert${newCount - oldCount !== 1 ? 's' : ''}`, 'info');
            }
        }
    }

    updateAlertsDisplay() {
        // Update badge
        if (this.notificationBadge) {
            if (this.alerts.length > 0) {
                this.notificationBadge.textContent = this.alerts.length;
                this.notificationBadge.style.display = 'block';
            } else {
                this.notificationBadge.style.display = 'none';
            }
        }

        // Update panel body
        const panelBody = document.getElementById('alertsPanelBody');
        if (!panelBody) return;

        if (this.alerts.length === 0) {
            panelBody.innerHTML = `
                <div class="alerts-empty">
                    <div class="alerts-empty-icon">🎉</div>
                    <h4>All Caught Up!</h4>
                    <p>You have no alerts right now. Keep up the great work!</p>
                </div>
            `;
        } else {
            panelBody.innerHTML = this.alerts.map(alert => this.renderAlert(alert)).join('');
        }
    }

    renderAlert(alert) {
        const actionsHTML = alert.actions ? alert.actions.map(action =>
            `<button class="alert-action-btn ${action.type}" data-alert-id="${alert.id}" data-action="${alert.actions.indexOf(action)}">
                ${action.label}
            </button>`
        ).join('') : '';

        return `
            <div class="alert-item ${alert.priority}" data-alert-id="${alert.id}">
                <div class="alert-header">
                    <span class="alert-icon">${alert.icon}</span>
                    <span class="alert-title">${alert.title}</span>
                    <span class="alert-time">${alert.time}</span>
                </div>
                <div class="alert-message">${alert.message}</div>
                ${actionsHTML ? `<div class="alert-actions">${actionsHTML}</div>` : ''}
            </div>
        `;
    }

    toggleAlertsPanel() {
        if (!this.alertsPanel) return;
        this.alertsPanel.classList.toggle('open');
    }

    closeAlertsPanel() {
        if (!this.alertsPanel) return;
        this.alertsPanel.classList.remove('open');
    }

    dismissAlert(alertId) {
        this.alerts = this.alerts.filter(a => a.id !== alertId);
        this.updateAlertsDisplay();
        this.closeAlertsPanel();
    }

    openApplicationTracker(appId) {
        this.closeAlertsPanel();
        if (window.applicationTracker) {
            window.applicationTracker.open();
            // If appId provided, could auto-open that specific app
        }
    }
}

// Handle action button clicks
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('alert-action-btn')) {
        const alertId = e.target.dataset.alertId;
        const actionIndex = parseInt(e.target.dataset.action);

        if (window.smartAlerts && window.smartAlerts.alerts) {
            const alert = window.smartAlerts.alerts.find(a => a.id === alertId);
            if (alert && alert.actions && alert.actions[actionIndex]) {
                alert.actions[actionIndex].action();
            }
        }
    }
});

window.SmartAlerts = SmartAlerts;
