const prisma = require('../lib/prisma')
const { hashPassword } = require('../utils/password')
const logger = require('../lib/logger')
const ApiError = require('../utils/ApiError')

/**
 * Creates a new user with hashed password and stores it in the database.
 *
 * @param {Object} req - Express request object containing name, email, and password.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const createUser = async (req, res, next) => {
  const { name, email, password } = req.body

  // TODO: Replace with validation middleware
  if (!name || !email || !password) {
    // Throw an ApiError for validation issues
    return next(
      new ApiError(
        400,
        'Missing required fields: name, email, password',
        true,
        'VALIDATION_ERROR'
      )
    )
  }

  try {
    const hashedPassword = await hashPassword(password)
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
        updated_at: true,
      },
    })

    logger.info(
      { userId: newUser.id, email: newUser.email },
      'User created successfully'
    )
    sendSuccess(res, 201, 'User created successfully', { user: newUser })
  } catch (error) {
    logger.error(
      { err: error, body: req.body },
      'Failed to create user in controller'
    )
    next(error) // Pass error to the centralized handler
  }
}

module.exports = {
  createUser,
}
