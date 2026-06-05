# 🎮 Mini Steam — Game Distribution Platform

> End-of-semester project | Fullstack Web Development | Institut Universitaire Saint Jean
> Course instructor: Mr. KINKEU Daniel | Academic year 2025–2026

---

## 🌐 Live URLs

| Service  | URL |
|----------|-----|
| 🖥️ Frontend (Vercel) | `https://ministeam.vercel.app` *(update after deploy)* |
| ⚙️ Backend API (Render) | `https://ministeam-backend.onrender.com` *(update after deploy)* |
| 🔑 Demo account | username: `demo` / password: `demo1234!` |

---

## 📋 Project Description

Mini Steam is a simplified Steam-like game distribution platform built as a fullstack web application.

**Users can:**
- Create an account and log in with JWT authentication
- Browse a catalog of games with search and filter options
- View detailed information about each game
- Add games to their personal library
- Leave reviews and ratings for games they own
- Manage their profile

**Tech stack:**
- **Backend:** Python · Django 5 · Django REST Framework · SimpleJWT
- **Frontend:** Angular 17 · TypeScript · Bootstrap 5
- **Database:** PostgreSQL (production) · SQLite (development)
- **Deployment:** Render (backend) · Vercel (frontend)

---

## 🗂️ Repository Structure

```
ministeam/                   ← monorepo root
│
├── backend/                 ← Django project
│   ├── apps/
│   │   ├── accounts/        ← User registration & profile
│   │   ├── games/           ← Game catalog & genres
│   │   ├── library/         ← User game libraries
│   │   └── reviews/         ← Game reviews & ratings
│   ├── ministeam/           ← Django settings, urls, wsgi
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                ← Angular project
│   ├── src/
│   │   ├── app/
│   │   │   ├── guards/      ← AuthGuard, GuestGuard
│   │   │   ├── interceptors/← JWT HTTP Interceptor
│   │   │   ├── models/      ← TypeScript interfaces
│   │   │   ├── pages/       ← login, register, catalog, game-detail, library, profile
│   │   │   └── services/    ← auth, games, library, reviews
│   │   ├── environments/    ← dev & production API URLs
│   │   └── styles.css
│   ├── angular.json
│   ├── package.json
│   └── vercel.json
│
├── render.yaml              ← Render deployment config
├── .gitignore
└── README.md
```

---

## ⚙️ API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register/` | ❌ | Create account |
| POST | `/api/auth/login/` | ❌ | Get JWT tokens |
| POST | `/api/auth/refresh/` | ❌ | Refresh access token |
| GET/PUT | `/api/auth/me/` | ✅ | User profile |
| GET | `/api/games/` | ✅ | List games (+ search/filter) |
| GET | `/api/games/{id}/` | ✅ | Game detail |
| GET | `/api/genres/` | ✅ | List genres |
| GET/POST | `/api/library/` | ✅ | User's library |
| GET/PATCH/DELETE | `/api/library/{id}/` | ✅ | Library entry |
| GET | `/api/library/game/{id}/` | ✅ | Check if game is in library |
| GET/POST | `/api/reviews/` | ✅ | Reviews |
| GET/PATCH/DELETE | `/api/reviews/{id}/` | ✅ | Single review |

---

## 🛠️ Local Installation

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- Git

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/ministeam.git
cd ministeam
```

---

### 2. Backend setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate          # macOS / Linux
# OR: venv\Scripts\activate       # Windows

# Install dependencies
pip install -r requirements.txt

# Create your local environment file
cp .env.example .env
# Edit .env and set your SECRET_KEY (any random string is fine for dev)

# Run database migrations
python manage.py migrate

# (Optional) Create a superuser to access Django Admin
python manage.py createsuperuser

# (Optional) Load sample data
python manage.py loaddata fixtures/sample_data.json

# Start the development server
python manage.py runserver
```

The backend is now running at **http://localhost:8000**

- Django Admin: http://localhost:8000/admin/
- DRF Browsable API: http://localhost:8000/api/

---

### 3. Frontend setup

Open a **new terminal**:

```bash
cd ministeam/frontend

# Install Node dependencies
npm install

# Start the Angular development server
npm start
```

The frontend is now running at **http://localhost:4200**

---

### 4. First-time setup

1. Go to http://localhost:4200/register and create an account
2. Or use the admin to create games and users: http://localhost:8000/admin/

---

## 🚀 Deployment

### Backend → Render

1. **Create a Render account** at https://render.com

2. **Push your code to GitHub** (see Git section below)

3. **Create a new Web Service** on Render:
   - Connect your GitHub repository
   - Set **Root Directory** to `backend`
   - **Build command:**
     ```
     pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
     ```
   - **Start command:**
     ```
     gunicorn ministeam.wsgi:application
     ```

4. **Set Environment Variables** in Render's dashboard (never in code!):

   | Key | Value |
   |-----|-------|
   | `SECRET_KEY` | any long random string |
   | `DEBUG` | `False` |
   | `ALLOWED_HOSTS` | `your-app.onrender.com` |
   | `CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app` |
   | `DATABASE_URL` | *(set automatically by Render's PostgreSQL add-on)* |

5. **Add a PostgreSQL database:**
   - In Render dashboard → New → PostgreSQL
   - Link it to your web service

6. **Create a superuser** via Render's shell:
   ```
   python manage.py createsuperuser
   ```

---

### Frontend → Vercel

1. **Create a Vercel account** at https://vercel.com

2. **Update the production API URL** in:
   `frontend/src/environments/environment.production.ts`
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://YOUR-APP.onrender.com/api'
   };
   ```
   Commit and push this change.

3. **Import your repository** on Vercel:
   - Select the `frontend` folder as the root directory
   - Framework preset: **Angular**
   - Build command: `npm run build:prod`
   - Output directory: `dist/ministeam`

4. Vercel will deploy automatically on every push to `main`.

5. **Update CORS on Render** with your Vercel URL:
   ```
   CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
   ```

---

## 📦 Git — Commit Strategy

A good commit history is part of the grade. Follow this workflow:

```bash
# Initial setup
git init
git remote add origin https://github.com/YOUR_USERNAME/ministeam.git

# Stage and commit
git add .
git commit -m "feat: initial project structure"
git push -u origin main
```

### Recommended commit sequence

```
feat: initial Django project setup and app structure
feat: add Game and Genre models with admin registration
feat: implement JWT authentication with SimpleJWT
feat: add DRF serializers with business rule validation
feat: add ViewSets and URL routing for all entities
feat: add Library model with user ownership filtering
feat: add Reviews model with library membership check
fix: configure CORS for Angular dev and production
feat: Angular project init with routing and auth guard
feat: implement JWT interceptor and auth service
feat: build login and register pages with reactive forms
feat: build game catalog with search and filters
feat: build game detail page with library and review actions
feat: build library page with note editing
feat: add user profile page
feat: configure Angular environment files
deploy: add Render and Vercel deployment configs
docs: complete README with setup and deployment guide
```

### Rules to avoid penalties
- ✅ Commit **every time you finish a feature** — not at the end
- ✅ Use descriptive commit messages (`feat:`, `fix:`, `docs:`, `deploy:`)
- ✅ Never commit `.env`, `db.sqlite3`, or `node_modules/`
- ✅ Push to GitHub regularly so progress is visible

---

## 📝 Grading Checklist

| Criterion | Implementation |
|-----------|---------------|
| ✅ Models + DRF API | `Game`, `Genre`, `LibraryEntry`, `Review` with full CRUD |
| ✅ JWT Authentication | SimpleJWT login/refresh + Angular Interceptor |
| ✅ Django Admin | All models registered with custom columns and filters |
| ✅ Angular Structure | `pages/`, `services/`, `models/`, `guards/`, `interceptors/` |
| ✅ HTTP Services | Dedicated service per entity, error handling |
| ✅ Forms & Validation | Reactive Forms + DRF server-side errors displayed |
| ✅ Business Rules | Library ownership, one review per game, active games only |
| ✅ UI/UX | Steam-inspired dark theme, spinners, success/error messages |
| ✅ GitHub | Monorepo, regular commits, complete README |
| ✅ Deployment | Render (backend) + Vercel (frontend) |
| ⭐ Bonus | Django Admin customisation: thumbnails, badges, collapsible sections |

---

## 👤 Author

**[Your Name]**
Year 2 — Institut Universitaire Saint Jean (Saint Jean Ingenieur)
Course: Fullstack Web Development | Mr. KINKEU Daniel | 2025–2026
