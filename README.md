# 🎮 Mini Steam — Game Distribution Platform

> End-of-semester project | Fullstack Web Development | Institut Universitaire Saint Jean
> Course instructor: Mr. KINKEU Daniel | Academic year 2025–2026

---

## 🌐 Live URLs

| Service | URL |
|---------|-----|
| 🖥️ **Frontend (Vercel)** | https://mini-steam.vercel.app |
| ⚙️ **Backend API (Render)** | https://mini-steam-bnn1.onrender.com |
| 🔧 **Django Admin** | https://mini-steam-bnn1.onrender.com/admin/ |
| 📦 **GitHub Repository** | https://github.com/moiseheranetchatchou-lang/mini-steam |

---

## 🔑 Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| 👤 Regular user | `demo` | `demo1234!` |
| 🔧 Admin | `admin` | `admin1234!` |

---

## 📋 Project Description

Mini Steam is a simplified Steam-like game distribution platform built as a fullstack web application using Django REST Framework and Angular 17.

**Users can:**
- Create an account and log in with JWT authentication
- Browse a catalog of games with search and filter options
- View detailed information about each game
- Add games to their personal library
- Leave reviews and ratings for games they own
- Manage their profile and account details

**Tech stack:**
- **Backend:** Python 3.12 · Django 5 · Django REST Framework · SimpleJWT
- **Frontend:** Angular 17 · TypeScript · Bootstrap 5
- **Database:** SQLite (development) · PostgreSQL (production)
- **Deployment:** Render (backend) · Vercel (frontend)

---

## 🗂️ Repository Structure

```
ministeam/
├── backend/
│   ├── apps/
│   │   ├── accounts/        ← User registration & profile
│   │   ├── games/           ← Game catalog & genres
│   │   ├── library/         ← User game libraries
│   │   └── reviews/         ← Game reviews & ratings
│   ├── ministeam/           ← Django settings, urls, wsgi
│   ├── media/               ← Uploaded game cover images
│   ├── staticfiles/         ← Collected static files
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
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
├── render.yaml
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
| GET | `/api/games/` | ✅ | List games + search/filter |
| GET | `/api/games/{id}/` | ✅ | Game detail |
| GET | `/api/genres/` | ✅ | List genres |
| GET/POST | `/api/library/` | ✅ | User library |
| GET/PATCH/DELETE | `/api/library/{id}/` | ✅ | Library entry |
| GET | `/api/library/game/{id}/` | ✅ | Check if game in library |
| GET/POST | `/api/reviews/` | ✅ | Reviews |
| GET/PATCH/DELETE | `/api/reviews/{id}/` | ✅ | Single review |

---

## 🛠️ Local Installation

### Prerequisites
- Python 3.12+
- Node.js 18+ and npm
- Git

---

### 1. Clone the repository

```bash
git clone https://github.com/moiseheranetchatchou-lang/mini-steam.git
cd mini-steam
```

---

### 2. Backend setup

```powershell
cd backend

# Create and activate virtual environment (Windows PowerShell)
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
copy .env.example .env
```

Edit `.env` with these values:
```
SECRET_KEY=ministeam-secret-key-2026
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///./db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:4200
```

```powershell
# Create migrations for each app
python manage.py makemigrations accounts
python manage.py makemigrations games
python manage.py makemigrations library
python manage.py makemigrations reviews

# Apply migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic

# Load sample games + demo user
python manage.py seed_data

# Create admin superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

Backend running at **http://localhost:8000**
- Admin: http://localhost:8000/admin/
- API: http://localhost:8000/api/

---

### 3. Frontend setup

Open a **new terminal**:

```powershell
cd frontend
npm install
npm start
```

Frontend running at **http://localhost:4200**

---

## 🚀 Deployment

### Backend → Render
- **URL:** https://mini-steam-bnn1.onrender.com
- **Platform:** Render (Free tier)
- **Runtime:** Python 3
- **Build Command:** `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate && python manage.py seed_data && python manage.py createsuperuser --noinput`
- **Start Command:** `gunicorn ministeam.wsgi:application`

### Frontend → Vercel
- **URL:** https://mini-steam.vercel.app
- **Platform:** Vercel (Hobby)
- **Framework:** Angular
- **Build Command:** `npm run build:prod`
- **Output Directory:** `dist/ministeam`

---

## 📝 Grading Checklist

| # | Criterion | Details | Status |
|---|-----------|---------|--------|
| 1 | Modèles + DRF API | Game, Genre, Library, Review avec CRUD complet et validations | ✅ |
| 2 | JWT Authentication | SimpleJWT + Angular Interceptor + auto-refresh sur 401 | ✅ |
| 3 | Django Admin | Tous les modèles + customisation thumbnails, badges, filtres | ✅ |
| 4 | Angular Structure | pages/, services/, models/, guards/, interceptors/ | ✅ |
| 5 | HTTP Services | Service dédié par entité + gestion erreurs 400/401/404/500 | ✅ |
| 6 | Forms & Validation | Reactive Forms + erreurs DRF affichées côté frontend | ✅ |
| 7 | Business Rules | Ownership, une review par jeu, jeux actifs seulement | ✅ |
| 8 | UI/UX | Thème Steam dark, spinners, messages succès/erreur | ✅ |
| 9 | GitHub | Monorepo, commits réguliers, README complet | ✅ |
| 10 | Déploiement | Render (backend) + Vercel (frontend) | ✅ |
| ⭐ | Bonus Admin | Thumbnails covers, price badges, sections repliables | ✅ |

---

## 🐛 Troubleshooting Windows

| Problème | Solution |
|----------|----------|
| `source not recognized` | Utiliser `venv\Scripts\activate` sur PowerShell |
| `No such table` | Lancer `makemigrations` par app puis `migrate` |
| `Server Error 500` Admin | Lancer `python manage.py collectstatic` |
| Images ne s'affichent pas | Vérifier `DEBUG=True` dans `.env` et relancer le serveur |
| Login failed | `python manage.py shell` → `User.objects.create_user(...)` |
| `No changes detected` | `makemigrations accounts games library reviews` séparément |

---

## 👤 Author

**Tchatchou Moïse**
Year 2 — Institut Universitaire Saint Jean (Saint Jean Ingenieur)
Course: Fullstack Web Development | Mr. KINKEU Daniel | 2025–2026
