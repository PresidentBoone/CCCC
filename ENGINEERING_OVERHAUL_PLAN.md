# CollegeClimb Engineering Overhaul - Master Execution Plan

**Project**: Operation Casino Royale
**Start Date**: October 24, 2025
**Target Grade**: C+ (73/100) → A+ (95/100)
**Estimated Time**: 10-12 working days

---

## ✅ COMPLETED: Pre-Flight Checks

- [x] Audit report reviewed (AUDIT_REPORT_2025-10-24.md)
- [x] JavaScript inventory created (82 total files, 17 casino module files)
- [x] Deprecated casino files archived (4 files, 73KB)
- [x] testprep-OLD-BACKUP.html archived (5,390 lines)
- [x] package.json verified (Firebase 12.0.0, Jest configured)
- [x] vercel.json reviewed (good headers, caching strategy exists)

**Current State**:
- 21 HTML files (42,784 lines remaining after cleanup)
- 78 JS files (67 legacy + 1 config + 17 casino module - 7 deprecated = 78)
- No build process (static files)
- 41 synchronous scripts on dashboard.html
- Casino module ready for integration

---

## PHASE 1: CLEANUP, INTEGRATION, AND SECURITY HARDENING

### Phase 1.1: ✅ File Audit (COMPLETE)

**Status**: DONE
**Files Archived**:
- `casino-game-engine.js` (17KB)
- `casino-leaderboard.js` (14KB)
- `casino-sound-system.js` (16KB)
- `casino-ui-components.js` (26KB)
- `testprep-OLD-BACKUP.html` (208KB)

**Remaining**:
- Clean JS files: 78
- Clean HTML files: 20
- Casino module: 17 files (untouched, production-ready)

---

### Phase 1.2: ✅ Deprecated File Cleanup (COMPLETE)

All deprecated files moved to `archive/deprecated-casino-2025-10-24/`

---

### Phase 1.3: 🔄 Script Optimization (IN PROGRESS)

**Goal**: Replace 41 synchronous scripts with optimized loading
**Target**: Dashboard load time < 3 seconds

#### 1.3.1: Create Centralized Script Loader

**File**: `public/js/core/script-loader.js`

```javascript
/**
 * Centralized Script Loader
 * Manages async loading, dependencies, and load order
 */
class ScriptLoader {
    constructor() {
        this.loaded = new Set();
        this.loading = new Map();
    }

    async load(src, options = {}) {
        // If already loaded, return
        if (this.loaded.has(src)) return Promise.resolve();

        // If currently loading, return existing promise
        if (this.loading.has(src)) return this.loading.get(src);

        // Create load promise
        const promise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = options.async !== false;
            script.defer = options.defer || false;

            script.onload = () => {
                this.loaded.add(src);
                this.loading.delete(src);
                resolve();
            };

            script.onerror = () => {
                this.loading.delete(src);
                reject(new Error(`Failed to load script: ${src}`));
            };

            document.head.appendChild(script);
        });

        this.loading.set(src, promise);
        return promise;
    }

    async loadSequence(scripts) {
        for (const script of scripts) {
            await this.load(script);
        }
    }

    async loadParallel(scripts) {
        await Promise.all(scripts.map(s => this.load(s)));
    }
}

window.scriptLoader = new ScriptLoader();
```

#### 1.3.2: Script Loading Strategy

**Critical (Load First - Blocking OK)**:
1. `/js/config.js`
2. `/js/error-tracking.js`
3. `/js/firebase-env-inject.js`

**High Priority (Load ASAP - Async)**:
4. `/js/unified-auth.js`
5. `/js/firebase-config.js`
6. `/js/error-handler.js`

**Medium Priority (Defer)**:
- Dashboard init
- Form validators
- Empty states
- Analytics

**Low Priority (Lazy Load)**:
- Casino module (only when needed)
- AI chat assistant
- Social proof
- Product tour

#### 1.3.3: Dashboard.html Optimization

**BEFORE** (41 synchronous scripts):
```html
<script src="/js/config.js"></script>
<script src="/js/error-tracking.js"></script>
<script src="/js/firebase-env-inject.js"></script>
<!-- ... 38 more blocking scripts ... -->
```

**AFTER** (Optimized):
```html
<head>
    <!-- CRITICAL: Inline to avoid HTTP request -->
    <script>
        // Inline critical config
        window.FIREBASE_CONFIG = { /* ... */ };
        window.ENV = 'production';
    </script>

    <!-- Load script loader -->
    <script src="/js/core/script-loader.js"></script>

    <!-- Critical scripts only -->
    <script src="/js/error-tracking.js"></script>
    <script defer src="/js/firebase-env-inject.js"></script>
    <script defer src="/js/unified-auth.js"></script>

    <!-- Async analytics -->
    <script async src="/js/analytics-tracker.js"></script>
</head>
<body>
    <!-- Content -->

    <!-- Load rest at end -->
    <script>
        (async () => {
            const loader = window.scriptLoader;

            // Load dashboard essentials
            await loader.loadParallel([
                '/js/dashboard-init.js',
                '/js/empty-states.js',
                '/js/form-validator.js',
                '/js/accessibility-enhancer.js'
            ]);

            // Load secondary features
            await loader.loadParallel([
                '/js/milestone-celebration.js',
                '/js/smart-alerts.js',
                '/js/performance-optimizer.js'
            ]);

            // Lazy load casino if hash is #casino
            if (window.location.hash === '#casino') {
                await import('/js/casino/casino-init.js');
            }
        })();
    </script>
</body>
```

---

### Phase 1.4: 🔄 Security Hardening (NEXT)

#### 1.4.1: Input Sanitization Library

**File**: `public/js/security/sanitizer.js`

```javascript
/**
 * Input Sanitization Utilities
 * Prevents XSS, HTML injection, and script injection
 */
class InputSanitizer {
    // Remove all HTML tags
    static stripHTML(input) {
        if (typeof input !== 'string') return '';
        return input.replace(/<[^>]*>/g, '');
    }

    // Escape HTML entities
    static escapeHTML(input) {
        if (typeof input !== 'string') return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        };
        return input.replace(/[&<>"'/]/g, (char) => map[char]);
    }

    // Sanitize for display name
    static sanitizeDisplayName(name, maxLength = 50) {
        if (!name) return 'Anonymous';
        let sanitized = this.stripHTML(name);
        sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-_.]/g, '');
        return sanitized.substring(0, maxLength).trim() || 'Anonymous';
    }

    // Sanitize essay text (allow some formatting)
    static sanitizeEssayText(text, maxLength = 10000) {
        if (!text) return '';
        // Allow basic formatting but escape scripts
        let sanitized = text.replace(/<script[^>]*>.*?<\/script>/gi, '');
        sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
        return sanitized.substring(0, maxLength);
    }

    // Validate email
    static isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Validate URL
    static isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}

window.InputSanitizer = InputSanitizer;
```

#### 1.4.2: Content Security Policy

**Add to vercel.json**:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://api.openai.com; frame-ancestors 'none';"
        }
      ]
    }
  ]
}
```

#### 1.4.3: Firebase Security Rules

**File**: `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function validateCoins(newCoins, oldCoins) {
      return newCoins >= 0 && newCoins <= oldCoins + 5000;
    }

    function validateXP(newXP, oldXP) {
      return newXP >= 0 && newXP <= oldXP + 2000;
    }

    // User profiles
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);

      // Casino progress
      match /casinoProgress/{doc} {
        allow read: if isOwner(userId);
        allow create: if isOwner(userId);
        allow update: if isOwner(userId)
                      && validateCoins(request.resource.data.coins, resource.data.coins)
                      && validateXP(request.resource.data.xp, resource.data.xp);
      }

      // Casino history (immutable audit log)
      match /casinoHistory/{eventId} {
        allow read: if isOwner(userId);
        allow create: if isOwner(userId);
        allow update, delete: if false;
      }
    }

    // Leaderboards (public read, server write only)
    match /leaderboards/{type} {
      allow read: if isAuthenticated();
      allow write: if false; // Cloud Functions only
    }
  }
}
```

---

### Phase 1.5: 🔄 Casino Module Integration (NEXT)

#### 1.5.1: Create Casino Initialization Module

**File**: `public/js/casino/casino-init.js`

```javascript
/**
 * Casino Module Initialization
 * Integrates casino gamification into CollegeClimb
 */

import { CasinoEngine } from './core/CasinoEngine.js';
import { NavbarStats } from './components/NavbarStats.js';
import { StreakBonusPanel } from './components/StreakBonusPanel.js';
import { MysteryRewardModal } from './components/MysteryRewardModal.js';
import { ToastNotification } from './components/ToastNotification.js';
import { DailyWheelSpinner } from './components/DailyWheelSpinner.js';
import { LevelUpCelebration } from './components/LevelUpCelebration.js';
import { JackpotRoundOverlay } from './components/JackpotRoundOverlay.js';
import { LeaderboardModal } from './components/LeaderboardModal.js';

class CasinoInitializer {
    constructor() {
        this.engine = null;
        this.components = {};
        this.initialized = false;
    }

    async initialize(user, firebaseDb) {
        if (this.initialized) {
            console.warn('[Casino] Already initialized');
            return;
        }

        try {
            // Initialize casino engine
            this.engine = new CasinoEngine({
                userId: user.uid,
                firebaseDb: firebaseDb,
                rewardConfig: window.CasinoConfig
            });

            await this.engine.initialize();
            console.log('[Casino] Engine initialized');

            // Initialize UI components
            await this.initializeComponents();

            // Wire up event handlers
            this.wireEventHandlers();

            this.initialized = true;
            console.log('[Casino] Fully initialized');

            return this.engine;
        } catch (error) {
            console.error('[Casino] Initialization failed:', error);
            throw error;
        }
    }

    async initializeComponents() {
        // Navbar stats
        const navbarContainer = document.getElementById('casino-navbar-stats');
        if (navbarContainer) {
            this.components.navbar = new NavbarStats({
                engine: this.engine,
                container: navbarContainer,
                config: window.CasinoConfig.ui.navbar
            });
            await this.components.navbar.initialize();
        }

        // Streak panel
        const streakContainer = document.getElementById('casino-streak-panel');
        if (streakContainer) {
            this.components.streakPanel = new StreakBonusPanel({
                engine: this.engine,
                container: streakContainer
            });
            await this.components.streakPanel.initialize();
        }

        // Mystery reward modal
        this.components.mysteryModal = new MysteryRewardModal({
            engine: this.engine
        });
        await this.components.mysteryModal.initialize();

        // Toast notifications
        this.components.toast = new ToastNotification({
            engine: this.engine,
            config: window.CasinoConfig.ui.notifications
        });
        await this.components.toast.initialize();

        // Daily wheel
        this.components.wheel = new DailyWheelSpinner({
            engine: this.engine,
            config: window.CasinoConfig.dailyWheel
        });
        await this.components.wheel.initialize();

        // Level up celebration
        this.components.levelUp = new LevelUpCelebration({
            engine: this.engine
        });
        await this.components.levelUp.initialize();

        // Jackpot overlay
        this.components.jackpot = new JackpotRoundOverlay({
            engine: this.engine,
            onQuestionRequest: () => {
                window.loadNextJackpotQuestion && window.loadNextJackpotQuestion();
            }
        });
        await this.components.jackpot.initialize();

        // Leaderboard
        this.components.leaderboard = new LeaderboardModal({
            engine: this.engine
        });
        await this.components.leaderboard.initialize();

        console.log('[Casino] All components initialized');
    }

    wireEventHandlers() {
        // Make components globally accessible for testing
        window.casino = {
            engine: this.engine,
            ...this.components
        };

        // Wire up quiz system
        window.onQuestionCorrect = async (questionData) => {
            return await this.engine.processCorrectAnswer(questionData);
        };

        window.onQuestionIncorrect = async (questionData) => {
            return await this.engine.processIncorrectAnswer(questionData);
        };

        // Daily wheel button
        const wheelBtn = document.getElementById('daily-wheel-btn');
        if (wheelBtn) {
            wheelBtn.addEventListener('click', () => {
                this.components.wheel.open();
            });
        }

        // Leaderboard button
        const leaderboardBtn = document.getElementById('leaderboard-btn');
        if (leaderboardBtn) {
            leaderboardBtn.addEventListener('click', () => {
                this.components.leaderboard.open();
            });
        }

        console.log('[Casino] Event handlers wired');
    }

    destroy() {
        Object.values(this.components).forEach(component => {
            if (component && component.destroy) {
                component.destroy();
            }
        });
        this.initialized = false;
        console.log('[Casino] Destroyed');
    }
}

// Create singleton instance
const casinoInit = new CasinoInitializer();

// Export for module systems
export default casinoInit;

// Also make available globally
window.casinoInit = casinoInit;
```

#### 1.5.2: Update testprep-practice.html

**Add casino containers**:
```html
<!-- In navbar -->
<div id="casino-navbar-stats"></div>

<!-- In main content area -->
<div id="casino-streak-panel"></div>

<!-- Bottom buttons -->
<button id="daily-wheel-btn" class="casino-action-btn">
    🎡 Daily Wheel
</button>
<button id="leaderboard-btn" class="casino-action-btn">
    🏆 Leaderboard
</button>
```

**Add initialization script**:
```html
<script type="module">
    import casinoInit from '/js/casino/casino-init.js';

    // Wait for auth
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            try {
                await casinoInit.initialize(user, firebase.firestore());
                console.log('✅ Casino ready');
            } catch (error) {
                console.error('❌ Casino initialization failed:', error);
            }
        }
    });
</script>
```

---

## PHASE 2: PERFORMANCE OPTIMIZATION AND ACCESSIBILITY

### Phase 2.1: Build Process Implementation

#### 2.1.1: Install Vite

```bash
npm install --save-dev vite @vitejs/plugin-legacy vite-plugin-compression
```

#### 2.1.2: Create vite.config.js

```javascript
import { defineConfig } from 'vite';
import { resolve } from 'path';
import legacy from '@vitejs/plugin-legacy';
import compression from 'vite-plugin-compression';

export default defineConfig({
    root: 'public',
    base: '/',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'public/index.html'),
                login: resolve(__dirname, 'public/login.html'),
                signup: resolve(__dirname, 'public/signup.html'),
                dashboard: resolve(__dirname, 'public/dashboard.html'),
                testprep: resolve(__dirname, 'public/testprep-practice.html'),
                essaycoach: resolve(__dirname, 'public/essaycoach.html'),
                discovery: resolve(__dirname, 'public/discovery.html'),
                scholarships: resolve(__dirname, 'public/my-scholarships.html'),
                profile: resolve(__dirname, 'public/profile.html'),
                // Add other entry points
            },
            output: {
                manualChunks: {
                    'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
                    'casino-core': [
                        './public/js/casino/core/CasinoEngine.js',
                        './public/js/casino/core/StateManager.js',
                        './public/js/casino/core/RewardCalculator.js',
                        './public/js/casino/core/FirebaseSync.js'
                    ],
                    'casino-components': [
                        './public/js/casino/components/NavbarStats.js',
                        './public/js/casino/components/ToastNotification.js',
                        './public/js/casino/components/StreakBonusPanel.js',
                        './public/js/casino/components/MysteryRewardModal.js'
                    ],
                    'casino-features': [
                        './public/js/casino/components/DailyWheelSpinner.js',
                        './public/js/casino/components/LevelUpCelebration.js',
                        './public/js/casino/components/JackpotRoundOverlay.js',
                        './public/js/casino/components/LeaderboardModal.js'
                    ]
                },
                chunkFileNames: 'assets/js/[name].[hash].js',
                entryFileNames: 'assets/js/[name].[hash].js',
                assetFileNames: 'assets/[ext]/[name].[hash].[ext]'
            }
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info']
            }
        },
        sourcemap: false
    },
    plugins: [
        legacy({
            targets: ['defaults', 'not IE 11']
        }),
        compression({
            algorithm: 'gzip',
            ext: '.gz'
        }),
        compression({
            algorithm: 'brotliCompress',
            ext: '.br'
        })
    ],
    server: {
        port: 3000,
        open: true,
        cors: true
    },
    preview: {
        port: 4173
    }
});
```

#### 2.1.3: Update package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "vite build && vercel --prod"
  }
}
```

---

### Phase 2.2: Accessibility Implementation

#### 2.2.1: Create Accessibility Layer

**File**: `public/js/a11y/accessibility-manager.js`

```javascript
/**
 * Accessibility Manager
 * Implements WCAG 2.1 AA compliance
 */
class AccessibilityManager {
    constructor() {
        this.focusTrapStack = [];
    }

    // Add skip link
    addSkipLink() {
        if (document.getElementById('skip-link')) return;

        const skipLink = document.createElement('a');
        skipLink.id = 'skip-link';
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'sr-only sr-only-focusable';

        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // Add ARIA labels to all buttons
    enhanceButtons() {
        document.querySelectorAll('button:not([aria-label])').forEach(btn => {
            const text = btn.textContent.trim();
            if (text) {
                btn.setAttribute('aria-label', text);
            }
        });
    }

    // Add ARIA labels to all inputs
    enhanceInputs() {
        document.querySelectorAll('input:not([aria-label])').forEach(input => {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (!label && input.placeholder) {
                input.setAttribute('aria-label', input.placeholder);
            }
        });
    }

    // Trap focus in modal
    trapFocus(modal) {
        const focusable = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusable.length === 0) return;

        const firstFocusable = focusable[0];
        const lastFocusable = focusable[focusable.length - 1];

        const handleTab = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        };

        modal.addEventListener('keydown', handleTab);

        this.focusTrapStack.push({
            modal,
            handler: handleTab,
            previouslyFocused: document.activeElement
        });

        firstFocusable.focus();
    }

    // Release focus trap
    releaseFocus() {
        const trap = this.focusTrapStack.pop();
        if (!trap) return;

        trap.modal.removeEventListener('keydown', trap.handler);
        if (trap.previouslyFocused) {
            trap.previouslyFocused.focus();
        }
    }

    // Check contrast ratios
    checkContrast() {
        // This would use a library like axe-core in production
        console.log('[A11y] Contrast check - use browser extensions for now');
    }

    // Initialize all a11y features
    init() {
        this.addSkipLink();
        this.enhanceButtons();
        this.enhanceInputs();

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // ESC to close modals
            if (e.key === 'Escape') {
                const modal = document.querySelector('[role="dialog"][aria-hidden="false"]');
                if (modal) {
                    const closeBtn = modal.querySelector('[data-close]');
                    if (closeBtn) closeBtn.click();
                }
            }
        });

        console.log('[A11y] Accessibility layer initialized');
    }
}

window.a11yManager = new AccessibilityManager();
window.a11yManager.init();
```

#### 2.2.2: Add Screen Reader Styles

**File**: `public/css/accessibility.css`

```css
/* Screen reader only text */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}

.sr-only-focusable:active,
.sr-only-focusable:focus {
    position: static;
    width: auto;
    height: auto;
    overflow: visible;
    clip: auto;
    white-space: normal;
}

/* Skip link */
#skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--accent-bg);
    color: white;
    padding: 8px;
    text-decoration: none;
    z-index: 100;
}

#skip-link:focus {
    top: 0;
}

/* Focus visible */
*:focus-visible {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
    :root {
        --text-primary: #000000;
        --primary-bg: #FFFFFF;
    }

    button {
        border: 2px solid currentColor;
    }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

---

## PHASE 3: CODE QUALITY, SCALABILITY, AND FINALIZATION

### Phase 3.1: Extract Inline Styles

**Strategy**: Move all inline `<style>` blocks to external CSS modules

**Target Files**:
- dashboard.html (2 style blocks → dashboard.css)
- index.html (4 style blocks → landing.css)
- essaycoach.html (1 style block → essay-coach.css)

**Benefit**: 40% HTML file size reduction

---

### Phase 3.2: Deduplication Analysis

**Suspected Duplicates**:
1. `ai-engine.js` vs `ai-engine-standalone.js` → Merge
2. `analytics.js` vs `analytics-tracker.js` → Merge
3. `error-handler.js` vs `error-monitor.js` vs `error-tracking.js` → Unified error system
4. `user-profile-manager.js` vs `user-profile-system.js` → Merge

---

### Phase 3.3: Final Testing Checklist

- [ ] Lighthouse Performance >95
- [ ] Lighthouse Accessibility >95
- [ ] Lighthouse Best Practices >95
- [ ] Lighthouse SEO >95
- [ ] axe-core: 0 violations
- [ ] Cross-browser: Chrome, Safari, Firefox
- [ ] Cross-device: Desktop, tablet, mobile
- [ ] Casino integration: All features work
- [ ] Auth flow: Login, signup, logout
- [ ] Test prep: Questions load, casino rewards trigger
- [ ] Essay coach: AI responses work
- [ ] Scholarships: Search and filters work

---

## SUCCESS METRICS

### Before
- Performance: 25/100
- Accessibility: 55/100
- Best Practices: 78/100
- SEO: 82/100
- **Overall**: C+ (73/100)

### Target After
- Performance: 95/100
- Accessibility: 95/100
- Best Practices: 95/100
- SEO: 95/100
- **Overall**: A+ (95/100)

### Key Improvements
- Load time: 12-17s → 2-3s (80% faster)
- Bundle size: 1.28MB → 420KB gzipped (67% smaller)
- Scripts: 41 blocking → 3 critical + lazy loaded
- Accessibility: WCAG 2.1 AA compliant
- Security: XSS hardened, Firebase rules enforced
- Maintainability: Modular, documented, tested

---

## NEXT STEPS

1. **Review this plan** - Approve or request changes
2. **Execute Phase 1.3** - Script optimization
3. **Execute Phase 1.4** - Security hardening
4. **Execute Phase 1.5** - Casino integration
5. **Continue through Phases 2 & 3** systematically

**Status**: ⏸️ PAUSED - Awaiting your approval to continue execution

**Estimated Completion**: 10-12 working days from approval

