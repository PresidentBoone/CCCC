/**
 * Network Monitor Utility
 * Detects online/offline status and shows user-friendly notifications
 * iOS Safari compatible
 */

class NetworkMonitor {
    constructor() {
        this.isOnline = navigator.onLine;
        this.listeners = [];
        this.init();
    }

    init() {
        // Listen for online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Initial status log
        console.log(`🌐 Network Monitor initialized - Status: ${this.isOnline ? 'Online' : 'Offline'}`);
    }

    handleOnline() {
        this.isOnline = true;
        console.log('✅ Network connection restored');
        this.showToast('Back online! Your data will sync now.', 'success');
        this.notifyListeners(true);
    }

    handleOffline() {
        this.isOnline = false;
        console.warn('⚠️ Network connection lost');
        this.showToast('You\'re offline. Some features may not work.', 'warning');
        this.notifyListeners(false);
    }

    /**
     * Register listener for network status changes
     */
    onStatusChange(callback) {
        this.listeners.push(callback);
    }

    /**
     * Notify all listeners of status change
     */
    notifyListeners(isOnline) {
        this.listeners.forEach(callback => {
            try {
                callback(isOnline);
            } catch (error) {
                console.error('Network listener error:', error);
            }
        });
    }

    /**
     * Check if network is available before Firestore operation
     * @returns {boolean} True if online, false if offline
     */
    checkBeforeOperation() {
        if (!this.isOnline) {
            this.showToast('Cannot save - you\'re offline. Changes will be lost.', 'error', 5000);
            return false;
        }
        return true;
    }

    /**
     * Show user-friendly toast notification
     * Integrates with existing toast system or creates fallback
     */
    showToast(message, type = 'info', duration = 3000) {
        // Try to use existing toast system
        if (typeof window.showToast === 'function') {
            window.showToast(message, type, duration);
            return;
        }

        // Fallback: Create simple toast if no system exists
        const toast = document.createElement('div');
        toast.className = `network-toast network-toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * Get current network status
     */
    getStatus() {
        return {
            isOnline: this.isOnline,
            type: navigator.connection?.effectiveType || 'unknown',
            downlink: navigator.connection?.downlink || 'unknown',
            rtt: navigator.connection?.rtt || 'unknown'
        };
    }
}

// Create singleton instance
const networkMonitor = new NetworkMonitor();

// Make globally available
window.networkMonitor = networkMonitor;

// Export for Node.js/CommonJS compatibility (server-side only)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = networkMonitor;
}

// Note: ES6 exports removed to allow loading as regular script tag
// All functionality is available on window.networkMonitor

console.log('🌐 Network Monitor loaded');
