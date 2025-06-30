# Deployment Guide

## Overview

This document provides comprehensive instructions for deploying the MusicAid application to various cloud platforms, including environment setup, database configuration, file storage, and ongoing maintenance.

## Prerequisites

### Platform Options
- **Railway**: Simple deployment with integrated PostgreSQL and file storage
- **Digital Ocean App Platform**: Cost-effective with managed databases
- **AWS**: Full-featured with comprehensive services (EC2, RDS, S3)
- **Render**: Simple deployment with free tiers
- **Netlify**: Good for static sites with serverless functions
- **Fly.io**: Modern platform with global deployment

### Required Accounts
- **Hosting Platform Account**: Railway, Digital Ocean, AWS, etc.
- **GitHub Account**: For code repository and CI/CD
- **Domain Provider**: For custom domain (optional)
- **Database Provider**: If not using platform's managed database

### Local Development Setup
```bash
# Node.js version
node --version  # Should be 18.x or higher

# Package manager
npm --version   # or yarn/pnpm

# Git
git --version
```

## Project Setup

### 1. Repository Setup
```bash
# Clone or create repository
git clone https://github.com/your-username/musicaid-v2.git
cd musicaid-v2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### 2. Environment Variables
Create `.env.local` for local development:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/musicaid_dev"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# File Storage (S3-compatible)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_NAME="musicaid-files"

# Email (optional, for password reset)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

## Railway Deployment

### 1. Create Railway Project
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

### 2. Database Setup
```bash
# Add PostgreSQL database
railway add postgresql

# Get database URL
railway variables
```

### 3. Environment Variables
```bash
# Set environment variables
railway variables set NEXTAUTH_SECRET=your-secret-key
railway variables set NEXTAUTH_URL=https://your-app.railway.app
railway variables set AWS_ACCESS_KEY_ID=your-key
railway variables set AWS_SECRET_ACCESS_KEY=your-secret
railway variables set S3_BUCKET_NAME=your-bucket
```

## Digital Ocean App Platform

### 1. Create App
1. Go to Digital Ocean Control Panel
2. Create new App
3. Connect GitHub repository
4. Configure build settings:
   - Build Command: `npm run build`
   - Run Command: `npm start`

### 2. Database Setup
1. Create Managed PostgreSQL Database
2. Add database to app
3. Configure DATABASE_URL environment variable

### 3. File Storage Setup
1. Create Spaces (S3-compatible) bucket
2. Generate access keys
3. Configure S3 environment variables

## Environment Configuration

### Production Environment Variables
Set these in your platform's dashboard or via CLI:

```env
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# NextAuth.js
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret-key

# File Storage
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket-name

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Environment Variable Management
Platform-specific commands:

```bash
# Railway
railway variables set VARIABLE_NAME=value
railway variables

# Digital Ocean
# Set via dashboard or doctl CLI
doctl apps create-deployment --spec app.yaml

# AWS
aws ssm put-parameter --name "/app/VARIABLE_NAME" --value "value"
```

## Database Migration

### 1. Run Migrations
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### 2. Database Management
```bash
# View database in browser
npx prisma studio

# Reset database (development only)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name migration_name
```

## Deployment Process

### 1. Automatic Deployment
Most platforms support automatic deployment via Git hooks:

```bash
# Push to main branch triggers deployment
git add .
git commit -m "Your commit message"
git push origin main

# Platform automatically builds and deploys
```

### 2. Manual Deployment
```bash
# Platform-specific deployment commands
railway up              # Railway
render deploy           # Render
aws deploy              # AWS
eb deploy              # Elastic Beanstalk
```

### 3. Preview Deployments
Many platforms support preview deployments for pull requests:
- Railway: Automatic PR deployments
- Render: Preview environments
- Netlify: Deploy previews

## Custom Domain Setup

### 1. DNS Configuration
```bash
# Add CNAME record pointing to your platform
# Example for Railway:
# CNAME www your-app.railway.app

# Add A record for apex domain (if supported)
# A @ platform-ip-address
```

### 2. Platform-Specific Setup
Different platforms have different domain setup processes:

**Railway:**
```bash
railway domain add your-domain.com
```

**Digital Ocean:**
1. Go to App settings
2. Add custom domain
3. Configure DNS records

**AWS/Elastic Beanstalk:**
1. Configure Route 53 or external DNS
2. Set up SSL certificate via ACM

### 3. SSL Certificate
Most platforms provide automatic SSL certificates via Let's Encrypt.

## Performance Optimization

### 1. Build Optimization
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    domains: ['your-s3-bucket.s3.amazonaws.com'],
  },
  // Enable compression
  compress: true,
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
  },
}

module.exports = nextConfig
```

### 2. Caching Configuration
```javascript
// app/api/artists/route.ts
export async function GET() {
  const artists = await getArtists();
  
  return Response.json(artists, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  });
}
```

### 3. Database Optimization
```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Monitoring and Analytics

### 1. Analytics Options
```bash
# Google Analytics
npm install @next/third-parties

# PostHog (open source)
npm install posthog-js

# Plausible Analytics
npm install next-plausible
```

#### Google Analytics Setup
```tsx
// app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <GoogleAnalytics gaId="GA_MEASUREMENT_ID" />
      </body>
    </html>
  )
}
```

### 2. Performance Monitoring
```bash
# Web Vitals monitoring
npm install web-vitals
```

```tsx
// lib/vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export function reportWebVitals() {
  getCLS(console.log)
  getFID(console.log)
  getFCP(console.log)
  getLCP(console.log)
  getTTFB(console.log)
}
```

### 3. Error Monitoring
```bash
# Optional: Add Sentry for error tracking
npm install @sentry/nextjs

# Configure Sentry
# sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

## Security Configuration

### 1. Environment Security
```bash
# Ensure sensitive data is not in repository
echo ".env*" >> .gitignore
echo "!.env.example" >> .gitignore

# Use platform's secret management
# Platform-specific commands for environment variables
```

### 2. Headers Configuration
```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}
```

### 3. CORS Configuration
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Add CORS headers
  const response = NextResponse.next()
  
  response.headers.set('Access-Control-Allow-Origin', 'https://your-domain.com')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  return response
}
```

## Backup and Recovery

### 1. Database Backups
```bash
# Automatic backups may be included with managed database services
# Manual backup
pg_dump $DATABASE_URL > backup.sql

# Restore from backup
psql $DATABASE_URL < backup.sql
```

### 2. Code Backups
```bash
# Ensure code is backed up to GitHub
git remote -v
git push origin main

# Tag releases
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### 3. File Storage Backups
```typescript
// scripts/backup-files.ts
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'

async function backupFiles() {
  const s3 = new S3Client({ region: process.env.AWS_REGION })
  const command = new ListObjectsV2Command({
    Bucket: process.env.S3_BUCKET_NAME
  })
  
  const response = await s3.send(command)
  
  for (const object of response.Contents || []) {
    // Download and backup each file
    const fileResponse = await fetch(`https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${object.Key}`)
    const buffer = await fileResponse.arrayBuffer()
    // Save to backup location
  }
}
```

## Maintenance and Updates

### 1. Dependency Updates
```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Update Next.js
npm install next@latest

# Update Prisma
npm install prisma@latest @prisma/client@latest
npx prisma generate
```

### 2. Database Maintenance
```bash
# Run new migrations
npx prisma migrate deploy

# Optimize database (if needed)
npx prisma db execute --file optimize.sql
```

### 3. Performance Monitoring
```bash
# Check build times
npm run build

# Analyze bundle size
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build
```

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check build logs (platform-specific)
# Railway: railway logs
# Render: render logs
# AWS: aws logs describe-log-groups

# Common fixes:
# - Check environment variables
# - Verify dependencies
# - Check TypeScript errors
```

#### 2. Database Connection Issues
```bash
# Test database connection
npx prisma db pull

# Check connection string format
# Should be: postgresql://username:password@host:port/database
```

#### 3. File Upload Issues
```bash
# Verify S3 credentials
echo $AWS_ACCESS_KEY_ID
echo $S3_BUCKET_NAME

# Test S3 upload
node scripts/test-s3-upload.js
```

#### 4. Authentication Issues
```bash
# Check NextAuth configuration
# Verify NEXTAUTH_URL matches deployment URL
# Ensure NEXTAUTH_SECRET is set
```

### Debug Mode
```bash
# Enable debug mode (platform-specific)
# Set DEBUG environment variable to "nextauth*"

# Check logs (platform-specific)
# Railway: railway logs --follow
# Render: render logs --follow
# AWS: aws logs tail
```

## Scaling Considerations

### 1. Database Scaling
- Monitor connection pool usage
- Consider read replicas for high traffic
- Implement query optimization

### 2. File Storage Scaling
- Monitor file storage usage
- Implement file compression
- Consider CDN for global distribution

### 3. Application Scaling
- Most platforms automatically scale serverless functions
- Monitor function execution time
- Optimize cold start performance

## Cost Optimization

### 1. Monitor Usage
```bash
# Check current usage (platform-specific)
# Railway: railway usage
# AWS: aws cloudwatch get-metric-statistics
# Digital Ocean: doctl monitoring
```

### 2. Optimize Costs
- Use appropriate function memory settings
- Implement efficient caching
- Monitor file storage usage
- Optimize database queries

### 3. Set Alerts
- Configure usage alerts in platform dashboard
- Monitor function execution time
- Track database connection usage

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Performance testing completed
- [ ] Security review completed

### Deployment
- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] Deploy to production
- [ ] Verify all functionality
- [ ] Monitor for errors

### Post-Deployment
- [ ] Monitor application performance
- [ ] Check error rates
- [ ] Verify user workflows
- [ ] Update documentation
- [ ] Notify stakeholders

This deployment guide provides a comprehensive approach to deploying and maintaining the MusicAid application on various cloud platforms with best practices for security, performance, and reliability. 