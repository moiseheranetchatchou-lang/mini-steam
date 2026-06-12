"""
Mini Steam - Django Settings
Production-ready configuration using environment variables.
"""

import os
from pathlib import Path
from datetime import timedelta
import dj_database_url
from decouple import config

# ─── Base Directory ────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent

# ─── Security ──────────────────────────────────────────────────────────────────
# IMPORTANT: Set this in your .env file. Never commit the real value.
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-me-in-production')

# Set to False in production. Controlled via .env.
DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = config(
    'ALLOWED_HOSTS',
    default='localhost,127.0.0.1',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

# ─── Installed Apps ────────────────────────────────────────────────────────────
INSTALLED_APPS = [
    # Django built-ins
    'jazzmin'
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    # Our apps
    'apps.accounts',
    'apps.games',
    'apps.library',
    'apps.reviews',
]

# ─── Middleware ─────────────────────────────────────────────────────────────────
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',        # Must be first
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',   # Static files in production
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ministeam.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'ministeam.wsgi.application'

# ─── Database ──────────────────────────────────────────────────────────────────
# Uses DATABASE_URL env var (set by Render automatically).
# Falls back to SQLite for local development.
DATABASE_URL = config('DATABASE_URL', default=f'sqlite:///{BASE_DIR / "db.sqlite3"}')

DATABASES = {
    'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600)
}

# ─── Password Validation ────────────────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ─── Internationalisation ───────────────────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ─── Static & Media Files ───────────────────────────────────────────────────────
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ─── Django REST Framework ──────────────────────────────────────────────────────
REST_FRAMEWORK = {
    # All endpoints require authentication by default
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# ─── JWT Configuration ──────────────────────────────────────────────────────────
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,           # New refresh token on each use
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
}

# ─── CORS Configuration ─────────────────────────────────────────────────────────
# Allow Angular dev server and production Vercel URL
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:4200',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

# Allow cookies to be sent cross-origin (needed for some auth flows)
CORS_ALLOW_CREDENTIALS = True

JAZZMIN_SETTINGS = {
    "site_title": "Mini Steam Admin",
    "site_header": "Mini Steam",
    "site_brand": "Mini Steam",
    # Logo pour le menu (optionnel)
    "site_logo": None, 
    "welcome_sign": "Bienvenue sur l'administration de Mini Steam",
    "search_model": ["auth.User", "games.Game"], # Adaptez selon vos modèles
    "show_ui_builder": True, # Cela vous permet de changer les couleurs en direct !
    
    # Thème de navigation
    "navigation_expanded": True,
    "topmenu_links": [
        {"name": "Accueil",  "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "Voir le site", "url": "https://votre-lien-vercel.app", "new_window": True},
    ],
}

JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-dark",
    "accent": "accent-primary",
    "navbar": "navbar-dark", # Barre du haut sombre
    "no_navbar_border": False,
    "navbar_fixed": False,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": False,
    "sidebar": "sidebar-dark-primary", # Menu latéral sombre avec surbrillance bleue
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": False,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "darkly", # C'est le thème qui se rapproche le plus de votre image (Bootswatch)
    "dark_mode_theme": "darkly",
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success"
    }
}
