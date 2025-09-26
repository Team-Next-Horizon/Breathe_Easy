const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  type: {
    type: String,
    enum: ['email', 'sms', 'push'],
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  content: {
    html: String,
    text: String,
    template: String,
    templateData: mongoose.Schema.Types.Mixed
  },
  recipient: {
    email: String,
    phone: String,
    deviceToken: String
  },
  aqiData: {
    aqi: Number,
    category: String,
    location: String,
    timestamp: Date,
    pollutants: mongoose.Schema.Types.Mixed,
    source: String,
    color: String
  },
  delivery: {
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed', 'bounced'],
      default: 'pending'
    },
    sentAt: Date,
    deliveredAt: Date,
    failedAt: Date,
    error: String,
    attempts: {
      type: Number,
      default: 0
    },
    maxAttempts: {
      type: Number,
      default: 3
    },
    nextRetryAt: Date
  },
  provider: {
    name: String, // 'nodemailer', 'twilio', 'firebase', etc.
    messageId: String,
    response: mongoose.Schema.Types.Mixed
  },
  metrics: {
    opened: {
      type: Boolean,
      default: false
    },
    openedAt: Date,
    clicked: {
      type: Boolean,
      default: false
    },
    clickedAt: Date,
    userAgent: String,
    ipAddress: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ subscription: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ 'delivery.status': 1 });
notificationSchema.index({ 'delivery.sentAt': -1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ 'delivery.nextRetryAt': 1 });

// Virtual for delivery duration
notificationSchema.virtual('deliveryDuration').get(function() {
  if (this.delivery.sentAt && this.delivery.deliveredAt) {
    return this.delivery.deliveredAt - this.delivery.sentAt;
  }
  return null;
});

// Method to mark as sent
notificationSchema.methods.markSent = async function(messageId, response) {
  this.delivery.status = 'sent';
  this.delivery.sentAt = new Date();
  this.provider.messageId = messageId;
  this.provider.response = response;
  await this.save();
};

// Method to mark as delivered
notificationSchema.methods.markDelivered = async function() {
  this.delivery.status = 'delivered';
  this.delivery.deliveredAt = new Date();
  await this.save();
};

// Method to mark as failed
notificationSchema.methods.markFailed = async function(error) {
  this.delivery.status = 'failed';
  this.delivery.failedAt = new Date();
  this.delivery.error = error;
  this.delivery.attempts += 1;
  
  // Schedule retry if under max attempts
  if (this.delivery.attempts < this.delivery.maxAttempts) {
    const retryDelay = Math.pow(2, this.delivery.attempts) * 60 * 1000; // Exponential backoff
    this.delivery.nextRetryAt = new Date(Date.now() + retryDelay);
    this.delivery.status = 'pending';
  }
  
  await this.save();
};

// Static method to find notifications for retry
notificationSchema.statics.findForRetry = function() {
  return this.find({
    'delivery.status': 'pending',
    'delivery.nextRetryAt': { $lte: new Date() },
    'delivery.attempts': { $lt: 3 }
  });
};

// Static method to get delivery statistics
notificationSchema.statics.getDeliveryStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default 30 days
          $lte: endDate || new Date()
        }
      }
    },
    {
      $group: {
        _id: '$delivery.status',
        count: { $sum: 1 },
        avgDeliveryTime: {
          $avg: {
            $subtract: ['$delivery.deliveredAt', '$delivery.sentAt']
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Notification', notificationSchema);