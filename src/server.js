const express = require('express')
require('dotenv').config() // Load environment variables early
const cors = require('cors')
const helmet = require('helmet')

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
// --- End Core Middleware ---

// --- API Routes ---
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
// --- End API Routes ---

// Heartbeat route for basic uptime/health check
app.get('/heartbeat', (req, res) => {
  res.status(200).json({
    message: 'Server is running',
    timestamp: Date.now(),
  })
})

// TODO: Replace with centralized Error Handler later
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err)

  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})
// TODO: Replace basic error handler with a more detailed centralized error middleware

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
