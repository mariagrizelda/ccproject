# CCProject - Docker Deployment

This project is containerized using Docker Compose with three services:
- **Backend**: Django + Gunicorn (port 8000)
- **Frontend**: Next.js (port 3000 → mapped to 80)
- **Database**: MySQL 8 (port 3306)

## Quick Start

1. **Clone and setup**:
   ```bash
   git clone <your-repo>
   cd ccproject
   cp env.example .env
   ```

2. **Update environment variables** in `.env`:
   ```bash
   # Change these for production
   SECRET_KEY=your-super-secret-key-here
   MYSQL_ROOT_PASSWORD=your-secure-root-password
   MYSQL_PASSWORD=your-secure-db-password
   ```

3. **Deploy with Docker Compose**:
   ```bash
   docker compose up -d --build
   ```

4. **Access the application**:
   - Frontend: http://localhost:80
   - Backend API: http://localhost:8000/api
   - Health Check: http://localhost:8000/api/health/

## Services

### Backend (Django + Gunicorn)
- **Port**: 8000
- **Health Check**: `/api/health/` returns `{"status": "ok"}`
- **Database**: MySQL with environment variables
- **Features**: 
  - JWT Authentication
  - Program scraping from UQ website
  - Planned courses management
  - CORS enabled for frontend

### Frontend (Next.js)
- **Port**: 3000 (mapped to 80 externally)
- **Environment**: Production build
- **API Connection**: Automatically connects to backend service

### Database (MySQL 8)
- **Port**: 3306
- **Persistent Volume**: `mysql_data`
- **Initialization**: Runs `init.sql` on first startup
- **Health Check**: Built-in MySQL health check

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | `django-insecure-...` |
| `DEBUG` | Django debug mode | `False` |
| `MYSQL_ROOT_PASSWORD` | MySQL root password | `rootpassword` |
| `MYSQL_DATABASE` | Database name | `ccproject` |
| `MYSQL_USER` | Database user | `ccproject_user` |
| `MYSQL_PASSWORD` | Database password | `ccproject_pass` |
| `DB_HOST` | Database host for Django | `db` |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | `http://localhost:3000,...` |

## Production Deployment

### GCP VM Deployment

1. **Create VM instance**:
   ```bash
   gcloud compute instances create ccproject-vm \
     --image-family=ubuntu-2004-lts \
     --image-project=ubuntu-os-cloud \
     --machine-type=e2-medium \
     --tags=http-server,https-server
   ```

2. **Install Docker**:
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose-plugin
   sudo usermod -aG docker $USER
   ```

3. **Deploy application**:
   ```bash
   git clone <your-repo>
   cd ccproject
   cp env.example .env
   # Edit .env with production values
   docker compose up -d --build
   ```

4. **Configure firewall**:
   ```bash
   gcloud compute firewall-rules create allow-http-https \
     --allow tcp:80,tcp:443 \
     --source-ranges 0.0.0.0/0 \
     --target-tags http-server,https-server
   ```

### Security Considerations

- Change all default passwords in `.env`
- Use strong `SECRET_KEY`
- Set `DEBUG=False` in production
- Configure proper `ALLOWED_HOSTS`
- Use HTTPS in production (add reverse proxy like nginx)
- Regular database backups

## Management Commands

### Database Operations
```bash
# Run migrations
docker compose exec backend python manage.py migrate

# Scrape programs from UQ website
docker compose exec backend python manage.py scrape_programs --force

# Create superuser
docker compose exec backend python manage.py createsuperuser
```

### Container Management
```bash
# View logs
docker compose logs -f

# Restart services
docker compose restart

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v
```

## Health Monitoring

- **Backend Health**: `GET /api/health/` → `{"status": "ok"}`
- **Frontend Health**: Built-in Next.js health checks
- **Database Health**: MySQL container health checks

## Troubleshooting

### Common Issues

1. **Database connection failed**:
   - Check if MySQL container is healthy: `docker compose ps`
   - Verify environment variables in `.env`
   - Check logs: `docker compose logs db`

2. **Frontend can't connect to backend**:
   - Verify `NEXT_PUBLIC_API_URL` environment variable
   - Check CORS settings in Django
   - Ensure both containers are running

3. **Port conflicts**:
   - Change ports in `docker-compose.yml` if needed
   - Check if ports 80, 8000, 3306 are available

### Logs
```bash
# All services
docker compose logs

# Specific service
docker compose logs backend
docker compose logs frontend
docker compose logs db
```

## Development

For local development without Docker:
```bash
# Backend
cd backend
python -m venv env
source env/bin/activate
pip install -r requirements.txt
python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev
```
