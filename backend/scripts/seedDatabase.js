const mongoose = require('mongoose');
const { MonitoringStation, SystemLog } = require('../models');
require('dotenv').config();

// Sample monitoring stations data
const sampleStations = [
  {
    stationId: 'NYC001',
    name: 'Manhattan Central Station',
    location: {
      coordinates: {
        type: 'Point',
        coordinates: [-73.9857, 40.7484] // Times Square
      },
      address: {
        street: '1560 Broadway',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10036'
      },
      elevation: 10,
      timezone: 'America/New_York'
    },
    stationInfo: {
      type: 'government',
      agency: 'EPA',
      network: 'AirNow',
      establishedDate: new Date('2020-01-15'),
      description: 'High-traffic urban monitoring station in Times Square area'
    },
    equipment: {
      sensors: [
        {
          pollutant: 'PM2.5',
          model: 'BAM-1020',
          manufacturer: 'Met One Instruments',
          installDate: new Date('2020-01-15'),
          lastCalibration: new Date('2024-01-15'),
          accuracy: 95,
          status: 'active'
        },
        {
          pollutant: 'NO2',
          model: 'T500U',
          manufacturer: 'Teledyne API',
          installDate: new Date('2020-01-15'),
          lastCalibration: new Date('2024-01-10'),
          accuracy: 92,
          status: 'active'
        }
      ],
      power: 'grid',
      connectivity: 'ethernet'
    },
    operationalStatus: {
      status: 'operational',
      lastOnline: new Date(),
      uptime: 98.5,
      nextMaintenance: new Date('2024-04-15')
    },
    settings: {
      reportingInterval: 300,
      alertThresholds: {
        pm25: 35.5,
        no2: 100
      }
    }
  },
  {
    stationId: 'LA002',
    name: 'Los Angeles Downtown',
    location: {
      coordinates: {
        type: 'Point',
        coordinates: [-118.2437, 34.0522] // Downtown LA
      },
      address: {
        street: '200 N Spring St',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        zipCode: '90012'
      },
      elevation: 87,
      timezone: 'America/Los_Angeles'
    },
    stationInfo: {
      type: 'government',
      agency: 'CARB',
      network: 'California Air Resources Board',
      establishedDate: new Date('2019-06-01'),
      description: 'Urban background station monitoring multiple pollutants'
    },
    equipment: {
      sensors: [
        {
          pollutant: 'PM2.5',
          model: 'SHARP 5030',
          manufacturer: 'Thermo Fisher',
          installDate: new Date('2019-06-01'),
          lastCalibration: new Date('2024-02-01'),
          accuracy: 97,
          status: 'active'
        },
        {
          pollutant: 'O3',
          model: 'T400',
          manufacturer: 'Teledyne API',
          installDate: new Date('2019-06-01'),
          lastCalibration: new Date('2024-01-20'),
          accuracy: 94,
          status: 'active'
        }
      ],
      power: 'grid',
      connectivity: 'wifi'
    },
    operationalStatus: {
      status: 'operational',
      lastOnline: new Date(),
      uptime: 99.2,
      nextMaintenance: new Date('2024-05-01')
    },
    settings: {
      reportingInterval: 300,
      alertThresholds: {
        pm25: 35.5,
        o3: 120
      }
    }
  },
  {
    stationId: 'CHI003',
    name: 'Chicago Lakefront',
    location: {
      coordinates: {
        type: 'Point',
        coordinates: [-87.6298, 41.8781] // Chicago downtown
      },
      address: {
        street: '233 S Wacker Dr',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        zipCode: '60606'
      },
      elevation: 182,
      timezone: 'America/Chicago'
    },
    stationInfo: {
      type: 'government',
      agency: 'Illinois EPA',
      network: 'AirNow',
      establishedDate: new Date('2018-03-10'),
      description: 'Lakefront monitoring station with meteorological data'
    },
    equipment: {
      sensors: [
        {
          pollutant: 'PM10',
          model: 'TEOM 1405-DF',
          manufacturer: 'Thermo Fisher',
          installDate: new Date('2018-03-10'),
          lastCalibration: new Date('2024-01-05'),
          accuracy: 93,
          status: 'active'
        },
        {
          pollutant: 'SO2',
          model: 'T100',
          manufacturer: 'Teledyne API',
          installDate: new Date('2018-03-10'),
          lastCalibration: new Date('2024-02-10'),
          accuracy: 96,
          status: 'maintenance'
        }
      ],
      power: 'grid',
      connectivity: 'cellular'
    },
    operationalStatus: {
      status: 'maintenance',
      lastOnline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      uptime: 85.3,
      nextMaintenance: new Date('2024-03-20')
    },
    settings: {
      reportingInterval: 600,
      alertThresholds: {
        pm10: 154,
        so2: 75
      }
    }
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/breath_easy');
    console.log('📦 Connected to MongoDB for seeding...');

    // Clear existing monitoring stations (optional)
    console.log('🧹 Clearing existing monitoring stations...');
    await MonitoringStation.deleteMany({});

    // Insert sample monitoring stations
    console.log('🌱 Seeding monitoring stations...');
    const stations = await MonitoringStation.insertMany(sampleStations);
    console.log(`✅ Inserted ${stations.length} monitoring stations`);

    // Log the seeding activity
    await SystemLog.logEvent(
      'info',
      `Database seeded with ${stations.length} monitoring stations`,
      'database',
      'system',
      { stationCount: stations.length },
      { correlationId: `seed-${Date.now()}` }
    );

    console.log('🎉 Database seeding completed successfully!');
    
    // Display seeded stations
    console.log('\n📊 Seeded Monitoring Stations:');
    stations.forEach(station => {
      console.log(`  • ${station.name} (${station.stationId}) - ${station.operationalStatus.status}`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    
    // Log the error
    await SystemLog.logEvent(
      'error',
      'Database seeding failed',
      'database',
      'system',
      { error: error.message, stack: error.stack }
    );
    
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Function to seed sample AQI data
async function seedAQIData() {
  const { AQILog } = require('../models');
  
  const sampleLocations = [
    { name: 'New York, NY', coordinates: [-73.9857, 40.7484] },
    { name: 'Los Angeles, CA', coordinates: [-118.2437, 34.0522] },
    { name: 'Chicago, IL', coordinates: [-87.6298, 41.8781] },
    { name: 'Houston, TX', coordinates: [-95.3698, 29.7604] },
    { name: 'Phoenix, AZ', coordinates: [-112.0740, 33.4484] }
  ];

  const aqiCategories = [
    { range: [0, 50], category: 'Good', color: '#00E400' },
    { range: [51, 100], category: 'Moderate', color: '#FFFF00' },
    { range: [101, 150], category: 'Unhealthy for Sensitive Groups', color: '#FF7E00' },
    { range: [151, 200], category: 'Unhealthy', color: '#FF0000' },
    { range: [201, 300], category: 'Very Unhealthy', color: '#8F3F97' },
    { range: [301, 500], category: 'Hazardous', color: '#7E0023' }
  ];

  const aqiLogs = [];
  
  // Generate data for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    
    sampleLocations.forEach(location => {
      // Generate realistic AQI values (weighted toward lower values)
      const aqi = Math.floor(Math.random() * 200) + Math.floor(Math.random() * 50);
      const category = aqiCategories.find(cat => aqi >= cat.range[0] && aqi <= cat.range[1]);
      
      aqiLogs.push({
        location: {
          name: location.name,
          coordinates: {
            type: 'Point',
            coordinates: location.coordinates
          },
          city: location.name.split(',')[0],
          state: location.name.split(',')[1]?.trim(),
          country: 'USA'
        },
        aqiData: {
          aqi: aqi,
          category: category.category,
          color: category.color,
          description: `AQI ${aqi} - ${category.category}`,
          healthRecommendations: getHealthRecommendation(category.category)
        },
        pollutants: {
          pm25: Math.floor(Math.random() * 50) + 5,
          pm10: Math.floor(Math.random() * 100) + 10,
          no2: Math.floor(Math.random() * 80) + 10,
          so2: Math.floor(Math.random() * 40) + 5,
          co: Math.floor(Math.random() * 15) + 1,
          o3: Math.floor(Math.random() * 120) + 20
        },
        metadata: {
          source: 'openweather',
          confidence: Math.floor(Math.random() * 20) + 80,
          lastUpdated: date
        },
        createdAt: date,
        updatedAt: date
      });
    });
  }

  console.log('🌱 Seeding AQI data...');
  await AQILog.deleteMany({}); // Clear existing data
  const logs = await AQILog.insertMany(aqiLogs);
  console.log(`✅ Inserted ${logs.length} AQI log entries`);
  
  return logs;
}

function getHealthRecommendation(category) {
  const recommendations = {
    'Good': 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
    'Moderate': 'Air quality is acceptable; however, unusually sensitive people should consider limiting prolonged outdoor exertion.',
    'Unhealthy for Sensitive Groups': 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.',
    'Unhealthy': 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.',
    'Very Unhealthy': 'Health warnings of emergency conditions. The entire population is more likely to be affected.',
    'Hazardous': 'Health alert: everyone may experience more serious health effects.'
  };
  return recommendations[category] || 'Health information not available.';
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => seedAQIData())
    .then(() => {
      console.log('🎉 All seeding completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = {
  seedDatabase,
  seedAQIData,
  sampleStations
};