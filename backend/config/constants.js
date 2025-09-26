module.exports = {
  // Server configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/breatheasy',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // Email configuration
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'gmail',
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM || process.env.EMAIL_USER,
  
  // Twilio configuration
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  
  // API Keys
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY,
  AIRNOW_API_KEY: process.env.AIRNOW_API_KEY,
  
  // Frontend configuration
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  
  // Notification settings
  NOTIFICATION_COOLDOWN_HOURS: parseInt(process.env.NOTIFICATION_COOLDOWN_HOURS) || 2,
  AQI_CHECK_INTERVAL_MINUTES: parseInt(process.env.AQI_CHECK_INTERVAL_MINUTES) || 60,
  
  // AQI thresholds
  AQI_THRESHOLDS: {
    GOOD: 50,
    MODERATE: 100,
    UNHEALTHY_SENSITIVE: 150,
    UNHEALTHY: 200,
    VERY_UNHEALTHY: 300,
    HAZARDOUS: 500
  },
  
  // AQI colors
  AQI_COLORS: {
    GOOD: '#00E400',
    MODERATE: '#FFFF00',
    UNHEALTHY_SENSITIVE: '#FF7E00',
    UNHEALTHY: '#FF0000',
    VERY_UNHEALTHY: '#8F3F97',
    HAZARDOUS: '#7E0023'
  },

  // AQI Categories with ranges
  AQI_CATEGORIES: [
    { min: 0, max: 50, label: 'Good', color: '#00E400' },
    { min: 51, max: 100, label: 'Moderate', color: '#FFFF00' },
    { min: 101, max: 150, label: 'Unhealthy for Sensitive Groups', color: '#FF7E00' },
    { min: 151, max: 200, label: 'Unhealthy', color: '#FF0000' },
    { min: 201, max: 300, label: 'Very Unhealthy', color: '#8F3F97' },
    { min: 301, max: 500, label: 'Hazardous', color: '#7E0023' }
  ]
};