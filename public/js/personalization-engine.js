/**
 * 🌟 PERSONALIZATION ENGINE
 * Billion-Dollar Feature: Makes every user feel like the platform was built just for them
 * 
 * This engine orchestrates all personalization across the platform:
 * - Dynamic messaging based on user state
 * - Contextual help at the right moment
 * - Adaptive UI based on behavior
 * - Milestone celebrations
 * - Predictive insights
 */

class PersonalizationEngine {
    constructor() {
        this.userProfile = null;
        this.userBehavior = null;
        this.userStage = 'new'; // new, exploring, preparing, applying, deciding
        this.milestones = [];
        this.contextualHelp = [];
        this.celebrations = [];
    }

    /**
     * Initialize with user data
     */
    async initialize(userId, userProfile) {
        try {
            console.log('🌟 Initializing Personalization Engine...');
            
            this.userId = userId;
            this.userProfile = userProfile;
            
            // Determine user journey stage
            this.userStage = this.determineUserStage();
            
            // Load user behavior patterns
            await this.loadUserBehavior();
            
            // Setup milestone tracking
            this.setupMilestones();
            
            // Initialize contextual help
            this.initializeContextualHelp();
            
            console.log(`✅ Personalization Engine ready | Stage: ${this.userStage}`);
            return true;
        } catch (error) {
            console.error('❌ Personalization Engine initialization failed:', error);
            return false;
        }
    }

    /**
     * Determine user's current journey stage
     */
    determineUserStage() {
        if (!this.userProfile) return 'new';
        
        const profile = this.userProfile;
        
        // New user - just signed up
        if (!profile.questionnaireCompleted) {
            return 'new';
        }
        
        // Exploring - profile complete, looking around
        if (profile.applicationCount === 0 || profile.applicationCount < 3) {
            return 'exploring';
        }
        
        // Preparing - building application materials
        if (profile.applicationProgress < 50) {
            return 'preparing';
        }
        
        // Applying - actively submitting applications
        if (profile.applicationProgress >= 50 && profile.applicationProgress < 90) {
            return 'applying';
        }
        
        // Deciding - applications submitted, awaiting decisions
        if (profile.submittedApplications > 0) {
            return 'deciding';
        }
        
        return 'exploring';
    }

    /**
     * Get personalized welcome message
     */
    getWelcomeMessage() {
        const hour = new Date().getHours();
        const timeGreeting = hour < 12 ? 'Good morning' :
                            hour < 18 ? 'Good afternoon' : 'Good evening';
        
        const firstName = this.userProfile?.name?.split(' ')[0] || 'there';
        
        // Base greeting
        let message = `${timeGreeting}, ${firstName}!`;
        
        // Stage-specific message
        switch (this.userStage) {
            case 'new':
                message += " Let's get your profile set up!";
                break;
            case 'exploring':
                message += " Ready to discover your perfect colleges?";
                break;
            case 'preparing':
                if (this.userProfile.applicationProgress > 30) {
                    message += " You're making great progress!";
                } else {
                    message += " Let's build your application strength!";
                }
                break;
            case 'applying':
                if (this.hasUpcomingDeadlines()) {
                    message += " You have deadlines coming up!";
                } else {
                    message += " You're in the home stretch!";
                }
                break;
            case 'deciding':
                message += " Exciting times ahead!";
                break;
        }
        
        return message;
    }

    /**
     * Get personalized dashboard subtitle
     */
    getDashboardSubtitle() {
        const messages = {
            new: "Your AI-powered college journey starts here",
            exploring: "Discover colleges that match your dreams",
            preparing: "Building your strongest application",
            applying: "Stay organized and on track",
            deciding: "Making your college decision"
        };
        
        return messages[this.userStage] || messages.exploring;
    }

    /**
     * Get next recommended action
     */
    getNextAction() {
        switch (this.userStage) {
            case 'new':
                return {
                    title: "Complete Your Profile",
                    description: "Help us match you with perfect colleges",
                    action: "Start Questionnaire",
                    link: "/questions.html",
                    priority: "high"
                };
            
            case 'exploring':
                if (!this.userProfile.targetSchools || this.userProfile.targetSchools.length === 0) {
                    return {
                        title: "Find Your Perfect Colleges",
                        description: "AI-powered matching based on your profile",
                        action: "Explore Colleges",
                        link: "/discovery.html",
                        priority: "high"
                    };
                } else if (this.userProfile.essayCount === 0) {
                    return {
                        title: "Start Your Essay",
                        description: "Get AI feedback on your personal statement",
                        action: "Write Essay",
                        link: "/essaycoach.html",
                        priority: "high"
                    };
                }
                break;
            
            case 'preparing':
                // Check what's missing
                if (this.userProfile.essayCount === 0) {
                    return {
                        title: "Write Your Personal Statement",
                        description: "Our AI will help you craft a compelling story",
                        action: "Start Writing",
                        link: "/essaycoach.html",
                        priority: "high"
                    };
                } else if (!this.userProfile.testScores || this.userProfile.testScores.sat < 1400) {
                    return {
                        title: "Boost Your Test Scores",
                        description: "AI-powered practice tailored to you",
                        action: "Practice Now",
                        link: "/testprep-enhanced.html",
                        priority: "medium"
                    };
                } else if (this.userProfile.scholarshipMatches === 0) {
                    return {
                        title: "Find Scholarships",
                        description: "We found matches worth $50K+",
                        action: "View Scholarships",
                        link: "/scholarship.html",
                        priority: "medium"
                    };
                }
                break;
            
            case 'applying':
                const nextDeadline = this.getNextDeadline();
                if (nextDeadline) {
                    return {
                        title: `${nextDeadline.school} Due Soon`,
                        description: `Deadline in ${nextDeadline.daysRemaining} days`,
                        action: "Review Application",
                        link: "/adaptive-timeline.html",
                        priority: "high"
                    };
                }
                break;
            
            case 'deciding':
                return {
                    title: "Track Your Decisions",
                    description: "Keep tabs on acceptances and financial aid",
                    action: "View Applications",
                    link: "/adaptive-timeline.html",
                    priority: "medium"
                };
        }
        
        // Default
        return {
            title: "Explore Features",
            description: "Discover all the tools at your disposal",
            action: "View Dashboard",
            link: "/dashboard.html",
            priority: "low"
        };
    }

    /**
     * Get contextual help for current page
     */
    getContextualHelp(pageName, context = {}) {
        const helpMessages = {
            'essay-coach': {
                empty: "Writer's block? Start with our essay prompts or use AI brainstorming!",
                longTime: "Haven't written in a while? Let's recap where you left off.",
                firstDraft: "Great start! Want AI feedback to make it even better?",
                highScore: "Excellent essay! Consider submitting this one."
            },
            'discovery': {
                noFilters: "Not sure where to start? We'll recommend colleges based on your profile!",
                tooManyFilters: "Too specific? Try loosening some filters to see more options.",
                noResults: "No matches found. Let's adjust your criteria.",
                goodMatches: "These colleges are great fits for you!"
            },
            'testprep': {
                firstTime: "Welcome to test prep! Let's start with a quick diagnostic.",
                improving: "Your scores are improving! Keep up the great work!",
                struggling: "Having trouble? Let's focus on your weak areas.",
                nearGoal: "You're so close to your target score!"
            },
            'timeline': {
                noApplications: "Let's add your target colleges to track deadlines!",
                upcomingDeadlines: "You have deadlines this week - stay focused!",
                allGreen: "All applications on track! Great job staying organized!",
                behindSchedule: "Some tasks are overdue - let's prioritize!"
            }
        };
        
        return helpMessages[pageName]?.[context.state] || null;
    }

    /**
     * Check and trigger milestone celebrations
     */
    checkMilestones() {
        const celebrations = [];
        
        // Profile milestones
        if (this.userProfile.profileCompleteness === 100 && !this.hasCelebrated('profile-complete')) {
            celebrations.push({
                type: 'profile-complete',
                title: '✨ Profile Complete!',
                message: 'Now we can match you with the perfect colleges!',
                icon: '🎉'
            });
        }
        
        // Essay milestones
        if (this.userProfile.essayCount === 1 && !this.hasCelebrated('first-essay')) {
            celebrations.push({
                type: 'first-essay',
                title: '🎊 First Essay Complete!',
                message: 'You\'re on your way to amazing applications!',
                icon: '✍️'
            });
        }
        
        if (this.userProfile.essayCount === 5 && !this.hasCelebrated('five-essays')) {
            celebrations.push({
                type: 'five-essays',
                title: '💪 Five Essays Strong!',
                message: 'Your essay portfolio is impressive!',
                icon: '📝'
            });
        }
        
        // Test prep milestones
        if (this.userProfile.testPrepQuestions >= 100 && !this.hasCelebrated('hundred-questions')) {
            celebrations.push({
                type: 'hundred-questions',
                title: '🎯 100 Questions Mastered!',
                message: 'Your dedication is paying off!',
                icon: '💯'
            });
        }
        
        // Application milestones
        if (this.userProfile.submittedApplications === 1 && !this.hasCelebrated('first-submission')) {
            celebrations.push({
                type: 'first-submission',
                title: '🚀 First Application Submitted!',
                message: 'This is huge! Keep the momentum going!',
                icon: '🎓'
            });
        }
        
        // Scholarship milestones
        if (this.userProfile.scholarshipsApplied >= 10 && !this.hasCelebrated('ten-scholarships')) {
            celebrations.push({
                type: 'ten-scholarships',
                title: '💰 10 Scholarship Applications!',
                message: 'You\'re serious about funding your education!',
                icon: '🏆'
            });
        }
        
        return celebrations;
    }

    /**
     * Get personalized insights
     */
    getPersonalizedInsights() {
        const insights = [];
        
        // Profile completeness insight
        if (this.userProfile.profileCompleteness < 100) {
            insights.push({
                type: 'profile',
                priority: 'high',
                message: `Your profile is ${this.userProfile.profileCompleteness}% complete. Complete it for better matches!`,
                action: 'Complete Profile',
                link: '/profile.html'
            });
        }
        
        // Test score insight
        if (this.userProfile.testScores) {
            const sat = this.userProfile.testScores.sat;
            const target = this.userProfile.targetTestScore || 1500;
            
            if (sat && sat < target) {
                const gap = target - sat;
                insights.push({
                    type: 'test-prep',
                    priority: 'medium',
                    message: `You're ${gap} points from your target SAT score. Our AI can help!`,
                    action: 'Practice Now',
                    link: '/testprep-enhanced.html'
                });
            }
        }
        
        // Essay insight
        if (this.userProfile.essayCount < 3) {
            insights.push({
                type: 'essay',
                priority: 'medium',
                message: 'Most successful applicants write 5-7 essays. Keep writing!',
                action: 'Write Essay',
                link: '/essaycoach.html'
            });
        }
        
        // Deadline insights
        const upcomingDeadlines = this.getUpcomingDeadlines(14); // 2 weeks
        if (upcomingDeadlines.length > 0) {
            insights.push({
                type: 'deadline',
                priority: 'high',
                message: `You have ${upcomingDeadlines.length} deadlines in the next 2 weeks!`,
                action: 'View Timeline',
                link: '/adaptive-timeline.html'
            });
        }
        
        // Scholarship insight
        if (!this.userProfile.scholarshipsViewed || this.userProfile.scholarshipsViewed < 5) {
            insights.push({
                type: 'scholarship',
                priority: 'low',
                message: 'Did you know we found personalized scholarship matches for you?',
                action: 'Find Scholarships',
                link: '/scholarship.html'
            });
        }
        
        return insights.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    /**
     * Get adaptive UI configuration
     */
    getAdaptiveUI(pageName) {
        const config = {
            showOnboarding: false,
            showHelp: false,
            showCelebration: false,
            highlightedFeature: null,
            customCTA: null
        };
        
        // New users get more guidance
        if (this.userStage === 'new') {
            config.showOnboarding = true;
            config.showHelp = true;
        }
        
        // Check for celebrations
        const celebrations = this.checkMilestones();
        if (celebrations.length > 0) {
            config.showCelebration = celebrations[0];
        }
        
        // Page-specific adaptations
        switch (pageName) {
            case 'dashboard':
                if (this.userStage === 'exploring') {
                    config.highlightedFeature = 'college-discovery';
                } else if (this.userStage === 'preparing') {
                    config.highlightedFeature = 'essay-coach';
                }
                break;
            
            case 'essay-coach':
                if (this.userProfile.essayCount === 0) {
                    config.customCTA = 'Start Your First Essay';
                } else {
                    config.customCTA = 'Continue Writing';
                }
                break;
        }
        
        return config;
    }

    /**
     * Track user behavior
     */
    async trackBehavior(eventType, eventData) {
        try {
            // Update local behavior data
            if (!this.userBehavior) {
                this.userBehavior = {
                    events: [],
                    patterns: {}
                };
            }
            
            this.userBehavior.events.push({
                type: eventType,
                data: eventData,
                timestamp: new Date().toISOString()
            });
            
            // Analyze patterns (simple implementation)
            this.analyzePatterns();
            
            // Persist to Firebase (if available)
            if (typeof window !== 'undefined' && window.db) {
                const { updateDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js');
                await updateDoc(doc(window.db, 'userBehavior', this.userId), {
                    lastEvent: eventType,
                    lastActivity: new Date(),
                    [`events.${eventType}`]: (this.userBehavior.patterns[eventType] || 0) + 1
                });
            }
        } catch (error) {
            console.error('Error tracking behavior:', error);
        }
    }

    /**
     * Helper: Check if milestone was already celebrated
     */
    hasCelebrated(milestoneType) {
        return this.celebrations.includes(milestoneType);
    }

    /**
     * Helper: Mark milestone as celebrated
     */
    markCelebrated(milestoneType) {
        if (!this.celebrations.includes(milestoneType)) {
            this.celebrations.push(milestoneType);
        }
    }

    /**
     * Helper: Check for upcoming deadlines
     */
    hasUpcomingDeadlines(days = 7) {
        return this.getUpcomingDeadlines(days).length > 0;
    }

    /**
     * Helper: Get upcoming deadlines
     */
    getUpcomingDeadlines(days = 7) {
        if (!this.userProfile.applications) return [];
        
        const now = new Date();
        const future = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
        
        return this.userProfile.applications.filter(app => {
            const deadline = new Date(app.deadline);
            return deadline >= now && deadline <= future && app.status !== 'submitted';
        });
    }

    /**
     * Helper: Get next deadline
     */
    getNextDeadline() {
        const upcoming = this.getUpcomingDeadlines(365); // All future deadlines
        if (upcoming.length === 0) return null;
        
        upcoming.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        const next = upcoming[0];
        
        const now = new Date();
        const deadline = new Date(next.deadline);
        const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        
        return {
            school: next.collegeName,
            deadline: next.deadline,
            daysRemaining: daysRemaining
        };
    }

    /**
     * Helper: Load user behavior from storage
     */
    async loadUserBehavior() {
        try {
            if (typeof window !== 'undefined' && window.db) {
                const { getDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js');
                const behaviorDoc = await getDoc(doc(window.db, 'userBehavior', this.userId));
                
                if (behaviorDoc.exists()) {
                    this.userBehavior = behaviorDoc.data();
                }
            }
        } catch (error) {
            console.error('Error loading behavior:', error);
        }
    }

    /**
     * Helper: Analyze behavior patterns
     */
    analyzePatterns() {
        // Simple pattern analysis
        const events = this.userBehavior.events;
        const patterns = {};
        
        events.forEach(event => {
            patterns[event.type] = (patterns[event.type] || 0) + 1;
        });
        
        this.userBehavior.patterns = patterns;
    }

    /**
     * Helper: Setup milestones
     */
    setupMilestones() {
        // Load celebrated milestones from storage
        const stored = localStorage.getItem(`celebrations_${this.userId}`);
        this.celebrations = stored ? JSON.parse(stored) : [];
    }

    /**
     * Helper: Initialize contextual help
     */
    initializeContextualHelp() {
        // Setup help triggers based on user stage and behavior
        this.contextualHelp = [];
    }
}

// Export for global use
if (typeof window !== 'undefined') {
    window.PersonalizationEngine = PersonalizationEngine;
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PersonalizationEngine;
}
