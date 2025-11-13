@echo off
echo ========================================
echo Docker Build Test Script
echo ========================================
echo.

echo Building Docker image locally...
docker build -t rider-backend-api-test .

if %errorlevel% neq 0 (
    echo ERROR: Docker build failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo Docker build successful!
echo ========================================
echo.

echo Testing the built image...
docker run --rm -d --name rider-test -p 3001:3000 rider-backend-api-test

timeout /t 5 /nobreak > nul

echo Testing API endpoint...
curl http://localhost:3001/api

echo.
echo Stopping test container...
docker stop rider-test

echo.
echo ========================================
echo Docker test completed successfully!
echo ========================================
pause
