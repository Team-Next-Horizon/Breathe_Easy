const express = require('express');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');
const { logger } = require('../config/logger');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Apply admin authentication to all routes
router.use(adminAuth);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/dashboard', async (req, res, next) => {
  try {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // User statistics
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const newUsersThisWeek = await User.countDocuments({ 
      createdAt: { $gte: lastWeek } 
    });

    // Subscription statistics
    const totalSubscriptions = await Subscription.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ 
      'status.isActive': true 
    });
    const verifiedSubscriptions = await Subscription.countDocuments({ 
      'status.isVerified': true 
    });
    const newSubscriptionsThisWeek = await Subscription.countDocuments({ 
      createdAt: { $gte: lastWeek } 
    });

    // Notification statistics
    const totalNotifications = await Notification.countDocuments();
    const notificationsThisWeek = await Notification.countDocuments({ 
      createdAt: { $gte: lastWeek } 
    });
    const failedNotifications = await Notification.countDocuments({ 
      'delivery.status': 'failed' 
    });

    // Recent activity
    const recentSubscriptions = await Subscription.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('email location.name createdAt status');

    const recentNotifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('subscription', 'email location.name')
      .select('type delivery.status createdAt');

    // Top locations by subscription count
    const topLocations = await Subscription.aggregate([
      { $match: { 'status.isActive': true } },
      { $group: { 
        _id: '$location.name', 
        count: { $sum: 1 },
        avgThreshold: { $avg: '$preferences.aqiThreshold' }
      }},
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          admins: adminUsers,
          newThisWeek: newUsersThisWeek
        },
        subscriptions: {
          total: totalSubscriptions,
          active: activeSubscriptions,
          verified: verifiedSubscriptions,
          newThisWeek: newSubscriptionsThisWeek,
          verificationRate: Math.round((verifiedSubscriptions / totalSubscriptions) * 100) || 0
        },
        notifications: {
          total: totalNotifications,
          thisWeek: notificationsThisWeek,
          failed: failedNotifications,
          successRate: Math.round(((totalNotifications - failedNotifications) / totalNotifications) * 100) || 0
        },
        recentActivity: {
          subscriptions: recentSubscriptions,
          notifications: recentNotifications
        },
        topLocations
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private/Admin
router.get('/users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const role = req.query.role;

    const query = {};
    
    if (search) {
      query.$or = [
        { email: new RegExp(search, 'i') },
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') }
      ];
    }
    
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
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

// @route   PUT /api/admin/users/:userId/role
// @desc    Update user role
// @access  Private/Admin
router.put('/users/:userId/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be "user" or "admin"'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent removing admin role from the last admin
    if (user.role === 'admin' && role === 'user') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          error: 'Cannot remove admin role from the last admin user'
        });
      }
    }

    user.role = role;
    await user.save();

    logger.info(`User role updated: ${user.email} -> ${role} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        userId: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/subscriptions
// @desc    Get all subscriptions with pagination
// @access  Private/Admin
router.get('/subscriptions', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const status = req.query.status;
    const location = req.query.location;

    const query = {};
    
    if (search) {
      query.$or = [
        { email: new RegExp(search, 'i') },
        { 'location.name': new RegExp(search, 'i') }
      ];
    }
    
    if (status === 'active') {
      query['status.isActive'] = true;
    } else if (status === 'inactive') {
      query['status.isActive'] = false;
    }
    
    if (status === 'verified') {
      query['status.isVerified'] = true;
    } else if (status === 'unverified') {
      query['status.isVerified'] = false;
    }
    
    if (location) {
      query['location.name'] = new RegExp(location, 'i');
    }

    const subscriptions = await Subscription.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-verificationToken');

    const total = await Subscription.countDocuments(query);

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

// @route   PUT /api/admin/subscriptions/:subscriptionId/status
// @desc    Update subscription status
// @access  Private/Admin
router.put('/subscriptions/:subscriptionId/status', async (req, res, next) => {
  try {
    const { isActive, isVerified } = req.body;
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    if (typeof isActive === 'boolean') {
      subscription.status.isActive = isActive;
      if (!isActive) {
        subscription.status.unsubscribedAt = new Date();
      }
    }

    if (typeof isVerified === 'boolean') {
      subscription.status.isVerified = isVerified;
      if (isVerified && !subscription.status.verifiedAt) {
        subscription.status.verifiedAt = new Date();
      }
    }

    await subscription.save();

    logger.info(`Subscription status updated: ${subscription.email} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Subscription status updated successfully',
      data: {
        subscriptionId: subscription._id,
        email: subscription.email,
        status: subscription.status
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/admin/subscriptions/:subscriptionId
// @desc    Delete a subscription
// @access  Private/Admin
router.delete('/subscriptions/:subscriptionId', async (req, res, next) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    // Delete associated notifications
    await Notification.deleteMany({ subscription: subscriptionId });
    
    // Delete the subscription
    await Subscription.findByIdAndDelete(subscriptionId);

    logger.info(`Subscription deleted: ${subscription.email} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Subscription and associated data deleted successfully'
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/system-health
// @desc    Get system health status
// @access  Private/Admin
router.get('/system-health', async (req, res, next) => {
  try {
    const checks = [];

    // Database connectivity
    try {
      await User.findOne().limit(1);
      checks.push({
        service: 'Database',
        status: 'healthy',
        message: 'Connected successfully'
      });
    } catch (dbError) {
      checks.push({
        service: 'Database',
        status: 'unhealthy',
        message: 'Connection failed',
        error: dbError.message
      });
    }

    // Memory usage
    const memUsage = process.memoryUsage();
    const memHealthy = memUsage.heapUsed < 500 * 1024 * 1024; // 500MB threshold
    checks.push({
      service: 'Memory',
      status: memHealthy ? 'healthy' : 'warning',
      message: `Heap used: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      details: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      }
    });

    // Process uptime
    const uptime = process.uptime();
    checks.push({
      service: 'Uptime',
      status: 'healthy',
      message: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      details: {
        seconds: Math.floor(uptime),
        started: new Date(Date.now() - uptime * 1000)
      }
    });

    // Recent errors (check logs if logging service is available)
    const recentFailedNotifications = await Notification.countDocuments({
      'delivery.status': 'failed',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    checks.push({
      service: 'Notifications',
      status: recentFailedNotifications > 10 ? 'warning' : 'healthy',
      message: `${recentFailedNotifications} failed in last 24h`,
      details: { failedLast24h: recentFailedNotifications }
    });

    const overallHealthy = checks.every(check => check.status === 'healthy');

    res.json({
      success: true,
      data: {
        status: overallHealthy ? 'healthy' : 'degraded',
        timestamp: new Date(),
        checks
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/admin/maintenance/cleanup
// @desc    Cleanup old data
// @access  Private/Admin
router.post('/maintenance/cleanup', async (req, res, next) => {
  try {
    const { daysOld = 90, dryRun = true } = req.body;
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    // Find old inactive subscriptions
    const oldSubscriptions = await Subscription.find({
      'status.isActive': false,
      'status.unsubscribedAt': { $lt: cutoffDate }
    });

    // Find old failed notifications
    const oldNotifications = await Notification.find({
      'delivery.status': 'failed',
      createdAt: { $lt: cutoffDate }
    });

    if (dryRun) {
      res.json({
        success: true,
        message: 'Dry run completed - no data was deleted',
        data: {
          subscriptionsToDelete: oldSubscriptions.length,
          notificationsToDelete: oldNotifications.length,
          cutoffDate
        }
      });
    } else {
      // Delete old data
      const deletedNotifications = await Notification.deleteMany({
        'delivery.status': 'failed',
        createdAt: { $lt: cutoffDate }
      });

      const deletedSubscriptions = await Subscription.deleteMany({
        'status.isActive': false,
        'status.unsubscribedAt': { $lt: cutoffDate }
      });

      logger.info(`Cleanup completed: ${deletedSubscriptions.deletedCount} subscriptions, ${deletedNotifications.deletedCount} notifications deleted`);

      res.json({
        success: true,
        message: 'Cleanup completed successfully',
        data: {
          deletedSubscriptions: deletedSubscriptions.deletedCount,
          deletedNotifications: deletedNotifications.deletedCount,
          cutoffDate
        }
      });
    }

  } catch (error) {
    next(error);
  }
});

module.exports = router;