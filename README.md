# M19 Rider Management Backend API

## Overview
Backend API system for the Rider subsystem, providing order management and income statistics functionality.

## Features
- **M19 Order Management**: View ongoing orders, historical orders, order details, income statistics, and withdrawal
- **M20 Income Statistics**: Real-time income, trend charts, withdrawal requests, and withdrawal records
- **JSON File Storage**: In-memory + JSON file persistence for demo purposes
- **KPI Logging**: CSV file output for KPI tracking
- **Socket.IO Support**: Optional real-time updates (can be disabled for polling-based approach)
- **Docker Ready**: Containerized deployment with GitHub Actions CI/CD

## Tech Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Real-time**: Socket.IO (optional)
- **Storage**: JSON files + in-memory cache
- **Logging**: Morgan + Custom CSV KPI logger

## Project Structure
```
root/
  ├── app.js                          # Express application configuration
  ├── server.js                       # Server entry point
  ├── routes/
  │   ├── orders.routes.js           # Order management routes
  │   └── income.routes.js           # Income statistics routes
  ├── controllers/
  │   ├── orders.controller.js       # Order management controller
  │   └── income.controller.js       # Income statistics controller
  ├── services/
  │   ├── data.store.js              # JSON file read/write utility
  │   ├── orders.service.js          # Order business logic
  │   ├── income.service.js          # Income business logic
  │   └── kpi.service.js             # CSV KPI output utility
  ├── validators/
  │   ├── orders.validators.js       # Order request validators
  │   └── income.validators.js       # Income request validators
  ├── middleware/
  │   ├── error.middleware.js        # Error handling middleware
  │   └── notfound.middleware.js     # 404 handler middleware
  ├── logs/
  │   ├── app.log                    # Application logs
  │   └── kpi.csv                    # KPI tracking logs
  ├── data/
  │   ├── rider.orders.json          # Order data storage
  │   └── rider.income.json          # Income data storage
  ├── postman/
  │   └── rider-api.postman_collection.json  # Postman test collection
  ├── .github/
  │   └── workflows/
  │       └── docker-build.yml       # GitHub Actions workflow
  ├── Dockerfile                      # Docker configuration
  ├── package.json                    # Dependencies
  └── README.md                       # Documentation
```

## Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd M19-rider-management

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start the server
npm start

# Or for development with auto-reload
npm run dev
```

## API Endpoints

### M19 Order Management

#### Get Orders by Status
```
GET /api/rider/orders?status=ongoing
GET /api/rider/orders?status=completed
```

#### Get Order Details
```
GET /api/rider/order/:orderId
```

#### Get Order Statistics
```
GET /api/rider/orders/statistics
```

### M20 Income Statistics

#### Get Real-time Income
```
GET /api/rider/income/realtime
```

#### Get Income Trend
```
GET /api/rider/income/trend?period=daily|weekly|monthly
```

#### Submit Withdrawal Request
```
POST /api/rider/income/withdraw
Content-Type: application/json

{
  "amount": 200,
  "accountInfo": "Bank Account Details"
}
```

#### Get Withdrawal Records
```
GET /api/rider/income/records
```

## Docker Deployment

### Build Docker Image
```bash
docker build -t rider-backend-api .
```

### Run Docker Container
```bash
docker run -p 3000:3000 rider-backend-api
```

## GitHub Actions CI/CD
The project includes a GitHub Actions workflow that automatically builds and pushes Docker images to GitHub Container Registry on every push to the main branch.

## Testing with Postman
Import the Postman collection from `postman/rider-api.postman_collection.json` and set the `baseUrl` variable to your server URL (e.g., `http://localhost:3000`).

## KPI Logging
KPI data is automatically logged to `logs/kpi.csv` for all API requests, including:
- Timestamp
- Endpoint
- Method
- Response time
- Status code
- User/Rider ID

## License
MIT
