const express = require('express');
const router = express.Router();
const { getRecommendations, replaceOutfitItem } = require('../controllers/stylistController');
const { optionalAuth } = require('../middleware/auth');

// Simple rate limiter tracker in memory to prevent abuse
const rateLimitMap = new Map();
const rateLimiter = (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 30; // 30 requests per minute

  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count += 1;
  }

  rateLimitMap.set(ip, record);

  if (record.count > maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please wait a minute before requesting more styling recommendations.'
    });
  }

  next();
};

// Route for generating outfit recommendations
router.post('/recommend', rateLimiter, optionalAuth, getRecommendations);

// Route for replacing an individual item in an outfit
router.post('/replace-item', rateLimiter, optionalAuth, replaceOutfitItem);

module.exports = router;
