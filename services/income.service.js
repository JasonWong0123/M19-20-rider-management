/**
 * Income Service
 * 
 * Purpose: Business logic for rider income management and statistics
 * 
 * Features:
 * - Real-time income calculation
 * - Income trend analysis (daily, weekly, monthly)
 * - Withdrawal request processing
 * - Withdrawal history tracking
 * 
 * Design Decision: Income data is calculated from orders and stored withdrawals.
 * Withdrawal records are persisted in rider.income.json.
 */

const dataStore = require('./data.store');
const ordersService = require('./orders.service');
const kpiService = require('./kpi.service');

class IncomeService {
  constructor() {
    this.dataFile = 'rider.income.json';
    this.riderId = 'rider_001'; // Default rider ID for demo
  }

  /**
   * Get income data structure
   * @returns {Object} Income data with withdrawals array
   */
  getIncomeData() {
    return dataStore.read(this.dataFile, {
      riderId: this.riderId,
      withdrawals: [],
      totalWithdrawn: 0,
      availableBalance: 0,
      lastUpdated: new Date().toISOString()
    });
  }

  /**
   * Calculate real-time income from orders
   * @returns {Object} Real-time income data
   */
  getRealTimeIncome() {
    const orders = ordersService.getAllOrders();
    const incomeData = this.getIncomeData();

    // Calculate total earnings from delivered orders
    let totalEarnings = 0;
    let todayEarnings = 0;
    let weekEarnings = 0;
    let monthEarnings = 0;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    orders.forEach(order => {
      if (order.status === 'delivered') {
        const earnings = order.deliveryFee || 0;
        totalEarnings += earnings;

        const orderDate = new Date(order.deliveredAt || order.createdAt);
        
        // Today's earnings
        if (order.deliveredAt && order.deliveredAt.startsWith(today)) {
          todayEarnings += earnings;
        }

        // Week's earnings
        if (orderDate >= weekAgo) {
          weekEarnings += earnings;
        }

        // Month's earnings
        if (orderDate >= monthAgo) {
          monthEarnings += earnings;
        }
      }
    });

    // Calculate available balance (total earnings - withdrawn)
    const availableBalance = totalEarnings - incomeData.totalWithdrawn;

    const result = {
      riderId: this.riderId,
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      todayEarnings: parseFloat(todayEarnings.toFixed(2)),
      weekEarnings: parseFloat(weekEarnings.toFixed(2)),
      monthEarnings: parseFloat(monthEarnings.toFixed(2)),
      totalWithdrawn: parseFloat(incomeData.totalWithdrawn.toFixed(2)),
      availableBalance: parseFloat(availableBalance.toFixed(2)),
      pendingWithdrawals: this.getPendingWithdrawalsCount(),
      lastUpdated: new Date().toISOString()
    };

    // Log KPI
    kpiService.logIncomeAction(this.riderId, 'VIEW_REALTIME_INCOME', {
      availableBalance: result.availableBalance,
      todayEarnings: result.todayEarnings
    });

    return result;
  }

  /**
   * Get income trend data for charts
   * @param {string} period - Period type (daily, weekly, monthly)
   * @returns {Object} Trend data with labels and values
   */
  getIncomeTrend(period = 'daily') {
    const orders = ordersService.getAllOrders();
    const trendData = {
      period,
      labels: [],
      earnings: [],
      orderCounts: []
    };

    // Filter delivered orders
    const deliveredOrders = orders.filter(o => o.status === 'delivered');

    if (period === 'daily') {
      // Last 7 days
      trendData.labels = this.getLast7Days();
      trendData.earnings = new Array(7).fill(0);
      trendData.orderCounts = new Array(7).fill(0);

      deliveredOrders.forEach(order => {
        const orderDate = (order.deliveredAt || order.createdAt).split('T')[0];
        const index = trendData.labels.indexOf(orderDate);
        if (index !== -1) {
          trendData.earnings[index] += order.deliveryFee || 0;
          trendData.orderCounts[index]++;
        }
      });

    } else if (period === 'weekly') {
      // Last 4 weeks
      trendData.labels = this.getLast4Weeks();
      trendData.earnings = new Array(4).fill(0);
      trendData.orderCounts = new Array(4).fill(0);

      deliveredOrders.forEach(order => {
        const orderDate = new Date(order.deliveredAt || order.createdAt);
        const weekIndex = this.getWeekIndex(orderDate);
        if (weekIndex !== -1 && weekIndex < 4) {
          trendData.earnings[weekIndex] += order.deliveryFee || 0;
          trendData.orderCounts[weekIndex]++;
        }
      });

    } else if (period === 'monthly') {
      // Last 6 months
      trendData.labels = this.getLast6Months();
      trendData.earnings = new Array(6).fill(0);
      trendData.orderCounts = new Array(6).fill(0);

      deliveredOrders.forEach(order => {
        const orderDate = order.deliveredAt || order.createdAt;
        const monthLabel = orderDate.substring(0, 7); // YYYY-MM
        const index = trendData.labels.indexOf(monthLabel);
        if (index !== -1) {
          trendData.earnings[index] += order.deliveryFee || 0;
          trendData.orderCounts[index]++;
        }
      });
    }

    // Round earnings to 2 decimal places
    trendData.earnings = trendData.earnings.map(e => parseFloat(e.toFixed(2)));

    // Log KPI
    kpiService.logIncomeAction(this.riderId, 'VIEW_INCOME_TREND', { period });

    return trendData;
  }

  /**
   * Submit a withdrawal request
   * @param {number} amount - Withdrawal amount
   * @param {string} accountInfo - Account information
   * @returns {Object} Withdrawal record
   */
  submitWithdrawal(amount, accountInfo = '') {
    const incomeData = this.getIncomeData();
    const realTimeIncome = this.getRealTimeIncome();

    // Validate amount
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be greater than 0');
    }

    if (amount > realTimeIncome.availableBalance) {
      throw new Error('Insufficient balance for withdrawal');
    }

    // Create withdrawal record
    const withdrawal = {
      withdrawalId: `WD${Date.now()}`,
      riderId: this.riderId,
      amount: parseFloat(amount.toFixed(2)),
      accountInfo,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      processedAt: null,
      notes: ''
    };

    // Add to withdrawals array
    incomeData.withdrawals.push(withdrawal);

    // Update total withdrawn (will be updated when status becomes 'completed')
    // For now, keep it as pending

    // Save to file
    incomeData.lastUpdated = new Date().toISOString();
    dataStore.write(this.dataFile, incomeData);

    // Log KPI
    kpiService.logWithdrawal(this.riderId, amount, 'pending');

    return withdrawal;
  }

  /**
   * Get withdrawal records
   * @param {string} status - Filter by status (all, pending, completed, rejected)
   * @returns {Array} Withdrawal records
   */
  getWithdrawalRecords(status = 'all') {
    const incomeData = this.getIncomeData();
    let withdrawals = incomeData.withdrawals || [];

    if (status !== 'all') {
      withdrawals = withdrawals.filter(w => w.status === status);
    }

    // Sort by request date (newest first)
    withdrawals.sort((a, b) => {
      return new Date(b.requestedAt) - new Date(a.requestedAt);
    });

    // Log KPI
    kpiService.logIncomeAction(this.riderId, 'VIEW_WITHDRAWAL_RECORDS', {
      status,
      count: withdrawals.length
    });

    return withdrawals;
  }

  /**
   * Update withdrawal status (for admin/demo purposes)
   * @param {string} withdrawalId - Withdrawal ID
   * @param {string} newStatus - New status (completed, rejected)
   * @param {string} notes - Processing notes
   * @returns {Object|null} Updated withdrawal or null
   */
  updateWithdrawalStatus(withdrawalId, newStatus, notes = '') {
    const incomeData = this.getIncomeData();
    const withdrawalIndex = incomeData.withdrawals.findIndex(
      w => w.withdrawalId === withdrawalId
    );

    if (withdrawalIndex === -1) {
      return null;
    }

    const withdrawal = incomeData.withdrawals[withdrawalIndex];
    withdrawal.status = newStatus;
    withdrawal.processedAt = new Date().toISOString();
    withdrawal.notes = notes;

    // Update total withdrawn if completed
    if (newStatus === 'completed') {
      incomeData.totalWithdrawn += withdrawal.amount;
    }

    // Save to file
    incomeData.lastUpdated = new Date().toISOString();
    dataStore.write(this.dataFile, incomeData);

    // Log KPI
    kpiService.logWithdrawal(this.riderId, withdrawal.amount, newStatus);

    return withdrawal;
  }

  /**
   * Get count of pending withdrawals
   * @returns {number} Count of pending withdrawals
   */
  getPendingWithdrawalsCount() {
    const incomeData = this.getIncomeData();
    return incomeData.withdrawals.filter(w => w.status === 'pending').length;
  }

  // Helper methods for trend calculation

  getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  }

  getLast4Weeks() {
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      weeks.push(`Week ${4 - i}`);
    }
    return weeks;
  }

  getWeekIndex(date) {
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weekIndex = Math.floor(diffDays / 7);
    return weekIndex;
  }

  getLast6Months() {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push(date.toISOString().substring(0, 7));
    }
    return months;
  }
}

// Export singleton instance
module.exports = new IncomeService();
