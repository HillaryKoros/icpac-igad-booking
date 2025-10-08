# Dual Frontend Setup - ICPAC Booking System

## Overview
Both frontends share the **same backend** and **database**, ensuring bookings are synchronized across both interfaces.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Shared Backend (Port 9041)               │
│                    PostgreSQL DB (Port 9042)                │
│                    Redis (Port 9043)                        │
└───────────────────┬─────────────────────┬───────────────────┘
                    │                     │
        ┌───────────▼──────────┐  ┌──────▼──────────────┐
        │  Frontend OLD (JS)   │  │  Frontend NEW (TS)  │
        │  Port: 9040          │  │  Port: 9044         │
        │  icpac-booking-      │  │  frontend/          │
        │  frontend/           │  │                     │
        └──────────────────────┘  └─────────────────────┘
```

## Port Configuration

| Service | Port | URL |
|---------|------|-----|
| Frontend OLD (JavaScript) | 9040 | http://localhost:9040 |
| Backend (Django) | 9041 | http://localhost:9041/api |
| PostgreSQL | 9042 | localhost:9042 |
| Redis | 9043 | localhost:9043 |
| Frontend NEW (TypeScript) | 9044 | http://localhost:9044 |

## Docker Commands

### 🚀 Start Everything (Default - Both Frontends)
By default, running `docker compose up` starts **BOTH frontends** simultaneously:
```bash
docker compose up -d
```

This starts:
- ✅ Backend (Port 9041)
- ✅ PostgreSQL (Port 9042)
- ✅ Redis (Port 9043)
- ✅ Frontend OLD (Port 9040)
- ✅ Frontend NEW (Port 9044)

**Access both frontends at the same time:**
- OLD: http://localhost:9040
- NEW: http://localhost:9044

### Run Only Specific Services

**Backend + Old Frontend Only:**
```bash
docker compose up -d postgres redis backend frontend-old
```

**Backend + New Frontend Only:**
```bash
docker compose up -d postgres redis backend frontend-new
```

**Backend Only (for local frontend development):**
```bash
docker compose up -d postgres redis backend
# Then run frontend locally with: npm start
```

### Managing Running Frontends

**Stop one frontend (keep the other running):**
```bash
# Stop old, keep new running
docker compose stop frontend-old

# Stop new, keep old running
docker compose stop frontend-new
```

**Restart a stopped frontend:**
```bash
docker compose start frontend-old
docker compose start frontend-new
```

**Check what's running:**
```bash
docker compose ps
```

### Rebuild Frontends
```bash
# Rebuild old frontend
docker compose up -d --build frontend-old

# Rebuild new frontend
docker compose up -d --build frontend-new
```

### View Logs
```bash
# Old frontend logs
docker compose logs -f frontend-old

# New frontend logs
docker compose logs -f frontend-new

# Backend logs
docker compose logs -f backend
```

## Data Synchronization

Both frontends share:
- ✅ **Same PostgreSQL database** - All bookings are stored in one place
- ✅ **Same Redis cache** - Shared session data
- ✅ **Same backend API** - Consistent business logic

### How It Works:
1. Make a booking on **Frontend OLD** (port 9040)
2. The booking is saved to the **shared database**
3. **Frontend NEW** (port 9044) will see the same booking
4. Both frontends use the same API endpoints at `http://localhost:9041/api`

## Feature Comparison

| Feature | Frontend OLD (JS) | Frontend NEW (TS) |
|---------|------------------|------------------|
| Port | 9040 | 9044 |
| Language | JavaScript | TypeScript |
| React | 18.3.1 | 19.1.0 |
| MUI | 6.3.1 | 7.3.4 |
| Dark Mode | ✅ | ❌ |
| Sidebar | ✅ | ❌ |
| Landing Page | ✅ | ❌ |
| Type Safety | ❌ | ✅ |
| Code Size | Large (262KB) | Small (44KB) |
| Room Schedule Dialog | ❌ | ✅ |
| Category Filters | ❌ | ✅ |

## Testing Synchronization

By default, both frontends run simultaneously when you start the system.

1. **Start the system (both frontends start automatically):**
   ```bash
   docker compose up -d
   ```

2. **Open both frontends in separate browser tabs:**
   - Old: http://localhost:9040
   - New: http://localhost:9044

3. **Create a booking in one frontend (e.g., port 9040)**

4. **Refresh the other frontend (port 9044)** - The booking should appear!

5. **Try making changes in either frontend** - Both see the same data because they share the same database!

## Environment Variables

All configured in `.env`:

```env
FRONTEND_PORT=9040          # Old frontend (JavaScript)
FRONTEND_NEW_PORT=9044      # New frontend (TypeScript)
BACKEND_PORT=9041
REACT_APP_API_URL=http://localhost:9041/api
```

CORS is configured to allow both:
- http://localhost:9040
- http://localhost:9044

## Troubleshooting

### Frontend can't connect to backend
```bash
# Check backend is running
docker compose ps backend

# Check backend logs
docker compose logs backend
```

### CORS errors
Ensure `.env` has both ports in CORS_ALLOWED_ORIGINS:
```
CORS_ALLOWED_ORIGINS=...,http://localhost:9040,...,http://localhost:9044,...
```

### Booking not showing in other frontend
1. Clear browser cache
2. Check both frontends are pointing to same API
3. Verify backend is running: `docker compose ps`

## Production Deployment

For production, choose **one frontend** to deploy:

**Option 1: Deploy Old Frontend (Stable, Full Features)**
```bash
docker compose up -d postgres redis backend frontend-old
```

**Option 2: Deploy New Frontend (Modern, TypeScript)**
```bash
docker compose up -d postgres redis backend frontend-new
```

## Development Workflow

**Phase 1: Test Features (Current Setup)**
- ✅ Both frontends run simultaneously by default
- Compare features side-by-side in real-time
- Test new TypeScript features while keeping stable JavaScript version
- All changes sync via shared database

**Phase 2: Migration**
- Port missing features from old → new
- Test thoroughly in new frontend
- Gradually transition users from port 9040 → 9044

**Phase 3: Cutover**
- Stop old frontend: `docker compose stop frontend-old`
- Use only new frontend
- Eventually remove old frontend directory

## Quick Reference

### Default Behavior
```bash
docker compose up -d
```
**Starts:** Backend + Database + Redis + **BOTH Frontends**

### Common Commands
```bash
# View all running services
docker compose ps

# View logs for both frontends
docker compose logs -f frontend-old frontend-new

# Stop specific frontend
docker compose stop frontend-old

# Rebuild and restart
docker compose up -d --build

# Stop everything
docker compose down
```
