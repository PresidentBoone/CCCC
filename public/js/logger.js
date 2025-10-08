// Production-safe logging utility
// Automatically disables console logs in production

const isProduction = window.location.hostname !== 'localhost' &&
                     window.location.hostname !== '127.0.0.1' &&
                     !window.location.hostname.includes('vercel.app');

const isDevelopment = !isProduction;

// Create logger object
const logger = {
    log: (...args) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },

    info: (...args) => {
        if (isDevelopment) {
            console.info(...args);
        }
    },

    warn: (...args) => {
        // Always show warnings, even in production
        console.warn(...args);
    },

    error: (...args) => {
        // Always show errors, even in production
        console.error(...args);
    },

    debug: (...args) => {
        if (isDevelopment) {
            console.debug(...args);
        }
    },

    table: (...args) => {
        if (isDevelopment) {
            console.table(...args);
        }
    },

    // Production-only logging (for critical info that should always be visible)
    production: (...args) => {
        if (isProduction) {
            console.log(...args);
        }
    },

    // Environment info
    env: {
        isProduction,
        isDevelopment,
        hostname: window.location.hostname
    }
};

// Make logger available globally
window.logger = logger;

// Override console methods in production (optional - uncomment if you want to completely disable console)
if (isProduction) {
    // Preserve original console for errors and warnings
    const originalError = console.error;
    const originalWarn = console.warn;

    // Override console methods
    // console.log = () => {};
    // console.info = () => {};
    // console.debug = () => {};
    // console.table = () => {};

    // Keep error and warn
    console.error = originalError;
    console.warn = originalWarn;
}

// Log environment on startup (development only)
if (isDevelopment) {
    console.log('%c🚀 College Climb - Development Mode', 'background: linear-gradient(135deg, #2a357a 0%, #a07bcc 100%); color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;');
    console.log('Environment:', logger.env);
} else {
    console.log('%c🎓 College Climb', 'background: linear-gradient(135deg, #2a357a 0%, #a07bcc 100%); color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;');
}

export default logger;
