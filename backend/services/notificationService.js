const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { google } = require('googleapis');
const Notification = require('../models/Notification');
const { logger } = require('../config/logger');
const { CONSTANTS } = require('../config/constants');

class NotificationService {
  constructor() {
    // Initialize email transporter
    this.emailTransporter = null;
    this.initializeEmail();
    
    // Initialize SMS client
    this.smsClient = null;
    this.initializeSMS();
  }

  async initializeEmail() {
    try {
      const clientId = process.env.CLIENT_ID;
      const clientSecret = process.env.CLIENT_SECRET;
      const redirectUri = process.env.REDIRECT_URI;
      const refreshToken = process.env.REFRESH_TOKEN;
      const emailUser = process.env.SMTP_USER;

      if (clientId && clientSecret && refreshToken && emailUser) {
        // Create OAuth2 client
        const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
        oAuth2Client.setCredentials({ refresh_token: refreshToken });

        // Get access token
        const accessToken = await oAuth2Client.getAccessToken();

        // Create transporter with OAuth2
        this.emailTransporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: emailUser,
            clientId: clientId,
            clientSecret: clientSecret,
            refreshToken: refreshToken,
            accessToken: accessToken.token
          }
        });

        // Verify the connection
        await this.emailTransporter.verify();
        logger.info('Gmail OAuth2 email service initialized successfully');
      } else {
        logger.warn('Gmail OAuth2 credentials not provided - email notifications disabled');
        logger.warn('Missing credentials:', {
          clientId: !!clientId,
          clientSecret: !!clientSecret,
          refreshToken: !!refreshToken,
          emailUser: !!emailUser
        });
      }
    } catch (error) {
      logger.error('Failed to initialize Gmail OAuth2 email service:', error);
      
      // Fallback to basic SMTP if OAuth2 fails
      try {
        const emailConfig = {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        };

        if (emailConfig.auth.user && emailConfig.auth.pass) {
          this.emailTransporter = nodemailer.createTransport(emailConfig);
          logger.info('Fallback SMTP email service initialized');
        }
      } catch (fallbackError) {
        logger.error('Fallback SMTP also failed:', fallbackError);
      }
    }
  }

  initializeSMS() {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;

      if (accountSid && authToken) {
        this.smsClient = twilio(accountSid, authToken);
        logger.info('SMS service initialized successfully');
      } else {
        logger.warn('Twilio credentials not provided - SMS notifications disabled');
      }
    } catch (error) {
      logger.error('Failed to initialize SMS service:', error);
    }
  }

  // Generate AQI alert email content
  generateAQIAlertEmail(subscription, aqiData) {
    const aqiCategory = this.getAQICategory(aqiData.aqi);
    const healthMessage = this.getHealthMessage(aqiData.aqi);
    
    const subject = `🚨 AQI Alert: ${aqiData.aqi} - ${aqiCategory.label} in ${aqiData.location}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AQI Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .alert-box { background-color: ${aqiCategory.color}; color: white; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .aqi-value { font-size: 3em; font-weight: bold; margin: 10px 0; }
          .location { font-size: 1.2em; margin-bottom: 20px; }
          .pollutants { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .pollutant { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px; background: #f5f5f5; border-radius: 4px; }
          .recommendations { background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
          .unsubscribe { margin-top: 20px; }
          .unsubscribe a { color: #666; text-decoration: none; }
          @media (max-width: 600px) {
            .container { padding: 10px; }
            .aqi-value { font-size: 2em; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Air Quality Alert</h1>
            <p>Your area has exceeded the safe AQI threshold</p>
          </div>
          
          <div class="content">
            <div class="alert-box">
              <div class="aqi-value">${aqiData.aqi}</div>
              <div><strong>${aqiCategory.label}</strong></div>
              <div class="location">📍 ${aqiData.location}</div>
            </div>

            <div class="recommendations">
              <h3>🏥 Health Recommendations</h3>
              <p><strong>${healthMessage.sensitive}</strong></p>
              <p>${healthMessage.general}</p>
            </div>

            ${aqiData.pollutants ? `
            <div class="pollutants">
              <h3>🔬 Pollutant Levels</h3>
              ${aqiData.pollutants.pm25 ? `<div class="pollutant"><span>PM2.5:</span><span>${aqiData.pollutants.pm25} μg/m³</span></div>` : ''}
              ${aqiData.pollutants.pm10 ? `<div class="pollutant"><span>PM10:</span><span>${aqiData.pollutants.pm10} μg/m³</span></div>` : ''}
              ${aqiData.pollutants.o3 ? `<div class="pollutant"><span>Ozone:</span><span>${aqiData.pollutants.o3} μg/m³</span></div>` : ''}
              ${aqiData.pollutants.no2 ? `<div class="pollutant"><span>NO2:</span><span>${aqiData.pollutants.no2} μg/m³</span></div>` : ''}
            </div>
            ` : ''}

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>⚙️ Your Alert Settings</h3>
              <p><strong>Location:</strong> ${subscription.location.name}</p>
              <p><strong>Alert Threshold:</strong> AQI ${subscription.preferences.aqiThreshold}</p>
              <p><strong>Notification Methods:</strong> ${subscription.preferences.emailNotifications ? 'Email' : ''} ${subscription.preferences.smsNotifications ? 'SMS' : ''}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p><strong>Stay safe and breathe easy! 🌱</strong></p>
              <p>This alert was sent because the current AQI (${aqiData.aqi}) exceeds your threshold of ${subscription.preferences.aqiThreshold}</p>
            </div>
          </div>

          <div class="footer">
            <p>Breath Easy - Air Quality Monitoring Service</p>
            <p>Data updated: ${new Date(aqiData.timestamp).toLocaleString()}</p>
            <div class="unsubscribe">
              <a href="${process.env.FRONTEND_URL}/unsubscribe?token=${subscription.unsubscribeToken}">
                Unsubscribe from alerts
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
AQI ALERT - ${aqiData.location}

Current AQI: ${aqiData.aqi} (${aqiCategory.label})

Health Advisory:
${healthMessage.sensitive}

${healthMessage.general}

Your alert threshold: ${subscription.preferences.aqiThreshold}
Data updated: ${new Date(aqiData.timestamp).toLocaleString()}

To unsubscribe: ${process.env.FRONTEND_URL}/unsubscribe?token=${subscription.unsubscribeToken}
    `;

    return { subject, html, text };
  }

  // Generate AQI alert SMS content
  generateAQIAlertSMS(subscription, aqiData) {
    const aqiCategory = this.getAQICategory(aqiData.aqi);
    
    return `🚨 AQI ALERT: ${aqiData.aqi} (${aqiCategory.label}) in ${aqiData.location}. ` +
           `Exceeds your threshold of ${subscription.preferences.aqiThreshold}. ` +
           `Stay indoors if sensitive to air pollution. - Breath Easy`;
  }

  // Send AQI alert notification
  async sendAQIAlert(subscription, aqiData) {
    const results = {
      email: null,
      sms: null
    };

    try {
      const emailNotification = subscription.preferences.emailNotifications ? new Notification({
        subscription: subscription._id,
        type: 'email',
        subject: `AQI Alert: ${aqiData.aqi} in ${aqiData.location}`,
        content: {
          html: '',
          text: '',
          template: 'aqi_alert'
        },
        recipient: {
          email: subscription.email
        },
        aqiData: {
          aqi: aqiData.aqi,
          location: aqiData.location,
          timestamp: aqiData.timestamp || new Date(),
          pollutants: aqiData.pollutants
        },
        delivery: {
          status: 'pending',
          attempts: 0
        }
      }) : null;

      const smsNotification = subscription.preferences.smsNotifications ? new Notification({
        subscription: subscription._id,
        type: 'sms',
        subject: `AQI Alert: ${aqiData.aqi} in ${aqiData.location}`,
        content: {
          text: '',
          template: 'aqi_alert'
        },
        recipient: {
          phone: subscription.mobile
        },
        aqiData: {
          aqi: aqiData.aqi,
          location: aqiData.location,
          timestamp: aqiData.timestamp || new Date(),
          pollutants: aqiData.pollutants
        },
        delivery: {
          status: 'pending',
          attempts: 0
        }
      }) : null;

      // Send email if enabled
      if (emailNotification && this.emailTransporter) {
        try {
          const emailContent = this.generateAQIAlertEmail(subscription, aqiData);
          
          const emailResult = await this.emailTransporter.sendMail({
            from: `"Breath Easy Alerts" <${process.env.SMTP_USER || 'dheerajsinghnew1@gmail.com'}>`,
            to: subscription.email,
            subject: emailContent.subject,
            text: emailContent.text,
            html: emailContent.html
          });

          results.email = {
            success: true,
            messageId: emailResult.messageId
          };

          // Update email notification record
          emailNotification.content.html = emailContent.html;
          emailNotification.content.text = emailContent.text;
          emailNotification.delivery.status = 'sent';
          emailNotification.delivery.sentAt = new Date();
          emailNotification.delivery.attempts = 1;
          await emailNotification.save();

          logger.info(`AQI alert email sent to ${subscription.email}`, {
            subscriptionId: subscription._id,
            messageId: emailResult.messageId,
            aqi: aqiData.aqi
          });

        } catch (emailError) {
          results.email = {
            success: false,
            error: emailError.message
          };

          if (emailNotification) {
            emailNotification.delivery.status = 'failed';
            emailNotification.delivery.failedAt = new Date();
            emailNotification.delivery.error = emailError.message;
            emailNotification.delivery.attempts = 1;
            await emailNotification.save();
          }

          logger.error(`Failed to send AQI alert email to ${subscription.email}:`, emailError);
        }
      }

      // Send SMS if enabled
      if (smsNotification && subscription.mobile && this.smsClient) {
        try {
          const smsContent = this.generateAQIAlertSMS(subscription, aqiData);
          
          const smsResult = await this.smsClient.messages.create({
            body: smsContent,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: subscription.mobile
          });

          results.sms = {
            success: true,
            sid: smsResult.sid
          };

          // Update SMS notification record
          smsNotification.content.text = smsContent;
          smsNotification.delivery.status = 'sent';
          smsNotification.delivery.sentAt = new Date();
          smsNotification.delivery.attempts = 1;
          await smsNotification.save();

          logger.info(`AQI alert SMS sent to ${subscription.mobile}`, {
            subscriptionId: subscription._id,
            sid: smsResult.sid,
            aqi: aqiData.aqi
          });

        } catch (smsError) {
          results.sms = {
            success: false,
            error: smsError.message
          };

          if (smsNotification) {
            smsNotification.delivery.status = 'failed';
            smsNotification.delivery.failedAt = new Date();
            smsNotification.delivery.error = smsError.message;
            smsNotification.delivery.attempts = 1;
            await smsNotification.save();
          }

          logger.error(`Failed to send AQI alert SMS to ${subscription.mobile}:`, smsError);
        }
      }

      // Update subscription last notification time
      const hasSuccessfulDelivery = (results.email && results.email.success) || 
                                   (results.sms && results.sms.success);

      if (hasSuccessfulDelivery) {
        subscription.status.lastNotified = new Date();
        subscription.status.notificationCount += 1;
        await subscription.save();
      }

      return {
        success: hasSuccessfulDelivery,
        results,
        emailNotificationId: emailNotification ? emailNotification._id : null,
        smsNotificationId: smsNotification ? smsNotification._id : null
      };

    } catch (error) {
      logger.error('Failed to send AQI alert:', error);
      throw error;
    }
  }

  // Send welcome notification
  async sendWelcomeNotification(subscription) {
    if (!subscription.preferences.emailNotifications || !this.emailTransporter) {
      return { success: false, reason: 'Email not enabled' };
    }

    try {
      const subject = `Welcome to Breath Easy - AQI Alerts for ${subscription.location.name}`;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .settings-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌟 Welcome to Breath Easy!</h1>
              <p>Your AQI alert service is now active</p>
            </div>
            
            <div class="content">
              <h2>Thank you for subscribing! 🎉</h2>
              <p>We'll monitor the air quality in <strong>${subscription.location.name}</strong> and notify you when the AQI exceeds your threshold.</p>
              
              <div class="settings-box">
                <h3>⚙️ Your Alert Settings</h3>
                <p><strong>Location:</strong> ${subscription.location.name}</p>
                <p><strong>Alert Threshold:</strong> AQI ${subscription.preferences.aqiThreshold}</p>
                <p><strong>Email Alerts:</strong> ${subscription.preferences.emailNotifications ? '✅ Enabled' : '❌ Disabled'}</p>
                <p><strong>SMS Alerts:</strong> ${subscription.preferences.smsNotifications ? '✅ Enabled' : '❌ Disabled'}</p>
              </div>

              <h3>🔔 What to Expect</h3>
              <ul>
                <li>Real-time AQI monitoring for your location</li>
                <li>Instant alerts when air quality becomes unhealthy</li>
                <li>Health recommendations and safety tips</li>
                <li>Detailed pollutant information</li>
              </ul>

              <h3>📱 Stay Connected</h3>
              <p>Visit our website anytime to check current air quality conditions and manage your alert preferences.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <p><strong>Breathe easy, we've got you covered! 🌱</strong></p>
              </div>
            </div>

            <div class="footer">
              <p>Breath Easy - Air Quality Monitoring Service</p>
              <p>Questions? Reply to this email - we're here to help!</p>
              <div style="margin-top: 20px;">
                <a href="${process.env.FRONTEND_URL}/unsubscribe?token=${subscription.unsubscribeToken}" style="color: #666; text-decoration: none;">
                  Unsubscribe from alerts
                </a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const result = await this.emailTransporter.sendMail({
        from: `"Breath Easy Team" <${process.env.SMTP_USER || 'dheerajsinghnew1@gmail.com'}>`,
        to: subscription.email,
        subject: subject,
        html: html
      });

      // Create notification record
      const notification = new Notification({
        subscription: subscription._id,
        type: 'welcome',
        content: { subject },
        delivery: {
          status: 'delivered',
          deliveredAt: new Date(),
          attempts: 1
        },
        provider: {
          email: {
            success: true,
            messageId: result.messageId
          }
        }
      });

      await notification.save();

      logger.info(`Welcome email sent to ${subscription.email}`, {
        subscriptionId: subscription._id,
        messageId: result.messageId
      });

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      logger.error(`Failed to send welcome email to ${subscription.email}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send verification email
  async sendVerificationEmail(subscription) {
    if (!this.emailTransporter) {
      throw new Error('Email service not available');
    }

    const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${subscription.verificationToken}`;
    
    const subject = 'Verify your Breath Easy AQI Alert subscription';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .verify-button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 Verify Your Email</h1>
            <p>One more step to activate your AQI alerts</p>
          </div>
          
          <div class="content">
            <h2>Almost there! 🎯</h2>
            <p>Thank you for subscribing to AQI alerts for <strong>${subscription.location.name}</strong>.</p>
            <p>To start receiving air quality notifications, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" class="verify-button">Verify My Email</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
            
            <p><strong>This verification link will expire in 24 hours.</strong></p>
            
            <p>Once verified, you'll receive:</p>
            <ul>
              <li>🚨 Instant alerts when AQI exceeds ${subscription.preferences.aqiThreshold}</li>
              <li>📊 Detailed air quality information</li>
              <li>🏥 Health recommendations and safety tips</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>Breath Easy - Air Quality Monitoring Service</p>
            <p>If you didn't request this subscription, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await this.emailTransporter.sendMail({
      from: `"Breath Easy Verification" <${process.env.SMTP_USER || 'dheerajsinghnew1@gmail.com'}>`,
      to: subscription.email,
      subject: subject,
      html: html
    });

    logger.info(`Verification email sent to ${subscription.email}`, {
      subscriptionId: subscription._id,
      messageId: result.messageId
    });

    return result;
  }

  // Retry failed notification
  async retryNotification(notification) {
    const subscription = await require('../models/Subscription').findById(notification.subscription);
    
    if (!subscription || !subscription.status.isActive) {
      throw new Error('Subscription not found or inactive');
    }

    notification.delivery.attempts += 1;
    notification.delivery.status = 'pending';
    
    if (notification.type === 'aqi_alert' && notification.content.aqiData) {
      const result = await this.sendAQIAlert(subscription, notification.content.aqiData);
      return result;
    }

    throw new Error('Unknown notification type for retry');
  }

  // Send broadcast notification
  async sendBroadcastNotification(subscription, broadcastData) {
    if (!subscription.preferences.emailNotifications || !this.emailTransporter) {
      return { success: false, reason: 'Email not enabled' };
    }

    const { subject, message, type } = broadcastData;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📢 ${subject}</h1>
          </div>
          <div class="content">
            <div style="white-space: pre-line;">${message}</div>
          </div>
          <div class="footer">
            <p>Breath Easy - Air Quality Monitoring Service</p>
            <div style="margin-top: 20px;">
              <a href="${process.env.FRONTEND_URL}/unsubscribe?token=${subscription.unsubscribeToken}" style="color: #666; text-decoration: none;">
                Unsubscribe from alerts
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await this.emailTransporter.sendMail({
      from: `"Breath Easy Team" <${process.env.SMTP_USER || 'dheerajsinghnew1@gmail.com'}>`,
      to: subscription.email,
      subject: subject,
      html: html
    });

    // Create notification record
    const notification = new Notification({
      subscription: subscription._id,
      type: 'broadcast',
      content: { subject, message },
      delivery: {
        status: 'delivered',
        deliveredAt: new Date(),
        attempts: 1
      },
      provider: {
        email: {
          success: true,
          messageId: result.messageId
        }
      }
    });

    await notification.save();

    return {
      success: true,
      messageId: result.messageId
    };
  }

  // Helper methods
  getAQICategory(aqi) {
    return CONSTANTS.AQI_CATEGORIES.find(cat => aqi >= cat.min && aqi <= cat.max) || 
           CONSTANTS.AQI_CATEGORIES[CONSTANTS.AQI_CATEGORIES.length - 1];
  }

  getHealthMessage(aqi) {
    if (aqi <= 50) {
      return {
        sensitive: "Air quality is satisfactory for most people.",
        general: "Enjoy normal outdoor activities."
      };
    } else if (aqi <= 100) {
      return {
        sensitive: "Sensitive individuals may experience minor breathing discomfort.",
        general: "Generally acceptable air quality for most activities."
      };
    } else if (aqi <= 150) {
      return {
        sensitive: "Sensitive groups should limit prolonged outdoor exertion.",
        general: "Consider reducing outdoor activities if you experience symptoms."
      };
    } else if (aqi <= 200) {
      return {
        sensitive: "Sensitive groups should avoid outdoor activities.",
        general: "Everyone should limit outdoor exertion and consider staying indoors."
      };
    } else if (aqi <= 300) {
      return {
        sensitive: "Sensitive groups should remain indoors.",
        general: "Everyone should avoid outdoor activities and stay indoors."
      };
    } else {
      return {
        sensitive: "Everyone should remain indoors with windows and doors closed.",
        general: "Emergency conditions - avoid all outdoor activities."
      };
    }
  }

  // Send direct email notification (for real-time alerts)
  async sendDirectEmail(recipientEmail, subject, htmlContent, textContent = null) {
    if (!this.emailTransporter) {
      throw new Error('Email service not initialized');
    }

    try {
      const result = await this.emailTransporter.sendMail({
        from: `"Breath Easy Alerts" <${process.env.SMTP_USER || 'dheerajsinghnew1@gmail.com'}>`,
        to: recipientEmail,
        subject: subject,
        text: textContent || subject,
        html: htmlContent
      });

      logger.info(`Direct email sent to ${recipientEmail}`, {
        messageId: result.messageId,
        subject: subject
      });

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      logger.error(`Failed to send direct email to ${recipientEmail}:`, error);
      throw error;
    }
  }

  // Send direct SMS notification (for real-time alerts)
  async sendDirectSMS(recipientPhone, message) {
    if (!this.smsClient) {
      throw new Error('SMS service not initialized');
    }

    try {
      // Check if Twilio phone number is configured
      if (!process.env.TWILIO_PHONE_NUMBER) {
        throw new Error('Twilio phone number not configured in environment variables');
      }

      const result = await this.smsClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: recipientPhone
      });

      logger.info(`Direct SMS sent to ${recipientPhone}`, {
        sid: result.sid,
        status: result.status
      });

      return {
        success: true,
        sid: result.sid,
        status: result.status
      };

    } catch (error) {
      // Handle specific Twilio errors
      if (error.code === 21659) {
        logger.warn(`Twilio phone number verification issue: ${error.message}. Please verify your Twilio phone number in the console.`);
        return {
          success: false,
          error: `Twilio phone number (${process.env.TWILIO_PHONE_NUMBER}) needs verification. Please check your Twilio console.`
        };
      }
      
      logger.error(`Failed to send direct SMS to ${recipientPhone}:`, error);
      throw error;
    }
  }

  // Send real-time AQI alert to specific recipients
  async sendRealTimeAQIAlert(aqiData, recipientEmail = process.env.DEFAULT_EMAIL_RECIPIENT || 'dheerajbishtnew@gmail.com', recipientPhone = process.env.DEFAULT_SMS_RECIPIENT || '+919389788529') {
    const results = {
      email: null,
      sms: null
    };

    try {
      // Generate AQI category and health message
      const aqiCategory = this.getAQICategory(aqiData.aqi);
      const healthMessage = this.getHealthMessage(aqiData.aqi);
      
      // Send email notification
      if (this.emailTransporter && recipientEmail) {
        try {
          const subject = `🚨 URGENT AQI Alert: ${aqiData.aqi} - ${aqiCategory.label} in ${aqiData.location}`;
          
          const html = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Urgent AQI Alert</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .alert-box { background-color: ${aqiCategory.color}; color: white; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .aqi-value { font-size: 4em; font-weight: bold; margin: 10px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
                .location { font-size: 1.3em; margin-bottom: 20px; font-weight: bold; }
                .urgent-notice { background: #ffeeee; border: 2px solid #ff4444; padding: 15px; border-radius: 8px; margin: 20px 0; }
                .pollutants { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .pollutant { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px; background: #f5f5f5; border-radius: 4px; }
                .recommendations { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
                @media (max-width: 600px) {
                  .container { padding: 10px; }
                  .aqi-value { font-size: 3em; }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🚨 URGENT AIR QUALITY ALERT</h1>
                  <p>Immediate action required - unhealthy air quality detected!</p>
                </div>
                
                <div class="content">
                  <div class="alert-box">
                    <div class="aqi-value">${aqiData.aqi}</div>
                    <div><strong>${aqiCategory.label}</strong></div>
                    <div class="location">📍 ${aqiData.location}</div>
                  </div>

                  <div class="urgent-notice">
                    <h3>⚠️ IMMEDIATE HEALTH ALERT</h3>
                    <p><strong>${healthMessage.sensitive}</strong></p>
                    <p>${healthMessage.general}</p>
                  </div>

                  ${aqiData.pollutants ? `
                  <div class="pollutants">
                    <h3>🔬 Current Pollutant Levels</h3>
                    ${aqiData.pollutants.pm25 ? `<div class="pollutant"><span>PM2.5:</span><span><strong>${aqiData.pollutants.pm25} μg/m³</strong></span></div>` : ''}
                    ${aqiData.pollutants.pm10 ? `<div class="pollutant"><span>PM10:</span><span><strong>${aqiData.pollutants.pm10} μg/m³</strong></span></div>` : ''}
                    ${aqiData.pollutants.o3 ? `<div class="pollutant"><span>Ozone:</span><span><strong>${aqiData.pollutants.o3} μg/m³</strong></span></div>` : ''}
                    ${aqiData.pollutants.no2 ? `<div class="pollutant"><span>NO2:</span><span><strong>${aqiData.pollutants.no2} μg/m³</strong></span></div>` : ''}
                  </div>
                  ` : ''}

                  <div class="recommendations">
                    <h3>🏥 URGENT RECOMMENDATIONS</h3>
                    <ul>
                      <li><strong>Stay indoors</strong> and keep windows closed</li>
                      <li><strong>Avoid outdoor exercise</strong> and physical activities</li>
                      <li><strong>Use air purifiers</strong> if available</li>
                      <li><strong>Wear N95 masks</strong> if you must go outside</li>
                      <li><strong>Monitor symptoms</strong> - seek medical help if breathing difficulties occur</li>
                    </ul>
                  </div>

                  <div style="text-align: center; margin: 30px 0; background: white; padding: 20px; border-radius: 8px;">
                    <p><strong>🌱 Stay Safe and Monitor Updates</strong></p>
                    <p>This is a real-time alert sent at ${new Date().toLocaleString()}</p>
                    <p>Data source: Breath Easy Air Quality Monitoring System</p>
                  </div>
                </div>

                <div class="footer">
                  <p><strong>Breath Easy - Real-Time Air Quality Alerts</strong></p>
                  <p>For emergency health concerns, contact your local healthcare provider</p>
                </div>
              </div>
            </body>
            </html>
          `;

          const textVersion = `
🚨 URGENT AQI ALERT - ${aqiData.location}

Current AQI: ${aqiData.aqi} (${aqiCategory.label})

HEALTH ADVISORY:
${healthMessage.sensitive}
${healthMessage.general}

IMMEDIATE ACTIONS:
- Stay indoors and keep windows closed
- Avoid outdoor exercise
- Use air purifiers if available
- Wear N95 masks if going outside

Alert sent: ${new Date().toLocaleString()}
Breath Easy Air Quality Monitoring
          `;

          const emailResult = await this.sendDirectEmail(recipientEmail, subject, html, textVersion);
          results.email = emailResult;

        } catch (emailError) {
          results.email = {
            success: false,
            error: emailError.message
          };
        }
      }

      // Send SMS notification
      if (this.smsClient && recipientPhone) {
        try {
          const smsMessage = `🚨 URGENT AQI ALERT: ${aqiData.aqi} (${aqiCategory.label}) in ${aqiData.location}. STAY INDOORS! Avoid outdoor activities. Health risk high. Time: ${new Date().toLocaleTimeString()} - Breath Easy`;

          const smsResult = await this.sendDirectSMS(recipientPhone, smsMessage);
          results.sms = smsResult;

        } catch (smsError) {
          results.sms = {
            success: false,
            error: smsError.message
          };
        }
      }

      const overallSuccess = (results.email && results.email.success) || (results.sms && results.sms.success);
      
      logger.info('Real-time AQI alert sent', {
        aqi: aqiData.aqi,
        location: aqiData.location,
        recipientEmail,
        recipientPhone,
        emailSuccess: results.email?.success || false,
        smsSuccess: results.sms?.success || false
      });

      return {
        success: overallSuccess,
        results
      };

    } catch (error) {
      logger.error('Failed to send real-time AQI alert:', error);
      throw error;
    }
  }

  // Send instant notification (quick method for testing)
  async sendInstantNotification(message, recipientEmail = process.env.DEFAULT_EMAIL_RECIPIENT || 'dheerajbishtnew@gmail.com', recipientPhone = process.env.DEFAULT_SMS_RECIPIENT || '+919389788529') {
    const timestamp = new Date().toLocaleString();
    const results = {
      email: null,
      sms: null
    };

    try {
      // Send email
      if (this.emailTransporter && recipientEmail) {
        const subject = `🔔 Breath Easy Instant Alert - ${timestamp}`;
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
              .message-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #4CAF50; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>🔔 Instant Notification</h2>
                <p>Real-time message from Breath Easy</p>
              </div>
              <div class="content">
                <div class="message-box">
                  <h3>Message:</h3>
                  <p style="font-size: 1.1em;">${message}</p>
                </div>
                <p><strong>Sent:</strong> ${timestamp}</p>
                <p><strong>Status:</strong> ✅ Real-time delivery successful</p>
              </div>
            </div>
          </body>
          </html>
        `;

        results.email = await this.sendDirectEmail(recipientEmail, subject, html);
      }

      // Send SMS
      if (this.smsClient && recipientPhone) {
        const smsText = `🔔 Breath Easy Alert: ${message} | Sent: ${timestamp}`;
        results.sms = await this.sendDirectSMS(recipientPhone, smsText);
      }

      return {
        success: (results.email?.success || results.sms?.success),
        results,
        timestamp
      };

    } catch (error) {
      logger.error('Failed to send instant notification:', error);
      throw error;
    }
  }

  // Get available notification templates
  getAvailableTemplates() {
    return [
      {
        type: 'aqi_alert',
        name: 'AQI Alert',
        description: 'Sent when AQI exceeds user threshold'
      },
      {
        type: 'welcome',
        name: 'Welcome Email',
        description: 'Sent after successful subscription'
      },
      {
        type: 'verification',
        name: 'Email Verification',
        description: 'Sent to verify email address'
      },
      {
        type: 'broadcast',
        name: 'Broadcast Message',
        description: 'Administrative broadcast to users'
      },
      {
        type: 'real_time_alert',
        name: 'Real-time Alert',
        description: 'Instant notifications for urgent situations'
      }
    ];
  }
}

// If this file is run directly, send a test notification
if (require.main === module) {
  // Load environment variables first
  const path = require('path');
  const envPath = path.resolve(__dirname, '../.env');
  require('dotenv').config({ path: envPath });
  
  async function sendTestNotification() {
    console.log('🔔 Running NotificationService directly...\n');
    console.log(`📧 Sending real-time notification to: ${process.env.DEFAULT_EMAIL_RECIPIENT || 'dheerajbishtnew@gmail.com'}\n`);
    
    try {
      // Create instance after .env is loaded
      console.log('⏳ Creating NotificationService instance...');
      const notificationService = new NotificationService();
      
      // Wait for service to initialize
      console.log('⏳ Initializing services...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (!notificationService.emailTransporter) {
        console.log('❌ Email service not initialized. Check your .env configuration.');
        return;
      }
      
      console.log('✅ Email service ready!\n');
      
      // Send instant notification
      console.log('📬 Sending notification...');
      const timestamp = new Date().toLocaleString();
      
      const result = await notificationService.sendDirectEmail(
        process.env.DEFAULT_EMAIL_RECIPIENT || 'dheerajbishtnew@gmail.com',
        `🌟 Breath Easy Notification - ${timestamp}`,
        `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
              
              <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 40px; text-align: center;">
                <h1 style="margin: 0; font-size: 32px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">🌟 Breath Easy</h1>
                <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Real-Time Notification System</p>
              </div>
              
              <div style="padding: 40px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 40px;">
                    🔔
                  </div>
                </div>
                
                <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Notification Delivered Successfully!</h2>
                
                <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #4CAF50;">
                  <h3 style="color: #4CAF50; margin-top: 0;">✅ System Status</h3>
                  <p style="margin: 10px 0;"><strong>📧 Email Service:</strong> <span style="color: #4CAF50;">OPERATIONAL</span></p>
                  <p style="margin: 10px 0;"><strong>⚡ Delivery Method:</strong> Real-time</p>
                  <p style="margin: 10px 0;"><strong>🔐 Authentication:</strong> Gmail OAuth2</p>
                  <p style="margin: 10px 0;"><strong>📅 Sent:</strong> ${timestamp}</p>
                </div>
                
                <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 25px 0;">
                  <h3 style="color: #2e7d32; margin-top: 0;">🎯 Direct Execution</h3>
                  <p>This notification was sent by running <code style="background: #ddd; padding: 2px 6px; border-radius: 4px;">node services/notificationService.js</code> directly.</p>
                  <p>Your notification system is working perfectly and ready for integration!</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%); color: white; padding: 15px 30px; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px;">
                    🚀 Production Ready!
                  </div>
                </div>
                
                <div style="border-top: 2px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
                  <p style="color: #666; margin: 0;">Perfect for real-time air quality alerts and notifications</p>
                </div>
              </div>
            </div>
          </body>
        </html>
        `
      );
      
      if (result.success) {
        console.log('✅ Notification sent successfully!');
        console.log(`📨 Message ID: ${result.messageId}`);
        console.log('\n🎉 Your NotificationService is working perfectly!');
        console.log(`📧 Check ${process.env.DEFAULT_EMAIL_RECIPIENT || 'dheerajbishtnew@gmail.com'} for the notification.`);
      } else {
        console.log('❌ Failed to send notification');
      }
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }
  
  // Run the test
  sendTestNotification().catch(console.error);
} else {
  // Export instance only when imported as module
  module.exports = new NotificationService();
}