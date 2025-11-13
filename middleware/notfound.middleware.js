/**
 * Not Found Middleware
 * 
 * Purpose: Handle 404 errors for undefined routes
 * 
 * Features:
 * - Catch all undefined routes
 * - Provide helpful error message
 * - Log 404 errors for monitoring
 * 
 * Design Decision: This middleware should be registered after all route handlers
 * to catch any requests that don't match defined routes.
 */

const kpiService = require('../services/kpi.service');

/**
 * 404 Not Found handler
 * Catches all requests to undefined routes
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const notFoundHandler = (req, res, next) => {
  // Log the 404 error
  console.log(`[404] Route not found: ${req.method} ${req.originalUrl}`);

  // Log to KPI service
  kpiService.logRequest({
    endpoint: req.originalUrl,
    method: req.method,
    responseTime: 0,
    statusCode: 404,
    riderId: 'N/A',
    action: '404_NOT_FOUND',
    details: `Route not found: ${req.method} ${req.originalUrl}`
  });

  // Build 404 response
  const response = {
    success: false,
    error: 'NotFoundError',
    message: 'The requested resource was not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    suggestion: 'Please check the API documentation for available endpoints'
  };

  // Add available routes suggestion in development mode
  if (process.env.NODE_ENV === 'development') {
    response.availableEndpoints = [
      'GET /api/rider/orders?status=ongoing|completed',
      'GET /api/rider/order/:orderId',
      'GET /api/rider/orders/statistics',
      'GET /api/rider/income/realtime',
      'GET /api/rider/income/trend?period=daily|weekly|monthly',
      'POST /api/rider/income/withdraw',
      'GET /api/rider/income/records'
    ];
  }

  // Send 404 response
  res.status(404).json(response);
};

module.exports = notFoundHandler;
