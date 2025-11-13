/**
 * Income Routes
 * 
 * Purpose: Define routes for income and withdrawal endpoints
 * 
 * Features:
 * - Route definitions for income statistics
 * - Withdrawal request and record management
 * - Apply validators to routes
 * 
 * Design Decision: Separate income routes from orders for better organization
 * and maintainability.
 */

const express = require('express');
const router = express.Router();

// Import controllers
const incomeController = require('../controllers/income.controller');

// Import validators
const {
  validateTrendPeriod,
  validateWithdrawalRequest,
  validateWithdrawalStatus,
  validateWithdrawalId
} = require('../validators/income.validators');

/**
 * @route   GET /api/rider/income/realtime
 * @desc    Get real-time income data
 * @access  Public (should be protected in production)
 */
router.get('/income/realtime', incomeController.getRealTimeIncome);

/**
 * @route   GET /api/rider/income/trend
 * @desc    Get income trend data for charts
 * @query   period - Time period (daily, weekly, monthly)
 * @access  Public (should be protected in production)
 */
router.get('/income/trend', validateTrendPeriod, incomeController.getIncomeTrend);

/**
 * @route   POST /api/rider/income/withdraw
 * @desc    Submit a withdrawal request
 * @body    amount - Withdrawal amount (required)
 * @body    accountInfo - Account information (optional)
 * @access  Public (should be protected in production)
 */
router.post('/income/withdraw', validateWithdrawalRequest, incomeController.submitWithdrawal);

/**
 * @route   GET /api/rider/income/records
 * @desc    Get withdrawal records
 * @query   status - Filter by status (all, pending, completed, rejected)
 * @access  Public (should be protected in production)
 */
router.get('/income/records', validateWithdrawalStatus, incomeController.getWithdrawalRecords);

/**
 * @route   PUT /api/rider/income/withdraw/:withdrawalId
 * @desc    Update withdrawal status (Admin/Demo endpoint)
 * @param   withdrawalId - Withdrawal ID
 * @body    status - New status (completed, rejected)
 * @body    notes - Processing notes (optional)
 * @access  Admin (for demo purposes, this is public)
 */
router.put('/income/withdraw/:withdrawalId', validateWithdrawalId, incomeController.updateWithdrawalStatus);

module.exports = router;
