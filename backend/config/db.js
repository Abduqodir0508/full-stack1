const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (mongoUri) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2000,
      });
      console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`[MongoDB] Could not connect to MONGO_URI (${mongoUri}): ${err.message}`);
      console.log('[MongoDB] Running in zero-downtime memory fallback mode with sample products.');
      return null;
    }
  }

  console.log('[MongoDB] MONGO_URI not provided. Running in memory fallback mode.');
  return null;
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
