# 🏢 ICPAC Booking System

A comprehensive room booking and management system for the IGAD Climate Prediction and Applications Centre (ICPAC).

[![Docker](https://img.shields.io/badge/Docker-Enabled-blue?logo=docker)](https://www.docker.com/)
[![Django](https://img.shields.io/badge/Django-5.0.7-green?logo=django)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.0+-blue?logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)](https://www.postgresql.org/)

---

## 📋 Table of Contents

1. [🚀 Quick Start](#-quick-start)
2. [✨ Features](#-features)
3. [🛠️ Tech Stack](#%EF%B8%8F-tech-stack)
4. [📁 Project Structure](#-project-structure)
5. [⚙️ Installation & Setup](#%EF%B8%8F-installation--setup)
6. [🔧 Configuration](#-configuration)
7. [🐳 Docker Deployment](#-docker-deployment)
8. [🌐 Production Deployment](#-production-deployment)
9. [🧪 Testing](#-testing)
10. [📊 Scaling & Performance](#-scaling--performance)
11. [🔒 Security](#-security)
12. [🚨 Troubleshooting](#-troubleshooting)
13. [🤝 Contributing](#-contributing)

---

## 🚀 Quick Start

### Prerequisites
- **Docker & Docker Compose** (recommended)
- **Git** for version control
- **Gmail account** for email notifications (or SMTP server)

### One-Command Setup
```bash
# Clone and start
git clone <your-repository-url>
cd icpac-booking-system
docker compose up -d --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api/
# Admin Panel: http://localhost:8000/admin/
```

### Create Admin User
```bash
# Create superuser
docker compose exec backend python manage.py createsuperuser \
  --username admin \
  --email admin@icpac.net \
  --first_name Admin \
  --last_name User

# Set admin password
docker compose exec backend python manage.py shell -c \
  "from apps.authentication.models import User; \
   u = User.objects.get(username='admin'); \
   u.set_password('admin123'); \
   u.save()"
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

---

## ✨ Features

### 🏢 Core Booking Features
- **Room Reservations**: Real-time room booking with conflict detection
- **Calendar Integration**: Visual calendar interface with availability checking
- **Multi-room Support**: Manage multiple conference rooms and meeting spaces
- **Recurring Bookings**: Support for daily, weekly, monthly recurring meetings
- **Booking Approval Workflow**: Optional admin approval for bookings

### 👥 User Management
- **Email-based Registration**: Secure registration with OTP verification
- **Role-based Access**: Admin, Manager, and User roles with different permissions
- **Department Integration**: Organize users by departments/teams
- **Profile Management**: User profiles with contact information

### 📧 Communication
- **Email Notifications**: Automated booking confirmations and reminders
- **OTP Verification**: Secure email verification for new users
- **Booking Updates**: Real-time notifications for booking changes
- **Reminder System**: Automatic meeting reminders

### 📊 Analytics & Reporting
- **Usage Statistics**: Room utilization reports and analytics
- **Booking Dashboard**: Administrative overview of all bookings
- **Export Capabilities**: Export booking data to CSV/Excel
- **Calendar Views**: Daily, weekly, monthly calendar views

### 🔧 Administrative Features
- **Room Management**: Add, edit, disable rooms with capacity and amenities
- **Booking Oversight**: Approve, reject, or modify bookings
- **User Administration**: Manage user accounts and permissions
- **System Configuration**: Email settings, booking rules, and policies

### 📱 Modern Interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Live booking updates without page refresh
- **Intuitive UI**: Clean, modern interface built with React
- **Accessibility**: WCAG compliant design for all users

---

## 🛠️ Tech Stack

### Frontend
- **React 18.0+**: Modern UI library with hooks and context
- **CSS3**: Modern styling with flexbox and grid
- **JavaScript ES6+**: Modern JavaScript features
- **React Router**: Client-side routing
- **Axios**: HTTP client for API requests

### Backend
- **Django 5.0.7**: Python web framework
- **Django REST Framework**: API development
- **PostgreSQL 15**: Primary database
- **Redis 7**: Caching and session storage
- **Celery**: Asynchronous task processing
- **Django Channels**: WebSocket support for real-time features

### Infrastructure
- **Docker & Docker Compose**: Containerization
- **Nginx**: Web server and reverse proxy
- **Gunicorn**: WSGI HTTP server
- **WhiteNoise**: Static file serving

### Email & Authentication
- **Django Authentication**: Built-in user management
- **SMTP Integration**: Gmail and enterprise email support
- **JWT Tokens**: Secure API authentication
- **OTP Verification**: Email-based verification system

---

## 📁 Project Structure

```
icpac-booking-system/
├── 🗂️ Frontend (React App)
│   ├── public/                     # Static assets and HTML template
│   ├── src/
│   │   ├── components/            # Reusable React components
│   │   │   ├── BookingBoard.js    # Main booking interface
│   │   │   ├── Calendar.js        # Calendar component
│   │   │   ├── RoomCard.js        # Room display component
│   │   │   └── ...
│   │   ├── context/               # React context for state management
│   │   ├── services/
│   │   │   ├── api.js            # API service layer
│   │   │   └── auth.js           # Authentication services
│   │   ├── utils/                # Utility functions
│   │   └── App.js                # Main App component
│   ├── package.json              # Node.js dependencies
│   ├── Dockerfile                # Frontend Docker configuration
│   └── nginx.conf                # Nginx configuration for production
│
├── 🗂️ Backend (Django API)
│   ├── apps/
│   │   ├── authentication/       # User management and auth
│   │   │   ├── models.py         # User model and permissions
│   │   │   ├── views.py          # Auth API endpoints
│   │   │   ├── serializers.py    # API serializers
│   │   │   └── email_utils.py    # Email sending utilities
│   │   ├── bookings/             # Booking management
│   │   │   ├── models.py         # Booking data models
│   │   │   ├── views.py          # Booking API endpoints
│   │   │   ├── serializers.py    # Booking serializers
│   │   │   └── utils.py          # Booking logic utilities
│   │   └── rooms/                # Room management
│   │       ├── models.py         # Room data models
│   │       ├── views.py          # Room API endpoints
│   │       └── admin.py          # Django admin configuration
│   ├── icpac_booking/            # Main Django project
│   │   ├── settings.py           # Django configuration
│   │   ├── urls.py               # URL routing
│   │   ├── wsgi.py               # WSGI configuration
│   │   └── asgi.py               # ASGI configuration for WebSockets
│   ├── requirements.txt          # Python dependencies
│   ├── Dockerfile                # Backend Docker configuration
│   ├── .dockerignore             # Docker ignore file
│   └── .env                      # Environment variables
│
├── 🗂️ Docker Configuration
│   ├── docker-compose.yml        # Development Docker setup
│   ├── docker-compose.staging.yml # Staging environment
│   └── docker-compose.production.yml # Production environment
│
├── 🗂️ Documentation
│   ├── README.md                 # This comprehensive guide
│   ├── DEPLOYMENT_GUIDE.md       # Detailed deployment instructions
│   └── API_DOCUMENTATION.md      # API endpoint documentation
│
└── 🗂️ Configuration Files
    ├── .env.example              # Environment variables template
    ├── .gitignore                # Git ignore rules
    └── nginx/                    # Nginx configurations for different environments
```

---

## ⚙️ Installation & Setup

### Method 1: Docker (Recommended)

#### Step 1: Clone Repository
```bash
git clone <your-repository-url>
cd icpac-booking-system
```

#### Step 2: Environment Configuration
```bash
# Copy environment template
cp icpac-booking-backend/.env.example icpac-booking-backend/.env

# Edit configuration (see Configuration section below)
nano icpac-booking-backend/.env
```

#### Step 3: Start Services
```bash
# Build and start all services
docker compose up -d --build

# Check service status
docker compose ps

# View logs
docker compose logs -f
```

#### Step 4: Initialize Database
```bash
# Run migrations
docker compose exec backend python manage.py migrate

# Create admin user
docker compose exec backend python manage.py createsuperuser

# Load sample data (optional)
docker compose exec backend python manage.py loaddata sample_rooms.json
```

### Method 2: Manual Installation

#### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

#### Backend Setup
```bash
cd icpac-booking-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Database setup
python manage.py migrate
python manage.py createsuperuser

# Start backend
python manage.py runserver
```

#### Frontend Setup
```bash
cd icpac-booking-frontend

# Install dependencies
npm install

# Configure environment
echo "REACT_APP_API_URL=http://localhost:8000" > .env

# Start frontend
npm start
```

---

## 🔧 Configuration

### Backend Environment Variables (`icpac-booking-backend/.env`)

```env
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here-change-in-production

# Database Configuration
PGDATABASE=icpac_booking
PGUSER=koros
PGPASSWORD=icpac123
PGHOST=postgres
PGPORT=5432
USE_SQLITE=False

# Email Configuration (Gmail SMTP)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
DEFAULT_FROM_EMAIL=ICPAC Booking System <noreply@icpac.net>

# Gmail Credentials for OTP
GMAIL_EMAIL=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Security Settings (Production)
SECURE_SSL_REDIRECT=False
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False
```

### Gmail App Password Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. Go to [Google Account Settings](https://myaccount.google.com/)
3. Navigate to **Security** → **2-Step Verification**
4. Click **App passwords**
5. Select **Mail** and **Other (Custom name)**
6. Enter "ICPAC Booking System"
7. **Copy the 16-character password**
8. Use this in `EMAIL_HOST_PASSWORD` and `GMAIL_APP_PASSWORD`

### Frontend Environment Variables (`icpac-booking-frontend/.env`)

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8000

# Production settings
REACT_APP_API_URL=https://api.yourdomain.com
```

### Email Domain Whitelist

Configure allowed email domains in `icpac-booking-backend/icpac_booking/settings.py`:

```python
ALLOWED_EMAIL_DOMAINS = [
    'icpac.net',
    'igad.int',
    'yourorganization.com',
    # Add your organization's domains
]
```

---

## 🐳 Docker Deployment

### Development Environment

```bash
# Start development environment
docker compose up -d

# Rebuild after code changes
docker compose up -d --build

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop services
docker compose down

# Clean restart (removes volumes)
docker compose down -v && docker compose up -d --build
```

### Service Management

```bash
# Individual service operations
docker compose restart backend
docker compose restart frontend
docker compose restart postgres

# Database operations
docker compose exec postgres psql -U koros icpac_booking

# Backend shell access
docker compose exec backend python manage.py shell

# Database migrations
docker compose exec backend python manage.py migrate

# Collect static files
docker compose exec backend python manage.py collectstatic --noinput
```

---

## 🌐 Production Deployment

### Production Environment Setup

#### 1. Environment Configuration

Create `icpac-booking-backend/.env.production`:

```env
# Production Django Settings
DEBUG=False
SECRET_KEY=your-very-secure-production-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,api.yourdomain.com

# Production Database
PGDATABASE=icpac_booking_prod
PGUSER=icpac_prod_user
PGPASSWORD=very-strong-production-password
PGHOST=your-db-host.com
PGPORT=5432

# Production Email (Enterprise SMTP)
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=booking-system@yourdomain.com
EMAIL_HOST_PASSWORD=production-email-password

# Frontend URL
FRONTEND_URL=https://booking.yourdomain.com

# Security Settings
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
```

#### 2. Production Docker Compose

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
    build: ./icpac-booking-backend
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
    build: ./icpac-booking-frontend
    restart: always
    environment:
      - REACT_APP_API_URL=https://api.yourdomain.com
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

#### 3. Production Deployment Script

Create `deploy-production.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Starting production deployment..."

# Build images
echo "📦 Building Docker images..."
docker compose -f docker-compose.production.yml build --no-cache

# Run database migrations
echo "🗄️ Running database migrations..."
docker compose -f docker-compose.production.yml run --rm backend python manage.py migrate

# Collect static files
echo "📁 Collecting static files..."
docker compose -f docker-compose.production.yml run --rm backend python manage.py collectstatic --noinput

# Start services
echo "🔄 Starting services..."
docker compose -f docker-compose.production.yml up -d

# Health check
echo "🏥 Performing health check..."
sleep 30
curl -f http://localhost/api/health/ || echo "⚠️ Health check failed"

# Display status
echo "📊 Service status:"
docker compose -f docker-compose.production.yml ps

echo "✅ Production deployment complete!"
echo "🌐 Frontend: https://yourdomain.com"
echo "🔧 Admin: https://yourdomain.com/admin/"
```

Make it executable:
```bash
chmod +x deploy-production.sh
```

---

## 🧪 Testing

### Health Checks

```bash
# Backend health check
curl http://localhost:8000/api/health/

# Frontend health check
curl http://localhost:3000/

# Database connectivity
docker compose exec backend python manage.py dbshell
```

### API Testing

#### 1. User Registration
```bash
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

#### 2. Email Verification
```bash
curl -X POST http://localhost:8000/api/auth/verify-email/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@icpac.net",
    "otp": "123456"
  }'
```

#### 3. Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@icpac.net",
    "password": "TestPass123!"
  }'
```

#### 4. Get Rooms
```bash
curl http://localhost:8000/api/rooms/
```

#### 5. Create Booking
```bash
curl -X POST http://localhost:8000/api/bookings/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "room": 1,
    "start_date": "2025-10-01",
    "end_date": "2025-10-01",
    "start_time": "09:00",
    "end_time": "10:00",
    "purpose": "Team Meeting",
    "expected_attendees": 5
  }'
```

### Load Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test booking endpoint
ab -n 1000 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  -T "application/json" \
  http://localhost:8000/api/bookings/
```

---

## 📊 Scaling & Performance

### Horizontal Scaling

#### 1. Multi-Instance Backend

```yaml
# docker-compose.scale.yml
services:
  backend:
    deploy:
      replicas: 3
    ports:
      - "8000-8002:8000"

  nginx:
    volumes:
      - ./nginx/load-balancer.conf:/etc/nginx/nginx.conf
```

#### 2. Load Balancer Configuration

Create `nginx/load-balancer.conf`:

```nginx
upstream backend_pool {
    server backend_1:8000;
    server backend_2:8000;
    server backend_3:8000;
}

server {
    location /api/ {
        proxy_pass http://backend_pool;
    }
}
```

### Database Optimization

#### 1. Connection Pooling

Add to `settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        # ... other settings
        'OPTIONS': {
            'MAX_CONNS': 20,
            'MIN_CONNS': 5,
        },
        'CONN_MAX_AGE': 3600,
    }
}
```

#### 2. Database Indexing

```python
# In models.py
class Booking(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, db_index=True)
    start_date = models.DateField(db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=['start_date', 'room']),
            models.Index(fields=['user', 'start_date']),
        ]
```

### Caching Strategy

#### 1. Redis Caching

Add to `settings.py`:

```python
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://redis:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Cache sessions
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
```

#### 2. API Caching

```python
from django.views.decorators.cache import cache_page

@cache_page(60 * 15)  # Cache for 15 minutes
def room_list(request):
    # Room list endpoint
    pass
```

### Performance Monitoring

#### 1. Application Monitoring

Add to `docker-compose.monitoring.yml`:

```yaml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

#### 2. Database Monitoring

```bash
# Monitor PostgreSQL performance
docker compose exec postgres psql -U koros -d icpac_booking -c "
SELECT
    schemaname,
    tablename,
    n_tup_ins,
    n_tup_upd,
    n_tup_del
FROM pg_stat_user_tables
ORDER BY n_tup_ins DESC;
"
```

---

## 🔒 Security

### Security Configuration Checklist

- [ ] **Change Default Passwords**: Update all default credentials
- [ ] **Secret Key**: Generate strong `SECRET_KEY` for each environment
- [ ] **SSL/TLS**: Enable HTTPS in production
- [ ] **Database Security**: Use strong passwords and restrict access
- [ ] **Email Security**: Use app passwords, not main account passwords
- [ ] **CORS Settings**: Configure allowed origins properly
- [ ] **Rate Limiting**: Implement API rate limiting
- [ ] **Security Headers**: Configure security headers in Nginx
- [ ] **Regular Updates**: Keep dependencies updated
- [ ] **Backup Strategy**: Implement regular automated backups

### Security Headers

Add to Nginx configuration:

```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

### Rate Limiting

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

location /api/ {
    limit_req zone=api burst=20 nodelay;
}

location /api/auth/login/ {
    limit_req zone=login burst=5 nodelay;
}
```

### Database Security

```bash
# Create dedicated database user
docker compose exec postgres psql -U postgres -c "
CREATE USER icpac_app WITH PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE icpac_booking TO icpac_app;
GRANT USAGE ON SCHEMA public TO icpac_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO icpac_app;
"
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Email Not Sending

**Symptoms**: Users not receiving OTP emails

**Solutions**:
```bash
# Check Gmail settings
docker compose exec backend python manage.py shell -c "
from django.core.mail import send_mail
send_mail('Test', 'Test message', 'from@example.com', ['to@example.com'])
"

# Verify environment variables
docker compose exec backend env | grep EMAIL

# Check logs
docker compose logs backend | grep -i email
```

#### 2. Database Connection Issues

**Symptoms**: Backend can't connect to database

**Solutions**:
```bash
# Check database status
docker compose exec postgres pg_isready -U koros

# Test connection
docker compose exec backend python manage.py dbshell

# Reset database
docker compose down postgres
docker volume rm icpac-booking-system_postgres_data
docker compose up -d postgres
```

#### 3. CORS Errors

**Symptoms**: Frontend can't connect to backend

**Solutions**:
```python
# Add to settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://yourdomain.com",
]

# For development, temporarily allow all
CORS_ALLOW_ALL_ORIGINS = True
```

#### 4. Static Files Not Loading

**Solutions**:
```bash
# Collect static files
docker compose exec backend python manage.py collectstatic --noinput

# Check static file settings
docker compose exec backend python manage.py shell -c "
from django.conf import settings
print('STATIC_URL:', settings.STATIC_URL)
print('STATIC_ROOT:', settings.STATIC_ROOT)
"
```

### Debugging Tools

#### 1. Container Inspection

```bash
# Check container status
docker compose ps

# Inspect container logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Access container shell
docker compose exec backend bash
docker compose exec frontend sh
```

#### 2. Database Debugging

```bash
# Connect to database
docker compose exec postgres psql -U koros icpac_booking

# Check tables
\dt

# View recent bookings
SELECT * FROM bookings_booking ORDER BY created_at DESC LIMIT 10;

# Check user count
SELECT COUNT(*) FROM authentication_user;
```

#### 3. Application Debugging

```bash
# Django shell
docker compose exec backend python manage.py shell

# Check Django logs
docker compose exec backend tail -f /app/logs/django.log

# Test API endpoints
curl -v http://localhost:8000/api/health/
```

### Backup and Recovery

#### 1. Database Backup

```bash
# Create backup
mkdir -p backups
docker compose exec -T postgres pg_dump -U koros icpac_booking > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
docker compose exec -T postgres pg_dump -U koros icpac_booking > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
echo "Backup created: backup_$DATE.sql"
EOF

chmod +x backup.sh
```

#### 2. Database Restore

```bash
# Restore from backup
docker compose exec -T postgres psql -U koros icpac_booking < backups/backup_20251001_120000.sql
```

#### 3. Full System Backup

```bash
# Backup volumes
docker run --rm -v icpac-booking-system_postgres_data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/postgres_data_$(date +%Y%m%d).tar.gz -C /data .

# Backup uploaded files
docker compose exec backend tar czf /tmp/media_backup.tar.gz /app/media
docker compose cp backend:/tmp/media_backup.tar.gz ./backups/media_$(date +%Y%m%d).tar.gz
```

### Performance Issues

#### 1. Slow Database Queries

```sql
-- Enable query logging in PostgreSQL
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

-- Find slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

#### 2. High Memory Usage

```bash
# Check container memory usage
docker stats

# Limit container memory
docker compose -f docker-compose.yml up -d --scale backend=2
```

---

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make changes and test**
   ```bash
   # Run tests
   docker compose exec backend python manage.py test

   # Check code style
   docker compose exec backend flake8
   ```
4. **Commit changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
5. **Push and create PR**
   ```bash
   git push origin feature/amazing-feature
   ```

### Code Standards

- **Python**: Follow PEP 8
- **JavaScript**: Use ESLint configuration
- **Commits**: Use conventional commit messages
- **Documentation**: Update README for new features

### Testing

```bash
# Backend tests
docker compose exec backend python manage.py test

# Frontend tests
docker compose exec frontend npm test

# Integration tests
docker compose exec backend python manage.py test tests.integration
```

---

## 📞 Support & Contact

- **Technical Issues**: [Create an issue](https://github.com/your-repo/issues)
- **Documentation**: This README and `DEPLOYMENT_GUIDE.md`
- **Email Support**: dev-team@icpac.net

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://reactjs.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Last Updated**: September 30, 2025 | **Version**: 2.0.0

Made with ❤️ for ICPAC by the Development Team