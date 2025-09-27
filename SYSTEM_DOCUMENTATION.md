# ICPAC Booking System - Comprehensive Documentation

## Overview

The ICPAC Internal Booking System is a full-featured, enterprise-grade meeting room booking platform with advanced security, content management, and user authentication capabilities.

## System Architecture

### Technology Stack

**Backend:**
- **Django 5.0.7** - Web framework
- **Wagtail CMS 6.0.6** - Content management system
- **Django REST Framework** - API development
- **Django OTP** - Two-factor authentication
- **PostgreSQL/SQLite** - Database (SQLite for development, PostgreSQL for production)
- **Redis** - Caching and session storage
- **Celery** - Background task processing

**Frontend:**
- **React 19.1.0** - User interface framework
- **TailwindCSS 4.1.11** - Styling framework
- **Axios** - HTTP client
- **Chart.js & Recharts** - Data visualization

**Infrastructure:**
- **Nginx** - Reverse proxy and static file serving
- **Replit** - Development and hosting platform

## Core Features

### 1. Advanced User Management & Security

#### Domain-Based Registration Security
- **Allowed Email Domains**: Only users with emails from approved domains can register
- **Domain Approval Workflow**: Automatic or manual approval based on domain configuration
- **Supported Domains**: icpac.net, igad.int, and other configured domains

#### Multi-Factor Authentication (MFA)
- **OTP Authentication**: Email and SMS-based one-time passwords
- **Two-Factor Authentication**: Optional 2FA for enhanced security
- **TOTP Support**: Time-based one-time password support

#### Account Security Features
- **Login Attempt Monitoring**: Track and limit failed login attempts
- **Account Lockout**: Automatic account locking after failed attempts
- **IP-based Rate Limiting**: Block IPs with excessive failed attempts
- **Password Policies**: Configurable password strength requirements
- **Session Management**: Secure session handling with timeout controls

### 2. Comprehensive Room Booking System

#### Room Management
- **Room Categories**: Conference rooms, meeting rooms, boardrooms, training rooms, auditoriums
- **Capacity Management**: Define maximum occupancy for each room
- **Amenities Tracking**: Track available equipment (projectors, whiteboards, A/V systems)
- **Floor & Location**: Detailed location information
- **Availability Controls**: Set booking windows and restrictions

#### Booking Features
- **Flexible Booking Types**: Hourly, full-day, multi-day, and weekly bookings
- **Advanced Validation**: Prevent double bookings and capacity overrun
- **Approval Workflow**: Configurable approval process for bookings
- **Conflict Detection**: Real-time conflict checking
- **Booking History**: Complete audit trail of all booking activities

### 3. Content Management System (Wagtail CMS)

#### Page Types
- **Home Page**: Customizable landing page with hero sections and statistics
- **Announcement Pages**: System announcements and news with expiration dates
- **Policy Pages**: Booking policies, terms of service, privacy policies
- **Help Pages**: User documentation and FAQ sections

#### Content Features
- **Rich Text Editor**: Full-featured content editing
- **Image Management**: Upload and manage images for pages
- **Version Control**: Track changes to content pages
- **SEO Optimization**: Meta tags and search engine optimization
- **Responsive Design**: Mobile-friendly content delivery

### 4. Security & Audit System

#### Comprehensive Audit Logging
- **User Actions**: Login/logout, profile changes, password changes
- **Booking Activities**: Create, update, cancel, approve, reject bookings
- **Room Management**: Room creation, updates, deletions
- **Security Events**: Failed logins, account lockouts, security violations
- **Admin Actions**: Permission changes, system configuration updates

#### Security Monitoring
- **Real-time Monitoring**: Live tracking of security events
- **Alert System**: Configurable alerts for security violations
- **Forensic Capabilities**: Detailed logging for security investigations
- **Compliance Tracking**: Maintain audit trails for compliance requirements

### 5. Procurement Integration

#### Procurement Orders
- **Order Types**: Catering, equipment, supplies, decoration, transportation
- **Priority Levels**: Low, medium, high, urgent prioritization
- **Status Tracking**: Pending, approved, ordered, delivered, cancelled
- **Cost Estimation**: Budget tracking and cost estimation
- **Integration**: Linked to booking requests for streamlined procurement

## User Roles & Permissions

### 1. User (Default Role)
**Capabilities:**
- Create and manage own bookings
- View available rooms and schedules
- Update personal profile
- View booking history
- Cancel own pending/approved bookings

**Restrictions:**
- Cannot approve bookings
- Cannot manage rooms
- Cannot access other users' bookings
- Cannot access admin functions

### 2. Room Admin
**Capabilities:**
- All User capabilities
- Approve/reject bookings for assigned rooms
- Manage assigned rooms (update details, amenities)
- View booking statistics for assigned rooms
- Add notes to bookings
- Override booking restrictions when necessary

**Restrictions:**
- Limited to assigned rooms only
- Cannot manage users
- Cannot access system-wide settings
- Cannot manage other admins

### 3. Procurement Officer
**Capabilities:**
- All User capabilities
- Manage procurement orders
- Approve procurement requests
- Track delivery status
- Generate procurement reports

**Restrictions:**
- Cannot manage rooms
- Cannot approve bookings
- Limited to procurement functions

### 4. Super Admin
**Capabilities:**
- All system functions
- User management (create, update, delete, approve)
- Room management (all rooms)
- System configuration
- Security settings management
- Audit log access
- Content management (CMS)
- Backup and restore operations

## Security Configuration

### Email Domain Restrictions

```python
# Configure allowed domains in settings.py
ALLOWED_EMAIL_DOMAINS = [
    'icpac.net',
    'igad.int',
    'icpac.net.office',
    'example.org'  # Add more as needed
]
```

### Security Policies

#### Password Policy
- Minimum length: 8 characters
- Must include uppercase, lowercase, numbers
- Cannot be common passwords
- Password history: Cannot reuse last 5 passwords
- Password expiry: 90 days (configurable)

#### Login Security
- Maximum failed attempts: 5
- Account lockout duration: 30 minutes
- Session timeout: 8 hours
- Require 2FA for admin users: Optional

#### OTP Configuration
```python
# OTP Settings
OTP_TOTP_ISSUER = 'ICPAC Booking System'
OTP_TOKEN_VALIDITY = 10  # minutes
OTP_MAX_ATTEMPTS = 3
```

## API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/auth/login/
Content-Type: application/json

{
    "email": "user@icpac.net",
    "password": "securepassword123"
}
```

**Response:**
```json
{
    "access": "jwt_access_token",
    "refresh": "jwt_refresh_token",
    "user": {
        "id": 1,
        "email": "user@icpac.net",
        "first_name": "John",
        "last_name": "Doe",
        "role": "user"
    }
}
```

#### Register
```http
POST /api/auth/register/
Content-Type: application/json

{
    "email": "newuser@icpac.net",
    "password": "securepassword123",
    "first_name": "Jane",
    "last_name": "Smith",
    "department": "Climate Services"
}
```

### Security Endpoints

#### Generate OTP
```http
POST /api/security/otp/generate/
Authorization: Bearer jwt_access_token
Content-Type: application/json

{
    "token_type": "two_factor"
}
```

#### Verify OTP
```http
POST /api/security/otp/verify/
Authorization: Bearer jwt_access_token
Content-Type: application/json

{
    "token": "123456",
    "token_type": "two_factor"
}
```

#### Check Domain
```http
POST /api/security/check-domain/
Content-Type: application/json

{
    "email": "user@example.com"
}
```

**Response:**
```json
{
    "allowed": true,
    "requires_approval": false,
    "domain_description": "ICPAC Staff"
}
```

### Room Endpoints

#### List Rooms
```http
GET /api/rooms/
Authorization: Bearer jwt_access_token
```

#### Get Room Details
```http
GET /api/rooms/{id}/
Authorization: Bearer jwt_access_token
```

#### Check Room Availability
```http
POST /api/rooms/{id}/availability/
Authorization: Bearer jwt_access_token
Content-Type: application/json

{
    "date": "2024-03-15",
    "start_time": "09:00:00",
    "end_time": "11:00:00"
}
```

### Booking Endpoints

#### Create Booking
```http
POST /api/bookings/
Authorization: Bearer jwt_access_token
Content-Type: application/json

{
    "room": 1,
    "purpose": "Team Meeting",
    "start_date": "2024-03-15",
    "end_date": "2024-03-15",
    "start_time": "09:00:00",
    "end_time": "11:00:00",
    "expected_attendees": 8,
    "special_requirements": "Need projector and whiteboard"
}
```

#### List User Bookings
```http
GET /api/bookings/my/
Authorization: Bearer jwt_access_token
```

#### Approve Booking (Admin Only)
```http
POST /api/bookings/{id}/approve/
Authorization: Bearer jwt_access_token
```

#### Reject Booking (Admin Only)
```http
POST /api/bookings/{id}/reject/
Authorization: Bearer jwt_access_token
Content-Type: application/json

{
    "reason": "Room maintenance scheduled"
}
```

## Database Schema

### Core Tables

#### Users (auth_user)
- **id**: Primary key
- **email**: Unique email address (username)
- **first_name, last_name**: User names
- **role**: User role (user, room_admin, super_admin, procurement_officer)
- **department**: User department
- **phone_number**: Contact phone
- **email_verified, phone_verified**: Verification status
- **two_factor_enabled**: 2FA status
- **registration_approved**: Admin approval status
- **created_at, updated_at**: Timestamps

#### Rooms
- **id**: Primary key
- **name**: Room name
- **capacity**: Maximum occupancy
- **category**: Room type (conference, meeting, boardroom, etc.)
- **floor**: Floor location
- **location**: Detailed location
- **amenities**: JSON array of available amenities
- **image**: Room photo
- **is_active**: Availability status
- **booking_settings**: Advance booking days, min/max duration

#### Bookings
- **id**: Primary key
- **room_id**: Foreign key to rooms
- **user_id**: Foreign key to users
- **purpose**: Meeting purpose
- **start_date, end_date**: Booking dates
- **start_time, end_time**: Booking times
- **booking_type**: hourly, full_day, multi_day, weekly
- **expected_attendees**: Number of attendees
- **approval_status**: pending, approved, rejected, cancelled
- **approved_by_id**: Admin who approved
- **created_at, updated_at**: Timestamps

### Security Tables

#### Allowed Email Domains (security_allowed_domains)
- **id**: Primary key
- **domain**: Email domain (e.g., icpac.net)
- **description**: Organization description
- **is_active**: Whether domain is currently allowed
- **requires_approval**: Whether users need admin approval

#### Login Attempts (security_login_attempts)
- **id**: Primary key
- **user_id**: Foreign key to users (nullable)
- **email**: Email attempted
- **ip_address**: IP address of attempt
- **attempt_type**: success, failed_password, failed_user, etc.
- **timestamp**: When attempt occurred

#### Audit Logs (security_audit_logs)
- **id**: UUID primary key
- **user_id**: Foreign key to users (nullable)
- **action_type**: Type of action performed
- **description**: Detailed description
- **object_type, object_id**: Object affected
- **ip_address**: User's IP address
- **additional_data**: JSON additional context
- **timestamp**: When action occurred

#### OTP Tokens (security_otp_tokens)
- **id**: Primary key
- **user_id**: Foreign key to users
- **token**: OTP code
- **token_type**: email, sms, registration, password_reset, two_factor
- **phone_number, email**: Contact information
- **is_used**: Whether token has been used
- **attempts**: Number of verification attempts
- **expires_at**: Token expiration time

## Deployment Guide

### Development Setup

1. **Environment Setup**
```bash
# Install Python dependencies
cd icpac-booking-backend
pip install -r requirements.txt

# Install Node.js dependencies
cd icpac-booking-frontend
npm install
```

2. **Database Setup**
```bash
# Run migrations
cd icpac-booking-backend
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

3. **Initial Data Setup**
```bash
# Load default room amenities
python manage.py shell
>>> from apps.rooms.models import RoomAmenity
>>> RoomAmenity.objects.create(name="Projector", icon="📽️")
>>> RoomAmenity.objects.create(name="Whiteboard", icon="📝")
# ... add more amenities

# Configure allowed domains
>>> from apps.security.models import AllowedEmailDomain
>>> AllowedEmailDomain.objects.create(
...     domain="icpac.net",
...     description="ICPAC Staff",
...     is_active=True
... )
```

4. **Start Development Servers**
```bash
# Backend (Django)
cd icpac-booking-backend
python manage.py runserver 0.0.0.0:8000

# Frontend (React)
cd icpac-booking-frontend
HOST=0.0.0.0 PORT=5000 npm start
```

### Production Deployment

1. **Environment Variables**
```bash
# Security
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/icpac_booking

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=noreply@yourdomain.com
EMAIL_HOST_PASSWORD=email-password

# Security Settings
LOGIN_ATTEMPT_LIMIT=5
LOGIN_LOCKOUT_TIME=1800
SESSION_COOKIE_AGE=28800
```

2. **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Serve static files
    location /static/ {
        alias /path/to/staticfiles/;
        expires 1y;
    }
    
    location /media/ {
        alias /path/to/media/;
        expires 1y;
    }
    
    # Proxy API requests to Django
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # Serve React frontend
    location / {
        root /path/to/frontend/build;
        try_files $uri $uri/ /index.html;
    }
}
```

3. **Production Commands**
```bash
# Collect static files
python manage.py collectstatic --noinput

# Migrate database
python manage.py migrate

# Start application server
gunicorn --bind 0.0.0.0:8000 --workers 4 icpac_booking.wsgi:application
```

## Monitoring & Maintenance

### Health Checks

1. **Application Health**
- Database connectivity
- External service availability
- API response times
- Error rates

2. **Security Monitoring**
- Failed login attempts
- Unusual access patterns
- Security policy violations
- Account lockouts

3. **Performance Metrics**
- Response times
- Database query performance
- Resource utilization
- User activity patterns

### Backup Procedures

1. **Database Backup**
```bash
# PostgreSQL backup
pg_dump icpac_booking > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
psql icpac_booking < backup_file.sql
```

2. **Media Files Backup**
```bash
# Backup uploaded files
tar -czf media_backup_$(date +%Y%m%d_%H%M%S).tar.gz media/
```

3. **Application Backup**
```bash
# Full application backup
tar -czf app_backup_$(date +%Y%m%d_%H%M%S).tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=*.pyc \
    .
```

## Configuration Management

### System Settings

Access Django admin at `/django-admin/` to configure:

1. **User Management**
   - Create and manage user accounts
   - Assign roles and permissions
   - Approve pending registrations

2. **Room Configuration**
   - Add/edit rooms
   - Manage amenities
   - Set booking policies

3. **Security Settings**
   - Configure allowed domains
   - Set password policies
   - Review audit logs

### CMS Configuration

Access Wagtail CMS at `/cms/` to manage:

1. **Content Pages**
   - Home page content
   - Announcements
   - Policies and help documentation

2. **Site Configuration**
   - Contact information
   - System settings
   - Notification preferences

## Troubleshooting

### Common Issues

1. **Users Can't Register**
   - Check if email domain is in allowed domains list
   - Verify domain configuration is active
   - Check if approval is required

2. **Booking Conflicts**
   - Verify room availability
   - Check for overlapping time slots
   - Ensure booking validation is working

3. **Authentication Issues**
   - Check JWT token expiration
   - Verify OTP configuration
   - Review failed login attempts

4. **Permission Denied**
   - Verify user role assignments
   - Check room admin assignments
   - Review permission requirements

### Debug Commands

```bash
# Check user permissions
python manage.py shell
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> user = User.objects.get(email='user@icpac.net')
>>> print(user.role, user.managed_rooms.all())

# Check security logs
>>> from apps.security.models import AuditLog
>>> recent_logs = AuditLog.objects.order_by('-timestamp')[:10]
>>> for log in recent_logs:
...     print(f"{log.timestamp}: {log.action_type} - {log.description}")

# Check failed logins
>>> from apps.security.models import LoginAttempt
>>> failed_attempts = LoginAttempt.objects.filter(
...     attempt_type__startswith='failed'
... ).order_by('-timestamp')[:10]
```

## Performance Optimization

### Database Optimization

1. **Indexing Strategy**
   - Index frequently queried fields
   - Composite indexes for complex queries
   - Regular index maintenance

2. **Query Optimization**
   - Use select_related and prefetch_related
   - Minimize N+1 queries
   - Cache expensive calculations

3. **Connection Pooling**
   - Configure database connection pooling
   - Optimize connection parameters
   - Monitor connection usage

### Caching Strategy

1. **Redis Configuration**
```python
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}
```

2. **Cache Usage**
   - Cache room availability data
   - Cache user permissions
   - Cache static content

## Security Best Practices

1. **Input Validation**
   - Validate all user inputs
   - Sanitize data before storage
   - Use Django's built-in validators

2. **Authentication Security**
   - Enforce strong passwords
   - Implement rate limiting
   - Use secure session configuration

3. **Data Protection**
   - Encrypt sensitive data
   - Secure API endpoints
   - Regular security audits

4. **Access Control**
   - Principle of least privilege
   - Regular permission reviews
   - Audit access patterns

## Support & Maintenance

### Regular Tasks

1. **Daily**
   - Monitor system health
   - Review security logs
   - Check backup status

2. **Weekly**
   - Update security patches
   - Review user activity
   - Clean up old data

3. **Monthly**
   - Performance analysis
   - Capacity planning
   - Security assessment

### Contact Information

- **Technical Support**: support@icpac.net
- **Security Issues**: security@icpac.net
- **System Administrator**: admin@icpac.net

---

**Document Version**: 1.0  
**Last Updated**: September 27, 2025  
**Author**: ICPAC IT Team