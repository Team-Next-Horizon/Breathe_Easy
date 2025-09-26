# 🎯 Environment Variables Quick Reference

## 🚀 Minimal Setup (Development)
```bash
MONGODB_URI=mongodb://127.0.0.1:27017/breath_easy
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
USE_MOCK_DATA=true
```

## 📧 Gmail OAuth2 Setup
```bash
CLIENT_ID=your-client-id.apps.googleusercontent.com
CLIENT_SECRET=your-client-secret
REFRESH_TOKEN=your-oauth2-refresh-token
SMTP_USER=your-email@gmail.com
```

## 📧 Gmail App Password (Alternative)
```bash
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-digit-app-password
```

## 📱 Twilio SMS
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

## 🌤️ Air Quality APIs
```bash
OPENWEATHER_API_KEY=your-openweather-key
AQICN_API_TOKEN=your-aqicn-token
```

## 🗺️ Geocoding APIs
```bash
GOOGLE_MAPS_API_KEY=your-google-maps-key
```

## 🔒 Security (Production)
```bash
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
```

---

**Files Created:**
- ✅ `.env` - Complete environment configuration
- ✅ `EMAIL_SMS_SETUP.md` - Detailed setup instructions
- ✅ This quick reference card

**Test Command:**
```bash
node test-env-config.js  # (if you recreate the test file)
```