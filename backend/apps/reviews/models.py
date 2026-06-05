"""
Reviews Models
Users can leave one review per game. Rating is 1–10.
"""

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.games.models import Game


class Review(models.Model):
    """
    A review left by a user for a game.
    Business rule: one review per user per game (unique_together).
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    game = models.ForeignKey(
        Game,
        on_delete=models.CASCADE,
        related_name='reviews'
    )

    # Rating from 1 to 10
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )

    # Review body (optional — just a rating is fine)
    content = models.TextField(blank=True, default='')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'game')  # One review per user per game
        ordering = ['-created_at']
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'

    def __str__(self):
        return f"{self.user.username} → {self.game.title} ({self.rating}/10)"
