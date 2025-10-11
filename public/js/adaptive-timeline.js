// Adaptive Timeline Main JavaScript
class AdaptiveTimeline {
    constructor() {
        this.dateHelpers = new DateHelpers();
        this.timelineTemplates = new TimelineTemplates();
        this.userColleges = [];
        this.userTasks = new Map(); // Map of taskId -> task status
        this.currentView = 'timeline';
        this.init();
    }

    async init() {
        await this.loadSchoolsData();
        this.populateCollegeDropdown();
        this.bindEvents();
        await this.loadUserData();
    }

    async loadSchoolsData() {
        try {
            const response = await fetch('data/schools.json');
            this.schoolsData = await response.json();
        } catch (error) {
            console.error('Error loading schools data:', error);
            this.schoolsData = {};
        }
    }

    populateCollegeDropdown() {
        const dropdown = document.getElementById('college-list');
        dropdown.innerHTML = '<option value="">Choose a college...</option>';
        
        Object.keys(this.schoolsData).forEach(schoolKey => {
            const school = this.schoolsData[schoolKey];
            const option = document.createElement('option');
            option.value = schoolKey;
            option.textContent = school.name;
            dropdown.appendChild(option);
        });
    }

    bindEvents() {
        // Add college selection
        document.getElementById('college-list').addEventListener('change', (e) => {
            if (e.target.value) {
                this.addCollege(e.target.value);
                e.target.value = '';
            }
        });

        // Task status changes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                this.toggleTaskStatus(e.target.dataset.taskId);
            }
        });
    }

    addCollege(schoolKey) {
        if (!this.userColleges.find(c => c.key === schoolKey)) {
            const school = this.schoolsData[schoolKey];
            this.userColleges.push({
                key: schoolKey,
                ...school,
                addedDate: new Date()
            });
            this.saveUserData();
            if (this.hasRequiredData()) {
                this.generateTimeline();
            }
        }
    }

    removeCollege(schoolKey) {
        this.userColleges = this.userColleges.filter(c => c.key !== schoolKey);
        this.saveUserData();
        if (this.userColleges.length > 0) {
            this.generateTimeline();
        } else {
            this.showEmptyState();
        }
    }

    hasRequiredData() {
        const appType = document.getElementById('student-type').value;
        const gradYear = document.getElementById('graduation-year').value;
        return appType && gradYear && this.userColleges.length > 0;
    }

    generateTimeline() {
        if (!this.hasRequiredData()) {
            alert('Please select your application type, graduation year, and add at least one college.');
            return;
        }

        this.showLoading();
        
        // Simulate AI processing delay
        setTimeout(() => {
            this.buildTimeline();
            this.generateRecommendations();
            this.updateProgressSummary();
        }, 1000);
    }

    buildTimeline() {
        const appType = document.getElementById('student-type').value;
        const gradYear = parseInt(document.getElementById('graduation-year').value);
        const content = document.getElementById('timeline-content');
        
        let timelineHtml = '';
        
        this.userColleges.forEach(college => {
            const schoolTasks = this.generateSchoolTasks(college, appType, gradYear);
            timelineHtml += this.renderSchoolTimeline(college, schoolTasks);
        });

        content.innerHTML = timelineHtml;
    }

    generateSchoolTasks(college, appType, gradYear) {
        const deadlines = this.getCollegeDeadlines(college, appType, gradYear);
        const tasks = [];

        // Common Application tasks
        if (college.commonApp) {
            const commonTasks = this.timelineTemplates.getCommonAppTasks();
            commonTasks.forEach(task => {
                tasks.push({
                    ...task,
                    id: `${college.key}-${task.id}`,
                    deadline: deadlines.application,
                    urgency: this.dateHelpers.getUrgencyLevel(deadlines.application),
                    status: this.getTaskStatus(`${college.key}-${task.id}`)
                });
            });
        }

        // Supplemental essays
        if (college.supplementalEssays && college.supplementalEssays.length > 0) {
            college.supplementalEssays.forEach((essay, index) => {
                const essayTasks = this.timelineTemplates.getSupplementalEssayTasks(essay);
                essayTasks.forEach(task => {
                    tasks.push({
                        ...task,
                        id: `${college.key}-essay-${index}-${task.id}`,
                        title: `${essay.prompt.substring(0, 50)}... - ${task.title}`,
                        deadline: deadlines.application,
                        urgency: this.dateHelpers.getUrgencyLevel(deadlines.application),
                        status: this.getTaskStatus(`${college.key}-essay-${index}-${task.id}`)
                    });
                });
            });
        }

        // Recommendation letters
        if (college.recommendationLetters) {
            const recTasks = this.timelineTemplates.getRecommendationTasks(college.recommendationLetters);
            recTasks.forEach(task => {
                tasks.push({
                    ...task,
                    id: `${college.key}-${task.id}`,
                    deadline: this.dateHelpers.addDays(deadlines.application, -14), // 2 weeks before app deadline
                    urgency: this.dateHelpers.getUrgencyLevel(this.dateHelpers.addDays(deadlines.application, -14)),
                    status: this.getTaskStatus(`${college.key}-${task.id}`)
                });
            });
        }

        // Financial aid tasks
        if (deadlines.financialAid) {
            const fafsa = this.timelineTemplates.getFAFSATasks();
            fafsa.forEach(task => {
                tasks.push({
                    ...task,
                    id: `${college.key}-${task.id}`,
                    deadline: deadlines.financialAid,
                    urgency: this.dateHelpers.getUrgencyLevel(deadlines.financialAid),
                    status: this.getTaskStatus(`${college.key}-${task.id}`)
                });
            });
        }

        // Transcripts and test scores
        const academicTasks = this.timelineTemplates.getAcademicRecordTasks();
        academicTasks.forEach(task => {
            tasks.push({
                ...task,
                id: `${college.key}-${task.id}`,
                deadline: this.dateHelpers.addDays(deadlines.application, -7), // 1 week before app deadline
                urgency: this.dateHelpers.getUrgencyLevel(this.dateHelpers.addDays(deadlines.application, -7)),
                status: this.getTaskStatus(`${college.key}-${task.id}`)
            });
        });

        // Sort tasks by deadline and urgency
        return tasks.sort((a, b) => {
            const deadlineCompare = new Date(a.deadline) - new Date(b.deadline);
            if (deadlineCompare !== 0) return deadlineCompare;
            
            const urgencyOrder = { 'overdue': 0, 'urgent': 1, 'warning': 2, 'upcoming': 3, 'future': 4 };
            return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        });
    }

    getCollegeDeadlines(college, appType, gradYear) {
        const deadlines = {};
        const year = gradYear - 1; // Application year is one year before graduation

        // Set application deadline based on type
        if (appType === 'ED' && college.deadlines.ED) {
            deadlines.application = new Date(`${year}-${college.deadlines.ED}`);
        } else if (appType === 'EA' && college.deadlines.EA) {
            deadlines.application = new Date(`${year}-${college.deadlines.EA}`);
        } else if (college.deadlines.RD) {
            deadlines.application = new Date(`${year + 1}-${college.deadlines.RD}`);
        }

        // Financial aid deadlines
        if (college.deadlines.financialAid) {
            deadlines.financialAid = new Date(`${year + 1}-${college.deadlines.financialAid}`);
        }

        return deadlines;
    }

    renderSchoolTimeline(college, tasks) {
        const appType = document.getElementById('student-type').value;
        const deadline = this.getCollegeDeadlines(college, appType, parseInt(document.getElementById('graduation-year').value)).application;
        
        const tasksByCategory = this.groupTasksByCategory(tasks);
        
        return `
            <div class="school-timeline">
                <div class="school-header">
                    <div class="school-info">
                        <h3>${college.name}</h3>
                        <p>${college.location} • ${college.type}</p>
                    </div>
                    <div class="deadline-badge">
                        ${this.dateHelpers.formatDate(deadline)} • ${this.dateHelpers.getRelativeTime(deadline)}
                    </div>
                    <button class="btn" style="background: rgba(255,255,255,0.2); margin-left: 15px;" onclick="timeline.removeCollege('${college.key}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="tasks-container">
                    ${Object.entries(tasksByCategory).map(([category, categoryTasks]) => 
                        this.renderTaskCategory(category, categoryTasks)
                    ).join('')}
                </div>
            </div>
        `;
    }

    groupTasksByCategory(tasks) {
        const categories = {};
        tasks.forEach(task => {
            if (!categories[task.category]) {
                categories[task.category] = [];
            }
            categories[task.category].push(task);
        });
        return categories;
    }

    renderTaskCategory(category, tasks) {
        return `
            <div class="task-category">
                <div class="category-header">
                    <i class="fas fa-${this.getCategoryIcon(category)}"></i>
                    ${category} (${tasks.filter(t => t.status === 'done').length}/${tasks.length})
                </div>
                <div class="task-list">
                    ${tasks.map(task => this.renderTask(task)).join('')}
                </div>
            </div>
        `;
    }

    renderTask(task) {
        const isChecked = task.status === 'done' ? 'checked' : '';
        const isInProgress = task.status === 'in-progress';
        
        return `
            <div class="task-item ${task.status === 'done' ? 'completed' : ''}">
                <input type="checkbox" class="task-checkbox" data-task-id="${task.id}" ${isChecked}>
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-description">${task.description}</div>
                </div>
                <div class="task-meta">
                    <div class="task-deadline urgency-${task.urgency}">
                        ${this.dateHelpers.formatDate(task.deadline)}
                    </div>
                    <div class="status-badge status-${task.status.replace('-', '')}">
                        ${task.status.replace('-', ' ').toUpperCase()}
                    </div>
                    ${isInProgress ? '<button class="btn" style="font-size: 0.8rem; padding: 4px 8px;" onclick="timeline.markInProgress(\'' + task.id + '\')">Mark In Progress</button>' : ''}
                </div>
            </div>
        `;
    }

    getCategoryIcon(category) {
        const icons = {
            'Application': 'file-alt',
            'Essays': 'pen',
            'Recommendations': 'user-friends',
            'Academic Records': 'graduation-cap',
            'Financial Aid': 'dollar-sign',
            'Interviews': 'comments',
            'Visits': 'map-marker-alt'
        };
        return icons[category] || 'tasks';
    }

    getTaskStatus(taskId) {
        return this.userTasks.get(taskId) || 'todo';
    }

    async toggleTaskStatus(taskId) {
        const currentStatus = this.getTaskStatus(taskId);
        let newStatus;
        
        if (currentStatus === 'todo') {
            newStatus = 'done';
        } else if (currentStatus === 'done') {
            newStatus = 'todo';
        }
        
        this.userTasks.set(taskId, newStatus);
        
        // Save to API
        try {
            await this.updateTaskStatusAPI(taskId, newStatus);
        } catch (error) {
            console.error('Failed to update task status on server:', error);
        }
        
        this.saveUserData();
        this.generateTimeline(); // Refresh display
    }

    async markInProgress(taskId) {
        this.userTasks.set(taskId, 'in-progress');
        
        // Save to API
        try {
            await this.updateTaskStatusAPI(taskId, 'in-progress');
        } catch (error) {
            console.error('Failed to update task status on server:', error);
        }
        
        this.saveUserData();
        this.generateTimeline();
    }

    async updateTaskStatusAPI(taskId, status, notes = '') {
        try {
            const response = await fetch('/api/timeline-data', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: 'demo-user', // In production, get from auth
                    taskId,
                    status,
                    notes
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API update failed:', error);
            throw error;
        }
    }

    async generateRecommendations() {
        try {
            const recommendationsData = await this.fetchAIRecommendations();
            const container = document.getElementById('recommendations-content');
            
            if (recommendationsData && recommendationsData.length > 0) {
                container.innerHTML = recommendationsData.map(rec => `
                    <div class="recommendation-item">
                        <h4><i class="fas fa-${rec.icon}"></i> ${rec.title}</h4>
                        <p>${rec.description}</p>
                    </div>
                `).join('');
            } else {
                // Fallback to local recommendations
                const recommendations = this.getAIRecommendations();
                container.innerHTML = recommendations.map(rec => `
                    <div class="recommendation-item">
                        <h4><i class="fas fa-${rec.icon}"></i> ${rec.title}</h4>
                        <p>${rec.description}</p>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error generating recommendations:', error);
            // Fallback to local recommendations
            const recommendations = this.getAIRecommendations();
            const container = document.getElementById('recommendations-content');
            container.innerHTML = recommendations.map(rec => `
                <div class="recommendation-item">
                    <h4><i class="fas fa-${rec.icon}"></i> ${rec.title}</h4>
                    <p>${rec.description}</p>
                </div>
            `).join('');
        }
    }

    async fetchAIRecommendations() {
        try {
            const response = await fetch('/api/timeline-recommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    colleges: this.userColleges,
                    tasks: Object.fromEntries(this.userTasks),
                    userProfile: this.getUserProfile(),
                    timelineData: this.getTimelineData()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.recommendations;
        } catch (error) {
            console.error('Failed to fetch AI recommendations:', error);
            // Return mock recommendations when API is not available
            return this.getMockRecommendations();
        }
    }

    getMockRecommendations() {
        const overdueTasks = this.getOverdueTasks();
        const urgentTasks = this.getUrgentTasks();
        const recommendations = [];

        if (overdueTasks.length > 0) {
            recommendations.push({
                icon: 'exclamation-triangle',
                title: 'Overdue Tasks Need Attention',
                description: `You have ${overdueTasks.length} overdue tasks. Focus on these immediately to stay on track with your applications.`
            });
        }

        if (urgentTasks.length > 0) {
            recommendations.push({
                icon: 'clock',
                title: 'Urgent Deadlines Approaching',
                description: `${urgentTasks.length} tasks are due within the next week. Plan your time accordingly to meet these deadlines.`
            });
        }

        // Essay-specific recommendations
        const essayTasks = this.getIncompleteEssayTasks();
        if (essayTasks.length > 0) {
            recommendations.push({
                icon: 'pen',
                title: 'Essay Writing Strategy',
                description: 'Start with brainstorming sessions for each prompt. Use our Essay Coach feature for personalized feedback and guidance.'
            });
        }

        // College-specific recommendations
        if (this.userColleges.some(c => c.type === 'Ivy League' || c.name.includes('Harvard') || c.name.includes('Stanford'))) {
            recommendations.push({
                icon: 'trophy',
                title: 'Highly Competitive Schools',
                description: 'For top-tier applications, ensure your essays showcase unique perspectives and exceptional achievements. Start early!'
            });
        }

        // Default recommendations if no urgent items
        if (recommendations.length === 0) {
            recommendations.push({
                icon: 'star',
                title: 'Great Progress!',
                description: 'You\'re doing well with your applications. Keep up the momentum and stay organized!'
            }, {
                icon: 'calendar',
                title: 'Stay Ahead of Deadlines',
                description: 'Set weekly goals and break down large tasks into smaller, manageable steps to maintain steady progress.'
            });
        }

        return recommendations.slice(0, 4); // Limit to 4 recommendations
    }

    getAIRecommendations() {
        const recommendations = [];
        const overdueTasks = this.getOverdueTasks();
        const urgentTasks = this.getUrgentTasks();
        
        if (overdueTasks.length > 0) {
            recommendations.push({
                icon: 'exclamation-triangle',
                title: 'Overdue Tasks Need Attention',
                description: `You have ${overdueTasks.length} overdue tasks. Focus on these immediately to stay on track.`
            });
        }
        
        if (urgentTasks.length > 0) {
            recommendations.push({
                icon: 'clock',
                title: 'Urgent Deadlines Approaching',
                description: `${urgentTasks.length} tasks are due within the next week. Plan your time accordingly.`
            });
        }
        
        // Essay-specific recommendations
        const essayTasks = this.getIncompleteEssayTasks();
        if (essayTasks.length > 0) {
            recommendations.push({
                icon: 'pen',
                title: 'Essay Writing Tips',
                description: 'Start with brainstorming and outlining. Use our Essay Coach feature for personalized feedback.'
            });
        }
        
        // Default motivational recommendations
        if (recommendations.length === 0) {
            recommendations.push({
                icon: 'star',
                title: 'Great Progress!',
                description: 'You\'re doing well with your applications. Keep up the momentum!'
            });
        }
        
        return recommendations;
    }

    updateProgressSummary() {
        const progress = this.calculateProgress();
        const container = document.getElementById('progress-content');
        
        container.innerHTML = Object.entries(progress).map(([school, data]) => `
            <div class="progress-item">
                <div>
                    <strong>${this.schoolsData[school]?.name || school}</strong>
                    <div style="font-size: 0.9rem; color: #666;">${data.completed}/${data.total} tasks</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${data.percentage}%"></div>
                </div>
            </div>
        `).join('');
    }

    calculateProgress() {
        const progress = {};
        
        this.userColleges.forEach(college => {
            const appType = document.getElementById('student-type').value;
            const gradYear = parseInt(document.getElementById('graduation-year').value);
            const tasks = this.generateSchoolTasks(college, appType, gradYear);
            
            const completed = tasks.filter(t => this.getTaskStatus(t.id) === 'done').length;
            const total = tasks.length;
            
            progress[college.key] = {
                completed,
                total,
                percentage: total > 0 ? Math.round((completed / total) * 100) : 0
            };
        });
        
        return progress;
    }

    getOverdueTasks() {
        const now = new Date();
        const overdue = [];
        
        this.userColleges.forEach(college => {
            const appType = document.getElementById('student-type').value;
            const gradYear = parseInt(document.getElementById('graduation-year').value);
            if (appType && gradYear) {
                const tasks = this.generateSchoolTasks(college, appType, gradYear);
                tasks.forEach(task => {
                    if (new Date(task.deadline) < now && this.getTaskStatus(task.id) !== 'done') {
                        overdue.push(task);
                    }
                });
            }
        });
        
        return overdue;
    }

    getUrgentTasks() {
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const urgent = [];
        
        this.userColleges.forEach(college => {
            const appType = document.getElementById('student-type').value;
            const gradYear = parseInt(document.getElementById('graduation-year').value);
            if (appType && gradYear) {
                const tasks = this.generateSchoolTasks(college, appType, gradYear);
                tasks.forEach(task => {
                    const deadline = new Date(task.deadline);
                    if (deadline > now && deadline <= weekFromNow && this.getTaskStatus(task.id) !== 'done') {
                        urgent.push(task);
                    }
                });
            }
        });
        
        return urgent;
    }

    getIncompleteEssayTasks() {
        const incomplete = [];
        
        this.userColleges.forEach(college => {
            const appType = document.getElementById('student-type').value;
            const gradYear = parseInt(document.getElementById('graduation-year').value);
            if (appType && gradYear) {
                const tasks = this.generateSchoolTasks(college, appType, gradYear);
                tasks.forEach(task => {
                    if (task.category === 'Essays' && this.getTaskStatus(task.id) !== 'done') {
                        incomplete.push(task);
                    }
                });
            }
        });
        
        return incomplete;
    }

    switchView(view) {
        this.currentView = view;
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        if (view === 'calendar') {
            this.renderCalendarView();
        } else {
            this.generateTimeline();
        }
    }

    renderCalendarView() {
        const content = document.getElementById('timeline-content');
        content.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-calendar-alt" style="font-size: 3rem; color: #667eea; margin-bottom: 20px;"></i>
                <h3>Calendar View</h3>
                <p>Calendar integration coming soon! This will show your tasks in a monthly calendar format.</p>
            </div>
        `;
    }

    showLoading() {
        const content = document.getElementById('timeline-content');
        content.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 20px;"></i>
                <h3>Generating Your Personalized Timeline...</h3>
                <p>Our AI is analyzing your profile and creating custom recommendations.</p>
            </div>
        `;
    }

    showEmptyState() {
        const content = document.getElementById('timeline-content');
        content.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-rocket"></i>
                <h3>Ready to Start Your Journey?</h3>
                <p>Select your application type and graduation year to generate your personalized timeline.</p>
            </div>
        `;
    }

    getUserProfile() {
        return {
            graduationYear: parseInt(document.getElementById('graduation-year').value) || 2026,
            applicationTypes: [document.getElementById('student-type').value || 'RD'],
            preferences: {
                notificationEnabled: true,
                calendarSync: false
            }
        };
    }

    getTimelineData() {
        return {
            colleges: this.userColleges,
            tasks: Object.fromEntries(this.userTasks),
            generatedAt: new Date().toISOString(),
            lastAccessed: new Date().toISOString()
        };
    }

    async saveToCloud() {
        try {
            const response = await fetch('/api/timeline-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: 'demo-user', // In production, get from auth
                    colleges: this.userColleges,
                    tasks: Object.fromEntries(this.userTasks),
                    preferences: this.getUserProfile()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Data saved to cloud:', result);
            return result;
        } catch (error) {
            console.error('Failed to save to cloud:', error);
            throw error;
        }
    }

    async loadFromCloud() {
        try {
            const response = await fetch('/api/timeline-data?userId=demo-user');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.success && result.data) {
                this.userColleges = result.data.colleges || [];
                this.userTasks = new Map(Object.entries(result.data.tasks || {}));
                
                // Update UI with loaded data
                if (result.data.preferences) {
                    const { graduationYear, applicationTypes } = result.data.preferences;
                    if (graduationYear) {
                        document.getElementById('graduation-year').value = graduationYear;
                    }
                    if (applicationTypes && applicationTypes[0]) {
                        document.getElementById('student-type').value = applicationTypes[0];
                    }
                }
            }
            return result;
        } catch (error) {
            console.error('Failed to load from cloud:', error);
            return null;
        }
    }

    saveUserData() {
        const userData = {
            colleges: this.userColleges,
            tasks: Array.from(this.userTasks.entries()),
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('adaptiveTimeline', JSON.stringify(userData));
        
        // Also save to cloud (non-blocking)
        this.saveToCloud().catch(error => {
            console.log('Cloud save failed, data saved locally only');
        });
    }

    async loadUserData() {
        // Try to load from cloud first
        const cloudData = await this.loadFromCloud();
        
        if (!cloudData || !cloudData.success) {
            // Fallback to local storage
            const saved = localStorage.getItem('adaptiveTimeline');
            if (saved) {
                const data = JSON.parse(saved);
                this.userColleges = data.colleges || [];
                this.userTasks = new Map(data.tasks || []);
            }
        }
        
        if (this.userColleges.length > 0) {
            this.generateTimeline();
        }
    }
}

// Global functions for button clicks
function generateTimeline() {
    timeline.generateTimeline();
}

function switchView(view) {
    timeline.switchView(view);
}

// Initialize timeline when page loads
let timeline;
document.addEventListener('DOMContentLoaded', () => {
    timeline = new AdaptiveTimeline();
});
