/**
 * Orders Service
 * 
 * Purpose: Business logic for rider order management
 * 
 * Features:
 * - Retrieve orders by status (ongoing, completed)
 * - Get order details by ID
 * - Calculate order statistics
 * - Filter and sort orders
 * 
 * Design Decision: All order data is stored in rider.orders.json.
 * Orders are filtered in-memory for demo purposes.
 */

const dataStore = require('./data.store');
const kpiService = require('./kpi.service');

class OrdersService {
  constructor() {
    this.dataFile = 'rider.orders.json';
    this.riderId = 'rider_001'; // Default rider ID for demo
  }

  /**
   * Get all orders for a rider
   * @returns {Array} Array of orders
   */
  getAllOrders() {
    const data = dataStore.read(this.dataFile, { orders: [] });
    return data.orders || [];
  }

  /**
   * Get orders filtered by status
   * @param {string} status - Order status (ongoing, completed, all)
   * @returns {Array} Filtered orders
   */
  getOrdersByStatus(status = 'all') {
    const orders = this.getAllOrders();
    
    if (status === 'all') {
      return orders;
    }

    // Filter by status
    const filteredOrders = orders.filter(order => {
      if (status === 'ongoing') {
        return ['assigned', 'picked_up', 'in_transit'].includes(order.status);
      } else if (status === 'completed') {
        return ['delivered', 'cancelled'].includes(order.status);
      }
      return false;
    });

    // Log KPI
    kpiService.logOrderAction(this.riderId, 'VIEW_ORDERS', {
      status,
      count: filteredOrders.length
    });

    return filteredOrders;
  }

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @returns {Object|null} Order object or null if not found
   */
  getOrderById(orderId) {
    const orders = this.getAllOrders();
    const order = orders.find(o => o.orderId === orderId);

    if (order) {
      // Log KPI
      kpiService.logOrderAction(this.riderId, 'VIEW_ORDER_DETAIL', {
        orderId,
        status: order.status
      });
    }

    return order || null;
  }

  /**
   * Get order statistics for the rider
   * @returns {Object} Statistics object
   */
  getOrderStatistics() {
    const orders = this.getAllOrders();
    
    // Calculate statistics
    const stats = {
      total: orders.length,
      ongoing: 0,
      completed: 0,
      cancelled: 0,
      totalEarnings: 0,
      todayEarnings: 0,
      todayOrders: 0
    };

    const today = new Date().toISOString().split('T')[0];

    orders.forEach(order => {
      // Count by status
      if (['assigned', 'picked_up', 'in_transit'].includes(order.status)) {
        stats.ongoing++;
      } else if (order.status === 'delivered') {
        stats.completed++;
        stats.totalEarnings += order.deliveryFee || 0;
      } else if (order.status === 'cancelled') {
        stats.cancelled++;
      }

      // Today's statistics
      const orderDate = order.deliveredAt || order.createdAt;
      if (orderDate && orderDate.startsWith(today)) {
        stats.todayOrders++;
        if (order.status === 'delivered') {
          stats.todayEarnings += order.deliveryFee || 0;
        }
      }
    });

    // Round earnings to 2 decimal places
    stats.totalEarnings = parseFloat(stats.totalEarnings.toFixed(2));
    stats.todayEarnings = parseFloat(stats.todayEarnings.toFixed(2));

    // Log KPI
    kpiService.logOrderAction(this.riderId, 'VIEW_STATISTICS', stats);

    return stats;
  }

  /**
   * Update order status (for demo purposes)
   * @param {string} orderId - Order ID
   * @param {string} newStatus - New status
   * @returns {Object|null} Updated order or null if not found
   */
  updateOrderStatus(orderId, newStatus) {
    const data = dataStore.read(this.dataFile, { orders: [] });
    const orders = data.orders || [];
    
    const orderIndex = orders.findIndex(o => o.orderId === orderId);
    
    if (orderIndex === -1) {
      return null;
    }

    // Update status and timestamp
    orders[orderIndex].status = newStatus;
    orders[orderIndex].updatedAt = new Date().toISOString();

    if (newStatus === 'delivered') {
      orders[orderIndex].deliveredAt = new Date().toISOString();
    }

    // Save to file
    dataStore.write(this.dataFile, { orders });

    // Log KPI
    kpiService.logOrderAction(this.riderId, 'UPDATE_ORDER_STATUS', {
      orderId,
      newStatus
    });

    return orders[orderIndex];
  }

  /**
   * Get recent orders (last N orders)
   * @param {number} limit - Number of orders to return
   * @returns {Array} Recent orders
   */
  getRecentOrders(limit = 10) {
    const orders = this.getAllOrders();
    
    // Sort by creation date (newest first)
    const sortedOrders = orders.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return sortedOrders.slice(0, limit);
  }

  /**
   * Search orders by customer name or order ID
   * @param {string} query - Search query
   * @returns {Array} Matching orders
   */
  searchOrders(query) {
    const orders = this.getAllOrders();
    const lowerQuery = query.toLowerCase();

    return orders.filter(order => {
      return (
        order.orderId.toLowerCase().includes(lowerQuery) ||
        order.customerName.toLowerCase().includes(lowerQuery) ||
        order.pickupAddress.toLowerCase().includes(lowerQuery) ||
        order.deliveryAddress.toLowerCase().includes(lowerQuery)
      );
    });
  }

  /**
   * Get orders by date range
   * @param {string} startDate - Start date (ISO format)
   * @param {string} endDate - End date (ISO format)
   * @returns {Array} Orders within date range
   */
  getOrdersByDateRange(startDate, endDate) {
    const orders = this.getAllOrders();
    const start = new Date(startDate);
    const end = new Date(endDate);

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= start && orderDate <= end;
    });
  }
}

// Export singleton instance
module.exports = new OrdersService();
