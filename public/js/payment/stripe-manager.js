/**
 * Stripe Payment Manager
 * Handles client-side Stripe integration for subscriptions
 */

class StripeManager {
    constructor() {
        this.stripe = null;
        this.isInitialized = false;
        this.publishableKey = null;
    }

    /**
     * Initialize Stripe with publishable key
     * @param {string} publishableKey - Stripe publishable key
     */
    async initialize(publishableKey) {
        if (this.isInitialized) {
            console.log('Stripe already initialized');
            return;
        }

        try {
            // Load Stripe.js if not already loaded
            if (typeof Stripe === 'undefined') {
                await this.loadStripeJS();
            }

            this.publishableKey = publishableKey;
            this.stripe = Stripe(publishableKey);
            this.isInitialized = true;

            console.log('✅ Stripe initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Stripe:', error);
            throw new Error('Stripe initialization failed');
        }
    }

    /**
     * Load Stripe.js library dynamically
     */
    async loadStripeJS() {
        return new Promise((resolve, reject) => {
            if (typeof Stripe !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load Stripe.js'));
            document.head.appendChild(script);
        });
    }

    /**
     * Create checkout session and redirect to Stripe Checkout
     * @param {string} priceId - Stripe price ID
     * @param {string} userId - User ID
     * @param {string} userEmail - User email
     * @returns {Promise<void>}
     */
    async createCheckoutSession(priceId, userId, userEmail) {
        // Check if mock payments are enabled
        if (window.mockPaymentSystem && window.mockPaymentSystem.isEnabled()) {
            console.log('🧪 Using mock payment system');
            const result = await window.mockPaymentSystem.createMockCheckout(priceId, userId, userEmail);

            if (result.success) {
                // Redirect to success page
                window.location.href = `/subscription-success.html?mock=true&tier=${result.tier}`;
            }
            return;
        }

        if (!this.isInitialized) {
            throw new Error('Stripe not initialized. Call initialize() first.');
        }

        try {
            // Call backend API to create checkout session
            const response = await fetch('/api/stripe/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId,
                    userId,
                    userEmail,
                    successUrl: `${window.location.origin}/subscription-success.html?session_id={CHECKOUT_SESSION_ID}`,
                    cancelUrl: `${window.location.origin}/pricing.html?canceled=true`
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create checkout session');
            }

            const { sessionId } = await response.json();

            // Redirect to Stripe Checkout
            const { error } = await this.stripe.redirectToCheckout({
                sessionId
            });

            if (error) {
                throw error;
            }
        } catch (error) {
            console.error('Checkout session error:', error);
            throw error;
        }
    }

    /**
     * Create customer portal session and redirect
     * @param {string} customerId - Stripe customer ID
     * @returns {Promise<void>}
     */
    async redirectToCustomerPortal(customerId, userId) {
        // Check if mock payments are enabled
        if (window.mockPaymentSystem && window.mockPaymentSystem.isEnabled()) {
            console.log('🧪 Using mock billing portal');
            window.mockPaymentSystem.showMockPortal(userId);
            return;
        }

        try {
            const response = await fetch('/api/stripe/create-portal-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerId,
                    returnUrl: `${window.location.origin}/dashboard.html`
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create portal session');
            }

            const { url } = await response.json();

            // Redirect to customer portal
            window.location.href = url;
        } catch (error) {
            console.error('Portal session error:', error);
            throw error;
        }
    }

    /**
     * Verify checkout session after successful payment
     * @param {string} sessionId - Checkout session ID
     * @returns {Promise<Object>} Session details
     */
    async verifyCheckoutSession(sessionId) {
        try {
            const response = await fetch('/api/stripe/verify-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId })
            });

            if (!response.ok) {
                throw new Error('Failed to verify session');
            }

            return await response.json();
        } catch (error) {
            console.error('Session verification error:', error);
            throw error;
        }
    }

    /**
     * Get subscription status for user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Subscription status
     */
    async getSubscriptionStatus(userId) {
        try {
            const response = await fetch(`/api/stripe/subscription-status?userId=${userId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch subscription status');
            }

            return await response.json();
        } catch (error) {
            console.error('Subscription status error:', error);
            return {
                tier: 'free',
                status: 'active',
                currentPeriodEnd: null
            };
        }
    }
}

// Export singleton instance
const stripeManager = new StripeManager();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = stripeManager;
} else {
    window.stripeManager = stripeManager;
}
