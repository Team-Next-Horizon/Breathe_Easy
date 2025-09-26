const axios = require('axios');
const { logger } = require('../config/logger');
const { CONSTANTS } = require('../config/constants');
const notificationService = require('./notificationService');

class AQIService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.backupApiKey = process.env.AQICN_API_TOKEN;
    this.baseURL = 'http://api.openweathermap.org/data/2.5';
    this.backupURL = 'https://api.waqi.info';
    
    if (!this.apiKey && !this.backupApiKey) {
      logger.warn('No AQI API keys provided - using mock data for development');
    }
  }

  // Get current AQI data from OpenWeatherMap API
  async getCurrentAQI(latitude, longitude, locationName = null) {
    try {
      if (!this.apiKey) {
        return this.getMockAQIData(latitude, longitude, locationName);
      }

      const response = await axios.get(`${this.baseURL}/air_pollution`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: this.apiKey
        },
        timeout: 10000
      });

      if (!response.data || !response.data.list || response.data.list.length === 0) {
        throw new Error('No AQI data returned from API');
      }

      const data = response.data.list[0];
      const aqiData = this.formatOpenWeatherAQI(data, latitude, longitude, locationName);
      
      logger.info(`AQI data fetched for ${locationName || `${latitude},${longitude}`}: ${aqiData.aqi}`);
      
      return aqiData;

    } catch (error) {
      logger.error('Failed to fetch AQI from OpenWeatherMap:', error.message);
      
      // Try backup API
      if (this.backupApiKey) {
        try {
          return await this.getAQIFromBackup(latitude, longitude, locationName);
        } catch (backupError) {
          logger.error('Backup AQI API also failed:', backupError.message);
        }
      }
      
      // Return mock data for development
      if (process.env.NODE_ENV !== 'production') {
        logger.warn('Using mock AQI data for development');
        return this.getMockAQIData(latitude, longitude, locationName);
      }
      
      throw new Error('AQI data not available - all services failed');
    }
  }

  // Get AQI data from backup API (WAQI)
  async getAQIFromBackup(latitude, longitude, locationName = null) {
    const response = await axios.get(`${this.backupURL}/feed/geo:${latitude};${longitude}/`, {
      params: {
        token: this.backupApiKey
      },
      timeout: 10000
    });

    if (!response.data || response.data.status !== 'ok') {
      throw new Error('No data from backup AQI API');
    }

    return this.formatWAQIData(response.data.data, latitude, longitude, locationName);
  }

  // Format OpenWeatherMap AQI data
  formatOpenWeatherAQI(data, latitude, longitude, locationName) {
    // OpenWeatherMap uses a different AQI scale (1-5), convert to US AQI (0-500)
    const owmToUSAQI = {
      1: 25,   // Good
      2: 75,   // Fair  
      3: 125,  // Moderate
      4: 175,  // Poor
      5: 275   // Very Poor
    };

    const aqi = owmToUSAQI[data.main.aqi] || 150;
    const category = this.getAQICategory(aqi);

    return {
      aqi: aqi,
      category: category.label,
      color: category.color,
      location: locationName || `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
      coordinates: { latitude, longitude },
      timestamp: new Date(data.dt * 1000),
      pollutants: {
        pm25: data.components.pm2_5 || null,
        pm10: data.components.pm10 || null,
        o3: data.components.o3 || null,
        no2: data.components.no2 || null,
        so2: data.components.so2 || null,
        co: data.components.co || null
      },
      source: 'OpenWeatherMap',
      attribution: 'Data provided by OpenWeatherMap'
    };
  }

  // Format WAQI API data
  formatWAQIData(data, latitude, longitude, locationName) {
    const aqi = data.aqi;
    const category = this.getAQICategory(aqi);

    return {
      aqi: aqi,
      category: category.label,
      color: category.color,
      location: locationName || data.city.name || `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
      coordinates: { latitude, longitude },
      timestamp: new Date(data.time.v * 1000),
      pollutants: {
        pm25: data.iaqi.pm25?.v || null,
        pm10: data.iaqi.pm10?.v || null,
        o3: data.iaqi.o3?.v || null,
        no2: data.iaqi.no2?.v || null,
        so2: data.iaqi.so2?.v || null,
        co: data.iaqi.co?.v || null
      },
      source: 'WAQI',
      attribution: data.attributions?.map(attr => attr.name).join(', ') || 'World Air Quality Index'
    };
  }

  // Generate mock AQI data for development
  getMockAQIData(latitude, longitude, locationName) {
    // Generate semi-realistic AQI based on location and time
    const baseAQI = Math.floor(Math.random() * 200) + 50; // 50-250 range
    const timeVariation = Math.sin(Date.now() / 3600000) * 20; // Hourly variation
    const aqi = Math.max(0, Math.min(500, Math.floor(baseAQI + timeVariation)));
    
    const category = this.getAQICategory(aqi);

    return {
      aqi: aqi,
      category: category.label,
      color: category.color,
      location: locationName || `Mock Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
      coordinates: { latitude, longitude },
      timestamp: new Date(),
      pollutants: {
        pm25: Math.floor(Math.random() * 100) + 10,
        pm10: Math.floor(Math.random() * 150) + 20,
        o3: Math.floor(Math.random() * 200) + 50,
        no2: Math.floor(Math.random() * 80) + 10,
        so2: Math.floor(Math.random() * 50) + 5,
        co: Math.floor(Math.random() * 10000) + 1000
      },
      source: 'Mock Data',
      attribution: 'Development mock data - not for production use'
    };
  }

  // Get AQI forecast (if available)
  async getAQIForecast(latitude, longitude, days = 3) {
    try {
      if (!this.apiKey) {
        return this.getMockForecastData(latitude, longitude, days);
      }

      // OpenWeatherMap doesn't provide AQI forecast in free tier
      // This would require a premium subscription
      logger.warn('AQI forecast requires premium API subscription');
      return this.getMockForecastData(latitude, longitude, days);

    } catch (error) {
      logger.error('Failed to fetch AQI forecast:', error.message);
      
      if (process.env.NODE_ENV !== 'production') {
        return this.getMockForecastData(latitude, longitude, days);
      }
      
      throw new Error('AQI forecast not available');
    }
  }

  // Generate mock forecast data
  getMockForecastData(latitude, longitude, days) {
    const forecast = [];
    const now = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const baseAQI = Math.floor(Math.random() * 150) + 50;
      const aqi = Math.max(0, Math.min(500, baseAQI));
      const category = this.getAQICategory(aqi);
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        aqi: aqi,
        category: category.label,
        color: category.color,
        coordinates: { latitude, longitude }
      });
    }
    
    return {
      location: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
      forecast,
      source: 'Mock Data',
      attribution: 'Development forecast data'
    };
  }

  // Get historical AQI data
  async getHistoricalAQI(latitude, longitude, startDate, endDate) {
    try {
      // Historical data typically requires premium API access
      logger.warn('Historical AQI data requires premium API subscription');
      return this.getMockHistoricalData(latitude, longitude, startDate, endDate);

    } catch (error) {
      logger.error('Failed to fetch historical AQI:', error.message);
      
      if (process.env.NODE_ENV !== 'production') {
        return this.getMockHistoricalData(latitude, longitude, startDate, endDate);
      }
      
      throw new Error('Historical AQI data not available');
    }
  }

  // Generate mock historical data
  getMockHistoricalData(latitude, longitude, startDate, endDate) {
    const historical = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const oneDay = 24 * 60 * 60 * 1000;
    
    for (let date = new Date(start); date <= end; date.setTime(date.getTime() + oneDay)) {
      const baseAQI = Math.floor(Math.random() * 200) + 30;
      const aqi = Math.max(0, Math.min(500, baseAQI));
      const category = this.getAQICategory(aqi);
      
      historical.push({
        date: date.toISOString().split('T')[0],
        aqi: aqi,
        category: category.label,
        color: category.color
      });
    }
    
    return {
      location: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
      period: { start: startDate, end: endDate },
      data: historical,
      source: 'Mock Data',
      attribution: 'Development historical data'
    };
  }

  // Get nearby monitoring stations
  async getNearbyStations(latitude, longitude, radius = 50) {
    // This would typically query a stations database or API
    // For now, return mock station data
    return this.getMockStations(latitude, longitude, radius);
  }

  // Generate mock station data
  getMockStations(latitude, longitude, radius) {
    const stations = [];
    const stationCount = Math.floor(Math.random() * 5) + 2; // 2-6 stations
    
    for (let i = 0; i < stationCount; i++) {
      const offsetLat = (Math.random() - 0.5) * (radius / 111); // Rough km to degree conversion
      const offsetLon = (Math.random() - 0.5) * (radius / 111);
      
      const stationLat = latitude + offsetLat;
      const stationLon = longitude + offsetLon;
      const distance = Math.floor(Math.random() * radius);
      const aqi = Math.floor(Math.random() * 200) + 50;
      const category = this.getAQICategory(aqi);
      
      stations.push({
        id: `station_${i + 1}`,
        name: `Monitoring Station ${i + 1}`,
        coordinates: {
          latitude: stationLat,
          longitude: stationLon
        },
        distance: distance,
        currentAQI: aqi,
        category: category.label,
        color: category.color,
        lastUpdated: new Date(Date.now() - Math.random() * 3600000) // Within last hour
      });
    }
    
    return stations.sort((a, b) => a.distance - b.distance);
  }

  // Process AQI alert for a subscription
  async processAQIAlert(subscription, aqiData) {
    try {
      // Check if notification cooldown period has passed
      if (!subscription.shouldSendNotification()) {
        logger.info(`Skipping notification for ${subscription.email} - cooldown period active`);
        return { skipped: true, reason: 'cooldown' };
      }

      // Send alert notification
      const result = await notificationService.sendAQIAlert(subscription, aqiData);
      
      if (result.success) {
        logger.info(`AQI alert processed successfully for ${subscription.email}`, {
          subscriptionId: subscription._id,
          aqi: aqiData.aqi,
          threshold: subscription.preferences.aqiThreshold
        });
      }

      return result;

    } catch (error) {
      logger.error(`Failed to process AQI alert for ${subscription.email}:`, error);
      throw error;
    }
  }

  // Get health recommendations based on AQI
  getHealthRecommendations(aqi) {
    const category = this.getAQICategory(aqi);
    
    const recommendations = {
      category: category.label,
      color: category.color,
      aqi: aqi,
      general: '',
      sensitive: '',
      activities: {
        outdoor: '',
        exercise: '',
        windows: ''
      },
      groups: {
        children: '',
        elderly: '',
        respiratory: '',
        heart: ''
      }
    };

    if (aqi <= 50) {
      recommendations.general = 'Air quality is good. Perfect time for all outdoor activities.';
      recommendations.sensitive = 'No precautions needed for sensitive groups.';
      recommendations.activities = {
        outdoor: 'Enjoy outdoor activities freely',
        exercise: 'Great time for outdoor exercise',
        windows: 'Keep windows open for fresh air'
      };
      recommendations.groups = {
        children: 'Safe for all children\'s activities',
        elderly: 'No restrictions for elderly',
        respiratory: 'Safe for people with respiratory conditions',
        heart: 'Safe for people with heart conditions'
      };
    } else if (aqi <= 100) {
      recommendations.general = 'Air quality is acceptable for most people.';
      recommendations.sensitive = 'Unusually sensitive people may experience minor symptoms.';
      recommendations.activities = {
        outdoor: 'Generally safe for outdoor activities',
        exercise: 'Reduce intensity if you feel symptoms',
        windows: 'Keep windows open, but monitor air quality'
      };
      recommendations.groups = {
        children: 'Safe for most children\'s activities',
        elderly: 'Monitor for any discomfort',
        respiratory: 'May cause minor symptoms in very sensitive individuals',
        heart: 'Generally safe, monitor for symptoms'
      };
    } else if (aqi <= 150) {
      recommendations.general = 'Sensitive groups may experience health effects.';
      recommendations.sensitive = 'Reduce prolonged or heavy outdoor exertion.';
      recommendations.activities = {
        outdoor: 'Limit prolonged outdoor activities',
        exercise: 'Reduce outdoor exercise intensity and duration',
        windows: 'Consider keeping windows closed during peak hours'
      };
      recommendations.groups = {
        children: 'Limit prolonged outdoor play',
        elderly: 'Reduce outdoor activities',
        respiratory: 'Avoid prolonged outdoor exertion',
        heart: 'Take frequent breaks during outdoor activities'
      };
    } else if (aqi <= 200) {
      recommendations.general = 'Everyone may experience health effects.';
      recommendations.sensitive = 'Avoid outdoor activities.';
      recommendations.activities = {
        outdoor: 'Avoid prolonged outdoor activities',
        exercise: 'Move exercise indoors or postpone',
        windows: 'Keep windows closed'
      };
      recommendations.groups = {
        children: 'Keep children indoors when possible',
        elderly: 'Stay indoors and avoid physical exertion',
        respiratory: 'Stay indoors and use air purifiers if available',
        heart: 'Avoid outdoor activities and physical exertion'
      };
    } else if (aqi <= 300) {
      recommendations.general = 'Health alert - everyone may experience serious effects.';
      recommendations.sensitive = 'Remain indoors and keep activity levels low.';
      recommendations.activities = {
        outdoor: 'Avoid all outdoor activities',
        exercise: 'Avoid all physical exertion',
        windows: 'Keep windows and doors closed'
      };
      recommendations.groups = {
        children: 'Keep children indoors at all times',
        elderly: 'Stay indoors and minimize physical activity',
        respiratory: 'Stay indoors with air purification if possible',
        heart: 'Avoid any physical activity and stay indoors'
      };
    } else {
      recommendations.general = 'Emergency conditions - serious health effects for everyone.';
      recommendations.sensitive = 'Everyone should remain indoors.';
      recommendations.activities = {
        outdoor: 'Emergency - avoid all outdoor exposure',
        exercise: 'Avoid all physical activity',
        windows: 'Seal windows and doors, use air purifiers'
      };
      recommendations.groups = {
        children: 'Keep children indoors with minimal activity',
        elderly: 'Stay indoors and seek medical advice if needed',
        respiratory: 'Seek medical attention if experiencing symptoms',
        heart: 'Seek medical attention if experiencing symptoms'
      };
    }

    return recommendations;
  }

  // Helper method to get AQI category
  getAQICategory(aqi) {
    return CONSTANTS.AQI_CATEGORIES.find(cat => aqi >= cat.min && aqi <= cat.max) || 
           CONSTANTS.AQI_CATEGORIES[CONSTANTS.AQI_CATEGORIES.length - 1];
  }

  // Validate coordinates
  validateCoordinates(latitude, longitude) {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lon)) {
      throw new Error('Invalid coordinates - must be numbers');
    }
    
    if (lat < -90 || lat > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    
    if (lon < -180 || lon > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }
    
    return { latitude: lat, longitude: lon };
  }
}

module.exports = new AQIService();