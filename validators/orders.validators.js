/**
 * Orders Validators
 * 
 * Purpose: Validate incoming requests for order-related endpoints
 * 
 * Features:
 * - Query parameter validation
 * - Path parameter validation
 * - Request body validation
 * - Custom validation rules
 * 
 * Design Decision: Using simple validation functions instead of external libraries
 * to minimize dependencies for demo purposes.
 */

/**
 * Validate order status query parameter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateOrderStatus = (req, res, next) => {
  const { status } = req.query;
  
  // If no status provided, default to 'all'
  if (!status) {
    req.query.status = 'all';
    return next();
  }

  // Valid status values
  const validStatuses = ['ongoing', 'completed', 'all'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status parameter',
      message: `Status must be one of: ${validStatuses.join(', ')}`,
      validValues: validStatuses
    });
  }

  next();
};

/**
 * Validate order ID parameter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateOrderId = (req, res, next) => {
  const { orderId } = req.params;
  
  if (!orderId) {
    return res.status(400).json({
      success: false,
      error: 'Missing order ID',
      message: 'Order ID is required'
    });
  }

  // Basic validation: order ID should not be empty and should be alphanumeric
  if (typeof orderId !== 'string' || orderId.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid order ID',
      message: 'Order ID must be a non-empty string'
    });
  }

  next();
};

/**
 * Validate date range query parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  // Both dates are optional, but if provided, must be valid
  if (startDate) {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid start date',
        message: 'Start date must be a valid ISO date string'
      });
    }
  }

  if (endDate) {
    const end = new Date(endDate);
    if (isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid end date',
        message: 'End date must be a valid ISO date string'
      });
    }
  }

  // If both provided, start date should be before end date
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date range',
        message: 'Start date must be before end date'
      });
    }
  }

  next();
};

/**
 * Validate search query parameter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateSearchQuery = (req, res, next) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({
      success: false,
      error: 'Missing search query',
      message: 'Search query parameter is required'
    });
  }

  if (typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid search query',
      message: 'Search query must be a non-empty string'
    });
  }

  // Minimum length for search query
  if (query.trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Search query too short',
      message: 'Search query must be at least 2 characters long'
    });
  }

  next();
};

/**
 * Validate pagination parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  
  // Set defaults if not provided
  req.query.page = page ? parseInt(page, 10) : 1;
  req.query.limit = limit ? parseInt(limit, 10) : 10;

  // Validate page number
  if (isNaN(req.query.page) || req.query.page < 1) {
    return res.status(400).json({
      success: false,
      error: 'Invalid page number',
      message: 'Page must be a positive integer'
    });
  }

  // Validate limit
  if (isNaN(req.query.limit) || req.query.limit < 1 || req.query.limit > 100) {
    return res.status(400).json({
      success: false,
      error: 'Invalid limit',
      message: 'Limit must be between 1 and 100'
    });
  }

  next();
};

module.exports = {
  validateOrderStatus,
  validateOrderId,
  validateDateRange,
  validateSearchQuery,
  validatePagination
};
