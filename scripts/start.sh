#!/bin/bash

echo "========================================"
echo "M19 Rider Backend API - Startup Script"
echo "========================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "Node.js version:"
node --version
echo

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not available"
    exit 1
fi

echo "npm version:"
npm --version
echo

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found"
    echo "Make sure you're running this script from the project root directory"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies"
        exit 1
    fi
    echo
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "Please review and update the .env file if needed"
    echo
fi

# Create data and logs directories
mkdir -p data logs

echo "Starting Rider Backend API..."
echo
echo "Server will be available at: http://localhost:3000"
echo "Health check: http://localhost:3000/health"
echo "API documentation: http://localhost:3000/api"
echo
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo

# Start the server
npm start
