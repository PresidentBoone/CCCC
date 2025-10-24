/**
 * Casino Module - Utility Helper Functions
 *
 * Common utility functions used throughout the casino module.
 * Pure functions with no side effects.
 *
 * @module casino/utils/helpers
 * @author CollegeClimb Casino Team
 * @version 1.0.0
 */

/**
 * Generate deterministic hash from string
 * Used for seeding "random" rewards tied to user actions
 *
 * @param {string} str - Input string to hash
 * @returns {number} Hash value (32-bit integer)
 *
 * @example
 * const hash = hashString('user123-q456-1729800000');
 * // → 1234567890 (deterministic)
 */
function hashString(str) {
  let hash = 0;
  if (str.length === 0) return hash;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return hash;
}

/**
 * Normalize hash to 0-1 range for probability calculations
 *
 * @param {number} hash - Hash value from hashString()
 * @returns {number} Normalized value between 0 and 1
 *
 * @example
 * const seed = normalizeHash(hashString('user123-q456'));
 * // → 0.6273... (deterministic, always same for same input)
 */
function normalizeHash(hash) {
  return Math.abs(hash) / 2147483647; // 2^31 - 1
}

/**
 * Deep clone object (handles nested objects and arrays)
 *
 * @param {Object} obj - Object to clone
 * @returns {Object} Deep copy of object
 *
 * @example
 * const original = { coins: 100, progress: { xp: 50 } };
 * const copy = deepClone(original);
 * copy.progress.xp = 75;
 * // original.progress.xp still equals 50
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }

  if (obj instanceof Object) {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * Get nested object value using dot notation
 *
 * @param {Object} obj - Object to traverse
 * @param {string} path - Dot-notation path (e.g., 'progress.xp')
 * @param {*} defaultValue - Value to return if path not found
 * @returns {*} Value at path or defaultValue
 *
 * @example
 * const data = { progress: { xp: 100 } };
 * getNestedValue(data, 'progress.xp'); // → 100
 * getNestedValue(data, 'progress.level', 1); // → 1 (default)
 */
function getNestedValue(obj, path, defaultValue = undefined) {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined || !current.hasOwnProperty(key)) {
      return defaultValue;
    }
    current = current[key];
  }

  return current;
}

/**
 * Set nested object value using dot notation
 * Mutates the original object
 *
 * @param {Object} obj - Object to modify
 * @param {string} path - Dot-notation path
 * @param {*} value - Value to set
 * @returns {Object} Modified object (same reference)
 *
 * @example
 * const data = { progress: {} };
 * setNestedValue(data, 'progress.xp', 100);
 * // data.progress.xp === 100
 */
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  let current = obj;

  for (const key of keys) {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
  return obj;
}

/**
 * Debounce function - limits how often a function can fire
 * Useful for Firebase writes and resize events
 *
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 *
 * @example
 * const saveToFirebase = debounce(async (data) => {
 *   await firestore.save(data);
 * }, 2000);
 *
 * saveToFirebase({ coins: 100 }); // waits 2 seconds
 * saveToFirebase({ coins: 150 }); // cancels previous, waits 2 seconds
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function - limits function execution to once per interval
 * Useful for scroll and mousemove events
 *
 * @param {Function} func - Function to throttle
 * @param {number} limit - Milliseconds between executions
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Sleep/delay function (async)
 *
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Resolves after ms milliseconds
 *
 * @example
 * await sleep(1000); // wait 1 second
 * console.log('1 second later');
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Clamp value between min and max
 *
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 *
 * @example
 * clamp(150, 0, 100); // → 100
 * clamp(-10, 0, 100); // → 0
 * clamp(50, 0, 100); // → 50
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 *
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 *
 * @example
 * lerp(0, 100, 0.5); // → 50
 * lerp(0, 100, 0.25); // → 25
 */
function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * Ease-out cubic easing function
 * Good for animation deceleration
 *
 * @param {number} t - Progress (0-1)
 * @returns {number} Eased value (0-1)
 */
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Ease-in-out cubic easing function
 * Smooth acceleration and deceleration
 *
 * @param {number} t - Progress (0-1)
 * @returns {number} Eased value (0-1)
 */
function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Generate unique ID (client-side)
 * Uses timestamp + random for uniqueness
 *
 * @param {string} prefix - Optional prefix
 * @returns {string} Unique ID
 *
 * @example
 * generateId('evt'); // → 'evt_1729800000_a1b2c3'
 */
function generateId(prefix = 'id') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Check if value is a plain object (not array, date, etc.)
 *
 * @param {*} value - Value to check
 * @returns {boolean} True if plain object
 */
function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * Merge two objects deeply
 * Second object overwrites first
 *
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object (new object)
 */
function deepMerge(target, source) {
  const result = deepClone(target);

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (isPlainObject(source[key]) && isPlainObject(result[key])) {
        result[key] = deepMerge(result[key], source[key]);
      } else {
        result[key] = deepClone(source[key]);
      }
    }
  }

  return result;
}

/**
 * Get ISO week number for date
 * Used for weekly leaderboard calculations
 *
 * @param {Date} date - Date object
 * @returns {number} ISO week number (1-53)
 *
 * @example
 * getISOWeekNumber(new Date('2025-10-24')); // → 43
 */
function getISOWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNumber;
}

/**
 * Check if two dates are same day (ignoring time)
 *
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if same day
 */
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Calculate percentage (with safety checks)
 *
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @param {number} decimals - Decimal places (default 1)
 * @returns {number} Percentage (0-100)
 *
 * @example
 * calculatePercentage(85, 100); // → 85.0
 * calculatePercentage(1, 3, 2); // → 33.33
 */
function calculatePercentage(value, total, decimals = 1) {
  if (total === 0) return 0;
  const percentage = (value / total) * 100;
  return parseFloat(percentage.toFixed(decimals));
}

// Export all functions
if (typeof window !== 'undefined') {
  window.CasinoHelpers = {
    hashString,
    normalizeHash,
    deepClone,
    getNestedValue,
    setNestedValue,
    debounce,
    throttle,
    sleep,
    clamp,
    lerp,
    easeOutCubic,
    easeInOutCubic,
    generateId,
    isPlainObject,
    deepMerge,
    getISOWeekNumber,
    isSameDay,
    calculatePercentage
  };
}

// Node.js export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    hashString,
    normalizeHash,
    deepClone,
    getNestedValue,
    setNestedValue,
    debounce,
    throttle,
    sleep,
    clamp,
    lerp,
    easeOutCubic,
    easeInOutCubic,
    generateId,
    isPlainObject,
    deepMerge,
    getISOWeekNumber,
    isSameDay,
    calculatePercentage
  };
}
