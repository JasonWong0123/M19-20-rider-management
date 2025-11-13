/**
 * Orders Routes
 * 
 * Purpose: Define routes for order management endpoints
 * 
 * Features:
 * - Route definitions for all order-related endpoints
 * - Apply validators to routes
 * - Map routes to controller methods
 * 
 * Design Decision: Routes are organized by resource (orders) and follow
 * RESTful conventions where applicable.
 */

const express = require('express');
const router = express.Router();

// Import controllers
const ordersController = require('../controllers/orders.controller');

// Import validators
const {
  validateOrderStatus,
  validateOrderId,
  validateSearchQuery
} = require('../validators/orders.validators');

/**
 * @route   GET /api/rider/orders
 * @desc    Get orders filtered by status
 * @query   status - Order status (ongoing, completed, all)
 * @access  Public (should be protected in production)
 */
router.get('/orders', validateOrderStatus, ordersController.getOrders);

/**
 * @route   GET /api/rider/orders/statistics
 * @desc    Get order statistics (earnings, counts, etc.)
 * @access  Public (should be protected in production)
 * @note    This route must be defined before /order/:orderId to avoid conflict
 */
router.get('/orders/statistics', ordersController.getOrderStatistics);

/**
 * @route   GET /api/rider/orders/recent
 * @desc    Get recent orders
 * @query   limit - Number of orders to return (default: 10)
 * @access  Public (should be protected in production)
 */
router.get('/orders/recent', ordersController.getRecentOrders);

/**
 * @route   GET /api/rider/orders/search
 * @desc    Search orders by keyword
 * @query   query - Search keyword
 * @access  Public (should be protected in production)
 */
router.get('/orders/search', validateSearchQuery, ordersController.searchOrders);

/**
 * @route   GET /api/rider/order/:orderId
 * @desc    Get order details by ID
 * @param   orderId - Order ID
 * @access  Public (should be protected in production)
 */
router.get('/order/:orderId', validateOrderId, ordersController.getOrderById);

module.exports = router;
