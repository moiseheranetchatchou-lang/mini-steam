from rest_framework import viewsets, permissions
from .models import Review
from .serializers import ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    """
    GET    /api/reviews/          → All reviews by current user
    POST   /api/reviews/          → Create a review
    GET    /api/reviews/{id}/     → Single review detail
    PATCH  /api/reviews/{id}/     → Update your review
    DELETE /api/reviews/{id}/     → Delete your review

    GET /api/reviews/?game={id}   → All reviews for a specific game (public read)
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Review.objects.select_related('user', 'game')

        # If filtering by game, show all reviews for that game
        game_id = self.request.query_params.get('game')
        if game_id:
            return queryset.filter(game_id=game_id)

        # Otherwise, only show the current user's reviews
        return queryset.filter(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
