const express = require('express')
require('dotenv').config()
const cors = require('cors')
const helmet = require('helmet')
const logger = require('./lib/logger')
const pinoHttp = require('pino-http')

// Import routers
const authRoutes = require('./routes/auth.routes')
const userRoutes = require('./routes/user.routes')

const app = express()

// --- Core Middleware ---
app.use(cors()) // Enable CORS
// TODO: Configure CORS more strictly for production (allowed origins, methods, etc.)

app.use(helmet()) // Set various HTTP security headers
app.use(express.json()) // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })) // Parse incoming URL-encoded data
app.use(pinoHttp({ logger })) // Add logger
// --- End Core Middleware ---

// --- API Routes ---
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
// --- End API Routes ---

// Heartbeat route for basic uptime/health check
app.get('/api/heartbeat', (req, res) => {
  res.status(200).json({
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  })
})

// --- Server Startup ---
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`)
  // TODO: Initialize structured logger here
})

// --- Global Error Handlers ---

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  // TODO: Optionally perform cleanup and exit the process
  // process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error)
  // TODO: Perform cleanup and exit the process if needed
  process.exit(1)
})
