# ICPAC Booking System

Meeting room booking and management system for IGAD Climate Prediction and Applications Centre (ICPAC).

## Quick Start (Docker)

```bash
git clone git@github.com:icpac-igad/productivity-apps.git
cd productivity-apps/icpac-igad-booking
cp .env.example .env
docker compose up --build -d
```

Services will be available at:

| Service | URL |
|---------|-----|
| Frontend (JS) | http://localhost:9040 |
| Frontend (TS) | http://localhost:9044 |
| Backend API | http://localhost:9041 |
| Django Admin | http://localhost:9041/admin/ |

Default admin: `admin@icpac.net` / `admin123`

Rooms and amenities are pre-loaded automatically.

## Project Structure

```
productivity-apps/
  icpac-igad-booking/
    icpac-booking-backend/     Django REST API (Python 3.11, Django 5.0)
    icpac-booking-frontend/    React frontend - JavaScript
    frontend/                  React frontend - TypeScript
    docker-compose.yml         Docker services config
    .env.example               Environment template
```

## Tech Stack

- **Backend:** Django 5.0, Django REST Framework, PostgreSQL 15, Redis 7
- **Frontend:** React 18, Material UI, Axios
- **Auth:** JWT (SimpleJWT), OTP email verification
- **Infra:** Docker, Nginx reverse proxy

## Services (Docker Compose)

| Service | Port | Description |
|---------|------|-------------|
| postgres | 9042 | PostgreSQL database |
| redis | 9043 | Cache and channels |
| backend | 9041 | Django API server |
| frontend-old | 9040 | JS React app (nginx) |
| frontend-new | 9044 | TS React app (nginx) |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login/` | POST | Login (email + password) |
| `/api/auth/register/` | POST | Register new user |
| `/api/auth/verify-email/` | POST | Verify email with OTP |
| `/api/auth/password/reset/` | POST | Request password reset |
| `/api/rooms/` | GET | List all rooms |
| `/api/bookings/` | GET/POST | List or create bookings |

## Local Development (without Docker)

### Backend
```bash
cd icpac-booking-backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit DB credentials
python manage.py migrate
python manage.py init_rooms
python manage.py createsuperuser
python manage.py runserver
```

### Frontend
```bash
cd icpac-booking-frontend
npm install
npm start
```

## Environment Variables

Copy `.env.example` to `.env`. Key settings:

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_DB` | icpac_booking | Database name |
| `POSTGRES_USER` | icpac | Database user |
| `POSTGRES_PASSWORD` | icpac123 | Database password |
| `DEBUG` | True | Django debug mode |
| `EMAIL_BACKEND` | console | Email backend (console for dev) |
| `REACT_APP_API_URL` | /api | API URL for frontend |

## Common Commands

```bash
# View logs
docker compose logs -f backend

# Django shell
docker compose exec backend python manage.py shell

# Database shell
docker compose exec postgres psql -U icpac icpac_booking

# Restart backend
docker compose restart backend

# Full reset (deletes data)
docker compose down -v && docker compose up --build -d
```

## License

MIT
