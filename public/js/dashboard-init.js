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

            // Load REAL essay data from Firestore
            const essayStats = await this.loadEssayStats(user.uid);

            // TODO: Load from Firestore for other stats
            // For now, return mix of real and mock data
            return {
                applications: 5,
                essays: essayStats.total,
                essayDetails: essayStats, // Include full essay details
                scholarships: '$15,000',
                testScore: 1450,
                progress: 65
            };
        } catch (error) {
            console.error('Error loading stats:', error);
            return {
                applications: 0,
                essays: 0,
                essayDetails: {
                    total: 0,
                    inProgress: 0,
                    completed: 0,
                    needsReview: 0,
                    essays: []
                },
                scholarships: '$0',
                testScore: 0,
                progress: 0
            };
        }
    }

    /**
     * Load essay statistics from Firestore
     */
    async loadEssayStats(userId) {
        try {
            if (!window.firebaseDb) {
                console.warn('Firebase not available, using mock data');
                return { total: 0, inProgress: 0, completed: 0, needsReview: 0, essays: [] };
            }

            const { collection, query, where, getDocs, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            // Query essays collection
            const essaysRef = collection(window.firebaseDb, 'essays');
            const q = query(
                essaysRef,
                where('userId', '==', userId),
                orderBy('updatedAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const essays = [];
            let completed = 0;
            let inProgress = 0;
            let needsReview = 0;

            snapshot.forEach(doc => {
                const data = doc.data();
                essays.push({
                    id: doc.id,
                    title: data.title || 'Untitled Essay',
                    content: data.content || '',
                    wordCount: data.wordCount || 0,
                    targetColleges: data.targetColleges || [],
                    status: data.status || 'draft',
                    updatedAt: data.updatedAt,
                    analysis: data.analysis || null,
                    prompt: data.prompt || ''
                });

                // Categorize essays
                const wordCount = data.wordCount || 0;
                const hasAnalysis = !!data.analysis;

                if (wordCount > 500 && hasAnalysis) {
                    completed++;
                } else if (wordCount > 0) {
                    inProgress++;
                }

                if (wordCount > 200 && !hasAnalysis) {
                    needsReview++;
                }
            });

            console.log(`📝 Loaded ${essays.length} essays from Firestore`);

            return {
                total: essays.length,
                completed,
                inProgress,
                needsReview,
                essays
            };
        } catch (error) {
            console.error('Error loading essay stats:', error);
            return { total: 0, inProgress: 0, completed: 0, needsReview: 0, essays: [] };
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

        // Update essay trend text
        if (stats.essayDetails) {
            const trendEl = document.getElementById('essaysTrend');
            if (trendEl) {
                const { inProgress, completed, needsReview } = stats.essayDetails;
                if (inProgress > 0) {
                    trendEl.textContent = `${inProgress} in progress`;
                } else if (completed > 0) {
                    trendEl.textContent = `${completed} completed`;
                } else if (needsReview > 0) {
                    trendEl.textContent = `${needsReview} need review`;
                } else {
                    trendEl.textContent = 'Get started!';
                }
            }

            // Create essay dashboard widget below stats
            this.createEssayDashboardWidget(stats.essayDetails);
        }
    }

    /**
     * Create comprehensive essay dashboard widget
     */
    createEssayDashboardWidget(essayDetails) {
        // Find where to insert the widget (after stats-overview)
        const statsOverview = document.querySelector('.stats-overview');
        if (!statsOverview) return;

        // Check if widget already exists
        let existingWidget = document.getElementById('essayDashboardWidget');
        if (existingWidget) {
            existingWidget.remove();
        }

        // Create widget
        const widget = document.createElement('div');
        widget.id = 'essayDashboardWidget';
        widget.className = 'essay-dashboard-widget';
        widget.innerHTML = this.generateEssayWidgetHTML(essayDetails);

        // Insert after stats-overview
        statsOverview.insertAdjacentElement('afterend', widget);

        // Add styles if not already added
        this.addEssayWidgetStyles();
    }

    /**
     * Generate HTML for essay widget
     */
    generateEssayWidgetHTML(essayDetails) {
        const { total, completed, inProgress, needsReview, essays } = essayDetails;

        if (total === 0) {
            return `
                <div class="essay-widget-header">
                    <h2 class="panel-title">
                        <i class="fas fa-pen-fancy"></i>
                        Essay Dashboard
                    </h2>
                    <button class="btn-primary" onclick="window.location.href='/essay-coach'">
                        <i class="fas fa-plus"></i> Start Writing
                    </button>
                </div>
                <div class="essay-empty-state">
                    <i class="fas fa-file-alt" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                    <h3>No Essays Yet</h3>
                    <p>Start crafting your college application essays with AI-powered guidance</p>
                    <button class="btn-primary" onclick="window.location.href='/essay-coach'" style="margin-top: 1rem;">
                        <i class="fas fa-magic"></i> Launch Essay Coach
                    </button>
                </div>
            `;
        }

        // Get upcoming deadlines from essays
        const upcomingDeadlines = this.getEssayDeadlines(essays);

        return `
            <div class="essay-widget-header">
                <h2 class="panel-title">
                    <i class="fas fa-pen-fancy"></i>
                    Essay Dashboard
                </h2>
                <button class="btn-primary" onclick="window.location.href='/essay-coach'">
                    <i class="fas fa-external-link-alt"></i> Open Essay Coach
                </button>
            </div>

            <!-- Essay Stats Summary -->
            <div class="essay-stats-summary">
                <div class="essay-stat-box">
                    <div class="essay-stat-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="essay-stat-content">
                        <div class="essay-stat-value">${completed}</div>
                        <div class="essay-stat-label">Completed</div>
                    </div>
                </div>
                <div class="essay-stat-box">
                    <div class="essay-stat-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                        <i class="fas fa-edit"></i>
                    </div>
                    <div class="essay-stat-content">
                        <div class="essay-stat-value">${inProgress}</div>
                        <div class="essay-stat-label">In Progress</div>
                    </div>
                </div>
                <div class="essay-stat-box">
                    <div class="essay-stat-icon" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
                        <i class="fas fa-eye"></i>
                    </div>
                    <div class="essay-stat-content">
                        <div class="essay-stat-value">${needsReview}</div>
                        <div class="essay-stat-label">Needs Review</div>
                    </div>
                </div>
                <div class="essay-stat-box">
                    <div class="essay-stat-icon" style="background: linear-gradient(135deg, #a07bcc 0%, #8b5cf6 100%);">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <div class="essay-stat-content">
                        <div class="essay-stat-value">${total}</div>
                        <div class="essay-stat-label">Total Essays</div>
                    </div>
                </div>
            </div>

            <!-- Upcoming Deadlines -->
            ${upcomingDeadlines.length > 0 ? `
                <div class="essay-deadlines-section">
                    <h3 class="essay-section-title">
                        <i class="fas fa-clock"></i> Upcoming Deadlines
                    </h3>
                    <div class="essay-deadlines-list">
                        ${upcomingDeadlines.map(deadline => `
                            <div class="essay-deadline-item ${deadline.urgency}">
                                <div class="deadline-date">
                                    <div class="deadline-month">${deadline.month}</div>
                                    <div class="deadline-day">${deadline.day}</div>
                                </div>
                                <div class="deadline-info">
                                    <div class="deadline-colleges">${deadline.colleges.join(', ')}</div>
                                    <div class="deadline-type">${deadline.type} Deadline</div>
                                </div>
                                <div class="deadline-urgency-badge ${deadline.urgency}">
                                    ${deadline.daysUntil} days
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- Recent Essays / Quick Access -->
            <div class="essay-quick-access">
                <h3 class="essay-section-title">
                    <i class="fas fa-file-alt"></i> Your Essays
                </h3>
                <div class="essay-cards-grid">
                    ${essays.slice(0, 6).map(essay => {
                        const status = this.getEssayStatus(essay);
                        return `
                            <div class="essay-card" onclick="window.location.href='/essay-coach?essay=${essay.id}'">
                                <div class="essay-card-header">
                                    <div class="essay-status-badge ${status.class}">${status.text}</div>
                                    <div class="essay-word-count">${essay.wordCount} words</div>
                                </div>
                                <h4 class="essay-card-title">${this.truncateText(essay.title, 40)}</h4>
                                <p class="essay-card-prompt">${this.truncateText(essay.prompt, 60)}</p>
                                <div class="essay-card-footer">
                                    ${essay.targetColleges && essay.targetColleges.length > 0 ? `
                                        <div class="essay-colleges">
                                            <i class="fas fa-university"></i>
                                            ${essay.targetColleges.slice(0, 2).join(', ')}
                                            ${essay.targetColleges.length > 2 ? ` +${essay.targetColleges.length - 2}` : ''}
                                        </div>
                                    ` : ''}
                                    <div class="essay-updated">
                                        Updated ${this.formatRelativeTime(essay.updatedAt)}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                ${essays.length > 6 ? `
                    <button class="btn-secondary" onclick="window.location.href='/essay-coach'" style="width: 100%; margin-top: 1rem;">
                        View All ${essays.length} Essays <i class="fas fa-arrow-right"></i>
                    </button>
                ` : ''}
            </div>
        `;
    }

    /**
     * Get essay status for display
     */
    getEssayStatus(essay) {
        const wordCount = essay.wordCount || 0;
        const hasAnalysis = !!essay.analysis;

        if (wordCount > 500 && hasAnalysis) {
            return { text: 'Completed', class: 'status-completed' };
        } else if (wordCount > 200 && !hasAnalysis) {
            return { text: 'Needs Review', class: 'status-review' };
        } else if (wordCount > 0) {
            return { text: 'In Progress', class: 'status-progress' };
        } else {
            return { text: 'Draft', class: 'status-draft' };
        }
    }

    /**
     * Get upcoming essay deadlines
     */
    getEssayDeadlines(essays) {
        const deadlines = [];
        const now = new Date();

        essays.forEach(essay => {
            if (!essay.targetColleges || essay.targetColleges.length === 0) return;

            // Common deadline templates
            const deadlineTypes = {
                'ED': new Date(now.getFullYear(), 10, 1), // Nov 1
                'EA': new Date(now.getFullYear(), 10, 1), // Nov 1
                'RD': new Date(now.getFullYear() + 1, 0, 1), // Jan 1
                'Priority': new Date(now.getFullYear(), 11, 1) // Dec 1
            };

            Object.entries(deadlineTypes).forEach(([type, date]) => {
                if (date > now) {
                    const daysUntil = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
                    deadlines.push({
                        colleges: essay.targetColleges,
                        type,
                        date,
                        month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
                        day: date.getDate(),
                        daysUntil,
                        urgency: daysUntil < 14 ? 'urgent' : daysUntil < 30 ? 'soon' : 'upcoming'
                    });
                }
            });
        });

        // Remove duplicates and sort by date
        const unique = deadlines.reduce((acc, curr) => {
            const key = `${curr.type}-${curr.date.getTime()}`;
            if (!acc.has(key)) {
                acc.set(key, curr);
            }
            return acc;
        }, new Map());

        return Array.from(unique.values())
            .sort((a, b) => a.date - b.date)
            .slice(0, 5); // Top 5 upcoming
    }

    /**
     * Truncate text with ellipsis
     */
    truncateText(text, maxLength) {
        if (!text) return 'No title';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Format relative time (e.g., "2 hours ago")
     */
    formatRelativeTime(timestamp) {
        if (!timestamp) return 'recently';

        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        return date.toLocaleDateString();
    }

    /**
     * Add CSS styles for essay widget
     */
    addEssayWidgetStyles() {
        if (document.getElementById('essay-dashboard-widget-styles')) return;

        const style = document.createElement('style');
        style.id = 'essay-dashboard-widget-styles';
        style.textContent = `
            .essay-dashboard-widget {
                background: var(--primary-bg);
                border-radius: 20px;
                padding: 2rem;
                margin: 2rem 0;
                box-shadow: var(--shadow);
                border: 1px solid rgba(160, 123, 204, 0.1);
            }

            .essay-widget-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 2px solid rgba(160, 123, 204, 0.1);
            }

            .essay-stats-summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }

            .essay-stat-box {
                background: var(--secondary-bg);
                border-radius: 16px;
                padding: 1.5rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }

            .essay-stat-box:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 24px rgba(160, 123, 204, 0.15);
            }

            .essay-stat-icon {
                width: 60px;
                height: 60px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1.5rem;
            }

            .essay-stat-value {
                font-size: 2rem;
                font-weight: 800;
                color: var(--text-primary);
            }

            .essay-stat-label {
                font-size: 0.9rem;
                color: var(--text-secondary);
                font-weight: 500;
            }

            .essay-section-title {
                font-size: 1.3rem;
                font-weight: 700;
                color: var(--text-primary);
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .essay-deadlines-section {
                margin-bottom: 2rem;
            }

            .essay-deadlines-list {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .essay-deadline-item {
                background: var(--secondary-bg);
                border-radius: 12px;
                padding: 1rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                border-left: 4px solid var(--info-color);
            }

            .essay-deadline-item.urgent {
                border-left-color: var(--danger-color);
                background: rgba(239, 68, 68, 0.05);
            }

            .essay-deadline-item.soon {
                border-left-color: var(--warning-color);
                background: rgba(245, 158, 11, 0.05);
            }

            .deadline-date {
                background: var(--primary-bg);
                border-radius: 8px;
                padding: 0.5rem;
                text-align: center;
                min-width: 60px;
            }

            .deadline-month {
                font-size: 0.75rem;
                font-weight: 700;
                color: var(--accent-color);
            }

            .deadline-day {
                font-size: 1.5rem;
                font-weight: 800;
                color: var(--text-primary);
            }

            .deadline-info {
                flex: 1;
            }

            .deadline-colleges {
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 0.25rem;
            }

            .deadline-type {
                font-size: 0.85rem;
                color: var(--text-secondary);
            }

            .deadline-urgency-badge {
                background: var(--info-color);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 600;
            }

            .deadline-urgency-badge.urgent {
                background: var(--danger-color);
            }

            .deadline-urgency-badge.soon {
                background: var(--warning-color);
            }

            .essay-cards-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 1.5rem;
            }

            .essay-card {
                background: var(--secondary-bg);
                border-radius: 12px;
                padding: 1.25rem;
                cursor: pointer;
                transition: all 0.3s ease;
                border: 2px solid transparent;
            }

            .essay-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 32px rgba(160, 123, 204, 0.2);
                border-color: var(--accent-color);
            }

            .essay-card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }

            .essay-status-badge {
                padding: 0.25rem 0.75rem;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 600;
            }

            .status-completed {
                background: rgba(16, 185, 129, 0.1);
                color: var(--success-color);
            }

            .status-progress {
                background: rgba(245, 158, 11, 0.1);
                color: var(--warning-color);
            }

            .status-review {
                background: rgba(59, 130, 246, 0.1);
                color: var(--info-color);
            }

            .status-draft {
                background: rgba(107, 114, 128, 0.1);
                color: var(--text-secondary);
            }

            .essay-word-count {
                font-size: 0.85rem;
                color: var(--text-secondary);
                font-weight: 500;
            }

            .essay-card-title {
                font-size: 1.1rem;
                font-weight: 700;
                color: var(--text-primary);
                margin-bottom: 0.5rem;
            }

            .essay-card-prompt {
                font-size: 0.9rem;
                color: var(--text-secondary);
                margin-bottom: 1rem;
                line-height: 1.4;
            }

            .essay-card-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 0.8rem;
                color: var(--text-secondary);
            }

            .essay-colleges {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .essay-empty-state {
                text-align: center;
                padding: 3rem 2rem;
                color: var(--text-secondary);
            }

            .essay-empty-state h3 {
                color: var(--text-primary);
                margin-bottom: 0.5rem;
            }

            @media (max-width: 768px) {
                .essay-stats-summary {
                    grid-template-columns: repeat(2, 1fr);
                }

                .essay-cards-grid {
                    grid-template-columns: 1fr;
                }

                .essay-dashboard-widget {
                    padding: 1.5rem;
                }
            }
        `;

        document.head.appendChild(style);
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
