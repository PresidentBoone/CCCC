/**
 * 📱 PWA Installer
 * Manages service worker registration and PWA install prompts
 * Part of the Billion-Dollar Platform Infrastructure
 */

class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.init();
    }

    async init() {
        this.checkInstallation();
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupAppInstalledListener();
    }

    /**
     * Check if PWA is Already Installed
     */
    checkInstallation() {
        // Check if running in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            console.log('✅ PWA is installed and running in standalone mode');
            this.hideInstallButton();
        }

        // Check via navigator
        if (navigator.standalone) {
            this.isInstalled = true;
            console.log('✅ PWA is installed (iOS)');
            this.hideInstallButton();
        }
    }

    /**
     * Register Service Worker
     */
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.log('⚠️ Service Workers not supported');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/'
            });

            console.log('✅ Service Worker registered:', registration.scope);

            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New version available
                        this.showUpdateNotification();
                    }
                });
            });

            // Update service worker when page loads
            if (registration.waiting) {
                this.showUpdateNotification();
            }

        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
        }
    }

    /**
     * Setup Install Prompt
     */
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('📱 Install prompt available');
            
            // Prevent default prompt
            e.preventDefault();
            
            // Store event for later use
            this.deferredPrompt = e;
            
            // Show custom install button
            this.showInstallButton();
        });
    }

    /**
     * Show Install Button
     */
    showInstallButton() {
        // Create install button if it doesn't exist
        let installButton = document.getElementById('pwa-install-button');
        
        if (!installButton) {
            installButton = document.createElement('button');
            installButton.id = 'pwa-install-button';
            installButton.className = 'pwa-install-btn';
            installButton.innerHTML = `
                <span class="install-icon">📱</span>
                <span class="install-text">Install App</span>
            `;
            
            installButton.addEventListener('click', () => this.promptInstall());
            
            // Add to page
            document.body.appendChild(installButton);
            
            // Add styles
            this.addInstallButtonStyles();
        }
        
        installButton.style.display = 'flex';
        
        // Animate in
        setTimeout(() => {
            installButton.classList.add('visible');
        }, 500);
    }

    hideInstallButton() {
        const installButton = document.getElementById('pwa-install-button');
        if (installButton) {
            installButton.style.display = 'none';
        }
    }

    /**
     * Prompt User to Install
     */
    async promptInstall() {
        if (!this.deferredPrompt) {
            console.log('❌ No install prompt available');
            return;
        }

        // Show the install prompt
        this.deferredPrompt.prompt();

        // Wait for user response
        const { outcome } = await this.deferredPrompt.userChoice;
        
        console.log(`User response to install prompt: ${outcome}`);

        if (outcome === 'accepted') {
            console.log('✅ User accepted install');
            this.trackInstallEvent('accepted');
        } else {
            console.log('❌ User dismissed install');
            this.trackInstallEvent('dismissed');
        }

        // Clear the deferred prompt
        this.deferredPrompt = null;
        
        // Hide button
        this.hideInstallButton();
    }

    /**
     * Setup App Installed Listener
     */
    setupAppInstalledListener() {
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA installed successfully');
            this.isInstalled = true;
            this.hideInstallButton();
            this.trackInstallEvent('installed');
            this.showInstalledNotification();
        });
    }

    /**
     * Show Update Notification
     */
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'pwa-update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <span class="update-icon">🔄</span>
                <div class="update-text">
                    <strong>Update Available</strong>
                    <p>A new version of College Climb is ready!</p>
                </div>
                <button class="update-button" onclick="window.pwaInstaller.updateApp()">
                    Update Now
                </button>
                <button class="update-close" onclick="this.parentElement.parentElement.remove()">
                    ×
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        this.addUpdateNotificationStyles();
    }

    /**
     * Update App
     */
    async updateApp() {
        const registration = await navigator.serviceWorker.getRegistration();
        
        if (registration && registration.waiting) {
            // Tell the waiting service worker to activate
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            
            // Reload page when new service worker activates
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        }
    }

    /**
     * Show Installed Notification
     */
    showInstalledNotification() {
        const notification = document.createElement('div');
        notification.className = 'pwa-installed-notification';
        notification.innerHTML = `
            <div class="installed-content">
                <span class="installed-icon">🎉</span>
                <div class="installed-text">
                    <strong>App Installed!</strong>
                    <p>College Climb is now on your home screen</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    /**
     * Track Install Events
     */
    trackInstallEvent(action) {
        if (window.analytics) {
            window.analytics.trackEvent('pwa_install', {
                action: action,
                platform: this.getPlatform()
            });
        }
    }

    getPlatform() {
        const ua = navigator.userAgent;
        if (/android/i.test(ua)) return 'Android';
        if (/iPad|iPhone|iPod/.test(ua)) return 'iOS';
        if (/Windows/.test(ua)) return 'Windows';
        if (/Mac/.test(ua)) return 'macOS';
        return 'Unknown';
    }

    /**
     * Add Styles
     */
    addInstallButtonStyles() {
        if (document.getElementById('pwa-install-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'pwa-install-styles';
        styles.textContent = `
            .pwa-install-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 50px;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                transition: all 0.3s ease;
                z-index: 9999;
                opacity: 0;
                transform: translateY(20px);
            }
            .pwa-install-btn.visible {
                opacity: 1;
                transform: translateY(0);
            }
            .pwa-install-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
            }
            .install-icon {
                font-size: 20px;
            }
            @media (max-width: 768px) {
                .pwa-install-btn {
                    bottom: 10px;
                    right: 10px;
                    padding: 10px 20px;
                    font-size: 14px;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    addUpdateNotificationStyles() {
        if (document.getElementById('pwa-update-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'pwa-update-styles';
        styles.textContent = `
            .pwa-update-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                padding: 16px;
                max-width: 400px;
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
            }
            .update-content {
                display: flex;
                align-items: flex-start;
                gap: 12px;
            }
            .update-icon {
                font-size: 24px;
                flex-shrink: 0;
            }
            .update-text strong {
                display: block;
                color: #1f2937;
                margin-bottom: 4px;
            }
            .update-text p {
                color: #6b7280;
                margin: 0;
                font-size: 14px;
            }
            .update-button {
                background: #2563eb;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                margin-top: 12px;
                width: 100%;
            }
            .update-button:hover {
                background: #1d4ed8;
            }
            .update-close {
                position: absolute;
                top: 12px;
                right: 12px;
                background: none;
                border: none;
                font-size: 24px;
                color: #9ca3af;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
            .pwa-installed-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #10b981;
                color: white;
                border-radius: 12px;
                padding: 16px;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
            }
            .installed-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .installed-icon {
                font-size: 24px;
            }
            .installed-text strong {
                display: block;
                margin-bottom: 4px;
            }
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(styles);
    }
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pwaInstaller = new PWAInstaller();
    });
} else {
    window.pwaInstaller = new PWAInstaller();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAInstaller;
}
