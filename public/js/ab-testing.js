/**
 * 🧪 A/B Testing Framework
 * Simple and powerful A/B testing for optimization
 * Part of the Billion-Dollar Platform Infrastructure
 */

class ABTesting {
    constructor() {
        this.tests = {};
        this.userVariants = this.loadUserVariants();
        this.init();
    }

    init() {
        // Initialize active tests
        this.defineTests();
        this.applyVariants();
    }

    /**
     * Define Active A/B Tests
     */
    defineTests() {
        // Test 1: CTA Button Text
        this.createTest('cta_button_text', {
            variants: {
                A: { text: 'Get Started Free', color: '#2563eb' },
                B: { text: 'Start Your Journey', color: '#2563eb' },
                C: { text: 'Join Free Today', color: '#16a34a' }
            },
            traffic: 1.0, // 100% of users
            goal: 'signup_click'
        });

        // Test 2: Dashboard Welcome Message
        this.createTest('dashboard_welcome', {
            variants: {
                A: { type: 'formal', message: 'Welcome back to your dashboard' },
                B: { type: 'friendly', message: 'Great to see you again!' },
                C: { type: 'motivational', message: "Let's make today count!" }
            },
            traffic: 1.0,
            goal: 'feature_engagement'
        });

        // Test 3: Pricing Display
        this.createTest('pricing_display', {
            variants: {
                A: { style: 'monthly', emphasis: 'monthly price' },
                B: { style: 'annual', emphasis: 'annual savings' }
            },
            traffic: 0.5, // 50% of users
            goal: 'upgrade_click'
        });

        // Test 4: Essay Coach CTA
        this.createTest('essay_coach_cta', {
            variants: {
                A: { text: 'Analyze My Essay', icon: '🤖' },
                B: { text: 'Get AI Feedback', icon: '✨' },
                C: { text: 'Improve My Essay', icon: '📝' }
            },
            traffic: 1.0,
            goal: 'essay_analysis'
        });
    }

    /**
     * Create A/B Test
     */
    createTest(testName, config) {
        // Check if user is in test traffic
        if (!this.shouldIncludeInTest(config.traffic)) {
            return;
        }

        // Assign variant to user
        const variant = this.assignVariant(testName, config.variants);
        
        this.tests[testName] = {
            ...config,
            activeVariant: variant,
            variantData: config.variants[variant]
        };

        // Track test participation
        this.trackTestParticipation(testName, variant);
    }

    /**
     * Assign User to Variant
     */
    assignVariant(testName, variants) {
        // Check if user already has a variant
        if (this.userVariants[testName]) {
            return this.userVariants[testName];
        }

        // Assign new variant
        const variantKeys = Object.keys(variants);
        const randomIndex = Math.floor(Math.random() * variantKeys.length);
        const variant = variantKeys[randomIndex];

        // Save variant
        this.userVariants[testName] = variant;
        this.saveUserVariants();

        return variant;
    }

    /**
     * Check if User Should Be in Test
     */
    shouldIncludeInTest(traffic) {
        return Math.random() < traffic;
    }

    /**
     * Get Variant Data
     */
    getVariant(testName) {
        const test = this.tests[testName];
        if (!test) return null;
        
        return {
            variant: test.activeVariant,
            data: test.variantData
        };
    }

    /**
     * Check Active Variant
     */
    isVariant(testName, variant) {
        const test = this.tests[testName];
        return test && test.activeVariant === variant;
    }

    /**
     * Apply Variants to Page
     */
    applyVariants() {
        // Apply CTA button text
        const ctaTest = this.getVariant('cta_button_text');
        if (ctaTest) {
            const ctaButtons = document.querySelectorAll('[data-ab-test="cta-button"]');
            ctaButtons.forEach(btn => {
                btn.textContent = ctaTest.data.text;
                btn.style.backgroundColor = ctaTest.data.color;
            });
        }

        // Apply dashboard welcome
        const welcomeTest = this.getVariant('dashboard_welcome');
        if (welcomeTest) {
            const welcomeElement = document.querySelector('[data-ab-test="dashboard-welcome"]');
            if (welcomeElement) {
                welcomeElement.textContent = welcomeTest.data.message;
                welcomeElement.dataset.welcomeType = welcomeTest.data.type;
            }
        }

        // Apply essay coach CTA
        const essayTest = this.getVariant('essay_coach_cta');
        if (essayTest) {
            const essayButtons = document.querySelectorAll('[data-ab-test="essay-cta"]');
            essayButtons.forEach(btn => {
                btn.textContent = `${essayTest.data.icon} ${essayTest.data.text}`;
            });
        }
    }

    /**
     * Track Goal Conversion
     */
    trackGoal(goalName, data = {}) {
        // Find tests with this goal
        Object.keys(this.tests).forEach(testName => {
            const test = this.tests[testName];
            if (test.goal === goalName) {
                this.trackConversion(testName, test.activeVariant, goalName, data);
            }
        });
    }

    /**
     * Track Test Participation
     */
    trackTestParticipation(testName, variant) {
        if (window.analytics) {
            window.analytics.trackEvent('ab_test_participation', {
                test_name: testName,
                variant: variant,
                timestamp: new Date().toISOString()
            });
        }

        // Store in Firebase
        if (window.firebase && window.firebase.auth().currentUser) {
            const userId = window.firebase.auth().currentUser.uid;
            window.firebase.firestore().collection('abTests').doc(testName).collection('participants').doc(userId).set({
                variant,
                timestamp: new Date(),
                userId
            }, { merge: true });
        }
    }

    /**
     * Track Conversion
     */
    trackConversion(testName, variant, goalName, data) {
        if (window.analytics) {
            window.analytics.trackEvent('ab_test_conversion', {
                test_name: testName,
                variant: variant,
                goal: goalName,
                ...data
            });
        }

        // Store in Firebase
        if (window.firebase && window.firebase.auth().currentUser) {
            const userId = window.firebase.auth().currentUser.uid;
            window.firebase.firestore().collection('abTests').doc(testName).collection('conversions').add({
                userId,
                variant,
                goal: goalName,
                timestamp: new Date(),
                ...data
            });
        }

        console.log(`✅ A/B Test Conversion: ${testName} (${variant}) → ${goalName}`);
    }

    /**
     * Get Test Results
     */
    async getTestResults(testName) {
        if (!window.firebase) return null;

        const testDoc = window.firebase.firestore().collection('abTests').doc(testName);
        
        // Get participants
        const participantsSnap = await testDoc.collection('participants').get();
        const participants = {};
        participantsSnap.forEach(doc => {
            const variant = doc.data().variant;
            participants[variant] = (participants[variant] || 0) + 1;
        });

        // Get conversions
        const conversionsSnap = await testDoc.collection('conversions').get();
        const conversions = {};
        conversionsSnap.forEach(doc => {
            const variant = doc.data().variant;
            conversions[variant] = (conversions[variant] || 0) + 1;
        });

        // Calculate conversion rates
        const results = {};
        Object.keys(participants).forEach(variant => {
            results[variant] = {
                participants: participants[variant],
                conversions: conversions[variant] || 0,
                conversionRate: ((conversions[variant] || 0) / participants[variant] * 100).toFixed(2) + '%'
            };
        });

        return results;
    }

    /**
     * Storage Methods
     */
    loadUserVariants() {
        const stored = localStorage.getItem('ab_test_variants');
        return stored ? JSON.parse(stored) : {};
    }

    saveUserVariants() {
        localStorage.setItem('ab_test_variants', JSON.stringify(this.userVariants));
    }

    /**
     * Force Variant (for testing)
     */
    forceVariant(testName, variant) {
        this.userVariants[testName] = variant;
        this.saveUserVariants();
        window.location.reload();
    }

    /**
     * Reset All Tests (for testing)
     */
    resetTests() {
        localStorage.removeItem('ab_test_variants');
        window.location.reload();
    }

    /**
     * Get Active Tests Info
     */
    getActiveTests() {
        return Object.keys(this.tests).map(testName => ({
            name: testName,
            variant: this.tests[testName].activeVariant,
            data: this.tests[testName].variantData
        }));
    }
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.abTesting = new ABTesting();
    });
} else {
    window.abTesting = new ABTesting();
}

// Expose helper functions globally
window.abTestTrackGoal = (goalName, data) => {
    if (window.abTesting) {
        window.abTesting.trackGoal(goalName, data);
    }
};

window.abTestGetVariant = (testName) => {
    if (window.abTesting) {
        return window.abTesting.getVariant(testName);
    }
    return null;
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ABTesting;
}
