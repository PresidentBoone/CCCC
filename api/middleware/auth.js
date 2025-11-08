/**
 * API Authentication Middleware
 * Verifies Firebase Authentication tokens for API endpoints
 * Prevents unauthorized access to sensitive operations
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (singleton pattern)
let adminInitialized = false;

function initializeFirebaseAdmin() {
  if (adminInitialized) {
    return;
  }

  try {
    // Check if already initialized
    if (admin.apps.length === 0) {
      // Initialize with environment variables
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
      });
      console.log('✅ Firebase Admin SDK initialized');
    }
    adminInitialized = true;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    throw error;
  }
}

/**
 * Verify Firebase ID token from request headers
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} Decoded token with user info
 * @throws {Error} If token is invalid or missing
 */
async function verifyAuthToken(req) {
  // Initialize admin if not already done
  initializeFirebaseAdmin();

  // Extract token from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new Error('No authorization header provided');
  }

  // Expected format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new Error('Invalid authorization header format. Expected: Bearer <token>');
  }

  const token = parts[1];

  if (!token) {
    throw new Error('No token provided in authorization header');
  }

  try {
    // Verify the ID token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    throw new Error('Invalid or expired authentication token');
  }
}

/**
 * Express middleware to require authentication
 * Attaches decoded user info to req.user
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
async function requireAuth(req, res, next) {
  try {
    const decodedToken = await verifyAuthToken(req);

    // Attach user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };

    // Continue to next middleware/handler
    next();
  } catch (error) {
    console.error('Authentication failed:', error.message);

    return res.status(401).json({
      error: 'Unauthorized',
      message: error.message,
      hint: 'Please log in and try again',
    });
  }
}

/**
 * Verify that authenticated user matches the requested userId
 * Prevents users from accessing other users' data
 * @param {Object} req - Express request
 * @param {string} userIdParam - Name of the parameter/query containing userId
 * @returns {boolean} True if user matches
 * @throws {Error} If user doesn't match
 */
function verifyUserOwnership(req, userIdParam = 'userId') {
  const requestedUserId = req.query[userIdParam] || req.body[userIdParam] || req.params[userIdParam];
  const authenticatedUserId = req.user?.uid;

  if (!requestedUserId) {
    throw new Error(`${userIdParam} parameter is required`);
  }

  if (requestedUserId !== authenticatedUserId) {
    throw new Error('You can only access your own data');
  }

  return true;
}

/**
 * Middleware to require user ownership
 * Use after requireAuth middleware
 */
function requireOwnership(userIdParam = 'userId') {
  return (req, res, next) => {
    try {
      verifyUserOwnership(req, userIdParam);
      next();
    } catch (error) {
      return res.status(403).json({
        error: 'Forbidden',
        message: error.message,
      });
    }
  };
}

/**
 * Get user's subscription data from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User subscription data
 */
async function getUserSubscription(userId) {
  initializeFirebaseAdmin();

  try {
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      return { tier: 'free', status: 'none' };
    }

    const userData = userDoc.data();
    return userData.subscription || { tier: 'free', status: 'none' };
  } catch (error) {
    console.error('Failed to get user subscription:', error.message);
    return { tier: 'free', status: 'none' };
  }
}

/**
 * Middleware to require specific subscription tier
 * Use after requireAuth middleware
 * @param {string} requiredTier - Required tier ('basic' or 'pro')
 */
function requireTier(requiredTier) {
  const tierHierarchy = {
    free: ['free'],
    basic: ['free', 'basic'],
    pro: ['free', 'basic', 'pro'],
  };

  return async (req, res, next) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      const subscription = await getUserSubscription(userId);
      const userTier = subscription.tier || 'free';

      // Check if user's tier grants access to required tier
      const allowedTiers = tierHierarchy[requiredTier] || [];
      if (!allowedTiers.includes(userTier)) {
        return res.status(403).json({
          error: 'Upgrade Required',
          message: `This feature requires ${requiredTier} tier or higher`,
          currentTier: userTier,
          requiredTier: requiredTier,
          upgradeUrl: '/pricing.html',
        });
      }

      // Attach subscription to request for later use
      req.subscription = subscription;
      next();
    } catch (error) {
      console.error('Tier verification failed:', error.message);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to verify subscription tier',
      });
    }
  };
}

module.exports = {
  verifyAuthToken,
  requireAuth,
  requireOwnership,
  requireTier,
  verifyUserOwnership,
  getUserSubscription,
  initializeFirebaseAdmin,
};
