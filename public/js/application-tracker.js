/**
 * Application Tracker - Full Featured Modal
 * Allows users to add, edit, track, and manage college applications
 */

class ApplicationTracker {
    constructor(db, userId) {
        this.db = db;
        this.userId = userId;
        this.applications = [];
        this.modal = null;
    }

    /**
     * Open the application tracker modal
     */
    async open() {
        await this.loadApplications();
        this.renderModal();
    }

    /**
     * Load all applications from Firestore
     */
    async loadApplications() {
        try {
            const { collection, query, where, getDocs, orderBy } = await import('https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js');

            const appsQuery = query(
                collection(this.db, 'applications'),
                where('userId', '==', this.userId),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(appsQuery);
            this.applications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log(`✅ Loaded ${this.applications.length} applications`);
        } catch (error) {
            console.error('Error loading applications:', error);
            this.applications = [];
        }
    }

    /**
     * Render the application tracker modal
     */
    renderModal() {
        // Remove existing modal if present
        if (this.modal) {
            this.modal.remove();
        }

        // Create modal element
        this.modal = document.createElement('div');
        this.modal.className = 'app-tracker-modal';
        this.modal.innerHTML = `
            <div class="app-tracker-overlay" onclick="window.applicationTracker.close()"></div>
            <div class="app-tracker-content">
                <div class="app-tracker-header">
                    <h2>
                        <i class="fas fa-graduation-cap"></i>
                        College Application Tracker
                    </h2>
                    <button class="app-tracker-close" onclick="window.applicationTracker.close()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="app-tracker-stats">
                    ${this.renderStats()}
                </div>

                <div class="app-tracker-actions">
                    <button class="btn-primary" onclick="window.applicationTracker.showAddForm()">
                        <i class="fas fa-plus"></i>
                        Add New Application
                    </button>
                    <div class="app-tracker-filters">
                        <select id="statusFilter" onchange="window.applicationTracker.filterApplications()">
                            <option value="all">All Applications</option>
                            <option value="planning">Planning</option>
                            <option value="in_progress">In Progress</option>
                            <option value="submitted">Submitted</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                            <option value="waitlisted">Waitlisted</option>
                        </select>
                        <select id="typeFilter" onchange="window.applicationTracker.filterApplications()">
                            <option value="all">All Types</option>
                            <option value="ED">Early Decision</option>
                            <option value="EA">Early Action</option>
                            <option value="RD">Regular Decision</option>
                            <option value="REA">Restrictive EA</option>
                        </select>
                    </div>
                </div>

                <div class="app-tracker-grid" id="applicationGrid">
                    ${this.renderApplications()}
                </div>

                ${this.applications.length === 0 ? this.renderEmptyState() : ''}
            </div>
        `;

        document.body.appendChild(this.modal);

        // Trigger animation
        setTimeout(() => this.modal.classList.add('show'), 10);
    }

    /**
     * Render statistics summary
     */
    renderStats() {
        const stats = {
            total: this.applications.length,
            planning: this.applications.filter(a => a.status === 'planning').length,
            inProgress: this.applications.filter(a => a.status === 'in_progress').length,
            submitted: this.applications.filter(a => a.status === 'submitted').length,
            accepted: this.applications.filter(a => a.status === 'accepted').length,
            rejected: this.applications.filter(a => a.status === 'rejected').length,
            waitlisted: this.applications.filter(a => a.status === 'waitlisted').length
        };

        return `
            <div class="stat-mini">
                <div class="stat-mini-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <i class="fas fa-list"></i>
                </div>
                <div class="stat-mini-content">
                    <div class="stat-mini-value">${stats.total}</div>
                    <div class="stat-mini-label">Total</div>
                </div>
            </div>
            <div class="stat-mini">
                <div class="stat-mini-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                    <i class="fas fa-hourglass-half"></i>
                </div>
                <div class="stat-mini-content">
                    <div class="stat-mini-value">${stats.inProgress}</div>
                    <div class="stat-mini-label">In Progress</div>
                </div>
            </div>
            <div class="stat-mini">
                <div class="stat-mini-icon" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
                    <i class="fas fa-paper-plane"></i>
                </div>
                <div class="stat-mini-content">
                    <div class="stat-mini-value">${stats.submitted}</div>
                    <div class="stat-mini-label">Submitted</div>
                </div>
            </div>
            <div class="stat-mini">
                <div class="stat-mini-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-mini-content">
                    <div class="stat-mini-value">${stats.accepted}</div>
                    <div class="stat-mini-label">Accepted</div>
                </div>
            </div>
        `;
    }

    /**
     * Render all applications as cards
     */
    renderApplications() {
        if (this.applications.length === 0) {
            return '';
        }

        return this.applications.map(app => `
            <div class="app-card" data-id="${app.id}" data-status="${app.status}" data-type="${app.applicationType || 'RD'}">
                <div class="app-card-header">
                    <h3>${app.collegeName}</h3>
                    <div class="app-card-badges">
                        <span class="badge badge-${app.status || 'planning'}">${this.formatStatus(app.status)}</span>
                        <span class="badge badge-type">${app.applicationType || 'RD'}</span>
                    </div>
                </div>

                <div class="app-card-body">
                    <div class="app-detail">
                        <i class="fas fa-calendar"></i>
                        <span>Deadline: ${app.deadline ? new Date(app.deadline).toLocaleDateString() : 'Not set'}</span>
                    </div>
                    <div class="app-detail">
                        <i class="fas fa-dollar-sign"></i>
                        <span>App Fee: $${app.applicationFee || '0'}</span>
                    </div>
                    <div class="app-detail">
                        <i class="fas fa-pen"></i>
                        <span>Essays: ${app.essaysCompleted || 0}/${app.essaysRequired || 0}</span>
                    </div>

                    <div class="app-progress">
                        <div class="app-progress-label">
                            <span>Progress</span>
                            <span>${app.progress || 0}%</span>
                        </div>
                        <div class="app-progress-bar">
                            <div class="app-progress-fill" style="width: ${app.progress || 0}%"></div>
                        </div>
                    </div>

                    ${app.notes ? `
                    <div class="app-notes">
                        <i class="fas fa-sticky-note"></i>
                        <span>${app.notes}</span>
                    </div>
                    ` : ''}
                </div>

                <div class="app-card-footer">
                    <button class="btn-secondary btn-sm" onclick="window.applicationTracker.editApplication('${app.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-secondary btn-sm" onclick="window.applicationTracker.updateStatus('${app.id}')">
                        <i class="fas fa-sync"></i> Update Status
                    </button>
                    <button class="btn-secondary btn-sm btn-danger" onclick="window.applicationTracker.deleteApplication('${app.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render empty state when no applications
     */
    renderEmptyState() {
        return `
            <div class="app-tracker-empty">
                <i class="fas fa-university"></i>
                <h3>No Applications Yet</h3>
                <p>Start tracking your college applications to stay organized and on top of deadlines.</p>
                <button class="btn-primary" onclick="window.applicationTracker.showAddForm()">
                    <i class="fas fa-plus"></i>
                    Add Your First Application
                </button>
            </div>
        `;
    }

    /**
     * Show add application form
     */
    showAddForm() {
        const formHtml = `
            <div class="app-form-overlay" onclick="this.remove()"></div>
            <div class="app-form-modal">
                <h3>
                    <i class="fas fa-plus"></i>
                    Add New Application
                </h3>
                <form id="addApplicationForm" onsubmit="window.applicationTracker.saveApplication(event)">
                    <div class="form-group">
                        <label for="collegeName">College Name *</label>
                        <input type="text" id="collegeName" required placeholder="e.g., Harvard University">
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="applicationType">Application Type *</label>
                            <select id="applicationType" required>
                                <option value="ED">Early Decision (ED)</option>
                                <option value="EA">Early Action (EA)</option>
                                <option value="RD" selected>Regular Decision (RD)</option>
                                <option value="REA">Restrictive EA</option>
                                <option value="Rolling">Rolling</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="deadline">Application Deadline *</label>
                            <input type="date" id="deadline" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="applicationFee">Application Fee ($)</label>
                            <input type="number" id="applicationFee" placeholder="0" min="0">
                        </div>

                        <div class="form-group">
                            <label for="essaysRequired">Essays Required</label>
                            <input type="number" id="essaysRequired" placeholder="0" min="0">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="status">Status</label>
                        <select id="status">
                            <option value="planning" selected>Planning</option>
                            <option value="in_progress">In Progress</option>
                            <option value="submitted">Submitted</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                            <option value="waitlisted">Waitlisted</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="notes">Notes</label>
                        <textarea id="notes" rows="3" placeholder="Add any notes or reminders..."></textarea>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.app-form-modal').previousElementSibling.click()">
                            Cancel
                        </button>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-save"></i>
                            Save Application
                        </button>
                    </div>
                </form>
            </div>
        `;

        const formContainer = document.createElement('div');
        formContainer.innerHTML = formHtml;
        document.body.appendChild(formContainer);
    }

    /**
     * Save application to Firestore
     */
    async saveApplication(event) {
        event.preventDefault();

        const formData = {
            collegeName: document.getElementById('collegeName').value,
            applicationType: document.getElementById('applicationType').value,
            deadline: document.getElementById('deadline').value,
            applicationFee: parseInt(document.getElementById('applicationFee').value) || 0,
            essaysRequired: parseInt(document.getElementById('essaysRequired').value) || 0,
            essaysCompleted: 0,
            status: document.getElementById('status').value,
            notes: document.getElementById('notes').value,
            userId: this.userId,
            progress: 10, // Initial progress
            createdAt: new Date()
        };

        try {
            const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js');

            await addDoc(collection(this.db, 'applications'), formData);

            // Close form
            document.querySelector('.app-form-overlay').click();

            // Refresh modal
            await this.open();

            // Refresh dashboard if loader exists
            if (window.dashboardLoader) {
                await window.dashboardLoader.refresh();
            }

            if (typeof showToast === 'function') {
                showToast('Application added successfully!', 'success');
            }
        } catch (error) {
            console.error('Error saving application:', error);
            if (typeof showToast === 'function') {
                showToast('Failed to save application. Please try again.', 'error');
            }
        }
    }

    /**
     * Edit existing application
     */
    async editApplication(appId) {
        const app = this.applications.find(a => a.id === appId);
        if (!app) return;

        const formHtml = `
            <div class="app-form-overlay" onclick="this.remove()"></div>
            <div class="app-form-modal">
                <h3>
                    <i class="fas fa-edit"></i>
                    Edit Application
                </h3>
                <form id="editApplicationForm" onsubmit="window.applicationTracker.updateApplication(event, '${appId}')">
                    <div class="form-group">
                        <label for="editCollegeName">College Name *</label>
                        <input type="text" id="editCollegeName" required value="${app.collegeName}">
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="editApplicationType">Application Type *</label>
                            <select id="editApplicationType" required>
                                <option value="ED" ${app.applicationType === 'ED' ? 'selected' : ''}>Early Decision</option>
                                <option value="EA" ${app.applicationType === 'EA' ? 'selected' : ''}>Early Action</option>
                                <option value="RD" ${app.applicationType === 'RD' ? 'selected' : ''}>Regular Decision</option>
                                <option value="REA" ${app.applicationType === 'REA' ? 'selected' : ''}>Restrictive EA</option>
                                <option value="Rolling" ${app.applicationType === 'Rolling' ? 'selected' : ''}>Rolling</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="editDeadline">Deadline *</label>
                            <input type="date" id="editDeadline" required value="${app.deadline}">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="editApplicationFee">Application Fee ($)</label>
                            <input type="number" id="editApplicationFee" value="${app.applicationFee || 0}" min="0">
                        </div>

                        <div class="form-group">
                            <label for="editEssaysRequired">Essays Required</label>
                            <input type="number" id="editEssaysRequired" value="${app.essaysRequired || 0}" min="0">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="editEssaysCompleted">Essays Completed</label>
                            <input type="number" id="editEssaysCompleted" value="${app.essaysCompleted || 0}" min="0">
                        </div>

                        <div class="form-group">
                            <label for="editProgress">Progress (%)</label>
                            <input type="number" id="editProgress" value="${app.progress || 0}" min="0" max="100">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="editStatus">Status</label>
                        <select id="editStatus">
                            <option value="planning" ${app.status === 'planning' ? 'selected' : ''}>Planning</option>
                            <option value="in_progress" ${app.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                            <option value="submitted" ${app.status === 'submitted' ? 'selected' : ''}>Submitted</option>
                            <option value="accepted" ${app.status === 'accepted' ? 'selected' : ''}>Accepted</option>
                            <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                            <option value="waitlisted" ${app.status === 'waitlisted' ? 'selected' : ''}>Waitlisted</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="editNotes">Notes</label>
                        <textarea id="editNotes" rows="3">${app.notes || ''}</textarea>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.app-form-modal').previousElementSibling.click()">
                            Cancel
                        </button>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-save"></i>
                            Update Application
                        </button>
                    </div>
                </form>
            </div>
        `;

        const formContainer = document.createElement('div');
        formContainer.innerHTML = formHtml;
        document.body.appendChild(formContainer);
    }

    /**
     * Update existing application
     */
    async updateApplication(event, appId) {
        event.preventDefault();

        const updates = {
            collegeName: document.getElementById('editCollegeName').value,
            applicationType: document.getElementById('editApplicationType').value,
            deadline: document.getElementById('editDeadline').value,
            applicationFee: parseInt(document.getElementById('editApplicationFee').value) || 0,
            essaysRequired: parseInt(document.getElementById('editEssaysRequired').value) || 0,
            essaysCompleted: parseInt(document.getElementById('editEssaysCompleted').value) || 0,
            progress: parseInt(document.getElementById('editProgress').value) || 0,
            status: document.getElementById('editStatus').value,
            notes: document.getElementById('editNotes').value,
            updatedAt: new Date()
        };

        try {
            const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js');

            await updateDoc(doc(this.db, 'applications', appId), updates);

            // Close form
            document.querySelector('.app-form-overlay').click();

            // Refresh modal
            await this.open();

            // Refresh dashboard
            if (window.dashboardLoader) {
                await window.dashboardLoader.refresh();
            }

            if (typeof showToast === 'function') {
                showToast('Application updated successfully!', 'success');
            }
        } catch (error) {
            console.error('Error updating application:', error);
            if (typeof showToast === 'function') {
                showToast('Failed to update application. Please try again.', 'error');
            }
        }
    }

    /**
     * Quick update status
     */
    async updateStatus(appId) {
        const app = this.applications.find(a => a.id === appId);
        if (!app) return;

        const statusOptions = [
            { value: 'planning', label: 'Planning', icon: 'fa-lightbulb' },
            { value: 'in_progress', label: 'In Progress', icon: 'fa-hourglass-half' },
            { value: 'submitted', label: 'Submitted', icon: 'fa-paper-plane' },
            { value: 'accepted', label: 'Accepted', icon: 'fa-check-circle' },
            { value: 'rejected', label: 'Rejected', icon: 'fa-times-circle' },
            { value: 'waitlisted', label: 'Waitlisted', icon: 'fa-clock' }
        ];

        const optionsHtml = statusOptions.map(opt => `
            <button class="status-option ${app.status === opt.value ? 'active' : ''}"
                    onclick="window.applicationTracker.setStatus('${appId}', '${opt.value}')">
                <i class="fas ${opt.icon}"></i>
                ${opt.label}
            </button>
        `).join('');

        const modal = `
            <div class="app-form-overlay" onclick="this.remove()"></div>
            <div class="app-form-modal status-modal">
                <h3>Update Status: ${app.collegeName}</h3>
                <div class="status-options">
                    ${optionsHtml}
                </div>
            </div>
        `;

        const container = document.createElement('div');
        container.innerHTML = modal;
        document.body.appendChild(container);
    }

    /**
     * Set application status
     */
    async setStatus(appId, status) {
        try {
            const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js');

            await updateDoc(doc(this.db, 'applications', appId), {
                status: status,
                updatedAt: new Date()
            });

            // Close modal
            document.querySelector('.app-form-overlay').click();

            // Refresh
            await this.open();

            if (window.dashboardLoader) {
                await window.dashboardLoader.refresh();
            }

            if (typeof showToast === 'function') {
                showToast('Status updated successfully!', 'success');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            if (typeof showToast === 'function') {
                showToast('Failed to update status.', 'error');
            }
        }
    }

    /**
     * Delete application
     */
    async deleteApplication(appId) {
        const app = this.applications.find(a => a.id === appId);
        if (!app) return;

        if (!confirm(`Are you sure you want to delete ${app.collegeName}? This cannot be undone.`)) {
            return;
        }

        try {
            const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js');

            await deleteDoc(doc(this.db, 'applications', appId));

            // Refresh modal
            await this.open();

            // Refresh dashboard
            if (window.dashboardLoader) {
                await window.dashboardLoader.refresh();
            }

            if (typeof showToast === 'function') {
                showToast('Application deleted successfully.', 'success');
            }
        } catch (error) {
            console.error('Error deleting application:', error);
            if (typeof showToast === 'function') {
                showToast('Failed to delete application.', 'error');
            }
        }
    }

    /**
     * Filter applications
     */
    filterApplications() {
        const statusFilter = document.getElementById('statusFilter').value;
        const typeFilter = document.getElementById('typeFilter').value;

        const cards = document.querySelectorAll('.app-card');

        cards.forEach(card => {
            const status = card.getAttribute('data-status');
            const type = card.getAttribute('data-type');

            const statusMatch = statusFilter === 'all' || status === statusFilter;
            const typeMatch = typeFilter === 'all' || type === typeFilter;

            if (statusMatch && typeMatch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    /**
     * Format status for display
     */
    formatStatus(status) {
        const statusMap = {
            'planning': 'Planning',
            'in_progress': 'In Progress',
            'submitted': 'Submitted',
            'accepted': 'Accepted',
            'rejected': 'Rejected',
            'waitlisted': 'Waitlisted'
        };
        return statusMap[status] || 'Unknown';
    }

    /**
     * Close the modal
     */
    close() {
        if (this.modal) {
            this.modal.classList.remove('show');
            setTimeout(() => {
                this.modal.remove();
                this.modal = null;
            }, 300);
        }
    }
}

// Export to global scope
window.ApplicationTracker = ApplicationTracker;

console.log('📦 Application Tracker loaded');
