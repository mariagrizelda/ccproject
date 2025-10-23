# Quick Start Guide - Microservices Architecture

## What Changed?

Your Django API has been converted from a monolithic application into **4 microservices**:

1. **Auth Service** (Port 8001) - `/api/auth/*`
2. **Courses Service** (Port 8002) - `/api/courses/*`
3. **Catalog Service** (Port 8003) - `/api/catalog/*`
4. **Planner Service** (Port 8004) - `/api/planned-courses/*`

All services are now behind an **Nginx reverse proxy** on port 80.

## Quick Start

### 1. Configure Environment

```bash
# Copy example environment file
cp env.example .env

# Edit .env with your settings
nano .env
```

Required settings:
```env
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_DATABASE=ccproject_db
MYSQL_USER=ccproject_user
MYSQL_PASSWORD=your_secure_password
SECRET_KEY=your_django_secret_key
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost,http://localhost:80
NEXT_PUBLIC_API_URL=http://localhost/api
```

### 2. Start Services

```bash
# Build and start all services
docker-compose up --build -d

# Watch the logs
docker-compose logs -f
```

### 3. Access the Application

- **Frontend**: http://localhost
- **Auth API**: http://localhost/api/auth/
- **Courses API**: http://localhost/api/courses/
- **Catalog API**: http://localhost/api/catalog/
- **Planner API**: http://localhost/api/planned-courses/

### 4. Health Checks

Verify all services are running:

```bash
# Check all containers
docker-compose ps

# Test health endpoints
curl http://localhost/api/auth/health/
curl http://localhost/api/courses/health/
curl http://localhost/api/catalog/health/
curl http://localhost/api/planned-courses/health/
```

## API Endpoints Reference

### Auth Service (`/api/auth/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/token/` | Login (get JWT) |
| POST | `/api/auth/token/refresh/` | Refresh JWT |
| GET | `/api/auth/me/` | Get current user |
| PATCH | `/api/auth/profile/` | Update profile |

### Courses Service (`/api/courses/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses/` | List all courses |
| GET | `/api/courses/{id}/` | Course details |
| GET | `/api/courses/{id}/reviews/` | Course reviews |
| POST | `/api/courses/{id}/reviews/` | Submit review |

### Catalog Service (`/api/catalog/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/catalog/assessment-types/` | List assessment types |
| GET | `/api/catalog/study-areas/` | List study areas |
| GET | `/api/catalog/program-levels/` | List program levels |
| GET | `/api/catalog/programs/` | List programs |

### Planner Service (`/api/planned-courses/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/planned-courses/` | Get planned courses |
| POST | `/api/planned-courses/` | Add planned course |
| PATCH | `/api/planned-courses/` | Update semester |
| DELETE | `/api/planned-courses/` | Remove course |

## Common Commands

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart a specific service
docker-compose restart auth_svc

# View logs for specific service
docker-compose logs -f courses_svc
```

### Database Management

```bash
# Run migrations (already done on startup)
docker-compose exec auth_svc python manage.py migrate

# Create superuser
docker-compose exec auth_svc python manage.py createsuperuser

# Access MySQL
docker-compose exec db mysql -u ccproject_user -p ccproject_db
```

### Debugging

```bash
# Check service health
docker-compose ps

# View logs
docker-compose logs --tail=100 -f

# Execute commands in a service
docker-compose exec auth_svc bash

# Restart all services
docker-compose restart
```

## Architecture Overview

```
User Request
     ↓
  Nginx (Port 80)
     ↓
Routes to appropriate service:
     ├─→ Auth Service (8001)
     ├─→ Courses Service (8002)
     ├─→ Catalog Service (8003)
     ├─→ Planner Service (8004)
     └─→ Frontend (3000)
     ↓
  MySQL Database (3306)
```

## What's Different from Before?

### Before (Monolith)
- Single backend service on port 8000
- Everything in `api` app
- Direct database access

### After (Microservices)
- 4 independent services on ports 8001-8004
- Nginx reverse proxy on port 80
- Each service has specific responsibility
- Shared database with centralized migrations
- Health checks for each service
- Better scalability and fault isolation

## Migration Notes

1. **Old API endpoints** still work through Nginx routing
2. **Frontend updated** to use new paths (but proxied through Nginx)
3. **Database schema unchanged** - all models in `shared` app
4. **Same Dockerfile** used for all backend services
5. **Environment variables** simplified

## Troubleshooting

### Services won't start

```bash
# Check logs
docker-compose logs

# Restart from scratch
docker-compose down -v
docker-compose up --build
```

### Database connection errors

```bash
# Wait for database to be ready
docker-compose logs db

# Check database health
docker-compose exec db mysqladmin ping -h localhost -u root -p
```

### Port conflicts

```bash
# Check what's using port 80
lsof -i :80

# Stop conflicting services
sudo lsof -ti:80 | xargs kill -9
```

### Nginx routing issues

```bash
# Check nginx logs
docker-compose logs nginx

# Test individual services
curl http://localhost:8001/api/auth/health/
curl http://localhost:8002/api/courses/health/
```

## Next Steps

1. ✅ Services are running
2. ✅ Database is seeded
3. ✅ Frontend is accessible
4. 📝 Create user account
5. 📝 Test all features
6. 📝 Monitor logs for errors

## Support

- See `MICROSERVICES.md` for detailed architecture documentation
- See `DOCKER_README.md` for Docker-specific information
- Check logs: `docker-compose logs -f`
- Restart services: `docker-compose restart`

## Production Deployment

For production deployment:

1. Use strong passwords in `.env`
2. Enable HTTPS in Nginx
3. Set `DEBUG=False`
4. Configure proper `ALLOWED_HOSTS`
5. Set up monitoring and logging
6. Use secrets management
7. Configure backup for database

See `MICROSERVICES.md` for more production considerations.
