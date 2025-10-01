# ICPAC Booking System - Deployment Guide

## 🚀 Staging Server Deployment (Fresh Install)

### Prerequisites
- Docker and Docker Compose installed
- Git installed
- Port 3000, 8000, 5433, 6379 available

### Complete Deployment Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-org/icpac-booking-system.git
cd icpac-booking-system

# 2. Create .env from template
cp .env.example .env

# 3. Edit .env with your staging credentials
nano .env
```

**Minimum Required Changes in `.env`:**
```bash
# Change these for staging:
SECRET_KEY=generate-new-secret-key-here-use-python-django
DEBUG=False
ALLOWED_HOSTS=your-staging-domain.com,localhost

# Database (use strong password)
PGPASSWORD=your_secure_db_password_here

# Email (for OTP verification)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
GMAIL_EMAIL=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password

# URLs (update to your staging domain)
FRONTEND_URL=http://your-staging-domain.com:3000
REACT_APP_API_URL=http://your-staging-domain.com:8000
```

```bash
# 4. Start services with Docker Compose
docker-compose up -d --build

# 5. Wait for services to be healthy (check with)
docker-compose ps

# 6. Run database migrations
docker-compose exec backend python manage.py migrate

# 7. Create admin user
docker-compose exec backend python manage.py createsuperuser

# 8. Create rooms and amenities (run the initialization script)
docker-compose exec backend python manage.py shell << 'EOF'
from apps.rooms.models import Room, RoomAmenity

# Create 12 standard amenities
amenities_data = [
    {'name': 'Projector', 'icon': '📽️'},
    {'name': 'Whiteboard', 'icon': '📝'},
    {'name': 'Video Conferencing', 'icon': '📹'},
    {'name': 'Audio System', 'icon': '🎤'},
    {'name': 'TV Screen', 'icon': '📺'},
    {'name': 'Screen', 'icon': '🖥️'},
    {'name': 'Computers', 'icon': '💻'},
]

for a in amenities_data:
    RoomAmenity.objects.get_or_create(name=a['name'], defaults=a)
    print(f"✓ {a['icon']} {a['name']}")

# Create 6 rooms
rooms_data = [
    {'name': 'Conference Room - Ground Floor', 'capacity': 200, 'category': 'conference', 'amenities': ['Projector', 'Whiteboard', 'Video Conferencing', 'Audio System']},
    {'name': 'Boardroom - First Floor', 'capacity': 25, 'category': 'conference', 'amenities': ['Projector', 'Whiteboard', 'Video Conferencing']},
    {'name': 'Computer Lab 1', 'capacity': 20, 'category': 'training', 'amenities': ['Computers', 'Projector', 'Whiteboard']},
]

for r in rooms_data:
    Room.objects.get_or_create(name=r['name'], defaults=r)
    print(f"✓ Room: {r['name']}")

print("\n✅ Setup complete!")
EOF

# 9. Collect static files
docker-compose exec backend python manage.py collectstatic --noinput

# 10. Access your application
echo "✅ Deployment complete!"
echo "Frontend: http://your-staging-domain.com:3000"
echo "Backend: http://your-staging-domain.com:8000"
echo "Admin: http://your-staging-domain.com:8000/admin"
```

### That's It! 🎉
Your staging server is now running. Users can:
1. Register accounts
2. Verify email with OTP
3. Book rooms
4. View bookings in Django admin

---

## Quick Start (Local Development)

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd icpac-booking-system
```

### 2. Create Environment File
```bash
# Copy the example environment file
cp .env.example .env

# Edit with your settings
nano .env
```

### 3. Configure `.env` File
Update these critical values in `.env`:

```bash
# Security - CHANGE IN PRODUCTION
SECRET_KEY=your-production-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
PGDATABASE=icpac_booking
PGUSER=your_db_user
PGPASSWORD=your_secure_password
PGHOST=postgres  # or your external DB host
PGPORT=5432

# Email (Gmail or other SMTP)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
GMAIL_EMAIL=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password

# URLs
FRONTEND_URL=https://yourdomain.com
REACT_APP_API_URL=https://api.yourdomain.com
```

### 4. Start Services
```bash
docker-compose up -d --build
```

### 5. Initialize Database

#### Create Sample Rooms
```bash
docker-compose exec backend python manage.py shell << 'EOF'
from apps.rooms.models import Room, RoomAmenity

# Create amenities
amenities_data = [
    {'name': 'Projector', 'icon': '📽️', 'description': 'Digital projector for presentations'},
    {'name': 'Whiteboard', 'icon': '📝', 'description': 'Whiteboard with markers'},
    {'name': 'Video Conferencing', 'icon': '📹', 'description': 'Video conference setup'},
    {'name': 'Audio System', 'icon': '🎤', 'description': 'Sound system with microphones'},
    {'name': 'TV Screen', 'icon': '📺', 'description': 'Large TV screen'},
    {'name': 'Screen', 'icon': '🖥️', 'description': 'Projection screen'},
    {'name': 'Computers', 'icon': '💻', 'description': 'Computer workstations'},
]

for amenity_data in amenities_data:
    RoomAmenity.objects.get_or_create(name=amenity_data['name'], defaults=amenity_data)

# Create rooms
rooms_data = [
    {
        'name': 'Conference Room - Ground Floor',
        'capacity': 200,
        'category': 'conference',
        'amenities': ['Projector', 'Whiteboard', 'Video Conferencing', 'Audio System'],
        'floor': '0',
        'is_active': True
    },
    {
        'name': 'Boardroom - First Floor',
        'capacity': 25,
        'category': 'conference',
        'amenities': ['Projector', 'Whiteboard', 'Video Conferencing'],
        'floor': '1',
        'is_active': True
    },
    {
        'name': 'Computer Lab 1 - Ground Floor',
        'capacity': 20,
        'category': 'training',
        'amenities': ['Computers', 'Projector', 'Whiteboard'],
        'floor': '0',
        'is_active': True
    },
]

for room_data in rooms_data:
    Room.objects.get_or_create(name=room_data['name'], defaults=room_data)
    print(f"Created: {room_data['name']}")
EOF
```

#### Create Admin User
```bash
docker-compose exec backend python manage.py createsuperuser
```

### 6. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | `django-insecure-xyz...` |
| `DEBUG` | Debug mode (True/False) | `False` |
| `PGDATABASE` | PostgreSQL database name | `icpac_booking` |
| `PGUSER` | PostgreSQL username | `koros` |
| `PGPASSWORD` | PostgreSQL password | `secure_password_here` |
| `PGHOST` | PostgreSQL host | `postgres` (Docker) or `localhost` |
| `EMAIL_HOST_USER` | SMTP email address | `noreply@yourdomain.com` |
| `EMAIL_HOST_PASSWORD` | SMTP password/app password | `your_app_password` |
| `FRONTEND_URL` | Frontend URL | `http://localhost:3000` |
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:8000` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ALLOWED_HOSTS` | Allowed Django hosts | `localhost,127.0.0.1` |
| `PGPORT` | PostgreSQL port | `5432` |
| `EMAIL_BACKEND` | Email backend class | SMTP backend |
| `EMAIL_HOST` | SMTP server | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |

---

## Docker Compose Services

### Services Overview
- **postgres**: PostgreSQL 15 database (port 5433→5432)
- **redis**: Redis 7 for caching/channels (port 6379)
- **backend**: Django REST API (port 8000)
- **frontend**: React app served by nginx (port 3000→80)

### Useful Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v

# Rebuild and start
docker-compose up -d --build

# Run Django commands
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser

# Access database
docker-compose exec postgres psql -U koros -d icpac_booking

# Shell access
docker-compose exec backend bash
```

---

## Production Checklist

- [ ] Set `DEBUG=False`
- [ ] Generate new `SECRET_KEY`
- [ ] Configure `ALLOWED_HOSTS` with your domain
- [ ] Use strong database password
- [ ] Configure production email SMTP
- [ ] Set up SSL/TLS (HTTPS)
- [ ] Configure proper firewall rules
- [ ] Set up regular database backups
- [ ] Configure logging and monitoring
- [ ] Test OTP email delivery
- [ ] Update `FRONTEND_URL` and `REACT_APP_API_URL` to production URLs

---

## Troubleshooting

### Database Connection Issues
```bash
# Check if database is healthy
docker-compose ps

# View database logs
docker-compose logs postgres

# Verify connection from backend
docker-compose exec backend python manage.py dbshell
```

### Email Not Sending
1. Check email credentials in `.env`
2. For Gmail: Enable 2FA and create App Password
3. Use console backend for testing: `EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend`

### Frontend Can't Connect to Backend
1. Verify `REACT_APP_API_URL` matches backend URL
2. Check CORS settings in Django
3. Rebuild frontend: `docker-compose up -d --build frontend`

---

## Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Run migrations
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py collectstatic --noinput
```

---

## Backup & Restore

### Backup Database
```bash
docker-compose exec postgres pg_dump -U koros icpac_booking > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
cat backup_20250101.sql | docker-compose exec -T postgres psql -U koros icpac_booking
```

---

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Django admin: http://localhost:8000/admin
- GitHub Issues: [your-repo-url]/issues
