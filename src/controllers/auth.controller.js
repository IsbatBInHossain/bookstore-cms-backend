const prisma = require('../lib/prisma')
const { verifyPassword } = require('../utils/password')
const { generateToken } = require('../utils/jwt')

/**
 * Authenticates a user with email and password, and returns a JWT token on success.
 *
 * @param {Object} req - Express request object containing email and password in body.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const loginUser = async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isMatch = await verifyPassword(user.password, password)

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const payload = {
      userId: user.id,
      email: user.email,
    }

    const token = generateToken(payload)

    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed due to server error' })
  }
}

module.exports = {
  loginUser,
}
