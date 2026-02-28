// app.js - Express application factory
// We separate the app setup from server.js so the app can be imported by
// tests without starting an actual HTTP server. This is a standard pattern.

const express = require('express');
const morgan = require('morgan');

// Route modules
const healthRoutes = require('./routes/health.routes');
const productRoutes = require('./routes/product.routes');

// Create the Express application instance
const app = express();

// ---------------------------------------------------------------------------
// Global Middleware
// Middleware functions run for every incoming request, in the order they are
// registered. They can parse the body, log requests, handle auth, etc.
// ---------------------------------------------------------------------------

// express.json() parses incoming requests with a JSON body.
// Without this, req.body would be undefined for POST/PUT requests.
app.use(express.json());

// morgan('dev') logs each request in a concise colorized format:
//   POST /api/v1/products 201 14.321 ms - 245
// Very useful during development and for basic production audit trails.
app.use(morgan('dev'));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Health check: accessible at GET /health (no versioning — infra tooling
// often expects a stable path like /health or /healthz)
app.use('/', healthRoutes);

// Products API: all product endpoints are prefixed with /api/v1
// This prefix lets us release a /api/v2 later without breaking existing clients.
app.use('/api/v1', productRoutes);

// ---------------------------------------------------------------------------
// 404 Handler
// This middleware runs only when no previous route matched the request.
// It must be defined AFTER all valid routes.
// ---------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    error: `Cannot ${req.method} ${req.originalUrl} — route not found`,
  });
});

// ---------------------------------------------------------------------------
// Global Error Handler
// Express recognises a 4-argument middleware as an error handler.
// Any route or middleware that calls next(err) lands here.
// It is defined last, after all routes and the 404 handler.
// ---------------------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Log the full stack trace on the server side for debugging
  console.error(err.stack);

  // Avoid leaking internal error details to the client in production
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message;

  res.status(statusCode).json({ error: message });
});

module.exports = app;
