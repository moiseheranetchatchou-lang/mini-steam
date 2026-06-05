"""
Library Models
A LibraryEntry represents a game that belongs to a specific user.
This is the core "user data" model — always filtered by owner.
"""

from django.db import models
from django.contrib.auth.models import User
from apps.games.models import Game


class LibraryEntry(models.Model):
    """
    Represents a game added to a user's personal library.
    The unique_together constraint prevents duplicate entries.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,       # Delete library entry when user is deleted
        related_name='library_entries'
    )
    game = models.ForeignKey(
        Game,
        on_delete=models.CASCADE,       # Delete entry if game is removed
        related_name='library_entries'
    )
    added_at = models.DateTimeField(auto_now_add=True)

    # Optional: track playtime in minutes
    playtime_minutes = models.PositiveIntegerField(default=0)

    # Optional: user's personal note about the game
    personal_note = models.TextField(blank=True, default='')

    class Meta:
        # A user can only add a specific game once
        unique_together = ('user', 'game')
        ordering = ['-added_at']
        verbose_name = 'Library Entry'
        verbose_name_plural = 'Library Entries'

    def __str__(self):
        return f"{self.user.username} → {self.game.title}"

    @property
    def playtime_hours(self):
        """Convert playtime to hours for display."""
        return round(self.playtime_minutes / 60, 1)
