/**
 * Production-Safe Logger
 * Replaces console.log with environment-aware logging
 * Automatically disables verbose logging in production
 */

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

/**
 * Log levels
 */
const LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

/**
 * Log a message with specified level
 * In production: Only logs errors and warnings
 * In development: Logs everything
 */
function log(level, ...args) {
  // Always log errors and warnings
  if (level === LogLevel.ERROR) {
    console.error(...args);
    return;
  }

  if (level === LogLevel.WARN) {
    console.warn(...args);
    return;
  }

  // Only log info and debug in development
  if (isDevelopment) {
    if (level === LogLevel.INFO) {
      console.info(...args);
    } else if (level === LogLevel.DEBUG) {
      console.log(...args);
    }
  }
}

/**
 * Convenience methods
 */
const logger = {
  error: (...args) => log(LogLevel.ERROR, ...args),
  warn: (...args) => log(LogLevel.WARN, ...args),
  info: (...args) => log(LogLevel.INFO, ...args),
  debug: (...args) => log(LogLevel.DEBUG, ...args),

  // Alias for backward compatibility
  log: (...args) => log(LogLevel.DEBUG, ...args),
};

/**
 * Silent logger for production (no-op)
 * Use this to completely disable logging for specific operations
 */
const silentLogger = {
  error: () => {},
  warn: () => {},
  info: () => {},
  debug: () => {},
  log: () => {},
};

module.exports = {
  logger,
  silentLogger,
  isProduction,
  isDevelopment,
  LogLevel,
};
