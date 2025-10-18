/**
 * Authentication Guard System
 * Protects pages from unauthorized access and provides user session management
 * 
 * Usage:
 * 1. Include this script in your protected pages: <script type="module" src="/js/auth-guard.js"></script>
 * 2. Call: AuthGuard.protect() at the top of your page initialization
 */

class AuthGuard {
    constructor() {
        this.publicPages = [
            '/index.html',
            '/login',
            '/signup.html',
            '/about.html',
            '/pricing.html',
            '/',
            '/index',
            '/login',
            '/signup',
            '/about',
            '/pricing'
        ];
        
        this.currentUser = null;
        this.isInitialized = false;
        this.onAuthCallbacks = [];
    }

    /**
     * Check if current page is public
     */
    isPublicPage() {
        const currentPath = window.location.pathname;
        return this.publicPages.some(page => {
            return currentPath === page || currentPath.endsWith(page);
        });
    }

    /**
     * Protect current page - redirect to login if not authenticated
     */
    async protect() {
        // Don't protect public pages
        if (this.isPublicPage()) {
            return true;
        }

        try {
            // Wait for Firebase to be ready
            const firebaseConfig = window.firebaseConfigInstance || await this.waitForFirebase();
            
            if (!firebaseConfig || !firebaseConfig.auth) {
                console.error('Firebase not initialized');
                this.redirectToLogin();
                return false;
            }

            // Set up auth state listener
            return new Promise((resolve) => {
                const { onAuthStateChanged } = window.firebaseAuth || {};
                
                if (!onAuthStateChanged) {
                    console.error('Firebase Auth not available');
                    this.redirectToLogin();
                    resolve(false);
                    return;
                }

                onAuthStateChanged(firebaseConfig.auth, (user) => {
                    if (user) {
                        this.currentUser = user;
                        this.isInitialized = true;
                        this.executeAuthCallbacks(user);
                        resolve(true);
                    } else {
                        console.log('No user authenticated, redirecting to login');
                        this.redirectToLogin();
                        resolve(false);
                    }
                });
            });
        } catch (error) {
            console.error('Auth guard error:', error);
            this.redirectToLogin();
            return false;
        }
    }

    /**
     * Wait for Firebase to be initialized
     */
    async waitForFirebase(maxWait = 5000) {
        const startTime = Date.now();
        
        while (!window.firebaseConfigInstance && (Date.now() - startTime) < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return window.firebaseConfigInstance;
    }

    /**
     * Redirect to login page
     */
    redirectToLogin() {
        const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?redirect=${currentUrl}`;
    }

    /**
     * Register callback to run when user is authenticated
     */
    onAuthenticated(callback) {
        if (this.isInitialized && this.currentUser) {
            // User already authenticated, run immediately
            callback(this.currentUser);
        } else {
            // Store callback to run when user authenticates
            this.onAuthCallbacks.push(callback);
        }
    }

    /**
     * Execute all registered callbacks
     */
    executeAuthCallbacks(user) {
        this.onAuthCallbacks.forEach(callback => {
            try {
                callback(user);
            } catch (error) {
                console.error('Error executing auth callback:', error);
            }
        });
        this.onAuthCallbacks = [];
    }

    /**
     * Get current authenticated user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Logout current user
     */
    async logout() {
        try {
            const firebaseConfig = window.firebaseConfigInstance;
            if (firebaseConfig && firebaseConfig.auth) {
                const { signOut } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
                await signOut(firebaseConfig.auth);
            }
            this.currentUser = null;
            this.redirectToLogin();
        } catch (error) {
            console.error('Logout error:', error);
            // Force redirect even on error
            this.redirectToLogin();
        }
    }

    /**
     * Require specific user properties
     */
    async requireUserData(requiredFields = []) {
        if (!this.currentUser) {
            this.redirectToLogin();
            return null;
        }

        try {
            const firebaseConfig = window.firebaseConfigInstance;
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            const userDoc = await getDoc(doc(firebaseConfig.db, 'users', this.currentUser.uid));
            
            if (!userDoc.exists()) {
                console.warn('User document not found, creating...');
                return null;
            }

            const userData = userDoc.data();

            // Check if all required fields exist
            const missingFields = requiredFields.filter(field => !userData[field]);
            
            if (missingFields.length > 0) {
                console.warn('Missing required user data:', missingFields);
                // Redirect to profile completion
                window.location.href = `/profile?complete=${missingFields.join(',')}`;
                return null;
            }

            return userData;
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    }
}

// Create global instance
window.AuthGuard = new AuthGuard();

// Auto-protect on page load for non-module scripts
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.authGuardManualMode) {
            window.AuthGuard.protect();
        }
    });
} else {
    if (!window.authGuardManualMode) {
        window.AuthGuard.protect();
    }
}

// Export for module usage
export default window.AuthGuard;
