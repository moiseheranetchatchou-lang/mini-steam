"""
Library Views
Every query is filtered by request.user — users only see their own library.
"""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import LibraryEntry
from .serializers import LibraryEntrySerializer


class LibraryViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for Library Entries (per user).

    - GET    /api/library/           → List user's games
    - POST   /api/library/           → Add a game to library
    - GET    /api/library/{id}/      → Get one entry
    - PATCH  /api/library/{id}/      → Update note or playtime
    - DELETE /api/library/{id}/      → Remove from library
    """
    serializer_class = LibraryEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        CRITICAL: Always filter by the logged-in user.
        This is the core data isolation requirement from the brief.
        """
        return LibraryEntry.objects.filter(
            user=self.request.user
        ).select_related('game', 'game__genre')

    def get_serializer_context(self):
        """
        Pass request to serializer so it can access request.user
        during validation and creation.
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=False, methods=['get'], url_path='game/(?P<game_id>[^/.]+)')
    def check_game(self, request, game_id=None):
        """
        Custom endpoint: check if a specific game is in the user's library.
        GET /api/library/game/{game_id}/
        Returns: { "in_library": true/false, "entry_id": int|null }
        """
        entry = self.get_queryset().filter(game_id=game_id).first()
        if entry:
            return Response({'in_library': True, 'entry_id': entry.id})
        return Response({'in_library': False, 'entry_id': None})
