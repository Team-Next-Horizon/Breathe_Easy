require('dotenv').config({ path: '../backend/.env' });
const twilio = require('twilio');

class TwilioSMSService {
  constructor() {
    // Initialize Twilio client
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!this.accountSid || !this.authToken || !this.phoneNumber) {
      throw new Error('Missing Twilio credentials. Please check your .env file.');
    }

    this.client = twilio(this.accountSid, this.authToken);
    console.log('📱 Twilio SMS Service initialized successfully');
  }

  /**
   * Format phone number to E.164 format
   * @param {string} phoneNumber - Phone number to format
   * @returns {string} Formatted phone number
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add +1 if it's a 10-digit US number
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    
    // Add + if not present
    if (!cleaned.startsWith('+')) {
      return `+${cleaned}`;
    }
    
    return cleaned;
  }

  /**
   * Send SMS to a single phone number
   * @param {string} to - Recipient phone number
   * @param {string} message - SMS message content
   * @returns {Promise<Object>} Twilio message response
   */
  async sendSMS(to, message) {
    try {
      const formattedNumber = this.formatPhoneNumber(to);
      
      const response = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: formattedNumber
      });

      console.log(`✅ SMS sent successfully!`);
      console.log(`📞 To: ${formattedNumber}`);
      console.log(`📨 Message SID: ${response.sid}`);
      console.log(`📊 Status: ${response.status}`);
      
      return {
        success: true,
        messageId: response.sid,
        status: response.status,
        to: formattedNumber
      };

    } catch (error) {
      console.error('❌ Failed to send SMS:', error.message);
      
      return {
        success: false,
        error: error.message,
        code: error.code,
        to: to
      };
    }
  }

  /**
   * Send SMS to multiple phone numbers
   * @param {Array<string>} phoneNumbers - Array of recipient phone numbers
   * @param {string} message - SMS message content
   * @returns {Promise<Array<Object>>} Array of SMS results
   */
  async sendBulkSMS(phoneNumbers, message) {
    console.log(`📱 Sending bulk SMS to ${phoneNumbers.length} recipients...`);
    
    const results = await Promise.allSettled(
      phoneNumbers.map(number => this.sendSMS(number, message))
    );

    const summary = {
      total: phoneNumbers.length,
      successful: 0,
      failed: 0,
      results: []
    };

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        summary.successful++;
        summary.results.push(result.value);
      } else {
        summary.failed++;
        summary.results.push({
          success: false,
          error: result.reason || result.value.error,
          to: phoneNumbers[index]
        });
      }
    });

    console.log(`📊 Bulk SMS Summary:`);
    console.log(`   ✅ Successful: ${summary.successful}`);
    console.log(`   ❌ Failed: ${summary.failed}`);

    return summary;
  }

  /**
   * Send AQI Alert SMS
   * @param {string} phoneNumber - Recipient phone number
   * @param {Object} aqiData - AQI data object
   * @returns {Promise<Object>} SMS result
   */
  async sendAQIAlert(phoneNumber, aqiData) {
    const { location, aqi, category, healthAdvice } = aqiData;
    
    const message = `🚨 AQI ALERT for ${location}
    
Current AQI: ${aqi} (${category})
Health Impact: ${healthAdvice}

Stay safe and limit outdoor activities.

- Breath Easy App`;

    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * Send Weather Alert SMS
   * @param {string} phoneNumber - Recipient phone number
   * @param {Object} weatherData - Weather data object
   * @returns {Promise<Object>} SMS result
   */
  async sendWeatherAlert(phoneNumber, weatherData) {
    const { location, condition, temperature, airQuality } = weatherData;
    
    const message = `🌤️ WEATHER & AIR QUALITY UPDATE
    
📍 Location: ${location}
🌡️ Temperature: ${temperature}°F
☁️ Condition: ${condition}
💨 Air Quality: ${airQuality}

Stay informed, stay healthy!

- Breath Easy App`;

    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * Test SMS functionality
   * @param {string} testNumber - Phone number to send test SMS
   * @returns {Promise<Object>} Test result
   */
  async testSMS(testNumber) {
    const testMessage = `📱 Test SMS from Breath Easy App!
    
This is a test message to verify SMS functionality.
Time: ${new Date().toLocaleString()}

If you receive this, SMS integration is working! ✅`;

    console.log('🧪 Sending test SMS...');
    return await this.sendSMS(testNumber, testMessage);
  }
}

// Example usage and testing
async function main() {
  try {
    // Initialize SMS service
    const smsService = new TwilioSMSService();

    // Test phone number (replace with your actual number)
    const testPhoneNumber = '+1234567890'; // Replace with your number

    // Example 1: Send test SMS
    console.log('\n=== Test SMS ===');
    const testResult = await smsService.testSMS(testPhoneNumber);
    console.log('Test Result:', testResult);

    // Example 2: Send AQI Alert
    console.log('\n=== AQI Alert SMS ===');
    const aqiData = {
      location: 'New York, NY',
      aqi: 156,
      category: 'Unhealthy',
      healthAdvice: 'Everyone should reduce outdoor activities'
    };
    
    const aqiResult = await smsService.sendAQIAlert(testPhoneNumber, aqiData);
    console.log('AQI Alert Result:', aqiResult);

    // Example 3: Send bulk SMS
    console.log('\n=== Bulk SMS ===');
    const phoneNumbers = [testPhoneNumber]; // Add more numbers as needed
    const bulkMessage = 'Hello! This is a bulk SMS from Breath Easy App. 🌿';
    
    const bulkResult = await smsService.sendBulkSMS(phoneNumbers, bulkMessage);
    console.log('Bulk SMS Result:', bulkResult);

  } catch (error) {
    console.error('❌ Error in main function:', error.message);
  }
}

// Export the class for use in other files
module.exports = TwilioSMSService;

// Run the main function if this file is executed directly
if (require.main === module) {
  main();
}