const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

// Ensure IPv4 first DNS order to prevent querySrv ECONNREFUSED on Windows Node environments
try {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {
  // Ignore if not supported in runtime
}

const autoSeedDemoData = async () => {
  try {
    const { User, Hospital } = require('../models');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 No users found in database. Running seed script...');
      const seedModule = require('../scripts/seedDatabase');
      if (typeof seedModule === 'function') {
        await seedModule();
      }
    }
  } catch (err) {
    console.warn('⚠️ Auto-seed check notice:', err.message);
  }
};

const connectDB = async () => {
  const connString = process.env.MONGODB_URI;
  if (!connString) {
    console.log('ℹ️ No MONGODB_URI provided in environment variables.');
    return false;
  }
  try {
    // Append database name if missing in URI
    let formattedUri = connString;
    if (formattedUri.includes('.mongodb.net/') && !formattedUri.includes('.mongodb.net/hospital')) {
      formattedUri = formattedUri.replace('.mongodb.net/?', '.mongodb.net/hospital_db?');
    }

    await mongoose.connect(formattedUri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000
    });
    console.log('✅ MongoDB connected successfully.');
    await autoSeedDemoData();
    return true;
  } catch (err) {
    console.warn('⚠️ MongoDB connection warning:', err.message);
    // Fallback to local MongoDB if remote connection fails
    try {
      console.log('🔄 Attempting fallback to local MongoDB instance...');
      await mongoose.connect('mongodb://127.0.0.1:27017/hospital_db', {
        serverSelectionTimeoutMS: 3000
      });
      console.log('✅ Local MongoDB connected successfully.');
      await autoSeedDemoData();
      return true;
    } catch (localErr) {
      console.warn('⚠️ Local MongoDB connection also failed:', localErr.message);
      return false;
    }
  }
};

module.exports = { connectDB, autoSeedDemoData };

