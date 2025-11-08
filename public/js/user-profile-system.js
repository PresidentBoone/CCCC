/**
 * 🎯 COMPREHENSIVE USER PROFILE SYSTEM
 * Billion-Dollar Feature: Real user data that powers personalization
 *
 * This is the foundation of the entire platform - every feature uses this data
 * to provide personalized, intelligent recommendations and experiences.
 */

class UserProfileSystem {
    constructor() {
        this.db = null;
        this.userId = null;
        this.profileCache = null;
        this.updateCallbacks = [];
        this.PROFILE_CACHE_KEY = 'cccc_profile_cache';
    }

    /**
     * Initialize with Firebase Firestore
     */
    async initialize(userId) {
        try {
            console.log('🎯 Initializing User Profile System...');
            this.userId = userId;

            // Import Firestore
            const { getFirestore, doc, getDoc, setDoc, updateDoc, onSnapshot } = await import(
                'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js'
            );

            const { getApps } = await import(
                'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js'
            );

            const apps = getApps();
            if (apps.length === 0) {
                throw new Error('Firebase not initialized');
            }

            this.db = getFirestore(apps[0]);
            this.getDoc = getDoc;
            this.setDoc = setDoc;
            this.updateDoc = updateDoc;
            this.doc = doc;
            this.onSnapshot = onSnapshot;

            // Load profile from cache first (instant UI)
            this.loadFromCache();

            // Then load from Firestore (real data)
            await this.loadProfile();

            // Set up real-time sync
            this.setupRealtimeSync();

            console.log('✅ User Profile System initialized');
            return true;
        } catch (error) {
            console.error('❌ Profile System initialization failed:', error);
            throw error;
        }
    }

    /**
     * Get the complete user profile structure
     */
    getDefaultProfile() {
        return {
            // Basic Information
            basicInfo: {
                firstName: '',
                lastName: '',
                email: '',
                phoneNumber: '',
                graduationYear: new Date().getFullYear() + 1,
                highSchool: '',
                city: '',
                state: '',
                dateOfBirth: null,
                profilePhoto: null,
                lastUpdated: new Date().toISOString()
            },

            // Academic Profile
            academic: {
                gpa: {
                    unweighted: null,
                    weighted: null,
                    scale: '4.0'
                },
                classRank: {
                    rank: null,
                    classSize: null,
                    percentile: null
                },
                testScores: {
                    sat: {
                        composite: null,
                        math: null,
                        readingWriting: null,
                        essayScore: null,
                        testDate: null
                    },
                    act: {
                        composite: null,
                        english: null,
                        math: null,
                        reading: null,
                        science: null,
                        writing: null,
                        testDate: null
                    },
                    ap: [], // [{subject: 'Calculus AB', score: 5, year: 2024}]
                    ib: {
                        predicted: null,
                        final: null,
                        subjects: []
                    }
                },
                courses: {
                    current: [], // Current semester courses
                    completed: [], // All completed courses with grades
                    planned: [] // Future courses
                },
                academicHonors: [] // Dean's list, honor roll, etc.
            },

            // Extracurricular Activities
            activities: {
                leadership: [], // [{name, role, years, hours, description, achievements}]
                sports: [],
                arts: [],
                clubs: [],
                volunteering: [],
                workExperience: [],
                summerActivities: [],
                research: [],
                other: []
            },

            // Awards & Honors
            awards: [], // [{name, level, date, description}]

            // College Preferences
            collegePreferences: {
                targetMajors: [], // Primary and alternate majors
                intendedCareer: '',
                preferredLocations: [], // States/regions
                schoolSize: '', // small, medium, large
                schoolType: '', // public, private, liberal-arts, research
                setting: '', // urban, suburban, rural
                climate: '',
                distanceFromHome: '', // near, moderate, far, anywhere
                religiousAffiliation: '',
                specialPrograms: [], // honors, co-op, study-abroad
                financialAidNeeded: null, // boolean
                maxTuition: null,
                importanceFactors: {
                    academics: 5,
                    cost: 5,
                    location: 3,
                    campusLife: 4,
                    careerServices: 5,
                    reputation: 4
                }
            },

            // Applications
            applications: {
                reach: [], // College applications with status
                target: [],
                safety: [],
                applied: [], // Full application details
                admitted: [],
                denied: [],
                waitlisted: []
            },

            // Essays
            essays: {
                commonApp: null,
                supplementals: [], // [{id, collegeId, prompt, content, status, lastUpdated}]
                drafts: [],
                versions: {} // Version control for each essay
            },

            // Scholarships
            scholarships: {
                applied: [], // [{id, name, amount, status, deadline, requirements}]
                watchlist: [],
                won: [],
                totalApplied: 0,
                totalWon: 0,
                potentialValue: 0
            },

            // Timeline & Deadlines
            timeline: {
                upcomingDeadlines: [],
                completedTasks: [],
                recurringTasks: [],
                customEvents: []
            },

            // Recommendations
            recommendations: {
                teachers: [], // [{name, subject, requested, submitted, relationship}]
                counselor: null,
                other: [], // Coaches, employers, etc.
                status: {}
            },

            // Financial Information
            financial: {
                householdIncome: null,
                householdSize: null,
                expectedFamilyContribution: null,
                fafsaCompleted: false,
                cssProfileCompleted: false,
                financialAidForms: []
            },

            // Test Prep Progress
            testPrep: {
                satProgress: {
                    baseline: null,
                    current: null,
                    target: null,
                    practiceTests: [],
                    weakAreas: [],
                    studyHours: 0
                },
                actProgress: {
                    baseline: null,
                    current: null,
                    target: null,
                    practiceTests: [],
                    weakAreas: [],
                    studyHours: 0
                }
            },

            // AI Insights & Predictions
            aiInsights: {
                collegeMatchScores: {}, // {collegeName: {fitScore, admissionChance, reasoning}}
                strengthsWeaknesses: {
                    strengths: [],
                    weaknesses: [],
                    opportunities: []
                },
                recommendedActions: [],
                essayFeedback: [],
                lastAnalysis: null
            },

            // Engagement Metrics
            engagement: {
                loginCount: 0,
                lastLogin: new Date().toISOString(),
                essaysWritten: 0,
                applicationsCompleted: 0,
                practiceQuestionsAnswered: 0,
                aiInteractions: 0,
                achievements: [],
                streakDays: 0
            },

            // Settings & Preferences
            settings: {
                notifications: {
                    email: true,
                    deadlines: true,
                    recommendations: true,
                    achievements: true
                },
                privacy: {
                    shareWithCounselors: false,
                    allowDataAnalysis: true,
                    showInLeaderboard: false
                },
                display: {
                    theme: 'light',
                    dashboardLayout: 'default'
                }
            },

            // Metadata
            metadata: {
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                profileCompleteness: 0,
                dataVersion: '2.0'
            }
        };
    }

    /**
     * Load profile from Firestore
     */
    async loadProfile() {
        try {
            const profileRef = this.doc(this.db, 'userProfiles', this.userId);
            const profileSnap = await this.getDoc(profileRef);

            if (profileSnap.exists()) {
                this.profileCache = profileSnap.data();
                console.log('✅ Profile loaded from Firestore');
            } else {
                // Create new profile
                this.profileCache = this.getDefaultProfile();
                await this.setDoc(profileRef, this.profileCache);
                console.log('✅ New profile created');
            }

            // Save to localStorage cache
            this.saveToCache();

            // Notify all listeners
            this.notifyListeners();

            return this.profileCache;
        } catch (error) {
            console.error('❌ Failed to load profile:', error);
            // Fall back to cached version
            return this.profileCache || this.getDefaultProfile();
        }
    }

    /**
     * Update profile (partial updates supported)
     */
    async updateProfile(updates, path = null) {
        try {
            // Update cache immediately (optimistic update)
            if (path) {
                this.setNestedProperty(this.profileCache, path, updates);
            } else {
                this.profileCache = { ...this.profileCache, ...updates };
            }

            // Update metadata
            this.profileCache.metadata.lastUpdated = new Date().toISOString();
            this.profileCache.metadata.profileCompleteness = this.calculateCompleteness();

            // Save to localStorage
            this.saveToCache();

            // Notify listeners
            this.notifyListeners();

            // Update Firestore in background
            const profileRef = this.doc(this.db, 'userProfiles', this.userId);
            await this.updateDoc(profileRef, {
                ...this.profileCache,
                'metadata.lastUpdated': new Date().toISOString()
            });

            console.log('✅ Profile updated successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to update profile:', error);
            return false;
        }
    }

    /**
     * Get current profile (returns cached version immediately)
     */
    getProfile() {
        return this.profileCache || this.getDefaultProfile();
    }

    /**
     * Get specific section of profile
     */
    getSection(sectionName) {
        return this.profileCache?.[sectionName] || this.getDefaultProfile()[sectionName];
    }

    /**
     * Calculate profile completeness percentage
     */
    calculateCompleteness() {
        const profile = this.profileCache;
        if (!profile) return 0;

        let completed = 0;
        let total = 0;

        // Basic Info (20%)
        const basicFields = ['firstName', 'lastName', 'email', 'graduationYear', 'highSchool'];
        basicFields.forEach(field => {
            total++;
            if (profile.basicInfo?.[field]) completed++;
        });

        // Academic (30%)
        total++;
        if (profile.academic?.gpa?.unweighted) completed++;
        total++;
        if (profile.academic?.testScores?.sat?.composite || profile.academic?.testScores?.act?.composite) completed++;

        // Activities (20%)
        total++;
        if (profile.activities && Object.values(profile.activities).some(arr => arr.length > 0)) completed++;

        // College Preferences (15%)
        total++;
        if (profile.collegePreferences?.targetMajors?.length > 0) completed++;

        // Applications (15%)
        total++;
        if (profile.applications && Object.values(profile.applications).some(arr => arr.length > 0)) completed++;

        return Math.round((completed / total) * 100);
    }

    /**
     * Setup real-time sync with Firestore
     */
    setupRealtimeSync() {
        const profileRef = this.doc(this.db, 'userProfiles', this.userId);

        this.unsubscribe = this.onSnapshot(profileRef, (snapshot) => {
            if (snapshot.exists()) {
                this.profileCache = snapshot.data();
                this.saveToCache();
                this.notifyListeners();
            }
        });
    }

    /**
     * Register callback for profile updates
     */
    onProfileUpdate(callback) {
        this.updateCallbacks.push(callback);
        // Call immediately with current data
        if (this.profileCache) {
            callback(this.profileCache);
        }
    }

    /**
     * Notify all listeners of profile changes
     */
    notifyListeners() {
        this.updateCallbacks.forEach(callback => {
            try {
                callback(this.profileCache);
            } catch (error) {
                console.error('Error in profile update callback:', error);
            }
        });
    }

    /**
     * Local storage cache operations
     */
    saveToCache() {
        try {
            localStorage.setItem(this.PROFILE_CACHE_KEY, JSON.stringify(this.profileCache));
        } catch (error) {
            console.warn('Failed to cache profile:', error);
        }
    }

    loadFromCache() {
        try {
            const cached = localStorage.getItem(this.PROFILE_CACHE_KEY);
            if (cached) {
                this.profileCache = JSON.parse(cached);
                console.log('✅ Profile loaded from cache');
            }
        } catch (error) {
            console.warn('Failed to load cached profile:', error);
        }
    }

    /**
     * Utility: Set nested property by path string
     */
    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        let current = obj;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in current)) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        this.updateCallbacks = [];
    }
}

// Create global instance
window.userProfileSystem = new UserProfileSystem();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserProfileSystem;
}
