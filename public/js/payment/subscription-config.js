/**
 * Subscription Configuration
 * Defines subscription tiers, features, and pricing
 */

const SUBSCRIPTION_TIERS = {
    FREE: 'free',
    BASIC: 'basic',
    PRO: 'pro'
};

const TIER_CONFIG = {
    [SUBSCRIPTION_TIERS.FREE]: {
        name: 'Free',
        price: 0,
        priceId: null,
        features: {
            // Test Prep
            diagnosticTests: 1,
            practiceQuestions: 50,
            adaptiveLearning: false,

            // Essay Coach
            essayDrafts: 1,
            aiReviews: 3,
            essayTemplates: 'basic',

            // College Search
            collegeSearch: true,
            savedColleges: 5,
            detailedInsights: false,

            // Application Tracking
            applications: 3,
            deadlineReminders: false,
            documentManagement: false,

            // Scholarship Finder
            scholarshipSearch: true,
            savedScholarships: 3,
            matchScoring: false,

            // Casino/Gamification
            casinoEnabled: true,
            dailyWheelSpins: 1,
            leaderboardAccess: 'view',

            // Support
            supportLevel: 'community',
            prioritySupport: false,

            // Analytics
            basicAnalytics: true,
            advancedAnalytics: false,
            exportData: false
        },
        limits: {
            maxEssays: 1,
            maxApplications: 3,
            maxColleges: 5,
            maxScholarships: 3,
            aiReviewsPerMonth: 3,
            practiceQuestionsPerDay: 10
        }
    },

    [SUBSCRIPTION_TIERS.BASIC]: {
        name: 'Basic',
        price: 19.99,
        priceId: process.env.STRIPE_PRICE_ID_BASIC || 'price_basic_monthly',
        interval: 'month',
        features: {
            // Test Prep
            diagnosticTests: 10,
            practiceQuestions: 500,
            adaptiveLearning: true,

            // Essay Coach
            essayDrafts: 10,
            aiReviews: 50,
            essayTemplates: 'full',

            // College Search
            collegeSearch: true,
            savedColleges: 50,
            detailedInsights: true,

            // Application Tracking
            applications: 20,
            deadlineReminders: true,
            documentManagement: true,

            // Scholarship Finder
            scholarshipSearch: true,
            savedScholarships: 30,
            matchScoring: true,

            // Casino/Gamification
            casinoEnabled: true,
            dailyWheelSpins: 3,
            leaderboardAccess: 'full',

            // Support
            supportLevel: 'email',
            prioritySupport: false,

            // Analytics
            basicAnalytics: true,
            advancedAnalytics: true,
            exportData: false
        },
        limits: {
            maxEssays: 10,
            maxApplications: 20,
            maxColleges: 50,
            maxScholarships: 30,
            aiReviewsPerMonth: 50,
            practiceQuestionsPerDay: 100
        }
    },

    [SUBSCRIPTION_TIERS.PRO]: {
        name: 'Pro',
        price: 39.99,
        priceId: process.env.STRIPE_PRICE_ID_PRO || 'price_pro_monthly',
        interval: 'month',
        features: {
            // Test Prep
            diagnosticTests: 999999,
            practiceQuestions: 999999,
            adaptiveLearning: true,

            // Essay Coach
            essayDrafts: 999999,
            aiReviews: 999999,
            essayTemplates: 'full',

            // College Search
            collegeSearch: true,
            savedColleges: 999999,
            detailedInsights: true,

            // Application Tracking
            applications: 999999,
            deadlineReminders: true,
            documentManagement: true,

            // Scholarship Finder
            scholarshipSearch: true,
            savedScholarships: 999999,
            matchScoring: true,

            // Casino/Gamification
            casinoEnabled: true,
            dailyWheelSpins: 10,
            leaderboardAccess: 'full',

            // Support
            supportLevel: 'priority',
            prioritySupport: true,

            // Analytics
            basicAnalytics: true,
            advancedAnalytics: true,
            exportData: true
        },
        limits: {
            maxEssays: 999999,
            maxApplications: 999999,
            maxColleges: 999999,
            maxScholarships: 999999,
            aiReviewsPerMonth: 999999,
            practiceQuestionsPerDay: 999999
        }
    }
};

/**
 * Get tier configuration
 * @param {string} tier - Tier name
 * @returns {Object} Tier configuration
 */
function getTierConfig(tier) {
    return TIER_CONFIG[tier] || TIER_CONFIG[SUBSCRIPTION_TIERS.FREE];
}

/**
 * Check if user has access to a feature
 * @param {string} tier - User's subscription tier
 * @param {string} feature - Feature to check
 * @returns {boolean} Whether user has access
 */
function hasFeatureAccess(tier, feature) {
    const config = getTierConfig(tier);
    const featurePath = feature.split('.');

    let value = config.features;
    for (const path of featurePath) {
        if (value === undefined) return false;
        value = value[path];
    }

    return Boolean(value);
}

/**
 * Check if user is within usage limits
 * @param {string} tier - User's subscription tier
 * @param {string} limitType - Type of limit to check
 * @param {number} currentUsage - Current usage count
 * @returns {boolean} Whether user is within limits
 */
function isWithinLimit(tier, limitType, currentUsage) {
    const config = getTierConfig(tier);
    const limit = config.limits[limitType];

    if (limit === undefined || limit === 999999) return true;
    return currentUsage < limit;
}

/**
 * Get remaining quota for a feature
 * @param {string} tier - User's subscription tier
 * @param {string} limitType - Type of limit
 * @param {number} currentUsage - Current usage
 * @returns {number} Remaining quota
 */
function getRemainingQuota(tier, limitType, currentUsage) {
    const config = getTierConfig(tier);
    const limit = config.limits[limitType];

    if (limit === undefined || limit === 999999) return 999999;
    return Math.max(0, limit - currentUsage);
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SUBSCRIPTION_TIERS,
        TIER_CONFIG,
        getTierConfig,
        hasFeatureAccess,
        isWithinLimit,
        getRemainingQuota
    };
} else {
    window.SubscriptionConfig = {
        SUBSCRIPTION_TIERS,
        TIER_CONFIG,
        getTierConfig,
        hasFeatureAccess,
        isWithinLimit,
        getRemainingQuota
    };
}
