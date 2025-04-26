const prisma = require('../lib/prisma')
const { hashPassword } = require('../utils/password')

/**
 * Creates a new user with hashed password and stores it in the database.
 *
 * @param {Object} req - Express request object containing name, email, and password.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const createUser = async (req, res, next) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: 'Missing required fields: name, email, password' })
  }

  try {
    const hashedPassword = await hashPassword(password)

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
        updated_at: true,
      },
    })

    console.log('Created User:', newUser)
    res
      .status(201)
      .json({ message: 'User created successfully', user: newUser })
  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(409).json({ error: 'Email already exists' })
    }
    console.error('Error creating user:', error)
    res.status(500).json({ error: 'Failed to create user due to server error' })
  }
}

module.exports = {
  createUser,
}
