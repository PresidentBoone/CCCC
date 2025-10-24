/**
 * Casino Module - Formatting Utilities
 *
 * Functions for formatting numbers, currency, dates, and text
 * for consistent display throughout the casino UI.
 *
 * @module casino/utils/formatters
 * @author CollegeClimb Casino Team
 * @version 1.0.0
 */

/**
 * Format number with thousands separators
 *
 * @param {number} num - Number to format
 * @param {number} decimals - Decimal places (default 0)
 * @returns {string} Formatted number
 *
 * @example
 * formatNumber(1250); // → '1,250'
 * formatNumber(1234567.89, 2); // → '1,234,567.89'
 */
function formatNumber(num, decimals = 0) {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format coins with emoji and thousands separators
 *
 * @param {number} coins - Coin amount
 * @param {boolean} includeEmoji - Include 💰 emoji (default true)
 * @returns {string} Formatted coin string
 *
 * @example
 * formatCoins(1250); // → '💰 1,250'
 * formatCoins(1250, false); // → '1,250'
 */
function formatCoins(coins, includeEmoji = true) {
  const formatted = formatNumber(coins);
  return includeEmoji ? `💰 ${formatted}` : formatted;
}

/**
 * Format XP with progress to next level
 *
 * @param {number} currentXP - Current XP
 * @param {number} xpToNext - XP needed for next level
 * @returns {string} Formatted XP string
 *
 * @example
 * formatXP(3420, 4500); // → '3,420 / 4,500 XP'
 */
function formatXP(currentXP, xpToNext) {
  return `${formatNumber(currentXP)} / ${formatNumber(xpToNext)} XP`;
}

/**
 * Format level with "Lv" prefix
 *
 * @param {number} level - Level number
 * @returns {string} Formatted level
 *
 * @example
 * formatLevel(12); // → 'Lv 12'
 */
function formatLevel(level) {
  return `Lv ${level}`;
}

/**
 * Format multiplier with 'x' suffix
 *
 * @param {number} multiplier - Multiplier value
 * @param {number} decimals - Decimal places (default 1)
 * @returns {string} Formatted multiplier
 *
 * @example
 * formatMultiplier(2.5); // → '2.5x'
 * formatMultiplier(10); // → '10.0x'
 */
function formatMultiplier(multiplier, decimals = 1) {
  return `${multiplier.toFixed(decimals)}x`;
}

/**
 * Format percentage
 *
 * @param {number} value - Value (0-100)
 * @param {number} decimals - Decimal places (default 1)
 * @returns {string} Formatted percentage
 *
 * @example
 * formatPercentage(85.234); // → '85.2%'
 * formatPercentage(100, 0); // → '100%'
 */
function formatPercentage(value, decimals = 1) {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format tier name with proper capitalization
 *
 * @param {string} tier - Tier name (bronze, silver, gold, etc.)
 * @returns {string} Formatted tier name
 *
 * @example
 * formatTier('silver'); // → 'Silver'
 * formatTier('diamond'); // → 'Diamond'
 */
function formatTier(tier) {
  if (!tier) return 'Bronze';
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

/**
 * Get tier emoji based on tier name
 *
 * @param {string} tier - Tier name
 * @returns {string} Emoji for tier
 */
function getTierEmoji(tier) {
  const emojiMap = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
    diamond: '💠',
    legend: '👑'
  };
  return emojiMap[tier?.toLowerCase()] || '🥉';
}

/**
 * Format tier with emoji
 *
 * @param {string} tier - Tier name
 * @returns {string} Formatted tier with emoji
 *
 * @example
 * formatTierWithEmoji('silver'); // → '🥈 Silver'
 */
function formatTierWithEmoji(tier) {
  return `${getTierEmoji(tier)} ${formatTier(tier)}`;
}

/**
 * Format streak count with fire emojis
 *
 * @param {number} streak - Streak count
 * @returns {string} Formatted streak
 *
 * @example
 * formatStreak(3); // → '🔥 3'
 * formatStreak(10); // → '🔥🔥🔥 10'
 */
function formatStreak(streak) {
  if (streak === 0) return '0';

  let fireEmojis = '🔥';
  if (streak >= 20) fireEmojis = '🔥🔥🔥🔥🔥';
  else if (streak >= 15) fireEmojis = '🔥🔥🔥🔥';
  else if (streak >= 10) fireEmojis = '🔥🔥🔥';
  else if (streak >= 5) fireEmojis = '🔥🔥';

  return `${fireEmojis} ${streak}`;
}

/**
 * Format time duration (seconds to human readable)
 *
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 *
 * @example
 * formatDuration(90); // → '1m 30s'
 * formatDuration(3665); // → '1h 1m 5s'
 */
function formatDuration(seconds) {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }

  return `${minutes}m ${secs}s`;
}

/**
 * Format date as relative time (e.g., "2 hours ago")
 *
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string
 *
 * @example
 * formatRelativeTime(new Date(Date.now() - 7200000)); // → '2 hours ago'
 */
function formatRelativeTime(date) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  } else {
    return past.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: past.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}

/**
 * Format date as ISO date only (no time)
 *
 * @param {Date} date - Date to format
 * @returns {string} ISO date string (YYYY-MM-DD)
 *
 * @example
 * formatISODate(new Date('2025-10-24T15:30:00Z')); // → '2025-10-24'
 */
function formatISODate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Abbreviate large numbers (1.2k, 3.5M, etc.)
 *
 * @param {number} num - Number to abbreviate
 * @param {number} decimals - Decimal places (default 1)
 * @returns {string} Abbreviated number
 *
 * @example
 * abbreviateNumber(1250); // → '1.3k'
 * abbreviateNumber(1500000); // → '1.5M'
 */
function abbreviateNumber(num, decimals = 1) {
  if (num < 1000) {
    return num.toString();
  }

  const units = ['k', 'M', 'B', 'T'];
  const order = Math.floor(Math.log10(num) / 3);
  const unitName = units[order - 1];
  const value = num / Math.pow(1000, order);

  return `${value.toFixed(decimals)}${unitName}`;
}

/**
 * Pluralize word based on count
 *
 * @param {number} count - Count
 * @param {string} singular - Singular form
 * @param {string} plural - Plural form (optional, adds 's' if not provided)
 * @returns {string} Pluralized word
 *
 * @example
 * pluralize(1, 'coin'); // → 'coin'
 * pluralize(5, 'coin'); // → 'coins'
 * pluralize(1, 'quiz', 'quizzes'); // → 'quiz'
 */
function pluralize(count, singular, plural = null) {
  if (count === 1) {
    return singular;
  }
  return plural || `${singular}s`;
}

/**
 * Format count with word (e.g., "5 coins")
 *
 * @param {number} count - Count
 * @param {string} singular - Singular word
 * @param {string} plural - Plural word (optional)
 * @returns {string} Formatted count with word
 *
 * @example
 * formatCount(1, 'coin'); // → '1 coin'
 * formatCount(5, 'coin'); // → '5 coins'
 */
function formatCount(count, singular, plural = null) {
  return `${formatNumber(count)} ${pluralize(count, singular, plural)}`;
}

/**
 * Truncate text to maximum length with ellipsis
 *
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 *
 * @example
 * truncate('This is a long text', 10); // → 'This is a...'
 */
function truncate(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format rarity with color code
 *
 * @param {string} rarity - Rarity level
 * @returns {Object} Rarity info with label and color
 *
 * @example
 * formatRarity('rare');
 * // → { label: 'RARE', color: '#9333EA', emoji: '💎' }
 */
function formatRarity(rarity) {
  const rarityMap = {
    common: {
      label: 'COMMON',
      color: '#6B7280',
      emoji: '⚪'
    },
    uncommon: {
      label: 'UNCOMMON',
      color: '#10B981',
      emoji: '🟢'
    },
    rare: {
      label: 'RARE',
      color: '#3B82F6',
      emoji: '🔵'
    },
    epic: {
      label: 'EPIC',
      color: '#9333EA',
      emoji: '🟣'
    },
    legendary: {
      label: 'LEGENDARY',
      color: '#F59E0B',
      emoji: '🟡'
    }
  };

  return rarityMap[rarity] || rarityMap.common;
}

/**
 * Format leaderboard rank with medal emoji
 *
 * @param {number} rank - Rank position (1-based)
 * @returns {string} Formatted rank
 *
 * @example
 * formatRank(1); // → '🥇 1'
 * formatRank(4); // → '#4'
 */
function formatRank(rank) {
  if (rank === 1) return '🥇 1';
  if (rank === 2) return '🥈 2';
  if (rank === 3) return '🥉 3';
  return `#${rank}`;
}

/**
 * Format delta (change) with +/- sign and color
 *
 * @param {number} delta - Change amount
 * @param {boolean} includeSign - Include + for positive (default true)
 * @returns {string} Formatted delta
 *
 * @example
 * formatDelta(50); // → '+50'
 * formatDelta(-25); // → '-25'
 */
function formatDelta(delta, includeSign = true) {
  if (delta > 0 && includeSign) {
    return `+${formatNumber(delta)}`;
  }
  return formatNumber(delta);
}

// Export all functions
if (typeof window !== 'undefined') {
  window.CasinoFormatters = {
    formatNumber,
    formatCoins,
    formatXP,
    formatLevel,
    formatMultiplier,
    formatPercentage,
    formatTier,
    getTierEmoji,
    formatTierWithEmoji,
    formatStreak,
    formatDuration,
    formatRelativeTime,
    formatISODate,
    abbreviateNumber,
    pluralize,
    formatCount,
    truncate,
    formatRarity,
    formatRank,
    formatDelta
  };
}

// Node.js export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatNumber,
    formatCoins,
    formatXP,
    formatLevel,
    formatMultiplier,
    formatPercentage,
    formatTier,
    getTierEmoji,
    formatTierWithEmoji,
    formatStreak,
    formatDuration,
    formatRelativeTime,
    formatISODate,
    abbreviateNumber,
    pluralize,
    formatCount,
    truncate,
    formatRarity,
    formatRank,
    formatDelta
  };
}
