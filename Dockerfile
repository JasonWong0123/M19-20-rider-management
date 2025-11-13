# Rider Backend API - Dockerfile
# 
# Purpose: Containerize the Rider Backend API for deployment
# 
# Features:
# - Multi-stage build for optimized image size
# - Node.js 18 LTS base image
# - Non-root user for security
# - Health check configuration
# 
# Build: docker build -t rider-backend-api .
# Run: docker run -p 3000:3000 rider-backend-api

# ============================================
# Base Stage
# ============================================
FROM node:18-alpine AS base

# Set working directory
WORKDIR /usr/src/app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ============================================
# Production Stage
# ============================================
FROM node:18-alpine AS production

# Set working directory
WORKDIR /usr/src/app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy dependencies from base stage
COPY --from=base /usr/src/app/node_modules ./node_modules

# Copy application source code
COPY --chown=nodejs:nodejs . .

# Create necessary directories with proper permissions
RUN mkdir -p logs data && \
    chown -R nodejs:nodejs logs data

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production \
    PORT=3000

# Health check using API info endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]
