"""
Games Serializers
Business logic validation lives here — not in views.
"""

from rest_framework import serializers
from .models import Game, Genre


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ('id', 'name')


class GameSerializer(serializers.ModelSerializer):
    """
    Full serializer used for create/update (write operations).
    """
    # Read-only computed fields
    genre_name = serializers.CharField(source='genre.name', read_only=True)
    is_free = serializers.BooleanField(read_only=True)
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = (
            'id', 'title', 'description', 'developer', 'publisher',
            'genre', 'genre_name', 'price', 'is_free', 'release_date',
            'cover_image', 'is_active', 'created_at', 'average_rating'
        )
        read_only_fields = ('id', 'created_at', 'is_free', 'genre_name', 'average_rating')

    def get_average_rating(self, obj):
        """Compute average review rating on the fly."""
        reviews = obj.reviews.all()
        if not reviews.exists():
            return None
        total = sum(r.rating for r in reviews)
        return round(total / reviews.count(), 1)

    # ── Business Rule Validations ──────────────────────────────────────────────

    def validate_price(self, value):
        """Price must be between 0 and 999.99."""
        if value < 0:
            raise serializers.ValidationError('Price cannot be negative.')
        if value > 999.99:
            raise serializers.ValidationError('Price cannot exceed 999.99.')
        return value

    def validate_title(self, value):
        """Title must have at least 2 characters."""
        if len(value.strip()) < 2:
            raise serializers.ValidationError('Title must be at least 2 characters long.')
        return value.strip()

    def validate(self, attrs):
        """Cross-field validation: release_date must be a real date."""
        # Additional cross-field rules can be added here
        return attrs


class GameListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for list views — only essential fields.
    Avoids sending full descriptions in list endpoints (performance).
    """
    genre_name = serializers.CharField(source='genre.name', read_only=True)
    is_free = serializers.BooleanField(read_only=True)
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = ('id', 'title', 'developer', 'genre_name', 'price', 'is_free',
                  'release_date', 'cover_image', 'average_rating')

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if not reviews.exists():
            return None
        total = sum(r.rating for r in reviews)
        return round(total / reviews.count(), 1)
