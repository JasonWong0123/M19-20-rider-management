/**
 * Income Controller
 * 
 * Purpose: Handle HTTP requests for income and withdrawal endpoints
 * 
 * Features:
 * - Get real-time income data
 * - Get income trend charts
 * - Process withdrawal requests
 * - Get withdrawal records
 * 
 * Design Decision: Controllers focus on request/response handling,
 * delegating business logic to the income service.
 */

const incomeService = require('../services/income.service');
const kpiService = require('../services/kpi.service');
const { asyncHandler, notFoundError, validationError } = require('../middleware/error.middleware');

/**
 * Get real-time income data
 * GET /api/rider/income/realtime
 */
const getRealTimeIncome = asyncHandler(async (req, res) => {
  const startTime = Date.now();

  // Get real-time income from service
  const incomeData = incomeService.getRealTimeIncome();

  // Calculate response time
  const responseTime = Date.now() - startTime;

  // Log KPI
  kpiService.logRequest({
    endpoint: '/api/rider/income/realtime',
    method: 'GET',
    responseTime,
    statusCode: 200,
    riderId: 'rider_001',
    action: 'GET_REALTIME_INCOME',
    details: `availableBalance=${incomeData.availableBalance}`
  });

  // Send response
  res.status(200).json({
    success: true,
    data: incomeData,
    timestamp: new Date().toISOString()
  });
});

/**
 * Get income trend data for charts
 * GET /api/rider/income/trend?period=daily|weekly|monthly
 */
const getIncomeTrend = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { period } = req.query;

  // Get trend data from service
  const trendData = incomeService.getIncomeTrend(period);

  // Calculate response time
  const responseTime = Date.now() - startTime;

  // Log KPI
  kpiService.logRequest({
    endpoint: '/api/rider/income/trend',
    method: 'GET',
    responseTime,
    statusCode: 200,
    riderId: 'rider_001',
    action: 'GET_INCOME_TREND',
    details: `period=${period}`
  });

  // Send response
  res.status(200).json({
    success: true,
    data: trendData,
    timestamp: new Date().toISOString()
  });
});

/**
 * Submit withdrawal request
 * POST /api/rider/income/withdraw
 * Body: { amount: number, accountInfo: string }
 */
const submitWithdrawal = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { amount, accountInfo } = req.body;

  try {
    // Submit withdrawal through service
    const withdrawal = incomeService.submitWithdrawal(amount, accountInfo);

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Log KPI
    kpiService.logRequest({
      endpoint: '/api/rider/income/withdraw',
      method: 'POST',
      responseTime,
      statusCode: 201,
      riderId: 'rider_001',
      action: 'SUBMIT_WITHDRAWAL',
      details: `amount=${amount}, withdrawalId=${withdrawal.withdrawalId}`
    });

    // Send response
    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: withdrawal,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Handle specific errors (e.g., insufficient balance)
    throw validationError(error.message);
  }
});

/**
 * Get withdrawal records
 * GET /api/rider/income/records?status=all|pending|completed|rejected
 */
const getWithdrawalRecords = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { status } = req.query;

  // Get withdrawal records from service
  const records = incomeService.getWithdrawalRecords(status);

  // Calculate response time
  const responseTime = Date.now() - startTime;

  // Log KPI
  kpiService.logRequest({
    endpoint: '/api/rider/income/records',
    method: 'GET',
    responseTime,
    statusCode: 200,
    riderId: 'rider_001',
    action: 'GET_WITHDRAWAL_RECORDS',
    details: `status=${status}, count=${records.length}`
  });

  // Send response
  res.status(200).json({
    success: true,
    data: {
      status,
      count: records.length,
      records
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Update withdrawal status (Admin/Demo endpoint)
 * PUT /api/rider/income/withdraw/:withdrawalId
 * Body: { status: string, notes: string }
 */
const updateWithdrawalStatus = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { withdrawalId } = req.params;
  const { status, notes } = req.body;

  // Validate status
  const validStatuses = ['completed', 'rejected'];
  if (!validStatuses.includes(status)) {
    throw validationError(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  // Update withdrawal status through service
  const withdrawal = incomeService.updateWithdrawalStatus(withdrawalId, status, notes);

  if (!withdrawal) {
    throw notFoundError('Withdrawal request');
  }

  // Calculate response time
  const responseTime = Date.now() - startTime;

  // Log KPI
  kpiService.logRequest({
    endpoint: `/api/rider/income/withdraw/${withdrawalId}`,
    method: 'PUT',
    responseTime,
    statusCode: 200,
    riderId: 'rider_001',
    action: 'UPDATE_WITHDRAWAL_STATUS',
    details: `withdrawalId=${withdrawalId}, status=${status}`
  });

  // Send response
  res.status(200).json({
    success: true,
    message: 'Withdrawal status updated successfully',
    data: withdrawal,
    timestamp: new Date().toISOString()
  });
});

module.exports = {
  getRealTimeIncome,
  getIncomeTrend,
  submitWithdrawal,
  getWithdrawalRecords,
  updateWithdrawalStatus
};
