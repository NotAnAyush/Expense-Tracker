const mongoose = require('mongoose');

let memoryServer = null;

const mongooseOptions = {
  maxPoolSize: 20,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Database Connection Event Listeners
mongoose.connection.on('connected', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('[Database] MongoDB connection established successfully');
  }
});

mongoose.connection.on('error', (err) => {
  console.error('[Database Error] MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.warn('[Database Warning] MongoDB connection lost / disconnected');
  }
});

mongoose.connection.on('reconnected', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('[Database] MongoDB connection reconnected');
  }
});

const connectDB = async (customUri) => {
  if (mongoose.connection.readyState !== 0) {
    return mongoose.connection;
  }

  const connStr = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expense-tracker-v2';

  try {
    const conn = await mongoose.connect(connStr, mongooseOptions);
    console.log(`[Database] Connected to MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to local/URI MongoDB (${error.message}).`);
    console.log(`[Database] Initializing In-Memory MongoDB Server for zero-dependency execution...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memoryUri = memoryServer.getUri();
      const conn = await mongoose.connect(memoryUri, mongooseOptions);
      console.log(`[Database] Connected to In-Memory MongoDB: ${conn.connection.host}`);
      return conn;
    } catch (memErr) {
      console.error(`[Database Error] In-Memory MongoDB startup failed: ${memErr.message}`);
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }
};

const closeDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close(false);
      if (process.env.NODE_ENV !== 'test') {
        console.log('[Database] MongoDB connection closed');
      }
    }
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
  } catch (error) {
    console.error('[Database Error] Error during connection teardown:', error.message);
  }
};

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.closeDatabase = closeDatabase;
