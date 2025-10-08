# ICPAC Booking System - Local Development Setup

## Prerequisites

Before starting, ensure you have the following installed:

- **Python 3.8+** with pip
- **Node.js 18+** with npm
- **PostgreSQL 12+** (or SQLite for development)
- **Redis** (for background tasks and caching)
- **Git**

## Quick Start Guide

### 1. Clone and Navigate to Project
```bash
git clone <your-repo-url>
cd icpac-booking-system
```

### 2. Backend Setup (Django)

#### Navigate to Backend Directory
```bash
cd icpac-booking-backend
```

#### Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Environment Configuration
Create `.env` file in `icpac-booking-backend/` directory:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/icpac_booking
# For SQLite development: DATABASE_URL=sqlite:///db.sqlite3

# Django Configuration
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# Email Configuration (OTP delivery)
EMAIL_HOST=smtp.your-provider.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=noreply@icpac.net
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@icpac.net
EMAIL_SUBJECT_PREFIX=[ICPAC Booking]
EMAIL_TIMEOUT=10
```

#### Database Setup
```bash
# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load sample data (optional)
python manage.py loaddata fixtures/sample_data.json
```

#### Start Backend Server
```bash
python manage.py runserver 0.0.0.0:8000
```

**Backend should now be running at: http://localhost:8000**

### 3. Frontend Setup (React)

#### Open New Terminal and Navigate to Frontend
```bash
cd icpac-booking-frontend
```

#### Install Dependencies
```bash
npm install
```

#### Environment Configuration
Create `.env` file in `icpac-booking-frontend/` directory:
```env
# API Configuration
REACT_APP_API_BASE_URL=/api  # Leave unset to use default CRA proxy
REACT_APP_WS_URL=ws://localhost:8000/ws

# EmailJS Configuration (Optional)
REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_USER_ID=your_user_id
```

#### Start Frontend Server
```bash
HOST=0.0.0.0 PORT=5000 npm start
```

**Frontend should now be running at: http://localhost:5000**

## Connectivity Testing

### 1. Backend API Testing
Test backend endpoints:
```bash
# Test API connection
curl http://localhost:8000/api/rooms/

# Test authentication
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your_password"}'
```

### 2. Frontend-Backend Connection
1. Open browser to http://localhost:5000
2. Check browser console for errors
3. Try logging in with superuser credentials
4. Verify room data loads correctly
5. Test booking creation

### 3. Database Connection
```bash
# Check database connection
python manage.py dbshell

# Or check with direct connection
psql -U username -d icpac_booking
```

## Common Issues & Solutions

### Backend Issues

#### Port Already in Use
```bash
# Kill process on port 8000
sudo lsof -ti:8000 | xargs kill -9
# Or use different port
python manage.py runserver 0.0.0.0:8001
```

#### Database Connection Error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql
# Or restart it
sudo systemctl restart postgresql
```

#### Migration Errors
```bash
# Reset migrations (development only)
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc" -delete
python manage.py makemigrations
python manage.py migrate
```

### Frontend Issues

#### Port 5000 in Use
```bash
# Kill process on port 5000
sudo lsof -ti:5000 | xargs kill -9
# Or use different port
PORT=3000 npm start
```

#### API Connection Errors
1. Verify backend is running on port 8000
2. Check CORS settings in Django
3. Verify `.env` file has correct API_URL

#### Build Errors
```bash
# Clear npm cache
npm cache clean --force
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

### Environment Variables
Ensure these are set in production:
```env
# Django
DEBUG=False
SECRET_KEY=<strong-production-key>
ALLOWED_HOSTS=yourdomain.com
DATABASE_URL=<production-database-url>

# React
REACT_APP_API_BASE_URL=https://yourdomain.com/api
```

### Docker Deployment (Optional)
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## Testing User Workflows

### 1. User Registration & Login
1. Navigate to http://localhost:5000
2. Click "Sign Up" if registration is enabled
3. Login with credentials
4. Verify JWT token is stored and persists

### 2. Room Booking Flow
1. Select a room from the list
2. Choose available time slot
3. Fill booking form
4. Submit booking
5. Verify booking appears as "Booked" in the grid

### 3. Admin Functions
1. Login as superuser
2. Access admin dashboard
3. Manage users and rooms
4. Approve/reject bookings

## API Endpoints Reference

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration
- `POST /api/auth/logout/` - User logout

### Rooms
- `GET /api/rooms/` - List all rooms
- `GET /api/rooms/{id}/` - Get specific room
- `POST /api/rooms/` - Create room (admin)

### Bookings
- `GET /api/bookings/` - List user bookings
- `POST /api/bookings/` - Create new booking
- `PUT /api/bookings/{id}/` - Update booking
- `DELETE /api/bookings/{id}/` - Cancel booking

## Architecture Overview

```
Frontend (React)     Backend (Django)      Database (PostgreSQL)
     |                      |                      |
     |----> API Calls ----->|                      |
     |                      |----> ORM Queries --->|
     |<---- JSON Response --|                      |
     |                      |<---- Data Results ---|
```

## Support

For issues or questions:
1. Check this documentation
2. Review application logs
3. Check browser console for frontend errors
4. Verify all services are running

## Development Tips

1. **Keep logs open** - Monitor both frontend and backend logs
2. **Use browser dev tools** - Check Network tab for API calls
3. **Test incrementally** - Verify each component works before integration
4. **Clear browser cache** - When testing frontend changes
5. **Restart services** - When making configuration changes
