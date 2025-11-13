#!/bin/bash

echo "========================================"
echo "Docker Build Test Script"
echo "========================================"
echo

echo "Building Docker image locally..."
docker build -t rider-backend-api-test .

if [ $? -ne 0 ]; then
    echo "ERROR: Docker build failed"
    exit 1
fi

echo
echo "========================================"
echo "Docker build successful!"
echo "========================================"
echo

echo "Testing the built image..."
docker run --rm -d --name rider-test -p 3001:3000 rider-backend-api-test

sleep 5

echo "Testing API endpoint..."
curl http://localhost:3001/api

echo
echo "Stopping test container..."
docker stop rider-test

echo
echo "========================================"
echo "Docker test completed successfully!"
echo "========================================"
