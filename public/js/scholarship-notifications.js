/**
 * Scholarship Smart Notifications
 * Manages deadline reminders, calendar integration, and email notifications
 */

class ScholarshipNotifications {
    constructor() {
        this.notifications = [];
        this.userId = null;
        this.db = null;
        this.checkInterval = null;
        this.emailEnabled = false;
    }

    /**
     * Initialize notifications system
     */
    async initialize(userId) {
        try {
            this.userId = userId;

            if (typeof firebase !== 'undefined' && firebase.firestore) {
                this.db = firebase.firestore();
            }

            // Request notification permission
            await this.requestNotificationPermission();

            // Start checking for due notifications
            this.startNotificationChecker();

            // Load user notification preferences
            await this.loadPreferences();

            console.log('✅ Smart Notifications initialized');
            return true;
        } catch (error) {
            console.error('❌ Error initializing notifications:', error);
            return false;
        }
    }

    /**
     * Request browser notification permission
     */
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    }

    /**
     * Start checking for notifications
     */
    startNotificationChecker() {
        // Check every hour
        this.checkInterval = setInterval(() => {
            this.checkDueNotifications();
        }, 60 * 60 * 1000);

        // Check immediately
        this.checkDueNotifications();
    }

    /**
     * Check for due notifications
     */
    async checkDueNotifications() {
        if (!window.scholarshipTracker || !window.scholarshipTracker.initialized) {
            return;
        }

        const savedScholarships = await window.scholarshipTracker.loadSavedScholarships();
        const now = new Date();

        for (const saved of savedScholarships) {
            if (saved.status === 'submitted' || saved.status === 'rejected') {
                continue; // Skip completed applications
            }

            const deadline = new Date(saved.applicationDeadline);
            const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

            // Send notifications based on days remaining
            if (daysUntil === 30 && !this.hasNotified(saved.id, '30days')) {
                await this.sendNotification(saved, '30 Days Until Deadline', 
                    `You have 30 days to submit your application for ${saved.scholarshipData.title}`, '30days');
            } else if (daysUntil === 14 && !this.hasNotified(saved.id, '14days')) {
                await this.sendNotification(saved, '⚠️ 2 Weeks Until Deadline', 
                    `Only 2 weeks left to apply for ${saved.scholarshipData.title}!`, '14days');
            } else if (daysUntil === 7 && !this.hasNotified(saved.id, '7days')) {
                await this.sendNotification(saved, '🔥 URGENT: 1 Week Until Deadline', 
                    `Final week to submit ${saved.scholarshipData.title}! Don't miss out on $${saved.scholarshipData.amount}`, '7days');
            } else if (daysUntil === 1 && !this.hasNotified(saved.id, '1day')) {
                await this.sendNotification(saved, '🚨 FINAL REMINDER: Deadline Tomorrow!', 
                    `Last chance! ${saved.scholarshipData.title} deadline is tomorrow!`, '1day');
            } else if (daysUntil === 0 && !this.hasNotified(saved.id, 'today')) {
                await this.sendNotification(saved, '🚨 DEADLINE TODAY!', 
                    `${saved.scholarshipData.title} is due TODAY! Submit now!`, 'today');
            }
        }
    }

    /**
     * Check if notification has been sent
     */
    hasNotified(scholarshipId, type) {
        const key = `notified_${scholarshipId}_${type}`;
        return localStorage.getItem(key) === 'true';
    }

    /**
     * Mark notification as sent
     */
    markNotified(scholarshipId, type) {
        const key = `notified_${scholarshipId}_${type}`;
        localStorage.setItem(key, 'true');
    }

    /**
     * Send notification
     */
    async sendNotification(saved, title, message, type) {
        const scholarship = saved.scholarshipData;

        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body: message,
                icon: '/images/logo.png',
                badge: '/images/badge.png',
                tag: `scholarship-${saved.id}-${type}`,
                requireInteraction: type === '1day' || type === 'today',
                actions: [
                    { action: 'view', title: 'View Details' },
                    { action: 'apply', title: 'Apply Now' }
                ]
            });

            notification.onclick = () => {
                window.focus();
                window.location.href = `/scholarships?id=${saved.id}`;
                notification.close();
            };
        }

        // In-app notification
        this.showInAppNotification(title, message, saved);

        // Email notification (if enabled)
        if (this.emailEnabled) {
            await this.sendEmailNotification(saved, title, message);
        }

        // Mark as notified
        this.markNotified(saved.id, type);

        // Log notification
        this.logNotification(saved.id, type, title, message);
    }

    /**
     * Show in-app notification
     */
    showInAppNotification(title, message, saved) {
        const notification = document.createElement('div');
        notification.className = 'smart-notification';
        notification.innerHTML = `
            <div class="notification-header">
                <i class="fas fa-bell"></i>
                <strong>${title}</strong>
                <button class="notification-close" onclick="this.closest('.smart-notification').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="notification-body">
                <p>${message}</p>
                <div class="notification-actions">
                    <button onclick="window.location.href='/scholarships?id=${saved.id}'" class="btn-secondary">
                        View Details
                    </button>
                    <a href="${saved.scholarshipData.applicationUrl}" target="_blank" class="btn-primary">
                        Apply Now
                    </a>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto-dismiss after 10 seconds unless urgent
        const isUrgent = title.includes('URGENT') || title.includes('FINAL');
        if (!isUrgent) {
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 10000);
        }
    }

    /**
     * Send email notification (requires backend)
     */
    async sendEmailNotification(saved, title, message) {
        try {
            // This would connect to your email service (SendGrid, etc.)
            const response = await fetch('/api/send-notification-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userId,
                    scholarshipId: saved.id,
                    subject: title,
                    message: message,
                    scholarship: saved.scholarshipData
                })
            });

            if (response.ok) {
                console.log('✅ Email notification sent');
            }
        } catch (error) {
            console.error('❌ Failed to send email notification:', error);
        }
    }

    /**
     * Log notification
     */
    logNotification(scholarshipId, type, title, message) {
        const log = {
            scholarshipId,
            type,
            title,
            message,
            sentAt: new Date().toISOString()
        };

        // Save to localStorage
        const logs = JSON.parse(localStorage.getItem('notificationLogs') || '[]');
        logs.push(log);
        
        // Keep only last 100 notifications
        if (logs.length > 100) {
            logs.shift();
        }
        
        localStorage.setItem('notificationLogs', JSON.stringify(logs));

        // Save to Firebase if available
        if (this.db && this.userId) {
            this.db.collection('users')
                .doc(this.userId)
                .collection('notificationLogs')
                .add(log);
        }
    }

    /**
     * Get upcoming deadlines dashboard
     */
    getUpcomingDeadlinesDashboard() {
        if (!window.scholarshipTracker || !window.scholarshipTracker.initialized) {
            return '<p>Loading deadlines...</p>';
        }

        const upcoming = window.scholarshipTracker.getUpcomingDeadlines(30);
        
        if (upcoming.length === 0) {
            return `
                <div class="empty-deadlines">
                    <i class="fas fa-calendar-check"></i>
                    <p>No upcoming deadlines</p>
                    <p class="text-muted">Save scholarships to track deadlines</p>
                </div>
            `;
        }

        const now = new Date();
        const html = upcoming.map(saved => {
            const deadline = new Date(saved.applicationDeadline);
            const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
            
            let urgencyClass = '';
            let urgencyIcon = '📅';
            if (daysUntil <= 7) {
                urgencyClass = 'urgent';
                urgencyIcon = '🔥';
            } else if (daysUntil <= 14) {
                urgencyClass = 'warning';
                urgencyIcon = '⚠️';
            }

            return `
                <div class="deadline-item ${urgencyClass}">
                    <div class="deadline-info">
                        <span class="deadline-icon">${urgencyIcon}</span>
                        <div>
                            <strong>${saved.scholarshipData.title}</strong>
                            <p class="deadline-date">${deadline.toLocaleDateString()} - ${daysUntil} days remaining</p>
                        </div>
                    </div>
                    <div class="deadline-actions">
                        <button onclick="scholarshipTracker.updateStatus('${saved.id}', 'in_progress')" 
                                class="btn-sm btn-secondary" ${saved.status === 'in_progress' ? 'disabled' : ''}>
                            ${saved.status === 'in_progress' ? '✓ In Progress' : 'Start'}
                        </button>
                        <button onclick="scholarshipNotifications.exportDeadlineToCalendar('${saved.id}')" 
                                class="btn-sm btn-outline">
                            <i class="fas fa-calendar-plus"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="deadlines-dashboard">
                <div class="deadlines-header">
                    <h3>
                        <i class="fas fa-bell"></i> Upcoming Deadlines
                    </h3>
                    <button onclick="scholarshipNotifications.exportAllDeadlines()" class="btn-sm btn-outline">
                        <i class="fas fa-download"></i> Export All
                    </button>
                </div>
                <div class="deadlines-list">
                    ${html}
                </div>
            </div>
        `;
    }

    /**
     * Export deadline to calendar
     */
    exportDeadlineToCalendar(scholarshipId) {
        if (window.scholarshipTracker) {
            window.scholarshipTracker.exportToCalendar(scholarshipId);
        }
    }

    /**
     * Export all deadlines to calendar
     */
    async exportAllDeadlines() {
        if (!window.scholarshipTracker) return;

        const upcoming = window.scholarshipTracker.getUpcomingDeadlines(90);
        
        let icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//College Climb//Scholarship Tracker//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Scholarship Deadlines
X-WR-TIMEZONE:UTC
`;

        for (const saved of upcoming) {
            const deadline = new Date(saved.applicationDeadline);
            const formatDate = (date) => {
                return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            };

            icalContent += `
BEGIN:VEVENT
UID:${saved.id}@collegeclimb.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(deadline)}
SUMMARY:${saved.scholarshipData.title} - Deadline
DESCRIPTION:Amount: ${saved.scholarshipData.amount}\\nOrganization: ${saved.scholarshipData.organization}\\nStatus: ${saved.status}
URL:${saved.scholarshipData.applicationUrl}
BEGIN:VALARM
TRIGGER:-P7D
DESCRIPTION:1 week until ${saved.scholarshipData.title} deadline
ACTION:DISPLAY
END:VALARM
BEGIN:VALARM
TRIGGER:-P1D
DESCRIPTION:1 day until ${saved.scholarshipData.title} deadline
ACTION:DISPLAY
END:VALARM
END:VEVENT
`;
        }

        icalContent += 'END:VCALENDAR';

        // Download file
        const blob = new Blob([icalContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'scholarship_deadlines.ics';
        link.click();
        URL.revokeObjectURL(url);

        this.showInAppNotification(
            '✅ Calendar Exported',
            `${upcoming.length} scholarship deadlines exported to calendar`,
            {}
        );
    }

    /**
     * Weekly digest email
     */
    async sendWeeklyDigest() {
        if (!this.emailEnabled || !window.scholarshipTracker) return;

        const upcoming = window.scholarshipTracker.getUpcomingDeadlines(7);
        const stats = window.scholarshipTracker.getStatistics();

        const digestContent = {
            upcomingCount: upcoming.length,
            totalSaved: stats.total,
            inProgress: stats.inProgress,
            potentialEarnings: stats.totalPotential,
            upcomingScholarships: upcoming.map(s => ({
                title: s.scholarshipData.title,
                deadline: s.applicationDeadline,
                amount: s.scholarshipData.amount,
                status: s.status
            }))
        };

        try {
            await fetch('/api/send-weekly-digest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userId,
                    digest: digestContent
                })
            });
        } catch (error) {
            console.error('Failed to send weekly digest:', error);
        }
    }

    /**
     * Load user notification preferences
     */
    async loadPreferences() {
        try {
            if (this.db && this.userId) {
                const doc = await this.db.collection('users')
                    .doc(this.userId)
                    .get();
                
                if (doc.exists) {
                    const data = doc.data();
                    this.emailEnabled = data.notificationPreferences?.email || false;
                }
            }

            const localPrefs = localStorage.getItem('notificationPreferences');
            if (localPrefs) {
                const prefs = JSON.parse(localPrefs);
                this.emailEnabled = prefs.email || false;
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    }

    /**
     * Update notification preferences
     */
    async updatePreferences(preferences) {
        this.emailEnabled = preferences.email || false;

        // Save to localStorage
        localStorage.setItem('notificationPreferences', JSON.stringify(preferences));

        // Save to Firebase
        if (this.db && this.userId) {
            await this.db.collection('users')
                .doc(this.userId)
                .set({
                    notificationPreferences: preferences
                }, { merge: true });
        }

        this.showInAppNotification(
            '✅ Preferences Updated',
            'Your notification preferences have been saved',
            {}
        );
    }

    /**
     * Stop notification checker
     */
    stop() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }
}

// Initialize global instance
window.scholarshipNotifications = new ScholarshipNotifications();

// Auto-initialize when Firebase auth is ready
if (typeof firebase !== 'undefined') {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            window.scholarshipNotifications.initialize(user.uid);
        }
    });
} else {
    window.scholarshipNotifications.initialize(null);
}

// Start weekly digest scheduler
setInterval(() => {
    const now = new Date();
    // Send every Monday at 9 AM
    if (now.getDay() === 1 && now.getHours() === 9) {
        window.scholarshipNotifications.sendWeeklyDigest();
    }
}, 60 * 60 * 1000); // Check every hour
