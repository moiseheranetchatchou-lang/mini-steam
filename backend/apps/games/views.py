"""
Games Views
Games are read-only for regular users.
Only admin users (is_staff=True) can create, update, or delete games.
This reflects the real Steam model: only publishers/admins add games.
"""

from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Game, Genre
from .serializers import GameSerializer, GameListSerializer, GenreSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission:
    - Any authenticated user can read (GET, HEAD, OPTIONS).
    - Only admin users (is_staff) can write (POST, PUT, PATCH, DELETE).
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_staff


class GameViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for Games.
    - List: GET  /api/games/
    - Detail: GET  /api/games/{id}/
    - Create: POST /api/games/          (admin only)
    - Update: PUT  /api/games/{id}/     (admin only)
    - Delete: DELETE /api/games/{id}/   (admin only)
    """
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'developer', 'publisher', 'genre__name']
    ordering_fields = ['title', 'price', 'release_date', 'created_at']
    ordering = ['title']

    def get_queryset(self):
        """
        Return only active games to regular users.
        Admins can see all games (for management).
        Also supports filtering by genre and price range via query params.
        """
        # Start with active games only
        queryset = Game.objects.select_related('genre').prefetch_related('reviews')

        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)

        # Optional: filter by genre (?genre=1)
        genre_id = self.request.query_params.get('genre')
        if genre_id:
            queryset = queryset.filter(genre_id=genre_id)

        # Optional: filter by max price (?max_price=20)
        max_price = self.request.query_params.get('max_price')
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # Optional: only free games (?free=true)
        free_only = self.request.query_params.get('free')
        if free_only and free_only.lower() == 'true':
            queryset = queryset.filter(price=0)

        return queryset

    def get_serializer_class(self):
        """Use lightweight serializer for list, full for detail/write."""
        if self.action == 'list':
            return GameListSerializer
        return GameSerializer


class GenreViewSet(viewsets.ModelViewSet):
    """CRUD for Genres. Admin-only for write operations."""
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [IsAdminOrReadOnly]
