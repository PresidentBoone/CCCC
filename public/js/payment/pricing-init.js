/**
 * Pricing Page Initialization
 * Handles subscription button clicks and Stripe checkout
 */

import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js';

// Stripe publishable key (set this from environment or config)
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51QSb8pP9rVeYC5tKyBBPUDmQLG1r6cKATrg2Xfq6Xh6Mf4z4N16QoJ4YSbJNg7Pz9mHpG5YqZRz2h5Xg8Vf7FqQN00y7mEqG8t'; // Replace with actual key

// Stripe price IDs (from Stripe Dashboard)
const PRICE_IDS = {
    free: null, // Free tier doesn't need checkout
    basic: 'price_1QSbC7P9rVeYC5tKwXQbE5z9', // Replace with actual price ID
    pro: 'price_1QSbCjP9rVeYC5tKmZ8qN9Xy'    // Replace with actual price ID
};

class PricingManager {
    constructor() {
        this.auth = getAuth();
        this.currentUser = null;
        this.stripeManager = null;
    }

    async initialize() {
        // Wait for Stripe manager to load
        await this.waitForStripeManager();

        // Initialize Stripe
        try {
            await window.stripeManager.initialize(STRIPE_PUBLISHABLE_KEY);
            console.log('✅ Stripe initialized on pricing page');
        } catch (error) {
            console.error('Failed to initialize Stripe:', error);
            this.showError('Payment system unavailable. Please try again later.');
            return;
        }

        // Set up auth state listener
        onAuthStateChanged(this.auth, (user) => {
            this.currentUser = user;
            this.updateButtonStates();
        });

        // Attach event listeners to buttons
        this.attachButtonListeners();

        // Check for canceled checkout
        this.checkCanceledCheckout();
    }

    async waitForStripeManager() {
        return new Promise((resolve) => {
            if (window.stripeManager) {
                resolve();
                return;
            }

            // Wait for stripe-manager.js to load
            const checkInterval = setInterval(() => {
                if (window.stripeManager) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);

            // Timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve();
            }, 5000);
        });
    }

    attachButtonListeners() {
        const buttons = document.querySelectorAll('.plan-button');

        buttons.forEach((button, index) => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();

                // Determine tier based on button index or text
                let tier;
                if (index === 0 || button.textContent.includes('Free')) {
                    tier = 'free';
                } else if (index === 1 || button.textContent.includes('Premium') || button.textContent.includes('Basic')) {
                    tier = 'basic';
                } else {
                    tier = 'pro';
                }

                await this.handleSubscribe(tier);
            });
        });
    }

    async handleSubscribe(tier) {
        // Check if user is authenticated
        if (!this.currentUser) {
            // Redirect to signup with return URL
            const returnUrl = encodeURIComponent(`${window.location.origin}/pricing.html?tier=${tier}`);
            window.location.href = `/signup.html?redirect=${returnUrl}`;
            return;
        }

        // Free tier - just redirect to dashboard
        if (tier === 'free') {
            this.showSuccess('Welcome to College Climb Free!');
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1500);
            return;
        }

        // Get price ID for tier
        const priceId = PRICE_IDS[tier];
        if (!priceId) {
            this.showError('Invalid subscription tier');
            return;
        }

        try {
            // Show loading state
            this.setLoadingState(true);

            // Create checkout session and redirect to Stripe
            await window.stripeManager.createCheckoutSession(
                priceId,
                this.currentUser.uid,
                this.currentUser.email
            );

            // The page will redirect to Stripe Checkout
            // No need to do anything else here

        } catch (error) {
            console.error('Subscription error:', error);
            this.showError(error.message || 'Failed to start checkout. Please try again.');
            this.setLoadingState(false);
        }
    }

    updateButtonStates() {
        const buttons = document.querySelectorAll('.plan-button');

        buttons.forEach((button, index) => {
            if (!this.currentUser && index > 0) {
                // Show "Sign Up to Subscribe" for paid tiers when not logged in
                const originalText = button.textContent;
                button.dataset.originalText = originalText;
                // Don't change text, just let the click handler redirect to signup
            }
        });
    }

    setLoadingState(isLoading) {
        const buttons = document.querySelectorAll('.plan-button');

        buttons.forEach((button) => {
            if (isLoading) {
                button.disabled = true;
                button.dataset.originalText = button.textContent;
                button.textContent = 'Loading...';
                button.style.opacity = '0.6';
                button.style.cursor = 'not-allowed';
            } else {
                button.disabled = false;
                button.textContent = button.dataset.originalText || button.textContent;
                button.style.opacity = '1';
                button.style.cursor = 'pointer';
            }
        });
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `pricing-toast pricing-toast-${type}`;
        toast.textContent = message;

        // Add to page
        document.body.appendChild(toast);

        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    checkCanceledCheckout() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('canceled') === 'true') {
            this.showError('Checkout canceled. No charges were made.');

            // Clean up URL
            window.history.replaceState({}, document.title, '/pricing.html');
        }
    }
}

// Add toast styles
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .pricing-toast {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        color: white;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        max-width: 400px;
    }

    .pricing-toast.show {
        opacity: 1;
        transform: translateY(0);
    }

    .pricing-toast-success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .pricing-toast-error {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }

    .pricing-toast-info {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    }
`;
document.head.appendChild(toastStyles);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const pricingManager = new PricingManager();
        pricingManager.initialize();
    });
} else {
    const pricingManager = new PricingManager();
    pricingManager.initialize();
}

// Export for external use
window.PricingManager = PricingManager;
