/**
 * College Discovery Engine
 * AI-powered college matching and recommendations
 */

class CollegeDiscovery {
    constructor(aiEngine, userProfile) {
        this.aiEngine = aiEngine;
        this.userProfile = userProfile;
    }

    async findMatches() {
        const matches = await this.aiEngine.findCollegeMatches();
        return matches.map(college => this.enrichCollegeData(college));
    }

    enrichCollegeData(college) {
        return {
            ...college,
            matchReasons: this.generateMatchReasons(college),
            personalizedInsights: this.generateInsights(college)
        };
    }

    generateMatchReasons(college) {
        const reasons = [];
        const profile = this.userProfile.getProfile();

        // Academic fit
        if (profile.intendedMajor && college.strongPrograms?.includes(profile.intendedMajor)) {
            reasons.push(`Strong ${profile.intendedMajor} program`);
        }

        // Location match
        if (profile.preferredLocations?.includes(college.state)) {
            reasons.push(`Located in preferred area (${college.state})`);
        }

        // Size preference
        if (profile.collegeSize === college.size) {
            reasons.push(`Matches preferred ${college.size} campus size`);
        }

        // Extracurricular alignment
        if (profile.extracurriculars) {
            const matchingActivities = college.activities?.filter(
                act => profile.extracurriculars.some(ext => 
                    ext.toLowerCase().includes(act.toLowerCase())
                )
            );
            if (matchingActivities?.length > 0) {
                reasons.push(`Offers ${matchingActivities.join(', ')}`);
            }
        }

        return reasons;
    }

    generateInsights(college) {
        const profile = this.userProfile.getProfile();
        const insights = [];

        // Career goals alignment
        if (profile.careerGoals) {
            insights.push(`This school's ${college.name} program aligns with your ${profile.careerGoals.join(' and ')} career goals`);
        }

        // Academic opportunities
        if (college.researchOpportunities) {
            insights.push(`Excellent research opportunities in your field of interest`);
        }

        // Unique features
        if (college.uniqueFeatures) {
            insights.push(...college.uniqueFeatures);
        }

        return insights;
    }
}

window.CollegeDiscovery = CollegeDiscovery;
