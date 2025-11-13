# Quick Start Guide - M19 Rider Backend API

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Postman (optional, for API testing)
- Docker (optional, for containerized deployment)

## Installation Steps

### 1. Install Dependencies
```bash
cd M19-rider-management
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development
API_PREFIX=/api
DATA_DIR=./data
LOGS_DIR=./logs
ENABLE_SOCKET_IO=false
```

### 3. Start the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start at `http://localhost:3000`

### 4. Verify Installation
Open your browser or use curl:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Rider Backend API is running",
  "timestamp": "2025-11-13T05:00:00.000Z",
  "uptime": 10.5,
  "environment": "development"
}
```

## Testing with Postman

### Import Collection
1. Open Postman
2. Click **Import** button
3. Select `postman/rider-api.postman_collection.json`
4. Set environment variable `baseUrl` to `http://localhost:3000`

### Test Endpoints

**Get Ongoing Orders:**
```
GET http://localhost:3000/api/rider/orders?status=ongoing
```

**Get Real-time Income:**
```
GET http://localhost:3000/api/rider/income/realtime
```

**Submit Withdrawal:**
```
POST http://localhost:3000/api/rider/income/withdraw
Content-Type: application/json

{
  "amount": 50.00,
  "accountInfo": "Bank Account: **** 1234"
}
```

## Docker Deployment

### Build Docker Image
```bash
docker build -t rider-backend-api .
```

### Run Container
```bash
docker run -p 3000:3000 rider-backend-api
```

### Using Docker Compose (Optional)
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  rider-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - ./data:/usr/src/app/data
      - ./logs:/usr/src/app/logs
```

Run with:
```bash
docker-compose up -d
```

## API Endpoints Overview

### M19 - Order Management
- `GET /api/rider/orders?status=ongoing|completed` - Get orders by status
- `GET /api/rider/order/:orderId` - Get order details
- `GET /api/rider/orders/statistics` - Get order statistics

### M20 - Income Statistics
- `GET /api/rider/income/realtime` - Get real-time income
- `GET /api/rider/income/trend?period=daily|weekly|monthly` - Get income trend
- `POST /api/rider/income/withdraw` - Submit withdrawal request
- `GET /api/rider/income/records` - Get withdrawal records

## Data Files

### Mock Data Location
- Orders: `data/rider.orders.json`
- Income: `data/rider.income.json`

### Log Files
- Application logs: `logs/app.log`
- KPI tracking: `logs/kpi.csv`

## Troubleshooting

### Port Already in Use
Change the port in `.env` file:
```env
PORT=3001
```

### Missing Dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### Data Files Not Found
The application will create default data files on first run. If issues persist, check file permissions.

### Docker Build Fails
Ensure Docker is running and you have sufficient disk space:
```bash
docker system prune -a
```

## Next Steps

1. **Integrate with Frontend**: Use the API endpoints in your rider mobile app
2. **Add Authentication**: Implement JWT or OAuth for production
3. **Database Integration**: Replace JSON files with PostgreSQL/MongoDB
4. **Deploy to Cloud**: Use the GitHub Actions workflow to deploy to cloud platforms
5. **Monitor Performance**: Set up monitoring with the KPI CSV logs

## Support

For issues or questions:
- Check the main `README.md` for detailed documentation
- Review API responses for error messages
- Check `logs/app.log` for server errors
- Verify data files in `data/` directory

## GitHub Repository Setup

### Initialize Git
```bash
git init
git add .
git commit -m "Initial commit: Rider Backend API"
```

### Push to GitHub
```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

The GitHub Actions workflow will automatically build and push Docker images on every push to main.

---

**Happy Coding! 🚀**
