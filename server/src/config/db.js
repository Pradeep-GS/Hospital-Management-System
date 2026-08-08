const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  const connString = process.env.MONGODB_URI;
  if (!connString) {
    console.log('ℹ️ No MONGODB_URI provided in environment variables.');
    return false;
  }
  try {
    await mongoose.connect(connString);
    console.log('✅ MongoDB connected successfully.');
    return true;
  } catch (err) {
    console.warn('⚠️ MongoDB connection warning:', err.message);
    return false;
  }
};

module.exports = { connectDB };
