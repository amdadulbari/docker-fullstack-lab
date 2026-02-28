// server.js - Application entry point
// Responsibilities:
//   1. Load environment variables from .env file before anything else runs
//   2. Connect to MongoDB (and exit if the connection fails)
//   3. Start the HTTP server on the configured PORT

// dotenv reads the .env file and adds every key=value pair to process.env.
// This must be the very first import so all subsequent modules can read env vars.
require('dotenv').config();

const connectDB = require('./src/config/db');
const app = require('./src/app');

// Read PORT from environment; fall back to 3000 for local development.
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// Bootstrap function — async so we can await the DB connection before
// starting the HTTP server. Connecting first ensures the server never
// starts accepting requests when the database is not yet ready.
// ---------------------------------------------------------------------------
const bootstrap = async () => {
  try {
    // Establish the MongoDB connection pool.
    // connectDB() throws if the connection cannot be established.
    await connectDB();

    // Start listening for HTTP requests only after DB is ready.
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    // If the DB connection fails we have no valid state to serve, so exit.
    console.error('Failed to start server:', error.message);
    process.exit(1); // Non-zero exit code signals an error to the OS/Docker
  }
};

bootstrap();
