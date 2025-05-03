const { verifyToken } = require('../utils/jwt')
const ApiError = require('../utils/ApiError')
const logger = require('../lib/logger')

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null

  // Check if token exists
  if (!token) {
    logger.warn(
      { path: req.originalUrl },
      'Authentication failed: No token provided'
    )
    // Pass a specific ApiError - 401 Unauthorized
    return next(
      new ApiError(401, 'Authentication token required', true, 'TOKEN_MISSING')
    )
  }

  // Verify the token using the utility function
  const payload = verifyToken(token)

  // Check if verification failed (payload is null)
  if (!payload) {
    logger.warn(
      { path: req.originalUrl, tokenProvided: true },
      'Authentication failed: Invalid or expired token'
    )
    // Pass a specific ApiError - 401 Unauthorized
    return next(
      new ApiError(
        401,
        'Authentication token is invalid or expired',
        true,
        'TOKEN_INVALID'
      )
    )
  }

  // Verification successful
  req.user = payload
  logger.debug(
    { userId: payload.userId, path: req.originalUrl },
    'Authentication successful'
  )
  next()
}

module.exports = { authenticateToken }
