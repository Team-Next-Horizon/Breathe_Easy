const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. User not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token.'
    });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user && req.user.role === 'admin') {
        next();
      } else {
        res.status(403).json({
          success: false,
          error: 'Access denied. Admin privileges required.'
        });
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Authentication failed.'
    });
  }
};

// API authentication for internal/system calls
const apiAuth = async (req, res, next) => {
  try {
    const apiKey = req.header('X-API-Key') || req.query.apiKey;
    const expectedApiKey = process.env.INTERNAL_API_KEY || 'internal-api-key-change-this';
    
    if (!apiKey || apiKey !== expectedApiKey) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key for internal access.'
      });
    }

    // For internal API calls, we don't need user context
    req.isInternalCall = true;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'API authentication failed.'
    });
  }
};

module.exports = { auth, adminAuth, apiAuth };