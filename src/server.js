// Fetching required modules
const express = require('express')
require('dotenv').config()
const cors = require('cors')
const helmet = require('helmet')
const prisma = require('./lib/prisma')

// Set up the express app
const app = express()
app.use(express.json())
app.use(cors())
app.use(helmet())
const PORT = process.env.PORT || 3000

// Test route for prisma
app.post('/api/users', async (req, res) => {
  const { name, email, password } = req.body

  // Basic validation (add more robust validation later)
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: 'Missing required fields: name, email, password' })
  }

  try {
    // Use Prisma Client to create a new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        //! WARNING: For testing only
        password: password,
      },
    })
    console.log('Created User:', newUser)
    res.status(201).json(newUser)
  } catch (error) {
    // Basic error handling (check for unique constraint violation)
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(409).json({ error: 'Email already exists' })
    }
    console.error('Error creating user:', error)
    res.status(500).json({ error: 'Failed to create user' })
  }
})

// test heartbeat route
app.get('/api/heartbeat', (req, res) => {
  res.json({
    status: 'Server is running',
    timestamp: Date.now(),
  })
})

// Listen to the port
app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`)
})
