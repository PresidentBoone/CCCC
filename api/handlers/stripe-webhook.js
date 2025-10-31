/**
 * Stripe Webhook Handler
 * Handles Stripe webhook events for subscription lifecycle
 */

const Stripe = require('stripe');
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
}

const db = admin.firestore();

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // Verify webhook signature
        const signature = req.headers['stripe-signature'];

        if (!webhookSecret) {
            console.warn('⚠️ Webhook secret not configured, skipping signature verification');
            event = req.body;
        } else {
            event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                webhookSecret
            );
        }

        console.log(`📨 Webhook received: ${event.type}`);

        // Handle different event types
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(event.data.object);
                break;

            case 'customer.subscription.created':
                await handleSubscriptionCreated(event.data.object);
                break;

            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;

            case 'invoice.paid':
                await handleInvoicePaid(event.data.object);
                break;

            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.status(200).json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).json({
            error: error.message || 'Webhook handler failed'
        });
    }
};

/**
 * Handle checkout session completed
 */
async function handleCheckoutCompleted(session) {
    const userId = session.metadata.userId;
    const customerId = session.customer;
    const subscriptionId = session.subscription;

    console.log(`✅ Checkout completed for user ${userId}`);

    // Update user document in Firestore
    await db.collection('users').doc(userId).set({
        subscription: {
            customerId,
            subscriptionId,
            status: 'active',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }
    }, { merge: true });
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription) {
    const userId = subscription.metadata.userId;
    const tier = getPriceIdTier(subscription.items.data[0].price.id);

    console.log(`✅ Subscription created for user ${userId}: ${tier}`);

    await db.collection('users').doc(userId).set({
        subscription: {
            tier,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }
    }, { merge: true });
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription) {
    const userId = subscription.metadata.userId;
    const tier = getPriceIdTier(subscription.items.data[0].price.id);

    console.log(`🔄 Subscription updated for user ${userId}: ${subscription.status}`);

    await db.collection('users').doc(userId).set({
        subscription: {
            tier,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }
    }, { merge: true });
}

/**
 * Handle subscription deleted/canceled
 */
async function handleSubscriptionDeleted(subscription) {
    const userId = subscription.metadata.userId;

    console.log(`❌ Subscription canceled for user ${userId}`);

    await db.collection('users').doc(userId).set({
        subscription: {
            tier: 'free',
            status: 'canceled',
            canceledAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }
    }, { merge: true });
}

/**
 * Handle invoice paid
 */
async function handleInvoicePaid(invoice) {
    const customerId = invoice.customer;
    const subscriptionId = invoice.subscription;

    console.log(`💰 Invoice paid for subscription ${subscriptionId}`);

    // Could send receipt email here
}

/**
 * Handle payment failed
 */
async function handlePaymentFailed(invoice) {
    const customerId = invoice.customer;
    const subscriptionId = invoice.subscription;

    console.log(`⚠️ Payment failed for subscription ${subscriptionId}`);

    // Could send payment failure notification email here
}

/**
 * Map Stripe price ID to tier name
 */
function getPriceIdTier(priceId) {
    const priceIdBasic = process.env.STRIPE_PRICE_ID_BASIC;
    const priceIdPro = process.env.STRIPE_PRICE_ID_PRO;

    if (priceId === priceIdBasic) return 'basic';
    if (priceId === priceIdPro) return 'pro';
    return 'free';
}
