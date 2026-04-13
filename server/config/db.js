const mongoose = require('mongoose');

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000; // 5 seconds

const connectDB = async (retryCount = 0) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error(`❌ MongoDB initial connection error (Attempt ${retryCount + 1}/${MAX_RETRIES}):`, err.message);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`[DB] Retrying in ${RETRY_INTERVAL / 1000}s...`);
      setTimeout(() => connectDB(retryCount + 1), RETRY_INTERVAL);
    } else {
      console.error('❌ MongoDB failed to connect after maximum retries. The server will continue running but database features will be unavailable.');
    }
  }
};

// Monitor connection health
mongoose.connection.on('error', (err) => {
  console.error('⚠️ MongoDB runtime error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected. Mongoose will attempt to reconnect automatically.');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`[DB] Received ${signal}. Closing connection...`);
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during database shutdown:', err.message);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = connectDB;
