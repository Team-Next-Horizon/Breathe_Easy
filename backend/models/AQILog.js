const mongoose = require('mongoose');

const aqiLogSchema = new mongoose.Schema({
  location: {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        index: '2dsphere'
      }
    },
    country: String,
    state: String,
    city: String
  },
  aqiData: {
    aqi: {
      type: Number,
      required: true,
      min: 0,
      max: 500
    },
    category: {
      type: String,
      enum: ['Good', 'Moderate', 'Unhealthy for Sensitive Groups', 'Unhealthy', 'Very Unhealthy', 'Hazardous'],
      required: true
    },
    color: {
      type: String,
      match: /^#[0-9A-F]{6}$/i // Hex color validation
    },
    description: String,
    healthRecommendations: String
  },
  pollutants: {
    pm25: { type: Number, min: 0 },
    pm10: { type: Number, min: 0 },
    no2: { type: Number, min: 0 },
    so2: { type: Number, min: 0 },
    co: { type: Number, min: 0 },
    o3: { type: Number, min: 0 }
  },
  metadata: {
    source: {
      type: String,
      enum: ['openweather', 'aqicn', 'nasa_tempo', 'epa', 'manual'],
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    stationId: String,
    rawData: mongoose.Schema.Types.Mixed
  },
  forecast: [{
    datetime: {
      type: Date,
      required: true
    },
    aqi: {
      type: Number,
      min: 0,
      max: 500
    },
    category: String,
    pollutants: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
aqiLogSchema.index({ 'location.coordinates': '2dsphere' });
aqiLogSchema.index({ 'location.name': 1 });
aqiLogSchema.index({ createdAt: -1 });
aqiLogSchema.index({ 'aqiData.aqi': 1 });
aqiLogSchema.index({ 'metadata.source': 1 });
aqiLogSchema.index({ 'location.name': 1, createdAt: -1 });

// Virtual for AQI category color
aqiLogSchema.virtual('categoryColor').get(function() {
  const colorMap = {
    'Good': '#00E400',
    'Moderate': '#FFFF00',
    'Unhealthy for Sensitive Groups': '#FF7E00',
    'Unhealthy': '#FF0000',
    'Very Unhealthy': '#8F3F97',
    'Hazardous': '#7E0023'
  };
  return colorMap[this.aqiData.category] || '#808080';
});

// Method to get latest reading for location
aqiLogSchema.statics.getLatestForLocation = function(locationName) {
  return this.findOne({
    'location.name': new RegExp(locationName, 'i')
  }).sort({ createdAt: -1 });
};

// Method to get historical data
aqiLogSchema.statics.getHistoricalData = function(locationName, startDate, endDate) {
  return this.find({
    'location.name': new RegExp(locationName, 'i'),
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ createdAt: 1 });
};

// Method to get average AQI for time period
aqiLogSchema.statics.getAverageAQI = function(locationName, days = 7) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        'location.name': new RegExp(locationName, 'i'),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        avgAQI: { $avg: '$aqiData.aqi' },
        minAQI: { $min: '$aqiData.aqi' },
        maxAQI: { $max: '$aqiData.aqi' },
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('AQILog', aqiLogSchema);