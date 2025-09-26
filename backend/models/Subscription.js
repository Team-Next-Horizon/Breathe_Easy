const mongoose = require('mongoose');
const { NOTIFICATION_COOLDOWN_HOURS } = require('../config/constants');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous subscriptions
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
    match: [/^\+?\d{10,15}$/, 'Please enter a valid mobile number']
  },
  location: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    timezone: String,
    country: String,
    state: String,
    city: String
  },
  preferences: {
    aqiThreshold: {
      type: Number,
      required: true,
      min: 0,
      max: 500,
      default: 100
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: false }
    },
    notificationTime: {
      start: { type: String, default: '08:00' }, // 24-hour format
      end: { type: String, default: '22:00' }
    },
    languages: [{
      type: String,
      enum: ['en', 'es', 'fr', 'de', 'hi', 'zh'],
      default: 'en'
    }]
  },
  status: {
    isActive: {
      type: Boolean,
      default: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    lastNotified: {
      type: Date,
      default: null
    },
    notificationCount: {
      type: Number,
      default: 0
    },
    lastAQICheck: {
      type: Date,
      default: null
    }
  },
  verification: {
    emailToken: String,
    emailVerifiedAt: Date,
    phoneToken: String,
    phoneVerifiedAt: Date
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    source: {
      type: String,
      enum: ['web', 'mobile', 'api'],
      default: 'web'
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
subscriptionSchema.index({ email: 1 });
subscriptionSchema.index({ 'location.name': 1 });
subscriptionSchema.index({ 'location.coordinates': '2dsphere' });
subscriptionSchema.index({ 'status.isActive': 1 });
subscriptionSchema.index({ 'status.lastNotified': 1 });
subscriptionSchema.index({ user: 1 });

// Virtual for full location
subscriptionSchema.virtual('fullLocation').get(function() {
  const parts = [this.location.city, this.location.state, this.location.country].filter(Boolean);
  return parts.join(', ') || this.location.name;
});

// Method to check if user should be notified (avoid spam)
subscriptionSchema.methods.shouldNotify = function() {
  if (!this.status.lastNotified) return true;
  
  const cooldownMs = NOTIFICATION_COOLDOWN_HOURS * 60 * 60 * 1000;
  const cooldownTime = new Date(Date.now() - cooldownMs);
  return this.status.lastNotified < cooldownTime;
};

// Method to check if notification time is within preferred hours
subscriptionSchema.methods.isWithinNotificationTime = function() {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const startTime = this.preferences.notificationTime.start;
  const endTime = this.preferences.notificationTime.end;
  
  return currentTime >= startTime && currentTime <= endTime;
};

// Method to update last notification
subscriptionSchema.methods.markNotified = async function() {
  this.status.lastNotified = new Date();
  this.status.notificationCount += 1;
  await this.save();
};

// Static method to find active subscriptions by location
subscriptionSchema.statics.findActiveByLocation = function(location) {
  return this.find({
    'location.name': new RegExp(location, 'i'),
    'status.isActive': true,
    'status.isVerified': true
  });
};

// Static method to find subscriptions due for notification
subscriptionSchema.statics.findDueForNotification = function() {
  const cooldownTime = new Date(Date.now() - NOTIFICATION_COOLDOWN_HOURS * 60 * 60 * 1000);
  
  return this.find({
    'status.isActive': true,
    'status.isVerified': true,
    $or: [
      { 'status.lastNotified': { $lt: cooldownTime } },
      { 'status.lastNotified': null }
    ]
  });
};

module.exports = mongoose.model('Subscription', subscriptionSchema);