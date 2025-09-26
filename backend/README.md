# Breath Easy Backend API

A scalable Node.js backend service for the Breath Easy AQI (Air Quality Index) monitoring and notification system.

## 🌟 Features

- **Real-time AQI Monitoring**: Automated monitoring of air quality for subscribed locations
- **Multi-channel Notifications**: Email and SMS alerts when AQI exceeds user-defined thresholds
- **User Management**: JWT-based authentication with role-based access control
- **Location Services**: Geocoding and reverse geocoding for accurate location handling
- **Scheduled Jobs**: Automated cron jobs for monitoring, cleanup, and health checks
- **Admin Dashboard**: Comprehensive admin interface for system management
- **Scalable Architecture**: Modular design with proper separation of concerns
- **Comprehensive Logging**: Structured logging with Winston
- **Error Handling**: Centralized error handling with detailed error responses
- **API Rate Limiting**: Protection against abuse with configurable rate limits
- **Health Monitoring**: Built-in health checks and system monitoring

## 🏗️ Architecture

```
backend/
├── config/           # Configuration files
│   ├── constants.js  # Application constants
│   ├── database.js   # MongoDB connection
│   └── logger.js     # Winston logging configuration
├── middleware/       # Express middleware
│   ├── auth.js       # Authentication middleware
│   ├── errorHandler.js  # Global error handler
│   ├── notFoundHandler.js  # 404 handler
│   └── validation.js # Request validation
├── models/          # Mongoose data models
│   ├── User.js      # User model
│   ├── Subscription.js  # Subscription model
│   └── Notification.js  # Notification model
├── routes/          # API route handlers
│   ├── auth.js      # Authentication routes
│   ├── subscriptions.js  # Subscription management
│   ├── notifications.js  # Notification handling
│   ├── aqi.js       # AQI data endpoints
│   └── admin.js     # Admin management
├── services/        # Business logic services
│   ├── aqiService.js     # AQI data fetching
│   ├── notificationService.js  # Email/SMS sending
│   ├── geocodingService.js     # Location services
│   └── cronService.js          # Scheduled jobs
└── server.js        # Application entry point
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## 📋 Environment Configuration

### Required Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/breath_easy

# JWT Security
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=24h

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Optional Services

```env
# Email Service (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# AQI Data Service
OPENWEATHER_API_KEY=your-api-key
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Subscriptions
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions` - List user subscriptions
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Delete subscription
- `GET /api/subscriptions/verify` - Verify email subscription

### AQI Data
- `GET /api/aqi/current` - Get current AQI data
- `GET /api/aqi/forecast` - Get AQI forecast
- `GET /api/aqi/historical` - Get historical AQI data
- `GET /api/aqi/categories` - Get AQI categories
- `GET /api/aqi/health-recommendations` - Get health recommendations

### Notifications
- `GET /api/notifications/history/:subscriptionId` - Get notification history
- `POST /api/notifications/send-test` - Send test notification (dev only)
- `GET /api/notifications/stats` - Get notification statistics (admin)

### Admin
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/users` - Manage users
- `GET /api/admin/subscriptions` - Manage subscriptions
- `GET /api/admin/system-health` - System health status

### Health Check
- `GET /api/health` - Server health status

## 🔧 Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Check for security vulnerabilities
npm audit
```

### Code Structure

- **Models**: Mongoose schemas for MongoDB collections
- **Routes**: Express route handlers grouped by feature
- **Services**: Business logic and external API integrations
- **Middleware**: Request processing and security layers
- **Config**: Application configuration and constants

## 📊 Monitoring & Logging

### Logging Levels
- `error`: Error messages
- `warn`: Warning messages
- `info`: General information
- `debug`: Debug information (development only)

### Log Files
- `logs/combined.log` - All log levels
- `logs/error.log` - Error logs only
- Console output for development

### Health Checks
- Database connectivity
- External API availability
- Memory usage monitoring
- Recent notification failures

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against API abuse
- **CORS Configuration**: Cross-origin request security
- **Helmet.js**: Security headers middleware
- **Input Validation**: Request data validation with Joi
- **Password Hashing**: bcrypt for secure password storage

## 📧 Notification System

### Email Notifications
- Welcome emails for new subscriptions
- AQI alert emails with detailed information
- Email verification for subscriptions
- Broadcast notifications for announcements

### SMS Notifications
- Concise AQI alerts via Twilio
- Configurable per subscription
- Rate-limited to prevent spam

### Templates
- Responsive HTML email templates
- Customizable notification content
- Multi-language support ready

## 🕒 Scheduled Jobs

### AQI Monitoring (Every 30 minutes)
- Checks all active subscriptions
- Fetches current AQI data
- Sends alerts when thresholds exceeded
- Respects notification cooldown periods

### Cleanup (Daily at 2 AM)
- Removes old failed notifications
- Deletes unverified subscriptions (7+ days)
- Cleans up inactive subscriptions (90+ days)

### Health Check (Hourly)
- Monitors system health
- Logs service status
- Alerts on critical failures

## 🚀 Deployment

### Production Setup

1. **Set environment to production**
   ```env
   NODE_ENV=production
   ```

2. **Configure production database**
   ```env
   MONGODB_URI=mongodb://your-production-db
   ```

3. **Set secure JWT secret**
   ```env
   JWT_SECRET=your-super-secure-production-secret
   ```

4. **Configure email/SMS services**
   ```env
   SMTP_HOST=your-smtp-server
   TWILIO_ACCOUNT_SID=your-production-sid
   ```

5. **Start with PM2 (recommended)**
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   ```

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### API Testing with Postman
Import the provided Postman collection for comprehensive API testing.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@breatheasy.com
- Documentation: [Wiki](https://github.com/your-repo/wiki)

## 🙏 Acknowledgments

- OpenWeatherMap for AQI data
- Twilio for SMS services
- MongoDB for database
- All contributors and users

---

**Breath Easy Backend API** - Helping you breathe easier with real-time air quality monitoring! 🌱