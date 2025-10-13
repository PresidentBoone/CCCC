/**
 * Scholarship Scraper Client
 * Fetches and displays scholarships from the scraping API
 */

class ScholarshipScraper {
    constructor() {
        this.apiEndpoint = '/api/scrape-scholarships';
        this.scholarships = [];
        this.filters = {
            category: 'all',
            minAmount: 0,
            upcomingOnly: true,
            search: '',
            gpa: null
        };
        this.page = 1;
        this.limit = 20;
        this.loading = false;
    }

    /**
     * Fetch scholarships from the API
     */
    async fetchScholarships(resetPage = false) {
        if (this.loading) return;

        try {
            this.loading = true;
            if (resetPage) this.page = 1;

            // Show loading state
            this.showLoading();

            // Build query parameters
            const params = new URLSearchParams({
                page: this.page,
                limit: this.limit,
                filters: JSON.stringify(this.filters)
            });

            // Fetch from API
            const response = await fetch(`${this.apiEndpoint}?${params}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch scholarships');
            }

            const data = await response.json();

            if (data.success) {
                this.scholarships = data.scholarships;
                this.displayScholarships(data);
                this.updateStats(data);
            } else {
                throw new Error(data.error || 'Unknown error');
            }

        } catch (error) {
            console.error('❌ Error fetching scholarships:', error);
            this.showError(error.message);
        } finally {
            this.loading = false;
            this.hideLoading();
        }
    }

    /**
     * Display scholarships in the UI
     */
    displayScholarships(data) {
        const container = document.getElementById('scholarshipResults');
        if (!container) return;

        if (data.scholarships.length === 0) {
            container.innerHTML = this.getEmptyState();
            return;
        }

        const html = data.scholarships.map(scholarship => this.createScholarshipCard(scholarship)).join('');
        container.innerHTML = html;

        // Update pagination
        this.updatePagination(data);
    }

    /**
     * Create scholarship card HTML
     */
    createScholarshipCard(scholarship) {
        const amountDisplay = typeof scholarship.amount === 'number' 
            ? `$${scholarship.amount.toLocaleString()}`
            : scholarship.amount;

        const deadline = new Date(scholarship.deadline);
        const daysUntil = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
        const urgencyClass = daysUntil <= 7 ? 'urgent' : daysUntil <= 30 ? 'soon' : '';

        // Calculate match score if available
        let matchScoreHTML = '';
        if (window.scholarshipMatchScore && window.scholarshipMatchScore.initialized) {
            const matchData = window.scholarshipMatchScore.calculateMatchScore(scholarship);
            const scoreClass = matchData.score >= 70 ? 'high' : matchData.score >= 55 ? 'medium' : 'low';
            matchScoreHTML = `
                <div class="match-score-badge ${scoreClass}">
                    <span class="score">${matchData.score}</span>
                    <span>Match</span>
                </div>
            `;
        }

        // Check if saved
        const isSaved = window.scholarshipTracker?.isSaved(scholarship.id);
        const saveButtonHTML = `
            <button class="scholarship-save-btn ${isSaved ? 'saved' : ''}" 
                    data-scholarship-id="${scholarship.id}"
                    onclick="scholarshipScraper.toggleSave('${scholarship.id}')">
                <i class="${isSaved ? 'fas' : 'far'} fa-bookmark"></i>
                ${isSaved ? 'Saved' : 'Save'}
            </button>
        `;

        return `
            <div class="scholarship-card" data-id="${scholarship.id}">
                <div class="scholarship-badges-row">
                    <div class="scholarship-badge ${this.getCategoryColor(scholarship.category)}">
                        ${scholarship.category}
                    </div>
                    ${urgencyClass === 'urgent' ? '<div class="scholarship-badge urgent-badge">🔥 Due Soon!</div>' : ''}
                    ${matchScoreHTML}
                </div>
                
                <div class="scholarship-header-info">
                    <h3 class="scholarship-title">${scholarship.title}</h3>
                    <p class="scholarship-organization">
                        <i class="fas fa-university"></i> ${scholarship.organization}
                    </p>
                </div>

                <div class="scholarship-amount">
                    <div class="amount-label">Award Amount</div>
                    <div class="amount-value">${amountDisplay}</div>
                    ${scholarship.renewability ? `<div class="renewability">${scholarship.renewability}</div>` : ''}
                </div>

                <div class="scholarship-description">
                    ${scholarship.description}
                </div>

                <div class="scholarship-details">
                    <div class="detail-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Deadline: ${deadline.toLocaleDateString()}</span>
                        ${daysUntil > 0 ? `<span class="days-until ${urgencyClass}">(${daysUntil} days)</span>` : ''}
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-check-circle"></i>
                        <span>Eligibility: ${scholarship.eligibility.slice(0, 2).join(', ')}${scholarship.eligibility.length > 2 ? '...' : ''}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-globe"></i>
                        <span>Source: ${scholarship.source}</span>
                    </div>
                </div>

                <div class="scholarship-actions">
                    ${saveButtonHTML}
                    <button onclick="scholarshipScraper.viewDetails('${scholarship.id}')" class="btn-secondary">
                        <i class="fas fa-info-circle"></i> View Details
                    </button>
                    <a href="${scholarship.applicationUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary">
                        <i class="fas fa-external-link-alt"></i> Apply Now
                    </a>
                </div>
            </div>
        `;
    }

    /**
     * Get category color class
     */
    getCategoryColor(category) {
        const colors = {
            'Academic Merit': 'blue',
            'Need-Based': 'green',
            'Leadership': 'purple',
            'Diversity': 'orange',
            'Career-Specific': 'teal',
            'Military': 'red',
            'Full Ride': 'gold'
        };

        for (const [key, value] of Object.entries(colors)) {
            if (category.includes(key)) return value;
        }
        return 'default';
    }

    /**
     * Update statistics display
     */
    updateStats(data) {
        // Update total scholarships count
        const totalElement = document.getElementById('totalScholarships');
        if (totalElement) {
            totalElement.textContent = data.total.toLocaleString();
        }

        // Update total value (sum of all amounts)
        const totalValue = data.scholarships.reduce((sum, s) => {
            const amount = typeof s.amount === 'number' ? s.amount : 0;
            return sum + amount;
        }, 0);

        const valueElement = document.getElementById('totalValue');
        if (valueElement) {
            valueElement.textContent = `$${totalValue.toLocaleString()}`;
        }

        // Update sources
        const sourcesElement = document.getElementById('scholarshipSources');
        if (sourcesElement && data.sources) {
            sourcesElement.textContent = data.sources.join(', ');
        }

        // Update last updated
        const updatedElement = document.getElementById('lastUpdated');
        if (updatedElement && data.lastUpdated) {
            const date = new Date(data.lastUpdated);
            updatedElement.textContent = date.toLocaleString();
        }
    }

    /**
     * Update pagination controls
     */
    updatePagination(data) {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return;

        if (data.totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let html = '<div class="pagination-controls">';
        
        // Previous button
        html += `
            <button 
                class="pagination-btn ${data.page === 1 ? 'disabled' : ''}" 
                onclick="scholarshipScraper.goToPage(${data.page - 1})"
                ${data.page === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i> Previous
            </button>
        `;

        // Page numbers
        const maxVisible = 5;
        let startPage = Math.max(1, data.page - Math.floor(maxVisible / 2));
        let endPage = Math.min(data.totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        if (startPage > 1) {
            html += `<button class="pagination-btn" onclick="scholarshipScraper.goToPage(1)">1</button>`;
            if (startPage > 2) html += `<span class="pagination-ellipsis">...</span>`;
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `
                <button 
                    class="pagination-btn ${i === data.page ? 'active' : ''}"
                    onclick="scholarshipScraper.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        if (endPage < data.totalPages) {
            if (endPage < data.totalPages - 1) html += `<span class="pagination-ellipsis">...</span>`;
            html += `<button class="pagination-btn" onclick="scholarshipScraper.goToPage(${data.totalPages})">${data.totalPages}</button>`;
        }

        // Next button
        html += `
            <button 
                class="pagination-btn ${data.page === data.totalPages ? 'disabled' : ''}"
                onclick="scholarshipScraper.goToPage(${data.page + 1})"
                ${data.page === data.totalPages ? 'disabled' : ''}>
                Next <i class="fas fa-chevron-right"></i>
            </button>
        `;

        html += '</div>';
        paginationContainer.innerHTML = html;
    }

    /**
     * Go to specific page
     */
    async goToPage(page) {
        this.page = page;
        await this.fetchScholarships();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Apply filters
     */
    async applyFilters(newFilters) {
        this.filters = { ...this.filters, ...newFilters };
        await this.fetchScholarships(true);
    }

    /**
     * View scholarship details
     */
    viewDetails(scholarshipId) {
        const scholarship = this.scholarships.find(s => s.id === scholarshipId);
        if (!scholarship) return;

        // Calculate match score for detailed view
        let matchScoreHTML = '';
        if (window.scholarshipMatchScore && window.scholarshipMatchScore.initialized) {
            const matchData = window.scholarshipMatchScore.calculateMatchScore(scholarship);
            matchScoreHTML = window.scholarshipMatchScore.getMatchScoreHTML(matchData);
        }

        // Check if saved
        const savedData = window.scholarshipTracker?.getSavedScholarship(scholarshipId);
        const isSaved = !!savedData;

        // Create modal with detailed information
        const modal = document.createElement('div');
        modal.className = 'scholarship-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <button class="modal-close" onclick="this.closest('.scholarship-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
                
                <h2>${scholarship.title}</h2>
                <p class="modal-organization">${scholarship.organization}</p>
                
                ${matchScoreHTML}
                
                <div class="modal-amount">
                    ${typeof scholarship.amount === 'number' ? `$${scholarship.amount.toLocaleString()}` : scholarship.amount}
                    ${scholarship.renewability ? `<span class="renewability-tag">${scholarship.renewability}</span>` : ''}
                </div>

                <div class="modal-section">
                    <h3><i class="fas fa-align-left"></i> Description</h3>
                    <p>${scholarship.description}</p>
                </div>

                <div class="modal-section">
                    <h3><i class="fas fa-check-circle"></i> Eligibility Requirements</h3>
                    <ul>
                        ${scholarship.eligibility.map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </div>

                <div class="modal-section">
                    <h3><i class="fas fa-calendar-alt"></i> Important Dates</h3>
                    <p><strong>Deadline:</strong> ${new Date(scholarship.deadline).toLocaleDateString()}</p>
                    ${isSaved ? `
                        <button onclick="scholarshipTracker.exportToCalendar('${scholarshipId}')" class="btn-secondary">
                            <i class="fas fa-calendar-plus"></i> Add to Calendar
                        </button>
                    ` : ''}
                </div>

                <div class="modal-actions">
                    <button onclick="this.closest('.scholarship-modal').remove()" class="btn-secondary">
                        Close
                    </button>
                    ${!isSaved ? `
                        <button onclick="scholarshipScraper.saveFromModal('${scholarshipId}')" class="btn-secondary">
                            <i class="far fa-bookmark"></i> Save for Later
                        </button>
                    ` : ''}
                    <a href="${scholarship.applicationUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary">
                        <i class="fas fa-external-link-alt"></i> Apply Now
                    </a>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Show loading state
     */
    showLoading() {
        const container = document.getElementById('scholarshipResults');
        if (!container) return;

        container.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Searching for scholarships...</p>
            </div>
        `;
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        // Loading is replaced by actual content
    }

    /**
     * Show error message
     */
    showError(message) {
        const container = document.getElementById('scholarshipResults');
        if (!container) return;

        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to Load Scholarships</h3>
                <p>${message}</p>
                <button onclick="scholarshipScraper.fetchScholarships(true)" class="btn-primary">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    }

    /**
     * Get empty state HTML
     */
    getEmptyState() {
        return `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No Scholarships Found</h3>
                <p>Try adjusting your filters or search criteria.</p>
                <button onclick="scholarshipScraper.resetFilters()" class="btn-primary">
                    <i class="fas fa-redo"></i> Reset Filters
                </button>
            </div>
        `;
    }

    /**
     * Reset all filters
     */
    async resetFilters() {
        this.filters = {
            category: 'all',
            minAmount: 0,
            upcomingOnly: true,
            search: '',
            gpa: null
        };
        
        // Reset UI controls
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';
        
        const categorySelect = document.getElementById('categoryFilter');
        if (categorySelect) categorySelect.value = 'all';
        
        await this.fetchScholarships(true);
    }

    /**
     * Toggle save/unsave scholarship
     */
    async toggleSave(scholarshipId) {
        const scholarship = this.scholarships.find(s => s.id === scholarshipId);
        if (!scholarship) return;

        if (!window.scholarshipTracker) {
            alert('Please sign in to save scholarships');
            return;
        }

        const isSaved = window.scholarshipTracker.isSaved(scholarshipId);

        if (isSaved) {
            await window.scholarshipTracker.removeScholarship(scholarshipId);
        } else {
            await window.scholarshipTracker.saveScholarship(scholarship);
        }

        // Update UI
        this.updateUI();
    }

    /**
     * Save scholarship from modal
     */
    async saveFromModal(scholarshipId) {
        await this.toggleSave(scholarshipId);
        document.querySelector('.scholarship-modal')?.remove();
    }

    /**
     * Update UI after tracker changes
     */
    updateUI() {
        // Update all save buttons
        document.querySelectorAll('.scholarship-save-btn').forEach(btn => {
            const scholarshipId = btn.dataset.scholarshipId;
            const isSaved = window.scholarshipTracker?.isSaved(scholarshipId);
            
            btn.innerHTML = isSaved 
                ? '<i class="fas fa-bookmark"></i> Saved'
                : '<i class="far fa-bookmark"></i> Save';
            
            btn.classList.toggle('saved', isSaved);
        });
    }
}

// Initialize global instance
const scholarshipScraper = new ScholarshipScraper();

// Auto-fetch on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        scholarshipScraper.fetchScholarships();
    });
} else {
    scholarshipScraper.fetchScholarships();
}
