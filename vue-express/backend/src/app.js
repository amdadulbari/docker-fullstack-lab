import express from 'express'
import cors from 'cors'
import morgan from 'morgan'

import healthRouter from './routes/health.routes.js'
import noteRouter from './routes/note.routes.js'

const app = express()

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }))
app.use(express.json())
app.use(morgan('dev'))

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/health', healthRouter)
app.use('/api/v1', noteRouter)

// ---------------------------------------------------------------------------
// 404 handler — catches any unmatched route
// ---------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` })
})

// ---------------------------------------------------------------------------
// Global error handler — receives errors forwarded via next(err)
// ---------------------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack)

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({ message: messages.join(', ') })
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  })
})

export default app
