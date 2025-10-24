/**
 * Casino Module - Validation Utilities
 *
 * Input validation and security checks for casino operations.
 * Prevents invalid data from entering the system.
 *
 * @module casino/utils/validators
 * @author CollegeClimb Casino Team
 * @version 1.0.0
 */

/**
 * Validate coin amount (anti-cheat)
 *
 * @param {number} coins - Coin amount to validate
 * @param {number} previousCoins - Previous coin amount
 * @param {number} maxIncrement - Maximum allowed increment (default 5000)
 * @returns {Object} Validation result {valid: boolean, error: string}
 *
 * @example
 * validateCoins(150, 100, 5000); // → {valid: true}
 * validateCoins(6000, 100, 5000); // → {valid: false, error: '...'}
 */
function validateCoins(coins, previousCoins = 0, maxIncrement = 5000) {
  if (typeof coins !== 'number' || isNaN(coins)) {
    return {
      valid: false,
      error: 'Coins must be a number'
    };
  }

  if (coins < 0) {
    return {
      valid: false,
      error: 'Coins cannot be negative'
    };
  }

  const increment = coins - previousCoins;
  if (increment > maxIncrement) {
    return {
      valid: false,
      error: `Coin increment (${increment}) exceeds maximum allowed (${maxIncrement})`
    };
  }

  return { valid: true };
}

/**
 * Validate XP amount (anti-cheat)
 *
 * @param {number} xp - XP amount to validate
 * @param {number} previousXP - Previous XP amount
 * @param {number} maxIncrement - Maximum allowed increment (default 2000)
 * @returns {Object} Validation result
 */
function validateXP(xp, previousXP = 0, maxIncrement = 2000) {
  if (typeof xp !== 'number' || isNaN(xp)) {
    return {
      valid: false,
      error: 'XP must be a number'
    };
  }

  if (xp < 0) {
    return {
      valid: false,
      error: 'XP cannot be negative'
    };
  }

  const increment = xp - previousXP;
  if (increment > maxIncrement) {
    return {
      valid: false,
      error: `XP increment (${increment}) exceeds maximum allowed (${maxIncrement})`
    };
  }

  // XP should never decrease
  if (increment < 0) {
    return {
      valid: false,
      error: 'XP cannot decrease'
    };
  }

  return { valid: true };
}

/**
 * Validate level change (anti-cheat)
 *
 * @param {number} newLevel - New level
 * @param {number} oldLevel - Old level
 * @returns {Object} Validation result
 */
function validateLevel(newLevel, oldLevel) {
  if (typeof newLevel !== 'number' || isNaN(newLevel)) {
    return {
      valid: false,
      error: 'Level must be a number'
    };
  }

  if (newLevel < 1) {
    return {
      valid: false,
      error: 'Level must be at least 1'
    };
  }

  // Level can only increase by 1 at a time
  if (newLevel > oldLevel + 1) {
    return {
      valid: false,
      error: `Level jump too large (${oldLevel} → ${newLevel})`
    };
  }

  // Level should not decrease
  if (newLevel < oldLevel) {
    return {
      valid: false,
      error: 'Level cannot decrease'
    };
  }

  return { valid: true };
}

/**
 * Validate streak (must be non-negative integer)
 *
 * @param {number} streak - Streak count
 * @returns {Object} Validation result
 */
function validateStreak(streak) {
  if (typeof streak !== 'number' || isNaN(streak)) {
    return {
      valid: false,
      error: 'Streak must be a number'
    };
  }

  if (streak < 0) {
    return {
      valid: false,
      error: 'Streak cannot be negative'
    };
  }

  if (!Number.isInteger(streak)) {
    return {
      valid: false,
      error: 'Streak must be an integer'
    };
  }

  // Sanity check - streaks > 1000 are suspicious
  if (streak > 1000) {
    return {
      valid: false,
      error: 'Streak suspiciously high'
    };
  }

  return { valid: true };
}

/**
 * Validate timestamp (must be recent)
 *
 * @param {Date|string|number} timestamp - Timestamp to validate
 * @param {number} maxAgeMinutes - Maximum age in minutes (default 5)
 * @returns {Object} Validation result
 */
function validateTimestamp(timestamp, maxAgeMinutes = 5) {
  const date = new Date(timestamp);

  if (isNaN(date.getTime())) {
    return {
      valid: false,
      error: 'Invalid timestamp'
    };
  }

  const now = new Date();
  const diffMs = now - date;
  const diffMin = diffMs / 60000;

  if (diffMin > maxAgeMinutes) {
    return {
      valid: false,
      error: `Timestamp too old (${diffMin.toFixed(1)} minutes)`
    };
  }

  // Timestamp cannot be in the future (with 1 min tolerance for clock skew)
  if (diffMin < -1) {
    return {
      valid: false,
      error: 'Timestamp is in the future'
    };
  }

  return { valid: true };
}

/**
 * Validate user ID (Firebase UID format)
 *
 * @param {string} userId - User ID to validate
 * @returns {Object} Validation result
 */
function validateUserId(userId) {
  if (typeof userId !== 'string') {
    return {
      valid: false,
      error: 'User ID must be a string'
    };
  }

  if (userId.length === 0) {
    return {
      valid: false,
      error: 'User ID cannot be empty'
    };
  }

  // Firebase UIDs are typically 28 characters
  if (userId.length > 128) {
    return {
      valid: false,
      error: 'User ID too long'
    };
  }

  return { valid: true };
}

/**
 * Validate answer time (detect bot behavior)
 *
 * @param {number} timeSpentSeconds - Time spent on question
 * @param {number} minTime - Minimum reasonable time (default 2)
 * @param {number} maxTime - Maximum reasonable time (default 600)
 * @returns {Object} Validation result with suspicion flag
 */
function validateAnswerTime(timeSpentSeconds, minTime = 2, maxTime = 600) {
  if (typeof timeSpentSeconds !== 'number' || isNaN(timeSpentSeconds)) {
    return {
      valid: false,
      error: 'Answer time must be a number'
    };
  }

  if (timeSpentSeconds < 0) {
    return {
      valid: false,
      error: 'Answer time cannot be negative'
    };
  }

  // Flag suspiciously fast answers (possible bot)
  if (timeSpentSeconds < minTime) {
    return {
      valid: true,
      suspicious: true,
      warning: `Answer time (${timeSpentSeconds}s) is suspiciously fast`
    };
  }

  // Flag suspiciously slow answers (possible cheating/looking up)
  if (timeSpentSeconds > maxTime) {
    return {
      valid: true,
      suspicious: true,
      warning: `Answer time (${timeSpentSeconds}s) is suspiciously slow`
    };
  }

  return { valid: true, suspicious: false };
}

/**
 * Validate question data object
 *
 * @param {Object} questionData - Question data to validate
 * @returns {Object} Validation result
 */
function validateQuestionData(questionData) {
  if (!questionData || typeof questionData !== 'object') {
    return {
      valid: false,
      error: 'Question data must be an object'
    };
  }

  const required = ['questionId', 'difficulty', 'timeSpent'];
  const missing = required.filter(field => !(field in questionData));

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missing.join(', ')}`
    };
  }

  // Validate difficulty
  const validDifficulties = ['easy', 'medium', 'hard', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  if (!validDifficulties.includes(questionData.difficulty)) {
    return {
      valid: false,
      error: 'Invalid difficulty value'
    };
  }

  // Validate time spent
  const timeValidation = validateAnswerTime(questionData.timeSpent);
  if (!timeValidation.valid) {
    return timeValidation;
  }

  return { valid: true, suspicious: timeValidation.suspicious };
}

/**
 * Validate reward claim
 *
 * @param {Object} rewardData - Reward data to validate
 * @param {Object} rewardConfig - Reward configuration
 * @returns {Object} Validation result
 */
function validateRewardClaim(rewardData, rewardConfig) {
  if (!rewardData || typeof rewardData !== 'object') {
    return {
      valid: false,
      error: 'Reward data must be an object'
    };
  }

  const { rarity, rewardType, amount } = rewardData;

  // Validate rarity exists in config
  if (!rewardConfig.mysteryRewards[rarity]) {
    return {
      valid: false,
      error: `Invalid rarity: ${rarity}`
    };
  }

  // Validate reward type
  const validTypes = ['coins', 'xp', 'item', 'badge', 'avatar', 'theme'];
  if (!validTypes.includes(rewardType)) {
    return {
      valid: false,
      error: `Invalid reward type: ${rewardType}`
    };
  }

  // Validate amount (if applicable)
  if (['coins', 'xp'].includes(rewardType)) {
    const rarityConfig = rewardConfig.mysteryRewards[rarity];
    const rewardOptions = rarityConfig.rewards.filter(r => r.type === rewardType);

    if (rewardOptions.length === 0) {
      return {
        valid: false,
        error: `Reward type ${rewardType} not available for rarity ${rarity}`
      };
    }

    // Check if amount is within valid range for rarity
    const minAmount = Math.min(...rewardOptions.map(r => r.min || r.amount));
    const maxAmount = Math.max(...rewardOptions.map(r => r.max || r.amount));

    if (amount < minAmount || amount > maxAmount) {
      return {
        valid: false,
        error: `Amount ${amount} out of range for ${rarity} ${rewardType} (${minAmount}-${maxAmount})`
      };
    }
  }

  return { valid: true };
}

/**
 * Sanitize display name (prevent XSS and profanity)
 *
 * @param {string} displayName - Display name to sanitize
 * @param {number} maxLength - Maximum length (default 20)
 * @returns {string} Sanitized display name
 */
function sanitizeDisplayName(displayName, maxLength = 20) {
  if (typeof displayName !== 'string') {
    return 'Anonymous';
  }

  // Remove HTML tags
  let sanitized = displayName.replace(/<[^>]*>/g, '');

  // Remove special characters (keep letters, numbers, spaces, dash, underscore)
  sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-_]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Return "Anonymous" if empty after sanitization
  if (sanitized.length === 0) {
    return 'Anonymous';
  }

  return sanitized;
}

/**
 * Validate purchase (shop item)
 *
 * @param {Object} purchaseData - Purchase data
 * @param {number} userCoins - User's current coins
 * @param {Object} shopItem - Shop item configuration
 * @returns {Object} Validation result
 */
function validatePurchase(purchaseData, userCoins, shopItem) {
  if (!shopItem) {
    return {
      valid: false,
      error: 'Shop item not found'
    };
  }

  if (!shopItem.available) {
    return {
      valid: false,
      error: 'Item not available for purchase'
    };
  }

  if (userCoins < shopItem.costCoins) {
    return {
      valid: false,
      error: `Insufficient coins (have ${userCoins}, need ${shopItem.costCoins})`
    };
  }

  return { valid: true };
}

// Export all functions
if (typeof window !== 'undefined') {
  window.CasinoValidators = {
    validateCoins,
    validateXP,
    validateLevel,
    validateStreak,
    validateTimestamp,
    validateUserId,
    validateAnswerTime,
    validateQuestionData,
    validateRewardClaim,
    sanitizeDisplayName,
    validatePurchase
  };
}

// Node.js export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateCoins,
    validateXP,
    validateLevel,
    validateStreak,
    validateTimestamp,
    validateUserId,
    validateAnswerTime,
    validateQuestionData,
    validateRewardClaim,
    sanitizeDisplayName,
    validatePurchase
  };
}
