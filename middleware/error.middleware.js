/**
 * Error Handling Middleware
 * 
 * Purpose: Centralized error handling for the Express application
 * 
 * Features:
 * - Catch and format all errors
 * - Provide consistent error response structure
 * - Log errors for debugging
 * - Handle different error types (validation, not found, server errors)
 * 
 * Design Decision: Using a single error handler to ensure consistent
 * error responses across all endpoints.
 */

const kpiService = require('../services/kpi.service');

/**
 * Global error handling middleware
 * Must be defined with 4 parameters to be recognized as error handler
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Log error details
  console.error('[Error Handler] Error occurred:');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Determine error type
  let errorType = 'ServerError';
  if (statusCode === 400) errorType = 'ValidationError';
  if (statusCode === 401) errorType = 'AuthenticationError';
  if (statusCode === 403) errorType = 'AuthorizationError';
  if (statusCode === 404) errorType = 'NotFoundError';
  if (statusCode === 409) errorType = 'ConflictError';
  if (statusCode === 422) errorType = 'UnprocessableEntityError';

  // Build error response
  const errorResponse = {
    success: false,
    error: errorType,
    message: err.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Add stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = err.details || null;
  }

  // Log to KPI service
  kpiService.logRequest({
    endpoint: req.originalUrl,
    method: req.method,
    responseTime: 0,
    statusCode,
    riderId: req.riderId || 'N/A',
    action: 'ERROR',
    details: err.message
  });

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors and pass to error handler
 * 
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create custom error with status code
 * 
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} details - Additional error details
 * @returns {Error} Error object with status code
 */
const createError = (message, statusCode = 500, details = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
};

/**
 * Validation error handler
 * 
 * @param {string} message - Error message
 * @param {Object} details - Validation details
 * @returns {Error} Validation error
 */
const validationError = (message, details = null) => {
  return createError(message, 400, details);
};

/**
 * Not found error handler
 * 
 * @param {string} resource - Resource that was not found
 * @returns {Error} Not found error
 */
const notFoundError = (resource = 'Resource') => {
  return createError(`${resource} not found`, 404);
};

/**
 * Unauthorized error handler
 * 
 * @param {string} message - Error message
 * @returns {Error} Unauthorized error
 */
const unauthorizedError = (message = 'Unauthorized access') => {
  return createError(message, 401);
};

/**
 * Forbidden error handler
 * 
 * @param {string} message - Error message
 * @returns {Error} Forbidden error
 */
const forbiddenError = (message = 'Access forbidden') => {
  return createError(message, 403);
};

/**
 * Conflict error handler
 * 
 * @param {string} message - Error message
 * @returns {Error} Conflict error
 */
const conflictError = (message = 'Resource conflict') => {
  return createError(message, 409);
};

module.exports = {
  errorHandler,
  asyncHandler,
  createError,
  validationError,
  notFoundError,
  unauthorizedError,
  forbiddenError,
  conflictError
};
