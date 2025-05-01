/**
 * Sends a standardized success response.
 * @param {object} res - Express response object.
 * @param {number} statusCode - HTTP status code (e.g., 200, 201).
 * @param {string} message - Optional success message.
 * @param {*} [data=null] - Optional payload data.
 */
const sendSuccess = (
  res,
  statusCode,
  message = 'Operation successful',
  data = null
) => {
  const response = {
    success: true,
    message,
  }
  if (data != null) {
    response.data = data
  }
  res.status(statusCode).json(response)
}

/**
 * Sends a standardized error response.
 * @param {object} res - Express response object.
 * @param {number} statusCode - HTTP status code (e.g., 400, 404, 500).
 * @param {string} message - Error message.
 * @param {string} [errorCode=null] - Optional application-specific error code.
 * @param {*} [details=null] - Optional additional error details (e.g., validation errors).
 */
const sendError = (
  res,
  statusCode,
  message = 'An unexpected error occurred',
  errorCode = null,
  details = null
) => {
  const errorResponse = {
    success: false,
    error: {
      message: message,
    },
  }
  if (errorCode != null) errorResponse.error.code = errorCode
  if (details != null) errorResponse.details = details
  res.status(statusCode).json(errorResponse)
}

module.exports = {
  sendSuccess,
  sendError,
}
