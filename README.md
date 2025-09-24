# ICPAC Productivity Apps

This repository contains productivity applications developed for the IGAD Climate Prediction and Applications Centre (ICPAC).

## Applications

### 🏢 ICPAC Booking System
📁 **Location**: [`icpac-booking-system/`](./icpac-booking-system/)

A comprehensive room booking and management system for ICPAC facilities.

## 🚀 Quick Start - How to Clone and Run

### Option 1: Clone the entire repository and navigate to the system
```bash
# Clone the repository
git clone https://github.com/icpac-igad/productivity-apps.git

# Navigate to the booking system
cd productivity-apps/icpac-booking-system

# Run with Docker (recommended)
docker-compose up
```

### Option 2: Clone only the booking system folder (sparse checkout)
```bash
# Clone with sparse checkout
git clone --filter=blob:none --sparse https://github.com/icpac-igad/productivity-apps.git

# Navigate to repository
cd productivity-apps

# Set sparse checkout to only get the booking system
git sparse-checkout set icpac-booking-system

# Navigate to the system
cd icpac-booking-system

# Run the system
docker-compose up
```

### Option 3: Download as ZIP
1. Go to [https://github.com/icpac-igad/productivity-apps](https://github.com/icpac-igad/productivity-apps)
2. Click on `icpac-booking-system` folder
3. Click "Code" → "Download ZIP"
4. Extract and run with Docker

## 📋 System Requirements

- **Docker & Docker Compose** (recommended)
- **Node.js 16+** (if running without Docker)
- **Python 3.8+** (if running without Docker)
- **PostgreSQL** (if running without Docker)

## 🔧 Installation & Setup

### Using Docker (Recommended)
```bash
# Navigate to the system directory
cd icpac-booking-system

# Start all services
docker-compose up

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

### Manual Installation
```bash
# Navigate to the system directory
cd icpac-booking-system

# Install frontend dependencies
npm install

# Install backend dependencies
cd icpac-booking-backend
pip install -r requirements.txt

# Set up database
python manage.py migrate
python manage.py createsuperuser

# Start backend (in one terminal)
python manage.py runserver

# Start frontend (in another terminal)
cd ..
npm start
```

## 🌟 Features

- **Room Booking**: Schedule and manage meeting room reservations
- **User Management**: Authentication and role-based access control
- **Admin Dashboard**: Comprehensive room and booking management
- **Email Notifications**: Automated booking confirmations and reminders
- **Procurement Integration**: Request procurement items for meetings
- **Responsive Design**: Works on desktop and mobile devices
- **Docker Support**: Easy deployment and development setup

## 📖 Documentation

- **[Installation Guide](./icpac-booking-system/INSTALLATION.md)** - Detailed setup instructions
- **[User Guide](./icpac-booking-system/USER_WORKFLOW.md)** - How to use the system
- **[Admin Guide](./icpac-booking-system/ADMIN_WORKFLOW.md)** - Administrative functions
- **[Docker Guide](./icpac-booking-system/README-Docker.md)** - Docker deployment
- **[API Documentation](./icpac-booking-system/icpac-booking-backend/API_DOCUMENTATION.md)** - Backend API reference

## 🚀 Production Deployment

### Using Docker
```bash
# Clone and navigate
git clone https://github.com/icpac-igad/productivity-apps.git
cd productivity-apps/icpac-booking-system

# Production deployment
docker-compose -f docker-compose.production.yml up -d
```

### Manual Server Deployment
See the [Manual Server Deployment Guide](./icpac-booking-system/MANUAL-SERVER-DEPLOYMENT.md) for detailed production setup instructions.

## 🛠️ Tech Stack

- **Frontend**: React.js, CSS3, JavaScript ES6+
- **Backend**: Django, Django REST Framework, Python
- **Database**: PostgreSQL
- **Web Server**: Nginx
- **Containerization**: Docker, Docker Compose
- **Authentication**: Django built-in auth system

## 📁 Project Structure

```
icpac-booking-system/
├── src/                          # React frontend source
│   ├── components/              # React components
│   └── services/               # API services
├── icpac-booking-backend/      # Django backend
│   ├── apps/                   # Django applications
│   ├── icpac_booking/         # Main Django project
│   └── requirements.txt       # Python dependencies
├── public/                     # Static assets
├── docker-compose.yml         # Development Docker setup
├── docker-compose.production.yml # Production Docker setup
├── package.json               # Node.js dependencies
└── README.md                  # System documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request