/**
 * College Climb AI Engine - Standalone Version
 * Central AI processing and personalization system
 * Powers all AI features across the platform
 * 
 * This version works without ES6 imports - expects Firestore to be loaded via module script
 */

(function(window) {
    'use strict';

    class AIEngine {
        constructor(userId, db) {
            this.db = db;
            this.userId = userId;
            this.userProfile = null;
            this.learningData = null;
            this.API_ENDPOINT = '/api';
            
            // Get Firestore functions from global scope (set by module script)
            this.getDoc = window.getFirestoreDoc;
            this.setDoc = window.setFirestoreDoc;
            this.updateDoc = window.updateFirestoreDoc;
            this.doc = window.firestoreDoc;
            this.collection = window.firestoreCollection;
            this.query = window.firestoreQuery;
            this.where = window.firestoreWhere;
            this.getDocs = window.getFirestoreDocs;
            this.serverTimestamp = window.firestoreServerTimestamp;
        }

        /**
         * Initialize AI engine with user data
         */
        async initialize() {
            try {
                await this.loadUserProfile();
                await this.loadLearningData();
                console.log('✅ AI Engine initialized for user:', this.userId);
                return true;
            } catch (error) {
                console.error('❌ AI Engine initialization failed:', error);
                return false;
            }
        }

        /**
         * Load user profile from Firestore
         */
        async loadUserProfile() {
            if (!this.getDoc || !this.doc) {
                console.warn('Firestore functions not available, using fallback');
                return;
            }
            
            try {
                const userDoc = await this.getDoc(this.doc(this.db, 'users', this.userId));
                if (userDoc.exists()) {
                    this.userProfile = userDoc.data();
                }
            } catch (error) {
                console.error('Error loading user profile:', error);
            }
        }

        /**
         * Load AI learning data
         */
        async loadLearningData() {
            if (!this.getDoc || !this.doc) {
                console.warn('Firestore functions not available, using fallback');
                this.learningData = this.getDefaultLearningData();
                return;
            }
            
            try {
                const learningDoc = await this.getDoc(this.doc(this.db, 'aiLearning', this.userId));
                if (learningDoc.exists()) {
                    this.learningData = learningDoc.data();
                } else {
                    // Initialize learning data
                    this.learningData = this.getDefaultLearningData();
                    await this.setDoc(this.doc(this.db, 'aiLearning', this.userId), this.learningData);
                }
            } catch (error) {
                console.error('Error loading learning data:', error);
                this.learningData = this.getDefaultLearningData();
            }
        }

        /**
         * Get default learning data structure
         */
        getDefaultLearningData() {
            return {
                essayPreferences: {},
                collegePreferences: {},
                testPrepStrengths: {},
                testPrepWeaknesses: {},
                studyPatterns: {},
                interactionHistory: [],
                lastUpdated: new Date()
            };
        }

        /**
         * Analyze essay with AI
         */
        async analyzeEssay(essayText, options = {}) {
            try {
                const response = await fetch(`${this.API_ENDPOINT}/essay-analyze`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        essay: essayText,
                        colleges: options.colleges || [],
                        userProfile: options.userProfile || this.userProfile,
                        prompt: options.prompt || '',
                        learningData: this.learningData
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const analysis = await response.json();
                
                // Update learning data
                await this.updateEssayLearning(essayText, analysis);
                
                return analysis;
            } catch (error) {
                console.error('Essay analysis error:', error);
                throw error;
            }
        }

        /**
         * Get AI essay chat response
         */
        async getEssayChat(message, essayContext) {
            try {
                const response = await fetch(`${this.API_ENDPOINT}/essay-chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message,
                        essayContext,
                        userId: this.userId,
                        userProfile: this.userProfile,
                        learningData: this.learningData
                    })
                });

                const chatResponse = await response.json();
                
                // Track interaction
                await this.trackInteraction('essay_chat', { message, response: chatResponse });
                
                return chatResponse;
            } catch (error) {
                console.error('Essay chat error:', error);
                throw error;
            }
        }

        /**
         * Find college matches using AI
         */
        async findCollegeMatches(preferences = {}) {
            try {
                const response = await fetch(`${this.API_ENDPOINT}/college-search`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: this.userId,
                        profile: this.userProfile,
                        preferences: { ...this.learningData.collegePreferences, ...preferences }
                    })
                });

                const matches = await response.json();
                
                // Update college preferences based on interactions
                await this.updateCollegePreferences(matches);
                
                return matches;
            } catch (error) {
                console.error('College matching error:', error);
                throw error;
            }
        }

        /**
         * Generate personalized test prep questions
         */
        async generateTestPrepQuestions(testType, subject, difficulty, count = 10) {
            try {
                const response = await fetch(`${this.API_ENDPOINT}/testprep-generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        testType,
                        subject,
                        difficulty,
                        count,
                        userId: this.userId,
                        strengths: this.learningData.testPrepStrengths || {},
                        weaknesses: this.learningData.testPrepWeaknesses || {},
                        userProfile: this.userProfile
                    })
                });

                const questions = await response.json();
                return questions;
            } catch (error) {
                console.error('Test prep generation error:', error);
                throw error;
            }
        }

        /**
         * Analyze test prep performance
         */
        async analyzeTestPerformance(testResults) {
            const { testType, questions, answers, timeSpent } = testResults;
            
            // Calculate performance metrics
            const totalQuestions = questions.length;
            const correctAnswers = answers.filter((ans, idx) => ans === questions[idx].correctAnswer).length;
            const score = (correctAnswers / totalQuestions) * 100;
            
            // Analyze strengths and weaknesses by subject
            const subjectPerformance = {};
            questions.forEach((q, idx) => {
                if (!subjectPerformance[q.subject]) {
                    subjectPerformance[q.subject] = { correct: 0, total: 0 };
                }
                subjectPerformance[q.subject].total++;
                if (answers[idx] === q.correctAnswer) {
                    subjectPerformance[q.subject].correct++;
                }
            });

            // Update learning data
            const strengths = [];
            const weaknesses = [];
            
            Object.entries(subjectPerformance).forEach(([subject, perf]) => {
                const percentage = (perf.correct / perf.total) * 100;
                if (percentage >= 70) {
                    strengths.push(subject);
                } else if (percentage < 50) {
                    weaknesses.push(subject);
                }
            });

            // Update Firestore if available
            if (this.updateDoc && this.doc) {
                try {
                    await this.updateDoc(this.doc(this.db, 'aiLearning', this.userId), {
                        [`testPrepStrengths.${testType}`]: strengths,
                        [`testPrepWeaknesses.${testType}`]: weaknesses,
                        [`testHistory.${Date.now()}`]: {
                            testType,
                            score,
                            date: new Date(),
                            subjectPerformance
                        },
                        lastUpdated: this.serverTimestamp ? this.serverTimestamp() : new Date()
                    });
                } catch (error) {
                    console.error('Error updating test performance:', error);
                }
            }

            this.learningData.testPrepStrengths = this.learningData.testPrepStrengths || {};
            this.learningData.testPrepWeaknesses = this.learningData.testPrepWeaknesses || {};
            this.learningData.testPrepStrengths[testType] = strengths;
            this.learningData.testPrepWeaknesses[testType] = weaknesses;

            return {
                score,
                strengths,
                weaknesses,
                subjectPerformance,
                recommendations: await this.generateStudyRecommendations(testType, weaknesses)
            };
        }

        /**
         * Generate personalized study recommendations
         */
        async generateStudyRecommendations(testType, weaknesses) {
            const recommendations = [];
            
            weaknesses.forEach(subject => {
                recommendations.push({
                    subject,
                    priority: 'high',
                    studyTime: '30-45 minutes daily',
                    resources: this.getStudyResources(testType, subject),
                    practiceAreas: this.getPracticeAreas(testType, subject)
                });
            });

            return recommendations;
        }

        /**
         * Get study resources for a subject
         */
        getStudyResources(testType, subject) {
            const resources = {
                SAT: {
                    'Reading': ['Khan Academy SAT Reading', 'Practice passages', 'Vocabulary builder'],
                    'Writing': ['Grammar rules review', 'Essay structure guide', 'Practice exercises'],
                    'Math': ['Algebra review', 'Geometry concepts', 'Calculator strategies']
                },
                ACT: {
                    'English': ['Grammar fundamentals', 'Rhetoric strategies', 'Practice tests'],
                    'Math': ['Trigonometry review', 'Algebra concepts', 'Geometry practice'],
                    'Reading': ['Speed reading techniques', 'Comprehension strategies', 'Practice passages'],
                    'Science': ['Data interpretation', 'Scientific reasoning', 'Graph analysis']
                },
                PSAT: {
                    'Reading': ['Critical reading skills', 'Vocabulary in context', 'Practice passages'],
                    'Writing': ['Grammar essentials', 'Sentence structure', 'Editing practice'],
                    'Math': ['Pre-algebra review', 'Problem solving', 'Data analysis']
                }
            };

            return resources[testType]?.[subject] || ['General study materials'];
        }

        /**
         * Get practice areas for improvement
         */
        getPracticeAreas(testType, subject) {
            return [
                `${subject} fundamentals`,
                `${subject} practice problems`,
                `${subject} timed sections`,
                `${subject} review materials`
            ];
        }

        /**
         * Update essay learning data
         */
        async updateEssayLearning(essayText, analysis) {
            const writingStyle = this.analyzeWritingStyle(essayText);
            
            if (this.updateDoc && this.doc) {
                try {
                    await this.updateDoc(this.doc(this.db, 'aiLearning', this.userId), {
                        'essayPreferences.writingStyle': writingStyle,
                        'essayPreferences.commonTopics': this.extractTopics(essayText),
                        'essayPreferences.lastAnalysis': analysis,
                        lastUpdated: this.serverTimestamp ? this.serverTimestamp() : new Date()
                    });
                } catch (error) {
                    console.error('Error updating essay learning:', error);
                }
            }
        }

        /**
         * Analyze writing style
         */
        analyzeWritingStyle(text) {
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
            const words = text.split(/\s+/);
            
            return {
                avgSentenceLength: words.length / sentences.length,
                vocabularyComplexity: this.calculateVocabularyComplexity(words),
                tone: this.detectTone(text)
            };
        }

        /**
         * Calculate vocabulary complexity
         */
        calculateVocabularyComplexity(words) {
            const uniqueWords = new Set(words.map(w => w.toLowerCase()));
            return uniqueWords.size / words.length;
        }

        /**
         * Detect tone
         */
        detectTone(text) {
            const positiveWords = ['happy', 'excited', 'passionate', 'love', 'enjoyed'];
            const analyticalWords = ['analyze', 'consider', 'understand', 'realize', 'discover'];
            
            const lowerText = text.toLowerCase();
            const positiveCount = positiveWords.filter(w => lowerText.includes(w)).length;
            const analyticalCount = analyticalWords.filter(w => lowerText.includes(w)).length;
            
            if (analyticalCount > positiveCount) return 'analytical';
            if (positiveCount > 0) return 'positive';
            return 'neutral';
        }

        /**
         * Extract topics from text
         */
        extractTopics(text) {
            const words = text.toLowerCase().split(/\s+/);
            const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
            const keywords = words.filter(w => w.length > 4 && !stopWords.has(w));
            
            const frequency = {};
            keywords.forEach(word => {
                frequency[word] = (frequency[word] || 0) + 1;
            });
            
            return Object.entries(frequency)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([word]) => word);
        }

        /**
         * Update college preferences
         */
        async updateCollegePreferences(matches) {
            const preferences = {
                locations: new Set(),
                sizes: new Set(),
                types: new Set()
            };

            matches.forEach(college => {
                if (college.location) preferences.locations.add(college.location);
                if (college.size) preferences.sizes.add(college.size);
                if (college.type) preferences.types.add(college.type);
            });

            if (this.updateDoc && this.doc) {
                try {
                    await this.updateDoc(this.doc(this.db, 'aiLearning', this.userId), {
                        'collegePreferences': {
                            locations: Array.from(preferences.locations),
                            sizes: Array.from(preferences.sizes),
                            types: Array.from(preferences.types),
                            lastSearched: new Date()
                        },
                        lastUpdated: this.serverTimestamp ? this.serverTimestamp() : new Date()
                    });
                } catch (error) {
                    console.error('Error updating college preferences:', error);
                }
            }
        }

        /**
         * Track user interaction
         */
        async trackInteraction(type, data) {
            const interaction = {
                type,
                data,
                timestamp: new Date()
            };

            if (!this.learningData.interactionHistory) {
                this.learningData.interactionHistory = [];
            }

            this.learningData.interactionHistory.push(interaction);

            // Keep only last 100 interactions
            if (this.learningData.interactionHistory.length > 100) {
                this.learningData.interactionHistory = this.learningData.interactionHistory.slice(-100);
            }

            if (this.updateDoc && this.doc) {
                try {
                    await this.updateDoc(this.doc(this.db, 'aiLearning', this.userId), {
                        interactionHistory: this.learningData.interactionHistory,
                        lastUpdated: this.serverTimestamp ? this.serverTimestamp() : new Date()
                    });
                } catch (error) {
                    console.error('Error tracking interaction:', error);
                }
            }
        }

        /**
         * Get personalized insights
         */
        async getPersonalizedInsights() {
            return {
                essayInsights: this.getEssayInsights(),
                testPrepInsights: this.getTestPrepInsights(),
                collegeInsights: this.getCollegeInsights()
            };
        }

        /**
         * Get essay insights
         */
        getEssayInsights() {
            if (!this.learningData.essayPreferences) return null;
            
            return {
                writingStrength: 'Your analytical tone is compelling',
                improvementAreas: ['Vary sentence structure', 'Add more specific examples'],
                recommendedTopics: this.learningData.essayPreferences.commonTopics || []
            };
        }

        /**
         * Get test prep insights
         */
        getTestPrepInsights() {
            const insights = [];
            
            Object.entries(this.learningData.testPrepWeaknesses || {}).forEach(([test, weaknesses]) => {
                if (weaknesses.length > 0) {
                    insights.push({
                        test,
                        focus: `Focus on ${weaknesses.join(', ')}`,
                        studyTime: '30-45 minutes daily'
                    });
                }
            });

            return insights;
        }

        /**
         * Get college insights
         */
        getCollegeInsights() {
            const prefs = this.learningData.collegePreferences || {};
            
            return {
                preferredLocations: prefs.locations || [],
                preferredSizes: prefs.sizes || [],
                matchCount: 0
            };
        }
    }

    // Export to global scope
    window.AIEngine = AIEngine;

})(window);
