const prisma = require('../lib/prisma')
const { verifyPassword } = require('../utils/password')
const { generateToken } = require('../utils/jwt')
const logger = require('../lib/logger')
const ApiError = require('../utils/ApiError')
const { sendSuccess } = require('../utils/response')

/**
 * Authenticates a user with email and password, and returns a JWT token on success.
 *
 * @param {Object} req - Express request object containing email and password in body.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const loginUser = async (req, res, next) => {
  const { email, password } = req.body

  try {
    const user = await prisma.user.findUnique({ where: { email } })

    // Combine user not found and password mismatch into one error type for security
    if (!user || !(await verifyPassword(user.password, password))) {
      // Throw specific ApiError for invalid credentials
      throw new ApiError(
        401,
        'Invalid credentials provided',
        true,
        'INVALID_CREDENTIALS'
      )
    }

    const payload = { userId: user.id, email: user.email }
    const token = generateToken(payload)

    logger.info(
      { userId: user.id, email: user.email },
      'User logged in successfully'
    )

    sendSuccess(res, 200, 'Login successful', {
      token: token,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (error) {
    logger.error(
      { err: error, email: req.body.email },
      'Login attempt failed in controller'
    )
    next(error) // Pass error to the centralized handler
  }
}

module.exports = {
  loginUser,
}
