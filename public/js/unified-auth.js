/**
 * 🎯 UNIFIED AUTHENTICATION MANAGER
 * Billion-Dollar Quality - No More Sign-in/Sign-out Loops!
 * 
 * This replaces ALL auth-related scripts with a single, robust solution
 * Usage: Import this ONE file, and authentication just works.
 */

class UnifiedAuthManager {
    constructor() {
        this.user = null;
        this.auth = null;
        this.isInitialized = false;
        this.authStateCallbacks = [];
        this.initPromise = null;
        
        // Session persistence configuration
        this.SESSION_KEY = 'cccc_user_session';
        this.SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
        
        // Public pages that don't require authentication
        this.PUBLIC_PAGES = [
            '/', '/index.html', '/index',
            '/login.html', '/login',
            '/signup.html', '/signup',
            '/about.html', '/about',
            '/pricing.html', '/pricing'
        ];
    }

    /**
     * Initialize Firebase and Auth - Call this ONCE
     */
    async initialize() {
        // Prevent multiple initializations
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = (async () => {
            try {
                console.log('🔐 Initializing Unified Auth Manager...');

                // Import Firebase modules
                const { initializeApp, getApps } = await import(
                    'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'
                );
                const { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } = await import(
                    'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'
                );

                // Firebase configuration
                const firebaseConfig = {
                    apiKey: "AIzaSyDqL5ZoTKp36sk8J5TxuHn_y6ji4i9h20s",
                    authDomain: "collegeclimb-ai.firebaseapp.com",
                    projectId: "collegeclimb-ai",
                    storageBucket: "collegeclimb-ai.firebasestorage.app",
                    messagingSenderId: "187139654658",
                    appId: "1:187139654658:web:4a6cf4c43095f03212931b",
                    measurementId: "G-E0B2RQM9XS"
                };

                // Initialize Firebase (check if already initialized)
                const apps = getApps();
                const app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
                
                // Get Auth instance
                this.auth = getAuth(app);

                // Set persistence to LOCAL (survives page refreshes)
                await setPersistence(this.auth, browserLocalPersistence);

                // Set up single auth state listener
                onAuthStateChanged(this.auth, (user) => {
                    this.handleAuthStateChange(user);
                });

                // Make globally available for compatibility
                window.firebaseAuth = this.auth;
                window.authManager = this;

                this.isInitialized = true;
                console.log('✅ Unified Auth Manager initialized successfully');

                return true;
            } catch (error) {
                console.error('❌ Auth Manager initialization failed:', error);
                throw error;
            }
        })();

        return this.initPromise;
    }

    /**
     * Handle auth state changes - SINGLE SOURCE OF TRUTH
     */
    handleAuthStateChange(user) {
        if (user) {
            // User is signed in
            this.user = user;
            
            // Save to session with timestamp
            const session = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                timestamp: Date.now()
            };
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            
            console.log('✅ User signed in:', user.email);
            
            // Execute callbacks
            this.authStateCallbacks.forEach(callback => {
                try {
                    callback(user);
                } catch (error) {
                    console.error('Error in auth callback:', error);
                }
            });

            // Redirect if on login/signup page
            if (this.isAuthPage()) {
                window.location.href = '/dashboard.html';
            }
        } else {
            // User is signed out
            this.user = null;
            localStorage.removeItem(this.SESSION_KEY);
            
            console.log('ℹ️ User signed out');
            
            // Redirect to login if on protected page
            if (!this.isPublicPage()) {
                console.log('🔒 Protected page - redirecting to login');
                window.location.href = '/login.html';
            }
        }
    }

    /**
     * Check if current page is public
     */
    isPublicPage() {
        const path = window.location.pathname;
        return this.PUBLIC_PAGES.some(page => 
            path === page || path.endsWith(page)
        );
    }

    /**
     * Check if on auth page (login/signup)
     */
    isAuthPage() {
        const path = window.location.pathname;
        return path.includes('login') || path.includes('signup');
    }

    /**
     * Protect current page - redirect if not authenticated
     */
    async protect() {
        // Don't protect public pages
        if (this.isPublicPage()) {
            return true;
        }

        // Initialize if not done
        if (!this.isInitialized) {
            await this.initialize();
        }

        // Check session
        const session = this.getSession();
        if (!session) {
            console.log('🔒 No valid session - redirecting to login');
            window.location.href = '/login.html';
            return false;
        }

        // Check if session is expired
        if (this.isSessionExpired(session)) {
            console.log('⏰ Session expired - redirecting to login');
            this.clearSession();
            window.location.href = '/login.html';
            return false;
        }

        return true;
    }

    /**
     * Get current session
     */
    getSession() {
        try {
            const sessionStr = localStorage.getItem(this.SESSION_KEY);
            return sessionStr ? JSON.parse(sessionStr) : null;
        } catch (error) {
            console.error('Error reading session:', error);
            return null;
        }
    }

    /**
     * Check if session is expired
     */
    isSessionExpired(session) {
        if (!session || !session.timestamp) {
            return true;
        }
        const now = Date.now();
        return (now - session.timestamp) > this.SESSION_TIMEOUT;
    }

    /**
     * Clear session
     */
    clearSession() {
        localStorage.removeItem(this.SESSION_KEY);
        this.user = null;
    }

    /**
     * Register callback for auth state changes
     */
    onAuthStateChanged(callback) {
        this.authStateCallbacks.push(callback);
        
        // If already has user, call immediately
        if (this.user) {
            callback(this.user);
        }
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.user || this.getSession();
    }

    /**
     * Sign out
     */
    async signOut() {
        try {
            const { signOut } = await import(
                'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'
            );
            
            await signOut(this.auth);
            this.clearSession();
            console.log('✅ Signed out successfully');
            window.location.href = '/login.html';
        } catch (error) {
            console.error('❌ Sign out error:', error);
            throw error;
        }
    }

    /**
     * Wait for authentication to be ready
     */
    async waitForAuth(timeout = 5000) {
        if (this.isInitialized && this.user) {
            return this.user;
        }

        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('Authentication timeout'));
            }, timeout);

            this.onAuthStateChanged((user) => {
                clearTimeout(timer);
                resolve(user);
            });
        });
    }
}

// Create singleton instance
const authManager = new UnifiedAuthManager();

// Auto-initialize on page load
if (typeof window !== 'undefined') {
    // Initialize immediately
    authManager.initialize().catch(error => {
        console.error('Failed to initialize auth:', error);
    });

    // Protect page if needed
    document.addEventListener('DOMContentLoaded', () => {
        authManager.protect().catch(error => {
            console.error('Auth protection failed:', error);
        });
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = authManager;
}

// Make globally available
window.authManager = authManager;

console.log('🎯 Unified Auth Manager loaded');
