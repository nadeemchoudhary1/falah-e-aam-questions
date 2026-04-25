# Production Deployment Guide

This guide covers deploying the Quiz App to various platforms.

## Prerequisites

- Node.js 16+
- Docker and Docker Compose
- Git account (GitHub, GitLab, or Bitbucket)
- Cloud account (Heroku, AWS, Azure, GCP, etc.)

## 1. Preparation

### Code Quality Check
```bash
# Run linting
cd frontend && npm run lint
cd backend && npm run lint

# Test the application
cd frontend && npm run test
cd backend && npm run test
```

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-url.com

EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@coachingcenter.com
ADMIN_NAME=Coaching Institute

JWT_SECRET=generate-secure-random-string-here
CORS_ORIGIN=https://your-frontend-url.com
```

**Frontend (.env.production):**
```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

## 2. Docker-Based Deployment

### Local Docker Testing
```bash
docker-compose up --build
```

### Push to Docker Registry

**Docker Hub:**
```bash
# Login
docker login

# Backend
docker build -t your-username/quiz-backend -f backend/Dockerfile ./backend
docker push your-username/quiz-backend

# Frontend
docker build -t your-username/quiz-frontend -f frontend/Dockerfile ./frontend
docker push your-username/quiz-frontend
```

## 3. Cloud Platform Deployment

### Heroku

#### Backend Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create quiz-app-backend

# Add buildpacks
heroku buildpacks:add heroku/nodejs

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASSWORD=your-app-password
heroku config:set ADMIN_EMAIL=admin@coachingcenter.com
heroku config:set JWT_SECRET=$(openssl rand -hex 32)

# Create Procfile in backend directory
echo "web: npm start" > backend/Procfile

# Deploy
cd backend
git push heroku main:main

# Check logs
heroku logs --tail
```

#### Frontend Deployment on Vercel

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Select your repository
4. Framework: React
5. Environment Variables:
   - `REACT_APP_API_URL`: https://your-backend.herokuapp.com/api
6. Deploy

### AWS Elastic Beanstalk

**Backend:**

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js-16 quiz-app-backend

# Create environment
eb create quiz-app-backend --single

# Set environment variables
eb setenv \
  NODE_ENV=production \
  EMAIL_USER=your-email \
  EMAIL_PASSWORD=your-password \
  ADMIN_EMAIL=admin@coachingcenter.com \
  JWT_SECRET=$(openssl rand -hex 32)

# Deploy
eb deploy
```

**Frontend (S3 + CloudFront):**

```bash
# Build
cd frontend && npm run build

# Create S3 bucket
aws s3 mb s3://quiz-app-frontend

# Upload build files
aws s3 sync build/ s3://quiz-app-frontend

# Create CloudFront distribution
# Point to S3 bucket
# Add CNAME: your-domain.com
```

### Google Cloud Run

**Backend:**

```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Deploy
gcloud run deploy quiz-app-backend \
  --source backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars \
    NODE_ENV=production,\
    EMAIL_USER=your-email,\
    EMAIL_PASSWORD=your-password,\
    ADMIN_EMAIL=admin@coachingcenter.com,\
    JWT_SECRET=$(openssl rand -hex 32)
```

**Frontend (Firebase Hosting):**

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
cd frontend && npm run build
cp -r build/* ../hosting
firebase deploy
```

### Self-Hosted (VPS/EC2)

#### Ubuntu Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2

# Install MongoDB (optional)
sudo apt install -y mongodb
```

#### Deploy Backend

```bash
# Clone repository
git clone your-repo.git
cd quiz-app/backend

# Install dependencies
npm install

# Start with PM2
pm2 start server.js --name "quiz-backend"
pm2 startup
pm2 save
```

#### Configure Nginx

**Create /etc/nginx/sites-available/quiz-app:**

```nginx
upstream backend {
    server localhost:5000;
}

server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name your-domain.com;

    root /var/www/quiz-app;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://backend/api/;
    }
}
```

#### Enable and Restart Nginx

```bash
sudo ln -s /etc/nginx/sites-available/quiz-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### SSL Certificate (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d api.your-domain.com
```

## 4. Database Migration (Future)

When moving from mock data to real database:

1. Setup MongoDB/PostgreSQL
2. Update connection strings in `.env`
3. Modify `backend/config/users.js` -> database query
4. Modify `backend/config/questions.js` -> database query
5. Create database schema and seed initial data
6. Update authentication to use database

## 5. Monitoring & Maintenance

### PM2 Monitoring

```bash
pm2 monit              # Real-time monitoring
pm2 logs              # View logs
pm2 restart all       # Restart all apps
pm2 delete all        # Stop all apps
```

### Nginx Logs

```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Automated Backups

Create backup script `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/quiz-app"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
mongodump --out $BACKUP_DIR/db_$DATE

# Backup environment
cp .env $BACKUP_DIR/env_$DATE

# Upload to cloud storage (optional)
aws s3 sync $BACKUP_DIR s3://your-backup-bucket
```

Schedule with cron:
```bash
0 2 * * * /path/to/backup.sh  # Run daily at 2 AM
```

### Health Checks

```bash
# Manual health check
curl https://your-backend-url/api/health

# Setup monitoring (e.g., Better Stack, Uptime Robot)
# Add webhook: https://your-backend-url/api/health
```

## 6. Performance Optimization

### Frontend
- Enable Gzip compression in Nginx
- Add Cache-Control headers
- Use CDN for static assets
- Implement service workers
- Code splitting and lazy loading

### Backend
- Enable response caching
- Use database indexes
- Implement pagination
- Add load balancing
- Use Redis for session storage

### Infrastructure
- Use load balancer (Nginx, HAProxy)
- Deploy multiple backend instances
- Use auto-scaling
- Setup CDN for static content

## 7. Security Hardening

- [ ] Enable HTTPS/SSL
- [ ] Set secure environment variables
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Setup DDoS protection
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Setup automated backups
- [ ] Enable monitoring and alerts
- [ ] Implement API key authentication (future)

## 8. Rollback Procedure

If deployment fails:

```bash
# Heroku
heroku releases
heroku rollback v42

# Docker
docker ps
docker stop container-id
docker run -d previous-docker-image

# GitHub/Git
git revert commit-hash
git push
```

## 9. Post-Deployment Checklist

- [ ] Backend health check passing
- [ ] Frontend loads without errors
- [ ] Login works with demo credentials
- [ ] Quiz timer functions correctly
- [ ] Email submissions working
- [ ] SSL/HTTPS configured
- [ ] Admin receives submissions
- [ ] Monitoring alerts setup
- [ ] Backup system operational
- [ ] Load tests passed
- [ ] Security scan completed

## Support & Troubleshooting

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test API endpoints directly
4. Check email configuration
5. Verify database connectivity
6. Review firewall/security group rules

---

**Need help? Contact: admin@coachingcenter.com**
