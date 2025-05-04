const ApiError = require('../utils/ApiError')
const logger = require('../lib/logger')

/**
 * Middleware to validate request data against a Zod schema.
 * Validates req.body, req.params, and req.query based on the schema structure.
 * @param {z.ZodObject<any>} schema - The Zod schema object.
 */
const validate = schema => (req, res, next) => {
  try {
    const objectToValidate = {}
    // Check specifically if the schema *expects* these parts
    const expectsParams = !!schema.shape.params
    const expectsBody = !!schema.shape.body
    const expectsQuery = !!schema.shape.query

    if (expectsParams) objectToValidate.params = req.params
    if (expectsBody) objectToValidate.body = req.body
    if (expectsQuery) objectToValidate.query = req.query

    // Validate the request data
    const validatedData = schema.parse(objectToValidate)

    // Merge validated parts back carefully
    if (expectsParams && validatedData.params) req.params = validatedData.params
    if (expectsBody && validatedData.body) req.body = validatedData.body
    if (expectsQuery && validatedData.query) req.query = validatedData.query

    return next()
  } catch (error) {
    // Check if it's a Zod validation error
    if (error.errors) {
      // Format Zod errors for a cleaner response
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      logger.warn(
        { validationErrors: formattedErrors, path: req.originalUrl },
        'Request validation failed'
      )
      // Create an ApiError with validation details
      const apiError = new ApiError(
        400, // Bad Request
        'Input validation failed',
        true, // Operational error
        'VALIDATION_ERROR'
      )
      apiError.details = formattedErrors
      return next(apiError) // Pass to centralized error handler
    }

    // If it's not a Zod error, pass it on as an unexpected error
    logger.error(
      { err: error },
      'Unexpected error during validation middleware'
    )
    return next(error)
  }
}

module.exports = validate
