const mongoose = require('mongoose');
const { SystemLog } = require('../models');

class DatabaseUtils {
  /**
   * Create database indexes for all models
   */
  static async createIndexes() {
    try {
      const models = [
        'User',
        'Subscription', 
        'Notification',
        'AQILog',
        'MonitoringStation',
        'SystemLog'
      ];

      console.log('🔨 Creating database indexes...');
      
      for (const modelName of models) {
        const model = mongoose.model(modelName);
        await model.createIndexes();
        console.log(`✅ Indexes created for ${modelName}`);
      }

      await SystemLog.logEvent(
        'info',
        'Database indexes created successfully',
        'database',
        'system',
        { modelsCount: models.length }
      );

      console.log('🎉 All database indexes created successfully!');
    } catch (error) {
      console.error('❌ Error creating indexes:', error);
      
      await SystemLog.logEvent(
        'error',
        'Failed to create database indexes',
        'database',
        'system',
        { error: error.message, stack: error.stack }
      );
      
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  static async getDatabaseStats() {
    try {
      const db = mongoose.connection.db;
      const admin = db.admin();
      
      // Get database stats
      const dbStats = await db.stats();
      
      // Get collection stats
      const collections = await db.listCollections().toArray();
      const collectionStats = {};
      
      for (const collection of collections) {
        const stats = await db.collection(collection.name).stats();
        collectionStats[collection.name] = {
          documents: stats.count,
          avgObjSize: stats.avgObjSize,
          dataSize: stats.size,
          indexSize: stats.totalIndexSize,
          indexes: stats.nindexes
        };
      }

      // Get server status (if admin access available)
      let serverStatus = null;
      try {
        serverStatus = await admin.serverStatus();
      } catch (err) {
        console.warn('⚠️  Could not get server status (admin privileges required)');
      }

      const stats = {
        database: {
          name: dbStats.db,
          collections: dbStats.collections,
          objects: dbStats.objects,
          avgObjSize: dbStats.avgObjSize,
          dataSize: dbStats.dataSize,
          storageSize: dbStats.storageSize,
          indexes: dbStats.indexes,
          indexSize: dbStats.indexSize
        },
        collections: collectionStats,
        server: serverStatus ? {
          version: serverStatus.version,
          uptime: serverStatus.uptime,
          connections: serverStatus.connections
        } : null
      };

      return stats;
    } catch (error) {
      console.error('❌ Error getting database stats:', error);
      throw error;
    }
  }

  /**
   * Cleanup old data based on retention policies
   */
  static async cleanupOldData() {
    try {
      console.log('🧹 Starting database cleanup...');
      
      // Cleanup old system logs (older than 90 days)
      const systemLogCutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const deletedSystemLogs = await SystemLog.deleteMany({
        createdAt: { $lt: systemLogCutoff },
        level: { $in: ['debug', 'trace'] } // Keep errors and warnings longer
      });

      // Cleanup old AQI logs (older than 1 year)
      const { AQILog } = require('../models');
      const aqiLogCutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      const deletedAQILogs = await AQILog.deleteMany({
        createdAt: { $lt: aqiLogCutoff }
      });

      // Cleanup old notifications (older than 6 months if delivered)
      const { Notification } = require('../models');
      const notificationCutoff = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
      const deletedNotifications = await Notification.deleteMany({
        createdAt: { $lt: notificationCutoff },
        'delivery.status': 'delivered'
      });

      const cleanupResults = {
        systemLogs: deletedSystemLogs.deletedCount,
        aqiLogs: deletedAQILogs.deletedCount,
        notifications: deletedNotifications.deletedCount
      };

      await SystemLog.logEvent(
        'info',
        'Database cleanup completed',
        'database',
        'system',
        cleanupResults
      );

      console.log('✅ Database cleanup completed:', cleanupResults);
      return cleanupResults;
    } catch (error) {
      console.error('❌ Error during database cleanup:', error);
      
      await SystemLog.logEvent(
        'error',
        'Database cleanup failed',
        'database',
        'system',
        { error: error.message, stack: error.stack }
      );
      
      throw error;
    }
  }

  /**
   * Backup specific collections
   */
  static async backupCollections(collections = ['users', 'subscriptions']) {
    try {
      console.log('💾 Starting database backup...');
      const backupData = {};
      
      for (const collectionName of collections) {
        const collection = mongoose.connection.db.collection(collectionName);
        const documents = await collection.find({}).toArray();
        backupData[collectionName] = documents;
        console.log(`✅ Backed up ${documents.length} documents from ${collectionName}`);
      }

      // Save backup with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `./backups/backup-${timestamp}.json`;
      
      const fs = require('fs').promises;
      await fs.mkdir('./backups', { recursive: true });
      await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));

      await SystemLog.logEvent(
        'info',
        'Database backup created',
        'database',
        'system',
        { backupPath, collections, documentCount: Object.values(backupData).reduce((sum, docs) => sum + docs.length, 0) }
      );

      console.log(`💾 Backup saved to: ${backupPath}`);
      return { backupPath, data: backupData };
    } catch (error) {
      console.error('❌ Error creating backup:', error);
      
      await SystemLog.logEvent(
        'error',
        'Database backup failed',
        'database',
        'system',
        { error: error.message, stack: error.stack }
      );
      
      throw error;
    }
  }

  /**
   * Validate data integrity
   */
  static async validateDataIntegrity() {
    try {
      console.log('🔍 Validating data integrity...');
      const issues = [];

      // Check for orphaned subscriptions (user doesn't exist)
      const { Subscription, User } = require('../models');
      const subscriptions = await Subscription.find({}).populate('userId');
      const orphanedSubscriptions = subscriptions.filter(sub => !sub.userId);
      
      if (orphanedSubscriptions.length > 0) {
        issues.push({
          type: 'orphaned_subscriptions',
          count: orphanedSubscriptions.length,
          message: 'Subscriptions without valid user references'
        });
      }

      // Check for duplicate monitoring stations
      const { MonitoringStation } = require('../models');
      const duplicateStations = await MonitoringStation.aggregate([
        {
          $group: {
            _id: '$stationId',
            count: { $sum: 1 },
            docs: { $push: '$_id' }
          }
        },
        {
          $match: { count: { $gt: 1 } }
        }
      ]);

      if (duplicateStations.length > 0) {
        issues.push({
          type: 'duplicate_stations',
          count: duplicateStations.length,
          message: 'Duplicate monitoring station IDs found'
        });
      }

      // Check for invalid coordinates
      const { AQILog } = require('../models');
      const invalidCoordinates = await AQILog.find({
        $or: [
          { 'location.coordinates.coordinates.0': { $lt: -180, $gt: 180 } },
          { 'location.coordinates.coordinates.1': { $lt: -90, $gt: 90 } }
        ]
      });

      if (invalidCoordinates.length > 0) {
        issues.push({
          type: 'invalid_coordinates',
          count: invalidCoordinates.length,
          message: 'AQI logs with invalid geographic coordinates'
        });
      }

      await SystemLog.logEvent(
        issues.length > 0 ? 'warn' : 'info',
        `Data integrity validation completed - ${issues.length} issues found`,
        'database',
        'system',
        { issues }
      );

      console.log(`🔍 Data integrity check completed - ${issues.length} issues found`);
      return { valid: issues.length === 0, issues };
    } catch (error) {
      console.error('❌ Error validating data integrity:', error);
      
      await SystemLog.logEvent(
        'error',
        'Data integrity validation failed',
        'database',
        'system',
        { error: error.message, stack: error.stack }
      );
      
      throw error;
    }
  }

  /**
   * Optimize database performance
   */
  static async optimizeDatabase() {
    try {
      console.log('⚡ Optimizing database performance...');
      
      // Rebuild indexes
      await this.createIndexes();
      
      // Compact collections (if supported)
      const collections = await mongoose.connection.db.listCollections().toArray();
      
      for (const collection of collections) {
        try {
          await mongoose.connection.db.command({
            compact: collection.name
          });
          console.log(`✅ Compacted collection: ${collection.name}`);
        } catch (err) {
          console.warn(`⚠️  Could not compact ${collection.name}: ${err.message}`);
        }
      }

      await SystemLog.logEvent(
        'info',
        'Database optimization completed',
        'database',
        'system',
        { collectionsProcessed: collections.length }
      );

      console.log('⚡ Database optimization completed');
    } catch (error) {
      console.error('❌ Error optimizing database:', error);
      
      await SystemLog.logEvent(
        'error',
        'Database optimization failed',
        'database',
        'system',
        { error: error.message, stack: error.stack }
      );
      
      throw error;
    }
  }

  /**
   * Get collection sizes and document counts
   */
  static async getCollectionSizes() {
    try {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      const sizes = {};

      for (const collection of collections) {
        const stats = await db.collection(collection.name).stats();
        sizes[collection.name] = {
          documents: stats.count,
          dataSize: this.formatBytes(stats.size),
          indexSize: this.formatBytes(stats.totalIndexSize),
          totalSize: this.formatBytes(stats.size + stats.totalIndexSize)
        };
      }

      return sizes;
    } catch (error) {
      console.error('❌ Error getting collection sizes:', error);
      throw error;
    }
  }

  /**
   * Format bytes to human readable format
   */
  static formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

module.exports = DatabaseUtils;