/**
 * Intelligence API Handler
 * Provides AI-powered insights and calculations
 * - College fit scores
 * - Admission predictions
 * - Personalized recommendations
 * - Essay analysis
 */

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { action, data } = req.body || {};

        switch (action) {
            case 'calculate-fit':
                return await calculateCollegeFit(req, res, data);

            case 'predict-admission':
                return await predictAdmission(req, res, data);

            case 'analyze-profile':
                return await analyzeProfile(req, res, data);

            case 'recommend-colleges':
                return await recommendColleges(req, res, data);

            case 'analyze-essay':
                return await analyzeEssay(req, res, data);

            default:
                return res.status(400).json({
                    error: 'Invalid action',
                    validActions: ['calculate-fit', 'predict-admission', 'analyze-profile', 'recommend-colleges', 'analyze-essay']
                });
        }
    } catch (error) {
        console.error('Intelligence API Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

/**
 * Calculate college fit score
 */
async function calculateCollegeFit(req, res, data) {
    const { userProfile, collegeInfo } = data;

    if (!userProfile || !collegeInfo) {
        return res.status(400).json({ error: 'Missing userProfile or collegeInfo' });
    }

    try {
        const fitScore = calculateFitScore(userProfile, collegeInfo);

        return res.json({
            success: true,
            fitScore: fitScore
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

/**
 * Predict admission chances
 */
async function predictAdmission(req, res, data) {
    const { userProfile, collegeInfo } = data;

    if (!userProfile || !collegeInfo) {
        return res.status(400).json({ error: 'Missing userProfile or collegeInfo' });
    }

    try {
        const prediction = calculateAdmissionChance(userProfile, collegeInfo);

        return res.json({
            success: true,
            prediction: prediction
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

/**
 * Analyze user profile and provide insights
 */
async function analyzeProfile(req, res, data) {
    const { userProfile } = data;

    if (!userProfile) {
        return res.status(400).json({ error: 'Missing userProfile' });
    }

    try {
        const analysis = {
            strengths: [],
            weaknesses: [],
            opportunities: [],
            recommendations: []
        };

        // Analyze GPA
        const gpa = userProfile.academic?.gpa?.unweighted;
        if (gpa) {
            if (gpa >= 3.8) {
                analysis.strengths.push({
                    category: 'Academic',
                    item: 'Strong GPA',
                    value: gpa,
                    impact: 'High'
                });
            } else if (gpa < 3.0) {
                analysis.weaknesses.push({
                    category: 'Academic',
                    item: 'GPA below 3.0',
                    value: gpa,
                    impact: 'High'
                });
                analysis.opportunities.push({
                    category: 'Academic',
                    action: 'Focus on earning strong grades in rigorous courses',
                    impact: 'High'
                });
            }
        } else {
            analysis.recommendations.push({
                priority: 'high',
                action: 'Add your GPA to your profile',
                reason: 'GPA is a critical factor in college admissions'
            });
        }

        // Analyze test scores
        const sat = userProfile.academic?.testScores?.sat?.composite;
        const act = userProfile.academic?.testScores?.act?.composite;

        if (sat >= 1400 || act >= 32) {
            analysis.strengths.push({
                category: 'Testing',
                item: 'Competitive test scores',
                value: sat || act,
                impact: 'High'
            });
        } else if ((sat && sat < 1200) || (act && act < 26)) {
            analysis.weaknesses.push({
                category: 'Testing',
                item: 'Test scores could be improved',
                value: sat || act,
                impact: 'Medium'
            });
            analysis.opportunities.push({
                category: 'Testing',
                action: 'Consider test prep and retaking exam',
                impact: 'High'
            });
        }

        if (!sat && !act) {
            analysis.recommendations.push({
                priority: 'high',
                action: 'Take SAT or ACT',
                reason: 'Most colleges require standardized test scores'
            });
        }

        // Analyze activities
        const activities = userProfile.activities || {};
        const activityCount = Object.values(activities).reduce((sum, arr) => sum + (arr?.length || 0), 0);

        if (activityCount >= 5) {
            analysis.strengths.push({
                category: 'Extracurricular',
                item: 'Well-rounded profile',
                value: `${activityCount} activities`,
                impact: 'Medium'
            });
        } else if (activityCount < 2) {
            analysis.weaknesses.push({
                category: 'Extracurricular',
                item: 'Limited extracurricular involvement',
                value: `${activityCount} activities`,
                impact: 'Medium'
            });
            analysis.opportunities.push({
                category: 'Extracurricular',
                action: 'Join clubs or activities aligned with your interests',
                impact: 'Medium'
            });
        }

        // Leadership analysis
        const leadership = activities.leadership?.length || 0;
        if (leadership >= 2) {
            analysis.strengths.push({
                category: 'Leadership',
                item: 'Demonstrated leadership',
                value: `${leadership} positions`,
                impact: 'High'
            });
        } else if (leadership === 0) {
            analysis.opportunities.push({
                category: 'Leadership',
                action: 'Seek leadership roles in activities you\'re passionate about',
                impact: 'High'
            });
        }

        // Calculate overall competitiveness score
        const competitivenessScore = calculateCompetitivenessScore(userProfile);

        return res.json({
            success: true,
            analysis: analysis,
            competitivenessScore: competitivenessScore,
            profileCompleteness: userProfile.metadata?.profileCompleteness || 0
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

/**
 * Recommend colleges based on profile
 */
async function recommendColleges(req, res, data) {
    const { userProfile, preferences } = data;

    if (!userProfile) {
        return res.status(400).json({ error: 'Missing userProfile' });
    }

    // This would query a college database
    // For now, return sample recommendations
    const recommendations = [
        {
            name: 'Stanford University',
            type: 'reach',
            fitScore: 78,
            admissionChance: 15,
            reasoning: 'Strong academic program, matches your interests in technology'
        },
        {
            name: 'University of Michigan',
            type: 'target',
            fitScore: 85,
            admissionChance: 45,
            reasoning: 'Excellent match for your profile and preferences'
        },
        {
            name: 'Ohio State University',
            type: 'safety',
            fitScore: 82,
            admissionChance: 75,
            reasoning: 'Great safety option with strong programs in your field'
        }
    ];

    return res.json({
        success: true,
        recommendations: recommendations
    });
}

/**
 * Analyze essay content
 */
async function analyzeEssay(req, res, data) {
    const { essayContent, wordLimit } = data;

    if (!essayContent) {
        return res.status(400).json({ error: 'Missing essayContent' });
    }

    try {
        const words = essayContent.trim().split(/\s+/);
        const wordCount = words.length;
        const sentences = essayContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const paragraphs = essayContent.split(/\n\n+/).filter(p => p.trim().length > 0);

        const analysis = {
            wordCount: wordCount,
            sentenceCount: sentences.length,
            paragraphCount: paragraphs.length,
            avgWordsPerSentence: Math.round(wordCount / sentences.length),
            avgSentencesPerParagraph: Math.round(sentences.length / paragraphs.length),
            withinLimit: wordLimit ? wordCount <= wordLimit : null,
            limitStatus: wordLimit
                ? wordCount <= wordLimit
                    ? 'Within limit'
                    : `${wordCount - wordLimit} words over limit`
                : 'No limit specified',
            readabilityScore: calculateReadabilityScore(words, sentences),
            suggestions: []
        };

        // Generate suggestions
        if (wordLimit && wordCount > wordLimit) {
            analysis.suggestions.push({
                type: 'length',
                priority: 'high',
                message: `Essay is ${wordCount - wordLimit} words over the ${wordLimit} word limit. Consider removing unnecessary details.`
            });
        }

        if (analysis.avgWordsPerSentence > 25) {
            analysis.suggestions.push({
                type: 'readability',
                priority: 'medium',
                message: 'Consider breaking up long sentences for better readability.'
            });
        }

        if (paragraphs.length < 3) {
            analysis.suggestions.push({
                type: 'structure',
                priority: 'medium',
                message: 'Consider adding more paragraphs to improve essay structure.'
            });
        }

        return res.json({
            success: true,
            analysis: analysis
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

/**
 * Helper: Calculate fit score
 */
function calculateFitScore(userProfile, collegeInfo) {
    let fitScore = 0;
    const factors = [];

    // Academic fit (40%)
    const academicFit = calculateAcademicFit(userProfile, collegeInfo);
    fitScore += academicFit * 0.4;
    factors.push({ name: 'Academic Match', score: academicFit, weight: 0.4 });

    // Location fit (15%)
    const locationFit = calculateLocationFit(userProfile, collegeInfo);
    fitScore += locationFit * 0.15;
    factors.push({ name: 'Location', score: locationFit, weight: 0.15 });

    // Size/Type fit (15%)
    const sizeFit = calculateSizeFit(userProfile, collegeInfo);
    fitScore += sizeFit * 0.15;
    factors.push({ name: 'School Size/Type', score: sizeFit, weight: 0.15 });

    // Financial fit (20%)
    const financialFit = calculateFinancialFit(userProfile, collegeInfo);
    fitScore += financialFit * 0.2;
    factors.push({ name: 'Financial', score: financialFit, weight: 0.2 });

    // Program fit (10%)
    const programFit = calculateProgramFit(userProfile, collegeInfo);
    fitScore += programFit * 0.1;
    factors.push({ name: 'Program/Major', score: programFit, weight: 0.1 });

    return {
        overall: Math.round(fitScore),
        factors: factors,
        reasoning: factors.map(f => `${f.name}: ${f.score}/100`).join(', ')
    };
}

/**
 * Helper: Calculate admission chance
 */
function calculateAdmissionChance(userProfile, collegeInfo) {
    let chance = 50; // Base chance

    // Test score comparison
    const userSAT = userProfile.academic?.testScores?.sat?.composite;
    const collegeSAT = collegeInfo.avgSAT;

    if (userSAT && collegeSAT) {
        const satDiff = userSAT - collegeSAT;
        chance += satDiff / 10; // +/- 10% per 100 points
    }

    // GPA comparison
    const userGPA = userProfile.academic?.gpa?.unweighted;
    if (userGPA) {
        if (userGPA >= 3.8) chance += 10;
        else if (userGPA >= 3.5) chance += 5;
        else if (userGPA < 3.0) chance -= 10;
    }

    // Admission rate factor
    if (collegeInfo.admissionRate) {
        const rate = parseFloat(collegeInfo.admissionRate);
        if (rate < 0.1) chance *= 0.8; // Very selective
        else if (rate > 0.5) chance *= 1.2; // Less selective
    }

    // Clamp between 5% and 95%
    chance = Math.max(5, Math.min(95, chance));

    return {
        percentage: Math.round(chance),
        confidence: 'medium',
        factors: [
            userSAT && collegeSAT ? `SAT: ${userSAT} vs avg ${collegeSAT}` : null,
            userGPA ? `GPA: ${userGPA}` : null,
            collegeInfo.admissionRate ? `Admission rate: ${(parseFloat(collegeInfo.admissionRate) * 100).toFixed(1)}%` : null
        ].filter(Boolean)
    };
}

// Fit calculation helpers
function calculateAcademicFit(userProfile, collegeInfo) {
    let score = 50;
    const userSAT = userProfile.academic?.testScores?.sat?.composite;
    const collegeSAT = collegeInfo.avgSAT;

    if (userSAT && collegeSAT) {
        const diff = Math.abs(userSAT - collegeSAT);
        if (diff < 50) score += 30;
        else if (diff < 100) score += 20;
        else if (diff < 150) score += 10;
    }

    return Math.min(100, score);
}

function calculateLocationFit(userProfile, collegeInfo) {
    const preferred = userProfile.collegePreferences?.preferredLocations || [];
    if (preferred.length === 0) return 75;

    const matches = preferred.some(pref =>
        collegeInfo.location?.toLowerCase().includes(pref.toLowerCase())
    );

    return matches ? 95 : 50;
}

function calculateSizeFit(userProfile, collegeInfo) {
    return 75; // Placeholder
}

function calculateFinancialFit(userProfile, collegeInfo) {
    const maxTuition = userProfile.collegePreferences?.maxTuition;
    const collegeTuition = collegeInfo.tuition;

    if (!maxTuition || !collegeTuition) return 75;

    if (collegeTuition <= maxTuition) return 100;
    if (collegeTuition <= maxTuition * 1.2) return 70;
    return 40;
}

function calculateProgramFit(userProfile, collegeInfo) {
    return 75; // Placeholder
}

function calculateCompetitivenessScore(userProfile) {
    let score = 0;
    let maxScore = 0;

    // GPA (30 points)
    maxScore += 30;
    const gpa = userProfile.academic?.gpa?.unweighted;
    if (gpa) {
        score += Math.min(30, (gpa / 4.0) * 30);
    }

    // Test scores (30 points)
    maxScore += 30;
    const sat = userProfile.academic?.testScores?.sat?.composite;
    const act = userProfile.academic?.testScores?.act?.composite;
    if (sat) {
        score += Math.min(30, (sat / 1600) * 30);
    } else if (act) {
        score += Math.min(30, (act / 36) * 30);
    }

    // Activities (20 points)
    maxScore += 20;
    const activityCount = Object.values(userProfile.activities || {})
        .reduce((sum, arr) => sum + (arr?.length || 0), 0);
    score += Math.min(20, activityCount * 2);

    // Leadership (10 points)
    maxScore += 10;
    const leadership = userProfile.activities?.leadership?.length || 0;
    score += Math.min(10, leadership * 5);

    // Awards (10 points)
    maxScore += 10;
    const awards = userProfile.awards?.length || 0;
    score += Math.min(10, awards * 2);

    return Math.round((score / maxScore) * 100);
}

function calculateReadabilityScore(words, sentences) {
    // Simple readability metric
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const avgSentenceLength = words.length / sentences.length;

    // Flesch Reading Ease approximation
    const score = 206.835 - 1.015 * avgSentenceLength - 84.6 * (avgWordLength / 5);

    return Math.max(0, Math.min(100, Math.round(score)));
}
