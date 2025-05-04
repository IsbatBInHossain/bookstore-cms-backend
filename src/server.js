const express = require('express')
require('dotenv').config()
const cors = require('cors')
const helmet = require('helmet')
const pinoHttp = require('pino-http')

// Import lirary and utils
const logger = require('./lib/logger')
const { sendError } = require('./utils/response')
const ApiError = require('./utils/ApiError')
const { Prisma } = require('../prisma/generated/prisma-client-js')

// Import routers
const authRoutes = require('./routes/auth.routes')
const userRoutes = require('./routes/user.routes')
const catalogRoutes = require('./routes/catalog.routes')

const app = express()

// --- Core Middlewares ---
app.use(cors()) // TODO: Configure CORS more strictly for production (allowed origins, methods, etc.)
app.use(helmet()) // Set various HTTP security headers
app.use(express.json()) // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })) // Parse incoming URL-encoded data
app.use(pinoHttp({ logger })) // Add logger

// --- API Routes ---
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/catalog', catalogRoutes)

// Heartbeat route for basic uptime/health check
app.get('/api/heartbeat', (req, res) => {
  res.status(200).json({
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  })
})

// Catch all error Route
app.use((req, res, next) => {
  // Create a more descriptive message
  const message = `The requested resource was not found on this server: ${req.method} ${req.originalUrl}`
  const error = new ApiError(404, message, true, 'ROUTE_NOT_FOUND')
  next(error)
})

// Centralized Error Hanlder
app.use((err, req, res, next) => {
  let error = err

  // Log the full error initially
  logger.error(
    {
      err: error,
      path: req.path,
      method: req.method,
      body: req.body, //! Be careful logging sensitive data in production
      params: req.params,
      query: req.query,
    },
    `Error caught by centralized handler: ${error.message}`
  )

  // Handle Prisma known errors specifically
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      const fields = error.meta?.target || ['field']
      const message = `Duplicate value provided for unique field: ${fields.join(
        ', '
      )}`
      error = new ApiError(409, message, true, 'DUPLICATE_ENTRY') // 409 Conflict
    }
    // Record not found for relation
    else if (error.code === 'P2025') {
      const message = error.meta?.cause || 'Related record not found'
      error = new ApiError(400, message, true, 'RELATION_NOT_FOUND') // Bad Request
    }
    // Record not found for update/delete
    else if (error.code === 'P2015' || error.code === 'P2018') {
      error = new ApiError(404, 'Record not found', true, 'NOT_FOUND')
    } else {
      // Generic Prisma error
      error = new ApiError(500, 'Database error occurred', false, 'DB_ERROR')
    }
  }

  // Treat unexpected errors as 500 Internal Server Error and non-operational
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500
    const message = error.message || 'Internal Server Error'
    error = new ApiError(
      statusCode,
      message,
      false,
      'UNEXPECTED_ERROR',
      err.stack
    )
  }

  // If it's a non-operational error in production, hide details from the client
  if (process.env.NODE_ENV === 'production' && !error.isOperational) {
    sendError(res, 500, 'An unexpected error occurred on the server.')
  } else {
    // Determine what details to send
    let responseDetails = null
    if (error.details) {
      // If details (like validation errors) exist on the ApiError
      responseDetails = error.details
    } else if (
      process.env.NODE_ENV === 'development' &&
      !error.isOperational &&
      error.stack
    ) {
      // Only fallback to stack for unexpected errors in development
      responseDetails = error.stack
    }

    // Send detailed error response
    sendError(
      res,
      error.statusCode,
      error.message,
      error.errorCode,
      responseDetails
    )
  }
})

// --- Server Startup ---
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  logger.info(`Server has started on port ${PORT}`)
})

// --- Global Error Handlers ---

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error(
    {
      err: reason instanceof Error ? reason : { message: reason },
      promise,
    },
    'Unhandled Rejection occurred'
  )
})

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  logger.error(
    {
      err: error.message,
    },
    'Uncaught Exception'
  )
  // TODO: Perform cleanup and exit the process if needed
  process.exit(1)
})
