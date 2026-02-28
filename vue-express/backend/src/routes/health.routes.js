import { Router } from 'express'
import mongoose from 'mongoose'

const router = Router()

/**
 * GET /health
 * Returns the current health status of the API and the database connection.
 * readyState values: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
 */
router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  }

  const status = dbState === 1 ? 'ok' : 'degraded'

  res.status(dbState === 1 ? 200 : 503).json({
    status,
    database: statusMap[dbState] ?? 'unknown',
    timestamp: new Date().toISOString(),
  })
})

export default router
