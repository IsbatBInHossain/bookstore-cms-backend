// src/controllers/catalog.controller.js
const googleBooksService = require('../services/googleBooks.service')
const { sendSuccess } = require('../utils/response')
const ApiError = require('../utils/ApiError')
const logger = require('../lib/logger')

/**
 * Handles requests to search the Google Books API.
 */
const lookupGoogleBooks = async (req, res, next) => {
  const query = req.query.q // Get search query from query parameter 'q

  try {
    const results = await googleBooksService.searchGoogleBooks(query)
    logger.info(`Google Books lookup successful for query: "${query}"`)
    sendSuccess(res, 200, 'Google Books lookup successful', results)
  } catch (error) {
    // Log error specifically for this controller action
    logger.error(
      { err: error, query },
      'Failed to lookup Google Books in controller'
    )
    // Pass error to the centralized error handler
    next(error)
  }
}

module.exports = {
  lookupGoogleBooks,
}
