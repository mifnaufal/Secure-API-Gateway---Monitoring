const rateLimit = require('express-rate-limit');

// General rate limiter
const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: {
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
});

// Strict rate limiter for auth endpoints (brute force protection)
const authRateLimiter = rateLimit({
  windowMs: parseInt(process.env.BRUTE_FORCE_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.BRUTE_FORCE_MAX_ATTEMPTS) || 5,
  message: {
    error: {
      message: 'Too many login attempts, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  skipSuccessfulRequests: true, // Don't count successful logins
});

module.exports = { rateLimiter, authRateLimiter };
