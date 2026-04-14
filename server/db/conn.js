const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('MongoDB connected');
    
    // Seed manually to remove dependency on .env
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      await new User({ username: 'admin', password: 'admin' }).save();
    }
    const userExists = await User.findOne({ username: 'user' });
    if (!userExists) {
      await new User({ username: 'user', password: 'password' }).save();
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
