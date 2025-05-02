const ApiError = require('../utils/ApiError')
const logger = require('../lib/logger')

/**
 * Middleware to validate request data against a Zod schema.
 * Validates req.body, req.params, and req.query based on the schema structure.
 * @param {z.ZodObject<any>} schema - The Zod schema object.
 */
const validate = schema => (req, res, next) => {
  try {
    // Create an object containing only the parts of the request the schema expects
    const objectToValidate = {}
    if (schema.shape.params) {
      objectToValidate.params = req.params
    }
    if (schema.shape.body) {
      objectToValidate.body = req.body
    }
    if (schema.shape.query) {
      objectToValidate.query = req.query
    }

    // Validate the request data
    const validatedData = schema.parse(objectToValidate)

    // Attach validated data to request for downstream use
    // This replaces req.body etc. with the potentially transformed/validated data
    Object.assign(req, validatedData)

    // Validation passed, proceed to the next middleware/controller
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
        'VALIDATION_ERROR',
        formattedErrors // Pass formatted errors in details
      )
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
