const express = require('express');
const Subscription = require('../models/Subscription');
const { logger } = require('../config/logger');
const aqiService = require('../services/aqiService');
const { CONSTANTS } = require('../config/constants');

const router = express.Router();

// @route   GET /api/aqi/current
// @desc    Get current AQI data for a location
// @access  Public
router.get('/current', async (req, res, next) => {
  try {
    const { lat, lon, location } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude or longitude values'
      });
    }

    const aqiData = await aqiService.getCurrentAQI(latitude, longitude, location);
    
    res.json({
      success: true,
      data: aqiData
    });

  } catch (error) {
    if (error.message.includes('AQI data not available')) {
      return res.status(503).json({
        success: false,
        error: 'AQI data temporarily unavailable for this location'
      });
    }
    next(error);
  }
});

// @route   GET /api/aqi/forecast
// @desc    Get AQI forecast for a location
// @access  Public
router.get('/forecast', async (req, res, next) => {
  try {
    const { lat, lon, days = 3 } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const forecastDays = Math.min(parseInt(days) || 3, 7); // Max 7 days
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude or longitude values'
      });
    }

    const forecastData = await aqiService.getAQIForecast(latitude, longitude, forecastDays);
    
    res.json({
      success: true,
      data: forecastData
    });

  } catch (error) {
    if (error.message.includes('forecast not available')) {
      return res.status(503).json({
        success: false,
        error: 'AQI forecast temporarily unavailable for this location'
      });
    }
    next(error);
  }
});

// @route   GET /api/aqi/historical
// @desc    Get historical AQI data for a location
// @access  Public
router.get('/historical', async (req, res, next) => {
  try {
    const { lat, lon, startDate, endDate } = req.query;
    
    if (!lat || !lon || !startDate) {
      return res.status(400).json({
        success: false,
        error: 'Latitude, longitude, and start date are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    if (isNaN(latitude) || isNaN(longitude) || isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude, longitude, or date values'
      });
    }

    // Limit historical data to 30 days max
    const maxDays = 30;
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > maxDays) {
      return res.status(400).json({
        success: false,
        error: `Historical data limited to ${maxDays} days maximum`
      });
    }

    const historicalData = await aqiService.getHistoricalAQI(latitude, longitude, start, end);
    
    res.json({
      success: true,
      data: historicalData
    });

  } catch (error) {
    if (error.message.includes('historical data not available')) {
      return res.status(503).json({
        success: false,
        error: 'Historical AQI data not available for this period'
      });
    }
    next(error);
  }
});

// @route   GET /api/aqi/nearby-stations
// @desc    Get nearby air quality monitoring stations
// @access  Public
router.get('/nearby-stations', async (req, res, next) => {
  try {
    const { lat, lon, radius = 50 } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const searchRadius = Math.min(parseInt(radius) || 50, 100); // Max 100km
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude or longitude values'
      });
    }

    const stations = await aqiService.getNearbyStations(latitude, longitude, searchRadius);
    
    res.json({
      success: true,
      data: {
        stations,
        searchRadius,
        center: { latitude, longitude }
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/aqi/categories
// @desc    Get AQI categories and color codes
// @access  Public
router.get('/categories', (req, res) => {
  res.json({
    success: true,
    data: {
      categories: CONSTANTS.AQI_CATEGORIES,
      description: 'AQI categories with color codes and health implications'
    }
  });
});

// @route   POST /api/aqi/check-alerts
// @desc    Check all active subscriptions for AQI alerts (internal use)
// @access  Private
router.post('/check-alerts', require('../middleware/auth').apiAuth, async (req, res, next) => {
  try {
    const { forceCheck = false } = req.body;
    
    logger.info('Starting AQI alert check for all active subscriptions');
    
    // Get all active and verified subscriptions
    const subscriptions = await Subscription.find({
      'status.isActive': true,
      'status.isVerified': true
    }).select('+lastNotificationSent');

    if (subscriptions.length === 0) {
      return res.json({
        success: true,
        message: 'No active subscriptions found',
        data: { checked: 0, alerts: 0 }
      });
    }

    let checkedCount = 0;
    let alertsCount = 0;

    for (const subscription of subscriptions) {
      try {
        // Skip if recently notified (unless forced)
        if (!forceCheck && !subscription.shouldSendNotification()) {
          continue;
        }

        checkedCount++;
        
        // Get current AQI for subscription location
        const aqiData = await aqiService.getCurrentAQI(
          subscription.location.coordinates[1], // latitude
          subscription.location.coordinates[0], // longitude
          subscription.location.name
        );

        // Check if AQI exceeds threshold
        if (aqiData.aqi >= subscription.preferences.aqiThreshold) {
          await aqiService.processAQIAlert(subscription, aqiData);
          alertsCount++;
        }

      } catch (error) {
        logger.error(`Failed to check AQI for subscription ${subscription._id}:`, error);
      }
    }

    logger.info(`AQI check completed. Checked: ${checkedCount}, Alerts sent: ${alertsCount}`);

    res.json({
      success: true,
      message: 'AQI alert check completed',
      data: {
        totalSubscriptions: subscriptions.length,
        checked: checkedCount,
        alerts: alertsCount
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/aqi/health-recommendations
// @desc    Get health recommendations based on AQI value
// @access  Public
router.get('/health-recommendations', (req, res, next) => {
  try {
    const { aqi } = req.query;
    
    if (!aqi) {
      return res.status(400).json({
        success: false,
        error: 'AQI value is required'
      });
    }

    const aqiValue = parseInt(aqi);
    
    if (isNaN(aqiValue) || aqiValue < 0 || aqiValue > 500) {
      return res.status(400).json({
        success: false,
        error: 'Invalid AQI value (must be between 0-500)'
      });
    }

    const recommendations = aqiService.getHealthRecommendations(aqiValue);
    
    res.json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/aqi/stats
// @desc    Get AQI monitoring statistics
// @access  Private/Admin
router.get('/stats', require('../middleware/auth').adminAuth, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get subscription statistics
    const totalSubscriptions = await Subscription.countDocuments({ 'status.isActive': true });
    const verifiedSubscriptions = await Subscription.countDocuments({ 
      'status.isActive': true, 
      'status.isVerified': true 
    });

    // Get location-wise subscription distribution
    const locationStats = await Subscription.aggregate([
      { $match: { 'status.isActive': true } },
      { $group: { 
        _id: '$location.name', 
        count: { $sum: 1 },
        avgThreshold: { $avg: '$preferences.aqiThreshold' }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get AQI threshold distribution
    const thresholdStats = await Subscription.aggregate([
      { $match: { 'status.isActive': true } },
      { $group: { 
        _id: '$preferences.aqiThreshold', 
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        period: { start, end },
        subscriptions: {
          total: totalSubscriptions,
          verified: verifiedSubscriptions,
          verificationRate: totalSubscriptions > 0 ? 
            Math.round((verifiedSubscriptions / totalSubscriptions) * 100) : 0
        },
        locations: locationStats,
        thresholds: thresholdStats
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;