/**
 * Test Prep Manager
 * Generates and manages SAT/ACT/PSAT practice questions
 */

class TestPrepManager {
    constructor(aiEngine) {
        this.aiEngine = aiEngine;
        this.questionBank = {
            SAT: { Math: [], Reading: [], Writing: [] },
            ACT: { Math: [], Reading: [], English: [], Science: [] },
            PSAT: { Math: [], Reading: [], Writing: [] }
        };
    }

    async generateDiagnosticTest(testType) {
        const sections = this.getSections(testType);
        const test = {
            id: `diagnostic_${testType}_${Date.now()}`,
            type: testType,
            isDiagnostic: true,
            sections: {}
        };

        for (const section of sections) {
            test.sections[section] = await this.aiEngine.generateTestPrepQuestions(
                testType,
                section,
                'mixed', // Mixed difficulty for diagnostic
                testType === 'SAT' ? 20 : 15
            );
        }

        return test;
    }

    async generatePracticeQuestions(testType, subject, difficulty, count) {
        return await this.aiEngine.generateTestPrepQuestions(
            testType,
            subject,
            difficulty,
            count
        );
    }

    getSections(testType) {
        const sections = {
            SAT: ['Math', 'Reading', 'Writing'],
            ACT: ['Math', 'Reading', 'English', 'Science'],
            PSAT: ['Math', 'Reading', 'Writing']
        };
        return sections[testType] || [];
    }

    async submitTest(testResults) {
        return await this.aiEngine.analyzeTestPerformance(testResults);
    }

    getScoreRange(testType) {
        const ranges = {
            SAT: { min: 400, max: 1600 },
            ACT: { min: 1, max: 36 },
            PSAT: { min: 320, max: 1520 }
        };
        return ranges[testType];
    }
}

window.TestPrepManager = TestPrepManager;
