/**
 * 🎯 INTELLIGENT APPLICATION WORKFLOW ENGINE
 * Billion-Dollar Feature: Unified application management system
 *
 * This connects EVERYTHING:
 * - Applications → Essays → Deadlines → Test Scores → Scholarships
 * - Provides per-school checklists and progress tracking
 * - Integrates all features into ONE cohesive workflow
 */

class ApplicationWorkflowEngine {
    constructor() {
        this.userProfile = null;
        this.applications = [];
        this.requirements = new Map();
        this.deadlines = new Map();
        this.updateCallbacks = [];
    }

    /**
     * Initialize with user profile
     */
    async initialize(userProfileSystem) {
        try {
            console.log('🎯 Initializing Application Workflow Engine...');

            this.userProfileSystem = userProfileSystem;
            this.userProfile = userProfileSystem.getProfile();

            // Listen for profile updates
            userProfileSystem.onProfileUpdate((profile) => {
                this.userProfile = profile;
                this.syncApplications();
                this.notifyListeners();
            });

            // Load applications from profile
            this.syncApplications();

            console.log('✅ Application Workflow Engine initialized');
            return true;
        } catch (error) {
            console.error('❌ Workflow Engine initialization failed:', error);
            throw error;
        }
    }

    /**
     * Sync applications from user profile
     */
    syncApplications() {
        const profile = this.userProfile;
        if (!profile) return;

        // Combine all applications
        this.applications = [
            ...((profile.applications?.reach || []).map(app => ({ ...app, category: 'reach' }))),
            ...((profile.applications?.target || []).map(app => ({ ...app, category: 'target' }))),
            ...((profile.applications?.safety || []).map(app => ({ ...app, category: 'safety' }))),
            ...((profile.applications?.applied || []).map(app => ({ ...app, category: 'applied' })))
        ];

        // Generate requirements for each application
        this.applications.forEach(app => {
            this.generateRequirements(app);
        });
    }

    /**
     * Add a new college application
     */
    async addApplication(collegeData, category = 'target') {
        try {
            const application = {
                id: this.generateId(),
                collegeName: collegeData.name,
                category: category,
                addedDate: new Date().toISOString(),
                status: 'not-started',
                progress: 0,
                deadlines: {
                    earlyAction: collegeData.deadlines?.earlyAction || null,
                    earlyDecision: collegeData.deadlines?.earlyDecision || null,
                    regular: collegeData.deadlines?.regular || null,
                    selectedDeadline: collegeData.deadlines?.regular || null
                },
                requirements: this.getCollegeRequirements(collegeData),
                collegeInfo: {
                    location: collegeData.location,
                    type: collegeData.type,
                    size: collegeData.size,
                    admissionRate: collegeData.admissionRate,
                    avgSAT: collegeData.avgSAT,
                    avgACT: collegeData.avgACT,
                    tuition: collegeData.tuition,
                    website: collegeData.website
                },
                fitScore: null,
                admissionChance: null,
                notes: [],
                linkedEssays: [],
                linkedScholarships: [],
                testScoresSubmitted: false,
                recommendationsSubmitted: false,
                financialAidSubmitted: false
            };

            // Calculate fit score and admission chance
            application.fitScore = await this.calculateFitScore(application);
            application.admissionChance = await this.calculateAdmissionChance(application);

            // Add to appropriate category in profile
            const categoryKey = category === 'applied' ? 'applied' : category;
            const currentApps = this.userProfile.applications[categoryKey] || [];
            currentApps.push(application);

            await this.userProfileSystem.updateProfile(
                currentApps,
                `applications.${categoryKey}`
            );

            // Generate requirements
            this.generateRequirements(application);

            console.log(`✅ Added application: ${application.collegeName}`);
            this.notifyListeners();

            return application;
        } catch (error) {
            console.error('❌ Failed to add application:', error);
            throw error;
        }
    }

    /**
     * Get requirements for a specific college
     */
    getCollegeRequirements(collegeData) {
        // Default requirements template
        const requirements = {
            commonApp: {
                type: 'form',
                name: 'Common Application',
                required: true,
                completed: false,
                url: 'https://www.commonapp.org'
            },
            essays: [],
            testScores: {
                type: 'test-scores',
                name: 'Test Scores',
                required: true,
                completed: false,
                testOptional: collegeData.testOptional || false,
                requirements: {
                    sat: collegeData.avgSAT ? `SAT (avg: ${collegeData.avgSAT})` : 'SAT',
                    act: collegeData.avgACT ? `ACT (avg: ${collegeData.avgACT})` : 'ACT'
                }
            },
            recommendations: {
                type: 'recommendations',
                name: 'Letters of Recommendation',
                required: true,
                completed: false,
                count: 2,
                submitted: 0,
                details: '2 teacher recommendations required'
            },
            transcript: {
                type: 'document',
                name: 'Official Transcript',
                required: true,
                completed: false,
                notes: 'Request from school counselor'
            },
            financialAid: {
                type: 'financial',
                name: 'Financial Aid Forms',
                required: false,
                completed: false,
                forms: ['FAFSA', 'CSS Profile']
            },
            applicationFee: {
                type: 'payment',
                name: 'Application Fee',
                required: true,
                completed: false,
                amount: collegeData.applicationFee || 75,
                waiverAvailable: true
            }
        };

        // Add essay requirements (college-specific)
        requirements.essays = this.getEssayRequirements(collegeData.collegeName);

        return requirements;
    }

    /**
     * Get essay requirements for a college
     */
    getEssayRequirements(collegeName) {
        // Common App essay (all schools)
        const essays = [
            {
                id: `${collegeName}-common-app`,
                type: 'common-app',
                name: 'Common Application Essay',
                prompt: 'Choose one Common App prompt (650 words)',
                wordLimit: 650,
                required: true,
                completed: false,
                linkedEssayId: null
            }
        ];

        // Add supplemental essays based on college
        // This would normally come from a database
        const supplementalCounts = {
            'Stanford University': 3,
            'Harvard University': 1,
            'MIT': 5,
            'Yale University': 2,
            'Princeton University': 2,
            'default': 2
        };

        const count = supplementalCounts[collegeName] || supplementalCounts['default'];

        for (let i = 1; i <= count; i++) {
            essays.push({
                id: `${collegeName}-supplemental-${i}`,
                type: 'supplemental',
                name: `Supplemental Essay ${i}`,
                prompt: `${collegeName} supplemental essay ${i} (check college website for exact prompt)`,
                wordLimit: 250,
                required: true,
                completed: false,
                linkedEssayId: null
            });
        }

        return essays;
    }

    /**
     * Generate comprehensive requirements checklist for an application
     */
    generateRequirements(application) {
        const requirements = {
            applicationId: application.id,
            collegeName: application.collegeName,
            overallProgress: 0,
            items: []
        };

        // 1. Common Application
        requirements.items.push({
            id: `${application.id}-commonapp`,
            category: 'application',
            name: 'Common Application Form',
            description: 'Complete and submit the Common Application',
            required: true,
            completed: application.status === 'submitted' || application.status === 'accepted',
            dueDate: application.deadlines.selectedDeadline,
            priority: 'high',
            estimatedTime: 120, // minutes
            dependencies: []
        });

        // 2. Essays
        const essayReqs = application.requirements?.essays || [];
        essayReqs.forEach((essay, index) => {
            requirements.items.push({
                id: `${application.id}-essay-${index}`,
                category: 'essay',
                name: essay.name,
                description: essay.prompt,
                required: essay.required,
                completed: essay.completed,
                linkedEssayId: essay.linkedEssayId,
                wordLimit: essay.wordLimit,
                dueDate: application.deadlines.selectedDeadline,
                priority: essay.type === 'common-app' ? 'critical' : 'high',
                estimatedTime: 240,
                dependencies: [],
                actions: [
                    {
                        type: 'create-essay',
                        label: 'Start Writing',
                        handler: 'openEssayCoach'
                    },
                    {
                        type: 'link-essay',
                        label: 'Link Existing Essay',
                        handler: 'linkExistingEssay'
                    }
                ]
            });
        });

        // 3. Test Scores
        const testScoreReq = application.requirements?.testScores;
        if (testScoreReq && testScoreReq.required) {
            const userScores = this.userProfile?.academic?.testScores;
            const hasScores = userScores?.sat?.composite || userScores?.act?.composite;
            const meetsRequirement = this.checkTestScoreRequirement(application, userScores);

            requirements.items.push({
                id: `${application.id}-test-scores`,
                category: 'test-scores',
                name: 'Standardized Test Scores',
                description: testScoreReq.testOptional
                    ? 'Test optional - submit if scores strengthen application'
                    : 'Submit SAT or ACT scores',
                required: !testScoreReq.testOptional,
                completed: hasScores && meetsRequirement,
                currentScores: userScores,
                targetScores: {
                    sat: application.collegeInfo?.avgSAT,
                    act: application.collegeInfo?.avgACT
                },
                dueDate: application.deadlines.selectedDeadline,
                priority: meetsRequirement ? 'medium' : 'high',
                estimatedTime: 0,
                dependencies: [],
                actions: [
                    {
                        type: 'practice-test',
                        label: 'Practice Test',
                        handler: 'openTestPrep'
                    },
                    {
                        type: 'submit-scores',
                        label: 'Submit Scores',
                        handler: 'submitTestScores'
                    }
                ]
            });
        }

        // 4. Recommendations
        const recReq = application.requirements?.recommendations;
        if (recReq && recReq.required) {
            const userRecs = this.userProfile?.recommendations?.teachers || [];
            const completedRecs = userRecs.filter(r => r.submitted).length;

            requirements.items.push({
                id: `${application.id}-recommendations`,
                category: 'recommendations',
                name: 'Letters of Recommendation',
                description: `${recReq.count} teacher recommendations required`,
                required: true,
                completed: completedRecs >= recReq.count,
                progress: `${completedRecs}/${recReq.count}`,
                dueDate: this.getRecommendationDeadline(application.deadlines.selectedDeadline),
                priority: 'critical',
                estimatedTime: 30,
                dependencies: [],
                actions: [
                    {
                        type: 'request-rec',
                        label: 'Request Recommendation',
                        handler: 'requestRecommendation'
                    }
                ]
            });
        }

        // 5. Transcript
        requirements.items.push({
            id: `${application.id}-transcript`,
            category: 'document',
            name: 'Official Transcript',
            description: 'Request official transcript from school counselor',
            required: true,
            completed: false,
            dueDate: application.deadlines.selectedDeadline,
            priority: 'high',
            estimatedTime: 15,
            dependencies: []
        });

        // 6. Financial Aid (if needed)
        if (this.userProfile?.collegePreferences?.financialAidNeeded) {
            requirements.items.push({
                id: `${application.id}-fafsa`,
                category: 'financial',
                name: 'FAFSA',
                description: 'Complete Free Application for Federal Student Aid',
                required: false,
                completed: this.userProfile?.financial?.fafsaCompleted || false,
                dueDate: this.getFafsaDeadline(application.deadlines.selectedDeadline),
                priority: 'high',
                estimatedTime: 60,
                dependencies: [],
                actions: [
                    {
                        type: 'external-link',
                        label: 'Complete FAFSA',
                        url: 'https://studentaid.gov/fafsa'
                    }
                ]
            });

            requirements.items.push({
                id: `${application.id}-css-profile`,
                category: 'financial',
                name: 'CSS Profile',
                description: 'Complete CSS Profile for institutional aid',
                required: false,
                completed: this.userProfile?.financial?.cssProfileCompleted || false,
                dueDate: this.getFafsaDeadline(application.deadlines.selectedDeadline),
                priority: 'medium',
                estimatedTime: 45,
                dependencies: [],
                actions: [
                    {
                        type: 'external-link',
                        label: 'Complete CSS Profile',
                        url: 'https://cssprofile.collegeboard.org/'
                    }
                ]
            });
        }

        // 7. Application Fee
        requirements.items.push({
            id: `${application.id}-fee`,
            category: 'payment',
            name: 'Application Fee',
            description: `Pay application fee ($${application.requirements?.applicationFee?.amount || 75})`,
            required: true,
            completed: application.requirements?.applicationFee?.completed || false,
            amount: application.requirements?.applicationFee?.amount || 75,
            waiverAvailable: true,
            dueDate: application.deadlines.selectedDeadline,
            priority: 'low',
            estimatedTime: 5,
            dependencies: [`${application.id}-commonapp`]
        });

        // Calculate overall progress
        const completedItems = requirements.items.filter(item => item.completed).length;
        requirements.overallProgress = Math.round((completedItems / requirements.items.length) * 100);

        // Store in map
        this.requirements.set(application.id, requirements);

        return requirements;
    }

    /**
     * Get requirements for a specific application
     */
    getRequirements(applicationId) {
        return this.requirements.get(applicationId);
    }

    /**
     * Get all applications
     */
    getAllApplications() {
        return this.applications;
    }

    /**
     * Get application by ID
     */
    getApplication(applicationId) {
        return this.applications.find(app => app.id === applicationId);
    }

    /**
     * Update application status
     */
    async updateApplicationStatus(applicationId, status) {
        const application = this.getApplication(applicationId);
        if (!application) return false;

        application.status = status;

        // Update in profile
        await this.saveApplications();
        this.notifyListeners();

        return true;
    }

    /**
     * Mark requirement as completed
     */
    async completeRequirement(applicationId, requirementId) {
        const requirements = this.requirements.get(applicationId);
        if (!requirements) return false;

        const item = requirements.items.find(i => i.id === requirementId);
        if (item) {
            item.completed = true;

            // Recalculate progress
            const completedItems = requirements.items.filter(i => i.completed).length;
            requirements.overallProgress = Math.round((completedItems / requirements.items.length) * 100);

            // Update application progress
            const application = this.getApplication(applicationId);
            if (application) {
                application.progress = requirements.overallProgress;
                await this.saveApplications();
            }

            this.notifyListeners();
            return true;
        }

        return false;
    }

    /**
     * Link essay to application requirement
     */
    async linkEssay(applicationId, requirementId, essayId) {
        const requirements = this.requirements.get(applicationId);
        if (!requirements) return false;

        const item = requirements.items.find(i => i.id === requirementId && i.category === 'essay');
        if (item) {
            item.linkedEssayId = essayId;
            item.completed = true;

            // Update application
            const application = this.getApplication(applicationId);
            if (application) {
                if (!application.linkedEssays) application.linkedEssays = [];
                application.linkedEssays.push(essayId);
                await this.saveApplications();
            }

            this.notifyListeners();
            return true;
        }

        return false;
    }

    /**
     * Calculate fit score based on user profile and college data
     */
    async calculateFitScore(application) {
        try {
            const profile = this.userProfile;
            let fitScore = 0;
            let factors = [];

            // Academic Fit (40%)
            const academicFit = this.calculateAcademicFit(application);
            fitScore += academicFit * 0.4;
            factors.push({ name: 'Academic Match', score: academicFit, weight: 0.4 });

            // Location Preference (15%)
            const locationFit = this.calculateLocationFit(application);
            fitScore += locationFit * 0.15;
            factors.push({ name: 'Location', score: locationFit, weight: 0.15 });

            // Size/Type Preference (15%)
            const sizeFit = this.calculateSizeFit(application);
            fitScore += sizeFit * 0.15;
            factors.push({ name: 'School Size/Type', score: sizeFit, weight: 0.15 });

            // Financial Fit (20%)
            const financialFit = this.calculateFinancialFit(application);
            fitScore += financialFit * 0.2;
            factors.push({ name: 'Financial', score: financialFit, weight: 0.2 });

            // Program/Major Fit (10%)
            const programFit = this.calculateProgramFit(application);
            fitScore += programFit * 0.1;
            factors.push({ name: 'Program/Major', score: programFit, weight: 0.1 });

            return {
                overall: Math.round(fitScore),
                factors: factors,
                reasoning: this.generateFitReasoning(factors)
            };
        } catch (error) {
            console.error('Error calculating fit score:', error);
            return { overall: 50, factors: [], reasoning: 'Unable to calculate fit score' };
        }
    }

    /**
     * Calculate admission chance based on user stats and college data
     */
    async calculateAdmissionChance(application) {
        try {
            const profile = this.userProfile;
            const collegeInfo = application.collegeInfo;

            // Simple calculation based on test scores and GPA
            let chance = 50; // Start at 50%

            // Test scores comparison
            const userSAT = profile.academic?.testScores?.sat?.composite;
            const collegeSAT = collegeInfo?.avgSAT;

            if (userSAT && collegeSAT) {
                const satDiff = userSAT - collegeSAT;
                chance += (satDiff / 10); // +/- 10% per 100 points
            }

            // GPA comparison
            const userGPA = profile.academic?.gpa?.unweighted;
            if (userGPA) {
                if (userGPA >= 3.8) chance += 10;
                else if (userGPA >= 3.5) chance += 5;
                else if (userGPA < 3.0) chance -= 10;
            }

            // Admission rate factor
            if (collegeInfo?.admissionRate) {
                const admissionRate = parseFloat(collegeInfo.admissionRate);
                if (admissionRate < 0.1) chance *= 0.8; // Very selective
                else if (admissionRate > 0.5) chance *= 1.2; // Less selective
            }

            // Clamp between 5% and 95%
            chance = Math.max(5, Math.min(95, chance));

            return {
                percentage: Math.round(chance),
                confidence: 'medium',
                factors: [
                    userSAT && collegeSAT ? `Your SAT (${userSAT}) vs. avg (${collegeSAT})` : null,
                    userGPA ? `Your GPA: ${userGPA}` : null,
                    collegeInfo?.admissionRate ? `Admission rate: ${(parseFloat(collegeInfo.admissionRate) * 100).toFixed(1)}%` : null
                ].filter(Boolean)
            };
        } catch (error) {
            console.error('Error calculating admission chance:', error);
            return { percentage: 50, confidence: 'low', factors: [] };
        }
    }

    // Helper calculation methods
    calculateAcademicFit(application) {
        const profile = this.userProfile;
        const collegeInfo = application.collegeInfo;

        let score = 50;

        // Compare test scores
        const userSAT = profile.academic?.testScores?.sat?.composite;
        const collegeSAT = collegeInfo?.avgSAT;

        if (userSAT && collegeSAT) {
            const diff = Math.abs(userSAT - collegeSAT);
            if (diff < 50) score += 30;
            else if (diff < 100) score += 20;
            else if (diff < 150) score += 10;
        }

        return Math.min(100, score);
    }

    calculateLocationFit(application) {
        const profile = this.userProfile;
        const preferredLocations = profile.collegePreferences?.preferredLocations || [];
        const collegeLocation = application.collegeInfo?.location;

        if (preferredLocations.length === 0) return 75; // No preference

        // Check if college location matches preferences
        const matches = preferredLocations.some(pref =>
            collegeLocation?.toLowerCase().includes(pref.toLowerCase())
        );

        return matches ? 95 : 50;
    }

    calculateSizeFit(application) {
        return 75; // Placeholder - would check school size preferences
    }

    calculateFinancialFit(application) {
        const profile = this.userProfile;
        const maxTuition = profile.collegePreferences?.maxTuition;
        const collegeTuition = application.collegeInfo?.tuition;

        if (!maxTuition || !collegeTuition) return 75;

        if (collegeTuition <= maxTuition) return 100;
        if (collegeTuition <= maxTuition * 1.2) return 70;
        return 40;
    }

    calculateProgramFit(application) {
        return 75; // Placeholder - would check major offerings
    }

    generateFitReasoning(factors) {
        const topFactors = factors
            .sort((a, b) => (b.score * b.weight) - (a.score * a.weight))
            .slice(0, 3);

        return topFactors.map(f => `${f.name}: ${f.score}/100`).join(', ');
    }

    // Utility methods
    checkTestScoreRequirement(application, userScores) {
        const avgSAT = application.collegeInfo?.avgSAT;
        const userSAT = userScores?.sat?.composite;

        if (userSAT && avgSAT) {
            return userSAT >= (avgSAT - 100); // Within 100 points
        }

        return false;
    }

    getRecommendationDeadline(appDeadline) {
        if (!appDeadline) return null;
        const deadline = new Date(appDeadline);
        deadline.setDate(deadline.getDate() - 14); // 2 weeks before app deadline
        return deadline.toISOString();
    }

    getFafsaDeadline(appDeadline) {
        if (!appDeadline) return null;
        const deadline = new Date(appDeadline);
        deadline.setDate(deadline.getDate() - 7); // 1 week before app deadline
        return deadline.toISOString();
    }

    generateId() {
        return `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async saveApplications() {
        // Group applications back into categories
        const categorized = {
            reach: this.applications.filter(a => a.category === 'reach'),
            target: this.applications.filter(a => a.category === 'target'),
            safety: this.applications.filter(a => a.category === 'safety'),
            applied: this.applications.filter(a => a.category === 'applied')
        };

        await this.userProfileSystem.updateProfile(categorized, 'applications');
    }

    onUpdate(callback) {
        this.updateCallbacks.push(callback);
    }

    notifyListeners() {
        this.updateCallbacks.forEach(callback => {
            try {
                callback({
                    applications: this.applications,
                    requirements: Array.from(this.requirements.values())
                });
            } catch (error) {
                console.error('Error in workflow update callback:', error);
            }
        });
    }
}

// Create global instance
window.applicationWorkflowEngine = new ApplicationWorkflowEngine();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApplicationWorkflowEngine;
}
