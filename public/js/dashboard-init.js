/**
 * 🎯 DASHBOARD INITIALIZATION - Billion-Dollar Quality
 * 
 * Handles proper initialization sequence with:
 * - Loading states
 * - Error handling
 * - Race condition prevention
 * - User feedback
 */

class DashboardManager {
    constructor() {
        this.isInitialized = false;
        this.modules = {
            auth: false,
            stats: false,
            schools: false,
            timeline: false,
            scholarships: false
        };
    }

    /**
     * Initialize dashboard - call this ONCE on page load
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('ℹ️  Dashboard already initialized');
            return;
        }

        try {
            console.log('🚀 Initializing dashboard...');

            // Show loading state
            this.showLoadingState();

            // Step 1: Wait for auth
            await this.initializeAuth();

            // Step 2: Initialize modules in parallel (faster)
            await Promise.allSettled([
                this.initializeStats(),
                this.initializeSchools(),
                this.initializeTimeline(),
                this.initializeScholarships()
            ]);

            // Step 3: Set up event listeners
            this.setupEventListeners();

            // Step 4: Hide loading state
            this.hideLoadingState();

            this.isInitialized = true;
            console.log('✅ Dashboard initialized successfully');

        } catch (error) {
            console.error('❌ Dashboard initialization failed:', error);
            this.showError('Failed to load dashboard. Please refresh the page.');
        }
    }

    /**
     * Initialize authentication
     */
    async initializeAuth() {
        try {
            console.log('🔐 Initializing auth...');

            if (!window.authManager) {
                throw new Error('Auth manager not available');
            }

            // Wait for auth to be ready
            const user = await window.authManager.waitForAuth(5000);

            if (!user) {
                throw new Error('No authenticated user');
            }

            // Update UI with user info
            this.updateUserInfo(user);

            this.modules.auth = true;
            console.log('✅ Auth initialized');

        } catch (error) {
            console.error('❌ Auth initialization failed:', error);
            throw error;
        }
    }

    /**
     * Initialize statistics
     */
    async initializeStats() {
        try {
            console.log('📊 Initializing stats...');

            // Load user stats
            const stats = await this.loadUserStats();

            // Update UI
            this.updateStatsUI(stats);

            this.modules.stats = true;
            console.log('✅ Stats initialized');

        } catch (error) {
            console.error('❌ Stats initialization failed:', error);
            this.showModuleError('stats', 'Unable to load statistics');
        }
    }

    /**
     * Initialize school recommendations
     */
    async initializeSchools() {
        try {
            console.log('🎓 Initializing schools...');

            // Load school recommendations
            const schools = await this.loadSchoolRecommendations();

            // Update UI
            this.updateSchoolsUI(schools);

            this.modules.schools = true;
            console.log('✅ Schools initialized');

        } catch (error) {
            console.error('❌ Schools initialization failed:', error);
            this.showModuleError('schools', 'Unable to load school recommendations');
        }
    }

    /**
     * Initialize timeline
     */
    async initializeTimeline() {
        try {
            console.log('📅 Initializing timeline...');

            // Load timeline data
            const timeline = await this.loadTimeline();

            // Update UI
            this.updateTimelineUI(timeline);

            this.modules.timeline = true;
            console.log('✅ Timeline initialized');

        } catch (error) {
            console.error('❌ Timeline initialization failed:', error);
            this.showModuleError('timeline', 'Unable to load timeline');
        }
    }

    /**
     * Initialize scholarships
     */
    async initializeScholarships() {
        try {
            console.log('💰 Initializing scholarships...');

            // Load scholarship data
            const scholarships = await this.loadScholarships();

            // Update UI
            this.updateScholarshipsUI(scholarships);

            this.modules.scholarships = true;
            console.log('✅ Scholarships initialized');

        } catch (error) {
            console.error('❌ Scholarships initialization failed:', error);
            this.showModuleError('scholarships', 'Unable to load scholarships');
        }
    }

    /**
     * Load user statistics
     */
    async loadUserStats() {
        try {
            const user = window.authManager.getCurrentUser();
            if (!user) {
                throw new Error('No user logged in');
            }

            // TODO: Load from Firestore
            // For now, return mock data
            return {
                applications: 5,
                essays: 3,
                scholarships: '$15,000',
                testScore: 1450,
                progress: 65
            };
        } catch (error) {
            console.error('Error loading stats:', error);
            return {
                applications: 0,
                essays: 0,
                scholarships: '$0',
                testScore: 0,
                progress: 0
            };
        }
    }

    /**
     * Load school recommendations
     */
    async loadSchoolRecommendations() {
        try {
            // TODO: Load from API
            // For now, return mock data
            return [
                {
                    name: 'Stanford University',
                    match: 85,
                    acceptanceRate: 4,
                    tuition: 56169
                },
                {
                    name: 'MIT',
                    match: 82,
                    acceptanceRate: 7,
                    tuition: 53790
                },
                {
                    name: 'UC Berkeley',
                    match: 78,
                    acceptanceRate: 17,
                    tuition: 14253
                }
            ];
        } catch (error) {
            console.error('Error loading schools:', error);
            return [];
        }
    }

    /**
     * Load timeline
     */
    async loadTimeline() {
        try {
            // TODO: Load from API/Firestore
            // For now, return mock data
            return [
                {
                    title: 'Complete Common App',
                    date: '2025-11-01',
                    status: 'pending',
                    category: 'applications'
                },
                {
                    title: 'Finish Personal Statement',
                    date: '2025-10-15',
                    status: 'in_progress',
                    category: 'essays'
                },
                {
                    title: 'SAT Test',
                    date: '2025-12-07',
                    status: 'upcoming',
                    category: 'tests'
                }
            ];
        } catch (error) {
            console.error('Error loading timeline:', error);
            return [];
        }
    }

    /**
     * Load scholarships
     */
    async loadScholarships() {
        try {
            // TODO: Load from localStorage/Firestore
            // For now, return mock data
            return {
                saved: 8,
                totalValue: 15000,
                applied: 3,
                pending: 5
            };
        } catch (error) {
            console.error('Error loading scholarships:', error);
            return {
                saved: 0,
                totalValue: 0,
                applied: 0,
                pending: 0
            };
        }
    }

    /**
     * Update user info in UI
     */
    updateUserInfo(user) {
        // Update user avatar
        const avatar = document.querySelector('.cc-user-avatar');
        if (avatar && user.photoURL) {
            avatar.style.backgroundImage = `url(${user.photoURL})`;
        }

        // Update user email
        const emailEl = document.querySelector('.cc-dropdown-email');
        if (emailEl && user.email) {
            emailEl.textContent = user.email;
        }

        // Update welcome message
        const welcomeEl = document.querySelector('.cc-dropdown-welcome');
        if (welcomeEl) {
            const name = user.displayName || user.email.split('@')[0];
            welcomeEl.textContent = `Welcome back, ${name}!`;
        }
    }

    /**
     * Update stats UI
     */
    updateStatsUI(stats) {
        const updates = {
            'applicationsCount': stats.applications,
            'essaysCount': stats.essays,
            'scholarshipAmount': stats.scholarships,
            'testprepScore': stats.testScore,
            'overallProgress': `${stats.progress}%`
        };

        Object.entries(updates).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = value;
            }
        });
    }

    /**
     * Update schools UI
     */
    updateSchoolsUI(schools) {
        const container = document.getElementById('schoolGrid');
        if (!container) return;

        if (schools.length === 0) {
            container.innerHTML = '<p>No school recommendations yet. Complete your profile to get personalized matches!</p>';
            return;
        }

        container.innerHTML = schools.map(school => `
            <div class="school-card">
                <div class="school-match">${school.match}% Match</div>
                <h3>${school.name}</h3>
                <div class="school-stats">
                    <div><i class="fas fa-percentage"></i> ${school.acceptanceRate}% acceptance</div>
                    <div><i class="fas fa-dollar-sign"></i> $${school.tuition.toLocaleString()}/year</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Update timeline UI
     */
    updateTimelineUI(timeline) {
        const container = document.querySelector('.timeline-compact');
        if (!container) return;

        if (timeline.length === 0) {
            container.innerHTML = '<p>No upcoming tasks. Great job staying on track!</p>';
            return;
        }

        container.innerHTML = timeline.map(item => `
            <div class="timeline-item-compact">
                <div class="timeline-icon-compact">
                    <i class="fas fa-${this.getIconForCategory(item.category)}"></i>
                </div>
                <div class="timeline-content-compact">
                    <h4>${item.title}</h4>
                    <p>${new Date(item.date).toLocaleDateString()}</p>
                </div>
            </div>
        `).join('');
    }

    /**
     * Update scholarships UI
     */
    updateScholarshipsUI(scholarships) {
        const updates = {
            'scholarshipAmount': `$${scholarships.totalValue.toLocaleString()}`,
            'scholarshipTrend': `${scholarships.saved} saved`
        };

        Object.entries(updates).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = value;
            }
        });
    }

    /**
     * Get icon for timeline category
     */
    getIconForCategory(category) {
        const icons = {
            applications: 'file-alt',
            essays: 'pen-fancy',
            tests: 'calculator',
            scholarships: 'trophy',
            documents: 'folder'
        };
        return icons[category] || 'check';
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshDashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                location.reload();
            });
        }

        // Logout button
        const logoutBtns = document.querySelectorAll('[data-action="logout"]');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    await window.authManager.signOut();
                } catch (error) {
                    console.error('Logout error:', error);
                }
            });
        });
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        const loadingHTML = `
            <div id="dashboard-loading" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.95);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            ">
                <div style="text-align: center;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: var(--accent-color);"></i>
                    <p style="margin-top: 1rem; color: var(--text-primary);">Loading your dashboard...</p>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', loadingHTML);
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        const loading = document.getElementById('dashboard-loading');
        if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => loading.remove(), 300);
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        this.hideLoadingState();
        
        const errorHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 2rem;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                text-align: center;
                z-index: 10000;
            ">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--danger-color);"></i>
                <h2 style="margin-top: 1rem;">Oops!</h2>
                <p>${message}</p>
                <button onclick="location.reload()" style="
                    margin-top: 1rem;
                    padding: 0.75rem 1.5rem;
                    background: var(--gradient);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                ">Reload Page</button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', errorHTML);
    }

    /**
     * Show module-specific error
     */
    showModuleError(module, message) {
        console.warn(`Module error [${module}]:`, message);
        // Could show inline error in the module's section
    }
}

// Create singleton instance
const dashboardManager = new DashboardManager();

// Auto-initialize on DOM ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            dashboardManager.initialize();
        });
    } else {
        // DOM already loaded
        dashboardManager.initialize();
    }
}

// Make globally available
window.dashboardManager = dashboardManager;

console.log('📊 Dashboard Manager loaded');
