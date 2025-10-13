/**
 * Scholarship Tracker
 * Manages saved scholarships, application status tracking, and favorites
 */

class ScholarshipTracker {
    constructor() {
        this.savedScholarships = [];
        this.userId = null;
        this.db = null;
        this.initialized = false;
    }

    /**
     * Initialize the tracker with Firebase
     */
    async initialize(userId) {
        try {
            this.userId = userId;
            
            // Get Firebase instance
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                this.db = firebase.firestore();
                await this.loadSavedScholarships();
                this.initialized = true;
                console.log('✅ Scholarship Tracker initialized');
                return true;
            } else {
                console.warn('⚠️ Firebase not available, using local storage');
                this.loadFromLocalStorage();
                this.initialized = true;
                return true;
            }
        } catch (error) {
            console.error('❌ Error initializing Scholarship Tracker:', error);
            this.loadFromLocalStorage();
            return false;
        }
    }

    /**
     * Save a scholarship to favorites
     */
    async saveScholarship(scholarship, status = 'saved') {
        try {
            const savedItem = {
                id: scholarship.id,
                scholarshipData: scholarship,
                status: status, // saved, in_progress, submitted, awarded, rejected
                savedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                notes: '',
                applicationDeadline: scholarship.deadline,
                reminders: this.generateDefaultReminders(scholarship.deadline),
                checklist: this.generateDefaultChecklist(scholarship),
                documents: []
            };

            if (this.db && this.userId) {
                // Save to Firebase
                await this.db.collection('users')
                    .doc(this.userId)
                    .collection('savedScholarships')
                    .doc(scholarship.id)
                    .set(savedItem);
            } else {
                // Save to local storage
                this.savedScholarships.push(savedItem);
                this.saveToLocalStorage();
            }

            await this.loadSavedScholarships();
            this.showNotification(`✅ Saved "${scholarship.title}" to your library!`);
            this.updateUI();
            return savedItem;
        } catch (error) {
            console.error('Error saving scholarship:', error);
            this.showNotification('❌ Failed to save scholarship', 'error');
            throw error;
        }
    }

    /**
     * Remove a scholarship from saved list
     */
    async removeScholarship(scholarshipId) {
        try {
            if (this.db && this.userId) {
                await this.db.collection('users')
                    .doc(this.userId)
                    .collection('savedScholarships')
                    .doc(scholarshipId)
                    .delete();
            } else {
                this.savedScholarships = this.savedScholarships.filter(s => s.id !== scholarshipId);
                this.saveToLocalStorage();
            }

            await this.loadSavedScholarships();
            this.showNotification('✅ Removed from your library');
            this.updateUI();
        } catch (error) {
            console.error('Error removing scholarship:', error);
            this.showNotification('❌ Failed to remove scholarship', 'error');
        }
    }

    /**
     * Update scholarship status
     */
    async updateStatus(scholarshipId, newStatus) {
        try {
            const statusMessages = {
                'saved': '💾 Saved for later',
                'in_progress': '📝 Application in progress',
                'submitted': '✅ Application submitted!',
                'awarded': '🎉 Congratulations! Scholarship awarded!',
                'rejected': '❌ Scholarship not awarded'
            };

            if (this.db && this.userId) {
                await this.db.collection('users')
                    .doc(this.userId)
                    .collection('savedScholarships')
                    .doc(scholarshipId)
                    .update({
                        status: newStatus,
                        updatedAt: new Date().toISOString()
                    });
            } else {
                const scholarship = this.savedScholarships.find(s => s.id === scholarshipId);
                if (scholarship) {
                    scholarship.status = newStatus;
                    scholarship.updatedAt = new Date().toISOString();
                    this.saveToLocalStorage();
                }
            }

            await this.loadSavedScholarships();
            this.showNotification(statusMessages[newStatus] || '✅ Status updated');
            this.updateUI();
        } catch (error) {
            console.error('Error updating status:', error);
            this.showNotification('❌ Failed to update status', 'error');
        }
    }

    /**
     * Update notes for a scholarship
     */
    async updateNotes(scholarshipId, notes) {
        try {
            if (this.db && this.userId) {
                await this.db.collection('users')
                    .doc(this.userId)
                    .collection('savedScholarships')
                    .doc(scholarshipId)
                    .update({
                        notes: notes,
                        updatedAt: new Date().toISOString()
                    });
            } else {
                const scholarship = this.savedScholarships.find(s => s.id === scholarshipId);
                if (scholarship) {
                    scholarship.notes = notes;
                    scholarship.updatedAt = new Date().toISOString();
                    this.saveToLocalStorage();
                }
            }

            await this.loadSavedScholarships();
            this.showNotification('✅ Notes updated');
        } catch (error) {
            console.error('Error updating notes:', error);
        }
    }

    /**
     * Update checklist item
     */
    async updateChecklistItem(scholarshipId, itemIndex, completed) {
        try {
            const scholarship = this.savedScholarships.find(s => s.id === scholarshipId);
            if (!scholarship) return;

            scholarship.checklist[itemIndex].completed = completed;
            scholarship.checklist[itemIndex].completedAt = completed ? new Date().toISOString() : null;

            if (this.db && this.userId) {
                await this.db.collection('users')
                    .doc(this.userId)
                    .collection('savedScholarships')
                    .doc(scholarshipId)
                    .update({
                        checklist: scholarship.checklist,
                        updatedAt: new Date().toISOString()
                    });
            } else {
                this.saveToLocalStorage();
            }

            await this.loadSavedScholarships();
            this.updateUI();
        } catch (error) {
            console.error('Error updating checklist:', error);
        }
    }

    /**
     * Load saved scholarships
     */
    async loadSavedScholarships() {
        try {
            if (this.db && this.userId) {
                const snapshot = await this.db.collection('users')
                    .doc(this.userId)
                    .collection('savedScholarships')
                    .get();

                this.savedScholarships = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } else {
                this.loadFromLocalStorage();
            }

            return this.savedScholarships;
        } catch (error) {
            console.error('Error loading scholarships:', error);
            this.loadFromLocalStorage();
            return this.savedScholarships;
        }
    }

    /**
     * Check if a scholarship is saved
     */
    isSaved(scholarshipId) {
        return this.savedScholarships.some(s => s.id === scholarshipId);
    }

    /**
     * Get saved scholarship data
     */
    getSavedScholarship(scholarshipId) {
        return this.savedScholarships.find(s => s.id === scholarshipId);
    }

    /**
     * Get statistics
     */
    getStatistics() {
        const stats = {
            total: this.savedScholarships.length,
            saved: this.savedScholarships.filter(s => s.status === 'saved').length,
            inProgress: this.savedScholarships.filter(s => s.status === 'in_progress').length,
            submitted: this.savedScholarships.filter(s => s.status === 'submitted').length,
            awarded: this.savedScholarships.filter(s => s.status === 'awarded').length,
            totalPotential: this.calculateTotalPotential(),
            totalAwarded: this.calculateTotalAwarded(),
            upcomingDeadlines: this.getUpcomingDeadlines(7)
        };

        return stats;
    }

    /**
     * Calculate total potential earnings
     */
    calculateTotalPotential() {
        return this.savedScholarships.reduce((total, s) => {
            const amount = typeof s.scholarshipData.amount === 'number' 
                ? s.scholarshipData.amount 
                : 0;
            return total + amount;
        }, 0);
    }

    /**
     * Calculate total awarded amount
     */
    calculateTotalAwarded() {
        return this.savedScholarships
            .filter(s => s.status === 'awarded')
            .reduce((total, s) => {
                const amount = typeof s.scholarshipData.amount === 'number' 
                    ? s.scholarshipData.amount 
                    : 0;
                return total + amount;
            }, 0);
    }

    /**
     * Get upcoming deadlines
     */
    getUpcomingDeadlines(days = 30) {
        const now = new Date();
        const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        return this.savedScholarships
            .filter(s => {
                const deadline = new Date(s.applicationDeadline);
                return deadline >= now && deadline <= futureDate;
            })
            .sort((a, b) => new Date(a.applicationDeadline) - new Date(b.applicationDeadline));
    }

    /**
     * Generate default reminders for a deadline
     */
    generateDefaultReminders(deadline) {
        const deadlineDate = new Date(deadline);
        const reminders = [];

        // 30 days before
        const thirtyDays = new Date(deadlineDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (thirtyDays > new Date()) {
            reminders.push({
                type: 'email',
                date: thirtyDays.toISOString(),
                sent: false,
                message: '30 days until deadline'
            });
        }

        // 14 days before
        const fourteenDays = new Date(deadlineDate.getTime() - 14 * 24 * 60 * 60 * 1000);
        if (fourteenDays > new Date()) {
            reminders.push({
                type: 'email',
                date: fourteenDays.toISOString(),
                sent: false,
                message: '2 weeks until deadline'
            });
        }

        // 7 days before
        const sevenDays = new Date(deadlineDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (sevenDays > new Date()) {
            reminders.push({
                type: 'email',
                date: sevenDays.toISOString(),
                sent: false,
                message: '1 week until deadline - URGENT!'
            });
        }

        // 1 day before
        const oneDay = new Date(deadlineDate.getTime() - 1 * 24 * 60 * 60 * 1000);
        if (oneDay > new Date()) {
            reminders.push({
                type: 'notification',
                date: oneDay.toISOString(),
                sent: false,
                message: 'FINAL REMINDER: Deadline tomorrow!'
            });
        }

        return reminders;
    }

    /**
     * Generate default checklist
     */
    generateDefaultChecklist(scholarship) {
        const checklist = [
            { task: 'Review eligibility requirements', completed: false, completedAt: null },
            { task: 'Prepare personal statement/essay', completed: false, completedAt: null },
            { task: 'Request letters of recommendation', completed: false, completedAt: null },
            { task: 'Gather transcripts and test scores', completed: false, completedAt: null },
            { task: 'Complete application form', completed: false, completedAt: null },
            { task: 'Proofread all materials', completed: false, completedAt: null },
            { task: 'Submit application', completed: false, completedAt: null }
        ];

        // Add custom items based on eligibility
        if (scholarship.eligibility.some(e => e.toLowerCase().includes('financial'))) {
            checklist.splice(3, 0, {
                task: 'Prepare financial documents (FAFSA, tax returns)',
                completed: false,
                completedAt: null
            });
        }

        return checklist;
    }

    /**
     * Local storage methods
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem('savedScholarships', JSON.stringify(this.savedScholarships));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('savedScholarships');
            this.savedScholarships = saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            this.savedScholarships = [];
        }
    }

    /**
     * Update UI elements
     */
    updateUI() {
        // Update save buttons
        document.querySelectorAll('.scholarship-save-btn').forEach(btn => {
            const scholarshipId = btn.dataset.scholarshipId;
            const isSaved = this.isSaved(scholarshipId);
            
            btn.innerHTML = isSaved 
                ? '<i class="fas fa-bookmark"></i> Saved'
                : '<i class="far fa-bookmark"></i> Save';
            
            btn.classList.toggle('saved', isSaved);
        });

        // Update statistics display
        this.updateStatsDisplay();
        
        // Trigger custom event for other components
        window.dispatchEvent(new CustomEvent('scholarshipsUpdated', {
            detail: { scholarships: this.savedScholarships }
        }));
    }

    /**
     * Update statistics display
     */
    updateStatsDisplay() {
        const stats = this.getStatistics();

        // Update total potential
        const potentialEl = document.getElementById('totalPotentialEarnings');
        if (potentialEl) {
            potentialEl.textContent = `$${stats.totalPotential.toLocaleString()}`;
        }

        // Update saved count
        const savedCountEl = document.getElementById('savedScholarshipsCount');
        if (savedCountEl) {
            savedCountEl.textContent = stats.total;
        }

        // Update awarded amount
        const awardedEl = document.getElementById('totalAwarded');
        if (awardedEl) {
            awardedEl.textContent = `$${stats.totalAwarded.toLocaleString()}`;
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `scholarship-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Export to calendar (iCal format)
     */
    exportToCalendar(scholarshipId) {
        const scholarship = this.getSavedScholarship(scholarshipId);
        if (!scholarship) return;

        const event = this.generateICalEvent(scholarship);
        const blob = new Blob([event], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${scholarship.scholarshipData.title.replace(/\s+/g, '_')}_deadline.ics`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('✅ Calendar event downloaded!');
    }

    /**
     * Generate iCal event
     */
    generateICalEvent(scholarship) {
        const deadline = new Date(scholarship.applicationDeadline);
        const formatDate = (date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//College Climb//Scholarship Tracker//EN
BEGIN:VEVENT
UID:${scholarship.id}@collegeclimb.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(deadline)}
SUMMARY:${scholarship.scholarshipData.title} - Application Deadline
DESCRIPTION:Scholarship: ${scholarship.scholarshipData.title}\\nOrganization: ${scholarship.scholarshipData.organization}\\nAmount: ${scholarship.scholarshipData.amount}\\nApplication URL: ${scholarship.scholarshipData.applicationUrl}
LOCATION:Online
BEGIN:VALARM
TRIGGER:-P7D
DESCRIPTION:1 week until ${scholarship.scholarshipData.title} deadline
ACTION:DISPLAY
END:VALARM
BEGIN:VALARM
TRIGGER:-P1D
DESCRIPTION:1 day until ${scholarship.scholarshipData.title} deadline
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;
    }
}

// Initialize global instance
window.scholarshipTracker = new ScholarshipTracker();

// Auto-initialize when Firebase auth is ready
if (typeof firebase !== 'undefined') {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            window.scholarshipTracker.initialize(user.uid);
        }
    });
} else {
    // Initialize without Firebase
    window.scholarshipTracker.initialize(null);
}
