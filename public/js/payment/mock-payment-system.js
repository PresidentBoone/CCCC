/**
 * Mock Payment System
 * Simulates Stripe payments for testing without API keys
 *
 * TO ENABLE REAL PAYMENTS:
 * 1. Set ENABLE_MOCK_PAYMENTS = false
 * 2. Configure Stripe API keys in .env
 * 3. All existing code will work with real Stripe
 */

const ENABLE_MOCK_PAYMENTS = true; // Set to false when ready for real Stripe

class MockPaymentSystem {
    constructor() {
        this.mockSubscriptions = new Map(); // Store mock subscriptions in memory
    }

    /**
     * Check if mock payments are enabled
     */
    isEnabled() {
        return ENABLE_MOCK_PAYMENTS;
    }

    /**
     * Mock checkout - simulates Stripe Checkout flow
     */
    async createMockCheckout(priceId, userId, userEmail) {
        console.log('🧪 MOCK PAYMENT: Creating checkout session');
        console.log('Price:', priceId);
        console.log('User:', userEmail);

        // Determine tier from price ID (mock logic)
        let tier = 'basic';
        let price = 19.99;

        if (priceId.includes('pro') || priceId.includes('40')) {
            tier = 'pro';
            price = 39.99;
        }

        // Show mock checkout modal
        return new Promise((resolve) => {
            this.showMockCheckoutModal(tier, price, userId, userEmail, resolve);
        });
    }

    /**
     * Show mock checkout UI
     */
    showMockCheckoutModal(tier, price, userId, userEmail, onComplete) {
        const modal = document.createElement('div');
        modal.className = 'mock-checkout-modal';
        modal.innerHTML = `
            <div class="mock-checkout-overlay">
                <div class="mock-checkout-content">
                    <div class="mock-checkout-header">
                        <h2>🧪 Mock Payment (Test Mode)</h2>
                        <p class="mock-notice">This is a simulated payment. No real charges will be made.</p>
                    </div>

                    <div class="mock-checkout-details">
                        <div class="detail-row">
                            <span>Plan:</span>
                            <strong>College Climb ${tier.charAt(0).toUpperCase() + tier.slice(1)}</strong>
                        </div>
                        <div class="detail-row">
                            <span>Amount:</span>
                            <strong>$${price.toFixed(2)}/month</strong>
                        </div>
                        <div class="detail-row">
                            <span>Email:</span>
                            <strong>${userEmail}</strong>
                        </div>
                    </div>

                    <div class="mock-card-info">
                        <h3>Mock Card Information</h3>
                        <input type="text" value="4242 4242 4242 4242" disabled class="mock-input">
                        <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
                            <input type="text" value="12/34" disabled class="mock-input" style="flex: 1;">
                            <input type="text" value="123" disabled class="mock-input" style="flex: 1;">
                        </div>
                    </div>

                    <div class="mock-buttons">
                        <button class="mock-btn mock-btn-primary" id="mock-complete-payment">
                            Complete Mock Payment ✓
                        </button>
                        <button class="mock-btn mock-btn-secondary" id="mock-cancel-payment">
                            Cancel
                        </button>
                    </div>

                    <div class="mock-footer">
                        <small>💡 To enable real payments, set ENABLE_MOCK_PAYMENTS = false in mock-payment-system.js</small>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        document.getElementById('mock-complete-payment').addEventListener('click', async () => {
            // Simulate processing
            document.getElementById('mock-complete-payment').textContent = 'Processing...';
            document.getElementById('mock-complete-payment').disabled = true;

            await new Promise(r => setTimeout(r, 1500)); // Simulate API delay

            // Store mock subscription
            const subscription = {
                userId,
                tier,
                price,
                status: 'active',
                createdAt: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                customerId: `cus_mock_${Date.now()}`,
                subscriptionId: `sub_mock_${Date.now()}`
            };

            this.mockSubscriptions.set(userId, subscription);

            // Save to Firestore
            try {
                if (window.db && userId) {
                    await window.db.collection('users').doc(userId).set({
                        subscription: {
                            tier,
                            status: 'active',
                            customerId: subscription.customerId,
                            subscriptionId: subscription.subscriptionId,
                            currentPeriodEnd: subscription.currentPeriodEnd,
                            cancelAtPeriodEnd: false,
                            isMock: true, // Flag as mock subscription
                            updatedAt: new Date()
                        }
                    }, { merge: true });

                    console.log('✅ MOCK: Saved subscription to Firestore');
                }
            } catch (error) {
                console.error('Failed to save mock subscription:', error);
            }

            modal.remove();
            onComplete({ success: true, tier, subscription });
        });

        document.getElementById('mock-cancel-payment').addEventListener('click', () => {
            modal.remove();
            onComplete({ success: false, canceled: true });
        });
    }

    /**
     * Mock customer portal
     */
    showMockPortal(userId) {
        const subscription = this.mockSubscriptions.get(userId);

        const modal = document.createElement('div');
        modal.className = 'mock-portal-modal';
        modal.innerHTML = `
            <div class="mock-checkout-overlay">
                <div class="mock-checkout-content">
                    <div class="mock-checkout-header">
                        <h2>🧪 Mock Billing Portal</h2>
                        <button class="mock-close" id="mock-portal-close">&times;</button>
                    </div>

                    <div class="mock-subscription-info">
                        <h3>Current Subscription</h3>
                        ${subscription ? `
                            <div class="detail-row">
                                <span>Plan:</span>
                                <strong>${subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)}</strong>
                            </div>
                            <div class="detail-row">
                                <span>Status:</span>
                                <strong style="color: #10b981;">${subscription.status}</strong>
                            </div>
                            <div class="detail-row">
                                <span>Amount:</span>
                                <strong>$${subscription.price.toFixed(2)}/month</strong>
                            </div>
                            <div class="detail-row">
                                <span>Next billing:</span>
                                <strong>${subscription.currentPeriodEnd.toLocaleDateString()}</strong>
                            </div>
                        ` : `
                            <p>No active subscription</p>
                        `}
                    </div>

                    <div class="mock-portal-actions">
                        ${subscription ? `
                            <button class="mock-btn mock-btn-danger" id="mock-cancel-subscription">
                                Cancel Subscription
                            </button>
                        ` : `
                            <button class="mock-btn mock-btn-primary" id="mock-subscribe-again">
                                Subscribe Now
                            </button>
                        `}
                    </div>

                    <div class="mock-footer">
                        <small>💡 This is a mock portal. Real Stripe portal will have more options.</small>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        document.getElementById('mock-portal-close')?.addEventListener('click', () => modal.remove());

        document.getElementById('mock-cancel-subscription')?.addEventListener('click', async () => {
            if (confirm('Cancel your subscription? (Mock - no real charges)')) {
                this.mockSubscriptions.delete(userId);

                // Update Firestore
                if (window.db && userId) {
                    await window.db.collection('users').doc(userId).set({
                        subscription: {
                            tier: 'free',
                            status: 'canceled',
                            canceledAt: new Date(),
                            isMock: true
                        }
                    }, { merge: true });
                }

                modal.remove();
                alert('✅ Subscription canceled (mock)');
                window.location.reload();
            }
        });

        document.getElementById('mock-subscribe-again')?.addEventListener('click', () => {
            modal.remove();
            window.location.href = '/pricing.html';
        });
    }

    /**
     * Get mock subscription status
     */
    getMockSubscription(userId) {
        return this.mockSubscriptions.get(userId) || {
            tier: 'free',
            status: 'active',
            isMock: true
        };
    }
}

// CSS for mock payment UI
const styles = document.createElement('style');
styles.textContent = `
    .mock-checkout-modal, .mock-portal-modal {
        position: fixed;
        inset: 0;
        z-index: 100000;
    }

    .mock-checkout-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    }

    .mock-checkout-content {
        background: white;
        border-radius: 16px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease;
    }

    [data-theme="dark"] .mock-checkout-content {
        background: #1a1a1a;
        color: white;
    }

    .mock-checkout-header {
        text-align: center;
        margin-bottom: 2rem;
        position: relative;
    }

    .mock-checkout-header h2 {
        margin: 0 0 0.5rem 0;
        color: #2a357a;
    }

    [data-theme="dark"] .mock-checkout-header h2 {
        color: #bb86fc;
    }

    .mock-notice {
        background: #fef3c7;
        color: #92400e;
        padding: 0.75rem;
        border-radius: 6px;
        font-size: 0.9rem;
        margin: 1rem 0 0 0;
    }

    [data-theme="dark"] .mock-notice {
        background: #422006;
        color: #fbbf24;
    }

    .mock-checkout-details {
        background: #f9fafb;
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
    }

    [data-theme="dark"] .mock-checkout-details {
        background: #2a2a2a;
    }

    .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #e5e7eb;
    }

    .detail-row:last-child {
        border-bottom: none;
    }

    [data-theme="dark"] .detail-row {
        border-bottom-color: #444;
    }

    .mock-card-info {
        margin-bottom: 1.5rem;
    }

    .mock-card-info h3 {
        font-size: 1rem;
        margin-bottom: 0.75rem;
        color: #666;
    }

    .mock-input {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e5e7eb;
        border-radius: 6px;
        font-size: 1rem;
        background: #f9fafb;
        color: #666;
    }

    .mock-buttons {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1rem;
    }

    .mock-btn {
        padding: 1rem;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s;
    }

    .mock-btn-primary {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
    }

    .mock-btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
    }

    .mock-btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .mock-btn-secondary {
        background: #e5e7eb;
        color: #333;
    }

    .mock-btn-secondary:hover {
        background: #d1d5db;
    }

    .mock-btn-danger {
        background: #ef4444;
        color: white;
    }

    .mock-btn-danger:hover {
        background: #dc2626;
    }

    .mock-footer {
        text-align: center;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
    }

    [data-theme="dark"] .mock-footer {
        border-top-color: #444;
    }

    .mock-footer small {
        color: #666;
        font-size: 0.85rem;
    }

    .mock-close {
        position: absolute;
        top: -0.5rem;
        right: 0;
        background: none;
        border: none;
        font-size: 2rem;
        cursor: pointer;
        color: #666;
    }

    .mock-close:hover {
        color: #000;
    }

    [data-theme="dark"] .mock-close:hover {
        color: #fff;
    }

    .mock-subscription-info {
        background: #f9fafb;
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
    }

    [data-theme="dark"] .mock-subscription-info {
        background: #2a2a2a;
    }

    .mock-subscription-info h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        color: #2a357a;
    }

    [data-theme="dark"] .mock-subscription-info h3 {
        color: #bb86fc;
    }

    .mock-portal-actions {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(styles);

// Export singleton
const mockPaymentSystem = new MockPaymentSystem();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = mockPaymentSystem;
} else {
    window.mockPaymentSystem = mockPaymentSystem;
}
