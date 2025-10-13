/**
 * 🎯 PLATFORM INTEGRATION LAYER
 * Billion-Dollar Feature: Single initialization point for entire platform
 *
 * This is the "brain" that connects everything:
 * - Initializes all systems in correct order
 * - Manages data flow between systems
 * - Provides unified API for pages
 * - Handles real-time synchronization
 */

class CollegeClimbPlatform {
    constructor() {
        this.initialized = false;
        this.systems = {
            auth: null,
            profile: null,
            workflow: null,
            recommendations: null,
            scholarships: null,
            timeline: null
        };
        this.currentUser = null;
    }

    /**
     * Initialize the entire platform
     * Call this ONCE on page load after authentication
     */
    async initialize() {
        try {
            console.log('🚀 Initializing College Climb Platform...');

            if (this.initialized) {
                console.warn('Platform already initialized');
                return true;
            }

            // Step 1: Initialize Authentication
            console.log('1/6 Initializing Authentication...');
            if (!window.authManager) {
                throw new Error('Auth Manager not found. Include unified-auth.js first.');
            }

            this.systems.auth = window.authManager;
            await this.systems.auth.initialize();

            // Wait for user to be authenticated
            const user = await this.waitForAuth();
            if (!user) {
                console.log('❌ User not authenticated');
                return false;
            }

            this.currentUser = user;

            // Step 2: Initialize User Profile System
            console.log('2/6 Initializing User Profile System...');
            this.systems.profile = window.userProfileSystem;
            await this.systems.profile.initialize(user.uid);

            // Step 3: Initialize Application Workflow Engine
            console.log('3/6 Initializing Application Workflow Engine...');
            this.systems.workflow = window.applicationWorkflowEngine;
            await this.systems.workflow.initialize(this.systems.profile);

            // Step 4: Initialize Scholarship Intelligence System
            console.log('4/6 Initializing Scholarship Intelligence System...');
            this.systems.scholarships = window.scholarshipIntelligenceSystem;
            await this.systems.scholarships.initialize(this.systems.profile, this.systems.workflow);

            // Step 5: Initialize Unified Timeline System
            console.log('5/6 Initializing Unified Timeline System...');
            this.systems.timeline = window.unifiedTimelineSystem;
            await this.systems.timeline.initialize(
                this.systems.profile,
                this.systems.workflow,
                this.systems.scholarships
            );

            // Step 6: Initialize Smart Recommendations Engine
            console.log('6/6 Initializing Smart Recommendations Engine...');
            this.systems.recommendations = window.smartRecommendationsEngine;
            await this.systems.recommendations.initialize(
                this.systems.profile,
                this.systems.workflow
            );

            // Make platform globally available
            window.collegeClimb = this;

            this.initialized = true;
            console.log('✅ College Climb Platform fully initialized!');

            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('platformReady', {
                detail: { platform: this }
            }));

            return true;
        } catch (error) {
            console.error('❌ Platform initialization failed:', error);
            throw error;
        }
    }

    /**
     * Wait for user authentication
     */
    async waitForAuth(timeout = 5000) {
        return new Promise((resolve) => {
            const checkAuth = () => {
                const user = this.systems.auth.getCurrentUser();
                if (user) {
                    resolve(user);
                }
            };

            // Check immediately
            checkAuth();

            // Listen for auth changes
            this.systems.auth.onAuthStateChange((user) => {
                if (user) resolve(user);
            });

            // Timeout
            setTimeout(() => resolve(null), timeout);
        });
    }

    /**
     * Get user profile
     */
    getProfile() {
        return this.systems.profile?.getProfile();
    }

    /**
     * Update user profile
     */
    async updateProfile(updates, path = null) {
        return await this.systems.profile?.updateProfile(updates, path);
    }

    /**
     * Get all applications
     */
    getApplications() {
        return this.systems.workflow?.getAllApplications() || [];
    }

    /**
     * Add new application
     */
    async addApplication(collegeData, category = 'target') {
        return await this.systems.workflow?.addApplication(collegeData, category);
    }

    /**
     * Get application requirements
     */
    getApplicationRequirements(applicationId) {
        return this.systems.workflow?.getRequirements(applicationId);
    }

    /**
     * Complete a requirement
     */
    async completeRequirement(applicationId, requirementId) {
        return await this.systems.workflow?.completeRequirement(applicationId, requirementId);
    }

    /**
     * Link essay to application
     */
    async linkEssayToApplication(applicationId, requirementId, essayId) {
        return await this.systems.workflow?.linkEssay(applicationId, requirementId, essayId);
    }

    /**
     * Get personalized recommendations
     */
    getRecommendations() {
        return this.systems.recommendations?.getAllRecommendations() || [];
    }

    /**
     * Get next recommended action
     */
    getNextAction() {
        return this.systems.recommendations?.getNextAction();
    }

    /**
     * Get scholarship matches
     */
    getScholarshipMatches(count = 10) {
        return this.systems.scholarships?.getTopMatches(count) || [];
    }

    /**
     * Apply to scholarship
     */
    async applyToScholarship(scholarshipId, notes = '') {
        return await this.systems.scholarships?.applyToScholarship(scholarshipId, notes);
    }

    /**
     * Get unified timeline
     */
    getTimeline() {
        return this.systems.timeline?.getAllEvents() || [];
    }

    /**
     * Get upcoming deadlines
     */
    getUpcomingDeadlines(count = 10) {
        return this.systems.timeline?.getUpcomingDeadlines(count) || [];
    }

    /**
     * Get dashboard summary data
     */
    getDashboardSummary() {
        const profile = this.getProfile();
        const applications = this.getApplications();
        const recommendations = this.getRecommendations();
        const scholarships = this.getScholarshipMatches();
        const timeline = this.getTimeline();

        return {
            user: {
                name: `${profile.basicInfo?.firstName} ${profile.basicInfo?.lastName}`,
                email: profile.basicInfo?.email,
                graduationYear: profile.basicInfo?.graduationYear,
                profileCompleteness: profile.metadata?.profileCompleteness || 0
            },
            stats: {
                applications: {
                    total: applications.length,
                    reach: applications.filter(a => a.category === 'reach').length,
                    target: applications.filter(a => a.category === 'target').length,
                    safety: applications.filter(a => a.category === 'safety').length,
                    completed: applications.filter(a => a.status === 'submitted').length,
                    inProgress: applications.filter(a => a.status === 'in-progress').length
                },
                essays: {
                    total: this.countTotalEssays(),
                    completed: this.countCompletedEssays(),
                    inProgress: this.countTotalEssays() - this.countCompletedEssays()
                },
                scholarships: {
                    matched: scholarships.length,
                    applied: profile.scholarships?.totalApplied || 0,
                    won: profile.scholarships?.totalWon || 0,
                    potentialValue: profile.scholarships?.potentialValue || 0
                },
                testScores: {
                    sat: profile.academic?.testScores?.sat?.composite,
                    act: profile.academic?.testScores?.act?.composite,
                    targetSAT: this.calculateTargetSAT(),
                    targetACT: this.calculateTargetACT()
                }
            },
            nextActions: recommendations.slice(0, 5),
            upcomingDeadlines: this.getUpcomingDeadlines(5),
            insights: this.systems.recommendations?.getInsights() || []
        };
    }

    /**
     * Get college discovery data with fit scores
     */
    async discoverColleges(filters = {}) {
        // This would call the college search API
        // and augment results with fit scores

        try {
            const response = await fetch('/api/college-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filters)
            });

            if (!response.ok) return [];

            const colleges = await response.json();

            // Enhance with fit scores
            const enhanced = await Promise.all(
                colleges.map(async (college) => {
                    const application = {
                        id: 'temp',
                        collegeName: college.name,
                        collegeInfo: college
                    };

                    const fitScore = await this.systems.workflow?.calculateFitScore(application);
                    const admissionChance = await this.systems.workflow?.calculateAdmissionChance(application);

                    return {
                        ...college,
                        fitScore: fitScore?.overall,
                        admissionChance: admissionChance?.percentage,
                        recommended: fitScore?.overall > 70
                    };
                })
            );

            return enhanced;
        } catch (error) {
            console.error('Error discovering colleges:', error);
            return [];
        }
    }

    /**
     * Get essay writing insights
     */
    getEssayInsights(essayContent) {
        // This would analyze the essay and provide insights
        return {
            wordCount: essayContent?.split(' ').length || 0,
            canReuseFor: this.findEssayReuseOpportunities(essayContent),
            linkedApplications: this.getEssayApplications(essayContent)
        };
    }

    /**
     * Get test prep recommendations
     */
    getTestPrepRecommendations() {
        const profile = this.getProfile();
        const applications = this.getApplications();

        const userSAT = profile.academic?.testScores?.sat?.composite;
        const targetSAT = this.calculateTargetSAT();

        const userACT = profile.academic?.testScores?.act?.composite;
        const targetACT = this.calculateTargetACT();

        return {
            currentSAT: userSAT,
            targetSAT: targetSAT,
            satImprovement: targetSAT - (userSAT || 0),
            needsSATImprovement: userSAT && userSAT < targetSAT,

            currentACT: userACT,
            targetACT: targetACT,
            actImprovement: targetACT - (userACT || 0),
            needsACTImprovement: userACT && userACT < targetACT,

            recommendation: this.generateTestPrepRecommendation(userSAT, targetSAT, userACT, targetACT),

            targetSchools: applications
                .filter(a => {
                    const avgSAT = a.collegeInfo?.avgSAT;
                    return userSAT && avgSAT && userSAT < avgSAT;
                })
                .map(a => ({
                    name: a.collegeName,
                    avgSAT: a.collegeInfo?.avgSAT,
                    improvement: a.collegeInfo?.avgSAT - userSAT
                }))
        };
    }

    /**
     * Subscribe to all platform updates
     */
    onUpdate(callback) {
        // Subscribe to all systems
        this.systems.profile?.onProfileUpdate(() => callback('profile'));
        this.systems.workflow?.onUpdate(() => callback('workflow'));
        this.systems.recommendations?.onUpdate(() => callback('recommendations'));
        this.systems.scholarships?.onUpdate(() => callback('scholarships'));
        this.systems.timeline?.onUpdate(() => callback('timeline'));
    }

    /**
     * Helper methods
     */
    countTotalEssays() {
        const applications = this.getApplications();
        let total = 0;

        applications.forEach(app => {
            const requirements = this.systems.workflow?.getRequirements(app.id);
            if (requirements) {
                total += requirements.items.filter(item => item.category === 'essay').length;
            }
        });

        return total;
    }

    countCompletedEssays() {
        const applications = this.getApplications();
        let completed = 0;

        applications.forEach(app => {
            const requirements = this.systems.workflow?.getRequirements(app.id);
            if (requirements) {
                completed += requirements.items.filter(
                    item => item.category === 'essay' && item.completed
                ).length;
            }
        });

        return completed;
    }

    calculateTargetSAT() {
        const applications = this.getApplications();
        if (applications.length === 0) return null;

        const scores = applications
            .map(a => a.collegeInfo?.avgSAT)
            .filter(Boolean);

        return scores.length > 0 ? Math.max(...scores) : null;
    }

    calculateTargetACT() {
        const applications = this.getApplications();
        if (applications.length === 0) return null;

        const scores = applications
            .map(a => a.collegeInfo?.avgACT)
            .filter(Boolean);

        return scores.length > 0 ? Math.max(...scores) : null;
    }

    generateTestPrepRecommendation(userSAT, targetSAT, userACT, targetACT) {
        if (!userSAT && !userACT) {
            return 'Take a practice test to establish your baseline score';
        }

        if (userSAT && targetSAT && userSAT < targetSAT) {
            const improvement = targetSAT - userSAT;
            return `Focus on improving your SAT by ${improvement} points to match your target schools`;
        }

        if (userACT && targetACT && userACT < targetACT) {
            const improvement = targetACT - userACT;
            return `Focus on improving your ACT by ${improvement} points to match your target schools`;
        }

        return 'Your test scores are competitive for your target schools';
    }

    findEssayReuseOpportunities(essayContent) {
        // Analyze essay and find where it can be reused
        const applications = this.getApplications();
        const wordCount = essayContent?.split(' ').length || 0;

        const opportunities = [];

        applications.forEach(app => {
            const requirements = this.systems.workflow?.getRequirements(app.id);
            if (requirements) {
                const essays = requirements.items.filter(item =>
                    item.category === 'essay' &&
                    !item.completed &&
                    Math.abs(item.wordLimit - wordCount) < 100
                );

                essays.forEach(essay => {
                    opportunities.push({
                        college: app.collegeName,
                        essay: essay.name,
                        wordLimit: essay.wordLimit,
                        adaptation: Math.abs(essay.wordLimit - wordCount) < 50 ? 'minimal' : 'moderate'
                    });
                });
            }
        });

        return opportunities;
    }

    getEssayApplications(essayContent) {
        // Find applications that are already using this essay
        // This would check linkedEssayId in requirements
        return [];
    }

    /**
     * Check if platform is ready
     */
    isReady() {
        return this.initialized;
    }

    /**
     * Get initialization status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            user: this.currentUser,
            systems: {
                auth: !!this.systems.auth,
                profile: !!this.systems.profile,
                workflow: !!this.systems.workflow,
                recommendations: !!this.systems.recommendations,
                scholarships: !!this.systems.scholarships,
                timeline: !!this.systems.timeline
            }
        };
    }
}

// Create global platform instance
window.CollegeClimbPlatform = CollegeClimbPlatform;

// Auto-initialize helper
window.initializeCollegeClimb = async function() {
    if (!window.collegeClimbPlatform) {
        window.collegeClimbPlatform = new CollegeClimbPlatform();
    }

    try {
        await window.collegeClimbPlatform.initialize();
        console.log('✅ Platform ready for use');
        return window.collegeClimbPlatform;
    } catch (error) {
        console.error('❌ Failed to initialize platform:', error);
        throw error;
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CollegeClimbPlatform;
}
