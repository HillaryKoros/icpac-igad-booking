# ICPAC Booking System

A comprehensive meeting room and resource booking system for ICPAC.

## Project Structure

```
icpac-booking-system/
├── icpac-booking-frontend/    # React frontend application
│   ├── src/                   # Source code
│   ├── public/                 # Static files
│   └── package.json           # Frontend dependencies
├── icpac-booking-backend/     # Backend API service
├── icpac-meeting-spaces/      # Meeting spaces management
├── docker/                    # Docker configuration files
│   ├── Dockerfile.frontend    # Frontend Docker image
│   ├── Dockerfile.backend     # Backend Docker image
│   └── nginx.*.conf          # Nginx configurations
├── scripts/                   # Deployment and utility scripts
├── docs/                      # Documentation
└── docker-compose.yml         # Main orchestration file
```

## Quick Start

### Development

```bash
# Frontend
cd icpac-booking-frontend
npm install
npm start

# Backend
cd icpac-booking-backend
npm install
npm run dev
```

### Production with Docker

```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Services

- **Frontend**: React application on port 3000
- **Backend**: API service on port 8000

## Deployment

For staging/production deployment, clone this repository and run:

```bash
docker-compose -f docker-compose.yml up -d
```

## Documentation

See the `docs/` folder for detailed documentation on:
- Installation guide
- Deployment procedures
- System architecture
- API documentation
- User workflows