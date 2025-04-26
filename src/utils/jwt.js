const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in .env file')
  process.exit(1)
}

/**
 * Generates a JWT token from a given payload.
 *
 * @param {Object} payload - Data to encode into the token.
 * @param {string} [expiresIn='1h'] - Token expiration time (default: 1 hour).
 * @returns {string} - The signed JWT token.
 * @throws {Error} - Throws an error if token generation fails.
 */
const generateToken = (payload, expiresIn = '1h') => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn })
    return token
  } catch (err) {
    console.error('Error generating token:', err)
    throw new Error('Token generation failed')
  }
}

/**
 * Verifies a JWT token and decodes its payload.
 *
 * @param {string} token - The JWT token to verify.
 * @returns {Object|null} - Returns the decoded payload if valid, otherwise null.
 */
const verifyToken = token => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (err) {
    console.error('Error verifying token:', err.message)
    return null
  }
}

module.exports = {
  generateToken,
  verifyToken,
}
