/**
 * Email Preferences Manager
 * Allows users to control which emails they receive
 */

class EmailPreferences {
    constructor() {
        this.userId = null;
        this.db = null;
        this.preferences = this.getDefaultPreferences();
    }

    /**
     * Get default email preferences
     */
    getDefaultPreferences() {
        return {
            // Marketing emails
            productUpdates: true,
            tipsAndTricks: true,
            weeklyDigest: false,

            // Transactional emails (always enabled)
            welcomeEmail: true,
            paymentConfirmations: true,
            paymentFailures: true,

            // Notifications
            deadlineReminders: true,
            essayFeedbackReady: true,
            achievementUnlocked: true,
            weeklyProgress: true,

            // Frequency settings
            reminderDaysBefore: [7, 3, 1], // Days before deadline to send reminders
            digestDay: 'monday', // Day of week for weekly digest

            // Communication preferences
            emailAddress: '',
            unsubscribeAll: false
        };
    }

    /**
     * Initialize with user data
     * @param {string} userId - User ID
     * @param {Object} db - Firestore instance
     */
    async initialize(userId, db) {
        this.userId = userId;
        this.db = db;

        // Load preferences from Firestore
        await this.loadPreferences();

        console.log('📧 Email preferences loaded');
    }

    /**
     * Load preferences from Firestore
     */
    async loadPreferences() {
        if (!this.db || !this.userId) return;

        try {
            const userDoc = await this.db.collection('users').doc(this.userId).get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                this.preferences = {
                    ...this.getDefaultPreferences(),
                    ...(userData.emailPreferences || {})
                };
            }
        } catch (error) {
            console.error('Failed to load email preferences:', error);
        }
    }

    /**
     * Save preferences to Firestore
     */
    async savePreferences(newPreferences) {
        if (!this.db || !this.userId) {
            throw new Error('Email preferences not initialized');
        }

        try {
            // Merge with existing preferences
            this.preferences = {
                ...this.preferences,
                ...newPreferences
            };

            // Save to Firestore
            await this.db.collection('users').doc(this.userId).set({
                emailPreferences: this.preferences,
                updatedAt: new Date()
            }, { merge: true });

            console.log('✅ Email preferences saved');

            return this.preferences;
        } catch (error) {
            console.error('Failed to save email preferences:', error);
            throw error;
        }
    }

    /**
     * Check if user wants to receive a specific email type
     * @param {string} emailType - Type of email
     * @returns {boolean}
     */
    shouldSendEmail(emailType) {
        // If user unsubscribed from all, only send transactional emails
        if (this.preferences.unsubscribeAll) {
            const transactionalEmails = [
                'welcomeEmail',
                'paymentConfirmations',
                'paymentFailures'
            ];
            return transactionalEmails.includes(emailType);
        }

        // Check specific preference
        return this.preferences[emailType] !== false;
    }

    /**
     * Unsubscribe from all marketing emails
     */
    async unsubscribeAll() {
        return await this.savePreferences({ unsubscribeAll: true });
    }

    /**
     * Resubscribe to emails
     */
    async resubscribe() {
        return await this.savePreferences({ unsubscribeAll: false });
    }

    /**
     * Render preferences UI
     * @param {HTMLElement} container - Container element
     */
    renderUI(container) {
        container.innerHTML = `
            <div class="email-preferences-ui">
                <h3>Email Preferences</h3>
                <p class="subtitle">Choose which emails you want to receive</p>

                <div class="preference-section">
                    <h4>📬 Product Updates</h4>
                    <label class="preference-item">
                        <input type="checkbox" id="pref-productUpdates" ${this.preferences.productUpdates ? 'checked' : ''}>
                        <span>New features and improvements</span>
                    </label>
                    <label class="preference-item">
                        <input type="checkbox" id="pref-tipsAndTricks" ${this.preferences.tipsAndTricks ? 'checked' : ''}>
                        <span>College admissions tips and strategies</span>
                    </label>
                    <label class="preference-item">
                        <input type="checkbox" id="pref-weeklyDigest" ${this.preferences.weeklyDigest ? 'checked' : ''}>
                        <span>Weekly summary of your progress</span>
                    </label>
                </div>

                <div class="preference-section">
                    <h4>🔔 Notifications</h4>
                    <label class="preference-item">
                        <input type="checkbox" id="pref-deadlineReminders" ${this.preferences.deadlineReminders ? 'checked' : ''}>
                        <span>Deadline reminders</span>
                    </label>
                    <label class="preference-item">
                        <input type="checkbox" id="pref-essayFeedbackReady" ${this.preferences.essayFeedbackReady ? 'checked' : ''}>
                        <span>Essay feedback notifications</span>
                    </label>
                    <label class="preference-item">
                        <input type="checkbox" id="pref-achievementUnlocked" ${this.preferences.achievementUnlocked ? 'checked' : ''}>
                        <span>Casino achievements and level-ups</span>
                    </label>
                    <label class="preference-item">
                        <input type="checkbox" id="pref-weeklyProgress" ${this.preferences.weeklyProgress ? 'checked' : ''}>
                        <span>Weekly progress reports</span>
                    </label>
                </div>

                <div class="preference-section">
                    <h4>💳 Payment & Account</h4>
                    <label class="preference-item disabled">
                        <input type="checkbox" checked disabled>
                        <span>Payment confirmations (required)</span>
                    </label>
                    <label class="preference-item disabled">
                        <input type="checkbox" checked disabled>
                        <span>Payment failures (required)</span>
                    </label>
                    <label class="preference-item disabled">
                        <input type="checkbox" checked disabled>
                        <span>Welcome email (required)</span>
                    </label>
                </div>

                <div class="preference-section">
                    <h4>⚙️ Advanced Settings</h4>
                    <div class="preference-item">
                        <label for="pref-digestDay">Weekly digest day:</label>
                        <select id="pref-digestDay">
                            <option value="monday" ${this.preferences.digestDay === 'monday' ? 'selected' : ''}>Monday</option>
                            <option value="wednesday" ${this.preferences.digestDay === 'wednesday' ? 'selected' : ''}>Wednesday</option>
                            <option value="friday" ${this.preferences.digestDay === 'friday' ? 'selected' : ''}>Friday</option>
                            <option value="sunday" ${this.preferences.digestDay === 'sunday' ? 'selected' : ''}>Sunday</option>
                        </select>
                    </div>
                </div>

                <div class="preference-actions">
                    <button id="save-preferences-btn" class="btn btn-primary">Save Preferences</button>
                    <button id="unsubscribe-all-btn" class="btn btn-secondary">Unsubscribe from All</button>
                </div>

                <div class="preference-note">
                    <small>Note: You'll still receive important transactional emails (payments, account security).</small>
                </div>
            </div>
        `;

        // Add event listeners
        this.attachEventListeners(container);
    }

    /**
     * Attach event listeners to UI
     */
    attachEventListeners(container) {
        const saveBtn = container.querySelector('#save-preferences-btn');
        const unsubscribeBtn = container.querySelector('#unsubscribe-all-btn');

        saveBtn.addEventListener('click', async () => {
            await this.handleSave(container);
        });

        unsubscribeBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to unsubscribe from all marketing emails?')) {
                await this.unsubscribeAll();
                this.showToast('Unsubscribed from all marketing emails', 'success');
            }
        });
    }

    /**
     * Handle save button click
     */
    async handleSave(container) {
        const newPreferences = {
            productUpdates: container.querySelector('#pref-productUpdates').checked,
            tipsAndTricks: container.querySelector('#pref-tipsAndTricks').checked,
            weeklyDigest: container.querySelector('#pref-weeklyDigest').checked,
            deadlineReminders: container.querySelector('#pref-deadlineReminders').checked,
            essayFeedbackReady: container.querySelector('#pref-essayFeedbackReady').checked,
            achievementUnlocked: container.querySelector('#pref-achievementUnlocked').checked,
            weeklyProgress: container.querySelector('#pref-weeklyProgress').checked,
            digestDay: container.querySelector('#pref-digestDay').value
        };

        try {
            await this.savePreferences(newPreferences);
            this.showToast('Email preferences saved!', 'success');
        } catch (error) {
            this.showToast('Failed to save preferences', 'error');
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // Check if ToastNotification exists (from casino module)
        if (window.ToastNotification) {
            const toast = new window.ToastNotification();
            toast.show(message, type === 'success' ? 'success' : 'error');
        } else {
            // Fallback: Simple alert
            alert(message);
        }
    }
}

// Add CSS styles
const styles = document.createElement('style');
styles.textContent = `
    .email-preferences-ui {
        max-width: 600px;
        margin: 0 auto;
    }

    .email-preferences-ui h3 {
        color: var(--text-primary, #333);
        margin-bottom: 0.5rem;
    }

    .email-preferences-ui .subtitle {
        color: var(--text-secondary, #666);
        margin-bottom: 2rem;
    }

    .preference-section {
        background: var(--secondary-bg, #f9fafb);
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
    }

    .preference-section h4 {
        margin: 0 0 1rem 0;
        color: var(--accent-color, #a07bcc);
        font-size: 1.1rem;
    }

    .preference-item {
        display: flex;
        align-items: center;
        padding: 0.75rem 0;
        cursor: pointer;
        transition: background 0.2s;
    }

    .preference-item:hover:not(.disabled) {
        background: rgba(160, 123, 204, 0.1);
        border-radius: 4px;
        padding-left: 0.5rem;
    }

    .preference-item.disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .preference-item input[type="checkbox"] {
        margin-right: 0.75rem;
        width: 18px;
        height: 18px;
        cursor: pointer;
    }

    .preference-item select {
        margin-left: 0.5rem;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        cursor: pointer;
    }

    .preference-actions {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
    }

    .preference-actions .btn {
        flex: 1;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
    }

    .preference-actions .btn-primary {
        background: linear-gradient(135deg, #2a357a 0%, #a07bcc 100%);
        color: white;
    }

    .preference-actions .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(160, 123, 204, 0.3);
    }

    .preference-actions .btn-secondary {
        background: #e5e7eb;
        color: #333;
    }

    .preference-actions .btn-secondary:hover {
        background: #d1d5db;
    }

    .preference-note {
        margin-top: 1.5rem;
        padding: 1rem;
        background: #fef3c7;
        border-left: 4px solid #f59e0b;
        border-radius: 4px;
    }

    .preference-note small {
        color: #92400e;
    }

    [data-theme="dark"] .preference-section {
        background: var(--accent-bg, #1a1a1a);
    }

    [data-theme="dark"] .preference-item select {
        background: #2a2a2a;
        color: white;
        border-color: #444;
    }

    [data-theme="dark"] .preference-note {
        background: #422006;
        border-left-color: #f59e0b;
    }

    [data-theme="dark"] .preference-note small {
        color: #fbbf24;
    }
`;
document.head.appendChild(styles);

// Export singleton
const emailPreferences = new EmailPreferences();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = emailPreferences;
} else {
    window.emailPreferences = emailPreferences;
}
