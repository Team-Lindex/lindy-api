import rateLimit from 'express-rate-limit';
import config from '../config/config';
import logger from '../utils/logger';

// Basic rate limiter for all routes
export const basicLimiter = rateLimit({
  windowMs: config.rateLimits.standard.windowMs,
  max: config.rateLimits.standard.max,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: `Too many requests from this IP, please try again after ${config.rateLimits.standard.windowMs / 60000} minutes`,
  },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

// Stricter rate limiter for authentication routes (if implemented later)
export const authLimiter = rateLimit({
  windowMs: config.rateLimits.auth.windowMs,
  max: config.rateLimits.auth.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: `Too many authentication attempts from this IP, please try again after ${config.rateLimits.auth.windowMs / 60000} minutes`,
  },
  handler: (req, res, next, options) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

// Rate limiter for analytics endpoints which might be resource-intensive
export const analyticsLimiter = rateLimit({
  windowMs: config.rateLimits.analytics.windowMs,
  max: config.rateLimits.analytics.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: `Too many analytics requests from this IP, please try again after ${config.rateLimits.analytics.windowMs / 60000} minutes`,
  },
  handler: (req, res, next, options) => {
    logger.warn(`Analytics rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});
