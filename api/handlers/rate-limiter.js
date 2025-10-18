/**
 * Rate Limiter for API Endpoints
 * Prevents abuse and ensures fair usage
 */

import logger from '../utils/logger.js';

// Store rate limit data (in production, use Redis)
const rateLimitStore = new Map();

// Rate limit configurations
const RATE_LIMITS = {
  ai: { requests: 10, windowMs: 60000 }, // 10 requests per minute for AI endpoints
  general: { requests: 100, windowMs: 60000 }, // 100 requests per minute for general endpoints
  storage: { requests: 50, windowMs: 60000 } // 50 requests per minute for storage endpoints
};

/**
 * Apply rate limiting based on IP and endpoint type
 */
function applyRateLimit(req, res, type = 'general') {
  return new Promise((resolve) => {
    try {
      const clientIp = req.headers['x-forwarded-for'] || 
                      req.connection.remoteAddress || 
                      req.socket.remoteAddress ||
                      '127.0.0.1';

      const key = `${clientIp}:${type}`;
      const now = Date.now();
      const config = RATE_LIMITS[type] || RATE_LIMITS.general;

      // Get existing rate limit data
      const existing = rateLimitStore.get(key) || { requests: 0, resetTime: now + config.windowMs };

      // Reset if window has expired
      if (now > existing.resetTime) {
        existing.requests = 0;
        existing.resetTime = now + config.windowMs;
      }

      // Check if limit exceeded
      if (existing.requests >= config.requests) {
        const resetIn = Math.ceil((existing.resetTime - now) / 1000);
        
        logger.warn(`Rate limit exceeded for ${clientIp} on ${type} endpoint`);
        
        res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${resetIn} seconds.`,
          retryAfter: resetIn
        });
        
        resolve(false);
        return;
      }

      // Increment request count
      existing.requests++;
      rateLimitStore.set(key, existing);

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', config.requests);
      res.setHeader('X-RateLimit-Remaining', config.requests - existing.requests);
      res.setHeader('X-RateLimit-Reset', Math.ceil(existing.resetTime / 1000));

      resolve(true);
      
    } catch (error) {
      logger.error('Rate limiter error:', error);
      // On error, allow the request to proceed
      resolve(true);
    }
  });
}

// Clean up expired entries periodically (only in long-running environments)
let cleanupInterval = null;

function startCleanup() {
  if (!cleanupInterval && typeof setInterval !== 'undefined') {
    cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, data] of rateLimitStore.entries()) {
        if (now > data.resetTime) {
          rateLimitStore.delete(key);
        }
      }
    }, 60000); // Clean up every minute
  }
}

export { applyRateLimit, startCleanup };
