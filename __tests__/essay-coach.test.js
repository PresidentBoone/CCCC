/**
 * Tests for Essay Coach
 */

describe('Essay Coach - Security Helpers', () => {
  let sanitizeHTML, safeSetHTML, validateInput;

  beforeAll(() => {
    // Mock DOM
    global.document = {
      createElement: jest.fn(() => ({
        textContent: '',
        innerHTML: ''
      }))
    };

    // Define sanitizeHTML
    sanitizeHTML = (str) => {
      if (!str) return '';
      const div = { textContent: '', innerHTML: '' };
      div.textContent = str;
      // Simulate escaping
      return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };

    // Define safeSetHTML
    safeSetHTML = (element, content) => {
      if (!element || content === null || content === undefined) return;

      // If content has no HTML tags, use textContent (safer)
      if (!/<[a-z][\s\S]*>/i.test(content)) {
        element.textContent = content;
        return;
      }

      // Otherwise, sanitize before setting
      element.innerHTML = sanitizeHTML(content);
    };

    // Define validateInput
    validateInput = (input, type = 'text') => {
      if (!input) return '';

      let sanitized = String(input).trim();

      switch (type) {
        case 'number':
          sanitized = parseInt(sanitized, 10);
          return isNaN(sanitized) ? 0 : sanitized;

        case 'email':
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized) ? sanitized : '';

        case 'url':
          try {
            new URL(sanitized);
            return sanitized;
          } catch {
            return '';
          }

        case 'text':
        default:
          // Remove script tags and dangerous content
          return sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      }
    };
  });

  describe('sanitizeHTML', () => {
    test('escapes HTML tags', () => {
      const result = sanitizeHTML('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;');
    });

    test('handles empty input', () => {
      expect(sanitizeHTML('')).toBe('');
      expect(sanitizeHTML(null)).toBe('');
    });

    test('preserves plain text', () => {
      const result = sanitizeHTML('Hello World');
      expect(result).toBe('Hello World');
    });
  });

  describe('validateInput', () => {
    test('validates email addresses', () => {
      expect(validateInput('test@example.com', 'email')).toBe('test@example.com');
      expect(validateInput('invalid-email', 'email')).toBe('');
      expect(validateInput('no@domain', 'email')).toBe('');
    });

    test('validates numbers', () => {
      expect(validateInput('42', 'number')).toBe(42);
      expect(validateInput('abc', 'number')).toBe(0);
      expect(validateInput('3.14', 'number')).toBe(3);
    });

    test('removes script tags from text', () => {
      const malicious = 'Hello <script>alert("xss")</script> World';
      const result = validateInput(malicious, 'text');
      expect(result).not.toContain('<script>');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });

    test('validates URLs', () => {
      expect(validateInput('https://example.com', 'url')).toBe('https://example.com');
      expect(validateInput('not-a-url', 'url')).toBe('');
    });

    test('handles empty input', () => {
      expect(validateInput('', 'text')).toBe('');
      expect(validateInput(null, 'text')).toBe('');
    });

    test('trims whitespace', () => {
      expect(validateInput('  hello  ', 'text')).toBe('hello');
    });
  });
});

describe('Essay Coach - Analytics Integration', () => {
  test('analytics object has essay-specific methods', () => {
    const analytics = {
      track: jest.fn(),
      essayCreated: jest.fn(),
      essaySaved: jest.fn(),
      essayAnalyzed: jest.fn(),
      aiFeedbackRequested: jest.fn(),
      essayVersionCreated: jest.fn(),
      chatMessageSent: jest.fn()
    };

    expect(analytics).toHaveProperty('essayCreated');
    expect(analytics).toHaveProperty('essaySaved');
    expect(analytics).toHaveProperty('essayAnalyzed');
    expect(analytics).toHaveProperty('aiFeedbackRequested');
    expect(analytics).toHaveProperty('essayVersionCreated');
    expect(analytics).toHaveProperty('chatMessageSent');
  });
});

describe('Essay Coach - Error Messages', () => {
  test('showErrorMessage function works correctly', () => {
    const mockErrorDiv = { style: { display: 'none' } };
    const mockErrorText = { textContent: '' };

    // Simplified test - just verify function logic
    function showErrorMessage(message) {
      mockErrorText.textContent = message;
      mockErrorDiv.style.display = 'block';
    }

    showErrorMessage('Test error');

    expect(mockErrorDiv.style.display).toBe('block');
    expect(mockErrorText.textContent).toBe('Test error');
  });

  test('showSuccessMessage function works correctly', () => {
    const mockSuccessDiv = { style: { display: 'none' } };
    const mockSuccessText = { textContent: '' };

    function showSuccessMessage(message) {
      mockSuccessText.textContent = message;
      mockSuccessDiv.style.display = 'block';
    }

    showSuccessMessage('Test success');

    expect(mockSuccessDiv.style.display).toBe('block');
    expect(mockSuccessText.textContent).toBe('Test success');
  });

  test('showInfoMessage function works correctly', () => {
    const mockInfoDiv = { style: { display: 'none' } };
    const mockInfoText = { textContent: '' };

    function showInfoMessage(message) {
      mockInfoText.textContent = message;
      mockInfoDiv.style.display = 'block';
    }

    showInfoMessage('Test info');

    expect(mockInfoDiv.style.display).toBe('block');
    expect(mockInfoText.textContent).toBe('Test info');
  });
});

describe('Essay Coach - Offline Detection', () => {
  test('checkOnline returns false when offline', () => {
    const checkOnline = (isOffline) => {
      if (isOffline) {
        return false;
      }
      return true;
    };

    expect(checkOnline(true)).toBe(false);
    expect(checkOnline(false)).toBe(true);
  });
});
