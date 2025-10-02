# ICPAC Booking System - Staging Deployment Guide

## Overview
This guide explains how to build the application locally, push to Docker Hub, and deploy on the staging server (197.254.1.10 / 10.10.1.13) **without CORS or CSRF errors**.

## Prerequisites
- Docker installed locally
- Docker Hub account (hkoros254)
- SSH access to staging server (197.254.1.10)
- `.env.staging` file configured on staging server

---

## Part 1: Local Build and Push to Docker Hub

### Step 1: Ensure Local Environment is Working
Before building for staging, make sure your local environment works:
```bash
docker-compose up -d
# Test at http://localhost:9040
# Verify login, registration, booking all work
```

### Step 2: Run the Deployment Script
```bash
./deploy-staging.sh
```

This script will:
1. Build backend image: `hkoros254/icpac-booking-backend:staging`
2. Build frontend image: `hkoros254/icpac-booking-frontend:staging` with API URL `http://197.254.1.10:9041/api`
3. Push both images to Docker Hub

### Step 3: Manual Build (Alternative)
If you prefer manual steps:

**Build Backend:**
```bash
docker build -t hkoros254/icpac-booking-backend:staging \
  --platform linux/amd64 \
  ./icpac-booking-backend
```

**Build Frontend (with staging API URL):**
```bash
docker build -t hkoros254/icpac-booking-frontend:staging \
  --platform linux/amd64 \
  --build-arg REACT_APP_API_URL=http://197.254.1.10:9041/api \
  ./icpac-booking-frontend
```

**Push to Docker Hub:**
```bash
docker login
docker push hkoros254/icpac-booking-backend:staging
docker push hkoros254/icpac-booking-frontend:staging
```

---

## Part 2: Deploy on Staging Server

### Step 1: SSH to Staging Server
```bash
ssh hkoros@197.254.1.10
```

### Step 2: Prepare .env.staging File

Create `.env.staging` with these **CRITICAL** CORS/CSRF settings:

```bash
# CORS/CSRF - Include BOTH IPs to avoid errors
CORS_ALLOWED_ORIGINS=http://197.254.1.10:9040,http://197.254.1.10:9041,http://10.10.1.13:9040,http://10.10.1.13:9041
CSRF_TRUSTED_ORIGINS=http://197.254.1.10:9040,http://197.254.1.10:9041,http://10.10.1.13:9040,http://10.10.1.13:9041

# Frontend API URL
REACT_APP_API_URL=http://197.254.1.10:9041/api
FRONTEND_URL=http://197.254.1.10:9040

# Ports
FRONTEND_PORT=9040
BACKEND_PORT=9041
DB_PORT=9042
REDIS_PORT=9043

# Database
POSTGRES_DB=icpac_booking
POSTGRES_USER=koros
POSTGRES_PASSWORD=icpac123
PGDATABASE=icpac_booking
PGUSER=koros
PGPASSWORD=icpac123
USE_SQLITE=False

# Django
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1,10.10.1.13,197.254.1.10

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=koroshillary12@gmail.com
EMAIL_HOST_PASSWORD=alnzespltjltnnua

# Docker
VERSION=staging
```

### Step 3: Deploy Using docker-compose.prod.yml
```bash
# Pull latest images from Docker Hub
docker-compose -f docker-compose.prod.yml --env-file .env.staging pull

# Start services
docker-compose -f docker-compose.prod.yml --env-file .env.staging up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Step 4: Verify Deployment
```bash
# Check all containers are running
docker-compose -f docker-compose.prod.yml ps

# Check backend logs
docker-compose -f docker-compose.prod.yml logs backend --tail 50

# Check frontend logs
docker-compose -f docker-compose.prod.yml logs frontend --tail 50
```

---

## Part 3: Testing After Deployment

### Access Points:
- **Frontend (Public IP):** http://197.254.1.10:9040
- **Frontend (Internal IP):** http://10.10.1.13:9040
- **Backend API (Public IP):** http://197.254.1.10:9041/api
- **Backend API (Internal IP):** http://10.10.1.13:9041/api
- **Django Admin:** http://197.254.1.10:9041/django-admin

### Test Checklist:
- [ ] Access frontend at http://197.254.1.10:9040
- [ ] Access frontend at http://10.10.1.13:9040
- [ ] Register new user - should work without CORS errors
- [ ] Receive OTP email
- [ ] Verify email with OTP code
- [ ] Login successfully
- [ ] Create a booking
- [ ] View bookings on calendar

---

## Part 4: Troubleshooting

### CORS Errors (403 Forbidden)
**Cause:** Frontend trying to call backend from IP not in CORS_ALLOWED_ORIGINS

**Fix:**
```bash
# Verify .env.staging has BOTH IPs
grep CORS_ALLOWED_ORIGINS .env.staging

# Should show: http://197.254.1.10:9040,http://197.254.1.10:9041,http://10.10.1.13:9040,http://10.10.1.13:9041

# Restart backend if needed
docker-compose -f docker-compose.prod.yml --env-file .env.staging restart backend
```

### Frontend Shows Old API URL
**Cause:** Frontend was built with wrong REACT_APP_API_URL

**Fix:**
```bash
# Rebuild frontend locally with correct API URL
docker build -t hkoros254/icpac-booking-frontend:staging \
  --build-arg REACT_APP_API_URL=http://197.254.1.10:9041/api \
  ./icpac-booking-frontend

# Push and pull again
docker push hkoros254/icpac-booking-frontend:staging
docker-compose -f docker-compose.prod.yml --env-file .env.staging pull frontend
docker-compose -f docker-compose.prod.yml --env-file .env.staging up -d frontend
```

### Email Not Sending
**Cause:** Gmail credentials incorrect or spaces in password

**Fix:**
```bash
# Check .env.staging
grep EMAIL_HOST .env.staging

# Password should be without spaces: alnzespltjltnnua
# Restart backend
docker-compose -f docker-compose.prod.yml --env-file .env.staging restart backend
```

---

## Part 5: Updates and Redeployment

When you make changes and need to redeploy:

```bash
# 1. LOCAL: Build and push new images
./deploy-staging.sh

# 2. STAGING SERVER: Pull and restart
ssh hkoros@197.254.1.10
cd /path/to/icpac-booking-system
docker-compose -f docker-compose.prod.yml --env-file .env.staging pull
docker-compose -f docker-compose.prod.yml --env-file .env.staging up -d
```

---

## Key Points for Zero CORS/CSRF Errors

### ✅ DO:
1. Include **BOTH** public IP (197.254.1.10) AND internal IP (10.10.1.13) in CORS_ALLOWED_ORIGINS
2. Include **ALL** ports (9040, 9041) for each IP
3. Build frontend with correct `REACT_APP_API_URL`
4. Use `.env.staging` file with correct values
5. Restart containers after .env changes

### ❌ DON'T:
1. Use localhost URLs in .env.staging
2. Forget to include backend ports (9041) in CORS_ALLOWED_ORIGINS
3. Have spaces in email passwords
4. Use DEBUG=True in staging
5. Skip testing both IPs after deployment

---

## Summary

**Build & Push:**
```bash
./deploy-staging.sh
```

**Deploy on Staging:**
```bash
ssh hkoros@197.254.1.10
docker-compose -f docker-compose.prod.yml --env-file .env.staging pull
docker-compose -f docker-compose.prod.yml --env-file .env.staging up -d
```

**Test:**
- http://197.254.1.10:9040 ✓
- http://10.10.1.13:9040 ✓
