/**
 * Environment Variable Validation
 * Ensures all required environment variables are configured before startup
 * Fails fast to prevent runtime errors in production
 */

const REQUIRED_ENV_VARS = {
  // Firebase Configuration
  FIREBASE_API_KEY: 'Firebase API key for authentication and database',
  FIREBASE_AUTH_DOMAIN: 'Firebase auth domain',
  FIREBASE_PROJECT_ID: 'Firebase project ID',
  FIREBASE_STORAGE_BUCKET: 'Firebase storage bucket name',
  FIREBASE_MESSAGING_SENDER_ID: 'Firebase messaging sender ID',
  FIREBASE_APP_ID: 'Firebase application ID',

  // External API Keys
  OPENAI_API_KEY: 'OpenAI API key for AI chat and essay analysis',
  COLLEGE_SCORECARD_API_KEY: 'College Scorecard API key for college search',
  SENDGRID_API_KEY: 'SendGrid API key for email notifications',

  // Stripe Payment Configuration
  STRIPE_SECRET_KEY: 'Stripe secret key for payment processing',
  STRIPE_WEBHOOK_SECRET: 'Stripe webhook signing secret for security',
};

const OPTIONAL_ENV_VARS = {
  FIREBASE_MEASUREMENT_ID: 'Firebase analytics measurement ID (optional)',
  NODE_ENV: 'Environment mode (development/production)',
};

/**
 * Validate environment variables
 * @param {boolean} strict - If true, throws error on missing vars. If false, logs warnings.
 * @returns {Object} Validation result
 */
function validateEnv(strict = true) {
  const missing = [];
  const present = [];
  const optional = [];

  // Check required variables
  for (const [key, description] of Object.entries(REQUIRED_ENV_VARS)) {
    if (!process.env[key] || process.env[key].trim() === '') {
      missing.push({ key, description });
    } else {
      present.push(key);
    }
  }

  // Check optional variables
  for (const [key, description] of Object.entries(OPTIONAL_ENV_VARS)) {
    if (!process.env[key] || process.env[key].trim() === '') {
      optional.push({ key, description });
    }
  }

  // Generate report
  const report = {
    valid: missing.length === 0,
    missing,
    present,
    optional,
    total: Object.keys(REQUIRED_ENV_VARS).length,
  };

  // Log results
  if (report.valid) {
    console.log('✅ Environment validation passed');
    console.log(`   ${present.length}/${report.total} required variables configured`);
    if (optional.length > 0) {
      console.log(`   ${optional.length} optional variables not set (OK)`);
    }
  } else {
    console.error('❌ Environment validation failed');
    console.error(`   ${missing.length}/${report.total} required variables are missing:\n`);
    missing.forEach(({ key, description }) => {
      console.error(`   • ${key}`);
      console.error(`     ${description}\n`);
    });

    if (strict) {
      throw new Error(
        `Missing required environment variables: ${missing.map(m => m.key).join(', ')}\n\n` +
        'Please configure these variables in your .env file or hosting platform (Vercel).\n' +
        'See .env.example for a template.'
      );
    }
  }

  return report;
}

/**
 * Validate specific environment variable
 * @param {string} key - Environment variable name
 * @returns {string} Value if present
 * @throws {Error} If missing
 */
function requireEnv(key) {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(
      `Required environment variable "${key}" is not configured.\n` +
      `Please set this in your .env file or hosting platform.`
    );
  }
  return value;
}

/**
 * Get environment variable with default fallback
 * @param {string} key - Environment variable name
 * @param {string} defaultValue - Default value if not set
 * @returns {string} Value or default
 */
function getEnv(key, defaultValue = '') {
  return process.env[key] || defaultValue;
}

/**
 * Check if running in production
 * @returns {boolean}
 */
function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 * @returns {boolean}
 */
function isDevelopment() {
  return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
}

// Auto-validate on module load in production
if (isProduction()) {
  console.log('\n🔍 Validating production environment...');
  validateEnv(true); // Strict mode in production
  console.log('');
}

module.exports = {
  validateEnv,
  requireEnv,
  getEnv,
  isProduction,
  isDevelopment,
  REQUIRED_ENV_VARS,
  OPTIONAL_ENV_VARS,
};
