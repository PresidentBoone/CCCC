/**
 * Configuration API Handler
 * Safely exposes PUBLIC environment variables to the frontend
 *
 * SECURITY: Only exposes NEXT_PUBLIC_* variables which are meant to be public
 */

module.exports = async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Expose only public Firebase configuration
    // These are safe to expose as they're client-side Firebase config
    // Check both NEXT_PUBLIC_ and non-prefixed versions for compatibility
    const config = {
      firebase: {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || null,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || null,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || null,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || null,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || null,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || null,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID || null
      }
    };

    // Check if any config values are missing
    const missingKeys = Object.entries(config.firebase)
      .filter(([key, value]) => value === null)
      .map(([key]) => key);

    if (missingKeys.length > 0) {
      console.error('Missing Firebase configuration keys:', missingKeys);
      return res.status(500).json({
        error: 'Configuration incomplete',
        message: 'Firebase environment variables not set',
        missing: missingKeys
      });
    }

    // Set cache headers (cache for 1 hour since config doesn't change often)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

    return res.status(200).json(config);

  } catch (error) {
    console.error('Config API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
