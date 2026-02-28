/**
 * health.routes.js — Liveness / readiness probe endpoint.
 *
 * Used by Docker Compose's healthcheck and any load-balancer or orchestrator
 * (e.g. Kubernetes) to determine whether the service is ready to accept traffic.
 *
 * GET /health
 *   - Returns HTTP 200 when both the Node process and the database are reachable.
 *   - Returns HTTP 503 when the database query fails so upstream tooling can
 *     route traffic elsewhere or restart the container.
 */

const { Router } = require('express')
const { pool }   = require('../config/db')

const router = Router()

router.get('/', async (req, res) => {
  try {
    // A lightweight query that exercises the connection pool without
    // touching any application table.
    await pool.query('SELECT 1')

    res.json({
      status:    'ok',
      database:  'ok',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(503).json({
      status:    'error',
      database:  'unreachable',
      message:   err.message,
      timestamp: new Date().toISOString(),
    })
  }
})

module.exports = router
