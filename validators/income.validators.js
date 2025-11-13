/**
 * Income Validators
 * 
 * Purpose: Validate incoming requests for income-related endpoints
 * 
 * Features:
 * - Withdrawal request validation
 * - Period parameter validation
 * - Amount validation
 * - Account information validation
 * 
 * Design Decision: Using simple validation functions with clear error messages
 * to help API consumers understand validation requirements.
 */

/**
 * Validate income trend period parameter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateTrendPeriod = (req, res, next) => {
  const { period } = req.query;
  
  // If no period provided, default to 'daily'
  if (!period) {
    req.query.period = 'daily';
    return next();
  }

  // Valid period values
  const validPeriods = ['daily', 'weekly', 'monthly'];
  
  if (!validPeriods.includes(period)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid period parameter',
      message: `Period must be one of: ${validPeriods.join(', ')}`,
      validValues: validPeriods
    });
  }

  next();
};

/**
 * Validate withdrawal request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateWithdrawalRequest = (req, res, next) => {
  const { amount, accountInfo } = req.body;
  
  // Validate amount is provided
  if (amount === undefined || amount === null) {
    return res.status(400).json({
      success: false,
      error: 'Missing amount',
      message: 'Withdrawal amount is required'
    });
  }

  // Validate amount is a number
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid amount',
      message: 'Amount must be a valid number'
    });
  }

  // Validate amount is positive
  if (numericAmount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid amount',
      message: 'Amount must be greater than 0'
    });
  }

  // Validate amount has at most 2 decimal places
  if (!isValidDecimalPlaces(numericAmount, 2)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid amount format',
      message: 'Amount must have at most 2 decimal places'
    });
  }

  // Validate minimum withdrawal amount (e.g., $10)
  const minWithdrawal = 10;
  if (numericAmount < minWithdrawal) {
    return res.status(400).json({
      success: false,
      error: 'Amount too low',
      message: `Minimum withdrawal amount is $${minWithdrawal}`
    });
  }

  // Validate maximum withdrawal amount (e.g., $10,000)
  const maxWithdrawal = 10000;
  if (numericAmount > maxWithdrawal) {
    return res.status(400).json({
      success: false,
      error: 'Amount too high',
      message: `Maximum withdrawal amount is $${maxWithdrawal}`
    });
  }

  // Account info is optional but if provided, should be a string
  if (accountInfo !== undefined && typeof accountInfo !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid account info',
      message: 'Account info must be a string'
    });
  }

  // Normalize amount to 2 decimal places
  req.body.amount = parseFloat(numericAmount.toFixed(2));

  next();
};

/**
 * Validate withdrawal status filter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateWithdrawalStatus = (req, res, next) => {
  const { status } = req.query;
  
  // If no status provided, default to 'all'
  if (!status) {
    req.query.status = 'all';
    return next();
  }

  // Valid status values
  const validStatuses = ['all', 'pending', 'completed', 'rejected'];
  
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
 * Validate withdrawal ID parameter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateWithdrawalId = (req, res, next) => {
  const { withdrawalId } = req.params;
  
  if (!withdrawalId) {
    return res.status(400).json({
      success: false,
      error: 'Missing withdrawal ID',
      message: 'Withdrawal ID is required'
    });
  }

  if (typeof withdrawalId !== 'string' || withdrawalId.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid withdrawal ID',
      message: 'Withdrawal ID must be a non-empty string'
    });
  }

  next();
};

/**
 * Validate date range for income queries
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateIncomeDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;
  
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

// Helper functions

/**
 * Check if a number has valid decimal places
 * @param {number} num - Number to check
 * @param {number} maxDecimals - Maximum allowed decimal places
 * @returns {boolean} True if valid
 */
function isValidDecimalPlaces(num, maxDecimals) {
  const decimalPart = num.toString().split('.')[1];
  if (!decimalPart) return true;
  return decimalPart.length <= maxDecimals;
}

module.exports = {
  validateTrendPeriod,
  validateWithdrawalRequest,
  validateWithdrawalStatus,
  validateWithdrawalId,
  validateIncomeDateRange
};
