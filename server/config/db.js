const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    // If MONGODB_URI is not provided, start an in-memory Mongo server for development / local testing
    if (!mongoUri || mongoUri.trim() === '') {
      console.log('ℹ️  No MONGODB_URI found in environment. Initializing embedded in-memory database for local testing...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        mongoUri = mongodInstance.getUri();
        console.log('✅ In-memory MongoDB started successfully at:', mongoUri);
      } catch (memErr) {
        console.error('❌ Could not start in-memory MongoDB:', memErr.message);
        throw new Error('Please configure MONGODB_URI in server/.env with your MongoDB Atlas connection string.');
      }
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // If connection to remote Atlas failed and we didn't try in-memory, give fallback option
    if (!mongodInstance && process.env.NODE_ENV !== 'production') {
      try {
        console.log('🔄 Attempting fallback to embedded in-memory MongoDB for offline/local run...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        const fallbackUri = mongodInstance.getUri();
        const conn = await mongoose.connect(fallbackUri);
        console.log(`✅ Fallback in-memory MongoDB connected: ${conn.connection.host}`);
        return conn;
      } catch (fallbackErr) {
        console.error('❌ Fallback failed:', fallbackErr.message);
      }
    }
    process.exit(1);
  }
};

const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
    console.log('MongoDB connection closed.');
  } catch (err) {
    console.error('Error closing MongoDB:', err);
  }
};

module.exports = { connectDB, closeDB };
