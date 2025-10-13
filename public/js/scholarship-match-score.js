/**
 * Scholarship Match Score Calculator
 * Calculates how well a scholarship matches a user's profile
 */

class ScholarshipMatchScore {
    constructor() {
        this.userProfile = null;
        this.initialized = false;
    }

    /**
     * Initialize with user profile
     */
    async initialize(userId) {
        try {
            // Load user profile from Firebase or localStorage
            this.userProfile = await this.loadUserProfile(userId);
            this.initialized = true;
            console.log('✅ Match Score Calculator initialized');
            return true;
        } catch (error) {
            console.error('❌ Error initializing Match Score:', error);
            return false;
        }
    }

    /**
     * Load user profile
     */
    async loadUserProfile(userId) {
        try {
            // Try Firebase first
            if (typeof firebase !== 'undefined' && firebase.firestore && userId) {
                const db = firebase.firestore();
                const doc = await db.collection('users').doc(userId).get();
                
                if (doc.exists) {
                    return doc.data();
                }
            }

            // Fall back to localStorage
            const stored = localStorage.getItem('userProfile');
            if (stored) {
                return JSON.parse(stored);
            }

            // Default profile
            return this.getDefaultProfile();
        } catch (error) {
            console.error('Error loading profile:', error);
            return this.getDefaultProfile();
        }
    }

    /**
     * Get default profile structure
     */
    getDefaultProfile() {
        return {
            gpa: 3.5,
            satScore: 1200,
            actScore: 24,
            ethnicity: [],
            gender: '',
            state: '',
            gradeLevel: 'senior',
            intendedMajor: '',
            activities: [],
            sports: [],
            leadership: false,
            volunteer: false,
            financialNeed: false,
            citizenship: 'US',
            militaryAffiliation: false,
            firstGeneration: false,
            disabilities: false,
            rural: false
        };
    }

    /**
     * Calculate match score for a scholarship
     * Returns a score from 0-100
     */
    calculateMatchScore(scholarship) {
        if (!this.userProfile) {
            return { score: 50, breakdown: {}, confidence: 'low' };
        }

        const scores = {
            academicMatch: this.calculateAcademicMatch(scholarship),
            demographicMatch: this.calculateDemographicMatch(scholarship),
            eligibilityMatch: this.calculateEligibilityMatch(scholarship),
            competitivenessScore: this.calculateCompetitivenessScore(scholarship)
        };

        // Weighted average
        const weights = {
            academicMatch: 0.35,
            demographicMatch: 0.25,
            eligibilityMatch: 0.30,
            competitivenessScore: 0.10
        };

        let totalScore = 0;
        for (const [key, weight] of Object.entries(weights)) {
            totalScore += scores[key] * weight;
        }

        // Calculate confidence level
        const confidence = this.calculateConfidence(scores);

        return {
            score: Math.round(totalScore),
            breakdown: scores,
            confidence: confidence,
            recommendation: this.getRecommendation(totalScore),
            strengths: this.identifyStrengths(scores, scholarship),
            improvements: this.identifyImprovements(scores, scholarship)
        };
    }

    /**
     * Calculate academic match (GPA, test scores)
     */
    calculateAcademicMatch(scholarship) {
        const eligibility = scholarship.eligibility.join(' ').toLowerCase();
        let score = 100;

        // Check GPA requirement
        const gpaMatch = eligibility.match(/gpa\s+([\d.]+)/);
        if (gpaMatch) {
            const requiredGPA = parseFloat(gpaMatch[1]);
            const userGPA = this.userProfile.gpa || 0;

            if (userGPA < requiredGPA) {
                return 0; // Not eligible
            } else if (userGPA >= requiredGPA + 0.5) {
                score = 100; // Well above requirement
            } else if (userGPA >= requiredGPA + 0.2) {
                score = 85; // Above requirement
            } else {
                score = 70; // Just meets requirement
            }
        }

        // Check SAT requirement
        const satMatch = eligibility.match(/sat\s+(\d+)/);
        if (satMatch && this.userProfile.satScore) {
            const requiredSAT = parseInt(satMatch[1]);
            const userSAT = this.userProfile.satScore;

            if (userSAT < requiredSAT) {
                return 0; // Not eligible
            } else if (userSAT >= requiredSAT + 200) {
                score = Math.min(score, 100);
            } else if (userSAT >= requiredSAT + 50) {
                score = Math.min(score, 85);
            } else {
                score = Math.min(score, 70);
            }
        }

        // Check for academic merit category
        if (scholarship.category.toLowerCase().includes('academic')) {
            if (this.userProfile.gpa >= 3.8 && this.userProfile.satScore >= 1400) {
                score = Math.min(score + 10, 100);
            }
        }

        return score;
    }

    /**
     * Calculate demographic match
     */
    calculateDemographicMatch(scholarship) {
        const eligibility = scholarship.eligibility.join(' ').toLowerCase();
        const description = scholarship.description.toLowerCase();
        const category = scholarship.category.toLowerCase();
        let score = 50; // Default neutral score
        let matches = 0;
        let totalChecks = 0;

        // Check ethnicity/diversity
        if (category.includes('diversity') || description.includes('minority') || 
            description.includes('hispanic') || description.includes('african american')) {
            totalChecks++;
            if (this.userProfile.ethnicity && this.userProfile.ethnicity.length > 0) {
                matches++;
                score += 20;
            }
        }

        // Check gender-specific
        if (description.includes('women') || description.includes('female')) {
            totalChecks++;
            if (this.userProfile.gender === 'female') {
                matches++;
                score += 20;
            } else if (this.userProfile.gender === 'male') {
                return 0; // Not eligible
            }
        }

        // Check first generation
        if (eligibility.includes('first generation') || description.includes('first-generation')) {
            totalChecks++;
            if (this.userProfile.firstGeneration) {
                matches++;
                score += 15;
            }
        }

        // Check military affiliation
        if (category.includes('military') || eligibility.includes('military')) {
            totalChecks++;
            if (this.userProfile.militaryAffiliation) {
                matches++;
                score += 20;
            } else {
                return 0; // Not eligible
            }
        }

        // Check rural status
        if (eligibility.includes('rural')) {
            totalChecks++;
            if (this.userProfile.rural) {
                matches++;
                score += 15;
            }
        }

        // If no demographic requirements, return neutral score
        if (totalChecks === 0) {
            return 75; // Open to everyone
        }

        return Math.min(score, 100);
    }

    /**
     * Calculate eligibility match
     */
    calculateEligibilityMatch(scholarship) {
        const eligibility = scholarship.eligibility.join(' ').toLowerCase();
        let score = 100;
        let passedChecks = 0;
        let totalChecks = 0;

        // Check citizenship
        if (eligibility.includes('us citizen')) {
            totalChecks++;
            if (this.userProfile.citizenship === 'US') {
                passedChecks++;
            } else {
                return 0; // Hard requirement
            }
        }

        // Check grade level
        if (eligibility.includes('high school senior')) {
            totalChecks++;
            if (this.userProfile.gradeLevel === 'senior') {
                passedChecks++;
            } else {
                return 0; // Not eligible
            }
        }

        // Check financial need
        if (eligibility.includes('financial need') || eligibility.includes('pell grant')) {
            totalChecks++;
            if (this.userProfile.financialNeed) {
                passedChecks++;
                score = 100;
            } else {
                score = 30; // Can still apply but lower chance
            }
        }

        // Check leadership requirement
        if (scholarship.category.toLowerCase().includes('leadership')) {
            totalChecks++;
            if (this.userProfile.leadership || this.userProfile.activities.length > 2) {
                passedChecks++;
                score = Math.min(score, 90);
            } else {
                score = Math.min(score, 40);
            }
        }

        // Check major/career specific
        if (scholarship.category.toLowerCase().includes('career-specific')) {
            totalChecks++;
            // Check if intended major matches (simplified check)
            if (this.userProfile.intendedMajor) {
                passedChecks++;
                score = Math.min(score, 85);
            } else {
                score = Math.min(score, 50);
            }
        }

        return totalChecks > 0 ? score : 75;
    }

    /**
     * Calculate competitiveness score (how competitive the user is)
     */
    calculateCompetitivenessScore(scholarship) {
        let score = 50; // Base score

        // Strong academic performance
        if (this.userProfile.gpa >= 3.8) score += 15;
        else if (this.userProfile.gpa >= 3.5) score += 10;
        else if (this.userProfile.gpa >= 3.0) score += 5;

        // High test scores
        if (this.userProfile.satScore >= 1400 || this.userProfile.actScore >= 32) {
            score += 15;
        } else if (this.userProfile.satScore >= 1200 || this.userProfile.actScore >= 26) {
            score += 10;
        }

        // Extracurricular activities
        if (this.userProfile.activities.length >= 3) score += 10;
        else if (this.userProfile.activities.length >= 1) score += 5;

        // Leadership
        if (this.userProfile.leadership) score += 10;

        // Volunteer work
        if (this.userProfile.volunteer) score += 5;

        return Math.min(score, 100);
    }

    /**
     * Calculate confidence level
     */
    calculateConfidence(scores) {
        const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
        
        if (avgScore >= 80) return 'high';
        if (avgScore >= 60) return 'medium';
        return 'low';
    }

    /**
     * Get recommendation text
     */
    getRecommendation(score) {
        if (score >= 85) return 'Excellent Match! Strongly recommended to apply.';
        if (score >= 70) return 'Good Match! You should apply.';
        if (score >= 55) return 'Fair Match. Consider applying if interested.';
        if (score >= 40) return 'Low Match. May be challenging but possible.';
        return 'Poor Match. Consider other opportunities.';
    }

    /**
     * Identify strengths
     */
    identifyStrengths(scores, scholarship) {
        const strengths = [];

        if (scores.academicMatch >= 85) {
            strengths.push('Strong academic qualifications');
        }
        if (scores.demographicMatch >= 80) {
            strengths.push('Perfect demographic match');
        }
        if (scores.eligibilityMatch >= 90) {
            strengths.push('Meets all eligibility requirements');
        }
        if (scores.competitivenessScore >= 80) {
            strengths.push('Highly competitive profile');
        }

        return strengths;
    }

    /**
     * Identify areas for improvement
     */
    identifyImprovements(scores, scholarship) {
        const improvements = [];

        if (scores.academicMatch < 70) {
            improvements.push('Consider improving GPA or test scores');
        }
        if (scores.competitivenessScore < 60) {
            improvements.push('Build more extracurricular activities');
        }
        if (!this.userProfile.leadership) {
            improvements.push('Consider taking on leadership roles');
        }
        if (!this.userProfile.volunteer) {
            improvements.push('Add volunteer/community service experience');
        }

        return improvements;
    }

    /**
     * Get match score display HTML
     */
    getMatchScoreHTML(matchData) {
        const { score, confidence, recommendation, strengths } = matchData;

        let scoreClass = 'low';
        let scoreColor = '#ef4444';
        if (score >= 70) {
            scoreClass = 'high';
            scoreColor = '#10b981';
        } else if (score >= 55) {
            scoreClass = 'medium';
            scoreColor = '#f59e0b';
        }

        return `
            <div class="match-score-widget ${scoreClass}">
                <div class="match-score-circle" style="--score-color: ${scoreColor}">
                    <svg class="match-score-ring" viewBox="0 0 100 100">
                        <circle class="match-score-ring-bg" cx="50" cy="50" r="45"/>
                        <circle class="match-score-ring-fill" cx="50" cy="50" r="45" 
                                style="stroke-dashoffset: ${283 - (283 * score / 100)}"/>
                    </svg>
                    <div class="match-score-value">
                        <span class="score-number">${score}</span>
                        <span class="score-label">Match</span>
                    </div>
                </div>
                <div class="match-score-details">
                    <div class="match-confidence">
                        <i class="fas fa-signal"></i>
                        <span>Confidence: <strong>${confidence.toUpperCase()}</strong></span>
                    </div>
                    <p class="match-recommendation">${recommendation}</p>
                    ${strengths.length > 0 ? `
                        <div class="match-strengths">
                            <strong>Your Strengths:</strong>
                            <ul>
                                ${strengths.map(s => `<li><i class="fas fa-check"></i> ${s}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Update user profile
     */
    async updateProfile(profileData) {
        this.userProfile = { ...this.userProfile, ...profileData };
        
        // Save to localStorage
        localStorage.setItem('userProfile', JSON.stringify(this.userProfile));

        // Save to Firebase if available
        if (typeof firebase !== 'undefined' && firebase.firestore && firebase.auth().currentUser) {
            const db = firebase.firestore();
            const userId = firebase.auth().currentUser.uid;
            await db.collection('users').doc(userId).set(this.userProfile, { merge: true });
        }

        console.log('✅ Profile updated');
    }
}

// Initialize global instance
window.scholarshipMatchScore = new ScholarshipMatchScore();

// Auto-initialize when Firebase auth is ready
if (typeof firebase !== 'undefined') {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            window.scholarshipMatchScore.initialize(user.uid);
        } else {
            window.scholarshipMatchScore.initialize(null);
        }
    });
} else {
    // Initialize without Firebase
    window.scholarshipMatchScore.initialize(null);
}
