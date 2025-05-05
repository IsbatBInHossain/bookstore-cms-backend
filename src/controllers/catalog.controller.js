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

// --- Author Controller Functions ---

/**
 * Creates a new author.
 */
const createAuthor = async (req, res, next) => {
  const { name, bio } = req.body
  try {
    // Check if author already exists
    const existingAuthor = await prisma.author.findUnique({ where: { name } })
    if (existingAuthor) {
      throw new ApiError(
        409,
        `Author with name "${name}" already exists`,
        true,
        'DUPLICATE_ENTRY'
      )
    }

    const author = await prisma.author.create({
      data: {
        name,
        bio,
      },
    })
    logger.info(
      { authorId: author.id, name: author.name },
      'Author created successfully'
    )
    sendSuccess(res, 201, 'Author created successfully', { author })
  } catch (error) {
    logger.error({ err: error, body: req.body }, 'Failed to create author')
    next(error) // Pass to centralized error handler
  }
}

/**
 * Retrieves all authors
 */
const getAllAuthors = async (req, res, next) => {
  try {
    // TODO: Add pagination (query params like limit, offset/page) for large datasets
    const authors = await prisma.author.findMany({
      orderBy: { name: 'asc' }, // Order alphabetically
    })
    sendSuccess(res, 200, 'Authors retrieved successfully', { authors })
  } catch (error) {
    logger.error({ err: error }, 'Failed to retrieve authors')
    next(error)
  }
}

/**
 * Retrieves a single author by ID.
 */
const getAuthorById = async (req, res, next) => {
  const { authorId } = req.params
  try {
    const author = await prisma.author.findUnique({
      where: { id: authorId },
      include: { _count: { select: { books: true } } }, // include book count
    })

    if (!author) {
      throw new ApiError(404, 'Author not found', true, 'NOT_FOUND')
    }
    sendSuccess(res, 200, 'Author retrieved successfully', { author })
  } catch (error) {
    logger.error({ err: error, authorId }, 'Failed to retrieve author by ID')
    next(error)
  }
}

/**
 * Updates an existing author.
 */
const updateAuthor = async (req, res, next) => {
  const { authorId } = req.params
  const updateData = req.body // Contains validated { name?, bio? }

  try {
    const author = await prisma.author.update({
      where: { id: authorId },
      data: updateData, // Pass validated update data directly
    })
    // Note: update throws error if record not found (P2025), handled by central handler

    logger.info(
      { authorId: author.id, data: updateData },
      'Author updated successfully'
    )
    sendSuccess(res, 200, 'Author updated successfully', { author })
  } catch (error) {
    // Handle potential unique constraint violation if name is updated to an existing one
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      logger.warn(
        { authorId, name: updateData.name },
        'Attempted to update author name to one that already exists'
      )
      return next(
        new ApiError(
          409,
          `Author name "${updateData.name}" already exists`,
          true,
          'DUPLICATE_ENTRY'
        )
      )
    }
    logger.error(
      { err: error, authorId, body: req.body },
      'Failed to update author'
    )
    next(error) // Pass other errors (like P2025 Not Found) to central handler
  }
}

/**
 * Deletes an author.
 */
const deleteAuthor = async (req, res, next) => {
  const { authorId } = req.params
  try {
    // TODO: Handle what happens if author is linked to books.
    // Prisma will likely throw a foreign key constraint error if books exist. Handled by error handler
    await prisma.author.delete({
      where: { id: authorId },
    })

    logger.info({ authorId }, 'Author deleted successfully')
    res.status(204).send()
  } catch (error) {
    // Handle foreign key constraint error (if author is linked to books)
    if (error.code === 'P2003' || error.code === 'P2014') {
      // Foreign key or relation violation
      logger.warn(
        { authorId },
        'Attempted to delete author linked to existing books'
      )
      return next(
        new ApiError(
          409,
          'Cannot delete author: Author is linked to existing books',
          true,
          'DELETE_CONFLICT'
        )
      )
    }
    logger.error({ err: error, authorId }, 'Failed to delete author')
    next(error) // Pass other errors (like P2025 Not Found) to central handler
  }
}

module.exports = {
  lookupGoogleBooks,
  createAuthor,
  getAllAuthors,
  getAuthorById,
  updateAuthor,
  deleteAuthor,
}
