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
            '/login', '/login',
            '/signup.html', '/signup',
            '/about.html', '/about',
            '/pricing.html', '/pricing'
        ];
    }

    /**
     * Wait for Firebase configuration to be loaded by firebase-env-inject.js
     */
    async waitForFirebaseConfig(timeout = 10000) {
        // If config already loaded, return immediately
        if (window.FIREBASE_CONFIG) {
            return window.FIREBASE_CONFIG;
        }

        console.log('⏳ Waiting for Firebase configuration to load...');

        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('Firebase configuration loading timeout'));
            }, timeout);

            // Listen for config loaded event
            const handleConfigLoaded = () => {
                clearTimeout(timeoutId);
                window.removeEventListener('firebaseConfigLoaded', handleConfigLoaded);
                console.log('✅ Firebase configuration ready');
                resolve(window.FIREBASE_CONFIG);
            };

            window.addEventListener('firebaseConfigLoaded', handleConfigLoaded);

            // Also check if config appeared (in case event already fired)
            const checkInterval = setInterval(() => {
                if (window.FIREBASE_CONFIG) {
                    clearTimeout(timeoutId);
                    clearInterval(checkInterval);
                    window.removeEventListener('firebaseConfigLoaded', handleConfigLoaded);
                    console.log('✅ Firebase configuration ready');
                    resolve(window.FIREBASE_CONFIG);
                }
            }, 100);
        });
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

                // Wait for Firebase configuration to load
                const firebaseConfig = await this.waitForFirebaseConfig();

                if (!firebaseConfig) {
                    console.error('Firebase configuration not loaded. Ensure firebase-env-inject.js is included.');
                    throw new Error('Firebase configuration missing');
                }

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

            // Check if there's a custom auth success handler (for signup page)
            if (this.authSuccessCallback) {
                try {
                    this.authSuccessCallback(user);
                } catch (error) {
                    console.error('Error in auth success callback:', error);
                }
            } else if (this.isAuthPage()) {
                // Redirect if on login/signup page (unless custom handler set)
                window.location.href = '/dashboard';
            }
        } else {
            // User is signed out
            this.user = null;
            localStorage.removeItem(this.SESSION_KEY);
            
            console.log('ℹ️ User signed out');
            
            // Redirect to login if on protected page
            if (!this.isPublicPage()) {
                console.log('🔒 Protected page - redirecting to login');
                window.location.href = '/login';
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
            window.location.href = '/login';
            return false;
        }

        // Check if session is expired
        if (this.isSessionExpired(session)) {
            console.log('⏰ Session expired - redirecting to login');
            this.clearSession();
            window.location.href = '/login';
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
            window.location.href = '/login';
        } catch (error) {
            console.error('❌ Sign out error:', error);
            throw error;
        }
    }

    /**
     * Sign in with email and password
     */
    async signInWithEmail(email, password) {
        try {
            const { signInWithEmailAndPassword } = await import(
                'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'
            );
            
            if (!this.auth) {
                await this.initialize();
            }
            
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            console.log('✅ Email sign-in successful:', userCredential.user.email);
            return userCredential.user;
        } catch (error) {
            console.error('❌ Email sign-in error:', error);
            throw error;
        }
    }

    /**
     * Sign in with Google
     */
    async signInWithGoogle() {
        try {
            const { GoogleAuthProvider, signInWithPopup } = await import(
                'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'
            );
            
            if (!this.auth) {
                await this.initialize();
            }
            
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(this.auth, provider);
            console.log('✅ Google sign-in successful:', userCredential.user.email);
            return userCredential.user;
        } catch (error) {
            console.error('❌ Google sign-in error:', error);
            throw error;
        }
    }

    /**
     * Sign up with email and password
     */
    async signUpWithEmail(email, password) {
        try {
            const { createUserWithEmailAndPassword } = await import(
                'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'
            );
            const { getFirestore, setDoc, doc } = await import(
                'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
            );
            
            if (!this.auth) {
                await this.initialize();
            }
            
            // Create user account
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            const user = userCredential.user;
            
            // Save user data to Firestore
            const db = getFirestore();
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                name: user.displayName || '',
                createdAt: new Date(),
                lastLogin: new Date(),
                accountType: 'student',
                profileComplete: false
            });
            
            console.log('✅ Email sign-up successful:', user.email);
            return user;
        } catch (error) {
            console.error('❌ Email sign-up error:', error);
            throw error;
        }
    }

    /**
     * Register callback for successful auth (used in signup flow)
     */
    onAuthSuccess(callback) {
        // This is a special handler for signup page
        // It prevents the auto-redirect so signup can control navigation
        this.authSuccessCallback = callback;
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
