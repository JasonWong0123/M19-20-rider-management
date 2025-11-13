/**
 * Orders Controller
 * 
 * Purpose: Handle HTTP requests for order management endpoints
 * 
 * Features:
 * - Get orders by status (ongoing, completed)
 * - Get order details by ID
 * - Get order statistics
 * - Handle errors and send appropriate responses
 * 
 * Design Decision: Controllers are thin layers that delegate business logic
 * to service layer and handle HTTP-specific concerns.
 */

const ordersService = require('../services/orders.service');
const kpiService = require('../services/kpi.service');
const { asyncHandler, notFoundError } = require('../middleware/error.middleware');

/**
 * Get orders filtered by status
 * GET /api/rider/orders?status=ongoing|completed|all
 */
const getOrders = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { status } = req.query;

  // Get orders from service
  const orders = ordersService.getOrdersByStatus(status);

  // Calculate response time
  const responseTime = Date.now() - startTime;

  // Log KPI
  kpiService.logRequest({
    endpoint: '/api/rider/orders',
    method: 'GET',
    responseTime,
    statusCode: 200,
    riderId: 'rider_001',
    action: 'GET_ORDERS',
    details: `status=${status}, count=${orders.length}`
  });

  // Send response
  res.status(200).json({
    success: true,
    data: {
      status,
      count: orders.length,
      orders
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Get order details by ID
 * GET /api/rider/order/:orderId
 */
const getOrderById = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { orderId } = req.params;

  // Get order from service
  const order = ordersService.getOrderById(orderId);

  // Check if order exists
  if (!order) {
    throw notFoundError('Order');
  }

  // Calculate response time
  const responseTime = Date.now() - startTime;

  // Log KPI
  kpiService.logRequest({
    endpoint: `/api/rider/order/${orderId}`,
    method: 'GET',
    responseTime,
    statusCode: 200,
    riderId: 'rider_001',
    action: 'GET_ORDER_DETAIL',
    details: `orderId=${orderId}`
  });

  // Send response
  res.status(200).json({
    success: true,
    data: order,
    timestamp: new Date().toISOString()
  });
});

/**
 * Get order statistics
 * GET /api/rider/orders/statistics
 */
const getOrderStatistics = asyncHandler(async (req, res) => {
  const startTime = Date.now();

  // Get statistics from service
  const statistics = ordersService.getOrderStatistics();

  // Calculate response time
  const responseTime = Date.now() - startTime;

  // Log KPI
  kpiService.logRequest({
    endpoint: '/api/rider/orders/statistics',
    method: 'GET',
    responseTime,
    statusCode: 200,
    riderId: 'rider_001',
    action: 'GET_ORDER_STATISTICS',
    details: JSON.stringify(statistics)
  });

  // Send response
  res.status(200).json({
    success: true,
    data: statistics,
    timestamp: new Date().toISOString()
  });
});

/**
 * Get recent orders
 * GET /api/rider/orders/recent?limit=10
 */
const getRecentOrders = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const limit = parseInt(req.query.limit) || 10;

  // Get recent orders from service
  const orders = ordersService.getRecentOrders(limit);

  // Calculate response time
  const responseTime = Date.now() - startTime;

  // Log KPI
  kpiService.logRequest({
    endpoint: '/api/rider/orders/recent',
    method: 'GET',
    responseTime,
    statusCode: 200,
    riderId: 'rider_001',
    action: 'GET_RECENT_ORDERS',
    details: `limit=${limit}, count=${orders.length}`
  });

  // Send response
  res.status(200).json({
    success: true,
    data: {
      limit,
      count: orders.length,
      orders
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Search orders
 * GET /api/rider/orders/search?query=keyword
 */
const searchOrders = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { query } = req.query;

  // Search orders from service
  const orders = ordersService.searchOrders(query);

  // Calculate response time
  const responseTime = Date.now() - startTime;

  // Log KPI
  kpiService.logRequest({
    endpoint: '/api/rider/orders/search',
    method: 'GET',
    responseTime,
    statusCode: 200,
    riderId: 'rider_001',
    action: 'SEARCH_ORDERS',
    details: `query=${query}, count=${orders.length}`
  });

  // Send response
  res.status(200).json({
    success: true,
    data: {
      query,
      count: orders.length,
      orders
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = {
  getOrders,
  getOrderById,
  getOrderStatistics,
  getRecentOrders,
  searchOrders
};
