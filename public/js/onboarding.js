/**
 * Onboarding Flow
 * Guides new users through first-time setup with quick wins
 */

class OnboardingFlow {
    constructor(db, userId, userData) {
        this.db = db;
        this.userId = userId;
        this.userData = userData;
        this.currentStep = 0;
        this.totalSteps = 4;
    }

    /**
     * Check if user needs onboarding
     */
    needsOnboarding() {
        return !this.userData?.onboardingCompleted;
    }

    /**
     * Start onboarding flow
     */
    start() {
        this.renderOnboarding();
    }

    /**
     * Render onboarding modal
     */
    renderOnboarding() {
        const modal = document.createElement('div');
        modal.id = 'onboardingModal';
        modal.className = 'onboarding-modal show';
        modal.innerHTML = `
            <div class="onboarding-overlay"></div>
            <div class="onboarding-content">
                <div class="onboarding-progress">
                    <div class="onboarding-progress-bar">
                        <div class="onboarding-progress-fill" style="width: ${(this.currentStep / this.totalSteps) * 100}%"></div>
                    </div>
                    <div class="onboarding-progress-text">Step ${this.currentStep + 1} of ${this.totalSteps}</div>
                </div>

                <div class="onboarding-body" id="onboardingBody">
                    ${this.renderStep()}
                </div>

                <div class="onboarding-footer">
                    ${this.currentStep > 0 ? `
                        <button class="btn-secondary" onclick="window.onboarding.previousStep()">
                            <i class="fas fa-arrow-left"></i>
                            Back
                        </button>
                    ` : '<div></div>'}

                    <button class="btn-primary" onclick="window.onboarding.nextStep()">
                        ${this.currentStep === this.totalSteps - 1 ? 'Get Started' : 'Next'}
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.attachStyles();
    }

    /**
     * Render current step
     */
    renderStep() {
        const steps = [
            this.renderWelcomeStep(),
            this.renderProfileStep(),
            this.renderGoalsStep(),
            this.renderQuickWinsStep()
        ];

        return steps[this.currentStep];
    }

    /**
     * Step 0: Welcome
     */
    renderWelcomeStep() {
        return `
            <div class="onboarding-step">
                <div class="onboarding-icon">
                    <i class="fas fa-rocket"></i>
                </div>
                <h2>Welcome to College Climb! 🎉</h2>
                <p class="onboarding-subtitle">Your AI-powered college application assistant</p>

                <div class="onboarding-features">
                    <div class="onboarding-feature">
                        <i class="fas fa-robot"></i>
                        <h3>AI Essay Coach</h3>
                        <p>Get instant feedback on your essays</p>
                    </div>
                    <div class="onboarding-feature">
                        <i class="fas fa-calendar-check"></i>
                        <h3>Smart Timeline</h3>
                        <p>Never miss a deadline</p>
                    </div>
                    <div class="onboarding-feature">
                        <i class="fas fa-university"></i>
                        <h3>School Matching</h3>
                        <p>Find your perfect fit schools</p>
                    </div>
                    <div class="onboarding-feature">
                        <i class="fas fa-trophy"></i>
                        <h3>Scholarships</h3>
                        <p>Discover funding opportunities</p>
                    </div>
                </div>

                <p class="onboarding-note">
                    This quick setup takes just 2 minutes and will help us personalize your experience.
                </p>
            </div>
        `;
    }

    /**
     * Step 1: Profile
     */
    renderProfileStep() {
        return `
            <div class="onboarding-step">
                <div class="onboarding-icon">
                    <i class="fas fa-user-graduate"></i>
                </div>
                <h2>Tell us about yourself</h2>
                <p class="onboarding-subtitle">This helps us give you personalized recommendations</p>

                <form class="onboarding-form" id="profileForm">
                    <div class="form-group">
                        <label>Graduation Year *</label>
                        <select id="gradYear" required>
                            <option value="">Select year</option>
                            <option value="2025">2025 (Current Senior)</option>
                            <option value="2026">2026 (Current Junior)</option>
                            <option value="2027">2027 (Current Sophomore)</option>
                            <option value="2028">2028 (Current Freshman)</option>
                        </select>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>GPA (Optional)</label>
                            <input type="number" id="gpa" step="0.01" min="0" max="5" placeholder="3.8">
                        </div>
                        <div class="form-group">
                            <label>SAT/ACT (Optional)</label>
                            <input type="number" id="testScore" placeholder="1450">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Intended Major (Optional)</label>
                        <input type="text" id="intendedMajor" placeholder="e.g., Computer Science">
                    </div>
                </form>
            </div>
        `;
    }

    /**
     * Step 2: Goals
     */
    renderGoalsStep() {
        return `
            <div class="onboarding-step">
                <div class="onboarding-icon">
                    <i class="fas fa-bullseye"></i>
                </div>
                <h2>What are your goals?</h2>
                <p class="onboarding-subtitle">Select all that apply</p>

                <div class="onboarding-goals">
                    <label class="goal-option">
                        <input type="checkbox" name="goal" value="get_into_dream_school">
                        <div class="goal-card">
                            <i class="fas fa-star"></i>
                            <span>Get into my dream school</span>
                        </div>
                    </label>

                    <label class="goal-option">
                        <input type="checkbox" name="goal" value="improve_essays" checked>
                        <div class="goal-card">
                            <i class="fas fa-pen-fancy"></i>
                            <span>Write better essays</span>
                        </div>
                    </label>

                    <label class="goal-option">
                        <input type="checkbox" name="goal" value="find_scholarships">
                        <div class="goal-card">
                            <i class="fas fa-dollar-sign"></i>
                            <span>Find scholarships</span>
                        </div>
                    </label>

                    <label class="goal-option">
                        <input type="checkbox" name="goal" value="stay_organized" checked>
                        <div class="goal-card">
                            <i class="fas fa-tasks"></i>
                            <span>Stay organized</span>
                        </div>
                    </label>

                    <label class="goal-option">
                        <input type="checkbox" name="goal" value="improve_test_scores">
                        <div class="goal-card">
                            <i class="fas fa-chart-line"></i>
                            <span>Improve test scores</span>
                        </div>
                    </label>

                    <label class="goal-option">
                        <input type="checkbox" name="goal" value="discover_schools">
                        <div class="goal-card">
                            <i class="fas fa-search"></i>
                            <span>Discover new schools</span>
                        </div>
                    </label>
                </div>
            </div>
        `;
    }

    /**
     * Step 3: Quick Wins
     */
    renderQuickWinsStep() {
        return `
            <div class="onboarding-step">
                <div class="onboarding-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>You're all set! 🎊</h2>
                <p class="onboarding-subtitle">We've added sample data to help you explore. Here's what you can do next:</p>

                <div class="quick-wins">
                    <div class="quick-win">
                        <div class="quick-win-icon">
                            <i class="fas fa-graduation-cap"></i>
                        </div>
                        <div class="quick-win-content">
                            <h3>Track Applications</h3>
                            <p>We've added 3 sample applications. Click any stat card to manage them.</p>
                        </div>
                    </div>

                    <div class="quick-win">
                        <div class="quick-win-icon">
                            <i class="fas fa-tasks"></i>
                        </div>
                        <div class="quick-win-content">
                            <h3>View Your Tasks</h3>
                            <p>Check your to-do list in the sidebar and start checking things off!</p>
                        </div>
                    </div>

                    <div class="quick-win">
                        <div class="quick-win-icon">
                            <i class="fas fa-university"></i>
                        </div>
                        <div class="quick-win-content">
                            <h3>Explore Schools</h3>
                            <p>View AI-matched schools based on your profile.</p>
                        </div>
                    </div>

                    <div class="quick-win">
                        <div class="quick-win-icon">
                            <i class="fas fa-pen-fancy"></i>
                        </div>
                        <div class="quick-win-content">
                            <h3>Start Writing</h3>
                            <p>Visit the Essay Coach to get AI feedback on your essays.</p>
                        </div>
                    </div>
                </div>

                <div class="onboarding-cta">
                    <p><strong>Pro tip:</strong> Sample data can be edited or deleted at any time.</p>
                </div>
            </div>
        `;
    }

    /**
     * Next step
     */
    async nextStep() {
        // Validate current step
        if (!this.validateStep()) {
            return;
        }

        // Save data from current step
        await this.saveStepData();

        // Move to next step
        this.currentStep++;

        if (this.currentStep >= this.totalSteps) {
            await this.completeOnboarding();
        } else {
            this.updateModal();
        }
    }

    /**
     * Previous step
     */
    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateModal();
        }
    }

    /**
     * Validate current step
     */
    validateStep() {
        if (this.currentStep === 1) {
            const gradYear = document.getElementById('gradYear').value;
            if (!gradYear) {
                if (typeof showToast === 'function') {
                    showToast('Please select your graduation year', 'error');
                }
                return false;
            }
        }
        return true;
    }

    /**
     * Save data from current step
     */
    async saveStepData() {
        try {
            const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js');

            if (this.currentStep === 1) {
                // Save profile data
                const profileData = {
                    graduationYear: document.getElementById('gradYear').value,
                    gpa: parseFloat(document.getElementById('gpa').value) || null,
                    testScore: parseInt(document.getElementById('testScore').value) || null,
                    intendedMajor: document.getElementById('intendedMajor').value || null
                };

                await updateDoc(doc(this.db, 'users', this.userId), profileData);
            } else if (this.currentStep === 2) {
                // Save goals
                const goals = Array.from(document.querySelectorAll('input[name="goal"]:checked'))
                    .map(input => input.value);

                await updateDoc(doc(this.db, 'users', this.userId), { goals });
            }
        } catch (error) {
            console.error('Error saving step data:', error);
        }
    }

    /**
     * Complete onboarding
     */
    async completeOnboarding() {
        try {
            // Mark onboarding as complete
            const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js');
            await updateDoc(doc(this.db, 'users', this.userId), {
                onboardingCompleted: true,
                onboardingCompletedAt: new Date()
            });

            // Generate sample data
            const sampleDataGen = new SampleDataGenerator(this.db, this.userId);
            await sampleDataGen.generateSampleData();

            // Close onboarding
            const modal = document.getElementById('onboardingModal');
            if (modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }

            // Reload dashboard
            if (window.dashboardLoader) {
                await window.dashboardLoader.refresh();
            }

            // Show sample data banner
            sampleDataGen.showSampleDataBanner();

            if (typeof showToast === 'function') {
                showToast('Welcome to College Climb! Let\'s get started.', 'success', 3000);
            }
        } catch (error) {
            console.error('Error completing onboarding:', error);
            if (typeof showToast === 'function') {
                showToast('Setup complete! Refreshing dashboard...', 'success');
            }
            setTimeout(() => window.location.reload(), 1500);
        }
    }

    /**
     * Update modal content
     */
    updateModal() {
        const body = document.getElementById('onboardingBody');
        const progressFill = document.querySelector('.onboarding-progress-fill');
        const progressText = document.querySelector('.onboarding-progress-text');
        const footer = document.querySelector('.onboarding-footer');

        if (body) {
            body.style.opacity = '0';
            setTimeout(() => {
                body.innerHTML = this.renderStep();
                body.style.opacity = '1';
            }, 200);
        }

        if (progressFill) {
            progressFill.style.width = `${(this.currentStep / this.totalSteps) * 100}%`;
        }

        if (progressText) {
            progressText.textContent = `Step ${this.currentStep + 1} of ${this.totalSteps}`;
        }

        if (footer) {
            footer.innerHTML = `
                ${this.currentStep > 0 ? `
                    <button class="btn-secondary" onclick="window.onboarding.previousStep()">
                        <i class="fas fa-arrow-left"></i>
                        Back
                    </button>
                ` : '<div></div>'}

                <button class="btn-primary" onclick="window.onboarding.nextStep()">
                    ${this.currentStep === this.totalSteps - 1 ? 'Get Started' : 'Next'}
                    <i class="fas fa-arrow-right"></i>
                </button>
            `;
        }
    }

    /**
     * Attach styles
     */
    attachStyles() {
        if (document.getElementById('onboardingStyles')) return;

        const style = document.createElement('style');
        style.id = 'onboardingStyles';
        style.textContent = `
            .onboarding-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 100000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .onboarding-modal.show {
                opacity: 1;
                visibility: visible;
            }

            .onboarding-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(8px);
            }

            .onboarding-content {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 90%;
                max-width: 700px;
                max-height: 90vh;
                background: var(--primary-bg);
                border-radius: 24px;
                box-shadow: 0 25px 100px rgba(0, 0, 0, 0.5);
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .onboarding-progress {
                padding: 1.5rem 2rem;
                background: var(--secondary-bg);
                border-bottom: 1px solid rgba(160, 123, 204, 0.1);
            }

            .onboarding-progress-bar {
                width: 100%;
                height: 8px;
                background: rgba(160, 123, 204, 0.2);
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 0.75rem;
            }

            .onboarding-progress-fill {
                height: 100%;
                background: var(--gradient);
                border-radius: 4px;
                transition: width 0.5s ease;
            }

            .onboarding-progress-text {
                text-align: center;
                font-size: 0.9rem;
                font-weight: 600;
                color: var(--text-secondary);
            }

            .onboarding-body {
                padding: 2rem;
                overflow-y: auto;
                flex: 1;
                transition: opacity 0.2s ease;
            }

            .onboarding-step {
                text-align: center;
            }

            .onboarding-icon {
                width: 80px;
                height: 80px;
                margin: 0 auto 1.5rem;
                background: var(--gradient);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2.5rem;
                color: white;
                box-shadow: 0 8px 25px rgba(160, 123, 204, 0.3);
            }

            .onboarding-step h2 {
                font-size: 2rem;
                font-weight: 800;
                margin-bottom: 0.5rem;
                color: var(--text-primary);
            }

            .onboarding-subtitle {
                font-size: 1.1rem;
                color: var(--text-secondary);
                margin-bottom: 2rem;
            }

            .onboarding-features {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1.5rem;
                margin: 2rem 0;
            }

            .onboarding-feature {
                text-align: center;
                padding: 1.5rem;
                background: var(--secondary-bg);
                border-radius: 16px;
                border: 2px solid rgba(160, 123, 204, 0.1);
                transition: all 0.3s ease;
            }

            .onboarding-feature:hover {
                border-color: var(--accent-color);
                transform: translateY(-4px);
            }

            .onboarding-feature i {
                font-size: 2rem;
                color: var(--accent-color);
                margin-bottom: 0.75rem;
            }

            .onboarding-feature h3 {
                font-size: 1.1rem;
                font-weight: 700;
                margin-bottom: 0.5rem;
                color: var(--text-primary);
            }

            .onboarding-feature p {
                font-size: 0.9rem;
                color: var(--text-secondary);
                margin: 0;
            }

            .onboarding-note {
                margin-top: 2rem;
                padding: 1rem;
                background: var(--secondary-bg);
                border-radius: 12px;
                color: var(--text-secondary);
                font-size: 0.95rem;
            }

            .onboarding-form {
                text-align: left;
                margin-top: 2rem;
            }

            .onboarding-goals {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-top: 2rem;
            }

            .goal-option {
                cursor: pointer;
            }

            .goal-option input {
                display: none;
            }

            .goal-card {
                padding: 1.5rem;
                background: var(--secondary-bg);
                border: 2px solid rgba(160, 123, 204, 0.1);
                border-radius: 12px;
                text-align: center;
                transition: all 0.3s ease;
            }

            .goal-option input:checked + .goal-card {
                background: var(--gradient);
                color: white;
                border-color: transparent;
            }

            .goal-card:hover {
                border-color: var(--accent-color);
                transform: translateY(-4px);
            }

            .goal-card i {
                font-size: 2rem;
                margin-bottom: 0.75rem;
                display: block;
            }

            .goal-card span {
                font-weight: 600;
                font-size: 0.95rem;
            }

            .quick-wins {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                margin-top: 2rem;
                text-align: left;
            }

            .quick-win {
                display: flex;
                gap: 1rem;
                padding: 1rem;
                background: var(--secondary-bg);
                border-radius: 12px;
                border: 2px solid rgba(160, 123, 204, 0.1);
                transition: all 0.3s ease;
            }

            .quick-win:hover {
                border-color: var(--accent-color);
                transform: translateX(8px);
            }

            .quick-win-icon {
                width: 50px;
                height: 50px;
                background: var(--gradient);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1.5rem;
                flex-shrink: 0;
            }

            .quick-win-content h3 {
                font-size: 1.1rem;
                font-weight: 700;
                margin: 0 0 0.25rem 0;
                color: var(--text-primary);
            }

            .quick-win-content p {
                font-size: 0.9rem;
                color: var(--text-secondary);
                margin: 0;
            }

            .onboarding-cta {
                margin-top: 2rem;
                padding: 1rem;
                background: rgba(160, 123, 204, 0.1);
                border-radius: 12px;
                text-align: center;
            }

            .onboarding-cta p {
                margin: 0;
                color: var(--text-primary);
            }

            .onboarding-footer {
                padding: 1.5rem 2rem;
                background: var(--secondary-bg);
                border-top: 1px solid rgba(160, 123, 204, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1rem;
            }

            @media (max-width: 768px) {
                .onboarding-content {
                    width: 100%;
                    max-width: 100%;
                    border-radius: 0;
                    max-height: 100vh;
                }

                .onboarding-features,
                .onboarding-goals {
                    grid-template-columns: 1fr;
                }

                .onboarding-footer {
                    flex-direction: column-reverse;
                }

                .onboarding-footer button {
                    width: 100%;
                }
            }
        `;

        document.head.appendChild(style);
    }
}

// Export to global scope
window.OnboardingFlow = OnboardingFlow;

console.log('📦 Onboarding Flow loaded');
