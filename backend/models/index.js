// Database Models Index
// This file exports all database models for easy importing

const User = require('./User');
const Subscription = require('./Subscription');
const Notification = require('./Notification');
const AQILog = require('./AQILog');
const MonitoringStation = require('./MonitoringStation');
const SystemLog = require('./SystemLog');

module.exports = {
  User,
  Subscription,
  Notification,
  AQILog,
  MonitoringStation,
  SystemLog
};

// Usage examples:
// const { User, AQILog } = require('./models');
// const models = require('./models');
// const user = new models.User(userData);