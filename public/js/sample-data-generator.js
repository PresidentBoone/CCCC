/**
 * Sample Data Generator
 * Creates realistic sample data for new users so dashboard isn't empty
 */

class SampleDataGenerator {
    constructor(db, userId) {
        this.db = db;
        this.userId = userId;
    }

    /**
     * Check if user has any data
     */
    async hasData() {
        try {
            const { collection, query, where, getDocs, limit } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

            const checks = await Promise.all([
                getDocs(query(collection(this.db, 'applications'), where('userId', '==', this.userId), limit(1))),
                getDocs(query(collection(this.db, 'tasks'), where('userId', '==', this.userId), limit(1))),
                getDocs(query(collection(this.db, 'essays'), where('userId', '==', this.userId), limit(1)))
            ]);

            return checks.some(snapshot => !snapshot.empty);
        } catch (error) {
            console.error('Error checking for data:', error);
            return true; // Assume has data if error
        }
    }

    /**
     * Generate sample data for new user
     */
    async generateSampleData() {
        console.log('🎨 Generating sample data for new user...');

        try {
            await Promise.all([
                this.createSampleApplications(),
                this.createSampleTasks(),
                this.createSampleSchools(),
                this.createSampleTestScore()
            ]);

            console.log('✅ Sample data created successfully');
            return true;
        } catch (error) {
            console.error('❌ Error generating sample data:', error);
            return false;
        }
    }

    /**
     * Create sample college applications
     */
    async createSampleApplications() {
        const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

        const sampleApps = [
            {
                collegeName: 'Stanford University',
                applicationType: 'REA',
                deadline: '2025-11-01',
                applicationFee: 90,
                essaysRequired: 5,
                essaysCompleted: 3,
                status: 'in_progress',
                progress: 60,
                notes: 'Focus on my computer science research project',
                userId: this.userId,
                createdAt: new Date()
            },
            {
                collegeName: 'MIT',
                applicationType: 'EA',
                deadline: '2025-11-01',
                applicationFee: 75,
                essaysRequired: 6,
                essaysCompleted: 2,
                status: 'in_progress',
                progress: 40,
                notes: 'Highlight robotics club leadership',
                userId: this.userId,
                createdAt: new Date()
            },
            {
                collegeName: 'UC Berkeley',
                applicationType: 'RD',
                deadline: '2025-11-30',
                applicationFee: 70,
                essaysRequired: 4,
                essaysCompleted: 4,
                status: 'submitted',
                progress: 100,
                notes: 'All essays completed!',
                userId: this.userId,
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
            }
        ];

        for (const app of sampleApps) {
            await addDoc(collection(this.db, 'applications'), app);
        }

        console.log('✅ Created 3 sample applications');
    }

    /**
     * Create sample tasks
     */
    async createSampleTasks() {
        const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        const twoWeeks = new Date();
        twoWeeks.setDate(twoWeeks.getDate() + 14);

        const sampleTasks = [
            {
                title: 'Complete Common App essay',
                description: 'Write 650-word personal statement',
                dueDate: tomorrow,
                status: 'pending',
                priority: 'high',
                category: 'essays',
                userId: this.userId,
                createdAt: new Date()
            },
            {
                title: 'Request recommendation from Ms. Johnson',
                description: 'Ask English teacher for letter of recommendation',
                dueDate: nextWeek,
                status: 'pending',
                priority: 'high',
                category: 'recommendations',
                userId: this.userId,
                createdAt: new Date()
            },
            {
                title: 'Finalize activities list',
                description: 'Complete Common App activities section (10 activities)',
                dueDate: nextWeek,
                status: 'pending',
                priority: 'medium',
                category: 'application',
                userId: this.userId,
                createdAt: new Date()
            },
            {
                title: 'Take SAT practice test',
                description: 'Complete full-length practice test',
                dueDate: twoWeeks,
                status: 'pending',
                priority: 'medium',
                category: 'testing',
                userId: this.userId,
                createdAt: new Date()
            },
            {
                title: 'Research scholarship opportunities',
                description: 'Find 5 scholarships to apply for',
                dueDate: twoWeeks,
                status: 'pending',
                priority: 'low',
                category: 'scholarships',
                userId: this.userId,
                createdAt: new Date()
            }
        ];

        for (const task of sampleTasks) {
            await addDoc(collection(this.db, 'tasks'), task);
        }

        console.log('✅ Created 5 sample tasks');
    }

    /**
     * Create sample school recommendations
     */
    async createSampleSchools() {
        const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

        const sampleSchools = [
            {
                name: 'University of Washington',
                location: 'Seattle, WA',
                matchScore: 92,
                acceptanceRate: 48,
                satRange: '1200-1450',
                type: 'Public Research University',
                userId: this.userId,
                createdAt: new Date()
            },
            {
                name: 'Carnegie Mellon University',
                location: 'Pittsburgh, PA',
                matchScore: 88,
                acceptanceRate: 13,
                satRange: '1460-1560',
                type: 'Private Research University',
                userId: this.userId,
                createdAt: new Date()
            },
            {
                name: 'University of Texas at Austin',
                location: 'Austin, TX',
                matchScore: 85,
                acceptanceRate: 29,
                satRange: '1230-1480',
                type: 'Public Research University',
                userId: this.userId,
                createdAt: new Date()
            },
            {
                name: 'Georgia Institute of Technology',
                location: 'Atlanta, GA',
                matchScore: 82,
                acceptanceRate: 16,
                satRange: '1370-1530',
                type: 'Public Research University',
                userId: this.userId,
                createdAt: new Date()
            },
            {
                name: 'University of Illinois Urbana-Champaign',
                location: 'Champaign, IL',
                matchScore: 80,
                acceptanceRate: 45,
                satRange: '1210-1470',
                type: 'Public Research University',
                userId: this.userId,
                createdAt: new Date()
            },
            {
                name: 'Purdue University',
                location: 'West Lafayette, IN',
                matchScore: 78,
                acceptanceRate: 53,
                satRange: '1190-1440',
                type: 'Public Research University',
                userId: this.userId,
                createdAt: new Date()
            }
        ];

        for (const school of sampleSchools) {
            await addDoc(collection(this.db, 'schoolRecommendations'), school);
        }

        console.log('✅ Created 6 sample school recommendations');
    }

    /**
     * Create sample test score
     */
    async createSampleTestScore() {
        const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

        const sampleScore = {
            userId: this.userId,
            testType: 'SAT',
            totalScore: 1380,
            mathScore: 720,
            readingScore: 660,
            essayScore: null,
            testDate: new Date('2024-10-05'),
            completedAt: new Date('2024-10-05'),
            previousScore: 1320,
            createdAt: new Date()
        };

        await addDoc(collection(this.db, 'testScores'), sampleScore);

        console.log('✅ Created sample test score');
    }

    /**
     * Create welcome banner for sample data
     */
    showSampleDataBanner() {
        const banner = document.createElement('div');
        banner.className = 'sample-data-banner';
        banner.innerHTML = `
            <div class="sample-data-content">
                <div class="sample-data-icon">
                    <i class="fas fa-magic"></i>
                </div>
                <div class="sample-data-text">
                    <h3>Welcome to College Climb!</h3>
                    <p>We've added some sample data to help you get started. Feel free to edit or delete any of it.</p>
                </div>
                <button class="sample-data-dismiss" onclick="this.closest('.sample-data-banner').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        const dashboardContainer = document.querySelector('.dashboard-container');
        if (dashboardContainer) {
            dashboardContainer.insertBefore(banner, dashboardContainer.firstChild);
        }

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .sample-data-banner {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 16px;
                padding: 1.5rem;
                margin-bottom: 2rem;
                animation: slideDown 0.5s ease;
            }

            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .sample-data-content {
                display: flex;
                align-items: center;
                gap: 1.5rem;
            }

            .sample-data-icon {
                width: 60px;
                height: 60px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.8rem;
                color: white;
                flex-shrink: 0;
            }

            .sample-data-text {
                flex: 1;
                color: white;
            }

            .sample-data-text h3 {
                margin: 0 0 0.5rem 0;
                font-size: 1.3rem;
                font-weight: 700;
            }

            .sample-data-text p {
                margin: 0;
                font-size: 1rem;
                opacity: 0.95;
            }

            .sample-data-dismiss {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1.2rem;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                flex-shrink: 0;
            }

            .sample-data-dismiss:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: rotate(90deg);
            }

            @media (max-width: 768px) {
                .sample-data-content {
                    flex-direction: column;
                    text-align: center;
                }

                .sample-data-dismiss {
                    align-self: stretch;
                    width: 100%;
                    border-radius: 12px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Export to global scope
window.SampleDataGenerator = SampleDataGenerator;

console.log('📦 Sample Data Generator loaded');
