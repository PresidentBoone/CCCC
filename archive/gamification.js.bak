/**
 * Gamification System
 * Achievement badges, progress tracking, and motivational rewards
 */

class Gamification {
    constructor(db, userId, userData) {
        this.db = db;
        this.userId = userId;
        this.userData = userData;
        this.achievements = [];
        this.unlockedAchievements = [];
        this.stats = {};
        this.achievementsPanel = null;
        this.progressBar = null;
    }

    async initialize() {
        console.log('🎮 Initializing Gamification System...');

        // Define all achievements
        this.defineAchievements();

        // Load user stats
        await this.loadUserStats();

        // Check unlocked achievements
        await this.checkAchievements();

        // Create UI elements
        this.createGamificationUI();

        // Update displays
        this.updateProgressDisplay();

        console.log('✅ Gamification initialized with', this.unlockedAchievements.length, 'achievements unlocked');
    }

    defineAchievements() {
        this.achievements = [
            // Application Tracking Achievements
            {
                id: 'first-app',
                name: 'Getting Started',
                description: 'Track your first college application',
                icon: '🎯',
                category: 'applications',
                requirement: (stats) => stats.applicationsTracked >= 1,
                points: 10
            },
            {
                id: 'five-apps',
                name: 'Building Your List',
                description: 'Track 5 college applications',
                icon: '📚',
                category: 'applications',
                requirement: (stats) => stats.applicationsTracked >= 5,
                points: 25
            },
            {
                id: 'ten-apps',
                name: 'College Expert',
                description: 'Track 10 college applications',
                icon: '🏆',
                category: 'applications',
                requirement: (stats) => stats.applicationsTracked >= 10,
                points: 50
            },
            {
                id: 'first-submission',
                name: 'First Submission',
                description: 'Submit your first college application',
                icon: '🚀',
                category: 'applications',
                requirement: (stats) => stats.applicationsSubmitted >= 1,
                points: 30
            },
            {
                id: 'five-submissions',
                name: 'Application Warrior',
                description: 'Submit 5 college applications',
                icon: '⚔️',
                category: 'applications',
                requirement: (stats) => stats.applicationsSubmitted >= 5,
                points: 75
            },

            // Essay Achievements
            {
                id: 'first-essay',
                name: 'Storyteller',
                description: 'Write your first college essay',
                icon: '✍️',
                category: 'essays',
                requirement: (stats) => stats.essaysWritten >= 1,
                points: 15
            },
            {
                id: 'essay-master',
                name: 'Essay Master',
                description: 'Write 5 college essays',
                icon: '📝',
                category: 'essays',
                requirement: (stats) => stats.essaysWritten >= 5,
                points: 40
            },
            {
                id: 'polished-essay',
                name: 'Polished Writer',
                description: 'Get AI review on 3 essays',
                icon: '✨',
                category: 'essays',
                requirement: (stats) => stats.essaysReviewed >= 3,
                points: 35
            },

            // Test Prep Achievements
            {
                id: 'first-practice',
                name: 'Practice Makes Perfect',
                description: 'Complete your first practice test',
                icon: '📊',
                category: 'testprep',
                requirement: (stats) => stats.practiceTests >= 1,
                points: 20
            },
            {
                id: 'score-improvement',
                name: 'Rising Star',
                description: 'Improve test score by 100+ points',
                icon: '📈',
                category: 'testprep',
                requirement: (stats) => stats.scoreImprovement >= 100,
                points: 50
            },
            {
                id: 'high-score',
                name: 'Academic Excellence',
                description: 'Achieve 1400+ SAT or 30+ ACT',
                icon: '🌟',
                category: 'testprep',
                requirement: (stats) => stats.highestScore >= 1400,
                points: 60
            },

            // Scholarship Achievements
            {
                id: 'scholarship-hunter',
                name: 'Scholarship Hunter',
                description: 'Apply to your first scholarship',
                icon: '💰',
                category: 'scholarships',
                requirement: (stats) => stats.scholarshipsApplied >= 1,
                points: 20
            },
            {
                id: 'scholarship-pro',
                name: 'Money Maker',
                description: 'Apply to 10 scholarships',
                icon: '💵',
                category: 'scholarships',
                requirement: (stats) => stats.scholarshipsApplied >= 10,
                points: 75
            },
            {
                id: 'scholarship-winner',
                name: 'Winner Winner!',
                description: 'Win your first scholarship',
                icon: '🎊',
                category: 'scholarships',
                requirement: (stats) => stats.scholarshipsWon >= 1,
                points: 100
            },

            // Engagement Achievements
            {
                id: 'early-bird',
                name: 'Early Bird',
                description: 'Start your college journey',
                icon: '🌅',
                category: 'engagement',
                requirement: (stats) => stats.accountAge >= 1,
                points: 5
            },
            {
                id: 'week-streak',
                name: 'Week Warrior',
                description: 'Log in 7 days in a row',
                icon: '🔥',
                category: 'engagement',
                requirement: (stats) => stats.loginStreak >= 7,
                points: 30
            },
            {
                id: 'month-streak',
                name: 'Dedicated Student',
                description: 'Log in 30 days in a row',
                icon: '💪',
                category: 'engagement',
                requirement: (stats) => stats.loginStreak >= 30,
                points: 100
            },
            {
                id: 'profile-complete',
                name: 'Profile Pro',
                description: 'Complete your full profile',
                icon: '👤',
                category: 'engagement',
                requirement: (stats) => stats.profileComplete === true,
                points: 25
            },

            // Special Achievements
            {
                id: 'overachiever',
                name: 'Overachiever',
                description: 'Earn 500 total points',
                icon: '🏅',
                category: 'special',
                requirement: (stats) => stats.totalPoints >= 500,
                points: 50
            },
            {
                id: 'college-climb-champion',
                name: 'College Climb Champion',
                description: 'Unlock 15 achievements',
                icon: '👑',
                category: 'special',
                requirement: (stats) => stats.achievementsUnlocked >= 15,
                points: 100
            }
        ];
    }

    async loadUserStats() {
        try {
            const { collection, query, where, getDocs, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

            // Get applications
            const appsRef = collection(this.db, 'users', this.userId, 'applications');
            const appsSnapshot = await getDocs(appsRef);

            let applicationsSubmitted = 0;
            appsSnapshot.forEach(doc => {
                if (doc.data().status === 'submitted' || doc.data().status === 'accepted' || doc.data().status === 'denied') {
                    applicationsSubmitted++;
                }
            });

            // Get essays
            const essaysRef = collection(this.db, 'users', this.userId, 'essays');
            const essaysSnapshot = await getDocs(essaysRef);

            let essaysReviewed = 0;
            essaysSnapshot.forEach(doc => {
                if (doc.data().reviewed) {
                    essaysReviewed++;
                }
            });

            // Get scholarships
            const scholarshipsRef = collection(this.db, 'users', this.userId, 'scholarships');
            const scholarshipsSnapshot = await getDocs(scholarshipsRef);

            let scholarshipsWon = 0;
            scholarshipsSnapshot.forEach(doc => {
                if (doc.data().status === 'won' || doc.data().status === 'awarded') {
                    scholarshipsWon++;
                }
            });

            // Get test scores
            const testScoresRef = collection(this.db, 'users', this.userId, 'testScores');
            const testScoresSnapshot = await getDocs(testScoresRef);

            let highestScore = this.userData.satScore || 0;
            let lowestScore = this.userData.satScore || 0;
            let practiceTests = testScoresSnapshot.size;

            testScoresSnapshot.forEach(doc => {
                const score = doc.data().score || 0;
                if (score > highestScore) highestScore = score;
                if (lowestScore === 0 || score < lowestScore) lowestScore = score;
            });

            const scoreImprovement = lowestScore > 0 ? highestScore - lowestScore : 0;

            // Check profile completion
            const requiredFields = ['gpa', 'satScore', 'intendedMajor', 'academicInterests', 'graduationYear'];
            const profileComplete = requiredFields.every(field =>
                this.userData[field] &&
                (typeof this.userData[field] !== 'object' ||
                 (Array.isArray(this.userData[field]) && this.userData[field].length > 0))
            );

            // Calculate account age (in days)
            const accountAge = this.userData.createdAt ?
                Math.floor((Date.now() - this.userData.createdAt.toDate().getTime()) / (1000 * 60 * 60 * 24)) : 0;

            // Get gamification data
            const gamificationRef = doc(this.db, 'users', this.userId, 'gamification', 'stats');
            const gamificationDoc = await getDoc(gamificationRef);
            const gamificationData = gamificationDoc.exists() ? gamificationDoc.data() : {};

            this.stats = {
                applicationsTracked: appsSnapshot.size,
                applicationsSubmitted,
                essaysWritten: essaysSnapshot.size,
                essaysReviewed,
                scholarshipsApplied: scholarshipsSnapshot.size,
                scholarshipsWon,
                practiceTests,
                scoreImprovement,
                highestScore,
                profileComplete,
                accountAge,
                loginStreak: gamificationData.loginStreak || 0,
                totalPoints: gamificationData.totalPoints || 0,
                achievementsUnlocked: gamificationData.achievementsUnlocked || 0
            };

        } catch (error) {
            console.error('Error loading user stats:', error);
            this.stats = {
                applicationsTracked: 0,
                applicationsSubmitted: 0,
                essaysWritten: 0,
                essaysReviewed: 0,
                scholarshipsApplied: 0,
                scholarshipsWon: 0,
                practiceTests: 0,
                scoreImprovement: 0,
                highestScore: 0,
                profileComplete: false,
                accountAge: 0,
                loginStreak: 0,
                totalPoints: 0,
                achievementsUnlocked: 0
            };
        }
    }

    async checkAchievements() {
        try {
            const { doc, getDoc, setDoc } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

            // Load previously unlocked achievements
            const achievementsRef = doc(this.db, 'users', this.userId, 'gamification', 'achievements');
            const achievementsDoc = await getDoc(achievementsRef);
            const savedAchievements = achievementsDoc.exists() ? achievementsDoc.data().unlocked || [] : [];

            const newlyUnlocked = [];

            // Check each achievement
            this.achievements.forEach(achievement => {
                const alreadyUnlocked = savedAchievements.includes(achievement.id);
                const meetsRequirement = achievement.requirement(this.stats);

                if (meetsRequirement) {
                    this.unlockedAchievements.push(achievement);

                    if (!alreadyUnlocked) {
                        newlyUnlocked.push(achievement);
                    }
                }
            });

            // Update stats
            this.stats.achievementsUnlocked = this.unlockedAchievements.length;
            this.stats.totalPoints = this.unlockedAchievements.reduce((sum, ach) => sum + ach.points, 0);

            // Save to Firestore if there are new achievements
            if (newlyUnlocked.length > 0) {
                await setDoc(achievementsRef, {
                    unlocked: this.unlockedAchievements.map(a => a.id),
                    lastUpdated: new Date()
                });

                const statsRef = doc(this.db, 'users', this.userId, 'gamification', 'stats');
                await setDoc(statsRef, {
                    totalPoints: this.stats.totalPoints,
                    achievementsUnlocked: this.stats.achievementsUnlocked,
                    lastUpdated: new Date()
                }, { merge: true });

                // Show notification for new achievements
                newlyUnlocked.forEach(achievement => {
                    this.showAchievementUnlocked(achievement);
                });
            }

        } catch (error) {
            console.error('Error checking achievements:', error);
        }
    }

    createGamificationUI() {
        // Add progress bar to navbar
        const navbar = document.querySelector('.cc-navbar');
        if (!navbar) return;

        // Create achievements button
        const achievementsBtn = document.createElement('button');
        achievementsBtn.className = 'achievements-button';
        achievementsBtn.setAttribute('aria-label', 'View achievements');
        achievementsBtn.innerHTML = `
            <i class="fas fa-trophy"></i>
            <span class="achievements-points">${this.stats.totalPoints}</span>
        `;
        achievementsBtn.onclick = () => this.openAchievementsPanel();

        // Insert before alerts button
        const alertsButton = document.querySelector('.smart-alerts-button');
        if (alertsButton) {
            navbar.insertBefore(achievementsBtn, alertsButton);
        }

        // Create achievements panel
        this.createAchievementsPanel();

        // Add styles
        this.addStyles();
    }

    createAchievementsPanel() {
        const panel = document.createElement('div');
        panel.className = 'achievements-panel';
        panel.id = 'achievementsPanel';
        panel.innerHTML = `
            <div class="achievements-panel-header">
                <div class="achievements-header-content">
                    <h3>🏆 Achievements</h3>
                    <div class="achievements-stats">
                        <span class="stat-item">
                            <i class="fas fa-trophy"></i>
                            ${this.unlockedAchievements.length}/${this.achievements.length}
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-star"></i>
                            ${this.stats.totalPoints} pts
                        </span>
                    </div>
                </div>
                <button class="achievements-close-btn" onclick="window.gamification.closeAchievementsPanel()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="achievements-panel-body" id="achievementsPanelBody">
                ${this.renderAchievementsList()}
            </div>
        `;

        document.body.appendChild(panel);
        this.achievementsPanel = panel;
    }

    renderAchievementsList() {
        const categories = {
            applications: 'College Applications',
            essays: 'Essay Writing',
            testprep: 'Test Preparation',
            scholarships: 'Scholarships',
            engagement: 'Engagement',
            special: 'Special'
        };

        let html = '';

        Object.entries(categories).forEach(([category, title]) => {
            const categoryAchievements = this.achievements.filter(a => a.category === category);

            html += `
                <div class="achievement-category">
                    <h4 class="category-title">${title}</h4>
                    <div class="achievements-grid">
                        ${categoryAchievements.map(achievement => this.renderAchievement(achievement)).join('')}
                    </div>
                </div>
            `;
        });

        return html;
    }

    renderAchievement(achievement) {
        const unlocked = this.unlockedAchievements.some(a => a.id === achievement.id);
        const progress = this.calculateProgress(achievement);

        return `
            <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-content">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                    <div class="achievement-points">
                        ${unlocked ? '✓' : ''} ${achievement.points} points
                    </div>
                    ${!unlocked && progress ? `<div class="achievement-progress">${progress}</div>` : ''}
                </div>
            </div>
        `;
    }

    calculateProgress(achievement) {
        // Try to show progress for locked achievements
        const id = achievement.id;

        if (id.includes('app')) {
            const target = parseInt(id.match(/\d+/)?.[0]) || 1;
            return `${this.stats.applicationsTracked}/${target} applications`;
        }
        if (id.includes('essay')) {
            const target = parseInt(id.match(/\d+/)?.[0]) || 1;
            return `${this.stats.essaysWritten}/${target} essays`;
        }
        if (id.includes('scholarship')) {
            const target = parseInt(id.match(/\d+/)?.[0]) || 1;
            return `${this.stats.scholarshipsApplied}/${target} scholarships`;
        }
        if (id === 'score-improvement') {
            return `+${this.stats.scoreImprovement}/100 points`;
        }
        if (id === 'high-score') {
            return `${this.stats.highestScore}/1400 score`;
        }
        if (id === 'week-streak') {
            return `${this.stats.loginStreak}/7 days`;
        }
        if (id === 'month-streak') {
            return `${this.stats.loginStreak}/30 days`;
        }

        return null;
    }

    showAchievementUnlocked(achievement) {
        // Create achievement notification
        const notification = document.createElement('div');
        notification.className = 'achievement-unlocked-notification';
        notification.innerHTML = `
            <div class="achievement-unlocked-content">
                <div class="achievement-unlocked-icon">${achievement.icon}</div>
                <div class="achievement-unlocked-text">
                    <div class="achievement-unlocked-title">Achievement Unlocked!</div>
                    <div class="achievement-unlocked-name">${achievement.name}</div>
                    <div class="achievement-unlocked-points">+${achievement.points} points</div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    updateProgressDisplay() {
        // Update points display
        const pointsDisplay = document.querySelector('.achievements-points');
        if (pointsDisplay) {
            pointsDisplay.textContent = this.stats.totalPoints;
        }
    }

    openAchievementsPanel() {
        if (this.achievementsPanel) {
            this.achievementsPanel.classList.add('open');
        }
    }

    closeAchievementsPanel() {
        if (this.achievementsPanel) {
            this.achievementsPanel.classList.remove('open');
        }
    }

    addStyles() {
        if (document.getElementById('gamification-styles')) return;

        const style = document.createElement('style');
        style.id = 'gamification-styles';
        style.textContent = `
            .achievements-button {
                position: relative;
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                border: none;
                color: white;
                font-size: 0.9rem;
                font-weight: 600;
                cursor: pointer;
                padding: 8px 15px;
                margin-right: 10px;
                border-radius: 20px;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 6px;
                box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
            }

            .achievements-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
            }

            .achievements-points {
                font-size: 0.85rem;
            }

            .achievements-panel {
                position: fixed;
                top: 0;
                right: -500px;
                width: 500px;
                height: 100vh;
                background: var(--surface-primary);
                box-shadow: -4px 0 20px rgba(0,0,0,0.2);
                z-index: 10001;
                transition: right 0.3s ease;
                display: flex;
                flex-direction: column;
            }

            .achievements-panel.open {
                right: 0;
            }

            .achievements-panel-header {
                padding: 20px;
                border-bottom: 1px solid var(--border-color);
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .achievements-header-content h3 {
                margin: 0 0 10px 0;
                font-size: 1.4rem;
            }

            .achievements-stats {
                display: flex;
                gap: 15px;
                font-size: 0.9rem;
                opacity: 0.95;
            }

            .stat-item {
                display: flex;
                align-items: center;
                gap: 5px;
            }

            .achievements-close-btn {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 8px 12px;
                border-radius: 8px;
                transition: background 0.2s;
            }

            .achievements-close-btn:hover {
                background: rgba(255,255,255,0.3);
            }

            .achievements-panel-body {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
            }

            .achievement-category {
                margin-bottom: 30px;
            }

            .category-title {
                color: var(--text-primary);
                font-size: 1.1rem;
                margin-bottom: 15px;
                font-weight: 600;
            }

            .achievements-grid {
                display: grid;
                gap: 12px;
            }

            .achievement-card {
                background: var(--surface-secondary);
                border-radius: 12px;
                padding: 15px;
                display: flex;
                gap: 15px;
                transition: all 0.3s ease;
                border: 2px solid transparent;
            }

            .achievement-card.unlocked {
                border-color: #10b981;
                box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
            }

            .achievement-card.locked {
                opacity: 0.6;
                filter: grayscale(60%);
            }

            .achievement-icon {
                font-size: 2.5rem;
                flex-shrink: 0;
            }

            .achievement-content {
                flex: 1;
            }

            .achievement-name {
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 4px;
            }

            .achievement-description {
                font-size: 0.85rem;
                color: var(--text-secondary);
                margin-bottom: 6px;
            }

            .achievement-points {
                font-size: 0.8rem;
                color: #f59e0b;
                font-weight: 600;
            }

            .achievement-progress {
                font-size: 0.75rem;
                color: var(--text-secondary);
                margin-top: 4px;
            }

            .achievement-unlocked-notification {
                position: fixed;
                top: -200px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 20px 30px;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                z-index: 20000;
                transition: top 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                min-width: 300px;
            }

            .achievement-unlocked-notification.show {
                top: 80px;
            }

            .achievement-unlocked-content {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .achievement-unlocked-icon {
                font-size: 3rem;
                animation: bounce 0.6s ease;
            }

            @keyframes bounce {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }

            .achievement-unlocked-title {
                font-size: 0.85rem;
                opacity: 0.9;
                font-weight: 500;
            }

            .achievement-unlocked-name {
                font-size: 1.2rem;
                font-weight: 700;
                margin: 4px 0;
            }

            .achievement-unlocked-points {
                font-size: 0.9rem;
                opacity: 0.95;
            }

            @media (max-width: 768px) {
                .achievements-panel {
                    width: 100%;
                    right: -100%;
                }

                .achievements-button {
                    padding: 6px 12px;
                    font-size: 0.85rem;
                }
            }
        `;

        document.head.appendChild(style);
    }
}

window.Gamification = Gamification;
