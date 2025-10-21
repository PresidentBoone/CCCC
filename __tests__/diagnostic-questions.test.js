/**
 * Tests for Diagnostic Question Bank
 */

const diagnosticQuestionBank = require('../public/js/diagnostic-questions-full.js');

describe('Diagnostic Question Bank', () => {
  test('has 160 total questions (40 per category)', () => {
    expect(diagnosticQuestionBank.math).toHaveLength(40);
    expect(diagnosticQuestionBank.english).toHaveLength(40);
    expect(diagnosticQuestionBank.reading).toHaveLength(40);
    expect(diagnosticQuestionBank.science).toHaveLength(40);
  });

  test('all questions have required fields', () => {
    const categories = ['math', 'english', 'reading', 'science'];

    categories.forEach(category => {
      diagnosticQuestionBank[category].forEach(question => {
        expect(question).toHaveProperty('id');
        expect(question).toHaveProperty('difficulty');
        expect(question).toHaveProperty('question');
        expect(question).toHaveProperty('options');
        expect(question).toHaveProperty('correctAnswer');
        expect(question).toHaveProperty('explanation');
      });
    });
  });

  test('question IDs are unique', () => {
    const allIds = [];

    ['math', 'english', 'reading', 'science'].forEach(category => {
      diagnosticQuestionBank[category].forEach(question => {
        allIds.push(question.id);
      });
    });

    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  test('difficulty ranges from 1-10', () => {
    const categories = ['math', 'english', 'reading', 'science'];

    categories.forEach(category => {
      diagnosticQuestionBank[category].forEach(question => {
        expect(question.difficulty).toBeGreaterThanOrEqual(1);
        expect(question.difficulty).toBeLessThanOrEqual(10);
      });
    });
  });

  test('last 3 questions of each category are difficulty 10', () => {
    const categories = ['math', 'english', 'reading', 'science'];

    categories.forEach(category => {
      const questions = diagnosticQuestionBank[category];
      const last3 = questions.slice(-3);

      last3.forEach(question => {
        expect(question.difficulty).toBe(10);
      });
    });
  });

  test('all questions have 4 answer options', () => {
    const categories = ['math', 'english', 'reading', 'science'];

    categories.forEach(category => {
      diagnosticQuestionBank[category].forEach(question => {
        expect(question.options).toHaveLength(4);
      });
    });
  });

  test('correctAnswer is valid index (0-3)', () => {
    const categories = ['math', 'english', 'reading', 'science'];

    categories.forEach(category => {
      diagnosticQuestionBank[category].forEach(question => {
        expect(question.correctAnswer).toBeGreaterThanOrEqual(0);
        expect(question.correctAnswer).toBeLessThanOrEqual(3);
      });
    });
  });

  test('all questions have non-empty explanations', () => {
    const categories = ['math', 'english', 'reading', 'science'];

    categories.forEach(category => {
      diagnosticQuestionBank[category].forEach(question => {
        expect(question.explanation).toBeTruthy();
        expect(question.explanation.length).toBeGreaterThan(10);
      });
    });
  });
});
