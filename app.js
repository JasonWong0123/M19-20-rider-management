/**
 * Express Application Configuration
 * 
 * Purpose: Configure Express application with middleware and routes
 * 
 * Features:
 * - Security middleware (helmet, cors)
 * - Request logging (morgan)
 * - JSON body parsing
 * - Route registration
 * - Error handling
 * - Optional Socket.IO support
 * 
 * Design Decision: Separate app configuration from server startup
 * for better testability and modularity.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Import routes
const ordersRoutes = require('./routes/orders.routes');
const incomeRoutes = require('./routes/income.routes');

// Import middleware
const { errorHandler } = require('./middleware/error.middleware');
const notFoundHandler = require('./middleware/notfound.middleware');

// Create Express app
const app = express();

// ============================================
// Security Middleware
// ============================================

// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet());

// Enable CORS for all routes
app.use(cors({
  origin: '*', // In production, specify allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ============================================
// Request Parsing Middleware
// ============================================

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// ============================================
// Logging Middleware
// ============================================

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create a write stream for access logs
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'app.log'),
  { flags: 'a' }
);

// Log HTTP requests
if (process.env.NODE_ENV === 'production') {
  // Production: log to file only
  app.use(morgan('combined', { stream: accessLogStream }));
} else {
  // Development: log to console and file
  app.use(morgan('dev'));
  app.use(morgan('combined', { stream: accessLogStream }));
}


// ============================================
// API Routes
// ============================================

// API base route
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Rider Backend API',
    version: '1.0.0',
    endpoints: {
      orders: '/api/rider/orders',
      income: '/api/rider/income'
    },
    documentation: 'See README.md for API documentation',
    timestamp: new Date().toISOString()
  });
});

// Register routes with /api/rider prefix
app.use('/api/rider', ordersRoutes);
app.use('/api/rider', incomeRoutes);

// ============================================
// Error Handling Middleware
// ============================================

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// ============================================
// Export App
// ============================================

module.exports = app;
