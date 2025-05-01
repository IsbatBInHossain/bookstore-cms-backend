const pino = require('pino')

// Configure options for Pino
const loggerOptions = {
  level: process.env.LOG_LEVEL || 'info', // Set log level from env or default to 'info'
  // Base context
  base: {
    pid: process.pid, // Log process ID
    serviceName: 'bookstore-cms',
  },
  // Timestamp format
  timestamp: pino.stdTimeFunctions.isoTime,
  // --- Pretty Printing (Development ONLY) ---
  ...(process.env.NODE_ENV !== 'production' && {
    // Only add transport in non-production
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true, // Add colors
        levelFirst: true, // Show level first
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss', // Human-readable time format
        ignore: 'pid,hostname',
      },
    },
  }),
}

// Create the logger instance
const logger = pino(loggerOptions)

// Initialize the logger
logger.info(`Logger initialized with level: ${logger.level}`)

module.exports = logger
