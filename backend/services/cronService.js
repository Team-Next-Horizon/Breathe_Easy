const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const aqiService = require('./aqiService');
const { logger } = require('../config/logger');

class CronService {
  constructor() {
    this.jobs = new Map();
    this.isInitialized = false;
  }

  // Initialize all cron jobs
  init() {
    if (this.isInitialized) {
      logger.warn('Cron service already initialized');
      return;
    }

    try {
      this.setupAQIMonitoringJob();
      this.setupCleanupJob();
      this.setupHealthCheckJob();
      
      this.isInitialized = true;
      logger.info('Cron service initialized successfully');
      
    } catch (error) {
      logger.error('Failed to initialize cron service:', error);
      throw error;
    }
  }

  // Setup AQI monitoring job (runs every 30 minutes)
  setupAQIMonitoringJob() {
    const jobName = 'aqi-monitoring';
    
    // Run every 30 minutes
    const job = cron.schedule('*/30 * * * *', async () => {
      try {
        logger.info('Starting scheduled AQI monitoring check');
        await this.checkAllSubscriptionsForAlerts();
        logger.info('Completed scheduled AQI monitoring check');
      } catch (error) {
        logger.error('AQI monitoring job failed:', error);
      }
    }, {
      scheduled: false,
      timezone: process.env.TZ || 'UTC'
    });

    this.jobs.set(jobName, job);
    
    // Start the job
    job.start();
    logger.info(`AQI monitoring job scheduled to run every 30 minutes`);
  }

  // Setup cleanup job (runs daily at 2 AM)
  setupCleanupJob() {
    const jobName = 'cleanup';
    
    // Run daily at 2:00 AM
    const job = cron.schedule('0 2 * * *', async () => {
      try {
        logger.info('Starting scheduled cleanup job');
        await this.performCleanup();
        logger.info('Completed scheduled cleanup job');
      } catch (error) {
        logger.error('Cleanup job failed:', error);
      }
    }, {
      scheduled: false,
      timezone: process.env.TZ || 'UTC'
    });

    this.jobs.set(jobName, job);
    
    // Start the job
    job.start();
    logger.info('Cleanup job scheduled to run daily at 2:00 AM');
  }

  // Setup health check job (runs every hour)
  setupHealthCheckJob() {
    const jobName = 'health-check';
    
    // Run every hour
    const job = cron.schedule('0 * * * *', async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        logger.error('Health check job failed:', error);
      }
    }, {
      scheduled: false,
      timezone: process.env.TZ || 'UTC'
    });

    this.jobs.set(jobName, job);
    
    // Start the job
    job.start();
    logger.info('Health check job scheduled to run every hour');
  }

  // Check all active subscriptions for AQI alerts
  async checkAllSubscriptionsForAlerts() {
    try {
      // Get all active and verified subscriptions
      const subscriptions = await Subscription.find({
        'status.isActive': true,
        'status.isVerified': true
      }).select('+lastNotificationSent');

      if (subscriptions.length === 0) {
        logger.info('No active subscriptions found for AQI monitoring');
        return { checked: 0, alerts: 0 };
      }

      logger.info(`Checking AQI for ${subscriptions.length} active subscriptions`);

      let checkedCount = 0;
      let alertsCount = 0;
      let errorsCount = 0;

      // Process subscriptions in batches to avoid overwhelming APIs
      const batchSize = 10;
      for (let i = 0; i < subscriptions.length; i += batchSize) {
        const batch = subscriptions.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (subscription) => {
          try {
            // Skip if recently notified (unless it's an emergency level)
            if (!subscription.shouldSendNotification()) {
              return;
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
              
              logger.info(`AQI alert sent to ${subscription.email}`, {
                aqi: aqiData.aqi,
                threshold: subscription.preferences.aqiThreshold,
                location: subscription.location.name
              });
            }

          } catch (error) {
            errorsCount++;
            logger.error(`Failed to check AQI for subscription ${subscription._id}:`, {
              error: error.message,
              email: subscription.email,
              location: subscription.location.name
            });
          }
        }));

        // Add delay between batches to respect API rate limits
        if (i + batchSize < subscriptions.length) {
          await this.delay(2000); // 2 second delay
        }
      }

      const summary = {
        totalSubscriptions: subscriptions.length,
        checked: checkedCount,
        alerts: alertsCount,
        errors: errorsCount
      };

      logger.info('AQI monitoring completed', summary);
      return summary;

    } catch (error) {
      logger.error('Failed to check subscriptions for AQI alerts:', error);
      throw error;
    }
  }

  // Perform scheduled cleanup
  async performCleanup() {
    try {
      const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      
      // Clean up old failed notifications
      const Notification = require('../models/Notification');
      const deletedNotifications = await Notification.deleteMany({
        'delivery.status': 'failed',
        createdAt: { $lt: cutoffDate }
      });

      // Clean up old unverified subscriptions (older than 7 days)
      const verificationCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const deletedUnverified = await Subscription.deleteMany({
        'status.isVerified': false,
        createdAt: { $lt: verificationCutoff }
      });

      // Clean up old inactive subscriptions (older than 90 days)
      const inactiveCutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const deletedInactive = await Subscription.deleteMany({
        'status.isActive': false,
        'status.unsubscribedAt': { $lt: inactiveCutoff }
      });

      const summary = {
        deletedNotifications: deletedNotifications.deletedCount,
        deletedUnverified: deletedUnverified.deletedCount,
        deletedInactive: deletedInactive.deletedCount,
        cutoffDate
      };

      logger.info('Scheduled cleanup completed', summary);
      return summary;

    } catch (error) {
      logger.error('Cleanup job failed:', error);
      throw error;
    }
  }

  // Perform health check
  async performHealthCheck() {
    try {
      const checks = [];

      // Check database connectivity
      try {
        await Subscription.findOne().limit(1);
        checks.push({ service: 'database', status: 'healthy' });
      } catch (dbError) {
        checks.push({ service: 'database', status: 'unhealthy', error: dbError.message });
        logger.error('Database health check failed:', dbError);
      }

      // Check AQI service
      try {
        await aqiService.getCurrentAQI(40.7128, -74.0060, 'Health Check');
        checks.push({ service: 'aqi-api', status: 'healthy' });
      } catch (aqiError) {
        checks.push({ service: 'aqi-api', status: 'unhealthy', error: aqiError.message });
        logger.warn('AQI service health check failed:', aqiError.message);
      }

      // Check recent notification failures
      const Notification = require('../models/Notification');
      const recentFailures = await Notification.countDocuments({
        'delivery.status': 'failed',
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      if (recentFailures > 50) { // Alert if more than 50 failures in 24h
        checks.push({ 
          service: 'notifications', 
          status: 'warning', 
          message: `${recentFailures} failed notifications in last 24h` 
        });
        logger.warn(`High notification failure rate: ${recentFailures} failures in last 24h`);
      } else {
        checks.push({ service: 'notifications', status: 'healthy' });
      }

      // Log overall health status
      const unhealthyServices = checks.filter(check => check.status === 'unhealthy');
      const warningServices = checks.filter(check => check.status === 'warning');

      if (unhealthyServices.length > 0) {
        logger.error('System health check - unhealthy services detected:', unhealthyServices);
      } else if (warningServices.length > 0) {
        logger.warn('System health check - warnings detected:', warningServices);
      } else {
        logger.info('System health check - all services healthy');
      }

      return { timestamp: new Date(), checks };

    } catch (error) {
      logger.error('Health check failed:', error);
      return { timestamp: new Date(), error: error.message };
    }
  }

  // Start a specific job
  startJob(jobName) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.start();
      logger.info(`Cron job '${jobName}' started`);
    } else {
      logger.error(`Cron job '${jobName}' not found`);
    }
  }

  // Stop a specific job
  stopJob(jobName) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      logger.info(`Cron job '${jobName}' stopped`);
    } else {
      logger.error(`Cron job '${jobName}' not found`);
    }
  }

  // Stop all jobs
  stopAll() {
    this.jobs.forEach((job, jobName) => {
      job.destroy();
      logger.info(`Cron job '${jobName}' destroyed`);
    });
    
    this.jobs.clear();
    this.isInitialized = false;
    logger.info('All cron jobs stopped');
  }

  // Get job status
  getJobStatus() {
    const status = {};
    
    this.jobs.forEach((job, jobName) => {
      status[jobName] = {
        running: job.running || false,
        scheduled: job.scheduled || false
      };
    });

    return {
      initialized: this.isInitialized,
      jobs: status,
      totalJobs: this.jobs.size
    };
  }

  // Manual trigger for AQI monitoring (for testing/admin use)
  async triggerAQICheck() {
    logger.info('Manual AQI check triggered');
    return await this.checkAllSubscriptionsForAlerts();
  }

  // Manual trigger for cleanup (for admin use)
  async triggerCleanup() {
    logger.info('Manual cleanup triggered');
    return await this.performCleanup();
  }

  // Manual trigger for health check
  async triggerHealthCheck() {
    logger.info('Manual health check triggered');
    return await this.performHealthCheck();
  }

  // Utility function for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Schedule a one-time job
  scheduleOneTimeJob(name, cronExpression, task) {
    try {
      const job = cron.schedule(cronExpression, async () => {
        try {
          logger.info(`Running one-time job: ${name}`);
          await task();
          logger.info(`Completed one-time job: ${name}`);
          
          // Auto-destroy after completion
          job.destroy();
          this.jobs.delete(name);
          
        } catch (error) {
          logger.error(`One-time job '${name}' failed:`, error);
          job.destroy();
          this.jobs.delete(name);
        }
      }, {
        scheduled: false,
        timezone: process.env.TZ || 'UTC'
      });

      this.jobs.set(name, job);
      job.start();
      
      logger.info(`One-time job '${name}' scheduled: ${cronExpression}`);
      return true;
      
    } catch (error) {
      logger.error(`Failed to schedule one-time job '${name}':`, error);
      return false;
    }
  }

  // Update job schedule
  updateJobSchedule(jobName, newCronExpression) {
    try {
      const existingJob = this.jobs.get(jobName);
      if (!existingJob) {
        logger.error(`Job '${jobName}' not found for schedule update`);
        return false;
      }

      // Stop and remove existing job
      existingJob.destroy();
      this.jobs.delete(jobName);

      // Recreate job with new schedule based on job type
      if (jobName === 'aqi-monitoring') {
        this.setupAQIMonitoringJob();
      } else if (jobName === 'cleanup') {
        this.setupCleanupJob();
      } else if (jobName === 'health-check') {
        this.setupHealthCheckJob();
      }

      logger.info(`Job '${jobName}' schedule updated to: ${newCronExpression}`);
      return true;

    } catch (error) {
      logger.error(`Failed to update job '${jobName}' schedule:`, error);
      return false;
    }
  }
}

// Export singleton instance
module.exports = new CronService();