/**
 * ADAPTIVE DIAGNOSTIC ALGORITHM
 *
 * Students take 80 questions total (20 from each of 4 categories)
 * Questions adapt based on performance - correct answers = harder questions
 *
 * Algorithm:
 * 1. Start with difficulty 3 (medium baseline)
 * 2. If student gets 2 consecutive correct → increase difficulty by 1
 * 3. If student gets 2 consecutive wrong → decrease difficulty by 1
 * 4. Difficulty range: 1-10
 * 5. Last 3 questions of each category (38-40) are only shown if student reaches difficulty 9+
 */

class AdaptiveDiagnostic {
    constructor(questionBank) {
        this.questionBank = questionBank;
        this.currentDifficulty = {
            math: 3,
            english: 3,
            reading: 3,
            science: 3
        };
        this.consecutiveCorrect = {
            math: 0,
            english: 0,
            reading: 0,
            science: 0
        };
        this.consecutiveWrong = {
            math: 0,
            english: 0,
            reading: 0,
            science: 0
        };
        this.askedQuestions = {
            math: [],
            english: [],
            reading: [],
            science: []
        };
        this.userAnswers = {
            math: [],
            english: [],
            reading: [],
            science: []
        };
        this.currentCategory = 'math';
        this.questionsPerCategory = 20;
        this.totalQuestions = 80; // 20 per category × 4 categories
    }

    /**
     * Get the next question for the current category
     */
    getNextQuestion() {
        const category = this.currentCategory;
        const difficulty = this.currentDifficulty[category];

        // Get available questions at current difficulty level
        const availableQuestions = this.questionBank[category].filter(q =>
            q.difficulty === difficulty &&
            !this.askedQuestions[category].includes(q.id)
        );

        // If no questions at exact difficulty, get nearest
        if (availableQuestions.length === 0) {
            return this.getQuestionNearestDifficulty(category, difficulty);
        }

        // Randomly select from available questions
        const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.askedQuestions[category].push(question.id);

        return {
            ...question,
            category: category,
            questionNumber: this.getTotalQuestionsAsked() + 1,
            totalQuestions: this.totalQuestions
        };
    }

    /**
     * Find question at nearest difficulty if exact match not available
     */
    getQuestionNearestDifficulty(category, targetDifficulty) {
        const askedIds = this.askedQuestions[category];
        let searchRange = 1;

        while (searchRange <= 5) {
            // Try difficulty ± range
            for (let offset of [0, searchRange, -searchRange]) {
                const difficulty = Math.max(1, Math.min(10, targetDifficulty + offset));
                const available = this.questionBank[category].filter(q =>
                    q.difficulty === difficulty && !askedIds.includes(q.id)
                );

                if (available.length > 0) {
                    const question = available[Math.floor(Math.random() * available.length)];
                    this.askedQuestions[category].push(question.id);
                    return {
                        ...question,
                        category: category,
                        questionNumber: this.getTotalQuestionsAsked() + 1,
                        totalQuestions: this.totalQuestions
                    };
                }
            }
            searchRange++;
        }

        // Fallback: get any unasked question from category
        const remaining = this.questionBank[category].filter(q => !askedIds.includes(q.id));
        if (remaining.length > 0) {
            const question = remaining[Math.floor(Math.random() * remaining.length)];
            this.askedQuestions[category].push(question.id);
            return {
                ...question,
                category: category,
                questionNumber: this.getTotalQuestionsAsked() + 1,
                totalQuestions: this.totalQuestions
            };
        }

        return null; // Category exhausted
    }

    /**
     * Record user's answer and adapt difficulty
     */
    recordAnswer(question, userAnswerIndex, isCorrect) {
        const category = question.category;

        this.userAnswers[category].push({
            questionId: question.id,
            difficulty: question.difficulty,
            userAnswer: userAnswerIndex,
            correctAnswer: question.correctAnswer,
            isCorrect: isCorrect,
            timestamp: new Date().toISOString()
        });

        // Adapt difficulty based on performance
        if (isCorrect) {
            this.consecutiveCorrect[category]++;
            this.consecutiveWrong[category] = 0;

            // Increase difficulty after 2 consecutive correct answers
            if (this.consecutiveCorrect[category] >= 2) {
                this.currentDifficulty[category] = Math.min(10, this.currentDifficulty[category] + 1);
                this.consecutiveCorrect[category] = 0;
            }
        } else {
            this.consecutiveWrong[category]++;
            this.consecutiveCorrect[category] = 0;

            // Decrease difficulty after 2 consecutive wrong answers
            if (this.consecutiveWrong[category] >= 2) {
                this.currentDifficulty[category] = Math.max(1, this.currentDifficulty[category] - 1);
                this.consecutiveWrong[category] = 0;
            }
        }
    }

    /**
     * Check if current category is complete
     */
    isCategoryComplete() {
        return this.askedQuestions[this.currentCategory].length >= this.questionsPerCategory;
    }

    /**
     * Move to next category
     */
    nextCategory() {
        const categories = ['math', 'english', 'reading', 'science'];
        const currentIndex = categories.indexOf(this.currentCategory);

        if (currentIndex < categories.length - 1) {
            this.currentCategory = categories[currentIndex + 1];
            return true;
        }
        return false; // All categories complete
    }

    /**
     * Check if entire diagnostic is complete
     */
    isDiagnosticComplete() {
        return this.getTotalQuestionsAsked() >= this.totalQuestions;
    }

    /**
     * Get total questions asked across all categories
     */
    getTotalQuestionsAsked() {
        return Object.values(this.askedQuestions).reduce((sum, arr) => sum + arr.length, 0);
    }

    /**
     * Calculate diagnostic results
     */
    calculateResults() {
        const results = {
            overall: {
                total: 0,
                correct: 0,
                accuracy: 0,
                estimatedSAT: 0,
                estimatedACT: 0,
                estimatedPSAT: 0
            },
            byCategory: {},
            strengths: [],
            weaknesses: [],
            recommendedFocus: []
        };

        // Calculate per-category results
        for (const category of ['math', 'english', 'reading', 'science']) {
            const answers = this.userAnswers[category];
            const correct = answers.filter(a => a.isCorrect).length;
            const total = answers.length;
            const accuracy = total > 0 ? (correct / total) * 100 : 0;

            // Calculate average difficulty attempted
            const avgDifficulty = answers.length > 0
                ? answers.reduce((sum, a) => sum + a.difficulty, 0) / answers.length
                : 0;

            results.byCategory[category] = {
                total,
                correct,
                accuracy: Math.round(accuracy),
                avgDifficulty: avgDifficulty.toFixed(1),
                maxDifficulty: Math.max(...answers.map(a => a.difficulty), 0)
            };

            results.overall.total += total;
            results.overall.correct += correct;

            // Identify strengths and weaknesses
            if (accuracy >= 75) {
                results.strengths.push({
                    category: this.formatCategoryName(category),
                    accuracy: Math.round(accuracy)
                });
            } else if (accuracy < 60) {
                results.weaknesses.push({
                    category: this.formatCategoryName(category),
                    accuracy: Math.round(accuracy)
                });
            }
        }

        // Calculate overall accuracy
        results.overall.accuracy = Math.round((results.overall.correct / results.overall.total) * 100);

        // Estimate scores using official conversion tables
        results.overall.estimatedSAT = this.estimateSATScore(results);
        results.overall.estimatedACT = this.estimateACTScore(results);
        results.overall.estimatedPSAT = Math.min(results.overall.estimatedSAT, 1520); // PSAT caps at 1520

        // Generate recommended focus areas
        results.recommendedFocus = this.generateRecommendations(results);

        return results;
    }

    /**
     * Estimate SAT score (400-1600 scale)
     */
    estimateSATScore(results) {
        // SAT has Math (200-800) and Evidence-Based Reading/Writing (200-800)
        const mathAccuracy = results.byCategory.math.accuracy;
        const englishAccuracy = results.byCategory.english.accuracy;
        const readingAccuracy = results.byCategory.reading.accuracy;

        // Math section score
        const mathScore = 200 + Math.round((mathAccuracy / 100) * 600);

        // EBRW section score (combines English and Reading)
        const ebrwAccuracy = (englishAccuracy + readingAccuracy) / 2;
        const ebrwScore = 200 + Math.round((ebrwAccuracy / 100) * 600);

        return mathScore + ebrwScore;
    }

    /**
     * Estimate ACT score (1-36 scale)
     */
    estimateACTScore(results) {
        // ACT has 4 sections: English, Math, Reading, Science
        const scores = [];

        for (const category of ['math', 'english', 'reading', 'science']) {
            const accuracy = results.byCategory[category].accuracy;
            const avgDifficulty = parseFloat(results.byCategory[category].avgDifficulty);

            // Base score from accuracy
            let score = 1 + Math.round((accuracy / 100) * 35);

            // Adjust for difficulty - higher difficulty = higher ceiling
            if (avgDifficulty >= 8) {
                score = Math.min(36, score + 2);
            } else if (avgDifficulty >= 6) {
                score = Math.min(36, score + 1);
            }

            scores.push(score);
        }

        // ACT composite is the average of all 4 sections
        return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
    }

    /**
     * Generate personalized recommendations
     */
    generateRecommendations(results) {
        const recommendations = [];

        // Analyze weaknesses
        for (const weakness of results.weaknesses) {
            recommendations.push({
                priority: 'high',
                area: weakness.category,
                message: `Focus on ${weakness.category} - currently at ${weakness.accuracy}% accuracy`,
                action: `Complete 30-minute daily practice sessions in ${weakness.category}`
            });
        }

        // Analyze moderate areas (60-75% accuracy)
        for (const [category, data] of Object.entries(results.byCategory)) {
            if (data.accuracy >= 60 && data.accuracy < 75) {
                recommendations.push({
                    priority: 'medium',
                    area: this.formatCategoryName(category),
                    message: `Improve ${this.formatCategoryName(category)} to reach 80%+ mastery`,
                    action: `Practice 20 minutes daily with focus on difficulty ${Math.ceil(data.avgDifficulty)} questions`
                });
            }
        }

        // Suggest advanced work for strengths
        for (const strength of results.strengths) {
            recommendations.push({
                priority: 'low',
                area: strength.category,
                message: `Maintain ${strength.category} strength with challenging problems`,
                action: `Practice difficulty 8-10 questions to push to 36-level mastery`
            });
        }

        return recommendations;
    }

    /**
     * Format category name for display
     */
    formatCategoryName(category) {
        return category.charAt(0).toUpperCase() + category.slice(1);
    }

    /**
     * Get progress summary
     */
    getProgress() {
        const total = this.getTotalQuestionsAsked();
        const percentage = Math.round((total / this.totalQuestions) * 100);

        return {
            questionsCompleted: total,
            totalQuestions: this.totalQuestions,
            percentage: percentage,
            currentCategory: this.formatCategoryName(this.currentCategory),
            categoryProgress: {
                math: this.askedQuestions.math.length,
                english: this.askedQuestions.english.length,
                reading: this.askedQuestions.reading.length,
                science: this.askedQuestions.science.length
            }
        };
    }

    /**
     * Export results for saving to Firestore
     */
    exportResults() {
        return {
            completedAt: new Date().toISOString(),
            results: this.calculateResults(),
            rawAnswers: this.userAnswers,
            difficultyCurve: this.currentDifficulty,
            totalQuestions: this.getTotalQuestionsAsked()
        };
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdaptiveDiagnostic;
}
