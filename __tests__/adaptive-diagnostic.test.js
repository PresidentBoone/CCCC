/**
 * Tests for Adaptive Diagnostic Algorithm
 */

const AdaptiveDiagnostic = require('../public/js/adaptive-diagnostic.js');
const diagnosticQuestionBank = require('../public/js/diagnostic-questions-full.js');

describe('Adaptive Diagnostic Algorithm', () => {
  let diagnostic;

  beforeEach(() => {
    diagnostic = new AdaptiveDiagnostic(diagnosticQuestionBank);
  });

  test('initializes with correct defaults', () => {
    expect(diagnostic.currentCategory).toBe('math');
    expect(diagnostic.questionsPerCategory).toBe(20);
    expect(diagnostic.totalQuestions).toBe(80);
  });

  test('starts at difficulty 3 for all categories', () => {
    expect(diagnostic.currentDifficulty.math).toBe(3);
    expect(diagnostic.currentDifficulty.english).toBe(3);
    expect(diagnostic.currentDifficulty.reading).toBe(3);
    expect(diagnostic.currentDifficulty.science).toBe(3);
  });

  test('getNextQuestion returns a valid question', () => {
    const question = diagnostic.getNextQuestion();

    expect(question).toBeTruthy();
    expect(question).toHaveProperty('id');
    expect(question).toHaveProperty('question');
    expect(question).toHaveProperty('options');
    expect(question).toHaveProperty('correctAnswer');
    expect(question).toHaveProperty('difficulty');
    expect(question).toHaveProperty('category');
  });

  test('recordAnswer tracks answers in userAnswers', () => {
    const question = diagnostic.getNextQuestion();
    const initialCount = diagnostic.userAnswers.math.length;

    diagnostic.recordAnswer(question, 0, true);

    expect(diagnostic.userAnswers.math.length).toBe(initialCount + 1);
  });

  test('difficulty increases after 2 consecutive correct answers', () => {
    const question1 = diagnostic.getNextQuestion();
    const question2 = diagnostic.getNextQuestion();
    const initialDifficulty = diagnostic.currentDifficulty.math;

    diagnostic.recordAnswer(question1, 0, true);
    diagnostic.recordAnswer(question2, 0, true);

    expect(diagnostic.currentDifficulty.math).toBe(initialDifficulty + 1);
  });

  test('difficulty decreases after 2 consecutive wrong answers', () => {
    const question1 = diagnostic.getNextQuestion();
    const question2 = diagnostic.getNextQuestion();
    const initialDifficulty = diagnostic.currentDifficulty.math;

    diagnostic.recordAnswer(question1, 0, false);
    diagnostic.recordAnswer(question2, 0, false);

    expect(diagnostic.currentDifficulty.math).toBe(initialDifficulty - 1);
  });

  test('difficulty never goes below 1', () => {
    diagnostic.currentDifficulty.math = 1;

    const question1 = diagnostic.getNextQuestion();
    const question2 = diagnostic.getNextQuestion();

    diagnostic.recordAnswer(question1, 0, false);
    diagnostic.recordAnswer(question2, 0, false);

    expect(diagnostic.currentDifficulty.math).toBe(1);
  });

  test('difficulty never goes above 10', () => {
    diagnostic.currentDifficulty.math = 10;

    const question1 = diagnostic.getNextQuestion();
    const question2 = diagnostic.getNextQuestion();

    diagnostic.recordAnswer(question1, 0, true);
    diagnostic.recordAnswer(question2, 0, true);

    expect(diagnostic.currentDifficulty.math).toBe(10);
  });

  test('isCategoryComplete returns true after 20 questions', () => {
    // Answer 20 math questions
    for (let i = 0; i < 20; i++) {
      const question = diagnostic.getNextQuestion();
      diagnostic.recordAnswer(question, 0, true);
    }

    expect(diagnostic.isCategoryComplete('math')).toBe(true);
  });

  test('nextCategory advances to next category', () => {
    expect(diagnostic.currentCategory).toBe('math');

    diagnostic.nextCategory();
    expect(diagnostic.currentCategory).toBe('english');

    diagnostic.nextCategory();
    expect(diagnostic.currentCategory).toBe('reading');

    diagnostic.nextCategory();
    expect(diagnostic.currentCategory).toBe('science');
  });

  test('calculateResults returns valid score estimates', () => {
    // Simulate answering questions
    for (let i = 0; i < 80; i++) {
      const question = diagnostic.getNextQuestion();
      const isCorrect = Math.random() > 0.3; // 70% correct
      diagnostic.recordAnswer(question, 0, isCorrect);

      // Move to next category after 20 questions
      if (i === 19 || i === 39 || i === 59) {
        diagnostic.nextCategory();
      }
    }

    const results = diagnostic.calculateResults();

    // Check that results have required properties
    expect(results).toHaveProperty('overall');
    expect(results.overall).toHaveProperty('estimatedSAT');
    expect(results.overall).toHaveProperty('estimatedACT');
    expect(results.overall).toHaveProperty('estimatedPSAT');
    expect(results).toHaveProperty('byCategory');
    expect(results.byCategory).toHaveProperty('math');
    expect(results.byCategory).toHaveProperty('english');
    expect(results.byCategory).toHaveProperty('reading');
    expect(results.byCategory).toHaveProperty('science');

    // Check SAT score range
    expect(results.overall.estimatedSAT).toBeGreaterThanOrEqual(400);
    expect(results.overall.estimatedSAT).toBeLessThanOrEqual(1600);

    // Check ACT score range
    expect(results.overall.estimatedACT).toBeGreaterThanOrEqual(1);
    expect(results.overall.estimatedACT).toBeLessThanOrEqual(36);

    // Check PSAT score range
    expect(results.overall.estimatedPSAT).toBeGreaterThanOrEqual(320);
    expect(results.overall.estimatedPSAT).toBeLessThanOrEqual(1520);
  });

  test('all categories have equal number of questions answered', () => {
    // Answer all 80 questions
    for (let i = 0; i < 80; i++) {
      const question = diagnostic.getNextQuestion();
      diagnostic.recordAnswer(question, 0, Math.random() > 0.5);

      if (i === 19 || i === 39 || i === 59) {
        diagnostic.nextCategory();
      }
    }

    const results = diagnostic.calculateResults();

    expect(results.byCategory.math.total).toBe(20);
    expect(results.byCategory.english.total).toBe(20);
    expect(results.byCategory.reading.total).toBe(20);
    expect(results.byCategory.science.total).toBe(20);
  });
});
