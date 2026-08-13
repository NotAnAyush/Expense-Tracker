const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async (customUri) => {
  if (mongoose.connection.readyState !== 0) {
    return mongoose.connection;
  }

  const connStr = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expense-tracker-v2';

  try {
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Connected to MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to local/URI MongoDB (${error.message}).`);
    console.log(`[Database] Initializing In-Memory MongoDB Server for zero-dependency execution...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memoryUri = memoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
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

module.exports = connectDB;
