const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  const connString = process.env.MONGODB_URI;
  if (!connString) {
    console.log('ℹ️ No MONGODB_URI provided. Running backend with turnkey In-Memory Data Store.');
    return false;
  }
  try {
    await mongoose.connect(connString);
    console.log('✅ MongoDB connected successfully.');
    await autoSeedDemoData();
    return true;
  } catch (err) {
    console.warn('⚠️ MongoDB connection failed. Falling back to turnkey In-Memory Data Store:', err.message);
    return false;
  }
};

module.exports = { connectDB, mockStore, autoSeedDemoData };
