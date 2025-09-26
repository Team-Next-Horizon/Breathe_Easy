const express = require('express');
const Subscription = require('../models/Subscription');
const { subscriptionValidation, handleValidationErrors } = require('../middleware/validation');
const { logger } = require('../config/logger');
const geocodingService = require('../services/geocodingService');
const notificationService = require('../services/notificationService');

const router = express.Router();

// @route   POST /api/subscriptions/subscribe
// @desc    Create a new AQI notification subscription
// @access  Public
router.post('/subscribe', subscriptionValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const { email, mobile, location, aqiThreshold = 100, notifications = { email: true, sms: true } } = req.body;

    // Check if subscription already exists
    let subscription = await Subscription.findOne({ email });
    
    if (subscription) {
      // Update existing subscription
      subscription.mobile = mobile;
      subscription.location.name = location;
      subscription.preferences.aqiThreshold = aqiThreshold;
      subscription.preferences.notifications = notifications;
      subscription.status.isActive = true;
      subscription.metadata.userAgent = req.get('User-Agent');
      subscription.metadata.ipAddress = req.ip;
      
      // Get updated coordinates
      try {
        const coordinates = await geocodingService.getCoordinates(location);
        subscription.location.coordinates = {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        };
        subscription.location.city = coordinates.name;
        subscription.location.state = coordinates.state;
        subscription.location.country = coordinates.country;
      } catch (geocodingError) {
        logger.warn(`Geocoding failed for ${location}:`, geocodingError.message);
      }
      
      await subscription.save();
      
      logger.info(`Subscription updated: ${email} for ${location}`);
      
      return res.json({
        success: true,
        message: 'Subscription updated successfully',
        data: {
          subscription: {
            id: subscription._id,
            email: subscription.email,
            location: subscription.fullLocation,
            aqiThreshold: subscription.preferences.aqiThreshold,
            notifications: subscription.preferences.notifications,
            isActive: subscription.status.isActive
          }
        }
      });
    }

    // Create new subscription
    const subscriptionData = {
      email,
      mobile,
      location: {
        name: location
      },
      preferences: {
        aqiThreshold,
        notifications
      },
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        source: 'web'
      }
    };

    // Get coordinates for the location
    try {
      const coordinates = await geocodingService.getCoordinates(location);
      subscriptionData.location.coordinates = {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      };
      subscriptionData.location.city = coordinates.name;
      subscriptionData.location.state = coordinates.state;
      subscriptionData.location.country = coordinates.country;
    } catch (geocodingError) {
      logger.warn(`Geocoding failed for ${location}:`, geocodingError.message);
    }

    subscription = new Subscription(subscriptionData);
    await subscription.save();

    // Send welcome notification
    try {
      await notificationService.sendWelcomeNotification(subscription);
    } catch (emailError) {
      logger.warn('Welcome notification failed:', emailError.message);
    }

    logger.info(`New subscription created: ${email} for ${location}`);

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to AQI notifications',
      data: {
        subscription: {
          id: subscription._id,
          email: subscription.email,
          location: subscription.fullLocation,
          aqiThreshold: subscription.preferences.aqiThreshold,
          notifications: subscription.preferences.notifications,
          isActive: subscription.status.isActive
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/subscriptions/status/:email
// @desc    Get subscription status by email
// @access  Public
router.get('/status/:email', async (req, res, next) => {
  try {
    const { email } = req.params;
    
    const subscription = await Subscription.findOne({ 
      email: email.toLowerCase(),
      'status.isActive': true 
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found',
        data: { subscribed: false }
      });
    }

    res.json({
      success: true,
      data: {
        subscribed: true,
        subscription: {
          id: subscription._id,
          email: subscription.email,
          location: subscription.fullLocation,
          aqiThreshold: subscription.preferences.aqiThreshold,
          notifications: subscription.preferences.notifications,
          lastNotified: subscription.status.lastNotified,
          notificationCount: subscription.status.notificationCount,
          createdAt: subscription.createdAt
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/subscriptions/:id
// @desc    Update subscription preferences
// @access  Public (with email verification)
router.put('/:id', subscriptionValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { mobile, location, aqiThreshold, notifications } = req.body;

    const subscription = await Subscription.findById(id);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    // Update fields
    if (mobile) subscription.mobile = mobile;
    if (location) subscription.location.name = location;
    if (aqiThreshold) subscription.preferences.aqiThreshold = aqiThreshold;
    if (notifications) subscription.preferences.notifications = notifications;

    // Update coordinates if location changed
    if (location) {
      try {
        const coordinates = await geocodingService.getCoordinates(location);
        subscription.location.coordinates = {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        };
        subscription.location.city = coordinates.name;
        subscription.location.state = coordinates.state;
        subscription.location.country = coordinates.country;
      } catch (geocodingError) {
        logger.warn(`Geocoding failed for ${location}:`, geocodingError.message);
      }
    }

    await subscription.save();

    logger.info(`Subscription updated: ${subscription.email}`);

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: {
        subscription: {
          id: subscription._id,
          email: subscription.email,
          location: subscription.fullLocation,
          aqiThreshold: subscription.preferences.aqiThreshold,
          notifications: subscription.preferences.notifications
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/subscriptions/:id/unsubscribe
// @desc    Unsubscribe from notifications
// @access  Public
router.post('/:id/unsubscribe', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const subscription = await Subscription.findById(id);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    subscription.status.isActive = false;
    await subscription.save();

    logger.info(`User unsubscribed: ${subscription.email}`);

    res.json({
      success: true,
      message: 'Successfully unsubscribed from notifications'
    });

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/subscriptions/unsubscribe
// @desc    Unsubscribe by email
// @access  Public
router.post('/unsubscribe', async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const subscription = await Subscription.findOne({ email: email.toLowerCase() });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    subscription.status.isActive = false;
    await subscription.save();

    logger.info(`User unsubscribed: ${email}`);

    res.json({
      success: true,
      message: 'Successfully unsubscribed from notifications'
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/subscriptions
// @desc    Get all subscriptions (admin only)
// @access  Private/Admin
router.get('/', require('../middleware/auth').adminAuth, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (req.query.active !== undefined) {
      filter['status.isActive'] = req.query.active === 'true';
    }
    if (req.query.verified !== undefined) {
      filter['status.isVerified'] = req.query.verified === 'true';
    }

    const subscriptions = await Subscription.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email');

    const total = await Subscription.countDocuments(filter);

    res.json({
      success: true,
      data: {
        subscriptions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;