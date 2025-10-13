/**
 * Interactive Product Tour
 * Better than a video - shows users exactly what to do
 */

class ProductTour {
    constructor() {
        this.currentStep = 0;
        this.steps = [
            {
                title: "Welcome to College Climb! 🎓",
                description: "Let's take a quick 60-second tour of the most powerful features that will help you get into your dream school.",
                target: ".welcome-section",
                position: "bottom",
                action: null
            },
            {
                title: "Track Your Applications",
                description: "Click any of these cards to manage your college applications. Add schools, track deadlines, and see your progress at a glance.",
                target: "#applicationsCount",
                position: "bottom",
                highlightParent: ".stat-card",
                action: "click"
            },
            {
                title: "AI Essay Coach",
                description: "Your essays can make or break your application. Our AI coach gives you instant feedback and helps you write compelling stories.",
                target: "#essaysCount",
                position: "bottom",
                highlightParent: ".stat-card",
                link: "essaycoach.html"
            },
            {
                title: "Scholarships Worth Applying For",
                description: "We've already found scholarships you're eligible for. Every dollar counts - let's help you pay for college.",
                target: "#scholarshipAmount",
                position: "bottom",
                highlightParent: ".stat-card",
                link: "scholarship.html"
            },
            {
                title: "Test Prep That Actually Works",
                description: "Practice tests, AI-powered weak spot detection, and score improvement tracking. Raise your SAT/ACT score by 100+ points.",
                target: "#testprepScore",
                position: "bottom",
                highlightParent: ".stat-card",
                link: "testprep-enhanced.html"
            },
            {
                title: "Your Task List",
                description: "Everything you need to do, prioritized by deadline. Check off tasks and watch your progress grow.",
                target: "#taskList",
                position: "left",
                action: null
            },
            {
                title: "AI School Recommendations",
                description: "These aren't random schools - they're matched to YOUR profile, test scores, and interests. Click any school to learn more.",
                target: "#schoolGrid",
                position: "top",
                action: null
            },
            {
                title: "You're Ready! 🚀",
                description: "That's it! Start with whatever feels most urgent. Most students begin by adding their first application or checking out the essay coach.",
                target: null,
                position: "center",
                action: null,
                cta: {
                    primary: "Add My First Application",
                    primaryAction: () => window.showApplicationTracker(),
                    secondary: "Start Writing Essays",
                    secondaryAction: () => window.location.href = 'essaycoach.html'
                }
            }
        ];
        this.tourActive = false;
    }

    /**
     * Start the tour
     */
    start() {
        this.currentStep = 0;
        this.tourActive = true;
        this.createOverlay();
        this.showStep();
    }

    /**
     * Create overlay and tooltip container
     */
    createOverlay() {
        // Remove existing if any
        this.remove();

        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'productTourOverlay';
        overlay.className = 'product-tour-overlay';
        document.body.appendChild(overlay);

        // Create tooltip container
        const tooltip = document.createElement('div');
        tooltip.id = 'productTourTooltip';
        tooltip.className = 'product-tour-tooltip';
        document.body.appendChild(tooltip);

        // Add styles
        this.addStyles();
    }

    /**
     * Show current step
     */
    showStep() {
        const step = this.steps[this.currentStep];
        const tooltip = document.getElementById('productTourTooltip');
        const overlay = document.getElementById('productTourOverlay');

        if (!tooltip || !overlay) return;

        // Clear previous highlights
        document.querySelectorAll('.tour-highlight').forEach(el => {
            el.classList.remove('tour-highlight');
        });

        // Highlight target element
        let targetElement = null;
        if (step.target) {
            targetElement = document.querySelector(step.target);

            if (targetElement) {
                // Highlight parent if specified
                const elementToHighlight = step.highlightParent ?
                    targetElement.closest(step.highlightParent) : targetElement;

                if (elementToHighlight) {
                    elementToHighlight.classList.add('tour-highlight');

                    // Scroll into view
                    elementToHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }

        // Build tooltip content
        const progressDots = this.steps.map((_, index) =>
            `<div class="tour-dot ${index === this.currentStep ? 'active' : ''} ${index < this.currentStep ? 'completed' : ''}"></div>`
        ).join('');

        let ctaButtons = '';
        if (step.cta) {
            ctaButtons = `
                <div class="tour-cta-buttons">
                    <button class="tour-btn tour-btn-secondary" onclick="window.productTour.handleCTA('secondary')">
                        ${step.cta.secondary}
                    </button>
                    <button class="tour-btn tour-btn-primary" onclick="window.productTour.handleCTA('primary')">
                        ${step.cta.primary}
                    </button>
                </div>
            `;
        }

        tooltip.innerHTML = `
            <div class="tour-header">
                <h3>${step.title}</h3>
                <button class="tour-close" onclick="window.productTour.skip()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="tour-body">
                <p>${step.description}</p>
                ${step.link ? `
                    <button class="tour-link-btn" onclick="window.location.href='${step.link}'">
                        Try it now <i class="fas fa-arrow-right"></i>
                    </button>
                ` : ''}
            </div>
            ${ctaButtons || `
                <div class="tour-footer">
                    <div class="tour-progress">
                        ${progressDots}
                    </div>
                    <div class="tour-nav">
                        ${this.currentStep > 0 ? `
                            <button class="tour-btn tour-btn-ghost" onclick="window.productTour.previous()">
                                Back
                            </button>
                        ` : ''}
                        <button class="tour-btn tour-btn-primary" onclick="window.productTour.next()">
                            ${this.currentStep === this.steps.length - 1 ? 'Finish' : 'Next'}
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            `}
        `;

        // Position tooltip
        this.positionTooltip(targetElement, step.position);

        // Show with animation
        setTimeout(() => {
            tooltip.classList.add('show');
            overlay.classList.add('show');
        }, 10);
    }

    /**
     * Position tooltip relative to target
     */
    positionTooltip(targetElement, position) {
        const tooltip = document.getElementById('productTourTooltip');
        if (!tooltip) return;

        if (!targetElement || position === 'center') {
            // Center of screen
            tooltip.style.position = 'fixed';
            tooltip.style.top = '50%';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translate(-50%, -50%)';
            return;
        }

        const rect = targetElement.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let top, left;

        switch (position) {
            case 'bottom':
                top = rect.bottom + 20;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'top':
                top = rect.top - tooltipRect.height - 20;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.left - tooltipRect.width - 20;
                break;
            case 'right':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.right + 20;
                break;
            default:
                top = rect.bottom + 20;
                left = rect.left;
        }

        // Keep tooltip on screen
        const padding = 20;
        top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
        left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));

        tooltip.style.position = 'fixed';
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.style.transform = 'none';
    }

    /**
     * Next step
     */
    next() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.showStep();
        } else {
            this.complete();
        }
    }

    /**
     * Previous step
     */
    previous() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showStep();
        }
    }

    /**
     * Handle CTA button click
     */
    handleCTA(type) {
        const step = this.steps[this.currentStep];
        if (step.cta) {
            this.complete();
            if (type === 'primary' && step.cta.primaryAction) {
                step.cta.primaryAction();
            } else if (type === 'secondary' && step.cta.secondaryAction) {
                step.cta.secondaryAction();
            }
        }
    }

    /**
     * Skip tour
     */
    skip() {
        if (confirm('Are you sure you want to skip the tour? You can restart it anytime from the help menu.')) {
            this.complete();
        }
    }

    /**
     * Complete tour
     */
    complete() {
        this.tourActive = false;

        // Mark tour as completed in localStorage
        localStorage.setItem('productTourCompleted', 'true');

        this.remove();

        if (typeof showToast === 'function') {
            showToast('Tour completed! Explore the dashboard and let us know if you need help.', 'success', 3000);
        }
    }

    /**
     * Remove tour elements
     */
    remove() {
        const overlay = document.getElementById('productTourOverlay');
        const tooltip = document.getElementById('productTourTooltip');

        if (overlay) overlay.remove();
        if (tooltip) tooltip.remove();

        document.querySelectorAll('.tour-highlight').forEach(el => {
            el.classList.remove('tour-highlight');
        });
    }

    /**
     * Check if tour should auto-start
     */
    shouldAutoStart() {
        // Only check if tour was completed, not onboarding
        // Onboarding state is checked in dashboard initialization
        return !localStorage.getItem('productTourCompleted');
    }

    /**
     * Add styles
     */
    addStyles() {
        if (document.getElementById('productTourStyles')) return;

        const style = document.createElement('style');
        style.id = 'productTourStyles';
        style.textContent = `
            .product-tour-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
                z-index: 99999;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .product-tour-overlay.show {
                opacity: 1;
            }

            .product-tour-tooltip {
                position: fixed;
                background: var(--primary-bg);
                border-radius: 16px;
                box-shadow: 0 25px 100px rgba(0, 0, 0, 0.5);
                max-width: 450px;
                z-index: 100000;
                opacity: 0;
                transform: scale(0.9);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            [data-theme="dark"] .product-tour-tooltip {
                background: var(--secondary-bg);
                border: 1px solid rgba(187, 134, 252, 0.2);
            }

            .product-tour-tooltip.show {
                opacity: 1;
                transform: scale(1);
            }

            .tour-header {
                padding: 1.5rem 1.5rem 1rem;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 1rem;
            }

            .tour-header h3 {
                margin: 0;
                font-size: 1.3rem;
                font-weight: 700;
                color: var(--text-primary);
                flex: 1;
            }

            .tour-close {
                background: rgba(160, 123, 204, 0.1);
                border: none;
                color: var(--text-primary);
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                flex-shrink: 0;
            }

            .tour-close:hover {
                background: rgba(160, 123, 204, 0.2);
                transform: rotate(90deg);
            }

            .tour-body {
                padding: 0 1.5rem 1.5rem;
            }

            .tour-body p {
                margin: 0 0 1rem 0;
                color: var(--text-secondary);
                font-size: 1rem;
                line-height: 1.6;
            }

            .tour-link-btn {
                background: var(--gradient);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 12px;
                font-weight: 600;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.3s ease;
            }

            .tour-link-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(160, 123, 204, 0.4);
            }

            .tour-footer {
                padding: 1rem 1.5rem 1.5rem;
                border-top: 1px solid rgba(160, 123, 204, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1rem;
            }

            .tour-progress {
                display: flex;
                gap: 0.5rem;
            }

            .tour-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: rgba(160, 123, 204, 0.3);
                transition: all 0.3s ease;
            }

            .tour-dot.active {
                background: var(--accent-color);
                transform: scale(1.5);
            }

            .tour-dot.completed {
                background: var(--success-color);
            }

            .tour-nav {
                display: flex;
                gap: 0.75rem;
            }

            .tour-btn {
                padding: 0.75rem 1.5rem;
                border-radius: 12px;
                font-weight: 600;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.3s ease;
                border: none;
                font-size: 0.95rem;
            }

            .tour-btn-primary {
                background: var(--gradient);
                color: white;
                box-shadow: 0 4px 12px rgba(160, 123, 204, 0.3);
            }

            .tour-btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(160, 123, 204, 0.4);
            }

            .tour-btn-secondary {
                background: var(--secondary-bg);
                color: var(--text-primary);
                border: 2px solid rgba(160, 123, 204, 0.3);
            }

            .tour-btn-secondary:hover {
                background: rgba(160, 123, 204, 0.1);
                border-color: var(--accent-color);
            }

            .tour-btn-ghost {
                background: transparent;
                color: var(--text-secondary);
            }

            .tour-btn-ghost:hover {
                background: rgba(160, 123, 204, 0.1);
                color: var(--text-primary);
            }

            .tour-cta-buttons {
                padding: 1rem 1.5rem 1.5rem;
                display: flex;
                gap: 1rem;
                border-top: 1px solid rgba(160, 123, 204, 0.1);
            }

            .tour-cta-buttons .tour-btn {
                flex: 1;
            }

            .tour-highlight {
                position: relative;
                z-index: 99998;
                box-shadow: 0 0 0 4px rgba(160, 123, 204, 0.5), 0 0 0 99999px rgba(0, 0, 0, 0.7) !important;
                border-radius: 16px;
                animation: tourPulse 2s infinite;
            }

            @keyframes tourPulse {
                0%, 100% {
                    box-shadow: 0 0 0 4px rgba(160, 123, 204, 0.5), 0 0 0 99999px rgba(0, 0, 0, 0.7);
                }
                50% {
                    box-shadow: 0 0 0 8px rgba(160, 123, 204, 0.3), 0 0 0 99999px rgba(0, 0, 0, 0.7);
                }
            }

            @media (max-width: 768px) {
                .product-tour-tooltip {
                    max-width: calc(100vw - 40px);
                    left: 20px !important;
                    right: 20px !important;
                    transform: none !important;
                }

                .tour-cta-buttons {
                    flex-direction: column;
                }

                .tour-nav {
                    flex-direction: column;
                    width: 100%;
                }

                .tour-btn {
                    width: 100%;
                    justify-content: center;
                }

                .tour-footer {
                    flex-direction: column-reverse;
                }
            }
        `;

        document.head.appendChild(style);
    }
}

// Export to global scope
window.ProductTour = ProductTour;

// Add help menu button to start tour
window.startProductTour = function() {
    if (!window.productTour) {
        window.productTour = new ProductTour();
    }
    window.productTour.start();
};

console.log('📦 Product Tour loaded');
