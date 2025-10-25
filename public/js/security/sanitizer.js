/**
 * Input Sanitization & Security Utilities
 * Prevents XSS, HTML injection, and script injection attacks
 * Part of CollegeClimb Engineering Overhaul - Phase 1.4
 *
 * @version 2.0.0
 * @author CollegeClimb Engineering Team
 */

class InputSanitizer {
    /**
     * Remove all HTML tags from input
     * @param {string} input - Raw input string
     * @returns {string} Sanitized string
     */
    static stripHTML(input) {
        if (typeof input !== 'string') return '';
        return input.replace(/<[^>]*>/g, '');
    }

    /**
     * Escape HTML entities to prevent XSS
     * @param {string} input - Raw input string
     * @returns {string} Escaped string safe for innerHTML
     */
    static escapeHTML(input) {
        if (typeof input !== 'string') return '';

        const entityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };

        return input.replace(/[&<>"'`=/]/g, char => entityMap[char]);
    }

    /**
     * Sanitize user display name
     * @param {string} name - Raw display name
     * @param {number} maxLength - Maximum length (default: 50)
     * @returns {string} Sanitized display name
     */
    static sanitizeDisplayName(name, maxLength = 50) {
        if (!name || typeof name !== 'string') return 'Anonymous';

        // Strip HTML
        let sanitized = this.stripHTML(name);

        // Remove special characters (keep alphanumeric, spaces, dashes, underscores, periods)
        sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-_.]/g, '');

        // Trim whitespace
        sanitized = sanitized.trim();

        // Truncate to max length
        if (sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength);
        }

        // Return or fallback
        return sanitized.length > 0 ? sanitized : 'Anonymous';
    }

    /**
     * Sanitize essay or long-form text
     * Allows some basic formatting but removes dangerous content
     * @param {string} text - Raw essay text
     * @param {number} maxLength - Maximum length (default: 10000)
     * @returns {string} Sanitized text
     */
    static sanitizeEssayText(text, maxLength = 10000) {
        if (!text || typeof text !== 'string') return '';

        // Remove script tags
        let sanitized = text.replace(/<script[^>]*>.*?<\/script>/gi, '');

        // Remove event handlers
        sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

        // Remove javascript: protocol
        sanitized = sanitized.replace(/javascript:/gi, '');

        // Remove data: URIs (can be used for XSS)
        sanitized = sanitized.replace(/data:text\/html[^,]*,/gi, '');

        // Truncate
        if (sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength);
        }

        return sanitized.trim();
    }

    /**
     * Sanitize URL to prevent javascript: and data: attacks
     * @param {string} url - Raw URL
     * @returns {string|null} Sanitized URL or null if invalid
     */
    static sanitizeURL(url) {
        if (!url || typeof url !== 'string') return null;

        // Trim whitespace
        url = url.trim();

        // Block dangerous protocols
        const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
        const lowerURL = url.toLowerCase();

        for (const protocol of dangerousProtocols) {
            if (lowerURL.startsWith(protocol)) {
                console.warn(`[Sanitizer] Blocked dangerous URL protocol: ${protocol}`);
                return null;
            }
        }

        // Validate URL format
        try {
            new URL(url);
            return url;
        } catch {
            // If not a full URL, check if it's a relative path
            if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
                return url;
            }

            console.warn(`[Sanitizer] Invalid URL format: ${url}`);
            return null;
        }
    }

    /**
     * Validate email address
     * @param {string} email - Email address
     * @returns {boolean} True if valid
     */
    static isValidEmail(email) {
        if (!email || typeof email !== 'string') return false;

        // RFC 5322 simplified regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Sanitize email (lowercase, trim, validate)
     * @param {string} email - Raw email
     * @returns {string|null} Sanitized email or null if invalid
     */
    static sanitizeEmail(email) {
        if (!email || typeof email !== 'string') return null;

        email = email.trim().toLowerCase();

        return this.isValidEmail(email) ? email : null;
    }

    /**
     * Sanitize phone number (remove non-digits, validate length)
     * @param {string} phone - Raw phone number
     * @returns {string|null} Sanitized phone or null if invalid
     */
    static sanitizePhone(phone) {
        if (!phone || typeof phone !== 'string') return null;

        // Remove all non-digit characters
        const digits = phone.replace(/\D/g, '');

        // US phone numbers should be 10 or 11 digits (with country code)
        if (digits.length >= 10 && digits.length <= 11) {
            return digits;
        }

        return null;
    }

    /**
     * Sanitize numeric input
     * @param {any} value - Raw value
     * @param {number} min - Minimum allowed value
     * @param {number} max - Maximum allowed value
     * @returns {number|null} Sanitized number or null if invalid
     */
    static sanitizeNumber(value, min = -Infinity, max = Infinity) {
        const num = parseFloat(value);

        if (isNaN(num)) return null;
        if (num < min) return min;
        if (num > max) return max;

        return num;
    }

    /**
     * Sanitize integer input
     * @param {any} value - Raw value
     * @param {number} min - Minimum allowed value
     * @param {number} max - Maximum allowed value
     * @returns {number|null} Sanitized integer or null if invalid
     */
    static sanitizeInteger(value, min = -Infinity, max = Infinity) {
        const num = parseInt(value, 10);

        if (isNaN(num)) return null;
        if (num < min) return min;
        if (num > max) return max;

        return num;
    }

    /**
     * Sanitize casino progress data (anti-cheat)
     * @param {Object} data - Progress data
     * @param {Object} previous - Previous progress data
     * @returns {Object} Validation result
     */
    static validateCasinoProgress(data, previous = {}) {
        const errors = [];
        const warnings = [];

        // Validate coins increment
        const coinIncrement = (data.coins || 0) - (previous.coins || 0);
        if (coinIncrement > 5000) {
            errors.push(`Invalid coin increment: ${coinIncrement} (max: 5000)`);
        }
        if (data.coins < 0) {
            errors.push('Coins cannot be negative');
        }

        // Validate XP increment
        const xpIncrement = (data.xp || 0) - (previous.xp || 0);
        if (xpIncrement > 2000) {
            errors.push(`Invalid XP increment: ${xpIncrement} (max: 2000)`);
        }
        if (data.xp < 0) {
            errors.push('XP cannot be negative');
        }

        // Validate level increment
        const levelIncrement = (data.level || 1) - (previous.level || 1);
        if (levelIncrement > 1) {
            errors.push(`Invalid level increment: ${levelIncrement} (max: 1)`);
        }
        if (data.level < 1) {
            errors.push('Level must be at least 1');
        }

        // Validate streak
        if (data.currentStreak < 0 || data.currentStreak > 1000) {
            errors.push(`Invalid streak: ${data.currentStreak}`);
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Safe JSON parse with error handling
     * @param {string} jsonString - JSON string
     * @param {any} defaultValue - Default value if parse fails
     * @returns {any} Parsed object or default value
     */
    static safeJSONParse(jsonString, defaultValue = null) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.warn('[Sanitizer] JSON parse failed:', error.message);
            return defaultValue;
        }
    }

    /**
     * Sanitize object keys (prevent prototype pollution)
     * @param {Object} obj - Input object
     * @returns {Object} Sanitized object
     */
    static sanitizeObjectKeys(obj) {
        if (typeof obj !== 'object' || obj === null) return obj;

        const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
        const sanitized = {};

        for (const key in obj) {
            if (obj.hasOwnProperty(key) && !dangerousKeys.includes(key)) {
                sanitized[key] = obj[key];
            }
        }

        return sanitized;
    }

    /**
     * Rate limiting helper (client-side)
     * @param {string} action - Action identifier
     * @param {number} maxAttempts - Max attempts allowed
     * @param {number} windowMs - Time window in milliseconds
     * @returns {boolean} True if action is allowed
     */
    static checkRateLimit(action, maxAttempts = 10, windowMs = 60000) {
        const now = Date.now();
        const storageKey = `rateLimit_${action}`;

        try {
            // Get attempts from localStorage
            const data = localStorage.getItem(storageKey);
            let attempts = data ? JSON.parse(data) : [];

            // Remove old attempts outside time window
            attempts = attempts.filter(timestamp => now - timestamp < windowMs);

            // Check if limit exceeded
            if (attempts.length >= maxAttempts) {
                console.warn(`[Sanitizer] Rate limit exceeded for action: ${action}`);
                return false;
            }

            // Add current attempt
            attempts.push(now);

            // Save to localStorage
            localStorage.setItem(storageKey, JSON.stringify(attempts));

            return true;
        } catch (error) {
            console.error('[Sanitizer] Rate limit check failed:', error);
            return true; // Fail open to not break functionality
        }
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.InputSanitizer = InputSanitizer;
    console.log('[Sanitizer] 🔒 Security layer initialized');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputSanitizer;
}
