from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    game_title = serializers.CharField(source='game.title', read_only=True)

    class Meta:
        model = Review
        fields = (
            'id', 'game', 'game_title', 'username',
            'rating', 'content', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'username', 'game_title', 'created_at', 'updated_at')

    def validate_rating(self, value):
        if not (1 <= value <= 10):
            raise serializers.ValidationError('Rating must be between 1 and 10.')
        return value

    def validate(self, attrs):
        """
        Business rule: you can only review a game that is in your library.
        This ensures only real owners leave reviews.
        """
        request = self.context.get('request')
        if request and self.instance is None:  # Only on creation
            user = request.user
            game = attrs.get('game')
            if game and not user.library_entries.filter(game=game).exists():
                raise serializers.ValidationError(
                    {'game': 'You can only review games that are in your library.'}
                )
            # Check for duplicate review
            if game and Review.objects.filter(user=user, game=game).exists():
                raise serializers.ValidationError(
                    {'game': 'You have already reviewed this game.'}
                )
        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
