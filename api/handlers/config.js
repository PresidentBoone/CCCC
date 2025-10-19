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
    // DEBUG: Log all environment variables that start with NEXT_PUBLIC_
    console.log('DEBUG: Environment variables check:');
    console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET' : 'MISSING');
    console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'SET' : 'MISSING');
    console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'SET' : 'MISSING');

    // Check all environment variable keys
    const allEnvKeys = Object.keys(process.env).filter(key => key.includes('FIREBASE'));
    console.log('DEBUG: All Firebase-related env vars:', allEnvKeys);

    // Expose only public Firebase configuration
    // These are safe to expose as they're client-side Firebase config
    const config = {
      firebase: {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || null,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || null,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || null,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || null,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || null,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || null,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || null
      }
    };

    // Check if any config values are missing
    const missingKeys = Object.entries(config.firebase)
      .filter(([key, value]) => value === null)
      .map(([key]) => key);

    if (missingKeys.length > 0) {
      console.error('Missing Firebase configuration keys:', missingKeys);

      // Include debug info in error response
      return res.status(500).json({
        error: 'Configuration incomplete',
        message: 'Firebase environment variables not set',
        missing: missingKeys,
        debug: {
          allFirebaseEnvKeys: allEnvKeys,
          vercelEnv: process.env.VERCEL_ENV,
          nodeEnv: process.env.NODE_ENV
        }
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
