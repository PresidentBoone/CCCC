/**
 * Dashboard Event Handlers
 *
 * Centralized event management for dashboard.html
 * Replaces inline onclick handlers for better CSP compliance and maintainability
 *
 * @module dashboard-events
 */

(function() {
    'use strict';

    /**
     * Initialize all event listeners when DOM is ready
     */
    function initializeDashboardEvents() {
        // Stat card navigation handlers
        initializeStatCards();

        // Test prep card handlers
        initializeTestPrepCards();

        // Button action handlers
        initializeButtons();

        // Modal and toast close handlers
        initializeCloseHandlers();

        // Analytics modal handlers
        initializeAnalyticsModal();
    }

    /**
     * Initialize stat card click handlers
     */
    function initializeStatCards() {
        // Application tracker stat card
        const appTrackerCard = document.querySelector('[data-action="show-application-tracker"]');
        if (appTrackerCard) {
            appTrackerCard.addEventListener('click', showApplicationTracker);
            appTrackerCard.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    showApplicationTracker();
                }
            });
        }

        // Essay coach stat card
        const essayCard = document.querySelector('[data-action="navigate-essay-coach"]');
        if (essayCard) {
            essayCard.addEventListener('click', () => {
                window.location.href = '/essay-coach';
            });
            essayCard.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.location.href = '/essay-coach';
                }
            });
        }

        // Scholarships stat card
        const scholarshipCard = document.querySelector('[data-action="navigate-scholarships"]');
        if (scholarshipCard) {
            scholarshipCard.addEventListener('click', () => {
                window.location.href = '/scholarships';
            });
            scholarshipCard.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.location.href = '/scholarships';
                }
            });
        }

        // Test prep stat card
        const testPrepCard = document.querySelector('[data-action="navigate-testprep"]');
        if (testPrepCard) {
            testPrepCard.addEventListener('click', () => {
                window.location.href = '/testprep';
            });
            testPrepCard.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.location.href = '/testprep';
                }
            });
        }

        // Progress analytics stat card
        const progressCard = document.querySelector('[data-action="show-progress-analytics"]');
        if (progressCard) {
            progressCard.addEventListener('click', showProgressAnalytics);
            progressCard.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    showProgressAnalytics();
                }
            });
        }
    }

    /**
     * Initialize test prep card click handlers
     */
    function initializeTestPrepCards() {
        // SAT prep card
        const satCard = document.querySelector('[data-action="navigate-sat-prep"]');
        if (satCard) {
            satCard.addEventListener('click', () => {
                window.location.href = '/testprep?test=sat';
            });
        }

        // ACT prep card
        const actCard = document.querySelector('[data-action="navigate-act-prep"]');
        if (actCard) {
            actCard.addEventListener('click', () => {
                window.location.href = '/testprep?test=act';
            });
        }

        // Diagnostic test card
        const diagnosticCard = document.querySelector('[data-action="navigate-diagnostic"]');
        if (diagnosticCard) {
            diagnosticCard.addEventListener('click', () => {
                window.location.href = '/testprep-practice?sessionType=diagnostic';
            });
        }
    }

    /**
     * Initialize button action handlers
     */
    function initializeButtons() {
        // Add college button
        const addCollegeBtn = document.querySelector('[data-action="add-college"]');
        if (addCollegeBtn) {
            addCollegeBtn.addEventListener('click', addCollege);
        }

        // View all applications button
        const viewAllBtn = document.querySelector('[data-action="view-all-applications"]');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', showApplicationTracker);
        }

        // Upgrade button
        const upgradeBtn = document.querySelector('[data-action="upgrade-account"]');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => {
                window.location.href = '/pricing';
            });
        }

        // View analytics button
        const analyticsBtn = document.querySelector('[data-action="view-analytics"]');
        if (analyticsBtn) {
            analyticsBtn.addEventListener('click', showProgressAnalytics);
        }

        // Open full timeline button
        const fullTimelineBtn = document.querySelector('[data-action="open-full-timeline"]');
        if (fullTimelineBtn) {
            fullTimelineBtn.addEventListener('click', openFullTimeline);
        }

        // Generate dashboard timeline button
        const generateTimelineBtn = document.querySelector('[data-action="generate-timeline"]');
        if (generateTimelineBtn) {
            generateTimelineBtn.addEventListener('click', generateDashboardTimeline);
        }

        // Product tour button
        const tourBtn = document.querySelector('[data-action="start-product-tour"]');
        if (tourBtn) {
            tourBtn.addEventListener('click', () => {
                if (typeof window.startProductTour === 'function') {
                    window.startProductTour();
                }
            });
        }

        // AI chat toggle button
        const aiChatBtn = document.querySelector('[data-action="toggle-ai-chat"]');
        if (aiChatBtn) {
            aiChatBtn.addEventListener('click', () => {
                if (window.aiChat && typeof window.aiChat.toggle === 'function') {
                    window.aiChat.toggle();
                }
            });
        }
    }

    /**
     * Initialize close button handlers for modals and toasts
     * Uses event delegation to handle dynamically created elements
     */
    function initializeCloseHandlers() {
        // Use event delegation on document body for close buttons and actions
        document.body.addEventListener('click', (e) => {
            const target = e.target.closest('button') || e.target;

            // Close toast notifications
            if (target.matches('[data-action="close-toast"]') ||
                (target.closest('.toast-notification') && target.matches('button[aria-label="Close notification"]'))) {
                const toast = target.closest('.toast-notification');
                if (toast) {
                    toast.remove();
                }
                return;
            }

            // Close modals
            if (target.matches('[data-action="close-modal"]')) {
                const modal = target.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
                return;
            }

            // Close analytics modal
            if (target.matches('[data-action="close-analytics-modal"]')) {
                const modal = document.getElementById('analyticsModal') || target.closest('.analytics-modal');
                if (modal) {
                    modal.remove();
                }
                return;
            }

            // Close app tracker overlay
            if (target.matches('.app-tracker-overlay')) {
                const container = target.parentElement;
                if (container) {
                    container.remove();
                }
                return;
            }

            // Close app tracker with close button
            if (target.matches('.app-tracker-close')) {
                const container = target.closest('.app-tracker-modal-container') ||
                                  target.parentElement.parentElement;
                if (container) {
                    container.remove();
                }
                return;
            }

            // Analytics modal quick actions
            if (target.matches('[data-action="analytics-start-essays"]')) {
                window.location.href = '/essay-coach';
                return;
            }

            if (target.matches('[data-action="analytics-manage-apps"]')) {
                const modal = target.closest('.analytics-modal');
                if (modal) {
                    modal.remove();
                }
                if (typeof window.showApplicationTracker === 'function') {
                    window.showApplicationTracker();
                }
                return;
            }

            if (target.matches('[data-action="analytics-find-scholarships"]')) {
                window.location.href = '/scholarships';
                return;
            }
        });
    }

    /**
     * Initialize analytics modal button handlers
     */
    function initializeAnalyticsModal() {
        // Export data button
        const exportBtn = document.querySelector('[data-action="export-analytics"]');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportAnalyticsData);
        }

        // Share progress button
        const shareBtn = document.querySelector('[data-action="share-progress"]');
        if (shareBtn) {
            shareBtn.addEventListener('click', shareProgress);
        }

        // View detailed report button
        const detailsBtn = document.querySelector('[data-action="view-detailed-report"]');
        if (detailsBtn) {
            detailsBtn.addEventListener('click', viewDetailedReport);
        }
    }

    /**
     * Show application tracker (referenced by stat card)
     * This function should already exist in dashboard-init.js or similar
     */
    function showApplicationTracker() {
        if (typeof window.showApplicationTracker === 'function') {
            window.showApplicationTracker();
        } else {
            console.warn('showApplicationTracker function not found');
        }
    }

    /**
     * Show progress analytics modal (referenced by stat card)
     * This function should already exist in dashboard-init.js or similar
     */
    function showProgressAnalytics() {
        if (typeof window.showProgressAnalytics === 'function') {
            window.showProgressAnalytics();
        } else {
            console.warn('showProgressAnalytics function not found');
        }
    }

    /**
     * Add college function (referenced by button)
     * This function should already exist in dashboard-init.js or similar
     */
    function addCollege() {
        if (typeof window.addCollege === 'function') {
            window.addCollege();
        } else {
            console.warn('addCollege function not found');
        }
    }

    /**
     * Export analytics data
     */
    function exportAnalyticsData() {
        if (typeof window.exportAnalyticsData === 'function') {
            window.exportAnalyticsData();
        } else {
            console.warn('exportAnalyticsData function not found');
        }
    }

    /**
     * Share progress
     */
    function shareProgress() {
        if (typeof window.shareProgress === 'function') {
            window.shareProgress();
        } else {
            console.warn('shareProgress function not found');
        }
    }

    /**
     * View detailed report
     */
    function viewDetailedReport() {
        if (typeof window.viewDetailedReport === 'function') {
            window.viewDetailedReport();
        } else {
            console.warn('viewDetailedReport function not found');
        }
    }

    /**
     * Open full timeline
     */
    function openFullTimeline() {
        if (typeof window.openFullTimeline === 'function') {
            window.openFullTimeline();
        } else {
            console.warn('openFullTimeline function not found');
        }
    }

    /**
     * Generate dashboard timeline
     */
    function generateDashboardTimeline() {
        if (typeof window.generateDashboardTimeline === 'function') {
            window.generateDashboardTimeline();
        } else {
            console.warn('generateDashboardTimeline function not found');
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeDashboardEvents);
    } else {
        initializeDashboardEvents();
    }

})();
