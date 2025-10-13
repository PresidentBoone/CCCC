/**
 * 🎉 MILESTONE CELEBRATION SYSTEM
 * Billion-Dollar Feature: Celebrate user achievements in real-time
 * 
 * This system creates memorable moments that keep users engaged and motivated
 */

class MilestoneCelebration {
    constructor() {
        this.celebrationQueue = [];
        this.isShowing = false;
        this.celebratedMilestones = this.loadCelebrated();
    }

    /**
     * Initialize celebration system
     */
    initialize(userId) {
        this.userId = userId;
        this.loadCelebrated();
        console.log('🎉 Milestone Celebration System initialized');
    }

    /**
     * Check and trigger celebrations
     */
    async checkMilestones(userProfile) {
        const celebrations = [];

        // Profile Milestones
        if (userProfile.profileCompleteness === 100 && !this.hasCelebrated('profile-complete')) {
            celebrations.push({
                id: 'profile-complete',
                type: 'achievement',
                title: '✨ Profile Complete!',
                message: 'Now we can find your perfect college matches!',
                icon: '🎉',
                color: 'purple',
                action: { text: 'Explore Colleges', link: '/discovery.html' }
            });
        }

        // First Essay
        if (userProfile.essayCount === 1 && !this.hasCelebrated('first-essay')) {
            celebrations.push({
                id: 'first-essay',
                type: 'achievement',
                title: '🎊 First Essay Complete!',
                message: 'Every great application starts with one essay. You\'re on your way!',
                icon: '✍️',
                color: 'blue',
                action: { text: 'Write Another', link: '/essaycoach.html' }
            });
        }

        // Essay Milestone - 5 essays
        if (userProfile.essayCount === 5 && !this.hasCelebrated('five-essays')) {
            celebrations.push({
                id: 'five-essays',
                type: 'achievement',
                title: '💪 Five Essays Strong!',
                message: 'You\'re building an impressive essay portfolio!',
                icon: '📝',
                color: 'green'
            });
        }

        // High Essay Score
        if (userProfile.highestEssayScore >= 9 && !this.hasCelebrated('high-essay-score')) {
            celebrations.push({
                id: 'high-essay-score',
                type: 'achievement',
                title: '🌟 Outstanding Essay!',
                message: 'Your latest essay scored 9+/10! That\'s exceptional!',
                icon: '⭐',
                color: 'gold'
            });
        }

        // Test Prep Milestones
        if (userProfile.testPrepQuestionsAnswered >= 50 && !this.hasCelebrated('fifty-questions')) {
            celebrations.push({
                id: 'fifty-questions',
                type: 'achievement',
                title: '🎯 50 Questions Mastered!',
                message: 'Your dedication to test prep is impressive!',
                icon: '💯',
                color: 'orange'
            });
        }

        if (userProfile.testPrepQuestionsAnswered >= 100 && !this.hasCelebrated('hundred-questions')) {
            celebrations.push({
                id: 'hundred-questions',
                type: 'achievement',
                title: '🏆 Century Club!',
                message: '100 practice questions completed! You\'re a test prep champion!',
                icon: '💪',
                color: 'red',
                confetti: true
            });
        }

        // Score Improvement
        if (userProfile.testScoreImprovement >= 100 && !this.hasCelebrated('score-improvement-100')) {
            celebrations.push({
                id: 'score-improvement-100',
                type: 'achievement',
                title: '📈 100+ Point Improvement!',
                message: 'Your hard work is paying off! Keep it up!',
                icon: '🚀',
                color: 'purple',
                confetti: true
            });
        }

        // Application Milestones
        if (userProfile.applicationCount === 1 && !this.hasCelebrated('first-application')) {
            celebrations.push({
                id: 'first-application',
                type: 'achievement',
                title: '🎓 First Application Started!',
                message: 'This is the beginning of something amazing!',
                icon: '✨',
                color: 'blue'
            });
        }

        if (userProfile.submittedApplications === 1 && !this.hasCelebrated('first-submission')) {
            celebrations.push({
                id: 'first-submission',
                type: 'achievement',
                title: '🚀 First Application Submitted!',
                message: 'This is HUGE! You did it! Keep the momentum going!',
                icon: '🎉',
                color: 'green',
                confetti: true,
                action: { text: 'View Status', link: '/adaptive-timeline.html' }
            });
        }

        // Scholarship Milestones
        if (userProfile.scholarshipsViewed >= 20 && !this.hasCelebrated('scholarship-explorer')) {
            celebrations.push({
                id: 'scholarship-explorer',
                type: 'achievement',
                title: '💰 Scholarship Explorer!',
                message: 'You\'ve viewed 20+ scholarships. That\'s smart planning!',
                icon: '🔍',
                color: 'gold'
            });
        }

        if (userProfile.scholarshipsApplied >= 5 && !this.hasCelebrated('five-scholarships')) {
            celebrations.push({
                id: 'five-scholarships',
                type: 'achievement',
                title: '💸 5 Scholarship Applications!',
                message: 'Every application brings you closer to funding your dreams!',
                icon: '🏆',
                color: 'gold'
            });
        }

        // Streak Milestones
        if (userProfile.loginStreak >= 7 && !this.hasCelebrated('week-streak')) {
            celebrations.push({
                id: 'week-streak',
                type: 'achievement',
                title: '🔥 7-Day Streak!',
                message: 'Consistency is key to success. Keep it up!',
                icon: '⚡',
                color: 'orange'
            });
        }

        if (userProfile.loginStreak >= 30 && !this.hasCelebrated('month-streak')) {
            celebrations.push({
                id: 'month-streak',
                type: 'achievement',
                title: '🔥 30-Day Streak!',
                message: 'A whole month of dedication! You\'re unstoppable!',
                icon: '🏅',
                color: 'red',
                confetti: true
            });
        }

        // Queue celebrations
        celebrations.forEach(celebration => this.queueCelebration(celebration));

        // Show next celebration if any
        if (celebrations.length > 0 && !this.isShowing) {
            this.showNextCelebration();
        }
    }

    /**
     * Queue a celebration
     */
    queueCelebration(celebration) {
        this.celebrationQueue.push(celebration);
    }

    /**
     * Show next celebration in queue
     */
    async showNextCelebration() {
        if (this.celebrationQueue.length === 0 || this.isShowing) return;

        this.isShowing = true;
        const celebration = this.celebrationQueue.shift();

        // Create celebration modal
        this.displayCelebration(celebration);

        // Mark as celebrated
        this.markCelebrated(celebration.id);

        // Show confetti if applicable
        if (celebration.confetti) {
            this.showConfetti();
        }
    }

    /**
     * Display celebration modal
     */
    displayCelebration(celebration) {
        // Create modal HTML
        const modal = document.createElement('div');
        modal.className = 'celebration-modal';
        modal.innerHTML = `
            <div class="celebration-overlay" onclick="this.parentElement.remove(); window.milestoneCelebration.isShowing = false; window.milestoneCelebration.showNextCelebration();"></div>
            <div class="celebration-card ${celebration.color}">
                <div class="celebration-icon">${celebration.icon}</div>
                <h2 class="celebration-title">${celebration.title}</h2>
                <p class="celebration-message">${celebration.message}</p>
                ${celebration.action ? `
                    <a href="${celebration.action.link}" class="celebration-action">
                        ${celebration.action.text}
                    </a>
                ` : ''}
                <button class="celebration-close" onclick="this.closest('.celebration-modal').remove(); window.milestoneCelebration.isShowing = false; window.milestoneCelebration.showNextCelebration();">
                    Continue
                </button>
            </div>
        `;

        // Add styles if not already present
        if (!document.getElementById('celebration-styles')) {
            const styles = document.createElement('style');
            styles.id = 'celebration-styles';
            styles.textContent = `
                .celebration-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.3s ease;
                }

                .celebration-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                }

                .celebration-card {
                    position: relative;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 24px;
                    padding: 3rem 2rem;
                    max-width: 500px;
                    width: 90%;
                    text-align: center;
                    color: white;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    animation: slideUp 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }

                .celebration-card.blue {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                .celebration-card.purple {
                    background: linear-gradient(135deg, #a07bcc 0%, #2a357a 100%);
                }

                .celebration-card.green {
                    background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
                }

                .celebration-card.gold {
                    background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%);
                }

                .celebration-card.orange {
                    background: linear-gradient(135deg, #ff6a00 0%, #ee0979 100%);
                }

                .celebration-card.red {
                    background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
                }

                .celebration-icon {
                    font-size: 5rem;
                    margin-bottom: 1rem;
                    animation: bounce 1s ease infinite;
                }

                .celebration-title {
                    font-size: 2rem;
                    font-weight: 800;
                    margin-bottom: 1rem;
                }

                .celebration-message {
                    font-size: 1.1rem;
                    opacity: 0.95;
                    margin-bottom: 2rem;
                    line-height: 1.6;
                }

                .celebration-action {
                    display: inline-block;
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    padding: 0.8rem 2rem;
                    border-radius: 12px;
                    text-decoration: none;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    transition: all 0.3s ease;
                }

                .celebration-action:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: translateY(-2px);
                }

                .celebration-close {
                    background: rgba(255, 255, 255, 0.9);
                    color: #333;
                    border: none;
                    padding: 0.8rem 2rem;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .celebration-close:hover {
                    background: white;
                    transform: translateY(-2px);
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(50px) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `;
            document.head.appendChild(styles);
        }

        // Add to DOM
        document.body.appendChild(modal);

        // Auto-close after 10 seconds if user doesn't interact
        setTimeout(() => {
            if (document.body.contains(modal)) {
                modal.remove();
                this.isShowing = false;
                this.showNextCelebration();
            }
        }, 10000);
    }

    /**
     * Show confetti animation
     */
    showConfetti() {
        // Simple confetti implementation
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        const confettiCount = 50;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.zIndex = '9999';
            confetti.style.borderRadius = '50%';
            confetti.style.pointerEvents = 'none';

            document.body.appendChild(confetti);

            // Animate
            const duration = 2000 + Math.random() * 1000;
            const animation = confetti.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${window.innerHeight + 50}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: duration,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });

            animation.onfinish = () => confetti.remove();
        }
    }

    /**
     * Check if milestone was celebrated
     */
    hasCelebrated(milestoneId) {
        return this.celebratedMilestones.includes(milestoneId);
    }

    /**
     * Mark milestone as celebrated
     */
    markCelebrated(milestoneId) {
        if (!this.celebratedMilestones.includes(milestoneId)) {
            this.celebratedMilestones.push(milestoneId);
            this.saveCelebrated();
        }
    }

    /**
     * Load celebrated milestones from storage
     */
    loadCelebrated() {
        try {
            const stored = localStorage.getItem(`celebrated_${this.userId}`);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }

    /**
     * Save celebrated milestones to storage
     */
    saveCelebrated() {
        try {
            localStorage.setItem(`celebrated_${this.userId}`, JSON.stringify(this.celebratedMilestones));
        } catch (e) {
            console.error('Failed to save celebrated milestones:', e);
        }
    }
}

// Export for global use
if (typeof window !== 'undefined') {
    window.MilestoneCelebration = MilestoneCelebration;
    window.milestoneCelebration = new MilestoneCelebration();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MilestoneCelebration;
}
