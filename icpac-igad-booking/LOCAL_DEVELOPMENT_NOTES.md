# ICPAC Booking System

## Overview

The ICPAC Booking System is a comprehensive enterprise meeting room and resource booking platform designed for ICPAC (IGAD Climate Prediction and Applications Centre). The system provides full-featured room management with advanced security, content management, and role-based user authentication capabilities. It supports the complete booking lifecycle from room discovery to approval workflows, with integrated procurement processes and real-time availability tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built with **React 19.1.0** as a single-page application (SPA) using Create React App. The frontend implements a component-based architecture with:

- **UI Framework**: TailwindCSS 4.1.11 for responsive design and mobile compatibility
- **State Management**: React Context API for global application state
- **Routing**: React Router DOM 7.7.0 for navigation
- **Data Visualization**: Chart.js 4.5.0 and Recharts 3.1.0 for analytics dashboards
- **HTTP Communication**: Axios 1.10.0 for API integration
- **Email Integration**: EmailJS browser SDK for client-side notifications

The frontend supports role-based dashboards, mobile-responsive design with touch-friendly interfaces, dark mode theming, and fallback data for offline demonstration capabilities.

### Backend Architecture
The server-side application is built with **Django 5.0.7** following a modular app-based architecture:

- **API Framework**: Django REST Framework 3.14.0 with JWT authentication
- **Authentication**: djangorestframework-simplejwt 5.3.0 with custom user model supporting role-based permissions
- **Content Management**: Wagtail CMS 6.0.6 for dynamic content and page management
- **Security Features**: Custom security middleware, domain-based registration, multi-factor authentication, and audit logging
- **Task Processing**: Celery 5.3.4 with Redis broker for background jobs
- **Real-time Features**: Django Channels 4.0.0 for WebSocket support

The backend implements five main Django apps: authentication (custom user management), rooms (facility management), bookings (reservation lifecycle), security (domain restrictions and audit trails), and cms_content (Wagtail integration).

### Data Storage Architecture
The system supports flexible database configurations:

- **Development**: SQLite for local development
- **Production**: PostgreSQL with prepared migration scripts
- **Caching**: Redis for session storage and task queuing
- **File Storage**: WhiteNoise 6.6.0 for static file serving

The database schema includes comprehensive models for users, rooms, bookings, procurement orders, security policies, and CMS content with proper foreign key relationships and audit trails.

### Deployment Architecture
The application is containerized using Docker with orchestration via docker-compose:

- **Frontend Container**: Nginx-served React build with production optimizations
- **Backend Container**: Gunicorn WSGI server running Django application
- **Database Container**: PostgreSQL with persistent volume storage
- **Reverse Proxy**: Nginx configuration for SSL termination and static file serving

The deployment includes comprehensive shell scripts for health checks, backups, and automated deployment processes.

### Security Architecture
Enterprise-grade security features include:

- **Domain-Based Registration**: Whitelist email domains for user registration
- **Multi-Factor Authentication**: TOTP and email-based 2FA support
- **Rate Limiting**: IP-based login attempt monitoring and automatic blocking
- **Audit Logging**: Comprehensive action tracking for compliance
- **Role-Based Access Control**: Super admin, room admin, procurement officer, and user roles
- **Session Management**: Secure JWT token handling with refresh mechanisms

## External Dependencies

### Core Framework Dependencies
- **React ecosystem**: React 19.1.0, React DOM, React Router for frontend framework
- **Django ecosystem**: Django 5.0.7, DRF, Wagtail CMS for backend framework
- **Database**: PostgreSQL (production), SQLite (development) for data persistence
- **Redis**: Used for caching, session storage, and Celery task queuing

### Authentication & Security Services
- **EmailJS**: Browser-based email service integration for notifications
- **Django OTP**: Two-factor authentication implementation
- **JWT tokens**: djangorestframework-simplejwt for stateless authentication

### UI and Visualization Libraries
- **TailwindCSS**: Utility-first CSS framework for responsive design
- **Chart.js & Recharts**: Data visualization libraries for analytics dashboards
- **Date-fns**: JavaScript date utility library for calendar operations

### Infrastructure and Deployment
- **Docker & Docker Compose**: Containerization and orchestration
- **Nginx**: Web server and reverse proxy
- **Gunicorn**: Python WSGI HTTP server for Django
- **WhiteNoise**: Static file serving for Django applications

### Development and Testing Tools
- **Testing Libraries**: React Testing Library, Jest for frontend testing
- **Build Tools**: Create React App, Webpack for frontend bundling
- **Python Dependencies**: Pillow for image processing, psycopg2 for PostgreSQL connectivity

### Optional Integrations
- **Email Services**: Prepared for SMTP backend integration to replace EmailJS
- **Calendar Systems**: iCal export functionality for external calendar integration
- **Monitoring Services**: Prepared hooks for external monitoring and logging services