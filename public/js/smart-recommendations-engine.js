/**
 * 🎯 SMART RECOMMENDATIONS ENGINE
 * Billion-Dollar Feature: AI-powered personalized guidance
 *
 * Analyzes user profile and provides:
 * - "What to do next" recommendations
 * - Acceptance probability predictions
 * - Strategic guidance based on real data
 * - Proactive alerts and suggestions
 */

class SmartRecommendationsEngine {
    constructor() {
        this.userProfile = null;
        this.workflowEngine = null;
        this.recommendations = [];
        this.insights = [];
        this.updateCallbacks = [];
    }

    /**
     * Initialize with dependencies
     */
    async initialize(userProfileSystem, workflowEngine) {
        try {
            console.log('🎯 Initializing Smart Recommendations Engine...');

            this.userProfileSystem = userProfileSystem;
            this.workflowEngine = workflowEngine;
            this.userProfile = userProfileSystem.getProfile();

            // Listen for updates
            userProfileSystem.onProfileUpdate((profile) => {
                this.userProfile = profile;
                this.generateRecommendations();
            });

            workflowEngine.onUpdate(() => {
                this.generateRecommendations();
            });

            // Generate initial recommendations
            await this.generateRecommendations();

            console.log('✅ Smart Recommendations Engine initialized');
            return true;
        } catch (error) {
            console.error('❌ Recommendations Engine initialization failed:', error);
            throw error;
        }
    }

    /**
     * Generate personalized recommendations
     */
    async generateRecommendations() {
        try {
            this.recommendations = [];
            this.insights = [];

            // 1. Profile Completeness Recommendations
            this.checkProfileCompleteness();

            // 2. Application Strategy Recommendations
            this.checkApplicationStrategy();

            // 3. Essay Recommendations
            this.checkEssayProgress();

            // 4. Test Score Recommendations
            this.checkTestScores();

            // 5. Deadline Recommendations
            this.checkUpcomingDeadlines();

            // 6. Scholarship Opportunities
            this.checkScholarships();

            // 7. Activity & Strength Analysis
            this.analyzeStrengthsWeaknesses();

            // 8. Financial Aid Recommendations
            this.checkFinancialAid();

            // Sort by priority
            this.recommendations.sort((a, b) => {
                const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            });

            // Update profile with insights
            await this.saveInsights();

            // Notify listeners
            this.notifyListeners();

            return this.recommendations;
        } catch (error) {
            console.error('Error generating recommendations:', error);
            return [];
        }
    }

    /**
     * Check profile completeness
     */
    checkProfileCompleteness() {
        const profile = this.userProfile;
        const completeness = profile.metadata?.profileCompleteness || 0;

        if (completeness < 100) {
            const missingFields = [];

            // Check basic info
            if (!profile.basicInfo?.firstName) missingFields.push('first name');
            if (!profile.basicInfo?.lastName) missingFields.push('last name');
            if (!profile.basicInfo?.highSchool) missingFields.push('high school');
            if (!profile.basicInfo?.graduationYear) missingFields.push('graduation year');

            // Check academic info
            if (!profile.academic?.gpa?.unweighted) missingFields.push('GPA');
            if (!profile.academic?.testScores?.sat?.composite && !profile.academic?.testScores?.act?.composite) {
                missingFields.push('test scores');
            }

            // Check activities
            const hasActivities = Object.values(profile.activities || {}).some(arr => arr.length > 0);
            if (!hasActivities) missingFields.push('extracurricular activities');

            // Check preferences
            if (!profile.collegePreferences?.targetMajors?.length) missingFields.push('target majors');

            if (missingFields.length > 0) {
                this.recommendations.push({
                    id: 'complete-profile',
                    type: 'profile',
                    priority: 'high',
                    title: 'Complete Your Profile',
                    description: `Your profile is ${completeness}% complete. Add: ${missingFields.join(', ')}`,
                    action: {
                        type: 'navigate',
                        label: 'Complete Profile',
                        destination: '/profile'
                    },
                    impact: 'High',
                    reasoning: 'A complete profile enables better college matching and personalized recommendations.'
                });
            }
        }
    }

    /**
     * Check application strategy
     */
    checkApplicationStrategy() {
        const applications = this.workflowEngine?.getAllApplications() || [];

        if (applications.length === 0) {
            this.recommendations.push({
                id: 'start-applications',
                type: 'application',
                priority: 'critical',
                title: 'Start Your College Applications',
                description: 'You haven\'t added any colleges yet. Start by exploring colleges and building your list.',
                action: {
                    type: 'navigate',
                    label: 'Discover Colleges',
                    destination: '/discovery.html'
                },
                impact: 'Critical',
                reasoning: 'Building a balanced college list is the first step in the application process.'
            });
            return;
        }

        // Check for balanced list (reach, target, safety)
        const reach = applications.filter(a => a.category === 'reach').length;
        const target = applications.filter(a => a.category === 'target').length;
        const safety = applications.filter(a => a.category === 'safety').length;

        if (reach === 0 || target === 0 || safety === 0) {
            this.recommendations.push({
                id: 'balance-college-list',
                type: 'application',
                priority: 'high',
                title: 'Balance Your College List',
                description: `Your list: ${reach} reach, ${target} target, ${safety} safety schools. Aim for 2-4 of each.`,
                action: {
                    type: 'navigate',
                    label: 'Add More Colleges',
                    destination: '/discovery.html'
                },
                impact: 'High',
                reasoning: 'A balanced list maximizes your chances of admission while ensuring you have options.'
            });
        }

        // Check application progress
        const inProgress = applications.filter(a => a.progress < 100).length;
        if (inProgress > 0) {
            this.recommendations.push({
                id: 'complete-applications',
                type: 'application',
                priority: 'high',
                title: `${inProgress} Application${inProgress > 1 ? 's' : ''} Need Attention`,
                description: 'You have incomplete applications. Review requirements and complete missing items.',
                action: {
                    type: 'navigate',
                    label: 'View Applications',
                    destination: '/dashboard.html#applications'
                },
                impact: 'High',
                reasoning: 'Completing applications early reduces stress and improves application quality.'
            });
        }
    }

    /**
     * Check essay progress
     */
    checkEssayProgress() {
        const profile = this.userProfile;
        const applications = this.workflowEngine?.getAllApplications() || [];

        // Count required essays
        let totalEssaysNeeded = 0;
        let essaysCompleted = 0;

        applications.forEach(app => {
            const requirements = this.workflowEngine?.getRequirements(app.id);
            if (requirements) {
                const essayReqs = requirements.items.filter(item => item.category === 'essay');
                totalEssaysNeeded += essayReqs.length;
                essaysCompleted += essayReqs.filter(e => e.completed).length;
            }
        });

        if (totalEssaysNeeded > essaysCompleted) {
            const remaining = totalEssaysNeeded - essaysCompleted;
            this.recommendations.push({
                id: 'write-essays',
                type: 'essay',
                priority: 'critical',
                title: `${remaining} Essay${remaining > 1 ? 's' : ''} Need${remaining === 1 ? 's' : ''} to Be Written`,
                description: `You've completed ${essaysCompleted} of ${totalEssaysNeeded} required essays. Start writing!`,
                action: {
                    type: 'navigate',
                    label: 'Essay Coach',
                    destination: '/essaycoach.html'
                },
                impact: 'Critical',
                reasoning: 'Essays are a critical component of your application. Start early for best results.',
                estimatedTime: remaining * 4 * 60 // 4 hours per essay in minutes
            });
        }

        // Check for essay reuse opportunities
        const commonAppEssay = profile.essays?.commonApp;
        if (commonAppEssay && applications.length > 1) {
            this.insights.push({
                type: 'essay-reuse',
                title: 'Essay Reuse Opportunity',
                description: `Your Common App essay can be used for ${applications.length} schools.`,
                value: 'High'
            });
        }
    }

    /**
     * Check test scores
     */
    checkTestScores() {
        const profile = this.userProfile;
        const applications = this.workflowEngine?.getAllApplications() || [];

        const userSAT = profile.academic?.testScores?.sat?.composite;
        const userACT = profile.academic?.testScores?.act?.composite;

        if (!userSAT && !userACT) {
            this.recommendations.push({
                id: 'take-test',
                type: 'test-prep',
                priority: 'high',
                title: 'Take Standardized Tests',
                description: 'You haven\'t recorded any SAT or ACT scores. Most colleges require test scores.',
                action: {
                    type: 'navigate',
                    label: 'Start Test Prep',
                    destination: '/testprep-enhanced.html'
                },
                impact: 'High',
                reasoning: 'Standardized test scores are a key component of college applications.'
            });
            return;
        }

        // Compare user scores to target schools
        const targetSchools = applications.filter(app => {
            const avgSAT = app.collegeInfo?.avgSAT;
            return userSAT && avgSAT && userSAT < (avgSAT - 50);
        });

        if (targetSchools.length > 0) {
            const avgNeeded = Math.max(...targetSchools.map(s => s.collegeInfo?.avgSAT || 0));
            const improvement = avgNeeded - userSAT;

            this.recommendations.push({
                id: 'improve-test-scores',
                type: 'test-prep',
                priority: 'high',
                title: 'Consider Retaking SAT',
                description: `Your SAT (${userSAT}) is below the average for ${targetSchools.length} of your schools. Target: ${avgNeeded}+ (${improvement} point improvement needed)`,
                action: {
                    type: 'navigate',
                    label: 'Practice Tests',
                    destination: '/testprep-enhanced.html'
                },
                impact: 'High',
                reasoning: 'Improving your test scores could significantly increase your admission chances.',
                targetScore: avgNeeded,
                currentScore: userSAT,
                improvement: improvement
            });
        }
    }

    /**
     * Check upcoming deadlines
     */
    checkUpcomingDeadlines() {
        const applications = this.workflowEngine?.getAllApplications() || [];
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const upcomingDeadlines = applications.filter(app => {
            if (!app.deadlines?.selectedDeadline) return false;
            const deadline = new Date(app.deadlines.selectedDeadline);
            return deadline > now && deadline <= thirtyDaysFromNow;
        });

        if (upcomingDeadlines.length > 0) {
            upcomingDeadlines.forEach(app => {
                const deadline = new Date(app.deadlines.selectedDeadline);
                const daysUntil = Math.ceil((deadline - now) / (24 * 60 * 60 * 1000));

                this.recommendations.push({
                    id: `deadline-${app.id}`,
                    type: 'deadline',
                    priority: daysUntil <= 7 ? 'critical' : 'high',
                    title: `${app.collegeName} Deadline Approaching`,
                    description: `Application due in ${daysUntil} days (${deadline.toLocaleDateString()}). Current progress: ${app.progress}%`,
                    action: {
                        type: 'navigate',
                        label: 'View Requirements',
                        destination: `/dashboard.html#application-${app.id}`
                    },
                    impact: daysUntil <= 7 ? 'Critical' : 'High',
                    reasoning: 'Deadlines are firm. Ensure you have enough time to complete all requirements.',
                    deadline: app.deadlines.selectedDeadline,
                    daysRemaining: daysUntil
                });
            });
        }
    }

    /**
     * Check scholarship opportunities
     */
    checkScholarships() {
        const profile = this.userProfile;
        const scholarshipsApplied = profile.scholarships?.applied?.length || 0;

        if (scholarshipsApplied === 0) {
            this.recommendations.push({
                id: 'apply-scholarships',
                type: 'scholarship',
                priority: 'medium',
                title: 'Explore Scholarship Opportunities',
                description: 'You haven\'t applied to any scholarships yet. Find matches and start applying.',
                action: {
                    type: 'navigate',
                    label: 'Find Scholarships',
                    destination: '/scholarship.html'
                },
                impact: 'Medium',
                reasoning: 'Scholarships can significantly reduce college costs. Many have early deadlines.'
            });
        } else {
            // Calculate potential value
            const potentialValue = profile.scholarships?.potentialValue || 0;
            const totalWon = profile.scholarships?.totalWon || 0;

            this.insights.push({
                type: 'scholarship-progress',
                title: 'Scholarship Progress',
                description: `Applied: ${scholarshipsApplied} | Won: ${totalWon} | Potential Value: $${potentialValue.toLocaleString()}`,
                value: 'High'
            });
        }
    }

    /**
     * Analyze strengths and weaknesses
     */
    analyzeStrengthsWeaknesses() {
        const profile = this.userProfile;
        const strengths = [];
        const weaknesses = [];
        const opportunities = [];

        // Analyze GPA
        const gpa = profile.academic?.gpa?.unweighted;
        if (gpa) {
            if (gpa >= 3.8) {
                strengths.push('Strong GPA (3.8+)');
            } else if (gpa < 3.0) {
                weaknesses.push('GPA below 3.0');
                opportunities.push('Consider taking rigorous courses to demonstrate academic growth');
            }
        }

        // Analyze test scores
        const sat = profile.academic?.testScores?.sat?.composite;
        if (sat) {
            if (sat >= 1400) {
                strengths.push('Competitive SAT score');
            } else if (sat < 1200) {
                weaknesses.push('SAT score could be improved');
                opportunities.push('Consider test prep and retaking SAT');
            }
        }

        // Analyze activities
        const activityCount = Object.values(profile.activities || {})
            .reduce((sum, arr) => sum + arr.length, 0);

        if (activityCount >= 5) {
            strengths.push('Well-rounded extracurricular profile');
        } else if (activityCount < 2) {
            weaknesses.push('Limited extracurricular activities');
            opportunities.push('Join clubs or activities that align with your interests');
        }

        // Analyze leadership
        const leadership = profile.activities?.leadership?.length || 0;
        if (leadership >= 2) {
            strengths.push('Demonstrated leadership experience');
        } else if (leadership === 0) {
            opportunities.push('Seek leadership roles in activities you\'re passionate about');
        }

        // Save to profile
        this.userProfile.aiInsights.strengthsWeaknesses = {
            strengths,
            weaknesses,
            opportunities
        };

        // Create recommendation if there are actionable opportunities
        if (opportunities.length > 0) {
            this.recommendations.push({
                id: 'strengthen-profile',
                type: 'improvement',
                priority: 'medium',
                title: 'Opportunities to Strengthen Your Profile',
                description: opportunities[0], // Show top opportunity
                action: {
                    type: 'view-insights',
                    label: 'View All Insights',
                    destination: '/dashboard.html#insights'
                },
                impact: 'Medium',
                reasoning: 'Small improvements can significantly impact your application competitiveness.',
                allOpportunities: opportunities
            });
        }

        // Store insights
        if (strengths.length > 0) {
            this.insights.push({
                type: 'strengths',
                title: 'Your Strengths',
                description: strengths.join(', '),
                value: 'High'
            });
        }
    }

    /**
     * Check financial aid status
     */
    checkFinancialAid() {
        const profile = this.userProfile;

        if (profile.collegePreferences?.financialAidNeeded) {
            const fafsaCompleted = profile.financial?.fafsaCompleted;
            const cssCompleted = profile.financial?.cssProfileCompleted;

            if (!fafsaCompleted) {
                this.recommendations.push({
                    id: 'complete-fafsa',
                    type: 'financial',
                    priority: 'high',
                    title: 'Complete FAFSA',
                    description: 'The FAFSA is required for federal financial aid. Complete it as soon as possible.',
                    action: {
                        type: 'external-link',
                        label: 'Start FAFSA',
                        url: 'https://studentaid.gov/fafsa'
                    },
                    impact: 'High',
                    reasoning: 'Filing FAFSA early maximizes your financial aid eligibility.'
                });
            }

            if (!cssCompleted) {
                this.recommendations.push({
                    id: 'complete-css',
                    type: 'financial',
                    priority: 'medium',
                    title: 'Consider CSS Profile',
                    description: 'Many private colleges require CSS Profile for institutional aid.',
                    action: {
                        type: 'external-link',
                        label: 'Learn More',
                        url: 'https://cssprofile.collegeboard.org/'
                    },
                    impact: 'Medium',
                    reasoning: 'CSS Profile unlocks additional financial aid at many institutions.'
                });
            }
        }
    }

    /**
     * Get personalized "What to do next" recommendation
     */
    getNextAction() {
        if (this.recommendations.length === 0) {
            return {
                title: 'You\'re All Caught Up!',
                description: 'Great work! Check back later for new recommendations.',
                type: 'success'
            };
        }

        // Return highest priority recommendation
        const topRec = this.recommendations[0];
        return {
            title: topRec.title,
            description: topRec.description,
            action: topRec.action,
            priority: topRec.priority,
            impact: topRec.impact,
            reasoning: topRec.reasoning
        };
    }

    /**
     * Get all recommendations
     */
    getAllRecommendations() {
        return this.recommendations;
    }

    /**
     * Get insights
     */
    getInsights() {
        return this.insights;
    }

    /**
     * Get recommendations by type
     */
    getRecommendationsByType(type) {
        return this.recommendations.filter(r => r.type === type);
    }

    /**
     * Get critical recommendations
     */
    getCriticalRecommendations() {
        return this.recommendations.filter(r => r.priority === 'critical');
    }

    /**
     * Save insights to user profile
     */
    async saveInsights() {
        try {
            const insights = {
                strengthsWeaknesses: this.userProfile.aiInsights?.strengthsWeaknesses || {},
                recommendedActions: this.recommendations.map(r => ({
                    id: r.id,
                    type: r.type,
                    title: r.title,
                    priority: r.priority,
                    createdAt: new Date().toISOString()
                })),
                lastAnalysis: new Date().toISOString()
            };

            await this.userProfileSystem.updateProfile(insights, 'aiInsights');
        } catch (error) {
            console.error('Error saving insights:', error);
        }
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
                    recommendations: this.recommendations,
                    insights: this.insights,
                    nextAction: this.getNextAction()
                });
            } catch (error) {
                console.error('Error in recommendations update callback:', error);
            }
        });
    }
}

// Create global instance
window.smartRecommendationsEngine = new SmartRecommendationsEngine();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartRecommendationsEngine;
}
