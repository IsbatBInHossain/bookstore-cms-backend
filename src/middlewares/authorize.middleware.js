// src/middlewares/authorize.middleware.js
const ApiError = require('../utils/ApiError')
const logger = require('../lib/logger')
const { Role } = require('../constants')

/**
 * Middleware to authorize requests based on user roles.
 * @param {Array<Role>} requiredRoles - An array of allowed roles (e.g., [Role.ADMIN]).
 */
const authorize = (requiredRoles = []) => {
  if (!Array.isArray(requiredRoles)) {
    requiredRoles = [requiredRoles]
  }

  return (req, res, next) => {
    // Assumes authenticateToken middleware has run and attached req.user
    if (!req.user || !req.user.role) {
      logger.debug(
        { path: req.originalUrl },
        'Authorization failed: User data or role missing from request. Is authenticateToken running first?'
      )
      // User should be authenticated before authorization attempt
      return next(
        new ApiError(
          401,
          'Authentication required before authorization',
          true,
          'AUTH_REQUIRED'
        )
      )
    }

    const userRole = req.user.role // Role should be attached by authenticateToken based on JWT payload

    // Check if the user's role is included in the list of required roles
    if (requiredRoles.length > 0 && requiredRoles.includes(userRole)) {
      // User has one of the required roles, allow access
      logger.debug(
        {
          userId: req.user.userId,
          role: userRole,
          required: requiredRoles,
          path: req.originalUrl,
        },
        'Authorization successful'
      )
      return next()
    } else {
      // User does not have the required role
      logger.warn(
        {
          userId: req.user.userId,
          role: userRole,
          required: requiredRoles,
          path: req.originalUrl,
        },
        'Authorization failed: Insufficient permissions'
      )
      return next(
        new ApiError(
          403,
          'Forbidden: You do not have permission to access this resource',
          true,
          'FORBIDDEN'
        )
      )
    }
  }
}

module.exports = { authorize, Role }
