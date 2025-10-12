/**
 * Timeline Generator
 * Creates personalized application timelines
 */

class TimelineGenerator {
    constructor(aiEngine, applications) {
        this.aiEngine = aiEngine;
        this.applications = applications;
    }

    async generateTimeline() {
        const timeline = await this.aiEngine.generateTimeline();
        return this.organizeByMonth(timeline);
    }

    organizeByMonth(timeline) {
        const organized = {};
        
        timeline.forEach(task => {
            const month = new Date(task.dueDate).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
            });
            
            if (!organized[month]) {
                organized[month] = [];
            }
            
            organized[month].push(task);
        });

        return organized;
    }

    getUpcomingTasks(days = 7) {
        const now = new Date();
        const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        return this.applications.filter(app => {
            const deadline = new Date(app.deadline);
            return deadline >= now && deadline <= future;
        }).map(app => ({
            title: `${app.collegeName} Application Due`,
            dueDate: app.deadline,
            priority: this.calculatePriority(app.deadline),
            type: 'application_deadline'
        }));
    }

    calculatePriority(deadline) {
        const daysUntil = (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24);
        
        if (daysUntil <= 3) return 'urgent';
        if (daysUntil <= 7) return 'high';
        if (daysUntil <= 14) return 'medium';
        return 'low';
    }
}

window.TimelineGenerator = TimelineGenerator;
