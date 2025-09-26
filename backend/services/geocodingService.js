const axios = require('axios');
const { logger } = require('../config/logger');

class GeocodingService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
    this.service = process.env.GEOCODING_SERVICE || 'openweather'; // 'openweather' or 'google'
    
    if (!this.apiKey) {
      logger.warn('No geocoding API key provided - using mock data for development');
    }
  }

  // Geocode an address to coordinates
  async geocodeAddress(address) {
    try {
      if (!this.apiKey) {
        return this.getMockGeocodingData(address);
      }

      if (this.service === 'google' && process.env.GOOGLE_MAPS_API_KEY) {
        return await this.geocodeWithGoogle(address);
      } else {
        return await this.geocodeWithOpenWeather(address);
      }

    } catch (error) {
      logger.error(`Geocoding failed for address "${address}":`, error.message);
      
      if (process.env.NODE_ENV !== 'production') {
        logger.warn('Using mock geocoding data for development');
        return this.getMockGeocodingData(address);
      }
      
      throw new Error('Geocoding service unavailable');
    }
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(latitude, longitude) {
    try {
      if (!this.apiKey) {
        return this.getMockReverseGeocodingData(latitude, longitude);
      }

      if (this.service === 'google' && process.env.GOOGLE_MAPS_API_KEY) {
        return await this.reverseGeocodeWithGoogle(latitude, longitude);
      } else {
        return await this.reverseGeocodeWithOpenWeather(latitude, longitude);
      }

    } catch (error) {
      logger.error(`Reverse geocoding failed for coordinates ${latitude}, ${longitude}:`, error.message);
      
      if (process.env.NODE_ENV !== 'production') {
        return this.getMockReverseGeocodingData(latitude, longitude);
      }
      
      throw new Error('Reverse geocoding service unavailable');
    }
  }

  // Geocode using OpenWeatherMap API
  async geocodeWithOpenWeather(address) {
    const response = await axios.get('http://api.openweathermap.org/geo/1.0/direct', {
      params: {
        q: address,
        limit: 5,
        appid: this.apiKey
      },
      timeout: 10000
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('No results found for the given address');
    }

    return response.data.map(location => ({
      name: this.formatLocationName(location),
      fullName: `${location.name}${location.state ? ', ' + location.state : ''}, ${location.country}`,
      coordinates: {
        latitude: location.lat,
        longitude: location.lon
      },
      country: location.country,
      state: location.state || null,
      city: location.name,
      source: 'OpenWeatherMap'
    }));
  }

  // Reverse geocode using OpenWeatherMap API
  async reverseGeocodeWithOpenWeather(latitude, longitude) {
    const response = await axios.get('http://api.openweathermap.org/geo/1.0/reverse', {
      params: {
        lat: latitude,
        lon: longitude,
        limit: 1,
        appid: this.apiKey
      },
      timeout: 10000
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('No location found for the given coordinates');
    }

    const location = response.data[0];
    return {
      name: this.formatLocationName(location),
      fullName: `${location.name}${location.state ? ', ' + location.state : ''}, ${location.country}`,
      coordinates: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      country: location.country,
      state: location.state || null,
      city: location.name,
      source: 'OpenWeatherMap'
    };
  }

  // Geocode using Google Maps API
  async geocodeWithGoogle(address) {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: address,
        key: process.env.GOOGLE_MAPS_API_KEY
      },
      timeout: 10000
    });

    if (!response.data || response.data.status !== 'OK' || response.data.results.length === 0) {
      throw new Error('No results found for the given address');
    }

    return response.data.results.slice(0, 5).map(result => {
      const location = result.geometry.location;
      const components = this.parseGoogleAddressComponents(result.address_components);
      
      return {
        name: components.city || components.locality || components.sublocality || 'Unknown Location',
        fullName: result.formatted_address,
        coordinates: {
          latitude: location.lat,
          longitude: location.lng
        },
        country: components.country,
        state: components.state,
        city: components.city || components.locality,
        postalCode: components.postalCode,
        source: 'Google Maps'
      };
    });
  }

  // Reverse geocode using Google Maps API
  async reverseGeocodeWithGoogle(latitude, longitude) {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        latlng: `${latitude},${longitude}`,
        key: process.env.GOOGLE_MAPS_API_KEY
      },
      timeout: 10000
    });

    if (!response.data || response.data.status !== 'OK' || response.data.results.length === 0) {
      throw new Error('No location found for the given coordinates');
    }

    const result = response.data.results[0];
    const components = this.parseGoogleAddressComponents(result.address_components);
    
    return {
      name: components.city || components.locality || components.sublocality || 'Unknown Location',
      fullName: result.formatted_address,
      coordinates: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      country: components.country,
      state: components.state,
      city: components.city || components.locality,
      postalCode: components.postalCode,
      source: 'Google Maps'
    };
  }

  // Parse Google Maps address components
  parseGoogleAddressComponents(components) {
    const parsed = {
      country: null,
      state: null,
      city: null,
      locality: null,
      sublocality: null,
      postalCode: null
    };

    components.forEach(component => {
      const types = component.types;
      
      if (types.includes('country')) {
        parsed.country = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        parsed.state = component.long_name;
      } else if (types.includes('locality')) {
        parsed.locality = component.long_name;
        if (!parsed.city) parsed.city = component.long_name;
      } else if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
        parsed.sublocality = component.long_name;
        if (!parsed.city) parsed.city = component.long_name;
      } else if (types.includes('administrative_area_level_2')) {
        if (!parsed.city) parsed.city = component.long_name;
      } else if (types.includes('postal_code')) {
        parsed.postalCode = component.long_name;
      }
    });

    return parsed;
  }

  // Format location name consistently
  formatLocationName(location) {
    if (location.state && location.country) {
      return `${location.name}, ${location.state}, ${location.country}`;
    } else if (location.country) {
      return `${location.name}, ${location.country}`;
    }
    return location.name;
  }

  // Get mock geocoding data for development
  getMockGeocodingData(address) {
    const mockLocations = [
      {
        name: 'New York, NY, US',
        fullName: 'New York, New York, United States',
        coordinates: { latitude: 40.7128, longitude: -74.0060 },
        country: 'US',
        state: 'New York',
        city: 'New York',
        source: 'Mock Data'
      },
      {
        name: 'Los Angeles, CA, US',
        fullName: 'Los Angeles, California, United States',
        coordinates: { latitude: 34.0522, longitude: -118.2437 },
        country: 'US',
        state: 'California',
        city: 'Los Angeles',
        source: 'Mock Data'
      },
      {
        name: 'London, England, GB',
        fullName: 'London, England, United Kingdom',
        coordinates: { latitude: 51.5074, longitude: -0.1278 },
        country: 'GB',
        state: 'England',
        city: 'London',
        source: 'Mock Data'
      },
      {
        name: 'Delhi, DL, IN',
        fullName: 'Delhi, Delhi, India',
        coordinates: { latitude: 28.7041, longitude: 77.1025 },
        country: 'IN',
        state: 'Delhi',
        city: 'Delhi',
        source: 'Mock Data'
      },
      {
        name: 'Tokyo, Tokyo, JP',
        fullName: 'Tokyo, Tokyo, Japan',
        coordinates: { latitude: 35.6762, longitude: 139.6503 },
        country: 'JP',
        state: 'Tokyo',
        city: 'Tokyo',
        source: 'Mock Data'
      }
    ];

    // Simple fuzzy matching for demo
    const searchTerm = address.toLowerCase();
    const matches = mockLocations.filter(location => 
      location.name.toLowerCase().includes(searchTerm) ||
      location.city.toLowerCase().includes(searchTerm) ||
      location.fullName.toLowerCase().includes(searchTerm)
    );

    if (matches.length > 0) {
      return matches;
    }

    // Return a generic mock location if no matches
    return [{
      name: `Mock Location for "${address}"`,
      fullName: `Mock Location for "${address}", Mock State, Mock Country`,
      coordinates: { 
        latitude: 40.7128 + (Math.random() - 0.5) * 10, 
        longitude: -74.0060 + (Math.random() - 0.5) * 10 
      },
      country: 'Mock Country',
      state: 'Mock State',
      city: address,
      source: 'Mock Data'
    }];
  }

  // Get mock reverse geocoding data
  getMockReverseGeocodingData(latitude, longitude) {
    return {
      name: `Mock Location`,
      fullName: `Mock Location near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      coordinates: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      country: 'Mock Country',
      state: 'Mock State',
      city: 'Mock City',
      source: 'Mock Data'
    };
  }

  // Get user's location from IP (basic implementation)
  async getLocationFromIP(ipAddress) {
    try {
      // This is a basic implementation using a free IP geolocation service
      // In production, you might want to use a more reliable service
      
      if (!ipAddress || ipAddress === '127.0.0.1' || ipAddress === '::1') {
        // Return default location for localhost
        return {
          name: 'Local Development',
          fullName: 'Local Development Environment',
          coordinates: { latitude: 40.7128, longitude: -74.0060 },
          country: 'US',
          state: 'Development',
          city: 'Localhost',
          source: 'Local'
        };
      }

      const response = await axios.get(`http://ip-api.com/json/${ipAddress}`, {
        timeout: 5000
      });

      if (response.data && response.data.status === 'success') {
        const data = response.data;
        return {
          name: `${data.city}, ${data.regionName}, ${data.country}`,
          fullName: `${data.city}, ${data.regionName}, ${data.country}`,
          coordinates: {
            latitude: data.lat,
            longitude: data.lon
          },
          country: data.countryCode,
          state: data.regionName,
          city: data.city,
          source: 'IP Geolocation'
        };
      }

      throw new Error('IP geolocation failed');

    } catch (error) {
      logger.error(`IP geolocation failed for ${ipAddress}:`, error.message);
      
      // Return default location as fallback
      return {
        name: 'Unknown Location',
        fullName: 'Unknown Location',
        coordinates: { latitude: 40.7128, longitude: -74.0060 },
        country: 'Unknown',
        state: 'Unknown',
        city: 'Unknown',
        source: 'Fallback'
      };
    }
  }

  // Validate and normalize coordinates
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
    
    return {
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lon.toFixed(6))
    };
  }

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  // Convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Get popular locations (for autocomplete suggestions)
  getPopularLocations() {
    return [
      { name: 'New York, NY, US', coordinates: { latitude: 40.7128, longitude: -74.0060 } },
      { name: 'Los Angeles, CA, US', coordinates: { latitude: 34.0522, longitude: -118.2437 } },
      { name: 'Chicago, IL, US', coordinates: { latitude: 41.8781, longitude: -87.6298 } },
      { name: 'London, England, GB', coordinates: { latitude: 51.5074, longitude: -0.1278 } },
      { name: 'Paris, France, FR', coordinates: { latitude: 48.8566, longitude: 2.3522 } },
      { name: 'Tokyo, Japan, JP', coordinates: { latitude: 35.6762, longitude: 139.6503 } },
      { name: 'Delhi, India, IN', coordinates: { latitude: 28.7041, longitude: 77.1025 } },
      { name: 'Beijing, China, CN', coordinates: { latitude: 39.9042, longitude: 116.4074 } },
      { name: 'Mumbai, India, IN', coordinates: { latitude: 19.0760, longitude: 72.8777 } },
      { name: 'Sydney, Australia, AU', coordinates: { latitude: -33.8688, longitude: 151.2093 } }
    ];
  }

  // Search for locations with autocomplete
  async searchLocations(query, limit = 5) {
    try {
      if (!query || query.length < 2) {
        return this.getPopularLocations().slice(0, limit);
      }

      const results = await this.geocodeAddress(query);
      return results.slice(0, limit);

    } catch (error) {
      logger.error(`Location search failed for query "${query}":`, error.message);
      
      // Return popular locations filtered by query as fallback
      const popular = this.getPopularLocations();
      const filtered = popular.filter(location => 
        location.name.toLowerCase().includes(query.toLowerCase())
      );
      
      return filtered.slice(0, limit);
    }
  }
}

module.exports = new GeocodingService();