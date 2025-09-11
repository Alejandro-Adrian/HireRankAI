# HireRankerAI Deployment Guide

## Overview
HireRankerAI is a Next.js application with PostgreSQL database that can be deployed on various hosting platforms.

## Prerequisites
- Node.js 18+ 
- PostgreSQL database (Supabase recommended)
- SMTP email service (Gmail recommended)

## Environment Variables
Create these environment variables in your hosting platform:

### Database (Supabase)
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

### Email Configuration
\`\`\`
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
\`\`\`

### Application Settings
\`\`\`
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NODE_ENV=production
\`\`\`

## Database Setup
1. Create a Supabase project at https://supabase.com
2. Run the setup script: `scripts/setup_database.sql` in your Supabase SQL editor
3. Note your database credentials for environment variables

## Deployment Platforms

### 1. Render.com Deployment

#### Step 1: Prepare Repository
\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo-url
git push -u origin main
\`\`\`

#### Step 2: Create Render Service
1. Go to https://render.com and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: hireranker-ai
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: 18

#### Step 3: Add Environment Variables
In Render dashboard, add all environment variables listed above.

#### Step 4: Deploy
Click "Create Web Service" - Render will automatically deploy your app.

### 2. Railway Deployment

#### Step 1: Install Railway CLI
\`\`\`bash
npm install -g @railway/cli
railway login
\`\`\`

#### Step 2: Deploy
\`\`\`bash
railway init
railway add --database postgresql
railway deploy
\`\`\`

#### Step 3: Set Environment Variables
\`\`\`bash
railway variables:set NEXT_PUBLIC_SUPABASE_URL=your_value
railway variables:set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_value
# ... add all other variables
\`\`\`

### 3. Heroku Deployment

#### Step 1: Install Heroku CLI
Download from https://devcenter.heroku.com/articles/heroku-cli

#### Step 2: Create App
\`\`\`bash
heroku create your-app-name
heroku addons:create heroku-postgresql:mini
\`\`\`

#### Step 3: Configure Environment
\`\`\`bash
heroku config:set NEXT_PUBLIC_SUPABASE_URL=your_value
heroku config:set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_value
# ... add all other variables
\`\`\`

#### Step 4: Deploy
\`\`\`bash
git push heroku main
\`\`\`

### 4. DigitalOcean App Platform

#### Step 1: Create App
1. Go to DigitalOcean → Apps → Create App
2. Connect GitHub repository
3. Configure:
   - **Type**: Web Service
   - **Source**: your-repo
   - **Branch**: main

#### Step 2: Configure Build
- **Build Command**: `npm run build`
- **Run Command**: `npm start`
- **Environment Variables**: Add all required variables

#### Step 3: Deploy
Click "Create Resources" to deploy.

## Custom Server Deployment (VPS/Dedicated)

### Step 1: Server Setup
\`\`\`bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
\`\`\`

### Step 2: Deploy Application
\`\`\`bash
# Clone repository
git clone your-repo-url
cd hireranker-ai

# Install dependencies
npm install

# Build application
npm run build

# Create environment file
nano .env.local
# Add all environment variables

# Start with PM2
pm2 start npm --name "hireranker-ai" -- start
pm2 startup
pm2 save
\`\`\`

### Step 3: Setup Nginx (Optional)
\`\`\`bash
sudo apt install nginx

# Create nginx config
sudo nano /etc/nginx/sites-available/hireranker-ai
\`\`\`

\`\`\`nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

\`\`\`bash
# Enable site
sudo ln -s /etc/nginx/sites-available/hireranker-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
\`\`\`

## Post-Deployment Checklist

### 1. Test Core Features
- [ ] User registration and email verification
- [ ] Login/logout functionality
- [ ] Create new ranking
- [ ] Submit application with file upload
- [ ] View applications dashboard
- [ ] Delete rankings

### 2. Database Verification
- [ ] All tables created successfully
- [ ] Foreign key constraints working
- [ ] Triggers functioning properly

### 3. Email Testing
- [ ] Verification emails sending
- [ ] Password reset emails working
- [ ] SMTP configuration correct

### 4. Performance Optimization
- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Set up database connection pooling
- [ ] Monitor application performance

## Troubleshooting

### Common Issues

#### Database Connection Errors
- Verify Supabase credentials
- Check network connectivity
- Ensure database is not paused

#### Email Not Sending
- Verify Gmail app password
- Check SMTP settings
- Ensure less secure apps enabled (if using Gmail)

#### Build Failures
- Check Node.js version (18+ required)
- Verify all dependencies installed
- Check for TypeScript errors

#### File Upload Issues
- Verify file storage configuration
- Check file size limits
- Ensure proper permissions

### Monitoring
Set up monitoring for:
- Application uptime
- Database performance
- Error rates
- Response times

## Security Considerations
- Use HTTPS in production
- Regularly update dependencies
- Monitor for security vulnerabilities
- Implement rate limiting
- Use strong passwords for database
- Regular database backups

## Support
For deployment issues, check:
1. Application logs
2. Database logs
3. Server logs
4. Network connectivity
5. Environment variable configuration
