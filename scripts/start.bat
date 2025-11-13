@echo off
echo ========================================
echo M19 Rider Backend API - Startup Script
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available
    pause
    exit /b 1
)

echo npm version:
npm --version
echo.

REM Check if package.json exists
if not exist "package.json" (
    echo ERROR: package.json not found
    echo Make sure you're running this script from the project root directory
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file from template...
    copy ".env.example" ".env"
    echo Please review and update the .env file if needed
    echo.
)

REM Create data and logs directories
if not exist "data" mkdir data
if not exist "logs" mkdir logs

echo Starting Rider Backend API...
echo.
echo Server will be available at: http://localhost:3000
echo Health check: http://localhost:3000/health
echo API documentation: http://localhost:3000/api
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the server
npm start
