class ApiError extends Error {
  /**
   * Creates an instance of ApiError.
   * @param {number} statusCode - HTTP status code.
   * @param {string} message - Error message.
   * @param {boolean} [isOperational=true] - Indicates if the error is operational (expected) vs. a bug.
   * @param {string} [errorCode=null] - Optional application-specific error code.
   * @param {string} [stack=''] - Optional error stack trace.
   */
  constructor(
    statusCode,
    message,
    isOperational = true,
    errorCode = null,
    stack = ''
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational // Helps distinguish known errors from bugs
    this.errorCode = errorCode
    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor) // Capture stack trace automatically
    }
  }
}

module.exports = ApiError
