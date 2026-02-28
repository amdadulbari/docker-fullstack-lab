/**
 * server.js — Application entry point.
 *
 * Execution order:
 *   1. Load environment variables from .env (dotenv must run before any other
 *      module reads process.env, so this is the very first statement).
 *   2. Import the configured Express app.
 *   3. Import initDb() and call it — creates the todos table if absent.
 *   4. Only after the database is ready, bind the HTTP server to PORT.
 *
 * This guarantees the API never accepts requests before it can actually
 * serve them (no race condition between app startup and DB initialization).
 */

require('dotenv').config()

const app    = require('./src/app')
const { initDb } = require('./src/config/db')

const PORT = parseInt(process.env.PORT || '4000', 10)

async function start() {
  try {
    // Initialize database schema (idempotent — safe to run on every startup).
    await initDb()

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[server] Todo API listening on http://0.0.0.0:${PORT}`)
      console.log(`[server] Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (err) {
    console.error('[server] Failed to start:', err.message)
    process.exit(1)
  }
}

start()
