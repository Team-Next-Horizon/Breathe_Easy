const mongoose = require('mongoose');

const monitoringStationSchema = new mongoose.Schema({
  stationId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  location: {
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
    address: {
      street: String,
      city: { type: String, required: true },
      state: String,
      country: { type: String, required: true },
      zipCode: String
    },
    elevation: Number, // meters above sea level
    timezone: String
  },
  stationInfo: {
    type: {
      type: String,
      enum: ['government', 'private', 'community', 'mobile', 'satellite'],
      required: true
    },
    agency: String, // EPA, local government, etc.
    network: String, // AirNow, PurpleAir, etc.
    establishedDate: Date,
    description: String
  },
  equipment: {
    sensors: [{
      pollutant: {
        type: String,
        enum: ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3', 'VOC'],
        required: true
      },
      model: String,
      manufacturer: String,
      installDate: Date,
      lastCalibration: Date,
      accuracy: Number, // percentage
      status: {
        type: String,
        enum: ['active', 'maintenance', 'inactive', 'error'],
        default: 'active'
      }
    }],
    dataLogger: {
      model: String,
      lastMaintenance: Date,
      firmwareVersion: String
    },
    power: {
      type: String,
      enum: ['grid', 'solar', 'battery', 'hybrid']
    },
    connectivity: {
      type: String,
      enum: ['wifi', 'cellular', 'ethernet', 'satellite']
    }
  },
  dataQuality: {
    completeness: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    lastQualityCheck: Date,
    issues: [String],
    certifications: [String]
  },
  operationalStatus: {
    status: {
      type: String,
      enum: ['operational', 'maintenance', 'offline', 'decommissioned'],
      default: 'operational'
    },
    lastOnline: Date,
    uptime: Number, // percentage
    nextMaintenance: Date,
    maintenanceHistory: [{
      date: Date,
      type: {
        type: String,
        enum: ['routine', 'repair', 'calibration', 'upgrade']
      },
      description: String,
      technician: String,
      duration: Number // hours
    }]
  },
  contacts: {
    primary: {
      name: String,
      email: String,
      phone: String,
      organization: String
    },
    technical: {
      name: String,
      email: String,
      phone: String
    }
  },
  settings: {
    reportingInterval: {
      type: Number,
      default: 300 // seconds
    },
    alertThresholds: {
      pm25: Number,
      pm10: Number,
      no2: Number,
      so2: Number,
      co: Number,
      o3: Number
    },
    dataRetention: {
      type: Number,
      default: 365 // days
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
monitoringStationSchema.index({ 'location.coordinates': '2dsphere' });
monitoringStationSchema.index({ stationId: 1 });
monitoringStationSchema.index({ name: 1 });
monitoringStationSchema.index({ 'location.address.city': 1 });
monitoringStationSchema.index({ 'stationInfo.type': 1 });
monitoringStationSchema.index({ 'operationalStatus.status': 1 });

// Virtual for active sensors count
monitoringStationSchema.virtual('activeSensorsCount').get(function() {
  return this.equipment.sensors.filter(sensor => sensor.status === 'active').length;
});

// Virtual for station health score
monitoringStationSchema.virtual('healthScore').get(function() {
  const completeness = this.dataQuality.completeness || 0;
  const accuracy = this.dataQuality.accuracy || 0;
  const uptime = this.operationalStatus.uptime || 0;
  
  return Math.round((completeness + accuracy + uptime) / 3);
});

// Method to find nearby stations
monitoringStationSchema.statics.findNearby = function(longitude, latitude, maxDistance = 50000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // meters
      }
    },
    'operationalStatus.status': 'operational'
  });
};

// Method to get stations by pollutant
monitoringStationSchema.statics.getByPollutant = function(pollutant) {
  return this.find({
    'equipment.sensors.pollutant': pollutant,
    'equipment.sensors.status': 'active',
    'operationalStatus.status': 'operational'
  });
};

// Method to check maintenance due
monitoringStationSchema.methods.isMaintenanceDue = function() {
  return this.operationalStatus.nextMaintenance && 
         this.operationalStatus.nextMaintenance <= new Date();
};

// Method to calculate data coverage
monitoringStationSchema.methods.getDataCoverage = function(startDate, endDate) {
  const totalHours = Math.abs(endDate - startDate) / 36e5;
  const reportingIntervalHours = this.settings.reportingInterval / 3600;
  const expectedReadings = Math.floor(totalHours / reportingIntervalHours);
  
  return {
    expectedReadings,
    reportingInterval: this.settings.reportingInterval,
    totalHours
  };
};

module.exports = mongoose.model('MonitoringStation', monitoringStationSchema);