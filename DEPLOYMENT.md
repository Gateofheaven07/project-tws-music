# SoundWave Deployment Guide

Complete guide to deploy SoundWave to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Vercel Deployment](#vercel-deployment)
4. [Other Platforms](#other-platforms)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:
- GitHub account (for Vercel)
- GitHub repository with SoundWave code
- PostgreSQL database (Neon, Railway, Vercel Postgres, or managed service)
- Deezer API access (free, no registration needed for basic search)
- YouTube API key (optional, for enhanced music data)

## Database Setup

### Option 1: Neon (Recommended)

Neon offers free PostgreSQL hosting with generous free tier.

1. **Create Neon account**
   - Go to [neon.tech](https://neon.tech)
   - Sign up with GitHub
   - Create new project

2. **Get connection string**
   - Project → Connection string
   - Copy PostgreSQL connection URL
   - Format: `postgresql://user:password@host:port/database`

3. **Set up database**
   ```bash
   # Locally, test the connection
   DATABASE_URL="your-neon-connection-string" pnpm prisma db push
   ```

### Option 2: Vercel Postgres

1. **Create Vercel account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Create PostgreSQL database**
   - Vercel dashboard → Storage → Create → Postgres

3. **Get connection string**
   - Copy `.env.local` content
   - Will be provided automatically

### Option 3: Railway

1. **Create Railway account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create PostgreSQL database**
   - New Project → Add Service → PostgreSQL

3. **Get connection string**
   - Variables → DATABASE_URL
   - Copy and save

## Vercel Deployment

### Step 1: Prepare Repository

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial SoundWave commit"

# Create GitHub repository
# Go to github.com and create new repository
# Then push:
git remote add origin https://github.com/yourusername/soundwave.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel

1. **Go to Vercel Dashboard**
   - [vercel.com/dashboard](https://vercel.com/dashboard)

2. **Import Project**
   - Click "Add New" → "Project"
   - Select "Import Git Repository"
   - Choose your GitHub repository
   - Click "Import"

3. **Configure Project**
   - Project Name: soundwave (or your preference)
   - Framework: Next.js
   - Root Directory: ./ (default)

### Step 3: Add Environment Variables

In Vercel dashboard, go to project settings → Environment Variables and add:

```
DATABASE_URL=postgresql://user:password@host/database
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
DEEZER_API_KEY=your-deezer-key (optional, Deezer API is free)
YOUTUBE_API_KEY=your-youtube-api-key (optional)
NEXT_PUBLIC_API_URL=https://yourdomain.vercel.app/api
NEXT_PUBLIC_SITE_URL=https://yourdomain.vercel.app
NODE_ENV=production
```

**Security Tips:**
- Use strong, random secrets (minimum 32 characters)
- Don't use same secret for JWT and refresh token
- Rotate secrets periodically
- Use environment-specific values

### Step 4: Deploy

1. **Automatic Deployment**
   - Vercel automatically deploys on every push to `main` branch
   - First deployment starts automatically
   - Check deployment progress in Vercel dashboard

2. **Manual Deployment**
   ```bash
   # Install Vercel CLI
   pnpm add -g vercel

   # Deploy
   vercel --prod
   ```

### Step 5: Database Migration

After first deployment, run migrations:

```bash
# Option 1: Use Vercel CLI
vercel env pull
DATABASE_URL=$(grep DATABASE_URL .env.local) pnpm prisma db push

# Option 2: Use connection directly
VERCEL_ENV_DATABASE_URL pnpm prisma db push
```

### Step 6: Custom Domain (Optional)

1. **Add Custom Domain**
   - Project settings → Domains
   - Add your domain
   - Follow DNS configuration instructions

2. **Configure DNS**
   - Add CNAME record to your domain registrar
   - Points to: `cname.vercel-dns.com`

## Other Platforms

### Railway Deployment

1. **Connect GitHub**
   - Railway dashboard → GitHub Connect
   - Authorize Railway

2. **Create Service from Repository**
   - New Project → Deploy from GitHub Repository
   - Select soundwave repository

3. **Configure Environment**
   - Add environment variables
   - Ensure DATABASE_URL is set to PostgreSQL service

4. **Deploy**
   - Railway automatically deploys on Git push

### Render Deployment

1. **Create Service**
   - [render.com](https://render.com)
   - New → Web Service
   - Connect GitHub repository

2. **Configure**
   - Name: soundwave
   - Environment: Node
   - Build Command: `pnpm build`
   - Start Command: `pnpm start`

3. **Add Environment Variables**
   - Environment section
   - Add all required variables

4. **Create Service**
   - Render deploys automatically

### AWS Deployment

#### Using AWS Amplify

1. **Connect GitHub**
   - AWS Amplify → New app → Host web app
   - Connect GitHub repository

2. **Configure Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - pnpm install
       build:
         commands:
           - pnpm build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Add Environment Variables**
   - Build settings → Environment variables
   - Add all required vars

#### Using AWS EC2

1. **Launch EC2 Instance**
   - Ubuntu 20.04 LTS
   - t3.micro (free tier eligible)

2. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install nodejs npm postgresql-client

   # Install pnpm
   npm install -g pnpm
   ```

3. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/soundwave.git
   cd soundwave
   pnpm install
   ```

4. **Build and Run**
   ```bash
   pnpm build
   pnpm start
   ```

5. **Configure Reverse Proxy (Nginx)**
   ```nginx
   server {
     listen 80;
     server_name yourdomain.com;

     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

## Environment Variables

### Required Variables

```
# Database - PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Secrets - Use strong, random values
JWT_SECRET=<32+ character random string>
JWT_REFRESH_SECRET=<32+ character random string>

# API URLs - Your deployed domain
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Environment
NODE_ENV=production
```

### Optional Variables

```
# API Keys (free services)
DEEZER_API_KEY=your-deezer-key
YOUTUBE_API_KEY=your-youtube-api-key
```

### Generating Secrets

```bash
# Generate random secret (macOS/Linux)
openssl rand -hex 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Post-Deployment

### 1. Verify Deployment

```bash
# Test API endpoints
curl https://yourdomain.com/api/auth/register
curl https://yourdomain.com/api/music/trending

# Test authentication
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 2. Set up Monitoring

- **Sentry** (Error tracking)
  ```bash
  pnpm add @sentry/nextjs
  # Configure in next.config.mjs
  ```

- **LogRocket** (Session replay)
  ```bash
  pnpm add logrocket
  ```

### 3. Database Backups

- **Neon**: Automatic backups (7-day retention)
- **Vercel Postgres**: Automatic backups
- **Railway**: Manual backups available
- **AWS RDS**: Configure automated backups

### 4. SSL Certificate

- Vercel: Automatic SSL
- Railway: Automatic SSL
- Render: Automatic SSL
- AWS EC2: Use Let's Encrypt (Certbot)

### 5. Performance Optimization

```bash
# Analyze bundle size
pnpm add -D @next/bundle-analyzer

# Run in next.config.mjs
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // config
})

# Analyze
ANALYZE=true pnpm build
```

## Troubleshooting

### Deployment Fails

**Issue**: Build fails with "Cannot find module"
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

**Issue**: Prisma client errors
```bash
# Solution: Generate Prisma client
pnpm prisma generate
pnpm build
```

### Database Connection Issues

**Issue**: "Can't reach database server"
```bash
# Verify connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check firewall rules (for cloud databases)
# Ensure your server IP is whitelisted
```

**Issue**: "Authentication failed"
```bash
# Verify credentials in DATABASE_URL
# Format: postgresql://user:password@host:port/database
# Check for special characters (URL encode if needed)
```

### API Not Working

**Issue**: 500 errors on API endpoints
```bash
# Check server logs
vercel logs  # For Vercel
railway logs # For Railway

# Verify environment variables
vercel env pull  # Vercel
# Then check .env.local
```

**Issue**: CORS errors
```bash
# Solution: Update vercel.json headers
# Or add cors middleware to API routes
```

### Performance Issues

**Issue**: Slow API responses
```bash
# Optimize database queries
pnpm prisma studio  # Inspect data

# Check indexes
# Enable query logging
# Monitor database performance
```

**Issue**: High memory usage
```bash
# Check for memory leaks
# Monitor with: https://vercel.com/docs/analytics/web-vitals

# Optimize components with React.memo
# Use lazy loading for routes
```

## Rollback

### Vercel Rollback

1. Go to Deployments
2. Find previous successful deployment
3. Click "Redeploy"

### Manual Rollback

```bash
# Revert to previous commit
git revert HEAD
git push

# Or checkout previous version
git checkout previous-commit-hash
git push -f origin main
```

## Security Checklist

- [ ] Environment variables are secure
- [ ] JWT secrets are random (32+ chars)
- [ ] Database connection is HTTPS
- [ ] CORS is properly configured
- [ ] API rate limiting is enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma)
- [ ] XSS protection enabled
- [ ] HTTPS is enforced
- [ ] Security headers configured

## Monitoring and Alerts

### Set up Alerts

1. **Vercel Alerts**
   - Project settings → Git
   - Enable Slack notifications

2. **Database Alerts**
   - Neon: Alert for connection issues
   - Railway: Webhook notifications
   - Vercel Postgres: Built-in alerts

3. **Error Tracking**
   - Integrate Sentry
   - Configure email alerts

## Maintenance

### Regular Tasks

- **Weekly**: Check server logs
- **Monthly**: Review performance metrics
- **Quarterly**: Security audit
- **Yearly**: Penetration testing

### Updates

```bash
# Check for updates
pnpm update --latest

# Update Next.js
pnpm add next@latest

# Update Prisma
pnpm add @prisma/client@latest
pnpm add -D prisma@latest
pnpm prisma generate

# Commit and push
git add .
git commit -m "Update dependencies"
git push
```

## Support

- Vercel Support: [vercel.com/support](https://vercel.com/support)
- Railway Support: [railway.app/support](https://railway.app/support)
- Neon Support: [neon.tech/docs](https://neon.tech/docs)
- Next.js Docs: [nextjs.org/docs](https://nextjs.org/docs)
- Prisma Docs: [prisma.io/docs](https://prisma.io/docs)
