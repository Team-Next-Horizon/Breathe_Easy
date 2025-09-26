const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['error', 'warn', 'info', 'debug', 'trace'],
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true,
    index: 'text'
  },
  service: {
    type: String,
    required: true,
    enum: [
      'api-server',
      'notification-service',
      'data-fetcher',
      'email-service',
      'sms-service',
      'auth-service',
      'geocoding-service',
      'aqi-service',
      'scheduler',
      'database',
      'external-api'
    ],
    index: true
  },
  category: {
    type: String,
    enum: [
      'authentication',
      'authorization',
      'data-fetch',
      'notification',
      'database',
      'external-api',
      'system',
      'security',
      'performance',
      'user-action'
    ],
    index: true
  },
  details: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true
    },
    endpoint: String,
    method: String,
    statusCode: Number,
    responseTime: Number, // milliseconds
    userAgent: String,
    ipAddress: String,
    location: String,
    errorCode: String,
    stackTrace: String,
    requestBody: mongoose.Schema.Types.Mixed,
    responseBody: mongoose.Schema.Types.Mixed
  },
  metadata: {
    environment: {
      type: String,
      enum: ['development', 'staging', 'production'],
      default: process.env.NODE_ENV || 'development'
    },
    version: String,
    hostname: String,
    processId: Number,
    memoryUsage: {
      heapUsed: Number,
      heapTotal: Number,
      external: Number,
      rss: Number
    },
    cpuUsage: {
      user: Number,
      system: Number
    }
  },
  context: {
    correlationId: String, // For tracking requests across services
    sessionId: String,
    requestId: String,
    batchId: String, // For batch operations
    jobId: String // For scheduled jobs
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: function() {
      const severityMap = {
        'error': 'high',
        'warn': 'medium',
        'info': 'low',
        'debug': 'low',
        'trace': 'low'
      };
      return severityMap[this.level] || 'low';
    }
  },
  resolved: {
    status: {
      type: Boolean,
      default: false
    },
    resolvedAt: Date,
    resolvedBy: String,
    resolution: String
  },
  tags: [String], // For custom categorization
  count: {
    type: Number,
    default: 1
  } // For duplicate log aggregation
}, {
  timestamps: true
});

// Indexes for efficient queries
systemLogSchema.index({ createdAt: -1 });
systemLogSchema.index({ level: 1, createdAt: -1 });
systemLogSchema.index({ service: 1, createdAt: -1 });
systemLogSchema.index({ category: 1, createdAt: -1 });
systemLogSchema.index({ severity: 1, createdAt: -1 });
systemLogSchema.index({ 'details.userId': 1, createdAt: -1 });
systemLogSchema.index({ 'context.correlationId': 1 });
systemLogSchema.index({ 'context.sessionId': 1 });
systemLogSchema.index({ resolved: 1, level: 1 });

// TTL index - logs older than 90 days will be automatically deleted
systemLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

// Text index for searching log messages
systemLogSchema.index({ 
  'message': 'text', 
  'details.errorCode': 'text',
  'tags': 'text'
});

// Virtual for formatted timestamp
systemLogSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toISOString();
});

// Static method to log events
systemLogSchema.statics.logEvent = function(level, message, service, category, details = {}, context = {}) {
  return this.create({
    level,
    message,
    service,
    category,
    details,
    context,
    metadata: {
      hostname: process.env.HOSTNAME || require('os').hostname(),
      processId: process.pid,
      version: process.env.APP_VERSION,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    }
  });
};

// Static method to get error summary
systemLogSchema.statics.getErrorSummary = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        level: { $in: ['error', 'warn'] },
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          service: '$service',
          level: '$level',
          category: '$category'
        },
        count: { $sum: '$count' },
        lastOccurrence: { $max: '$createdAt' },
        messages: { $addToSet: '$message' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static method to get service health
systemLogSchema.statics.getServiceHealth = function(hours = 24) {
  const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$service',
        totalLogs: { $sum: '$count' },
        errors: {
          $sum: {
            $cond: [{ $eq: ['$level', 'error'] }, '$count', 0]
          }
        },
        warnings: {
          $sum: {
            $cond: [{ $eq: ['$level', 'warn'] }, '$count', 0]
          }
        },
        lastActivity: { $max: '$createdAt' }
      }
    },
    {
      $addFields: {
        healthScore: {
          $multiply: [
            {
              $subtract: [
                1,
                {
                  $divide: [
                    { $add: ['$errors', { $multiply: ['$warnings', 0.5] }] },
                    '$totalLogs'
                  ]
                }
              ]
            },
            100
          ]
        }
      }
    },
    {
      $sort: { healthScore: -1 }
    }
  ]);
};

// Method to mark as resolved
systemLogSchema.methods.markResolved = function(resolvedBy, resolution) {
  this.resolved.status = true;
  this.resolved.resolvedAt = new Date();
  this.resolved.resolvedBy = resolvedBy;
  this.resolved.resolution = resolution;
  return this.save();
};

// Pre-save middleware to set severity based on level
systemLogSchema.pre('save', function(next) {
  if (!this.severity) {
    const severityMap = {
      'error': 'high',
      'warn': 'medium',
      'info': 'low',
      'debug': 'low',
      'trace': 'low'
    };
    this.severity = severityMap[this.level] || 'low';
  }
  next();
});

module.exports = mongoose.model('SystemLog', systemLogSchema);