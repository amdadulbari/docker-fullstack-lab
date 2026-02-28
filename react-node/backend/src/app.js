/**
 * app.js — Express application factory.
 *
 * Responsibilities:
 *   - Register global middleware (CORS, JSON body parser, HTTP logging).
 *   - Mount feature routers under their base paths.
 *   - Provide a 404 catch-all for unknown routes.
 *   - Provide a global error handler that formats all unhandled errors
 *     as consistent JSON responses.
 *
 * The app is exported (not started here) so that server.js can call
 * initDb() before binding to a port, and so the app can be imported
 * in integration tests without starting a real server.
 */

const express      = require('express')
const cors         = require('cors')
const morgan       = require('morgan')
const healthRouter = require('./routes/health.routes')
const todoRouter   = require('./routes/todo.routes')

const app = express()

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

// CORS — restrict origins in production via the FRONTEND_URL env variable.
// Wildcards are only used when the variable is not set (local dev without Docker).
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Parse incoming JSON request bodies and make them available as req.body.
app.use(express.json())

// HTTP request logger — "dev" format prints colored, concise output to stdout.
// Change to "combined" (Apache format) for production log aggregators.
app.use(morgan('dev'))

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Liveness / readiness probe — mounted at /health (no versioning prefix).
app.use('/health', healthRouter)

// Versioned API — all resource routes live under /api/v1.
app.use('/api/v1/todos', todoRouter)

// ---------------------------------------------------------------------------
// 404 handler — catches any request that did not match a route above.
// ---------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.originalUrl} not found`,
  })
})

// ---------------------------------------------------------------------------
// Global error handler — Express identifies this as an error handler because
// it declares four parameters (err, req, res, next).
// All controller functions call next(err) to delegate here.
// ---------------------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[error]', err.message)
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack)
  }

  // Avoid leaking stack traces to clients in production.
  const statusCode = err.status || err.statusCode || 500
  res.status(statusCode).json({
    error:   err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  })
})

module.exports = app
