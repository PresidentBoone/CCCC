/**
 * 🎯 UNIFIED TIMELINE SYSTEM
 * Billion-Dollar Feature: Single timeline showing ALL deadlines
 *
 * Integrates:
 * - Application deadlines
 * - Essay deadlines
 * - Test dates
 * - Scholarship deadlines
 * - Financial aid deadlines
 * - Recommendation request deadlines
 * - Custom user events
 */

class UnifiedTimelineSystem {
    constructor() {
        this.events = [];
        this.updateCallbacks = [];
    }

    /**
     * Initialize with dependencies
     */
    async initialize(userProfileSystem, workflowEngine, scholarshipSystem) {
        try {
            console.log('🎯 Initializing Unified Timeline System...');

            this.userProfileSystem = userProfileSystem;
            this.workflowEngine = workflowEngine;
            this.scholarshipSystem = scholarshipSystem;

            // Listen for updates from all systems
            userProfileSystem.onProfileUpdate(() => this.generateTimeline());
            workflowEngine.onUpdate(() => this.generateTimeline());
            scholarshipSystem.onUpdate(() => this.generateTimeline());

            // Generate initial timeline
            await this.generateTimeline();

            console.log('✅ Unified Timeline System initialized');
            return true;
        } catch (error) {
            console.error('❌ Timeline System initialization failed:', error);
            throw error;
        }
    }

    /**
     * Generate unified timeline from all sources
     */
    async generateTimeline() {
        try {
            this.events = [];

            // 1. Application deadlines
            this.addApplicationDeadlines();

            // 2. Essay deadlines
            this.addEssayDeadlines();

            // 3. Test dates
            this.addTestDates();

            // 4. Scholarship deadlines
            this.addScholarshipDeadlines();

            // 5. Financial aid deadlines
            this.addFinancialAidDeadlines();

            // 6. Recommendation deadlines
            this.addRecommendationDeadlines();

            // 7. Custom events
            this.addCustomEvents();

            // Sort by date
            this.events.sort((a, b) => new Date(a.date) - new Date(b.date));

            // Categorize by urgency
            this.categorizeByUrgency();

            // Save to profile
            await this.saveToProfile();

            // Notify listeners
            this.notifyListeners();
        } catch (error) {
            console.error('Error generating timeline:', error);
        }
    }

    /**
     * Add application deadlines
     */
    addApplicationDeadlines() {
        const applications = this.workflowEngine?.getAllApplications() || [];

        applications.forEach(app => {
            if (app.deadlines?.selectedDeadline) {
                const requirements = this.workflowEngine.getRequirements(app.id);
                const completedItems = requirements?.items.filter(i => i.completed).length || 0;
                const totalItems = requirements?.items.length || 0;

                this.events.push({
                    id: `app-deadline-${app.id}`,
                    type: 'application',
                    category: 'deadline',
                    title: `${app.collegeName} Application Due`,
                    description: `Submit complete application to ${app.collegeName}`,
                    date: app.deadlines.selectedDeadline,
                    time: '23:59',
                    completed: app.status === 'submitted',
                    progress: app.progress,
                    priority: this.calculatePriority(app.deadlines.selectedDeadline, app.progress),
                    relatedItems: [{
                        type: 'application',
                        id: app.id,
                        name: app.collegeName
                    }],
                    actions: [
                        {
                            type: 'navigate',
                            label: 'View Requirements',
                            destination: `/dashboard.html#application-${app.id}`
                        }
                    ],
                    metadata: {
                        collegeName: app.collegeName,
                        applicationId: app.id,
                        category: app.category,
                        completedItems: completedItems,
                        totalItems: totalItems
                    }
                });

                // Add early deadlines if applicable
                if (app.deadlines.earlyAction) {
                    this.events.push({
                        id: `app-ea-${app.id}`,
                        type: 'application',
                        category: 'deadline',
                        title: `${app.collegeName} Early Action Due`,
                        description: `Early Action deadline for ${app.collegeName}`,
                        date: app.deadlines.earlyAction,
                        time: '23:59',
                        completed: false,
                        priority: 'high',
                        relatedItems: [{ type: 'application', id: app.id, name: app.collegeName }],
                        metadata: { collegeName: app.collegeName, deadlineType: 'early-action' }
                    });
                }

                if (app.deadlines.earlyDecision) {
                    this.events.push({
                        id: `app-ed-${app.id}`,
                        type: 'application',
                        category: 'deadline',
                        title: `${app.collegeName} Early Decision Due`,
                        description: `Early Decision deadline for ${app.collegeName} (binding)`,
                        date: app.deadlines.earlyDecision,
                        time: '23:59',
                        completed: false,
                        priority: 'critical',
                        relatedItems: [{ type: 'application', id: app.id, name: app.collegeName }],
                        metadata: { collegeName: app.collegeName, deadlineType: 'early-decision' }
                    });
                }
            }
        });
    }

    /**
     * Add essay deadlines
     */
    addEssayDeadlines() {
        const applications = this.workflowEngine?.getAllApplications() || [];

        applications.forEach(app => {
            const requirements = this.workflowEngine?.getRequirements(app.id);
            if (requirements) {
                const essayReqs = requirements.items.filter(item => item.category === 'essay');

                essayReqs.forEach(essay => {
                    if (!essay.completed && essay.dueDate) {
                        this.events.push({
                            id: `essay-${essay.id}`,
                            type: 'essay',
                            category: 'task',
                            title: essay.name,
                            description: `Complete essay for ${app.collegeName}`,
                            date: essay.dueDate,
                            completed: essay.completed,
                            priority: essay.priority,
                            estimatedTime: essay.estimatedTime,
                            relatedItems: [
                                { type: 'application', id: app.id, name: app.collegeName },
                                { type: 'essay', id: essay.linkedEssayId }
                            ],
                            actions: [
                                {
                                    type: 'navigate',
                                    label: 'Write Essay',
                                    destination: '/essaycoach.html'
                                }
                            ],
                            metadata: {
                                wordLimit: essay.wordLimit,
                                essayType: essay.type
                            }
                        });
                    }
                });
            }
        });
    }

    /**
     * Add test dates
     */
    addTestDates() {
        // Standard SAT/ACT test dates for 2025
        const testDates = [
            { date: '2025-03-08', test: 'SAT' },
            { date: '2025-05-03', test: 'SAT' },
            { date: '2025-06-07', test: 'SAT' },
            { date: '2025-02-08', test: 'ACT' },
            { date: '2025-04-12', test: 'ACT' },
            { date: '2025-06-14', test: 'ACT' }
        ];

        const profile = this.userProfileSystem?.getProfile();
        const targetScores = this.calculateTargetScores();

        testDates.forEach(testDate => {
            const daysUntil = this.calculateDaysUntil(testDate.date);

            // Only show upcoming tests
            if (daysUntil > -30) {
                this.events.push({
                    id: `test-${testDate.test}-${testDate.date}`,
                    type: 'test',
                    category: 'event',
                    title: `${testDate.test} Test Date`,
                    description: `Register for ${testDate.test} exam`,
                    date: testDate.date,
                    time: '08:00',
                    completed: false,
                    priority: targetScores.needsImprovement ? 'high' : 'medium',
                    relatedItems: [],
                    actions: [
                        {
                            type: 'external-link',
                            label: 'Register',
                            url: testDate.test === 'SAT'
                                ? 'https://satsuite.collegeboard.org/sat'
                                : 'https://www.act.org/content/act/en/products-and-services/the-act.html'
                        },
                        {
                            type: 'navigate',
                            label: 'Practice',
                            destination: '/testprep-enhanced.html'
                        }
                    ],
                    metadata: {
                        testType: testDate.test,
                        registrationDeadline: this.calculateRegistrationDeadline(testDate.date),
                        targetScore: targetScores[testDate.test.toLowerCase()]
                    }
                });
            }
        });
    }

    /**
     * Add scholarship deadlines
     */
    addScholarshipDeadlines() {
        const matches = this.scholarshipSystem?.getTopMatches(20) || [];

        matches.forEach(match => {
            if (match.scholarship.deadline) {
                this.events.push({
                    id: `scholarship-${match.scholarship.id}`,
                    type: 'scholarship',
                    category: 'deadline',
                    title: match.scholarship.name,
                    description: `Apply for $${match.scholarship.amount.toLocaleString()} scholarship`,
                    date: match.scholarship.deadline,
                    time: '23:59',
                    completed: false,
                    priority: match.priority > 70 ? 'high' : 'medium',
                    relatedItems: [{ type: 'scholarship', id: match.scholarship.id }],
                    actions: [
                        {
                            type: 'navigate',
                            label: 'Apply',
                            destination: `/scholarship.html#${match.scholarship.id}`
                        }
                    ],
                    metadata: {
                        amount: match.scholarship.amount,
                        matchScore: match.score,
                        roi: match.roi,
                        effort: match.effort,
                        provider: match.scholarship.provider
                    }
                });
            }
        });
    }

    /**
     * Add financial aid deadlines
     */
    addFinancialAidDeadlines() {
        const profile = this.userProfileSystem?.getProfile();

        if (profile.collegePreferences?.financialAidNeeded) {
            // FAFSA deadline
            if (!profile.financial?.fafsaCompleted) {
                this.events.push({
                    id: 'fafsa-deadline',
                    type: 'financial',
                    category: 'deadline',
                    title: 'FAFSA Priority Deadline',
                    description: 'Complete Free Application for Federal Student Aid',
                    date: '2025-03-01', // Priority deadline
                    time: '23:59',
                    completed: false,
                    priority: 'critical',
                    estimatedTime: 120,
                    relatedItems: [],
                    actions: [
                        {
                            type: 'external-link',
                            label: 'Complete FAFSA',
                            url: 'https://studentaid.gov/fafsa'
                        }
                    ],
                    metadata: {
                        importance: 'Required for federal financial aid'
                    }
                });
            }

            // CSS Profile deadline
            if (!profile.financial?.cssProfileCompleted) {
                this.events.push({
                    id: 'css-deadline',
                    type: 'financial',
                    category: 'deadline',
                    title: 'CSS Profile Deadline',
                    description: 'Complete CSS Profile for institutional aid',
                    date: '2025-02-15',
                    time: '23:59',
                    completed: false,
                    priority: 'high',
                    estimatedTime: 90,
                    relatedItems: [],
                    actions: [
                        {
                            type: 'external-link',
                            label: 'Complete CSS Profile',
                            url: 'https://cssprofile.collegeboard.org/'
                        }
                    ],
                    metadata: {
                        importance: 'Required for institutional aid at many private colleges'
                    }
                });
            }
        }
    }

    /**
     * Add recommendation deadlines
     */
    addRecommendationDeadlines() {
        const applications = this.workflowEngine?.getAllApplications() || [];
        const profile = this.userProfileSystem?.getProfile();
        const teacherRecs = profile.recommendations?.teachers || [];

        // For each application, add recommendation request deadline
        applications.forEach(app => {
            if (app.deadlines?.selectedDeadline) {
                const recDeadline = this.calculateRecommendationDeadline(app.deadlines.selectedDeadline);
                const submittedRecs = teacherRecs.filter(r => r.submitted).length;
                const neededRecs = 2; // Standard requirement

                if (submittedRecs < neededRecs) {
                    this.events.push({
                        id: `rec-request-${app.id}`,
                        type: 'recommendation',
                        category: 'task',
                        title: `Request Recommendations for ${app.collegeName}`,
                        description: `Request ${neededRecs - submittedRecs} recommendation letter(s)`,
                        date: recDeadline,
                        completed: submittedRecs >= neededRecs,
                        priority: 'high',
                        estimatedTime: 30,
                        relatedItems: [{ type: 'application', id: app.id, name: app.collegeName }],
                        actions: [
                            {
                                type: 'navigate',
                                label: 'Request Recommendations',
                                destination: '/profile.html#recommendations'
                            }
                        ],
                        metadata: {
                            needed: neededRecs,
                            submitted: submittedRecs
                        }
                    });
                }
            }
        });
    }

    /**
     * Add custom events from user profile
     */
    addCustomEvents() {
        const profile = this.userProfileSystem?.getProfile();
        const customEvents = profile.timeline?.customEvents || [];

        customEvents.forEach(event => {
            this.events.push({
                id: `custom-${event.id}`,
                type: 'custom',
                category: event.category || 'event',
                title: event.title,
                description: event.description,
                date: event.date,
                time: event.time,
                completed: event.completed || false,
                priority: event.priority || 'medium',
                relatedItems: event.relatedItems || [],
                actions: event.actions || [],
                metadata: event.metadata || {}
            });
        });
    }

    /**
     * Categorize events by urgency
     */
    categorizeByUrgency() {
        const now = new Date();

        this.events.forEach(event => {
            const eventDate = new Date(event.date);
            const daysUntil = Math.ceil((eventDate - now) / (24 * 60 * 60 * 1000));

            if (event.completed) {
                event.urgency = 'completed';
            } else if (daysUntil < 0) {
                event.urgency = 'overdue';
            } else if (daysUntil <= 7) {
                event.urgency = 'immediate';
            } else if (daysUntil <= 30) {
                event.urgency = 'soon';
            } else if (daysUntil <= 90) {
                event.urgency = 'upcoming';
            } else {
                event.urgency = 'future';
            }

            event.daysUntil = daysUntil;
        });
    }

    /**
     * Get events by timeframe
     */
    getEventsByTimeframe(timeframe) {
        const now = new Date();
        let startDate, endDate;

        switch (timeframe) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 1);
                break;
            case 'week':
                startDate = now;
                endDate = new Date(now);
                endDate.setDate(endDate.getDate() + 7);
                break;
            case 'month':
                startDate = now;
                endDate = new Date(now);
                endDate.setMonth(endDate.getMonth() + 1);
                break;
            case 'quarter':
                startDate = now;
                endDate = new Date(now);
                endDate.setMonth(endDate.getMonth() + 3);
                break;
            default:
                return this.events;
        }

        return this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= startDate && eventDate < endDate;
        });
    }

    /**
     * Get upcoming deadlines
     */
    getUpcomingDeadlines(count = 10) {
        return this.events
            .filter(e => !e.completed && e.category === 'deadline' && e.daysUntil > 0)
            .slice(0, count);
    }

    /**
     * Get overdue items
     */
    getOverdueItems() {
        return this.events.filter(e => !e.completed && e.urgency === 'overdue');
    }

    /**
     * Get events by type
     */
    getEventsByType(type) {
        return this.events.filter(e => e.type === type);
    }

    /**
     * Helper methods
     */
    calculatePriority(deadline, progress) {
        const daysUntil = this.calculateDaysUntil(deadline);

        if (daysUntil < 7) return 'critical';
        if (daysUntil < 30) return 'high';
        if (progress < 50) return 'high';
        return 'medium';
    }

    calculateDaysUntil(date) {
        const now = new Date();
        const deadline = new Date(date);
        return Math.ceil((deadline - now) / (24 * 60 * 60 * 1000));
    }

    calculateRecommendationDeadline(appDeadline) {
        const deadline = new Date(appDeadline);
        deadline.setDate(deadline.getDate() - 14); // 2 weeks before
        return deadline.toISOString().split('T')[0];
    }

    calculateRegistrationDeadline(testDate) {
        const test = new Date(testDate);
        test.setDate(test.getDate() - 30); // 30 days before
        return test.toISOString().split('T')[0];
    }

    calculateTargetScores() {
        const applications = this.workflowEngine?.getAllApplications() || [];
        const maxSAT = Math.max(...applications.map(a => a.collegeInfo?.avgSAT || 0));
        const maxACT = Math.max(...applications.map(a => a.collegeInfo?.avgACT || 0));

        const profile = this.userProfileSystem?.getProfile();
        const userSAT = profile.academic?.testScores?.sat?.composite;
        const userACT = profile.academic?.testScores?.act?.composite;

        return {
            sat: maxSAT,
            act: maxACT,
            needsImprovement: (userSAT && userSAT < maxSAT) || (userACT && userACT < maxACT)
        };
    }

    /**
     * Save timeline to profile
     */
    async saveToProfile() {
        try {
            const upcomingDeadlines = this.getUpcomingDeadlines(20);
            await this.userProfileSystem.updateProfile(
                upcomingDeadlines,
                'timeline.upcomingDeadlines'
            );
        } catch (error) {
            console.error('Error saving timeline:', error);
        }
    }

    /**
     * Get all events
     */
    getAllEvents() {
        return this.events;
    }

    /**
     * Register callback for updates
     */
    onUpdate(callback) {
        this.updateCallbacks.push(callback);
    }

    /**
     * Notify listeners
     */
    notifyListeners() {
        this.updateCallbacks.forEach(callback => {
            try {
                callback({
                    events: this.events,
                    upcoming: this.getUpcomingDeadlines(),
                    overdue: this.getOverdueItems(),
                    thisWeek: this.getEventsByTimeframe('week'),
                    thisMonth: this.getEventsByTimeframe('month')
                });
            } catch (error) {
                console.error('Error in timeline update callback:', error);
            }
        });
    }
}

// Create global instance
window.unifiedTimelineSystem = new UnifiedTimelineSystem();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedTimelineSystem;
}
