"""
Games URL patterns.
Mounted at: /api/
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GameViewSet, GenreViewSet

# DRF Router automatically generates all CRUD URLs
router = DefaultRouter()
router.register(r'games', GameViewSet, basename='game')
router.register(r'genres', GenreViewSet, basename='genre')

# Generated routes:
# GET    /api/games/          → list all games
# POST   /api/games/          → create game (admin)
# GET    /api/games/{id}/     → get one game
# PUT    /api/games/{id}/     → full update (admin)
# PATCH  /api/games/{id}/     → partial update (admin)
# DELETE /api/games/{id}/     → delete (admin)
# Same for /api/genres/

urlpatterns = [
    path('', include(router.urls)),
]
