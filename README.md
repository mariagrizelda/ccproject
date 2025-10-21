## 0) Prerequisites
Install these
- **Node.js** 
- **Python** 

# 1) Backend (Django)
```
cd backend
python -m venv .venv && source .venv/bin/activate   # For Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000

# check → http://localhost:8000/api/ping/
```

# 2) Frontend (Next.js)
```
cd ../frontend
npm install
npm run dev

# check → http://localhost:3000
```