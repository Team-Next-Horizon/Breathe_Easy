# Breath Easy - Complete MongoDB Database Schema

## 📊 Database Overview
**Database Name**: `breatheeasy`  
**MongoDB Version**: >= 4.4  
**Total Collections**: 6 (3 existing + 3 additional for enhanced functionality)

---

## 🏗️ Core Collections

### 1. **Users Collection**
```javascript
// Collection: users
{
  _id: ObjectId(),
  name: String, // Max 50 chars, required
  email: String, // Unique, lowercase, validated
  password: String, // Hashed, min 6 chars, select: false
  mobile: String, // Optional, validated format
  role: String, // 'user' | 'admin', default: 'user'
  isActive: Boolean, // default: true
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  isEmailVerified: Boolean, // default: false
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ isActive: 1 })
db.users.createIndex({ role: 1 })
```

### 2. **Subscriptions Collection**
```javascript
// Collection: subscriptions
{
  _id: ObjectId(),
  user: ObjectId, // Ref: User (optional for anonymous)
  email: String, // Required, validated
  mobile: String, // Required, validated
  location: {
    name: String, // Required
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    timezone: String,
    country: String,
    state: String,
    city: String
  },
  preferences: {
    aqiThreshold: Number, // 0-500, default: 100
    notifications: {
      email: Boolean, // default: true
      sms: Boolean, // default: true
      push: Boolean // default: false
    },
    notificationTime: {
      start: String, // "08:00" format
      end: String // "22:00" format
    },
    languages: [String] // ['en', 'es', 'fr', 'de', 'hi', 'zh']
  },
  status: {
    isActive: Boolean, // default: true
    isVerified: Boolean, // default: false
    lastNotified: Date,
    notificationCount: Number, // default: 0
    lastAQICheck: Date
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
    source: String // 'web' | 'mobile' | 'api'
  },
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.subscriptions.createIndex({ email: 1 })
db.subscriptions.createIndex({ "location.name": 1 })
db.subscriptions.createIndex({ "location.coordinates": "2dsphere" })
db.subscriptions.createIndex({ "status.isActive": 1 })
db.subscriptions.createIndex({ "status.lastNotified": 1 })
db.subscriptions.createIndex({ user: 1 })
```

### 3. **Notifications Collection**
```javascript
// Collection: notifications
{
  _id: ObjectId(),
  subscription: ObjectId, // Ref: Subscription, required
  type: String, // 'email' | 'sms' | 'push', required
  subject: String, // Required
  content: {
    html: String,
    text: String,
    template: String,
    templateData: Mixed
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
    pollutants: Mixed,
    source: String,
    color: String
  },
  delivery: {
    status: String, // 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced'
    sentAt: Date,
    deliveredAt: Date,
    failedAt: Date,
    error: String,
    attempts: Number, // default: 0
    maxAttempts: Number, // default: 3
    nextRetryAt: Date
  },
  provider: {
    name: String, // 'nodemailer' | 'twilio' | 'firebase'
    messageId: String,
    response: Mixed
  },
  metrics: {
    opened: Boolean, // default: false
    openedAt: Date,
    clicked: Boolean, // default: false
    clickedAt: Date,
    userAgent: String,
    ipAddress: String
  },
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.notifications.createIndex({ subscription: 1 })
db.notifications.createIndex({ type: 1 })
db.notifications.createIndex({ "delivery.status": 1 })
db.notifications.createIndex({ "delivery.sentAt": -1 })
db.notifications.createIndex({ createdAt: -1 })
db.notifications.createIndex({ "delivery.nextRetryAt": 1 })
```

---

## 🚀 Additional Collections for Enhanced Functionality

### 4. **AQI Logs Collection** (Recommended Addition)
```javascript
// Collection: aqilogs
{
  _id: ObjectId(),
  location: {
    name: String, // Required
    coordinates: {
      type: String, // "Point"
      coordinates: [Number, Number] // [longitude, latitude]
    },
    country: String,
    state: String,
    city: String
  },
  aqiData: {
    aqi: Number, // Required
    category: String, // 'Good', 'Moderate', etc.
    color: String, // Hex color code
    description: String,
    healthRecommendations: String
  },
  pollutants: {
    pm25: Number,
    pm10: Number,
    no2: Number,
    so2: Number,
    co: Number,
    o3: Number
  },
  metadata: {
    source: String, // 'openweather', 'aqicn', 'nasa_tempo'
    confidence: Number, // 0-100
    lastUpdated: Date,
    stationId: String
  },
  forecast: [{
    datetime: Date,
    aqi: Number,
    category: String,
    pollutants: Mixed
  }],
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.aqilogs.createIndex({ "location.coordinates": "2dsphere" })
db.aqilogs.createIndex({ "location.name": 1 })
db.aqilogs.createIndex({ createdAt: -1 })
db.aqilogs.createIndex({ "aqiData.aqi": 1 })
db.aqilogs.createIndex({ "metadata.source": 1 })
```

### 5. **Monitoring Stations Collection** (Recommended Addition)
```javascript
// Collection: stations
{
  _id: ObjectId(),
  stationId: String, // Unique identifier
  name: String, // Required
  location: {
    type: String, // "Point"
    coordinates: [Number, Number], // [longitude, latitude]
    address: String,
    city: String,
    state: String,
    country: String,
    timezone: String
  },
  stationType: String, // 'government', 'private', 'nasa_tempo'
  parameters: [String], // ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3']
  status: {
    isActive: Boolean, // default: true
    lastReading: Date,
    dataQuality: String, // 'excellent', 'good', 'fair', 'poor'
    uptime: Number // Percentage
  },
  metadata: {
    operator: String,
    installDate: Date,
    elevation: Number,
    landUse: String,
    populationDensity: String
  },
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.stations.createIndex({ stationId: 1 }, { unique: true })
db.stations.createIndex({ "location.coordinates": "2dsphere" })
db.stations.createIndex({ "status.isActive": 1 })
db.stations.createIndex({ stationType: 1 })
```

### 6. **System Logs Collection** (Recommended Addition)
```javascript
// Collection: systemlogs
{
  _id: ObjectId(),
  level: String, // 'info', 'warn', 'error', 'debug'
  message: String, // Required
  service: String, // 'api', 'notification', 'cron', 'auth'
  action: String, // 'login', 'send_notification', 'aqi_fetch'
  userId: ObjectId, // Optional, ref: User
  metadata: {
    ip: String,
    userAgent: String,
    endpoint: String,
    method: String,
    statusCode: Number,
    responseTime: Number,
    errorStack: String
  },
  createdAt: Date
}

// Indexes
db.systemlogs.createIndex({ level: 1 })
db.systemlogs.createIndex({ service: 1 })
db.systemlogs.createIndex({ createdAt: -1 })
db.systemlogs.createIndex({ userId: 1 })
db.systemlogs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }) // 30 days TTL
```

---

## 🔧 Database Configuration

### Connection Settings
```javascript
// config/database.js
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/breatheeasy';

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  writeConcern: {
    w: 'majority',
    j: true,
    wtimeout: 10000
  }
};
```

### Compound Indexes for Performance
```javascript
// Performance optimization indexes
db.notifications.createIndex({ 
  subscription: 1, 
  "delivery.status": 1, 
  createdAt: -1 
});

db.subscriptions.createIndex({ 
  "status.isActive": 1, 
  "status.isVerified": 1, 
  "preferences.aqiThreshold": 1 
});

db.aqilogs.createIndex({ 
  "location.name": 1, 
  createdAt: -1 
});
```

---

## 📈 Data Volume Estimates

| Collection | Expected Documents | Growth Rate | Storage (Approx) |
|------------|-------------------|-------------|------------------|
| users | 10K - 100K | Medium | 10-100 MB |
| subscriptions | 20K - 200K | Medium | 50-500 MB |
| notifications | 1M - 10M | High | 1-10 GB |
| aqilogs | 100K - 1M | High | 100MB - 1GB |
| stations | 1K - 10K | Low | 1-10 MB |
| systemlogs | 1M - 10M | High | 500MB - 5GB |

---

## 🛡️ Security Considerations

### 1. Field Encryption
```javascript
// Sensitive fields that should be encrypted
- User.password (already hashed)
- User.resetPasswordToken
- Subscription.verification.emailToken
- Subscription.verification.phoneToken
```

### 2. Data Retention Policies
```javascript
// TTL Indexes for automatic cleanup
db.systemlogs.createIndex(
  { "createdAt": 1 }, 
  { expireAfterSeconds: 2592000 } // 30 days
);

db.notifications.createIndex(
  { "createdAt": 1 }, 
  { expireAfterSeconds: 7776000 } // 90 days
);
```

### 3. User Data Privacy
```javascript
// GDPR compliance fields
{
  gdprConsent: {
    accepted: Boolean,
    acceptedAt: Date,
    ipAddress: String
  },
  dataRetention: {
    deleteAfter: Date,
    anonymizeAfter: Date
  }
}
```

---

## 🚀 Migration Scripts

### Initial Setup Script
```javascript
// scripts/setupDatabase.js
const mongoose = require('mongoose');

async function setupDatabase() {
  // Create collections
  await db.createCollection('users');
  await db.createCollection('subscriptions');
  await db.createCollection('notifications');
  await db.createCollection('aqilogs');
  await db.createCollection('stations');
  await db.createCollection('systemlogs');
  
  // Create indexes (as shown above)
  
  console.log('Database setup complete!');
}
```

This comprehensive schema supports all current functionality and provides room for future enhancements like forecasting, historical data analysis, and advanced monitoring capabilities.