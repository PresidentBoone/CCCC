// Date and time utility functions for the Adaptive Timeline system
class DateHelpers {
    static formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    static formatDateTime(date) {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    static getDaysUntil(targetDate) {
        const target = new Date(targetDate);
        const today = new Date();
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    static getDaysFromNow(days) {
        const future = new Date();
        future.setDate(future.getDate() + days);
        return future;
    }

    static getUrgencyLevel(daysUntil) {
        if (daysUntil < 0) return 'overdue';
        if (daysUntil <= 7) return 'urgent';
        if (daysUntil <= 14) return 'warning';
        if (daysUntil <= 30) return 'upcoming';
        return 'future';
    }

    static getUrgencyColor(urgencyLevel) {
        const colors = {
            overdue: '#ef4444',
            urgent: '#f59e0b',
            warning: '#f59e0b',
            upcoming: '#3b82f6',
            future: '#10b981'
        };
        return colors[urgencyLevel] || '#10b981';
    }

    static isWeekend(date) {
        const day = new Date(date).getDay();
        return day === 0 || day === 6;
    }

    static addBusinessDays(date, businessDays) {
        const result = new Date(date);
        let addedDays = 0;
        
        while (addedDays < businessDays) {
            result.setDate(result.getDate() + 1);
            if (!this.isWeekend(result)) {
                addedDays++;
            }
        }
        
        return result;
    }

    static generateDeadlines(applicationDeadline, type = 'RD') {
        const deadline = new Date(applicationDeadline);
        const deadlines = {};

        // Main application deadline
        deadlines.application = deadline;

        // Supplemental essays (usually same as application)
        deadlines.supplements = deadline;

        // Recommendations (2-3 weeks before app deadline)
        deadlines.recommendations = this.addBusinessDays(new Date(deadline), -15);

        // Transcripts (2 weeks before)
        deadlines.transcripts = this.addBusinessDays(new Date(deadline), -10);

        // FAFSA/CSS Profile
        if (type === 'ED' || type === 'EA') {
            deadlines.fafsa = new Date(deadline.getFullYear() + 1, 2, 15); // March 15
            deadlines.cssProfile = deadline;
        } else {
            deadlines.fafsa = new Date(deadline.getFullYear(), 2, 15); // March 15
            deadlines.cssProfile = new Date(deadline.getFullYear(), 1, 15); // February 15
        }

        // Testing deadlines (SAT/ACT - 6 weeks before)
        deadlines.testing = this.addBusinessDays(new Date(deadline), -42);

        return deadlines;
    }

    static getRelativeTimeString(date) {
        const target = new Date(date);
        const now = new Date();
        const diffTime = target.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            const pastDays = Math.abs(diffDays);
            if (pastDays === 1) return 'Yesterday';
            if (pastDays < 7) return `${pastDays} days ago`;
            if (pastDays < 30) return `${Math.floor(pastDays / 7)} weeks ago`;
            return `${Math.floor(pastDays / 30)} months ago`;
        }

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays < 7) return `In ${diffDays} days`;
        if (diffDays < 30) return `In ${Math.floor(diffDays / 7)} weeks`;
        if (diffDays < 365) return `In ${Math.floor(diffDays / 30)} months`;
        return `In ${Math.floor(diffDays / 365)} years`;
    }

    static sortByDeadline(items, ascending = true) {
        return items.sort((a, b) => {
            const dateA = new Date(a.deadline || a.dueDate);
            const dateB = new Date(b.deadline || b.dueDate);
            return ascending ? dateA - dateB : dateB - dateA;
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DateHelpers;
} else {
    window.DateHelpers = DateHelpers;
}
