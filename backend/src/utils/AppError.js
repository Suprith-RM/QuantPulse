/**
 * AppError — Custom Error Class
 *
 * WHY WE NEED THIS:
 * JavaScript's built-in Error class has no statusCode property.
 * When we throw an error deep inside a service, the global error handler
 * needs to know whether to respond with 404, 401, 400, etc.
 * By attaching statusCode to every error we throw deliberately,
 * the error handler can send the right HTTP response automatically.
 *
 * isOperational = true means "this is an expected error, not a bug".
 * We handle these gracefully. isOperational = false means something
 * unexpected went wrong — log it loudly and alert developers.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    // Call parent Error constructor with message
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // Mark as an operational (expected) error, not a programming bug
    this.isOperational = true;
    // Capture stack trace, excluding AppError constructor itself from trace
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;