/**
 * Server Entry Point
 * 
 * Purpose: Start the Express server and optionally Socket.IO
 * 
 * Features:
 * - Load environment variables
 * - Start HTTP server
 * - Optional Socket.IO initialization
 * - Graceful shutdown handling
 * 
 * Design Decision: Separate server startup from app configuration
 * to allow for testing and different deployment scenarios.
 */

require('dotenv').config();
const http = require('http');
const app = require('./app');

// ============================================
// Configuration
// ============================================

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const ENABLE_SOCKET_IO = process.env.ENABLE_SOCKET_IO === 'true';

// ============================================
// Create HTTP Server
// ============================================

const server = http.createServer(app);

// ============================================
// Socket.IO Setup (Optional)
// ============================================

if (ENABLE_SOCKET_IO) {
  const { Server } = require('socket.io');
  
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Socket.IO connection handler
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join rider-specific room
    socket.on('join-rider', (riderId) => {
      socket.join(`rider-${riderId}`);
      console.log(`[Socket.IO] Rider ${riderId} joined room`);
      
      socket.emit('joined', {
        message: 'Successfully joined rider room',
        riderId
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });

    // Example: Emit real-time order updates
    // This would be triggered by order status changes in production
    socket.on('request-income-update', (riderId) => {
      const incomeService = require('./services/income.service');
      const incomeData = incomeService.getRealTimeIncome();
      
      socket.emit('income-update', incomeData);
    });
  });

  // Make io available to the app
  app.set('io', io);

  console.log('[Socket.IO] Real-time updates enabled');
} else {
  console.log('[Socket.IO] Real-time updates disabled (using polling mode)');
}

// ============================================
// Start Server
// ============================================

server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 Rider Backend API Server Started');
  console.log('='.repeat(50));
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Port: ${PORT}`);
  console.log(`Server URL: http://localhost:${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
  console.log(`API Base: http://localhost:${PORT}/api`);
  console.log('='.repeat(50));
  console.log('Available Endpoints:');
  console.log('  GET  /api/rider/orders?status=ongoing|completed');
  console.log('  GET  /api/rider/order/:orderId');
  console.log('  GET  /api/rider/orders/statistics');
  console.log('  GET  /api/rider/income/realtime');
  console.log('  GET  /api/rider/income/trend?period=daily|weekly|monthly');
  console.log('  POST /api/rider/income/withdraw');
  console.log('  GET  /api/rider/income/records');
  console.log('='.repeat(50));
});

// ============================================
// Graceful Shutdown
// ============================================

const gracefulShutdown = (signal) => {
  console.log(`\n[${signal}] Shutting down gracefully...`);
  
  server.close(() => {
    console.log('[Server] HTTP server closed');
    
    // Close database connections, cleanup resources, etc.
    console.log('[Server] Cleanup completed');
    
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('[Server] Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

module.exports = server;
