/**
 * Standardized API Response Utility
 *
 * WHY WE NEED THIS:
 * Without a standard, every route might return data differently.
 * Frontend developers (including future you) would have to write
 * different parsing logic for every endpoint. By having a standard
 * shape, the frontend can trust that every response follows the same
 * structure.
 *
 * Our standard response shape:
 * {
 *   success: boolean,
 *   data: any | null,       ← The actual payload
 *   message: string | null, ← Human-readable description
 *   meta: object | null,    ← Pagination, counts, etc.
 * }
 */

const sendSuccess = (res, data = null, message = null, statusCode = 200, meta = null) => {
  const response = { success: true };

  if (data !== null) response.data = data;
  if (message !== null) response.message = message;
  if (meta !== null) response.meta = meta;

  return res.status(statusCode).json(response);
};

const sendError = (res, message = 'Internal server error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors !== null) response.errors = errors;

  return res.status(statusCode).json(response);
};

const sendCreated = (res, data, message = 'Resource created successfully') => {
  return sendSuccess(res, data, message, 201);
};

const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(res, message, 404);
};

const sendUnauthorized = (res, message = 'Authentication required') => {
  return sendError(res, message, 401);
};

const sendForbidden = (res, message = 'Permission denied') => {
  return sendError(res, message, 403);
};

const sendValidationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors, // Array of field-specific errors
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendCreated,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendValidationError,
};