/**
 * Stripe Create Portal Session Handler
 * Creates a customer portal session for subscription management
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

        const { customerId, returnUrl } = req.body;

        // Validate required fields
        if (!customerId) {
            return res.status(400).json({
                error: 'Missing required field: customerId'
            });
        }

        // Create portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl || `${req.headers.origin}/dashboard.html`,
        });

        console.log(`✅ Portal session created for customer ${customerId}`);

        res.status(200).json({
            url: session.url
        });

    } catch (error) {
        console.error('Stripe portal error:', error);
        res.status(500).json({
            error: error.message || 'Failed to create portal session'
        });
    }
};
