/**
 * Input Sanitizer & Security Utility
 * Part of CollegeClimb Engineering Overhaul - Phase 1.4
 * 
 * Provides methods to sanitize user input and prevent XSS attacks.
 * 
 * @version 1.0.0
 */

class InputSanitizer {
    constructor() {
        this.parser = new DOMParser();
    }

    /**
     * Sanitize a string to prevent XSS
     * @param {string} input - Raw input string
     * @returns {string} Sanitized string
     */
    sanitize(input) {
        if (!input) return '';
        if (typeof input !== 'string') return String(input);

        // 1. Basic HTML entity encoding
        const encoded = input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');

        // 2. Remove dangerous protocols (javascript:, data:, vbscript:)
        // This is a backup check, as encoding < and > should prevent script injection
        if (encoded.match(/(javascript|data|vbscript):/gi)) {
            console.warn('⚠️ Potential XSS attempt detected and blocked');
            return '';
        }

        return encoded;
    }

    /**
     * Sanitize an object recursively
     * @param {Object} obj - Raw object
     * @returns {Object} Sanitized object
     */
    sanitizeObject(obj) {
        if (typeof obj !== 'object' || obj === null) {
            return this.sanitize(obj);
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item));
        }

        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = this.sanitizeObject(value);
        }
        return sanitized;
    }

    /**
     * Validate email format
     * @param {string} email 
     * @returns {boolean}
     */
    validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    }

    /**
     * Validate password strength
     * @param {string} password 
     * @returns {Object} { isValid, message }
     */
    validatePassword(password) {
        if (password.length < 8) {
            return { isValid: false, message: 'Password must be at least 8 characters' };
        }
        // Add more rules as needed (uppercase, number, special char)
        return { isValid: true, message: '' };
    }
}

// Create global instance
window.InputSanitizer = new InputSanitizer();
console.log('🛡️ InputSanitizer initialized');
