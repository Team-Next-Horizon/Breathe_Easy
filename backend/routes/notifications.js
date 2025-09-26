const express = require('express');
const Notification = require('../models/Notification');
const Subscription = require('../models/Subscription');
const { logger } = require('../config/logger');
const notificationService = require('../services/notificationService');

const router = express.Router();

// @route   POST /api/notifications/send-test
// @desc    Send test notification (development only)
// @access  Public (development only)
router.post('/send-test', async (req, res, next) => {
  // Only allow in development environment
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: 'Test notifications not allowed in production'
    });
  }

  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const subscription = await Subscription.findOne({ 
      email: email.toLowerCase(),
      'status.isActive': true 
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Active subscription not found'
      });
    }

    // Create test AQI data
    const testAQIData = {
      aqi: 151,
      category: 'Unhealthy',
      location: subscription.fullLocation,
      timestamp: new Date(),
      pollutants: {
        pm25: 65.5,
        pm10: 89.2,
        o3: 120.1,
        no2: 45.3
      },
      source: 'Test',
      color: '#FF0000'
    };

    // Send test notification
    await notificationService.sendAQIAlert(subscription, testAQIData);

    logger.info(`Test notification sent to: ${email}`);

    res.json({
      success: true,
      message: 'Test notification sent successfully',
      data: {
        recipient: email,
        aqiData: testAQIData
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/notifications/history/:subscriptionId
// @desc    Get notification history for a subscription
// @access  Public
router.get('/history/:subscriptionId', async (req, res, next) => {
  try {
    const { subscriptionId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ subscription: subscriptionId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-content.html -provider.response');

    const total = await Notification.countDocuments({ subscription: subscriptionId });

    res.json({
      success: true,
      data: {
        notifications,
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

// @route   GET /api/notifications/stats
// @desc    Get notification delivery statistics
// @access  Private/Admin
router.get('/stats', require('../middleware/auth').adminAuth, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await Notification.getDeliveryStats(start, end);
    
    const totalNotifications = await Notification.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });

    const recentFailures = await Notification.find({
      'delivery.status': 'failed',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
    .limit(10)
    .populate('subscription', 'email location.name');

    res.json({
      success: true,
      data: {
        period: { start, end },
        totalNotifications,
        deliveryStats: stats,
        recentFailures
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/notifications/retry-failed
// @desc    Retry failed notifications
// @access  Private/Admin
router.post('/retry-failed', require('../middleware/auth').adminAuth, async (req, res, next) => {
  try {
    const failedNotifications = await Notification.findForRetry();
    
    if (failedNotifications.length === 0) {
      return res.json({
        success: true,
        message: 'No failed notifications to retry',
        data: { retried: 0 }
      });
    }

    let retriedCount = 0;
    
    for (const notification of failedNotifications) {
      try {
        const subscription = await Subscription.findById(notification.subscription);
        if (subscription && subscription.status.isActive) {
          await notificationService.retryNotification(notification);
          retriedCount++;
        }
      } catch (retryError) {
        logger.error(`Failed to retry notification ${notification._id}:`, retryError);
      }
    }

    logger.info(`Retried ${retriedCount} failed notifications`);

    res.json({
      success: true,
      message: `Successfully retried ${retriedCount} notifications`,
      data: { 
        retried: retriedCount,
        total: failedNotifications.length
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/notifications/templates
// @desc    Get available notification templates
// @access  Private/Admin
router.get('/templates', require('../middleware/auth').adminAuth, async (req, res, next) => {
  try {
    const templates = notificationService.getAvailableTemplates();
    
    res.json({
      success: true,
      data: { templates }
    });

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/notifications/broadcast
// @desc    Send broadcast notification to all active subscriptions
// @access  Private/Admin
router.post('/broadcast', require('../middleware/auth').adminAuth, async (req, res, next) => {
  try {
    const { subject, message, type = 'email', filters = {} } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Subject and message are required'
      });
    }

    // Build query filters
    const query = { 'status.isActive': true, 'status.isVerified': true };
    
    if (filters.location) {
      query['location.name'] = new RegExp(filters.location, 'i');
    }
    
    if (filters.aqiThreshold) {
      query['preferences.aqiThreshold'] = { $gte: filters.aqiThreshold };
    }

    const subscriptions = await Subscription.find(query);
    
    if (subscriptions.length === 0) {
      return res.json({
        success: true,
        message: 'No matching subscriptions found',
        data: { sent: 0 }
      });
    }

    // Send broadcast notifications
    let sentCount = 0;
    
    for (const subscription of subscriptions) {
      try {
        await notificationService.sendBroadcastNotification(subscription, {
          subject,
          message,
          type
        });
        sentCount++;
      } catch (sendError) {
        logger.error(`Failed to send broadcast to ${subscription.email}:`, sendError);
      }
    }

    logger.info(`Broadcast notification sent to ${sentCount} subscriptions`);

    res.json({
      success: true,
      message: `Broadcast sent to ${sentCount} subscribers`,
      data: {
        sent: sentCount,
        total: subscriptions.length,
        filters
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;