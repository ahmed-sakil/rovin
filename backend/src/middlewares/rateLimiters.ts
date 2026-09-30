import rateLimit from 'express-rate-limit';

// Global Auth Rate Limiter: 15 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

// OTP Request Limiter: 10 requests per 10 minutes
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    message: 'Too many OTP requests from this address. Please wait a few minutes before trying again.',
  },
});

// Review Posting Limiter: 5 reviews per hour
export const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Review rate limit exceeded. Please wait before submitting another review.',
  },
});
