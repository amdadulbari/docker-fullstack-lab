// health.routes.js - Liveness/readiness health check endpoint
// Health checks are used by Docker, Kubernetes, and load balancers to
// determine whether the service is ready to accept traffic.
// Returning a non-2xx status causes the orchestrator to restart the container.

const { Router } = require('express');
const mongoose = require('mongoose');

const router = Router();

// ---------------------------------------------------------------------------
// GET /health
// Checks that the Express server is running AND that Mongoose is connected
// to MongoDB. Returns 200 when healthy, 500 when the database is not ready.
//
// mongoose.connection.readyState values:
//   0 = disconnected
//   1 = connected   <-- the only healthy state
//   2 = connecting
//   3 = disconnecting
// ---------------------------------------------------------------------------
router.get('/health', (req, res) => {
  // readyState === 1 means Mongoose has an active connection to MongoDB
  const isDbConnected = mongoose.connection.readyState === 1;

  if (!isDbConnected) {
    return res.status(500).json({
      status: 'error',
      database: 'unavailable',
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: 'ok',
    database: 'ok',
    // ISO 8601 timestamp helps with log correlation and monitoring dashboards
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
