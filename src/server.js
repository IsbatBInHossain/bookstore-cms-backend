// Fetching required modules
const express = require('express')
require('dotenv').config()
const cors = require('cors')
const helmet = require('helmet')

// Set up the express app
const app = express()
app.use(express.json())
app.use(cors())
app.use(helmet())
const PORT = process.env.PORT || 3000

// test heartbeat route
app.get('/heartbeat', (req, res) => {
  res.json({
    status: 'Server is running',
    timestamp: Date.now(),
  })
})

// Listen to the port
app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`)
})
