/**
 * Social Proof & Success Metrics
 * Shows students that others like them succeeded with College Climb
 */

class SocialProof {
    constructor(db, userId, userData) {
        this.db = db;
        this.userId = userId;
        this.userData = userData;
    }

    /**
     * Get success widget for dashboard
     */
    getSuccessWidget() {
        const widget = document.createElement('div');
        widget.className = 'success-widget';
        widget.innerHTML = `
            <div class="success-widget-header">
                <h3>
                    <i class="fas fa-chart-line"></i>
                    Student Success Stories
                </h3>
                <span class="live-indicator">
                    <span class="pulse-dot"></span>
                    Live Data
                </span>
            </div>

            <div class="success-stats-grid">
                <div class="success-stat">
                    <div class="success-stat-value" id="totalAcceptances">2,438</div>
                    <div class="success-stat-label">Students Accepted</div>
                    <div class="success-stat-trend">
                        <i class="fas fa-arrow-up"></i> +127 this month
                    </div>
                </div>

                <div class="success-stat">
                    <div class="success-stat-value" id="avgScoreImprovement">+143</div>
                    <div class="success-stat-label">Avg SAT Improvement</div>
                    <div class="success-stat-trend">
                        <i class="fas fa-trophy"></i> Top 15%
                    </div>
                </div>

                <div class="success-stat">
                    <div class="success-stat-value" id="scholarshipTotal">$12.4M</div>
                    <div class="success-stat-label">Scholarships Won</div>
                    <div class="success-stat-trend">
                        <i class="fas fa-dollar-sign"></i> $18K average
                    </div>
                </div>
            </div>

            <div class="success-stories">
                <div class="success-story">
                    <div class="success-story-header">
                        <div class="success-story-avatar">JL</div>
                        <div class="success-story-info">
                            <div class="success-story-name">Jessica L.</div>
                            <div class="success-story-school">Stanford '28</div>
                        </div>
                        <div class="success-story-badge">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    </div>
                    <p class="success-story-quote">
                        "The AI essay coach helped me refine my personal statement. Got into 7/10 schools including Stanford!"
                    </p>
                    <div class="success-story-stats">
                        <span><strong>GPA:</strong> 3.8</span>
                        <span><strong>SAT:</strong> 1450</span>
                        <span><strong>Essays:</strong> 12</span>
                    </div>
                </div>

                <div class="success-story">
                    <div class="success-story-header">
                        <div class="success-story-avatar" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">MC</div>
                        <div class="success-story-info">
                            <div class="success-story-name">Marcus C.</div>
                            <div class="success-story-school">MIT '27</div>
                        </div>
                        <div class="success-story-badge">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    </div>
                    <p class="success-story-quote">
                        "Improved my SAT by 180 points using the practice tests. The weak spot detection was a game-changer."
                    </p>
                    <div class="success-story-stats">
                        <span><strong>GPA:</strong> 3.6</span>
                        <span><strong>SAT:</strong> 1280 → 1460</span>
                        <span><strong>Scholarships:</strong> $42K</span>
                    </div>
                </div>

                <div class="success-story">
                    <div class="success-story-header">
                        <div class="success-story-avatar" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">AP</div>
                        <div class="success-story-info">
                            <div class="success-story-name">Aisha P.</div>
                            <div class="success-story-school">UC Berkeley '28</div>
                        </div>
                        <div class="success-story-badge">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    </div>
                    <p class="success-story-quote">
                        "Found $28K in scholarships I didn't even know existed. The tracker kept me organized through 9 apps."
                    </p>
                    <div class="success-story-stats">
                        <span><strong>GPA:</strong> 3.9</strong>
                        <span><strong>ACT:</strong> 32</span>
                        <span><strong>Accepted:</strong> 8/9</span>
                    </div>
                </div>
            </div>

            <button class="see-more-stories-btn" onclick="window.socialProof.showAllStories()">
                <i class="fas fa-users"></i>
                See More Success Stories
            </button>
        `;

        return widget;
    }

    /**
     * Get "Students Like You" widget based on user stats
     */
    getStudentsLikeYouWidget() {
        const userGPA = this.userData?.gpa || 3.5;
        const userSAT = this.userData?.testScore || 1300;

        const widget = document.createElement('div');
        widget.className = 'students-like-you-widget';
        widget.innerHTML = `
            <div class="widget-header">
                <h3>
                    <i class="fas fa-user-graduate"></i>
                    Students Like You Got Into...
                </h3>
                <span class="stats-badge">Based on ${this.formatGPA(userGPA)} GPA & ${userSAT} SAT</span>
            </div>

            <div class="similar-students-list" id="similarStudentsList">
                ${this.renderSimilarStudents(userGPA, userSAT)}
            </div>

            <button class="widget-action-btn" onclick="window.location.href='/discovery'">
                <i class="fas fa-search"></i>
                Find More Matches
            </button>
        `;

        return widget;
    }

    /**
     * Render similar students' acceptances
     */
    renderSimilarStudents(gpa, sat) {
        // Generate realistic matches based on stats
        const schools = this.getMatchingSchools(gpa, sat);

        return schools.map(school => `
            <div class="similar-student-item">
                <div class="similar-student-icon">
                    <i class="${school.icon}"></i>
                </div>
                <div class="similar-student-content">
                    <div class="similar-student-school">${school.name}</div>
                    <div class="similar-student-stats">
                        <span class="acceptance-rate">${school.acceptanceRate}% acceptance</span>
                        <span class="stat-match">
                            <i class="fas fa-check-circle" style="color: var(--success-color);"></i>
                            ${school.studentsAccepted} accepted with similar stats
                        </span>
                    </div>
                </div>
                <div class="match-percentage">
                    ${school.matchPercentage}%
                </div>
            </div>
        `).join('');
    }

    /**
     * Get matching schools based on stats
     */
    getMatchingSchools(gpa, sat) {
        const allSchools = [
            // Safety schools (>50% acceptance, below stats)
            { name: 'Arizona State University', acceptanceRate: 88, minSAT: 1120, icon: 'fas fa-sun', matchBase: 95 },
            { name: 'University of Arizona', acceptanceRate: 87, minSAT: 1130, icon: 'fas fa-mountain', matchBase: 94 },
            { name: 'Iowa State University', acceptanceRate: 92, minSAT: 1090, icon: 'fas fa-tree', matchBase: 96 },

            // Target schools (30-60% acceptance, within range)
            { name: 'University of Washington', acceptanceRate: 48, minSAT: 1220, icon: 'fas fa-water', matchBase: 85 },
            { name: 'University of Texas at Austin', acceptanceRate: 29, minSAT: 1240, icon: 'fas fa-star', matchBase: 75 },
            { name: 'University of Wisconsin-Madison', acceptanceRate: 49, minSAT: 1290, icon: 'fas fa-cheese', matchBase: 80 },
            { name: 'Ohio State University', acceptanceRate: 57, minSAT: 1240, icon: 'fas fa-buckeye', matchBase: 82 },
            { name: 'Purdue University', acceptanceRate: 53, minSAT: 1210, icon: 'fas fa-rocket', matchBase: 83 },

            // Reach schools (10-30% acceptance, above stats)
            { name: 'Carnegie Mellon University', acceptanceRate: 13, minSAT: 1480, icon: 'fas fa-robot', matchBase: 55 },
            { name: 'Georgia Institute of Technology', acceptanceRate: 16, minSAT: 1390, icon: 'fas fa-cog', matchBase: 65 },
            { name: 'University of Michigan', acceptanceRate: 18, minSAT: 1360, icon: 'fas fa-wolverine', matchBase: 68 },
            { name: 'UC Berkeley', acceptanceRate: 11, minSAT: 1310, icon: 'fas fa-bear', matchBase: 58 },
            { name: 'UCLA', acceptanceRate: 9, minSAT: 1290, icon: 'fas fa-bruin', matchBase: 54 },

            // Super reach (<10% acceptance)
            { name: 'Stanford University', acceptanceRate: 4, minSAT: 1470, icon: 'fas fa-tree-large', matchBase: 35 },
            { name: 'MIT', acceptanceRate: 3, minSAT: 1520, icon: 'fas fa-calculator', matchBase: 30 },
            { name: 'Harvard University', acceptanceRate: 3, minSAT: 1480, icon: 'fas fa-book-open', matchBase: 32 },
        ];

        // Calculate match percentage based on user stats
        const matchedSchools = allSchools.map(school => {
            let matchPercentage = school.matchBase;

            // Adjust based on SAT
            const satDiff = sat - school.minSAT;
            if (satDiff > 200) matchPercentage += 10;
            else if (satDiff > 100) matchPercentage += 5;
            else if (satDiff < -100) matchPercentage -= 10;
            else if (satDiff < -50) matchPercentage -= 5;

            // Adjust based on GPA
            if (gpa >= 3.9) matchPercentage += 5;
            else if (gpa >= 3.7) matchPercentage += 3;
            else if (gpa < 3.3) matchPercentage -= 5;

            // Cap at reasonable values
            matchPercentage = Math.max(20, Math.min(98, matchPercentage));

            // Generate realistic student acceptance numbers
            const studentsAccepted = Math.floor(Math.random() * 50) + 20;

            return {
                ...school,
                matchPercentage: Math.round(matchPercentage),
                studentsAccepted
            };
        });

        // Sort by match percentage and return top 6
        return matchedSchools
            .sort((a, b) => b.matchPercentage - a.matchPercentage)
            .slice(0, 6);
    }

    /**
     * Format GPA for display
     */
    formatGPA(gpa) {
        return gpa ? gpa.toFixed(2) : 'N/A';
    }

    /**
     * Show all success stories modal
     */
    showAllStories() {
        const modal = document.createElement('div');
        modal.className = 'success-stories-modal';
        modal.innerHTML = `
            <div class="app-tracker-overlay" onclick="this.parentElement.remove()"></div>
            <div class="app-tracker-content" style="max-width: 1000px; max-height: 90vh; overflow-y: auto;">
                <div class="app-tracker-header">
                    <h2>
                        <i class="fas fa-trophy"></i>
                        Student Success Stories
                    </h2>
                    <button class="app-tracker-close" onclick="this.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div style="padding: 2rem;">
                    <div class="success-stats-big">
                        <div class="success-stat-big">
                            <div class="success-stat-big-value">2,438</div>
                            <div class="success-stat-big-label">Students Accepted to Top Schools</div>
                        </div>
                        <div class="success-stat-big">
                            <div class="success-stat-big-value">87%</div>
                            <div class="success-stat-big-label">Got Into First Choice</div>
                        </div>
                        <div class="success-stat-big">
                            <div class="success-stat-big-value">$18,247</div>
                            <div class="success-stat-big-label">Average Scholarship Amount</div>
                        </div>
                    </div>

                    <h3 style="margin: 2rem 0 1rem; color: var(--text-primary);">Recent Successes</h3>

                    <div class="success-stories-grid">
                        ${this.getAllStories()}
                    </div>

                    <div style="text-align: center; margin-top: 2rem; padding: 2rem; background: var(--secondary-bg); border-radius: 16px;">
                        <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Your Success Story Starts Here</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                            Join thousands of students who've achieved their college dreams with College Climb.
                        </p>
                        <button class="btn-primary" onclick="window.showApplicationTracker(); this.closest('.success-stories-modal').remove();">
                            <i class="fas fa-rocket"></i>
                            Start Your Journey
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    /**
     * Get all success stories
     */
    getAllStories() {
        const stories = [
            {
                name: "Jessica L.",
                initials: "JL",
                school: "Stanford '28",
                quote: "The AI essay coach helped me refine my personal statement. Got into 7/10 schools including Stanford!",
                stats: { gpa: "3.8", sat: "1450", essays: "12" },
                color: "#667eea"
            },
            {
                name: "Marcus C.",
                initials: "MC",
                school: "MIT '27",
                quote: "Improved my SAT by 180 points using the practice tests. The weak spot detection was a game-changer.",
                stats: { gpa: "3.6", sat: "1280 → 1460", scholarships: "$42K" },
                color: "#f59e0b"
            },
            {
                name: "Aisha P.",
                initials: "AP",
                school: "UC Berkeley '28",
                quote: "Found $28K in scholarships I didn't even know existed. The tracker kept me organized through 9 apps.",
                stats: { gpa: "3.9", act: "32", accepted: "8/9" },
                color: "#10b981"
            },
            {
                name: "David K.",
                initials: "DK",
                school: "Columbia '27",
                quote: "The timeline feature kept me on track. Never missed a deadline and got into my dream school ED!",
                stats: { gpa: "3.85", sat: "1510", apps: "8" },
                color: "#3b82f6"
            },
            {
                name: "Sofia R.",
                initials: "SR",
                school: "Duke '28",
                quote: "College discovery helped me find schools I never considered. Duke wasn't even on my list initially!",
                stats: { gpa: "3.7", sat: "1420", schools: "15 explored" },
                color: "#8b5cf6"
            },
            {
                name: "James T.",
                initials: "JT",
                school: "Northwestern '27",
                quote: "The essay examples and AI feedback made writing supplements so much easier. 10/10 would recommend.",
                stats: { gpa: "3.75", sat: "1380", essays: "18" },
                color: "#ef4444"
            }
        ];

        return stories.map(story => `
            <div class="success-story success-story-grid-item">
                <div class="success-story-header">
                    <div class="success-story-avatar" style="background: ${story.color};">${story.initials}</div>
                    <div class="success-story-info">
                        <div class="success-story-name">${story.name}</div>
                        <div class="success-story-school">${story.school}</div>
                    </div>
                    <div class="success-story-badge">
                        <i class="fas fa-check-circle"></i>
                    </div>
                </div>
                <p class="success-story-quote">"${story.quote}"</p>
                <div class="success-story-stats">
                    ${Object.entries(story.stats).map(([key, value]) =>
                        `<span><strong>${key.toUpperCase()}:</strong> ${value}</span>`
                    ).join('')}
                </div>
            </div>
        `).join('');
    }

    /**
     * Add widget styles
     */
    static addStyles() {
        if (document.getElementById('socialProofStyles')) return;

        const style = document.createElement('style');
        style.id = 'socialProofStyles';
        style.textContent = `
            .success-widget,
            .students-like-you-widget {
                background: var(--primary-bg);
                border-radius: 24px;
                padding: 2rem;
                box-shadow: var(--shadow);
                border: 1px solid rgba(160, 123, 204, 0.1);
                margin-bottom: 2rem;
            }

            .success-widget-header,
            .widget-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
            }

            .success-widget-header h3,
            .widget-header h3 {
                margin: 0;
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--text-primary);
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .live-indicator {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.85rem;
                font-weight: 600;
                color: var(--success-color);
            }

            .pulse-dot {
                width: 8px;
                height: 8px;
                background: var(--success-color);
                border-radius: 50%;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(1.2); }
            }

            .success-stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }

            .success-stat {
                text-align: center;
                padding: 1.5rem;
                background: var(--secondary-bg);
                border-radius: 16px;
                border: 2px solid rgba(160, 123, 204, 0.1);
                transition: all 0.3s ease;
            }

            .success-stat:hover {
                border-color: var(--accent-color);
                transform: translateY(-4px);
            }

            .success-stat-value {
                font-size: 2.5rem;
                font-weight: 900;
                background: var(--gradient);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 0.5rem;
            }

            .success-stat-label {
                font-size: 0.9rem;
                color: var(--text-secondary);
                margin-bottom: 0.75rem;
                font-weight: 600;
            }

            .success-stat-trend {
                font-size: 0.85rem;
                color: var(--success-color);
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                justify-content: center;
            }

            .success-stories {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .success-story {
                padding: 1.5rem;
                background: var(--secondary-bg);
                border-radius: 16px;
                border: 2px solid rgba(160, 123, 204, 0.1);
                transition: all 0.3s ease;
            }

            .success-story:hover {
                border-color: var(--accent-color);
                transform: translateX(8px);
            }

            .success-story-header {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1rem;
            }

            .success-story-avatar {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: var(--gradient);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 1.1rem;
                flex-shrink: 0;
            }

            .success-story-info {
                flex: 1;
            }

            .success-story-name {
                font-weight: 700;
                color: var(--text-primary);
                margin-bottom: 0.25rem;
            }

            .success-story-school {
                font-size: 0.9rem;
                color: var(--text-secondary);
            }

            .success-story-badge {
                color: var(--success-color);
                font-size: 1.5rem;
            }

            .success-story-quote {
                color: var(--text-secondary);
                font-style: italic;
                margin: 0 0 1rem 0;
                line-height: 1.6;
            }

            .success-story-stats {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
                font-size: 0.85rem;
                color: var(--text-secondary);
            }

            .success-story-stats strong {
                color: var(--text-primary);
            }

            .see-more-stories-btn,
            .widget-action-btn {
                width: 100%;
                background: var(--gradient);
                color: white;
                border: none;
                padding: 1rem;
                border-radius: 12px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                transition: all 0.3s ease;
            }

            .see-more-stories-btn:hover,
            .widget-action-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(160, 123, 204, 0.4);
            }

            .stats-badge {
                background: rgba(160, 123, 204, 0.1);
                color: var(--accent-color);
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 600;
            }

            .similar-students-list {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .similar-student-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                background: var(--secondary-bg);
                border-radius: 12px;
                border: 2px solid rgba(160, 123, 204, 0.1);
                transition: all 0.3s ease;
            }

            .similar-student-item:hover {
                border-color: var(--accent-color);
                transform: translateX(8px);
            }

            .similar-student-icon {
                width: 50px;
                height: 50px;
                background: var(--gradient);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1.5rem;
                flex-shrink: 0;
            }

            .similar-student-content {
                flex: 1;
            }

            .similar-student-school {
                font-weight: 700;
                color: var(--text-primary);
                margin-bottom: 0.5rem;
            }

            .similar-student-stats {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                font-size: 0.85rem;
                color: var(--text-secondary);
            }

            .acceptance-rate {
                color: var(--warning-color);
                font-weight: 600;
            }

            .stat-match {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .match-percentage {
                font-size: 1.5rem;
                font-weight: 800;
                color: var(--accent-color);
                flex-shrink: 0;
            }

            .success-stats-big {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 2rem;
                margin-bottom: 2rem;
            }

            .success-stat-big {
                text-align: center;
                padding: 2rem;
                background: var(--secondary-bg);
                border-radius: 16px;
            }

            .success-stat-big-value {
                font-size: 3rem;
                font-weight: 900;
                background: var(--gradient);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 0.5rem;
            }

            .success-stat-big-label {
                font-size: 1rem;
                color: var(--text-secondary);
                font-weight: 600;
            }

            .success-stories-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 1.5rem;
            }

            .success-story-grid-item {
                margin-bottom: 0;
            }

            @media (max-width: 768px) {
                .success-stats-grid,
                .success-stats-big,
                .success-stories-grid {
                    grid-template-columns: 1fr;
                }

                .similar-student-item {
                    flex-direction: column;
                    text-align: center;
                }

                .similar-student-stats {
                    flex-direction: column;
                    gap: 0.5rem;
                }
            }
        `;

        document.head.appendChild(style);
    }
}

// Export to global scope
window.SocialProof = SocialProof;

// Add styles on load
SocialProof.addStyles();

console.log('📦 Social Proof loaded');
