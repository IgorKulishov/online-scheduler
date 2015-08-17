'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: process.env.MONGOLAB_URI || 'mongodb://localhost:27017/scheduler-dev'
  },

  seedDB: true
};
