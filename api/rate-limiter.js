// Rate Limiting Middleware for Vercel Serverless Functions
// Prevents API abuse and reduces costs

class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes default
    this.max = options.max || 100; // 100 requests per window
    this.message = options.message || 'Too many requests, please try again later.';
    this.statusCode = options.statusCode || 429;
    this.skipSuccessfulRequests = options.skipSuccessfulRequests || false;
    
    // In-memory store (for serverless, use Redis or similar in production)
    this.store = new Map();
    
    // Clean up old entries periodically
    this.cleanupInterval = setInterval(() => this.cleanup(), this.windowMs);
  }

  async checkLimit(identifier) {
    const now = Date.now();
    const key = String(identifier);
    
    // Get or create record for this identifier
    let record = this.store.get(key);
    
    if (!record) {
      record = {
        count: 0,
        resetTime: now + this.windowMs
      };
      this.store.set(key, record);
    }

    // Reset if window has passed
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + this.windowMs;
    }

    // Increment count
    record.count++;

    // Check if limit exceeded
    const isLimited = record.count > this.max;
    const remaining = Math.max(0, this.max - record.count);
    const resetTime = record.resetTime;

    return {
      isLimited,
      remaining,
      resetTime,
      retryAfter: Math.ceil((resetTime - now) / 1000) // seconds
    };
  }

  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime + this.windowMs) {
        this.store.delete(key);
      }
    }
  }

  async middleware(req, res) {
    // Get identifier (IP address or user ID)
    const identifier = this.getIdentifier(req);

    if (!identifier) {
      // Can't identify user, allow request
      return true;
    }

    const result = await this.checkLimit(identifier);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', this.max);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', result.resetTime);

    if (result.isLimited) {
      res.setHeader('Retry-After', result.retryAfter);
      res.status(this.statusCode).json({
        error: this.message,
        retryAfter: result.retryAfter
      });
      return false;
    }

    return true;
  }

  getIdentifier(req) {
    // Try to get user ID if authenticated
    if (req.user?.uid) {
      return `user:${req.user.uid}`;
    }

    // Fall back to IP address
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0].trim() : 
               req.headers['x-real-ip'] || 
               req.connection?.remoteAddress || 
               req.socket?.remoteAddress;

    return ip ? `ip:${ip}` : null;
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Create different limiters for different API types
const limiters = {
  // Strict limit for AI operations (expensive)
  ai: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 AI requests per 15 minutes
    message: 'AI request limit exceeded. Please wait before trying again.'
  }),

  // Medium limit for data operations
  data: new RateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100, // 100 requests per 15 minutes
    message: 'Request limit exceeded. Please slow down.'
  }),

  // Loose limit for read operations
  read: new RateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 200, // 200 requests per 15 minutes
    message: 'Too many requests. Please try again later.'
  }),

  // Very strict for auth operations (prevent brute force)
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 login attempts per 15 minutes
    message: 'Too many login attempts. Please try again later.'
  })
};

// Helper function to apply rate limiting to API routes
async function applyRateLimit(req, res, limiterType = 'data') {
  const limiter = limiters[limiterType];
  
  if (!limiter) {
    console.warn(`Unknown limiter type: ${limiterType}`);
    return true;
  }

  return await limiter.middleware(req, res);
}

// Export for use in API routes
module.exports = {
  RateLimiter,
  limiters,
  applyRateLimit
};

// Also support ES6 imports
export { RateLimiter, limiters, applyRateLimit };
export default applyRateLimit;
