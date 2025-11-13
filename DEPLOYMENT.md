# Deployment Guide - M19 Rider Backend API

## Overview
This guide covers different deployment options for the Rider Backend API system.

## Prerequisites
- Docker installed
- GitHub account (for CI/CD)
- Basic knowledge of containerization

---

## Local Development Deployment

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd M19-rider-management
npm install
```

### 2. Environment Configuration
Create `.env` file:
```env
PORT=3000
NODE_ENV=development
ENABLE_SOCKET_IO=false
```

### 3. Start Development Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### 4. Verify Deployment
```bash
# Run API tests
node test/api.test.js

# Manual check
curl http://localhost:3000/health
```

---

## Docker Deployment

### 1. Build Docker Image
```bash
# Build image
docker build -t rider-backend-api .

# Verify image
docker images | grep rider-backend-api
```

### 2. Run Container
```bash
# Run container
docker run -d \
  --name rider-api \
  -p 3000:3000 \
  -v $(pwd)/data:/usr/src/app/data \
  -v $(pwd)/logs:/usr/src/app/logs \
  rider-backend-api

# Check container status
docker ps
docker logs rider-api
```

### 3. Docker Compose (Recommended)
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
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Optional: Add nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - rider-api
    restart: unless-stopped
```

Deploy with Docker Compose:
```bash
docker-compose up -d
docker-compose logs -f
```

---

## Cloud Deployment Options

### 1. GitHub Container Registry (Automated)

The project includes GitHub Actions workflow that automatically:
- Builds Docker image on push to main branch
- Pushes to GitHub Container Registry (ghcr.io)
- Tags with commit SHA and 'latest'

**Setup:**
1. Push code to GitHub repository
2. GitHub Actions will automatically build and push image
3. Pull and run the image:

```bash
# Pull latest image
docker pull ghcr.io/your-username/m19-rider-management/rider-backend-api:latest

# Run container
docker run -d \
  --name rider-api-prod \
  -p 3000:3000 \
  ghcr.io/your-username/m19-rider-management/rider-backend-api:latest
```

### 2. AWS ECS Deployment

**Task Definition (task-definition.json):**
```json
{
  "family": "rider-backend-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "rider-api",
      "image": "ghcr.io/your-username/m19-rider-management/rider-backend-api:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/rider-backend-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

**Deploy to ECS:**
```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster your-cluster \
  --service-name rider-backend-api \
  --task-definition rider-backend-api:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

### 3. Google Cloud Run

**Deploy to Cloud Run:**
```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT-ID/rider-backend-api

# Deploy to Cloud Run
gcloud run deploy rider-backend-api \
  --image gcr.io/PROJECT-ID/rider-backend-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10
```

### 4. Azure Container Instances

```bash
# Create resource group
az group create --name rider-api-rg --location eastus

# Deploy container
az container create \
  --resource-group rider-api-rg \
  --name rider-backend-api \
  --image ghcr.io/your-username/m19-rider-management/rider-backend-api:latest \
  --dns-name-label rider-api-unique \
  --ports 3000 \
  --environment-variables NODE_ENV=production PORT=3000
```

---

## Production Considerations

### 1. Environment Variables
```env
# Production .env
NODE_ENV=production
PORT=3000

# Security
API_KEY_SECRET=your-secret-key
JWT_SECRET=your-jwt-secret

# Database (when migrating from JSON files)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Monitoring
LOG_LEVEL=info
ENABLE_METRICS=true
```

### 2. Nginx Reverse Proxy
Create `nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream rider_api {
        server rider-api:3000;
    }

    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://rider_api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /health {
            proxy_pass http://rider_api/health;
            access_log off;
        }
    }
}
```

### 3. SSL/TLS Configuration
```bash
# Using Let's Encrypt with Certbot
certbot --nginx -d your-domain.com
```

### 4. Monitoring and Logging

**Add to docker-compose.yml:**
```yaml
services:
  # ... existing services

  # Log aggregation
  fluentd:
    image: fluent/fluentd:v1.14-1
    volumes:
      - ./fluentd.conf:/fluentd/etc/fluent.conf
      - ./logs:/var/log/rider-api

  # Metrics collection
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  # Visualization
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

---

## Scaling Considerations

### 1. Horizontal Scaling
```yaml
# docker-compose.yml
services:
  rider-api:
    # ... existing config
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
```

### 2. Load Balancing
```yaml
  nginx:
    # ... existing config
    depends_on:
      - rider-api
    deploy:
      replicas: 1
```

### 3. Database Migration
When ready to move from JSON files to a database:

```javascript
// Add to package.json
"dependencies": {
  "pg": "^8.8.0",
  "mongoose": "^6.7.0"
}
```

---

## Troubleshooting

### Common Issues

**1. Container Won't Start**
```bash
# Check logs
docker logs rider-api

# Check container status
docker inspect rider-api
```

**2. Port Already in Use**
```bash
# Find process using port
lsof -i :3000
netstat -tulpn | grep 3000

# Kill process
kill -9 <PID>
```

**3. Permission Issues**
```bash
# Fix file permissions
chmod -R 755 data logs
chown -R node:node data logs
```

**4. Memory Issues**
```bash
# Increase container memory
docker run --memory=1g rider-backend-api
```

### Health Checks

**Container Health:**
```bash
# Check container health
docker exec rider-api curl http://localhost:3000/health

# Check application logs
docker exec rider-api tail -f logs/app.log
```

**API Health:**
```bash
# External health check
curl -f http://your-domain.com/health || exit 1
```

---

## Maintenance

### 1. Updates
```bash
# Pull latest image
docker pull ghcr.io/your-username/m19-rider-management/rider-backend-api:latest

# Rolling update
docker-compose up -d --no-deps rider-api
```

### 2. Backup
```bash
# Backup data and logs
tar -czf backup-$(date +%Y%m%d).tar.gz data/ logs/

# Automated backup script
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

### 3. Monitoring
```bash
# Check resource usage
docker stats rider-api

# Check application metrics
curl http://localhost:3000/api/rider/orders/statistics
```

---

## Security Checklist

- [ ] Use non-root user in container
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Implement rate limiting
- [ ] Add authentication/authorization
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities
- [ ] Backup encryption

---

**For support, check the main README.md or create an issue in the GitHub repository.**
