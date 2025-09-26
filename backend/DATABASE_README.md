# Breath Easy Database Documentation

## Overview
The Breath Easy project uses MongoDB as its primary database with Mongoose ODM for data modeling and validation. This document provides comprehensive information about the database schema, models, and operations.

## Database Collections

### 1. Users Collection
Stores user account information, authentication details, and preferences.

**Key Features:**
- Secure password hashing with bcrypt
- JWT token management
- Email verification system
- User preferences and settings
- Account status tracking

### 2. Subscriptions Collection
Manages user subscriptions to air quality alerts for specific locations.

**Key Features:**
- Location-based subscriptions with geospatial indexing
- Multiple notification methods (email, SMS, push)
- Threshold-based alert configuration
- Subscription status management
- Delivery preference settings

### 3. Notifications Collection
Tracks all notifications sent to users with delivery status and retry logic.

**Key Features:**
- Multi-channel delivery (email, SMS, push)
- Delivery status tracking
- Retry mechanism for failed deliveries
- Template-based messaging
- Performance metrics

### 4. AQI Logs Collection
Historical air quality data storage with geospatial and temporal indexing.

**Key Features:**
- Comprehensive pollutant data (PM2.5, PM10, NO2, SO2, CO, O3)
- Geospatial queries for location-based data
- Multiple data sources integration
- Forecast data storage
- Data quality metrics

### 5. Monitoring Stations Collection
Information about air quality monitoring stations and their equipment.

**Key Features:**
- Station metadata and location data
- Equipment and sensor information
- Operational status tracking
- Maintenance scheduling
- Data quality assessments

### 6. System Logs Collection
Application logging for monitoring, debugging, and audit purposes.

**Key Features:**
- Structured logging with multiple levels
- Service-based categorization
- Performance monitoring
- Error tracking and resolution
- Automatic log retention (90 days)

## Database Setup

### Prerequisites
- MongoDB 4.4 or higher
- Node.js 14 or higher
- Mongoose 6.x or higher

### Installation Steps

1. **Install MongoDB:**
   ```bash
   # Windows (using Chocolatey)
   choco install mongodb

   # macOS (using Homebrew)
   brew install mongodb-community

   # Ubuntu/Debian
   sudo apt-get install mongodb
   ```

2. **Start MongoDB Service:**
   ```bash
   # Windows
   net start MongoDB

   # macOS/Linux
   sudo systemctl start mongod
   ```

3. **Environment Configuration:**
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/breath_easy
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   ```

4. **Install Dependencies:**
   ```bash
   cd backend
   npm install mongoose bcryptjs jsonwebtoken
   ```

### Database Initialization

1. **Create Indexes:**
   ```bash
   node -e "require('./utils/DatabaseUtils').createIndexes()"
   ```

2. **Seed Sample Data:**
   ```bash
   node scripts/seedDatabase.js
   ```

3. **Verify Setup:**
   ```bash
   node -e "require('./utils/DatabaseUtils').getDatabaseStats().then(console.log)"
   ```

## Model Usage Examples

### User Operations
```javascript
const { User } = require('./models');

// Create new user
const user = new User({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'securePassword123'
});
await user.save();

// Authenticate user
const authenticatedUser = await User.findByCredentials('john@example.com', 'securePassword123');

// Generate auth token
const token = await user.generateAuthToken();
```

### Subscription Management
```javascript
const { Subscription } = require('./models');

// Create location subscription
const subscription = new Subscription({
  userId: user._id,
  location: {
    name: 'New York, NY',
    coordinates: [-73.9857, 40.7484]
  },
  thresholds: {
    aqi: 100,
    pm25: 35.5
  },
  preferences: {
    email: true,
    sms: false
  }
});
await subscription.save();

// Find subscriptions by location
const nearbySubscriptions = await Subscription.findNearby(-73.9857, 40.7484, 5000);
```

### AQI Data Queries
```javascript
const { AQILog } = require('./models');

// Get latest AQI for location
const latestAQI = await AQILog.getLatestForLocation('New York');

// Get historical data
const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const endDate = new Date();
const historicalData = await AQILog.getHistoricalData('New York', startDate, endDate);

// Calculate average AQI
const avgData = await AQILog.getAverageAQI('New York', 30);
```

### System Logging
```javascript
const { SystemLog } = require('./models');

// Log events
await SystemLog.logEvent(
  'info',
  'User logged in successfully',
  'auth-service',
  'authentication',
  { userId: user._id, ipAddress: req.ip },
  { sessionId: req.sessionID }
);

// Get error summary
const errorSummary = await SystemLog.getErrorSummary(
  new Date(Date.now() - 24 * 60 * 60 * 1000),
  new Date()
);
```

## Database Maintenance

### Regular Tasks

1. **Daily:**
   - Monitor system logs for errors
   - Check database performance metrics
   - Verify notification delivery rates

2. **Weekly:**
   - Review data integrity
   - Check storage usage
   - Update monitoring station status

3. **Monthly:**
   - Clean up old logs
   - Optimize database indexes
   - Generate performance reports
   - Backup critical data

### Maintenance Scripts

```bash
# Database cleanup (remove old logs)
node -e "require('./utils/DatabaseUtils').cleanupOldData()"

# Data integrity check
node -e "require('./utils/DatabaseUtils').validateDataIntegrity()"

# Performance optimization
node -e "require('./utils/DatabaseUtils').optimizeDatabase()"

# Create backup
node -e "require('./utils/DatabaseUtils').backupCollections(['users', 'subscriptions'])"
```

## Performance Optimization

### Indexing Strategy
- **Geospatial indexes** for location-based queries
- **Compound indexes** for common query patterns
- **Text indexes** for search functionality
- **TTL indexes** for automatic data expiration

### Query Optimization
- Use projection to limit returned fields
- Implement proper pagination for large datasets
- Use aggregation pipelines for complex queries
- Cache frequently accessed data

### Connection Management
- Connection pooling with optimal pool size
- Connection timeout configuration
- Automatic reconnection handling
- Connection monitoring and health checks

## Security Considerations

### Data Protection
- Password hashing with bcrypt (12 rounds)
- JWT token encryption and expiration
- Input validation and sanitization
- MongoDB injection prevention

### Access Control
- Database user permissions
- Network security (MongoDB port access)
- Environment variable protection
- Audit logging for sensitive operations

### Privacy Compliance
- Data anonymization for analytics
- User data deletion capabilities
- Consent management for notifications
- Data retention policies

## Monitoring and Alerts

### Key Metrics
- Database connection count
- Query response times
- Error rates by service
- Storage usage trends
- Index performance

### Alert Conditions
- High error rates (>5% in 5 minutes)
- Slow query performance (>1s average)
- Connection pool exhaustion
- Storage usage >80%
- Failed notification deliveries

## Troubleshooting

### Common Issues

1. **Connection Timeouts:**
   - Check MongoDB service status
   - Verify network connectivity
   - Review connection pool settings

2. **Slow Queries:**
   - Analyze query execution plans
   - Check index usage
   - Consider query optimization

3. **High Memory Usage:**
   - Review document sizes
   - Optimize data structures
   - Implement data archiving

4. **Index Issues:**
   - Rebuild corrupted indexes
   - Add missing indexes for new queries
   - Monitor index usage patterns

### Debug Commands
```bash
# Check database status
mongo --eval "db.adminCommand('serverStatus')"

# Analyze slow queries
mongo --eval "db.setProfilingLevel(2, {slowms: 100})"

# Check index usage
mongo --eval "db.collection.getIndexes()"

# Monitor real-time operations
mongostat --host localhost:27017
```

## Migration Scripts

When updating the database schema, use migration scripts to ensure data consistency:

```javascript
// Example migration script
const mongoose = require('mongoose');

async function migrateUserPreferences() {
  const users = await User.find({ preferences: { $exists: false } });
  
  for (const user of users) {
    user.preferences = {
      notifications: true,
      dataSharing: false,
      theme: 'light'
    };
    await user.save();
  }
  
  console.log(`Migrated ${users.length} users`);
}
```

## API Integration

The database models integrate seamlessly with the REST API endpoints:

- **GET /api/users/profile** - User model
- **POST /api/subscriptions** - Subscription model
- **GET /api/aqi/location/:name** - AQILog model
- **GET /api/stations/nearby** - MonitoringStation model
- **GET /api/admin/logs** - SystemLog model

## Support and Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Node.js MongoDB Driver](https://mongodb.github.io/node-mongodb-native/)
- [MongoDB Compass](https://www.mongodb.com/products/compass) - GUI for database management

For technical support or questions about the database implementation, please refer to the project documentation or contact the development team.