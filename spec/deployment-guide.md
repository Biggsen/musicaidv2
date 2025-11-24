# Deployment Guide

## Overview

This document provides comprehensive instructions for deploying the MusicAid application to various cloud platforms, including environment setup, database configuration, file storage, and ongoing maintenance.

## Cloud Platform Options

### Platform Comparison

| Platform          | Strengths                                      | Best For                          | Pricing Model  |
| ----------------- | ---------------------------------------------- | --------------------------------- | -------------- |
| **AWS**           | Full-featured, mature, extensive services      | Enterprise, scalable applications | Pay-as-you-go  |
| **Google Cloud**  | Strong ML/AI services, modern infrastructure   | Data-intensive applications       | Pay-as-you-go  |
| **Azure**         | Great Microsoft integration, hybrid cloud      | Enterprise .NET applications      | Pay-as-you-go  |
| **Digital Ocean** | Simple, cost-effective, developer-friendly     | Small to medium applications      | Fixed pricing  |
| **Railway**       | Modern, simple deployment, integrated services | Rapid prototyping, startups       | Usage-based    |
| **Render**        | Easy deployment, automatic scaling             | Simple web applications           | Freemium model |
| **Fly.io**        | Global deployment, modern architecture         | Global applications               | Usage-based    |
| **Heroku**        | Simple deployment, extensive add-ons           | Rapid development                 | Dyno-based     |

### Required Services

**Core Infrastructure**:

- **Compute**: Application hosting (containers, serverless, or VMs)
- **Database**: Managed PostgreSQL (or compatible relational database)
- **Object Storage**: S3-compatible file storage for audio/images
- **CDN**: Content delivery network for global performance
- **Load Balancer**: High availability and traffic distribution

**Optional Services**:

- **Cache**: Redis for session storage and caching
- **Monitoring**: Application performance and error tracking
- **Email**: SMTP service for notifications and password resets
- **Backup**: Automated database and file backups

## Prerequisites

### Required Accounts

- Cloud platform account (AWS, Google Cloud, Azure, etc.)
- Git repository hosting (GitHub, GitLab, Bitbucket)
- Domain registrar (optional, for custom domain)
- Email service provider (optional, for transactional emails)

### Local Development Setup

```bash
# Required tools (choose based on your tech stack)
node --version     # Node.js 18+ (if using Node.js)
python --version   # Python 3.8+ (if using Python)
docker --version   # Docker for containerization
git --version      # Git for version control

# Cloud CLI tools (install as needed)
aws --version      # AWS CLI
gcloud --version   # Google Cloud CLI
az --version       # Azure CLI
doctl --version    # Digital Ocean CLI
```

## Environment Configuration

### Environment Variables

**Database Configuration**:

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database
DATABASE_SSL=true
DATABASE_POOL_SIZE=20

# Redis (optional)
REDIS_URL=redis://username:password@host:port
```

**Authentication & Security**:

```env
# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
SESSION_SECRET=your-session-secret-key
BCRYPT_ROUNDS=12

# Application
APP_ENV=production
APP_DEBUG=false
APP_LOG_LEVEL=info
```

**File Storage**:

```env
# S3-Compatible Storage
STORAGE_ENDPOINT=https://s3.amazonaws.com
STORAGE_REGION=us-east-1
STORAGE_ACCESS_KEY=your-access-key
STORAGE_SECRET_KEY=your-secret-key
STORAGE_BUCKET=musicaid-files
STORAGE_CDN_URL=https://cdn.example.com
```

**External Services**:

```env
# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_ADDRESS=noreply@musicaid.com

# Monitoring (optional)
SENTRY_DSN=https://your-sentry-dsn
ANALYTICS_ID=your-analytics-id
```

## Platform-Specific Deployment

### AWS Deployment

#### Option 1: Elastic Beanstalk (Managed Platform)

```bash
# Install EB CLI
pip install awsebcli

# Initialize application
eb init musicaid

# Create environment
eb create production

# Deploy application
eb deploy
```

#### Option 2: ECS (Containerized)

```yaml
# docker-compose.yml for local development
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - database

  database:
    image: postgres:15
    environment:
      POSTGRES_DB: musicaid
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
# Build and push to ECR
aws ecr create-repository --repository-name musicaid
docker build -t musicaid .
docker tag musicaid:latest 123456789.dkr.ecr.region.amazonaws.com/musicaid:latest
docker push 123456789.dkr.ecr.region.amazonaws.com/musicaid:latest

# Deploy with ECS CLI or CloudFormation
ecs-cli compose --project-name musicaid service up
```

#### AWS Infrastructure Setup

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier musicaid-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password your-password \
  --allocated-storage 20

# Create S3 bucket
aws s3 mb s3://musicaid-files-prod

# Set up CloudFront CDN
aws cloudfront create-distribution --distribution-config file://cdn-config.json
```

### Google Cloud Deployment

#### App Engine (Managed Platform)

```yaml
# app.yaml
runtime: nodejs18 # or python39, etc.
instance_class: F2

env_variables:
  DATABASE_URL: postgresql://user:pass@/musicaid?host=/cloudsql/project:region:instance
  JWT_SECRET: your-jwt-secret

automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.6
```

```bash
# Deploy to App Engine
gcloud app deploy

# Deploy database
gcloud sql instances create musicaid-db \
  --database-version=POSTGRES_13 \
  --tier=db-f1-micro \
  --region=us-central1
```

#### Cloud Run (Containerized)

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/project-id/musicaid
gcloud run deploy musicaid \
  --image gcr.io/project-id/musicaid \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure Deployment

#### App Service

```bash
# Create resource group
az group create --name musicaid-rg --location eastus

# Create App Service plan
az appservice plan create \
  --name musicaid-plan \
  --resource-group musicaid-rg \
  --sku B1 \
  --is-linux

# Create web app
az webapp create \
  --resource-group musicaid-rg \
  --plan musicaid-plan \
  --name musicaid-app \
  --runtime "NODE|18-lts"  # or PYTHON|3.9, etc.

# Configure app settings
az webapp config appsettings set \
  --resource-group musicaid-rg \
  --name musicaid-app \
  --settings DATABASE_URL="your-connection-string"
```

### Digital Ocean Deployment

#### App Platform

```yaml
# .do/app.yaml
name: musicaid
services:
  - name: web
    source_dir: /
    github:
      repo: your-username/musicaid
      branch: main
    run_command: npm start # or python app.py, etc.
    environment_slug: node-js # or python, etc.
    instance_count: 1
    instance_size_slug: basic-xxs
    routes:
      - path: /
    envs:
      - key: DATABASE_URL
        scope: RUN_TIME
        value: ${DATABASE_URL}

databases:
  - name: musicaid-db
    engine: PG
    version: '13'
    size: db-s-dev-database

static_sites:
  - name: frontend
    source_dir: /frontend/build
    github:
      repo: your-username/musicaid
      branch: main
    build_command: npm run build
```

```bash
# Deploy using doctl
doctl apps create --spec .do/app.yaml
```

### Railway Deployment

```toml
# railway.toml
[build]
builder = "nixpacks"  # Auto-detects your stack

[deploy]
restartPolicyType = "ON_FAILURE"
replicas = 1

[[services]]
name = "musicaid"
source = "."

[services.healthcheck]
path = "/health"
port = 3000
```

```bash
# Deploy with Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up
```

## Database Setup

### PostgreSQL Configuration

#### Production Database Settings

```sql
-- Recommended PostgreSQL settings for production
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- Enable query statistics
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Create application user
CREATE USER musicaid_app WITH ENCRYPTED PASSWORD 'secure-password';
GRANT CONNECT ON DATABASE musicaid TO musicaid_app;
GRANT USAGE ON SCHEMA public TO musicaid_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO musicaid_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO musicaid_app;
```

#### Database Migration Scripts

```bash
# Example migration commands for different frameworks

# Prisma (Node.js)
npx prisma migrate deploy

# Django (Python)
python manage.py migrate

# Rails (Ruby)
rails db:migrate RAILS_ENV=production

# Flyway (Java)
flyway -url=jdbc:postgresql://host:port/db -user=user migrate

# Liquibase (Multi-platform)
liquibase update
```

### Database Backup Strategy

```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATABASE_URL="postgresql://user:pass@host:port/musicaid"

# Create backup
pg_dump $DATABASE_URL > $BACKUP_DIR/musicaid_backup_$TIMESTAMP.sql

# Compress backup
gzip $BACKUP_DIR/musicaid_backup_$TIMESTAMP.sql

# Upload to cloud storage
aws s3 cp $BACKUP_DIR/musicaid_backup_$TIMESTAMP.sql.gz s3://musicaid-backups/

# Keep only last 30 days of backups
find $BACKUP_DIR -name "musicaid_backup_*.sql.gz" -mtime +30 -delete
```

## File Storage Configuration

### S3-Compatible Storage Setup

#### AWS S3

```bash
# Create bucket with versioning
aws s3 mb s3://musicaid-files-prod
aws s3api put-bucket-versioning \
  --bucket musicaid-files-prod \
  --versioning-configuration Status=Enabled

# Set up bucket policy for public read access to CDN
aws s3api put-bucket-policy \
  --bucket musicaid-files-prod \
  --policy file://bucket-policy.json
```

#### CORS Configuration

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://yourdomain.com"],
      "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### CDN Configuration

#### CloudFront (AWS)

```json
{
  "Origins": [
    {
      "Id": "musicaid-files",
      "DomainName": "musicaid-files-prod.s3.amazonaws.com",
      "S3OriginConfig": {
        "OriginAccessIdentity": ""
      }
    }
  ],
  "DefaultCacheBehavior": {
    "TargetOriginId": "musicaid-files",
    "ViewerProtocolPolicy": "redirect-to-https",
    "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
  }
}
```

## SSL/TLS Configuration

### Certificate Setup

#### Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Auto-renewal cron job
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

#### Cloud Platform Managed Certificates

```bash
# AWS Certificate Manager
aws acm request-certificate \
  --domain-name yourdomain.com \
  --subject-alternative-names www.yourdomain.com \
  --validation-method DNS

# Google Cloud SSL
gcloud compute ssl-certificates create musicaid-ssl \
  --domains yourdomain.com,www.yourdomain.com

# Azure App Service
az webapp config ssl bind \
  --resource-group musicaid-rg \
  --name musicaid-app \
  --certificate-thumbprint thumbprint \
  --ssl-type SNI
```

## Monitoring and Logging

### Application Monitoring

#### Health Check Endpoint

```javascript
// Express.js example
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await db.raw('SELECT 1')

    // Check storage connection
    await storage.headBucket()

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    })
  }
})
```

#### Error Tracking

```bash
# Sentry setup (example)
npm install @sentry/node
# OR
pip install sentry-sdk
```

```javascript
// Initialize Sentry
const Sentry = require('@sentry/node')
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

### Log Management

#### Structured Logging

```javascript
// Winston (Node.js) example
const winston = require('winston')

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})
```

## Performance Optimization

### Caching Strategy

#### Application-Level Caching

```javascript
// Redis caching example
const redis = require('redis')
const client = redis.createClient(process.env.REDIS_URL)

async function getCachedData(key) {
  const cached = await client.get(key)
  if (cached) {
    return JSON.parse(cached)
  }
  return null
}

async function setCachedData(key, data, expiration = 3600) {
  await client.setex(key, expiration, JSON.stringify(data))
}
```

#### Database Query Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_tracks_artist_status ON tracks(artist_id, track_status_id);
CREATE INDEX idx_notes_track_created ON notes(track_id, created_at);
CREATE INDEX idx_audios_track_category ON audios(track_id, category);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM tracks WHERE artist_id = $1;
```

### CDN and Static Asset Optimization

#### Asset Compression

```bash
# Enable gzip compression (Nginx example)
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types
  text/plain
  text/css
  text/xml
  text/javascript
  application/javascript
  application/json
  application/xml+rss
  application/atom+xml
  image/svg+xml;
```

## Security Configuration

### Security Headers

```javascript
// Express.js security middleware
const helmet = require('helmet')

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", 'https://cdn.yourdomain.com'],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
)
```

### Rate Limiting

```javascript
// Express rate limiting
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
})

app.use('/api/', limiter)
```

## CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      # AWS deployment
      - name: Deploy to AWS
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          aws s3 sync ./build s3://musicaid-frontend
          aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"

      # Or Railway deployment
      - name: Deploy to Railway
        uses: railway-app/railway-deploy@v1
        with:
          service: musicaid
          token: ${{ secrets.RAILWAY_TOKEN }}
```

## Maintenance and Updates

### Automated Backups

```bash
# Cron job for daily backups
0 2 * * * /usr/local/bin/backup-database.sh >> /var/log/backup.log 2>&1
```

### Security Updates

```bash
# Security monitoring script
#!/bin/bash

# Update system packages (Ubuntu/Debian)
sudo apt update && sudo apt upgrade -y

# Update Node.js dependencies
npm audit fix

# Update Python dependencies
pip-audit --fix

# Restart services if needed
sudo systemctl restart musicaid
```

### Performance Monitoring

```javascript
// Basic performance metrics collection
const performanceMetrics = {
  responseTime: [],
  memoryUsage: [],
  cpuUsage: [],

  collect() {
    this.memoryUsage.push(process.memoryUsage())
    // Add CPU monitoring, database query times, etc.
  },

  getAverages() {
    // Calculate and return performance averages
  },
}

// Collect metrics every minute
setInterval(() => performanceMetrics.collect(), 60000)
```

## Troubleshooting Guide

### Common Issues

#### Database Connection Issues

```bash
# Check database connectivity
telnet db-host 5432

# Test database connection
psql -h db-host -U username -d database -c "SELECT 1;"

# Check connection pool
# Monitor active connections vs. pool size
```

#### File Upload Issues

```bash
# Check storage permissions
aws s3api head-bucket --bucket your-bucket

# Test file upload
curl -X POST -F "file=@test.jpg" https://your-api.com/api/upload/test
```

#### Performance Issues

```sql
-- Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Check database locks
SELECT * FROM pg_locks WHERE NOT granted;
```

### Emergency Procedures

#### Rollback Deployment

```bash
# Git rollback
git revert HEAD
git push origin main

# Database rollback (if needed)
pg_restore --clean --if-exists -d musicaid backup_file.sql

# Application rollback (platform-specific)
eb deploy --version-label previous-version  # Elastic Beanstalk
gcloud app deploy --version previous        # App Engine
```

This deployment guide provides a comprehensive, technology-agnostic approach to deploying the MusicAid application on various cloud platforms while ensuring security, performance, and maintainability.
