/**
 * Dashboard Data Loader
 * Handles loading and displaying all dashboard data
 */

class DashboardLoader {
    constructor(auth, db, user) {
        this.auth = auth;
        this.db = db;
        this.user = user;
        this.userData = null;
        this.initialized = false;
    }

    /**
     * Initialize dashboard with all data
     */
    async initialize() {
        console.log('📊 Initializing dashboard loader...');

        try {
            // Show loading states
            this.showLoadingStates();

            // Load user data first
            await this.loadUserData();

            // Load all dashboard data in parallel
            await Promise.all([
                this.loadApplicationStats(),
                this.loadEssayStats(),
                this.loadScholarshipStats(),
                this.loadTestPrepStats(),
                this.loadOverallProgress(),
                this.loadSchoolRecommendations(),
                this.loadTasks(),
                this.updateWelcomeMessage()
            ]);

            this.initialized = true;
            console.log('✅ Dashboard loaded successfully');
            this.showSuccessToast('Dashboard loaded successfully!');
        } catch (error) {
            console.error('❌ Dashboard initialization failed:', error);
            this.showErrorToast('Failed to load dashboard data. Please refresh the page.');
            this.showErrorStates();
        }
    }

    /**
     * Load user data from Firestore
     */
    async loadUserData() {
        try {
            const { getDoc, doc } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');
            const userDoc = await getDoc(doc(this.db, 'users', this.user.uid));

            if (userDoc.exists()) {
                this.userData = userDoc.data();
                console.log('✅ User data loaded:', this.userData);
            } else {
                // Create default user document
                this.userData = {
                    email: this.user.email,
                    name: this.user.displayName || this.user.email.split('@')[0],
                    createdAt: new Date(),
                    onboardingCompleted: false
                };

                const { setDoc } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');
                await setDoc(doc(this.db, 'users', this.user.uid), this.userData);
                console.log('✅ Created new user document');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            throw error;
        }
    }

    /**
     * Load application statistics
     */
    async loadApplicationStats() {
        try {
            const { collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

            const applicationsQuery = query(
                collection(this.db, 'applications'),
                where('userId', '==', this.user.uid)
            );

            const snapshot = await getDocs(applicationsQuery);
            const count = snapshot.size;

            // Calculate trend
            const recentApps = snapshot.docs.filter(doc => {
                const data = doc.data();
                const createdAt = data.createdAt?.toDate() || new Date(0);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return createdAt >= weekAgo;
            }).length;

            // Update UI
            const countElement = document.getElementById('applicationsCount');
            const trendElement = document.getElementById('applicationsTrend');

            if (countElement) {
                countElement.textContent = count;
                countElement.classList.add('loaded');
            }

            if (trendElement) {
                trendElement.textContent = recentApps > 0 ? `+${recentApps} this week` : 'No new apps';
            }

            console.log(`✅ Applications: ${count} (${recentApps} this week)`);
        } catch (error) {
            console.error('Error loading applications:', error);
            this.showStatError('applicationsCount', '0');
        }
    }

    /**
     * Load essay statistics
     */
    async loadEssayStats() {
        try {
            const { collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

            const essaysQuery = query(
                collection(this.db, 'essays'),
                where('userId', '==', this.user.uid)
            );

            const snapshot = await getDocs(essaysQuery);
            const count = snapshot.size;

            // Count essays in review
            const inReview = snapshot.docs.filter(doc => {
                const data = doc.data();
                return data.status === 'in_review' || data.status === 'draft';
            }).length;

            // Update UI
            const countElement = document.getElementById('essaysCount');
            const trendElement = document.getElementById('essaysTrend');

            if (countElement) {
                countElement.textContent = count;
                countElement.classList.add('loaded');
            }

            if (trendElement) {
                trendElement.textContent = inReview > 0 ? `${inReview} in review` : 'All complete';
            }

            console.log(`✅ Essays: ${count} (${inReview} in review)`);
        } catch (error) {
            console.error('Error loading essays:', error);
            this.showStatError('essaysCount', '0');
        }
    }

    /**
     * Load scholarship statistics
     */
    async loadScholarshipStats() {
        try {
            const { collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

            const scholarshipsQuery = query(
                collection(this.db, 'scholarships'),
                where('userId', '==', this.user.uid)
            );

            const snapshot = await getDocs(scholarshipsQuery);

            // Calculate total potential value
            let totalValue = 0;
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                totalValue += data.amount || 0;
            });

            // Format value
            const formattedValue = totalValue >= 1000 ?
                `$${(totalValue / 1000).toFixed(1)}K` :
                `$${totalValue}`;

            // Update UI
            const amountElement = document.getElementById('scholarshipAmount');
            const trendElement = document.getElementById('scholarshipTrend');

            if (amountElement) {
                amountElement.textContent = formattedValue;
                amountElement.classList.add('loaded');
            }

            if (trendElement) {
                trendElement.textContent = `${snapshot.size} opportunities`;
            }

            console.log(`✅ Scholarships: ${formattedValue} in ${snapshot.size} opportunities`);
        } catch (error) {
            console.error('Error loading scholarships:', error);
            this.showStatError('scholarshipAmount', '$0');
        }
    }

    /**
     * Load test prep statistics
     */
    async loadTestPrepStats() {
        try {
            const { collection, query, where, getDocs, orderBy, limit } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

            // Get latest SAT score
            const satQuery = query(
                collection(this.db, 'testScores'),
                where('userId', '==', this.user.uid),
                where('testType', '==', 'SAT'),
                orderBy('completedAt', 'desc'),
                limit(1)
            );

            const satSnapshot = await getDocs(satQuery);
            const latestSAT = satSnapshot.docs[0]?.data();

            // Get latest ACT score
            const actQuery = query(
                collection(this.db, 'testScores'),
                where('userId', '==', this.user.uid),
                where('testType', '==', 'ACT'),
                orderBy('completedAt', 'desc'),
                limit(1)
            );

            const actSnapshot = await getDocs(actQuery);
            const latestACT = actSnapshot.docs[0]?.data();

            // Use whichever test has a score, prefer SAT
            const score = latestSAT?.totalScore || latestACT?.totalScore || '--';
            const testType = latestSAT ? 'SAT' : latestACT ? 'ACT' : 'No scores';

            // Calculate improvement
            let improvement = 0;
            if (latestSAT?.previousScore) {
                improvement = latestSAT.totalScore - latestSAT.previousScore;
            } else if (latestACT?.previousScore) {
                improvement = latestACT.totalScore - latestACT.previousScore;
            }

            // Update main dashboard stat
            const scoreElement = document.getElementById('testprepScore');
            const trendElement = document.getElementById('testprepTrend');

            if (scoreElement) {
                scoreElement.textContent = score;
                scoreElement.classList.add('loaded');
            }

            if (trendElement) {
                if (improvement > 0) {
                    trendElement.textContent = `+${improvement} pts`;
                } else if (improvement < 0) {
                    trendElement.textContent = `${improvement} pts`;
                } else {
                    trendElement.textContent = testType;
                }
            }

            // Update test prep cards
            if (latestSAT) {
                const satScoreEl = document.getElementById('satScore');
                const satProgressEl = document.getElementById('satProgress');
                const satProgressBarEl = document.getElementById('satProgressBar');

                if (satScoreEl) satScoreEl.textContent = latestSAT.totalScore;
                if (satProgressEl && satProgressBarEl) {
                    const progress = Math.round((latestSAT.totalScore / 1600) * 100);
                    satProgressEl.textContent = `${progress}%`;
                    satProgressBarEl.style.width = `${progress}%`;
                }
            }

            if (latestACT) {
                const actScoreEl = document.getElementById('actScore');
                const actProgressEl = document.getElementById('actProgress');
                const actProgressBarEl = document.getElementById('actProgressBar');

                if (actScoreEl) actScoreEl.textContent = latestACT.totalScore;
                if (actProgressEl && actProgressBarEl) {
                    const progress = Math.round((latestACT.totalScore / 36) * 100);
                    actProgressEl.textContent = `${progress}%`;
                    actProgressBarEl.style.width = `${progress}%`;
                }
            }

            console.log(`✅ Test Prep: ${score} ${testType} (${improvement > 0 ? '+' : ''}${improvement})`);
        } catch (error) {
            console.error('Error loading test prep stats:', error);
            this.showStatError('testprepScore', '--');
        }
    }

    /**
     * Load overall progress
     */
    async loadOverallProgress() {
        try {
            // Calculate progress based on completed tasks
            const { collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

            const tasksQuery = query(
                collection(this.db, 'tasks'),
                where('userId', '==', this.user.uid)
            );

            const snapshot = await getDocs(tasksQuery);
            const totalTasks = snapshot.size;

            if (totalTasks === 0) {
                this.updateProgressDisplay(0);
                return;
            }

            const completedTasks = snapshot.docs.filter(doc =>
                doc.data().status === 'completed'
            ).length;

            const progressPercent = Math.round((completedTasks / totalTasks) * 100);

            this.updateProgressDisplay(progressPercent);

            console.log(`✅ Overall Progress: ${progressPercent}% (${completedTasks}/${totalTasks})`);
        } catch (error) {
            console.error('Error loading progress:', error);
            this.updateProgressDisplay(0);
        }
    }

    /**
     * Update progress display
     */
    updateProgressDisplay(percent) {
        const progressTextEl = document.getElementById('progressText');
        const progressCircleEl = document.getElementById('progressCircle');
        const overallProgressEl = document.getElementById('overallProgress');

        if (progressTextEl) {
            progressTextEl.textContent = `${percent}%`;
        }

        if (overallProgressEl) {
            overallProgressEl.textContent = `${percent}%`;
            overallProgressEl.classList.add('loaded');
        }

        if (progressCircleEl) {
            const circumference = 2 * Math.PI * 60; // radius = 60
            const offset = circumference - (percent / 100) * circumference;
            progressCircleEl.style.strokeDashoffset = offset;
        }

        const trendEl = document.getElementById('progressTrend');
        if (trendEl) {
            trendEl.textContent = percent >= 75 ? 'Almost there!' :
                                  percent >= 50 ? 'On track' :
                                  'Getting started';
        }
    }

    /**
     * Load school recommendations
     */
    async loadSchoolRecommendations() {
        try {
            const schoolGrid = document.getElementById('schoolGrid');
            if (!schoolGrid) return;

            // Try to load saved recommendations
            const { collection, query, where, getDocs, limit, orderBy } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

            const recsQuery = query(
                collection(this.db, 'schoolRecommendations'),
                where('userId', '==', this.user.uid),
                orderBy('matchScore', 'desc'),
                limit(6)
            );

            const snapshot = await getDocs(recsQuery);

            if (snapshot.empty) {
                schoolGrid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1;">
                        <i class="fas fa-university"></i>
                        <h3>No Recommendations Yet</h3>
                        <p>Complete your profile to get personalized school recommendations</p>
                        <button class="btn-primary" onclick="window.location.href='/profile'">
                            Complete Profile
                        </button>
                    </div>
                `;
                return;
            }

            schoolGrid.innerHTML = '';

            snapshot.docs.forEach(doc => {
                const school = doc.data();
                const card = this.createSchoolCard(school);
                schoolGrid.appendChild(card);
            });

            console.log(`✅ Loaded ${snapshot.size} school recommendations`);
        } catch (error) {
            console.error('Error loading school recommendations:', error);
            const schoolGrid = document.getElementById('schoolGrid');
            if (schoolGrid) {
                schoolGrid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1;">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Unable to Load Recommendations</h3>
                        <p>Please try refreshing the page</p>
                    </div>
                `;
            }
        }
    }

    /**
     * Create school card element
     */
    createSchoolCard(school) {
        const card = document.createElement('div');
        card.className = 'school-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');

        const matchPercent = Math.round(school.matchScore || 85);

        card.innerHTML = `
            <div class="match-percentage">${matchPercent}%</div>
            <h3 class="school-name">${school.name || 'University'}</h3>
            <div class="school-details">
                <div class="school-detail">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">${school.location || 'N/A'}</span>
                </div>
                <div class="school-detail">
                    <span class="detail-label">Acceptance:</span>
                    <span class="detail-value">${school.acceptanceRate || 'N/A'}%</span>
                </div>
                <div class="school-detail">
                    <span class="detail-label">SAT Range:</span>
                    <span class="detail-value">${school.satRange || 'N/A'}</span>
                </div>
                <div class="school-detail">
                    <span class="detail-label">Type:</span>
                    <span class="detail-value">${school.type || 'N/A'}</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            window.location.href = `/discovery?id=${school.id}`;
        });

        return card;
    }

    /**
     * Load tasks
     */
    async loadTasks() {
        try {
            const { collection, query, where, getDocs, orderBy, limit } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

            const tasksQuery = query(
                collection(this.db, 'tasks'),
                where('userId', '==', this.user.uid),
                where('status', '!=', 'completed'),
                orderBy('status'),
                orderBy('dueDate', 'asc'),
                limit(5)
            );

            const snapshot = await getDocs(tasksQuery);
            const taskList = document.getElementById('taskList');

            if (!taskList) return;

            if (snapshot.empty) {
                taskList.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                        <i class="fas fa-check-circle" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <p>No pending tasks! You're all caught up.</p>
                    </div>
                `;
                return;
            }

            taskList.innerHTML = '';

            snapshot.docs.forEach(doc => {
                const task = doc.data();
                const taskElement = this.createTaskElement(doc.id, task);
                taskList.appendChild(taskElement);
            });

            console.log(`✅ Loaded ${snapshot.size} tasks`);
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    /**
     * Create task element
     */
    createTaskElement(taskId, task) {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';

        const dueDate = task.dueDate?.toDate?.() || new Date(task.dueDate);
        const formattedDate = dueDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });

        const priority = task.priority || 'medium';

        taskItem.innerHTML = `
            <input type="checkbox"
                   class="task-checkbox"
                   id="task-${taskId}"
                   ${task.status === 'completed' ? 'checked' : ''}
                   onchange="handleTaskToggle('${taskId}', this.checked)">
            <div class="task-content">
                <div class="task-title">${task.title || 'Untitled Task'}</div>
                <div class="task-due">Due: ${formattedDate}</div>
            </div>
            <div class="task-priority ${priority}"></div>
        `;

        return taskItem;
    }

    /**
     * Update welcome message
     */
    updateWelcomeMessage() {
        const welcomeTitle = document.getElementById('welcomeTitle');
        const welcomeMessage = document.getElementById('welcomeMessage');

        if (!this.userData) return;

        const name = this.userData.name || this.user.displayName || 'Student';
        const firstName = name.split(' ')[0];

        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good morning' :
                        hour < 18 ? 'Good afternoon' :
                        'Good evening';

        if (welcomeTitle) {
            welcomeTitle.textContent = `${greeting}, ${firstName}!`;
        }

        if (welcomeMessage) {
            const messages = [
                'Your AI-powered college application command center',
                "Let's make progress on your college journey today",
                'Track your progress and stay organized',
                'Your success story starts here'
            ];
            welcomeMessage.textContent = messages[Math.floor(Math.random() * messages.length)];
        }
    }

    /**
     * Show loading states
     */
    showLoadingStates() {
        const statElements = [
            'applicationsCount',
            'essaysCount',
            'scholarshipAmount',
            'testprepScore',
            'overallProgress'
        ];

        statElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = '<i class="fas fa-spinner fa-spin" style="color: var(--accent-color);"></i>';
            }
        });
    }

    /**
     * Show error states
     */
    showErrorStates() {
        const statElements = [
            { id: 'applicationsCount', value: '0' },
            { id: 'essaysCount', value: '0' },
            { id: 'scholarshipAmount', value: '$0' },
            { id: 'testprepScore', value: '--' },
            { id: 'overallProgress', value: '0%' }
        ];

        statElements.forEach(({ id, value }) => {
            this.showStatError(id, value);
        });
    }

    /**
     * Show error for specific stat
     */
    showStatError(elementId, defaultValue) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = defaultValue;
            element.classList.add('loaded');
        }
    }

    /**
     * Show success toast
     */
    showSuccessToast(message) {
        if (typeof showToast === 'function') {
            showToast(message, 'success', 3000);
        }
    }

    /**
     * Show error toast
     */
    showErrorToast(message) {
        if (typeof showToast === 'function') {
            showToast(message, 'error', 5000);
        }
    }

    /**
     * Refresh dashboard data
     */
    async refresh() {
        console.log('🔄 Refreshing dashboard...');
        await this.initialize();
    }
}

// Global task toggle handler
window.handleTaskToggle = async function(taskId, completed) {
    try {
        const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

        if (!window.db) {
            console.error('Database not available');
            return;
        }

        await updateDoc(doc(window.db, 'tasks', taskId), {
            status: completed ? 'completed' : 'pending',
            completedAt: completed ? new Date() : null
        });

        console.log(`✅ Task ${taskId} marked as ${completed ? 'completed' : 'pending'}`);

        // Refresh dashboard
        if (window.dashboardLoader) {
            await window.dashboardLoader.refresh();
        }
    } catch (error) {
        console.error('Error updating task:', error);
    }
};

// Export to global scope
window.DashboardLoader = DashboardLoader;

console.log('📦 Dashboard loader module loaded');
