const argon2 = require('argon2')

/**
 * Hashes a plain text password using Argon2.
 *
 * @param {string} plainPassword - The password to hash.
 * @returns {Promise<string>} - The hashed password.
 * @throws {Error} - Throws an error if hashing fails.
 */
const hashPassword = async plainPassword => {
  try {
    const hash = await argon2.hash(plainPassword)
    return hash
  } catch (err) {
    console.error('Error hashing password:', err)
    throw new Error('Password hashing failed')
  }
}

/**
 * Verifies if a plain text password matches the given hashed password.
 *
 * @param {string} hashedPassword - The previously hashed password.
 * @param {string} plainPassword - The plain password to verify.
 * @returns {Promise<boolean>} - Returns true if passwords match, false otherwise.
 */
const verifyPassword = async (hashedPassword, plainPassword) => {
  try {
    const isMatch = await argon2.verify(hashedPassword, plainPassword)
    return isMatch
  } catch (err) {
    console.error('Error verifying password:', err)
    return false
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
}
