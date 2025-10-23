# Deployment Checklist

## Pre-Deployment

- [ ] Copy `env.example` to `.env`
- [ ] Fill in all required environment variables in `.env`
- [ ] Ensure Docker and Docker Compose are installed
- [ ] Ensure ports 80 and 3306 are available
- [ ] Review security settings (passwords, secret keys)

## Deployment Steps

- [ ] Run `docker-compose build` to build all images
- [ ] Run `docker-compose up -d` to start all services
- [ ] Wait for all services to become healthy (2-3 minutes)
- [ ] Check service status: `docker-compose ps`

## Service Health Verification

### Database
- [ ] MySQL container is running: `docker-compose ps db`
- [ ] Database is accessible: `docker-compose exec db mysql -u ${MYSQL_USER} -p`

### Auth Service
- [ ] Container running: `docker-compose ps auth_svc`
- [ ] Health check passing: `curl http://localhost/api/auth/health/`
- [ ] Check logs: `docker-compose logs auth_svc --tail=50`

### Courses Service
- [ ] Container running: `docker-compose ps courses_svc`
- [ ] Health check passing: `curl http://localhost/api/courses/health/`
- [ ] Check logs: `docker-compose logs courses_svc --tail=50`

### Catalog Service
- [ ] Container running: `docker-compose ps catalog_svc`
- [ ] Health check passing: `curl http://localhost/api/catalog/health/`
- [ ] Check logs: `docker-compose logs catalog_svc --tail=50`

### Planner Service
- [ ] Container running: `docker-compose ps planner_svc`
- [ ] Health check passing: `curl http://localhost/api/planned-courses/health/`
- [ ] Check logs: `docker-compose logs planner_svc --tail=50`

### Nginx
- [ ] Container running: `docker-compose ps nginx`
- [ ] Port 80 accessible: `curl http://localhost`
- [ ] Check logs: `docker-compose logs nginx --tail=50`

### Frontend
- [ ] Container running: `docker-compose ps frontend`
- [ ] Frontend accessible: Open http://localhost in browser
- [ ] Check logs: `docker-compose logs frontend --tail=50`

## Functional Testing

### Auth Endpoints
- [ ] Test registration:
```bash
curl -X POST http://localhost/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "program_level": "UNDERGRAD",
    "program": "Test Program",
    "year_intake": "SEM1"
  }'
```

- [ ] Test login:
```bash
curl -X POST http://localhost/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'
```

- [ ] Save access token from response

- [ ] Test /me endpoint:
```bash
curl http://localhost/api/auth/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Courses Endpoints
- [ ] Test course list:
```bash
curl http://localhost/api/courses/
```

- [ ] Test course detail (if courses exist):
```bash
curl http://localhost/api/courses/1/
```

### Catalog Endpoints
- [ ] Test assessment types:
```bash
curl http://localhost/api/catalog/assessment-types/
```

- [ ] Test study areas:
```bash
curl http://localhost/api/catalog/study-areas/
```

- [ ] Test program levels:
```bash
curl http://localhost/api/catalog/program-levels/
```

- [ ] Test programs:
```bash
curl http://localhost/api/catalog/programs/
```

### Planner Endpoints
- [ ] Test get planned courses (with auth):
```bash
curl http://localhost/api/planned-courses/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

- [ ] Test add planned course (with auth):
```bash
curl -X POST http://localhost/api/planned-courses/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "course_id": 1,
    "semester": 1
  }'
```

### Frontend Testing
- [ ] Homepage loads
- [ ] Can view course list
- [ ] Can register new account
- [ ] Can login
- [ ] Can view course details
- [ ] Can add course to planner
- [ ] Can view profile
- [ ] Can update profile

## Data Verification

- [ ] Database has courses: `docker-compose exec db mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} -e "SELECT COUNT(*) FROM shared_course;"`
- [ ] Database has programs: `docker-compose exec db mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} -e "SELECT COUNT(*) FROM shared_program;"`
- [ ] Check for any errors in logs: `docker-compose logs | grep -i error`

## Performance Check

- [ ] Check CPU usage: `docker stats --no-stream`
- [ ] Check memory usage: `docker stats --no-stream`
- [ ] Check disk usage: `docker system df`
- [ ] Response time acceptable (< 1s for most endpoints)

## Security Verification

- [ ] `.env` file not committed to git
- [ ] Strong passwords used
- [ ] SECRET_KEY is random and secure
- [ ] DEBUG=False in production
- [ ] CORS origins properly configured
- [ ] ALLOWED_HOSTS properly configured

## Monitoring

- [ ] Set up log aggregation (optional)
- [ ] Set up metrics collection (optional)
- [ ] Set up alerting (optional)
- [ ] Document monitoring dashboard URLs

## Backup

- [ ] Database backup strategy in place
- [ ] Test database backup: `docker-compose exec db mysqldump -u ${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} > backup.sql`
- [ ] Test database restore

## Troubleshooting Commands

If something goes wrong:

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f auth_svc

# Restart a service
docker-compose restart auth_svc

# Rebuild and restart
docker-compose up -d --build auth_svc

# Stop all services
docker-compose down

# Remove all containers and volumes (CAUTION: deletes data)
docker-compose down -v

# Check service health
docker-compose ps

# Execute command in a service
docker-compose exec auth_svc bash

# Check database connection
docker-compose exec auth_svc python manage.py check --database default
```

## Common Issues

### Port Already in Use
```bash
# Find process using port 80
lsof -i :80

# Kill process
kill -9 PID
```

### Database Connection Errors
```bash
# Check MySQL logs
docker-compose logs db

# Wait for MySQL to be ready
docker-compose exec db mysqladmin ping -h localhost -u ${MYSQL_USER} -p${MYSQL_PASSWORD}
```

### Service Won't Start
```bash
# Check logs
docker-compose logs SERVICE_NAME

# Check for errors
docker-compose logs SERVICE_NAME | grep -i error

# Rebuild
docker-compose build SERVICE_NAME
docker-compose up -d SERVICE_NAME
```

### Nginx 502 Bad Gateway
```bash
# Check if backend services are running
docker-compose ps

# Check backend health
curl http://localhost:8001/api/auth/health/
curl http://localhost:8002/api/courses/health/
curl http://localhost:8003/api/catalog/health/
curl http://localhost:8004/api/planned-courses/health/

# Check nginx logs
docker-compose logs nginx
```

## Sign-Off

- [ ] All services running
- [ ] All health checks passing
- [ ] All endpoints tested
- [ ] Frontend working
- [ ] Data seeded
- [ ] Documentation reviewed
- [ ] Backup tested
- [ ] Monitoring configured

**Deployed by**: _______________
**Date**: _______________
**Verified by**: _______________
**Date**: _______________

## Next Steps After Deployment

1. Monitor logs for the first 24 hours
2. Set up automated backups
3. Configure SSL/HTTPS for production
4. Set up monitoring and alerting
5. Load test the application
6. Document any custom configurations
7. Train team on new architecture
8. Update CI/CD pipelines

## Rollback Plan

If deployment fails:

```bash
# Stop all services
docker-compose down

# Restore database from backup
docker-compose up -d db
docker-compose exec -T db mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} < backup.sql

# Use previous version (if available)
git checkout <previous-commit>
docker-compose up -d --build
```

## Success Criteria

✅ All services healthy
✅ All endpoints responding
✅ Frontend accessible
✅ User can register
✅ User can login
✅ User can view courses
✅ User can plan courses
✅ No errors in logs
✅ Acceptable performance
✅ Data properly seeded
