# ICPAC Booking System - Deployment & Testing Guide

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Local Development Setup](#local-development-setup)
3. [Staging Environment](#staging-environment)
4. [Production Environment](#production-environment)
5. [Configuration Files](#configuration-files)
6. [Testing Guide](#testing-guide)
7. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Prerequisites
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For version control
- **Node.js**: Version 18+ (for local frontend development)
- **Python**: Version 3.11+ (for local backend development)
- **PostgreSQL**: Version 15 (handled by Docker)
- **Redis**: Version 7 (handled by Docker)

### Ports Required
- `3000`: Frontend (React)
- `8000`: Backend (Django API)
- `5433`: PostgreSQL Database
- `6379`: Redis (for WebSocket/Channels)

---

## Local Development Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd icpac-booking-system
```

### 2. Environment Configuration

#### Backend Configuration (`icpac-booking-backend/.env`)
```env
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here-change-in-production

# Database Settings - PostgreSQL
PGDATABASE=icpac_booking
PGUSER=koros
PGPASSWORD=icpac123
PGHOST=postgres
PGPORT=5432

# Use PostgreSQL (not SQLite)
USE_SQLITE=False

# Email Settings (Gmail SMTP)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True

# Gmail Credentials (Get App Password from Google Account)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
DEFAULT_FROM_EMAIL=ICPAC Booking System <noreply@icpac.net>

# Gmail SMTP for OTP emails
GMAIL_EMAIL=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### Docker Compose Environment Variables
Update `docker-compose.yml` with your database password:
```yaml
environment:
  POSTGRES_DB: icpac_booking
  POSTGRES_USER: ${PGUSER:-koros}
  POSTGRES_PASSWORD: ${PGPASSWORD:-icpac123}
```

### 3. Gmail App Password Setup

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification** (must be enabled)
3. Click on **App passwords**
4. Select **Mail** and **Other (Custom name)**
5. Enter "ICPAC Booking System"
6. Copy the generated 16-character password
7. Use this password in `EMAIL_HOST_PASSWORD` and `GMAIL_APP_PASSWORD`

### 4. Start the Application

```bash
# Build and start all services
docker-compose up -d --build

# Check if services are running
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### 5. Create Admin User

```bash
# Create superuser for Django admin
docker-compose exec backend python manage.py createsuperuser \
  --username admin \
  --email admin@icpac.net \
  --first_name Admin \
  --last_name User

# Set password (run this after creating user)
docker-compose exec backend python manage.py shell -c \
  "from apps.authentication.models import User; \
   u = User.objects.get(username='admin'); \
   u.set_password('admin123'); \
   u.save()"
```

### 6. Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/
  - Username: `admin`
  - Password: `admin123`

---

## Staging Environment

### 1. Environment Configuration

#### Backend Configuration (`icpac-booking-backend/.env.staging`)
```env
# Django Settings
DEBUG=False
SECRET_KEY=your-secure-staging-secret-key
ALLOWED_HOSTS=staging.icpac.net,api-staging.icpac.net

# Database Settings - PostgreSQL (Staging)
PGDATABASE=icpac_booking_staging
PGUSER=icpac_staging_user
PGPASSWORD=strong-staging-password
PGHOST=staging-db.icpac.net
PGPORT=5432

# Email Settings (Production SMTP)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.office365.com  # Or your organization's SMTP
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=noreply@icpac.net
EMAIL_HOST_PASSWORD=your-email-password
DEFAULT_FROM_EMAIL=ICPAC Booking System <noreply@icpac.net>

# Frontend URL
FRONTEND_URL=https://staging.icpac.net

# Security Settings
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

### 2. Docker Compose for Staging

Create `docker-compose.staging.yml`:
```yaml
version: '3.8'

services:
  backend:
    image: icpac-booking-backend:staging
    env_file:
      - ./icpac-booking-backend/.env.staging
    ports:
      - "8000:8000"
    networks:
      - icpac-network

  frontend:
    image: icpac-booking-frontend:staging
    environment:
      - REACT_APP_API_URL=https://api-staging.icpac.net
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl
    networks:
      - icpac-network

networks:
  icpac-network:
    driver: bridge
```

### 3. Deployment Script

```bash
#!/bin/bash
# deploy-staging.sh

# Build images
docker-compose -f docker-compose.staging.yml build

# Run database migrations
docker-compose -f docker-compose.staging.yml run --rm backend python manage.py migrate

# Collect static files
docker-compose -f docker-compose.staging.yml run --rm backend python manage.py collectstatic --noinput

# Start services
docker-compose -f docker-compose.staging.yml up -d

# Check status
docker-compose -f docker-compose.staging.yml ps
```

---

## Production Environment

### 1. Environment Configuration

#### Backend Configuration (`icpac-booking-backend/.env.production`)
```env
# Django Settings
DEBUG=False
SECRET_KEY=your-very-secure-production-secret-key
ALLOWED_HOSTS=icpac.net,www.icpac.net,api.icpac.net

# Database Settings - PostgreSQL (Production)
PGDATABASE=icpac_booking_prod
PGUSER=icpac_prod_user
PGPASSWORD=very-strong-production-password
PGHOST=prod-db.icpac.net
PGPORT=5432

# Email Settings (Production SMTP)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.icpac.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=booking-system@icpac.net
EMAIL_HOST_PASSWORD=production-email-password
DEFAULT_FROM_EMAIL=ICPAC Booking System <noreply@icpac.net>

# Frontend URL
FRONTEND_URL=https://booking.icpac.net

# Security Settings
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True

# Sentry Error Tracking (Optional)
SENTRY_DSN=your-sentry-dsn-here
```

### 2. Production Docker Compose

Create `docker-compose.production.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_DB: ${PGDATABASE}
      POSTGRES_USER: ${PGUSER}
      POSTGRES_PASSWORD: ${PGPASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - icpac-network

  redis:
    image: redis:7-alpine
    restart: always
    networks:
      - icpac-network

  backend:
    image: icpac-booking-backend:latest
    restart: always
    env_file:
      - ./icpac-booking-backend/.env.production
    depends_on:
      - postgres
      - redis
    volumes:
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    networks:
      - icpac-network

  frontend:
    image: icpac-booking-frontend:latest
    restart: always
    environment:
      - REACT_APP_API_URL=https://api.icpac.net
    depends_on:
      - backend
    networks:
      - icpac-network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/production.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - static_volume:/static
      - media_volume:/media
    depends_on:
      - frontend
      - backend
    networks:
      - icpac-network

volumes:
  postgres_data:
  static_volume:
  media_volume:

networks:
  icpac-network:
    driver: bridge
```

### 3. Nginx Production Configuration

Create `nginx/production.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    # Backend API
    upstream backend {
        server backend:8000;
    }

    # Frontend
    upstream frontend {
        server frontend:80;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name icpac.net www.icpac.net booking.icpac.net;
        return 301 https://$server_name$request_uri;
    }

    # Main HTTPS Server
    server {
        listen 443 ssl http2;
        server_name booking.icpac.net;

        ssl_certificate /etc/nginx/ssl/icpac.net.crt;
        ssl_certificate_key /etc/nginx/ssl/icpac.net.key;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backend API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Django Admin
        location /admin/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files
        location /static/ {
            alias /static/;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }

        # Media files
        location /media/ {
            alias /media/;
            expires 7d;
        }
    }
}
```

---

## Configuration Files

### Email Domains Configuration
The system only accepts emails from specific domains. Update in `icpac-booking-backend/icpac_booking/settings.py`:

```python
ALLOWED_EMAIL_DOMAINS = [
    'icpac.net',
    'igad.int',
    'icpac.net.office',
    # Add more approved domains
]
```

### CORS Configuration
Update CORS settings for production in `settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "https://booking.icpac.net",
    "https://icpac.net",
    "https://www.icpac.net",
]
```

---

## Testing Guide

### 1. Test User Registration

```bash
# Test registration endpoint
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@icpac.net",
    "password": "TestPass123!",
    "password_confirm": "TestPass123!"
  }'
```

### 2. Test Email Verification

1. Register a new user
2. Check email for OTP code
3. Verify with:

```bash
curl -X POST http://localhost:8000/api/auth/verify-email/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@icpac.net",
    "otp": "123456"
  }'
```

### 3. Test Login

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@icpac.net",
    "password": "TestPass123!"
  }'
```

### 4. Test Room Booking

```bash
# Get available rooms
curl http://localhost:8000/api/rooms/

# Create booking (requires authentication token)
curl -X POST http://localhost:8000/api/bookings/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "room": 1,
    "date": "2025-10-01",
    "start_time": "09:00",
    "end_time": "10:00",
    "purpose": "Team Meeting"
  }'
```

### 5. Health Check Endpoints

```bash
# Backend health check
curl http://localhost:8000/api/health/

# Database connectivity
docker-compose exec backend python manage.py dbshell
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Registration Error: "Registration failed"
**Cause**: Email already exists or invalid domain
**Solution**:
```bash
# Check if user exists
docker-compose exec backend python manage.py shell -c \
  "from apps.authentication.models import User; \
   print(User.objects.filter(email='user@icpac.net').exists())"

# Delete existing user if needed
docker-compose exec backend python manage.py shell -c \
  "from apps.authentication.models import User; \
   User.objects.filter(email='user@icpac.net').delete()"
```

#### 2. Email Not Sending
**Cause**: Gmail App Password not configured correctly
**Solution**:
1. Verify Gmail 2FA is enabled
2. Generate new App Password
3. Update `.env` file
4. Restart backend service

#### 3. CORS Errors
**Cause**: Frontend URL not in CORS whitelist
**Solution**:
```python
# Add to settings.py
CORS_ALLOWED_ORIGINS.append("http://your-frontend-url")
```

#### 4. Database Connection Failed
**Cause**: Wrong credentials or database not ready
**Solution**:
```bash
# Check database status
docker-compose exec postgres pg_isready

# Reset database
docker-compose down -v
docker-compose up -d
```

#### 5. Static Files Not Loading
**Solution**:
```bash
# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput
```

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# Follow specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check Django errors
docker-compose exec backend python manage.py shell

# Database logs
docker-compose logs postgres

# Check running processes
docker-compose ps
```

### Backup and Restore

#### Backup Database
```bash
# Create backup
docker-compose exec postgres pg_dump -U koros icpac_booking > backup_$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U $PGUSER $PGDATABASE > $BACKUP_DIR/backup_$DATE.sql
```

#### Restore Database
```bash
# Restore from backup
docker-compose exec -T postgres psql -U koros icpac_booking < backup_20251001.sql
```

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Update SECRET_KEY for each environment
- [ ] Enable SSL/TLS in production
- [ ] Configure firewall rules
- [ ] Set up regular backups
- [ ] Enable rate limiting
- [ ] Configure SENTRY for error tracking
- [ ] Review and update ALLOWED_HOSTS
- [ ] Enable security headers
- [ ] Regular security updates

---

## Contact & Support

For issues or questions:
- **Technical Support**: dev-team@icpac.net
- **System Admin**: sysadmin@icpac.net
- **Documentation**: [Internal Wiki Link]

---

**Last Updated**: September 30, 2025
**Version**: 1.0.0