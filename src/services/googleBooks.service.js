const axios = require('axios')
const logger = require('../lib/logger')
const ApiError = require('../utils/ApiError')

const API_KEY = process.env.GOOGLE_BOOKS_API_KEY
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes'

/**
 * Searches the Google Books API for volumes based on a query.
 * @param {string} query - The search term.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of simplified book objects.
 */
const searchGoogleBooks = async query => {
  if (!API_KEY) {
    logger.warn(
      'GOOGLE_BOOKS_API_KEY is not set. Google Books lookup will fail.'
    )
    throw new ApiError(
      503,
      'Google Books API key not configured on server',
      false,
      'SERVICE_UNAVAILABLE'
    )
  }
  if (!query || typeof query !== 'string' || query.trim() === '') {
    return []
  }

  const params = {
    q: query,
    key: API_KEY,
    maxResults: 10,
    projection: 'lite', // 'lite' projection for smaller response
  }

  try {
    logger.debug({ query, params }, 'Searching Google Books API')
    const response = await axios.get(BASE_URL, { params })

    if (
      !response.data ||
      !response.data.items ||
      response.data.items.length === 0
    ) {
      logger.info({ query }, 'No results found in Google Books API')
      return [] // No items found
    }

    // Map the complex Google API response to our simplified format
    const simplifiedBooks = response.data.items
      .map(item => {
        const volumeInfo = item.volumeInfo || {}
        const imageLinks = volumeInfo.imageLinks || {}
        const identifiers = volumeInfo.industryIdentifiers || []

        // Helper function to find specific ISBN types
        const findIsbn = type =>
          identifiers.find(id => id.type === type)?.identifier || null

        return {
          googleBooksId: item.id || null,
          title: volumeInfo.title || null,
          authors: volumeInfo.authors || [],
          publisher: volumeInfo.publisher || null,
          publishedDate: volumeInfo.publishedDate || null,
          description: volumeInfo.description || null,
          isbn10: findIsbn('ISBN_10'),
          isbn13: findIsbn('ISBN_13'),
          pageCount: volumeInfo.pageCount || null,
          language: volumeInfo.language || null,
          coverImageUrl:
            imageLinks.thumbnail || imageLinks.smallThumbnail || null,
        }
      })
      .filter(book => book.title) // Filter out results without a title, they are likely useless

    logger.info(
      { query, resultsCount: simplifiedBooks.length },
      'Google Books API search successful'
    )
    return simplifiedBooks
  } catch (error) {
    logger.error({ err: error, query }, 'Error searching Google Books API')

    // Check for specific axios/network errors
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to fetch data from Google Books'
      // Throw an ApiError for the central error handler
      throw new ApiError(
        status,
        `Google Books API Error: ${message}`,
        false,
        'GOOGLE_API_ERROR'
      )
    }
    // Re-throw unexpected errors
    throw error
  }
}

module.exports = {
  searchGoogleBooks,
}
