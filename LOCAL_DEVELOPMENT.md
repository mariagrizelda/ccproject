# Local Development Guide (Without Docker)

## Prerequisites

- Python 3.12+
- MySQL 8.0+ (or use SQLite for development)
- Node.js 18+ (for frontend)

## Backend Setup

### 1. Create Python Virtual Environment

```bash
cd backend

# Create virtual environment
python3 -m venv env

# Activate virtual environment
source env/bin/activate  # On macOS/Linux
# or
env\Scripts\activate  # On Windows
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Create Local Environment File

Create a `.env` file in the `backend/` directory:

```bash
# backend/.env
SECRET_KEY=your-local-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000

# For SQLite (easiest for local dev)
DB_ENGINE=sqlite3
DB_NAME=db.sqlite3

# OR for MySQL (if you have it installed)
# DB_ENGINE=mysql
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=ccproject_db
# DB_USER=root
# DB_PASSWORD=your_password
```

### 4. Run Migrations

```bash
cd backend
source env/bin/activate

# Run migrations with shared models
python manage.py migrate
```

### 5. Seed Data

```bash
# Insert sample course data
python manage.py insert_data

# Optionally scrape programs (requires internet)
python manage.py scrape_programs --force
```

### 6. Create Superuser

```bash
python manage.py createsuperuser
```

### 7. Run Each Microservice

You need to run each service in a separate terminal window:

**Terminal 1 - Auth Service:**
```bash
cd backend
source env/bin/activate
export DJANGO_SETTINGS_MODULE=backend.settings_auth
python manage.py runserver 8001
```

**Terminal 2 - Courses Service:**
```bash
cd backend
source env/bin/activate
export DJANGO_SETTINGS_MODULE=backend.settings_courses
python manage.py runserver 8002
```

**Terminal 3 - Catalog Service:**
```bash
cd backend
source env/bin/activate
export DJANGO_SETTINGS_MODULE=backend.settings_catalog
python manage.py runserver 8003
```

**Terminal 4 - Planner Service:**
```bash
cd backend
source env/bin/activate
export DJANGO_SETTINGS_MODULE=backend.settings_planner
python manage.py runserver 8004
```

### 8. Configure Local Nginx (Optional)

If you want to use Nginx locally:

```bash
# On macOS
brew install nginx

# Edit nginx config
# Add the contents of nginx.conf to /opt/homebrew/etc/nginx/nginx.conf

# Start nginx
brew services start nginx
```

**OR use the development proxy script below.**

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Create Frontend Environment File

Create `.env.local` in the `frontend/` directory:

```bash
# For use with Nginx proxy
NEXT_PUBLIC_API_URL=http://localhost/api

# OR to access services directly (no nginx)
# NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Run Frontend

```bash
cd frontend
npm run dev
```

Frontend will be available at http://localhost:3000

## Running Without Nginx (Direct Access)

If you don't want to set up Nginx locally, you can access services directly:

1. **Update frontend API URL:**
```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8001/api
```

2. **Access endpoints directly:**
- Auth: http://localhost:8001/api/auth/
- Courses: http://localhost:8002/api/courses/
- Catalog: http://localhost:8003/api/catalog/
- Planner: http://localhost:8004/api/planned-courses/

3. **Note:** You'll need to update frontend code to route to different ports for different services, or use the development proxy below.

## Simple Development Proxy (Alternative to Nginx)

Create a simple Node.js proxy for local development:

**dev-proxy.js** (in project root):
```javascript
const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Route to services
  if (req.url.startsWith('/api/auth/')) {
    proxy.web(req, res, { target: 'http://localhost:8001' });
  } else if (req.url.startsWith('/api/courses/')) {
    proxy.web(req, res, { target: 'http://localhost:8002' });
  } else if (req.url.startsWith('/api/catalog/')) {
    proxy.web(req, res, { target: 'http://localhost:8003' });
  } else if (req.url.startsWith('/api/planned-courses/')) {
    proxy.web(req, res, { target: 'http://localhost:8004' });
  } else {
    proxy.web(req, res, { target: 'http://localhost:3000' });
  }
});

server.listen(8000);
console.log('Development proxy running on http://localhost:8000');
```

**Install http-proxy:**
```bash
npm install -g http-proxy
```

**Run the proxy:**
```bash
node dev-proxy.js
```

Then access everything through http://localhost:8000

## Using SQLite for Local Development

For easier local development, you can use SQLite instead of MySQL.

Create `backend/backend/settings_local.py`:

```python
from .settings_auth import *

# Override database to use SQLite
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Disable some checks for local dev
DEBUG = True
ALLOWED_HOSTS = ['*']
CORS_ALLOW_ALL_ORIGINS = True
```

Then run services with:
```bash
export DJANGO_SETTINGS_MODULE=backend.settings_local
python manage.py runserver 8001
```

## Quick Start Script

Create `backend/run_local.sh`:

```bash
#!/bin/bash

# Activate virtual environment
source env/bin/activate

# Load environment variables
export $(cat .env | xargs)

# Set debug mode
export DEBUG=True

# Run migrations
python manage.py migrate

# Seed data if needed
python manage.py insert_data

# Run all services in background
echo "Starting Auth Service on port 8001..."
DJANGO_SETTINGS_MODULE=backend.settings_auth python manage.py runserver 8001 &
AUTH_PID=$!

echo "Starting Courses Service on port 8002..."
DJANGO_SETTINGS_MODULE=backend.settings_courses python manage.py runserver 8002 &
COURSES_PID=$!

echo "Starting Catalog Service on port 8003..."
DJANGO_SETTINGS_MODULE=backend.settings_catalog python manage.py runserver 8003 &
CATALOG_PID=$!

echo "Starting Planner Service on port 8004..."
DJANGO_SETTINGS_MODULE=backend.settings_planner python manage.py runserver 8004 &
PLANNER_PID=$!

echo "All services started!"
echo "Auth Service: http://localhost:8001"
echo "Courses Service: http://localhost:8002"
echo "Catalog Service: http://localhost:8003"
echo "Planner Service: http://localhost:8004"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "kill $AUTH_PID $COURSES_PID $CATALOG_PID $PLANNER_PID; exit" INT
wait
```

Make it executable:
```bash
chmod +x backend/run_local.sh
```

Run it:
```bash
cd backend
./run_local.sh
```

## Testing Individual Services

### Test Auth Service
```bash
cd backend
source env/bin/activate
export DJANGO_SETTINGS_MODULE=backend.settings_auth
export DEBUG=True
export SECRET_KEY=test-key
export ALLOWED_HOSTS=localhost,127.0.0.1
export CORS_ALLOWED_ORIGINS=http://localhost:3000
export DB_ENGINE=sqlite3
export DB_NAME=db.sqlite3

python manage.py runserver 8001
```

### Test Health Endpoints
```bash
curl http://localhost:8001/api/auth/health/
curl http://localhost:8002/api/courses/health/
curl http://localhost:8003/api/catalog/health/
curl http://localhost:8004/api/planned-courses/health/
```

## Troubleshooting

### Error: 'NoneType' object has no attribute 'lower'

This means environment variables are not set. Solutions:

1. **Create .env file** in backend directory (see step 3 above)
2. **Export variables manually:**
```bash
export DEBUG=True
export SECRET_KEY=your-secret-key
export ALLOWED_HOSTS=localhost
export CORS_ALLOWED_ORIGINS=http://localhost:3000
```

3. **Use settings_local.py** with hardcoded values for development

### Port Already in Use

```bash
# Find what's using the port
lsof -i :8001

# Kill the process
kill -9 PID
```

### Database Connection Errors

If using MySQL and getting connection errors:

1. Make sure MySQL is running: `mysql.server start`
2. Create database: `mysql -u root -p -e "CREATE DATABASE ccproject_db;"`
3. Check credentials in .env file

Or switch to SQLite for easier local development.

### Import Errors

Make sure you're in the virtual environment:
```bash
source env/bin/activate
which python  # Should point to env/bin/python
```

## Development Workflow

1. **Start backend services** (4 terminals or use run_local.sh)
2. **Start frontend** in separate terminal
3. **Make changes** to code
4. **Services auto-reload** on file changes
5. **Test changes** in browser

## Environment Variables Reference

Required for all services:
- `SECRET_KEY` - Django secret key
- `DEBUG` - Debug mode (True for local dev)
- `ALLOWED_HOSTS` - Comma-separated allowed hosts
- `CORS_ALLOWED_ORIGINS` - Comma-separated CORS origins

Database options:
- `DB_ENGINE` - sqlite3 or mysql
- `DB_NAME` - Database name or path
- `DB_USER` - MySQL user (not needed for SQLite)
- `DB_PASSWORD` - MySQL password (not needed for SQLite)
- `DB_HOST` - MySQL host (not needed for SQLite)
- `DB_PORT` - MySQL port (not needed for SQLite)

## Tips

1. **Use SQLite for local dev** - Much easier than MySQL
2. **Run services in background** with `&` or use tmux/screen
3. **Use Django Debug Toolbar** for debugging
4. **Enable hot reload** in frontend with `npm run dev`
5. **Use Postman** for API testing
6. **Check logs** if services aren't responding

## Next Steps

Once local development is working:
1. Test all API endpoints
2. Make your changes
3. Test in local environment
4. Commit changes
5. Deploy with Docker Compose for production
