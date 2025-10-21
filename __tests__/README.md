# Test Suite Documentation

## Overview

Automated test suite for College Climb Test Prep Platform using Jest.

## Running Tests

```bash
# Install dependencies first
npm install

# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Files

### `diagnostic-questions.test.js`
Tests the 160-question diagnostic question bank:
- Validates 40 questions per category (Math, English, Reading, Science)
- Checks all questions have required fields
- Verifies question IDs are unique
- Validates difficulty ranges (1-10)
- Confirms last 3 questions per category are difficulty 10
- Checks all questions have 4 options
- Validates correctAnswer indices (0-3)
- Verifies explanations exist and are non-empty

### `adaptive-diagnostic.test.js`
Tests the adaptive diagnostic algorithm:
- Initialization with correct defaults
- Starting difficulty levels
- Question retrieval and validation
- Answer recording and tracking
- Difficulty adjustment (±1 after 2 consecutive correct/wrong)
- Difficulty bounds (1 min, 10 max)
- Category completion detection
- Category progression
- Score calculation (SAT, ACT, PSAT)
- Equal distribution of questions across categories

### `config.test.js`
Tests application configuration:
- Environment detection (dev vs production)
- Firebase configuration presence and validity
- Feature flags (error tracking, analytics, debug logs)
- Production vs development settings

## Coverage Goals

Target: 80% code coverage

Current coverage areas:
- ✅ Diagnostic question bank validation
- ✅ Adaptive algorithm logic
- ✅ Configuration management
- 🔄 UI components (planned)
- 🔄 Firebase integration (mocked)
- 🔄 Gamification systems (planned)

## Adding New Tests

1. Create test file in `__tests__/` directory
2. Name it `[feature].test.js`
3. Import the module to test
4. Write describe/test blocks
5. Run `npm test` to verify

Example:
```javascript
describe('Feature Name', () => {
  test('should do something', () => {
    expect(result).toBe(expected);
  });
});
```

## Continuous Integration

Before deploying to production:
1. All tests must pass (`npm test`)
2. Coverage should be >80% (`npm run test:coverage`)
3. No failing tests allowed in main branch

## Mocking

Firebase is mocked in `jest.setup.js` to avoid real database calls during tests.

To add new mocks, edit `jest.setup.js`.

## Test Environment

- **Framework**: Jest 29.x
- **Environment**: jsdom (simulates browser)
- **Assertions**: @testing-library/jest-dom
- **Timeout**: 10 seconds per test

## Debugging Tests

```bash
# Run specific test file
npm test diagnostic-questions

# Run with verbose output
npm test -- --verbose

# Run in debug mode (use Chrome DevTools)
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Best Practices

1. **Isolate tests** - Each test should be independent
2. **Mock external dependencies** - Don't make real API calls
3. **Test edge cases** - Not just happy paths
4. **Keep tests simple** - One concept per test
5. **Use descriptive names** - Test names should explain what they test
6. **Clean up after tests** - Use beforeEach/afterEach
7. **Avoid test interdependence** - Tests should pass in any order

## Known Issues

None currently.

## Future Test Additions

- [ ] UI component tests
- [ ] Integration tests for Firebase
- [ ] E2E tests for user flows
- [ ] Performance tests
- [ ] Accessibility tests
- [ ] Security tests
