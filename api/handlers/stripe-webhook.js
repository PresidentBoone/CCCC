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
        // Verify webhook signature (REQUIRED for production security)
        const signature = req.headers['stripe-signature'];

        if (!webhookSecret) {
            console.error('❌ STRIPE_WEBHOOK_SECRET not configured - webhooks disabled for security');
            return res.status(500).json({
                error: 'Webhook secret not configured',
                message: 'Contact administrator to configure STRIPE_WEBHOOK_SECRET'
            });
        }

        // Verify signature to prevent webhook spoofing
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            webhookSecret
        );

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

            case 'charge.refunded':
                await handleChargeRefunded(event.data.object);
                break;

            case 'customer.subscription.trial_will_end':
                await handleTrialWillEnd(event.data.object);
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
 * Handle charge refunded
 * Downgrades user to free tier and logs refund
 */
async function handleChargeRefunded(charge) {
    const customerId = charge.customer;
    const refundAmount = charge.amount_refunded;
    const refundReason = charge.refund.reason || 'requested_by_customer';

    console.log(`💸 Refund processed for customer ${customerId}: $${refundAmount / 100}`);

    try {
        // Find user by Stripe customer ID
        const usersSnapshot = await db.collection('users')
            .where('subscription.stripeCustomerId', '==', customerId)
            .limit(1)
            .get();

        if (usersSnapshot.empty) {
            console.warn(`No user found for customer ${customerId}`);
            return;
        }

        const userId = usersSnapshot.docs[0].id;

        // Downgrade to free tier
        await db.collection('users').doc(userId).set({
            subscription: {
                tier: 'free',
                status: 'refunded',
                refundedAt: admin.firestore.FieldValue.serverTimestamp(),
                refundReason: refundReason,
                refundAmount: refundAmount / 100,
                previousTier: usersSnapshot.docs[0].data().subscription?.tier || 'unknown',
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }
        }, { merge: true });

        console.log(`✅ User ${userId} downgraded to free tier after refund`);
    } catch (error) {
        console.error('Error handling refund:', error);
        throw error;
    }
}

/**
 * Handle trial will end notification
 * Send reminder email before trial ends
 */
async function handleTrialWillEnd(subscription) {
    const userId = subscription.metadata?.userId;
    const trialEnd = new Date(subscription.trial_end * 1000);

    console.log(`⏰ Trial ending soon for user ${userId} on ${trialEnd.toLocaleDateString()}`);

    // Could send trial ending reminder email here
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
