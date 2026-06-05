"""
Library Serializers
Critical: the 'user' field is always set from request.user — never from the request body.
This ensures users can ONLY add games to their OWN library.
"""

from rest_framework import serializers
from .models import LibraryEntry
from apps.games.serializers import GameListSerializer


class LibraryEntrySerializer(serializers.ModelSerializer):
    """
    Full serializer for the library.
    On read: returns full game details (nested).
    On write: user only sends the game ID.
    """
    # Nested game info for read operations
    game_detail = GameListSerializer(source='game', read_only=True)

    # playtime formatted as hours
    playtime_hours = serializers.FloatField(read_only=True)

    class Meta:
        model = LibraryEntry
        fields = (
            'id', 'game', 'game_detail', 'added_at',
            'playtime_minutes', 'playtime_hours', 'personal_note'
        )
        read_only_fields = ('id', 'added_at', 'game_detail', 'playtime_hours')
        # 'game' is the write field (user sends game ID)
        # 'game_detail' is the read field (API returns full game data)

    # ── Business Rule Validations ──────────────────────────────────────────────

    def validate_game(self, game):
        """
        Business rule: only active games can be added to a library.
        """
        if not game.is_active:
            raise serializers.ValidationError(
                'This game is no longer available and cannot be added to your library.'
            )
        return game

    def validate_playtime_minutes(self, value):
        """Playtime cannot be unreasonably large (sanity check)."""
        if value > 1_000_000:  # ~1.9 years of playtime
            raise serializers.ValidationError('Playtime value is unreasonably large.')
        return value

    def validate(self, attrs):
        """
        Business rule: a user cannot add the same game twice.
        We check this here (serializer level) to return a clean error message.
        The database unique_together is a safety net — this gives a better UX error.
        """
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user = request.user
            game = attrs.get('game')
            # Only validate on creation (not on update)
            if self.instance is None and game:
                if LibraryEntry.objects.filter(user=user, game=game).exists():
                    raise serializers.ValidationError(
                        {'game': 'This game is already in your library.'}
                    )
        return attrs

    def create(self, validated_data):
        """
        Override create to automatically set user = request.user.
        The user NEVER sends their own user ID — we extract it from the token.
        """
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
