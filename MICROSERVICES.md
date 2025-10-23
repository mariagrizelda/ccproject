# Microservices Architecture Documentation

## Overview

This application has been converted from a monolithic Django API into a microservices architecture with 4 independent services:

1. **Auth Service** - Authentication and user management
2. **Courses Service** - Course information and reviews
3. **Catalog Service** - Program catalogs and metadata
4. **Planner Service** - Degree planning functionality

All services share a single MySQL database and use Nginx as a reverse proxy.

## Architecture Diagram

```
                    ┌──────────────┐
                    │   Nginx      │
                    │   (Port 80)  │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    /api/auth/*      /api/courses/*   /api/catalog/*   /api/planned-courses/*
          │                │                │                    │
          ▼                ▼                ▼                    ▼
    ┌─────────┐      ┌─────────┐      ┌─────────┐        ┌─────────┐
    │  Auth   │      │ Courses │      │ Catalog │        │ Planner │
    │ Service │      │ Service │      │ Service │        │ Service │
    │ :8001   │      │ :8002   │      │ :8003   │        │ :8004   │
    └────┬────┘      └────┬────┘      └────┬────┘        └────┬────┘
         │                │                │                    │
         └────────────────┴────────────────┴────────────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │    MySQL     │
                        │   (Port 3306)│
                        └──────────────┘
```

## Service Details

### 1. Auth Service (Port 8001)

**Endpoints:**
- `POST /api/auth/register/` - User registration
- `POST /api/auth/token/` - Obtain JWT token
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `GET /api/auth/me/` - Get current user info
- `PATCH /api/auth/profile/` - Update user profile
- `GET /api/auth/health/` - Health check

**Responsibilities:**
- User registration and authentication
- JWT token generation and validation
- User profile management

### 2. Courses Service (Port 8002)

**Endpoints:**
- `GET /api/courses/` - List all courses
- `GET /api/courses/{id}/` - Get course details
- `GET /api/courses/{id}/reviews/` - Get course reviews
- `POST /api/courses/{id}/reviews/` - Submit course review
- `GET /api/courses/health/` - Health check

**Responsibilities:**
- Course listing and filtering
- Course details with assessments
- Course reviews and ratings

### 3. Catalog Service (Port 8003)

**Endpoints:**
- `GET /api/catalog/assessment-types/` - List assessment types
- `GET /api/catalog/study-areas/` - List study areas
- `GET /api/catalog/program-levels/` - List program levels
- `GET /api/catalog/programs/` - List programs (with filtering)
- `GET /api/catalog/health/` - Health check

**Responsibilities:**
- Program catalog management
- Metadata for courses (types, areas)
- Program search and filtering

### 4. Planner Service (Port 8004)

**Endpoints:**
- `GET /api/planned-courses/` - Get user's planned courses
- `POST /api/planned-courses/` - Add/update planned course
- `PATCH /api/planned-courses/` - Update course semester
- `DELETE /api/planned-courses/` - Remove planned course
- `GET /api/planned-courses/health/` - Health check

**Responsibilities:**
- Degree planning functionality
- User's course selections
- Semester planning

## Shared Components

### Shared App (`backend/shared/`)

Contains models used by all microservices:
- `Course` - Course information
- `Assessment` - Course assessments
- `CourseReview` - User reviews
- `CoursePrerequisite` - Prerequisites
- `PlannedCourse` - User's planned courses
- `Profile` - User profile
- `Program` - University programs

Also contains management commands:
- `insert_data` - Seed initial course data
- `scrape_programs` - Scrape programs from UQ website

## Deployment

### Prerequisites

- Docker and Docker Compose
- `.env` file with configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

```bash
cp env.example .env
```

Required variables:
- `MYSQL_ROOT_PASSWORD` - MySQL root password
- `MYSQL_DATABASE` - Database name
- `MYSQL_USER` - Database user
- `MYSQL_PASSWORD` - Database password
- `SECRET_KEY` - Django secret key
- `DEBUG` - Debug mode (False for production)
- `ALLOWED_HOSTS` - Allowed hosts (comma-separated)
- `CORS_ALLOWED_ORIGINS` - CORS origins (comma-separated)
- `NEXT_PUBLIC_API_URL` - Frontend API URL

### Running with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Service Startup Order

1. **MySQL Database** - Starts first with health check
2. **Auth Service** - Runs migrations, seeds data, scrapes programs
3. **Other Services** - Start after auth service is healthy
4. **Frontend** - Starts after all backend services are healthy
5. **Nginx** - Starts last, depends on all services

## Health Checks

Each service exposes a `/health/` endpoint:
- Auth: `http://localhost:8001/api/auth/health/`
- Courses: `http://localhost:8002/api/courses/health/`
- Catalog: `http://localhost:8003/api/catalog/health/`
- Planner: `http://localhost:8004/api/planned-courses/health/`

Docker Compose uses these for container health checks.

## Nginx Configuration

Nginx routes requests to appropriate microservices:

```nginx
/api/auth/*           → auth_svc:8001
/api/courses/*        → courses_svc:8002
/api/catalog/*        → catalog_svc:8003
/api/planned-courses/* → planner_svc:8004
/                     → frontend:3000
```

## Database

All services connect to the same MySQL database. Only the Auth service runs migrations and data seeding on startup to avoid conflicts.

## Development

### Local Development Without Docker

Each service can be run independently:

```bash
cd backend

# Run Auth service
DJANGO_SETTINGS_MODULE=backend.settings_auth python manage.py runserver 8001

# Run Courses service
DJANGO_SETTINGS_MODULE=backend.settings_courses python manage.py runserver 8002

# Run Catalog service
DJANGO_SETTINGS_MODULE=backend.settings_catalog python manage.py runserver 8003

# Run Planner service
DJANGO_SETTINGS_MODULE=backend.settings_planner python manage.py runserver 8004
```

### Running Migrations

```bash
cd backend
python manage.py makemigrations shared
python manage.py migrate
```

### Seeding Data

```bash
cd backend
python manage.py insert_data
python manage.py scrape_programs --force
```

## Frontend Integration

The frontend uses the centralized API through Nginx at `http://localhost/api/*`. The `NEXT_PUBLIC_API_URL` environment variable should point to `/api` (relative) or the full Nginx URL.

## Migration from Monolith

The old `api` app has been split into 4 microservices:

- **api/views.py** → Split into `authsvc/views.py`, `coursessvc/views.py`, `catalogsrv/views.py`, `plannersvc/views.py`
- **api/serializers.py** → Split into each service's `serializers.py`
- **api/models.py** → Moved to `shared/models.py`
- **api/urls.py** → Split into each service's `urls.py`

Each service has its own:
- Settings file: `backend/settings_{service}.py`
- URL configuration: `backend/urls_{service}.py`
- Views and serializers

## Troubleshooting

### Service won't start

Check the logs:
```bash
docker-compose logs [service_name]
```

### Database connection errors

Ensure MySQL is healthy before services start:
```bash
docker-compose ps
```

### Nginx routing issues

Check nginx logs:
```bash
docker-compose logs nginx
```

Test individual services:
```bash
curl http://localhost:8001/api/auth/health/
```

### Port conflicts

Ensure ports 80, 3306, 8001-8004 are not in use:
```bash
lsof -i :80
```

## Security Considerations

1. **JWT Authentication** - All protected endpoints require JWT tokens
2. **CORS Configuration** - Configure allowed origins appropriately
3. **Secret Key** - Use strong secret key in production
4. **Database Credentials** - Use strong passwords
5. **HTTPS** - Use HTTPS in production (configure Nginx SSL)

## Performance

- Each service runs with 3 Gunicorn workers
- Nginx handles load balancing
- Database connection pooling through Django ORM
- Health checks ensure service availability

## Future Improvements

1. **Service Discovery** - Use Consul or Eureka
2. **API Gateway** - Replace Nginx with Kong or AWS API Gateway
3. **Message Queue** - Add RabbitMQ/Redis for async communication
4. **Caching** - Add Redis for caching
5. **Monitoring** - Add Prometheus/Grafana
6. **Logging** - Centralized logging with ELK stack
7. **Service Mesh** - Consider Istio or Linkerd
8. **Database per Service** - Separate databases for each service
