/**
 * 🎯 SCHOLARSHIP INTELLIGENCE SYSTEM
 * Billion-Dollar Feature: Personalized scholarship matching + ROI optimization
 *
 * Features:
 * - AI-powered matching based on user profile
 * - ROI calculation (value vs. effort)
 * - Automatic essay reuse detection
 * - College-specific scholarship integration
 * - Priority recommendations
 */

class ScholarshipIntelligenceSystem {
    constructor() {
        this.userProfile = null;
        this.scholarships = [];
        this.matches = [];
        this.updateCallbacks = [];
    }

    /**
     * Initialize with dependencies
     */
    async initialize(userProfileSystem, workflowEngine) {
        try {
            console.log('🎯 Initializing Scholarship Intelligence System...');

            this.userProfileSystem = userProfileSystem;
            this.workflowEngine = workflowEngine;
            this.userProfile = userProfileSystem.getProfile();

            // Listen for updates
            userProfileSystem.onProfileUpdate((profile) => {
                this.userProfile = profile;
                this.recalculateMatches();
            });

            // Load scholarships and calculate matches
            await this.loadScholarships();
            await this.calculateMatches();

            console.log('✅ Scholarship Intelligence System initialized');
            return true;
        } catch (error) {
            console.error('❌ Scholarship Intelligence System initialization failed:', error);
            throw error;
        }
    }

    /**
     * Load available scholarships
     */
    async loadScholarships() {
        try {
            // Try to fetch from API
            const response = await fetch('/api/scrape-scholarships');
            if (response.ok) {
                const data = await response.json();
                this.scholarships = data.scholarships || [];
            } else {
                // Use sample data
                this.scholarships = this.getSampleScholarships();
            }
        } catch (error) {
            console.error('Error loading scholarships:', error);
            this.scholarships = this.getSampleScholarships();
        }
    }

    /**
     * Sample scholarships for demo
     */
    getSampleScholarships() {
        return [
            {
                id: 'sch_001',
                name: 'National Merit Scholarship',
                amount: 2500,
                deadline: '2025-03-15',
                eligibility: {
                    gpa: 3.5,
                    testScores: { sat: 1400, act: 32 },
                    citizenship: 'US',
                    grade: 12
                },
                requirements: {
                    essay: true,
                    wordLimit: 500,
                    recommendation: true,
                    transcript: true
                },
                recurring: false,
                renewable: false,
                provider: 'National Merit Scholarship Corporation',
                url: 'https://www.nationalmerit.org/',
                categories: ['academic', 'merit-based']
            },
            {
                id: 'sch_002',
                name: 'Gates Scholarship',
                amount: 50000,
                deadline: '2025-09-15',
                eligibility: {
                    gpa: 3.3,
                    pellEligible: true,
                    citizenship: 'US',
                    grade: 12,
                    minority: true
                },
                requirements: {
                    essay: true,
                    essayCount: 8,
                    wordLimit: 1000,
                    recommendation: true,
                    transcript: true,
                    fafsaRequired: true
                },
                recurring: true,
                renewable: true,
                provider: 'Bill & Melinda Gates Foundation',
                url: 'https://www.thegatesscholarship.org/',
                categories: ['need-based', 'minority', 'full-ride']
            },
            {
                id: 'sch_003',
                name: 'Coca-Cola Scholars Program',
                amount: 20000,
                deadline: '2025-10-31',
                eligibility: {
                    gpa: 3.0,
                    citizenship: 'US',
                    grade: 12
                },
                requirements: {
                    essay: true,
                    essayCount: 2,
                    wordLimit: 500,
                    recommendation: true,
                    leadership: true
                },
                recurring: false,
                renewable: false,
                provider: 'The Coca-Cola Scholars Foundation',
                url: 'https://www.coca-colascholarsfoundation.org/',
                categories: ['leadership', 'merit-based']
            },
            {
                id: 'sch_004',
                name: 'Dell Scholars Program',
                amount: 20000,
                deadline: '2025-01-15',
                eligibility: {
                    gpa: 2.4,
                    pellEligible: true,
                    citizenship: 'US',
                    grade: 12,
                    participatesInCollegeReadiness: true
                },
                requirements: {
                    essay: true,
                    essayCount: 3,
                    wordLimit: 500,
                    recommendation: true,
                    transcript: true
                },
                recurring: false,
                renewable: true,
                provider: 'Michael & Susan Dell Foundation',
                url: 'https://www.dellscholars.org/',
                categories: ['need-based', 'academic']
            },
            {
                id: 'sch_005',
                name: 'Jack Kent Cooke Foundation Scholarship',
                amount: 40000,
                deadline: '2025-11-01',
                eligibility: {
                    gpa: 3.5,
                    testScores: { sat: 1200, act: 26 },
                    citizenship: 'US',
                    grade: 12,
                    householdIncome: 95000
                },
                requirements: {
                    essay: true,
                    essayCount: 4,
                    wordLimit: 800,
                    recommendation: true,
                    transcript: true,
                    fafsaRequired: true
                },
                recurring: false,
                renewable: true,
                provider: 'Jack Kent Cooke Foundation',
                url: 'https://www.jkcf.org/',
                categories: ['academic', 'need-based', 'merit-based']
            }
        ];
    }

    /**
     * Calculate scholarship matches for user
     */
    async calculateMatches() {
        try {
            this.matches = [];

            for (const scholarship of this.scholarships) {
                const match = await this.calculateMatchScore(scholarship);
                if (match.score > 50) { // Only show matches above 50%
                    this.matches.push(match);
                }
            }

            // Sort by ROI (value / effort)
            this.matches.sort((a, b) => b.roi - a.roi);

            // Update profile
            await this.updateProfileWithMatches();

            this.notifyListeners();
        } catch (error) {
            console.error('Error calculating matches:', error);
        }
    }

    /**
     * Calculate match score for a scholarship
     */
    async calculateMatchScore(scholarship) {
        const profile = this.userProfile;
        let score = 0;
        let reasons = [];
        let blockingIssues = [];

        // Check eligibility criteria
        const eligibility = scholarship.eligibility;

        // GPA check
        if (eligibility.gpa) {
            const userGPA = profile.academic?.gpa?.unweighted;
            if (userGPA) {
                if (userGPA >= eligibility.gpa) {
                    score += 20;
                    reasons.push(`GPA requirement met (${userGPA} >= ${eligibility.gpa})`);
                } else {
                    blockingIssues.push(`GPA too low (need ${eligibility.gpa}, have ${userGPA})`);
                    score -= 50; // Major penalty
                }
            }
        } else {
            score += 20; // No GPA requirement
        }

        // Test scores check
        if (eligibility.testScores) {
            const userSAT = profile.academic?.testScores?.sat?.composite;
            const userACT = profile.academic?.testScores?.act?.composite;

            const meetsSAT = userSAT && userSAT >= (eligibility.testScores.sat || 0);
            const meetsACT = userACT && userACT >= (eligibility.testScores.act || 0);

            if (meetsSAT || meetsACT) {
                score += 20;
                reasons.push('Test score requirement met');
            } else if (userSAT || userACT) {
                blockingIssues.push('Test scores below requirement');
                score -= 30;
            } else {
                blockingIssues.push('No test scores recorded');
                score -= 20;
            }
        } else {
            score += 20; // No test score requirement
        }

        // Grade level check
        if (eligibility.grade) {
            const currentYear = new Date().getFullYear();
            const userGradYear = profile.basicInfo?.graduationYear;
            const userGrade = userGradYear ? 12 - (userGradYear - currentYear) : null;

            if (userGrade === eligibility.grade) {
                score += 15;
            } else if (userGrade) {
                blockingIssues.push(`Grade ${eligibility.grade} requirement not met`);
                score -= 30;
            }
        } else {
            score += 15;
        }

        // Citizenship check
        if (eligibility.citizenship === 'US') {
            score += 10; // Assume US citizen for now
            reasons.push('Citizenship requirement likely met');
        }

        // Financial need check
        if (eligibility.pellEligible || eligibility.householdIncome) {
            if (profile.collegePreferences?.financialAidNeeded) {
                score += 15;
                reasons.push('Financial need matches scholarship criteria');
            } else {
                score -= 10;
            }
        } else {
            score += 10;
        }

        // Leadership check
        if (eligibility.leadership) {
            const leadershipCount = profile.activities?.leadership?.length || 0;
            if (leadershipCount > 0) {
                score += 10;
                reasons.push(`Leadership experience (${leadershipCount} positions)`);
            } else {
                score -= 15;
                blockingIssues.push('Leadership experience required');
            }
        } else {
            score += 10;
        }

        // Calculate effort required
        const effort = this.calculateEffort(scholarship);

        // Calculate ROI
        const roi = blockingIssues.length > 0 ? 0 : (scholarship.amount / effort.hours);

        // Check for essay reuse opportunities
        const essayReuse = await this.checkEssayReuse(scholarship);

        return {
            scholarship: scholarship,
            score: Math.max(0, Math.min(100, score)),
            matchQuality: score > 80 ? 'Excellent' : score > 65 ? 'Good' : score > 50 ? 'Fair' : 'Poor',
            reasons: reasons,
            blockingIssues: blockingIssues,
            eligible: blockingIssues.length === 0,
            effort: effort,
            roi: Math.round(roi),
            essayReuse: essayReuse,
            deadline: scholarship.deadline,
            daysUntilDeadline: this.calculateDaysUntil(scholarship.deadline),
            priority: this.calculatePriority(score, roi, scholarship.amount, scholarship.deadline)
        };
    }

    /**
     * Calculate effort required for scholarship
     */
    calculateEffort(scholarship) {
        let hours = 0.5; // Base application time

        const reqs = scholarship.requirements;

        // Essay effort
        if (reqs.essay) {
            const essayCount = reqs.essayCount || 1;
            hours += essayCount * 4; // 4 hours per essay
        }

        // Recommendation effort
        if (reqs.recommendation) {
            hours += 0.5; // Time to request
        }

        // Transcript effort
        if (reqs.transcript) {
            hours += 0.25;
        }

        // FAFSA effort
        if (reqs.fafsaRequired && !this.userProfile.financial?.fafsaCompleted) {
            hours += 2;
        }

        return {
            hours: hours,
            difficulty: hours > 10 ? 'High' : hours > 5 ? 'Medium' : 'Low',
            description: this.generateEffortDescription(scholarship.requirements)
        };
    }

    /**
     * Generate effort description
     */
    generateEffortDescription(requirements) {
        const parts = [];

        if (requirements.essay) {
            parts.push(`${requirements.essayCount || 1} essay${requirements.essayCount > 1 ? 's' : ''}`);
        }
        if (requirements.recommendation) {
            parts.push('recommendation letter');
        }
        if (requirements.transcript) {
            parts.push('transcript');
        }
        if (requirements.fafsaRequired) {
            parts.push('FAFSA');
        }

        return parts.join(', ');
    }

    /**
     * Check for essay reuse opportunities
     */
    async checkEssayReuse(scholarship) {
        const userEssays = this.userProfile.essays;
        const opportunities = [];

        if (!scholarship.requirements.essay) {
            return opportunities;
        }

        // Check if Common App essay can be used
        if (userEssays?.commonApp) {
            const commonAppWords = userEssays.commonApp.content?.split(' ').length || 0;
            const requiredWords = scholarship.requirements.wordLimit || 500;

            if (commonAppWords <= requiredWords * 1.1) { // Within 10% of limit
                opportunities.push({
                    essay: 'Common App Essay',
                    canReuse: true,
                    adaptation: 'minor'
                });
            }
        }

        // Check supplemental essays
        if (userEssays?.supplementals?.length > 0) {
            userEssays.supplementals.forEach(essay => {
                const essayWords = essay.content?.split(' ').length || 0;
                const requiredWords = scholarship.requirements.wordLimit || 500;

                if (Math.abs(essayWords - requiredWords) < 100) {
                    opportunities.push({
                        essay: essay.prompt?.substring(0, 50) + '...',
                        canReuse: true,
                        adaptation: 'moderate'
                    });
                }
            });
        }

        return opportunities;
    }

    /**
     * Calculate priority score
     */
    calculatePriority(matchScore, roi, amount, deadline) {
        let priority = 0;

        // Match score factor (40%)
        priority += (matchScore / 100) * 40;

        // ROI factor (30%)
        const normalizedROI = Math.min(roi / 1000, 1); // Normalize to 0-1
        priority += normalizedROI * 30;

        // Amount factor (20%)
        const normalizedAmount = Math.min(amount / 50000, 1);
        priority += normalizedAmount * 20;

        // Urgency factor (10%)
        const daysUntil = this.calculateDaysUntil(deadline);
        const urgency = daysUntil < 30 ? 1 : daysUntil < 60 ? 0.7 : daysUntil < 90 ? 0.4 : 0.2;
        priority += urgency * 10;

        return Math.round(priority);
    }

    /**
     * Calculate days until deadline
     */
    calculateDaysUntil(deadline) {
        if (!deadline) return 999;
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diff = deadlineDate - now;
        return Math.ceil(diff / (24 * 60 * 60 * 1000));
    }

    /**
     * Get top scholarship matches
     */
    getTopMatches(count = 10) {
        return this.matches.slice(0, count);
    }

    /**
     * Get matches by category
     */
    getMatchesByCategory(category) {
        return this.matches.filter(match =>
            match.scholarship.categories?.includes(category)
        );
    }

    /**
     * Get scholarships matched to specific colleges
     */
    async getCollegeSpecificScholarships(collegeName) {
        // This would fetch college-specific scholarships
        // For now, filter by college name in scholarship name
        return this.matches.filter(match =>
            match.scholarship.name.toLowerCase().includes(collegeName.toLowerCase())
        );
    }

    /**
     * Calculate total potential value
     */
    calculatePotentialValue() {
        return this.matches
            .filter(m => m.eligible)
            .reduce((sum, match) => sum + match.scholarship.amount, 0);
    }

    /**
     * Get recommended application strategy
     */
    getRecommendedStrategy() {
        const eligible = this.matches.filter(m => m.eligible);

        // Sort by priority
        const topPriority = eligible
            .sort((a, b) => b.priority - a.priority)
            .slice(0, 10);

        return {
            recommended: topPriority,
            totalPotentialValue: topPriority.reduce((sum, m) => sum + m.scholarship.amount, 0),
            totalEffortHours: topPriority.reduce((sum, m) => sum + m.effort.hours, 0),
            averageROI: Math.round(topPriority.reduce((sum, m) => sum + m.roi, 0) / topPriority.length),
            reasoning: 'These scholarships offer the best combination of match quality, value, and effort required.'
        };
    }

    /**
     * Apply to scholarship (track application)
     */
    async applyToScholarship(scholarshipId, notes = '') {
        const match = this.matches.find(m => m.scholarship.id === scholarshipId);
        if (!match) return false;

        const application = {
            scholarshipId: scholarshipId,
            name: match.scholarship.name,
            amount: match.scholarship.amount,
            status: 'in-progress',
            appliedDate: new Date().toISOString(),
            deadline: match.scholarship.deadline,
            requirements: match.scholarship.requirements,
            notes: notes
        };

        // Add to user profile
        const currentApps = this.userProfile.scholarships?.applied || [];
        currentApps.push(application);

        await this.userProfileSystem.updateProfile(currentApps, 'scholarships.applied');

        // Update totals
        await this.userProfileSystem.updateProfile(
            currentApps.length,
            'scholarships.totalApplied'
        );

        this.notifyListeners();
        return true;
    }

    /**
     * Update scholarship application status
     */
    async updateApplicationStatus(scholarshipId, status, awardAmount = null) {
        const applications = this.userProfile.scholarships?.applied || [];
        const application = applications.find(app => app.scholarshipId === scholarshipId);

        if (application) {
            application.status = status;
            if (status === 'won' && awardAmount) {
                application.awardAmount = awardAmount;

                // Update won scholarships
                const won = this.userProfile.scholarships?.won || [];
                won.push(application);

                await this.userProfileSystem.updateProfile(won, 'scholarships.won');

                // Update total won
                const totalWon = won.reduce((sum, s) => sum + (s.awardAmount || s.amount), 0);
                await this.userProfileSystem.updateProfile(totalWon, 'scholarships.totalWon');
            }

            await this.userProfileSystem.updateProfile(applications, 'scholarships.applied');
            this.notifyListeners();
            return true;
        }

        return false;
    }

    /**
     * Update profile with match data
     */
    async updateProfileWithMatches() {
        const potentialValue = this.calculatePotentialValue();

        await this.userProfileSystem.updateProfile(
            potentialValue,
            'scholarships.potentialValue'
        );
    }

    /**
     * Recalculate matches when profile changes
     */
    async recalculateMatches() {
        await this.calculateMatches();
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
                    matches: this.matches,
                    topMatches: this.getTopMatches(),
                    potentialValue: this.calculatePotentialValue(),
                    strategy: this.getRecommendedStrategy()
                });
            } catch (error) {
                console.error('Error in scholarship update callback:', error);
            }
        });
    }
}

// Create global instance
window.scholarshipIntelligenceSystem = new ScholarshipIntelligenceSystem();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScholarshipIntelligenceSystem;
}
