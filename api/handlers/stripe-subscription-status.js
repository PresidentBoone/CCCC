/**
 * Stripe Subscription Status Handler
 * Returns current subscription status for a user
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
}

const db = admin.firestore();

module.exports = async (req, res) => {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId } = req.query;

        // Validate userId
        if (!userId) {
            return res.status(400).json({
                error: 'Missing required parameter: userId'
            });
        }

        // Fetch user document from Firestore
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            // Return free tier for new users
            return res.status(200).json({
                tier: 'free',
                status: 'active',
                currentPeriodEnd: null,
                cancelAtPeriodEnd: false
            });
        }

        const userData = userDoc.data();
        const subscription = userData.subscription || {};

        // Return subscription data
        res.status(200).json({
            tier: subscription.tier || 'free',
            status: subscription.status || 'active',
            currentPeriodEnd: subscription.currentPeriodEnd ?
                subscription.currentPeriodEnd.toDate().toISOString() : null,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false,
            customerId: subscription.customerId || null
        });

    } catch (error) {
        console.error('Subscription status error:', error);
        res.status(500).json({
            error: error.message || 'Failed to fetch subscription status'
        });
    }
};
