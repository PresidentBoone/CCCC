/**
 * Stripe Create Checkout Session Handler
 * Creates a new Stripe Checkout session for subscription payment
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

        const { priceId, userId, userEmail, successUrl, cancelUrl } = req.body;

        // Validate required fields
        if (!priceId || !userId || !userEmail) {
            return res.status(400).json({
                error: 'Missing required fields: priceId, userId, userEmail'
            });
        }

        // Create or retrieve customer
        let customer;
        const existingCustomers = await stripe.customers.list({
            email: userEmail,
            limit: 1
        });

        if (existingCustomers.data.length > 0) {
            customer = existingCustomers.data[0];
        } else {
            customer = await stripe.customers.create({
                email: userEmail,
                metadata: {
                    userId: userId
                }
            });
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                }
            ],
            mode: 'subscription',
            success_url: successUrl || `${req.headers.origin}/subscription-success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl || `${req.headers.origin}/pricing.html?canceled=true`,
            metadata: {
                userId: userId
            },
            subscription_data: {
                metadata: {
                    userId: userId
                }
            }
        });

        console.log(`✅ Checkout session created for user ${userId}: ${session.id}`);

        res.status(200).json({
            sessionId: session.id,
            url: session.url
        });

    } catch (error) {
        console.error('Stripe checkout error:', error);
        res.status(500).json({
            error: error.message || 'Failed to create checkout session'
        });
    }
};
