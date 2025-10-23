# 🚀 Quick Start - Local Development

## The Problem You Had

Running `python manage.py runserver` failed because:
- The old `settings.py` required environment variables
- You didn't have a `.env` file with those variables
- Error: `'NoneType' object has no attribute 'lower'`

## ✅ Solution - 3 Options

### Option 1: Single Server (EASIEST - Recommended for Testing)

Run ALL microservices in ONE server on port 8000:

```bash
cd backend
./run_single_server.sh
```

Access at: http://localhost:8000/api/

**Pros:** 
- ✅ Simplest setup
- ✅ One command to start
- ✅ Perfect for testing
- ✅ No nginx needed

**Cons:**
- ⚠️ Not true microservices (all in one process)

---

### Option 2: Separate Services (TRUE MICROSERVICES)

Run each service on its own port (8001-8004):

```bash
cd backend
./run_local_services.sh
```

Services:
- Auth: http://localhost:8001/api/auth/
- Courses: http://localhost:8002/api/courses/
- Catalog: http://localhost:8003/api/catalog/
- Planner: http://localhost:8004/api/planned-courses/

**Pros:**
- ✅ True microservices architecture
- ✅ Matches production setup
- ✅ Better for testing service isolation

**Cons:**
- ⚠️ Frontend needs to know about different ports
- ⚠️ More complex setup

---

### Option 3: Docker Compose (PRODUCTION-LIKE)

Use Docker like production:

```bash
# Create .env file first
cp env.example .env
# Edit .env with your settings

# Start all services
docker-compose up --build -d
```

Access at: http://localhost/api/

**Pros:**
- ✅ Identical to production
- ✅ Includes nginx, mysql, all services
- ✅ Isolated environments

**Cons:**
- ⚠️ Slower iteration (rebuild on changes)
- ⚠️ Requires Docker

---

## 📝 Quick Commands

### First Time Setup

```bash
cd backend

# Create virtual environment
python3 -m venv env
source env/bin/activate  # On macOS/Linux
# or
env\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate --settings=backend.settings_local

# Seed data
python manage.py insert_data --settings=backend.settings_local
```

### Start Single Server (All Services)

```bash
cd backend
./run_single_server.sh
```

### Start Separate Services

```bash
cd backend
./run_local_services.sh
```

### Manual Start (Any Service)

```bash
cd backend
source env/bin/activate

# Auth Service
export DJANGO_SETTINGS_MODULE=backend.settings_auth
python manage.py runserver 8001

# Courses Service  
export DJANGO_SETTINGS_MODULE=backend.settings_courses
python manage.py runserver 8002

# Catalog Service
export DJANGO_SETTINGS_MODULE=backend.settings_catalog
python manage.py runserver 8003

# Planner Service
export DJANGO_SETTINGS_MODULE=backend.settings_planner
python manage.py runserver 8004

# All services in one (local dev)
export DJANGO_SETTINGS_MODULE=backend.settings_local
python manage.py runserver 8000
```

---

## 🧪 Test Your Setup

### 1. Test Health Endpoints

**Single Server:**
```bash
curl http://localhost:8000/api/auth/health/
curl http://localhost:8000/api/courses/health/
curl http://localhost:8000/api/catalog/health/
curl http://localhost:8000/api/planned-courses/health/
```

**Separate Services:**
```bash
curl http://localhost:8001/api/auth/health/
curl http://localhost:8002/api/courses/health/
curl http://localhost:8003/api/catalog/health/
curl http://localhost:8004/api/planned-courses/health/
```

### 2. Test Registration

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@test.com",
    "password": "testpass123",
    "program_level": "UNDERGRAD",
    "program": "Computer Science",
    "year_intake": "SEM1"
  }'
```

### 3. Test Login

```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass123"}'
```

### 4. View Courses

```bash
curl http://localhost:8000/api/courses/
```

---

## 🎯 Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Create Environment File

**For Single Server:**
```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**For Separate Services:**
```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8001/api
# Note: You may need to update frontend code to route to different ports
```

**For Docker:**
```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost/api
```

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

Access at: http://localhost:3000

---

## 🔧 Troubleshooting

### "Virtual environment not found"
```bash
cd backend
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
```

### "Port already in use"
```bash
# Find and kill process
lsof -i :8000
kill -9 <PID>

# Or use the cleanup in the scripts
```

### "Database not found"
```bash
cd backend
source env/bin/activate
python manage.py migrate --settings=backend.settings_local
python manage.py insert_data --settings=backend.settings_local
```

### "Module not found"
```bash
# Make sure virtual environment is activated
cd backend
source env/bin/activate
which python  # Should show path to env/bin/python
```

### View Logs (Separate Services)
```bash
tail -f /tmp/auth_svc.log
tail -f /tmp/courses_svc.log
tail -f /tmp/catalog_svc.log
tail -f /tmp/planner_svc.log
```

---

## 📚 Files Created for Local Development

1. **backend/backend/settings_local.py** - Local dev settings with SQLite
2. **backend/backend/urls_local.py** - All services in one URL conf
3. **backend/run_single_server.sh** - Start all services in one server
4. **backend/run_local_services.sh** - Start services separately
5. **LOCAL_DEVELOPMENT.md** - Detailed local dev guide

---

## 🎓 What Each Settings File Does

- **settings.py** - Original settings (now with defaults)
- **settings_local.py** - All services in one (for testing)
- **settings_auth.py** - Auth service only (port 8001)
- **settings_courses.py** - Courses service only (port 8002)
- **settings_catalog.py** - Catalog service only (port 8003)
- **settings_planner.py** - Planner service only (port 8004)

---

## 💡 Recommendations

**For Quick Testing:**
→ Use **Option 1** (Single Server)

**For Development:**
→ Use **Option 1** or **Option 2** based on your needs

**Before Deploying:**
→ Always test with **Option 3** (Docker Compose)

---

## 🚀 Next Steps

1. Start backend: `cd backend && ./run_single_server.sh`
2. Start frontend: `cd frontend && npm run dev`
3. Open browser: http://localhost:3000
4. Test registration and login
5. Make your changes
6. Test with Docker before deploying

---

## 📞 Need Help?

- Check logs: `tail -f /tmp/*_svc.log`
- Check running processes: `ps aux | grep python`
- Check ports: `lsof -i :8000`
- Read full guide: `LOCAL_DEVELOPMENT.md`
