// db.js - MongoDB connection configuration
// Mongoose handles connection pooling automatically, meaning it maintains
// a pool of reusable connections under the hood. You only need to call
// mongoose.connect() once and Mongoose manages the rest efficiently.

const mongoose = require('mongoose');

/**
 * connectDB - Establishes a connection to MongoDB using the URI
 * defined in the MONGODB_URI environment variable.
 *
 * This function is called once at server startup (in server.js).
 * If the connection fails, it throws an error which causes the
 * process to exit — we do NOT want to run without a database.
 */
const connectDB = async () => {
  try {
    // mongoose.connect() returns a connection object with metadata
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    // Log the host so we can confirm which MongoDB instance we're on
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    // Log the full error message to help with debugging
    console.error(`MongoDB connection error: ${error.message}`);

    // Re-throw so server.js can catch it and exit the process cleanly
    throw error;
  }
};

module.exports = connectDB;
