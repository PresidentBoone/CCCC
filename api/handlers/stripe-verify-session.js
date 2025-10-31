/**
 * Stripe Verify Session Handler
 * Verifies a checkout session and returns subscription details
 */

const Stripe = require('stripe');

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Initialize Stripe
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        const { sessionId } = req.body;

        // Validate session ID
        if (!sessionId) {
            return res.status(400).json({
                error: 'Missing required field: sessionId'
            });
        }

        // Retrieve session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Verify payment was successful
        if (session.payment_status !== 'paid') {
            return res.status(400).json({
                error: 'Payment not completed',
                status: session.payment_status
            });
        }

        // Get subscription details if available
        let tier = 'basic'; // default
        if (session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription);
            const priceId = subscription.items.data[0].price.id;

            // Map price ID to tier
            const priceIdBasic = process.env.STRIPE_PRICE_ID_BASIC;
            const priceIdPro = process.env.STRIPE_PRICE_ID_PRO;

            if (priceId === priceIdBasic) {
                tier = 'basic';
            } else if (priceId === priceIdPro) {
                tier = 'pro';
            }
        }

        console.log(`✅ Session verified for user ${session.metadata.userId}: ${tier}`);

        res.status(200).json({
            success: true,
            tier,
            customerId: session.customer,
            subscriptionId: session.subscription
        });

    } catch (error) {
        console.error('Session verification error:', error);
        res.status(500).json({
            error: error.message || 'Failed to verify session'
        });
    }
};
