const mongoose = require('mongoose');


async function connectToMongo(mongoURI) {
    try {
      await mongoose.connect(mongoURI);
      console.log('MongoDB connected successfully!');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      process.exit(1); 
    }
  }

  module.exports = connectToMongo;