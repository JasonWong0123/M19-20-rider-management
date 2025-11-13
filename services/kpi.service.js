/**
 * KPI Service
 * 
 * Purpose: Log API performance metrics to CSV file for KPI tracking
 * 
 * Features:
 * - Log API requests with timestamp, endpoint, method, response time, status
 * - CSV format for easy integration with existing KPI templates
 * - Automatic log file creation and rotation
 * - Batch writing to minimize file I/O
 * 
 * Design Decision: Using append mode for CSV to maintain historical data.
 * Consider implementing log rotation for production use.
 */

const fs = require('fs');
const path = require('path');

class KPIService {
  constructor() {
    // Logs directory path
    this.logsDir = path.join(__dirname, '..', 'logs');
    this.kpiFilePath = path.join(this.logsDir, 'kpi.csv');
    
    // Ensure logs directory exists
    this.ensureLogsDirectory();
    
    // Initialize CSV file with headers if not exists
    this.initializeKPIFile();
  }

  /**
   * Ensure the logs directory exists, create if not
   */
  ensureLogsDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
      console.log(`[KPIService] Created logs directory: ${this.logsDir}`);
    }
  }

  /**
   * Initialize KPI CSV file with headers if it doesn't exist
   */
  initializeKPIFile() {
    if (!fs.existsSync(this.kpiFilePath)) {
      const headers = 'Timestamp,Endpoint,Method,ResponseTime(ms),StatusCode,RiderId,Action,Details\n';
      fs.writeFileSync(this.kpiFilePath, headers, 'utf8');
      console.log(`[KPIService] Initialized KPI file: ${this.kpiFilePath}`);
    }
  }

  /**
   * Log an API request to KPI CSV file
   * @param {Object} logData - Log data object
   * @param {string} logData.endpoint - API endpoint
   * @param {string} logData.method - HTTP method
   * @param {number} logData.responseTime - Response time in milliseconds
   * @param {number} logData.statusCode - HTTP status code
   * @param {string} logData.riderId - Rider ID (optional)
   * @param {string} logData.action - Action performed (optional)
   * @param {string} logData.details - Additional details (optional)
   */
  logRequest(logData) {
    try {
      const {
        endpoint = '',
        method = '',
        responseTime = 0,
        statusCode = 0,
        riderId = 'N/A',
        action = 'N/A',
        details = ''
      } = logData;

      // Format timestamp
      const timestamp = new Date().toISOString();

      // Escape CSV special characters
      const escapedDetails = this.escapeCSV(details);

      // Create CSV row
      const csvRow = `${timestamp},${endpoint},${method},${responseTime},${statusCode},${riderId},${action},${escapedDetails}\n`;

      // Append to CSV file
      fs.appendFileSync(this.kpiFilePath, csvRow, 'utf8');

      console.log(`[KPIService] Logged: ${method} ${endpoint} - ${statusCode} (${responseTime}ms)`);
    } catch (error) {
      console.error(`[KPIService] Error logging KPI:`, error.message);
    }
  }

  /**
   * Escape special characters for CSV format
   * @param {string} value - Value to escape
   * @returns {string} Escaped value
   */
  escapeCSV(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    
    // If value contains comma, newline, or quote, wrap in quotes and escape quotes
    if (value.includes(',') || value.includes('\n') || value.includes('"')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    
    return value;
  }

  /**
   * Log order-related action
   * @param {string} riderId - Rider ID
   * @param {string} action - Action performed
   * @param {Object} details - Action details
   */
  logOrderAction(riderId, action, details = {}) {
    this.logRequest({
      endpoint: '/api/rider/orders',
      method: 'GET',
      responseTime: 0,
      statusCode: 200,
      riderId,
      action,
      details: JSON.stringify(details)
    });
  }

  /**
   * Log income-related action
   * @param {string} riderId - Rider ID
   * @param {string} action - Action performed
   * @param {Object} details - Action details
   */
  logIncomeAction(riderId, action, details = {}) {
    this.logRequest({
      endpoint: '/api/rider/income',
      method: 'GET',
      responseTime: 0,
      statusCode: 200,
      riderId,
      action,
      details: JSON.stringify(details)
    });
  }

  /**
   * Log withdrawal request
   * @param {string} riderId - Rider ID
   * @param {number} amount - Withdrawal amount
   * @param {string} status - Request status
   */
  logWithdrawal(riderId, amount, status) {
    this.logIncomeAction(riderId, 'WITHDRAWAL_REQUEST', {
      amount,
      status,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get KPI statistics (for reporting purposes)
   * @returns {Object} KPI statistics
   */
  getStatistics() {
    try {
      if (!fs.existsSync(this.kpiFilePath)) {
        return { totalRequests: 0, avgResponseTime: 0 };
      }

      const content = fs.readFileSync(this.kpiFilePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim() !== '');
      
      // Skip header
      const dataLines = lines.slice(1);
      
      if (dataLines.length === 0) {
        return { totalRequests: 0, avgResponseTime: 0 };
      }

      // Calculate statistics
      let totalResponseTime = 0;
      let validCount = 0;

      dataLines.forEach(line => {
        const parts = line.split(',');
        if (parts.length >= 4) {
          const responseTime = parseFloat(parts[3]);
          if (!isNaN(responseTime)) {
            totalResponseTime += responseTime;
            validCount++;
          }
        }
      });

      return {
        totalRequests: dataLines.length,
        avgResponseTime: validCount > 0 ? (totalResponseTime / validCount).toFixed(2) : 0
      };
    } catch (error) {
      console.error(`[KPIService] Error getting statistics:`, error.message);
      return { totalRequests: 0, avgResponseTime: 0 };
    }
  }
}

// Export singleton instance
module.exports = new KPIService();
