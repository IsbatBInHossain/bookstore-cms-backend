class ApiError extends Error {
  /**
   * Creates an instance of ApiError.
   * @param {number} statusCode - HTTP status code.
   * @param {string} message - Error message.
   * @param {boolean} [isOperational=true] - Indicates if the error is operational (expected) vs. a bug.
   * @param {string|null} [errorCode=null] - Optional application-specific error code.
   */
  constructor(statusCode, message, isOperational = true, errorCode = null) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.errorCode = errorCode
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = ApiError
