"""
Games Models
The Game model represents a game in the catalog.
Games are global — not user-specific. Any authenticated user can browse them.
Only admins can create/edit/delete games (via Django Admin).
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Genre(models.Model):
    """Game genre/category (e.g. RPG, FPS, Strategy)."""
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Genre'
        verbose_name_plural = 'Genres'

    def __str__(self):
        return self.name


class Game(models.Model):
    """
    Represents a game in the Mini Steam catalog.
    price = 0.00 means the game is free-to-play.
    """

    # Basic information
    title = models.CharField(max_length=200)
    description = models.TextField()
    developer = models.CharField(max_length=100)
    publisher = models.CharField(max_length=100)

    # Categorisation
    genre = models.ForeignKey(
        Genre,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='games'
    )

    # Pricing — DecimalField for accurate money representation
    price = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0)]   # Price cannot be negative
    )

    # Dates
    release_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Cover image (optional)
    cover_image = models.ImageField(
        upload_to='games/covers/',
        null=True,
        blank=True
    )

    # Metadata
    is_active = models.BooleanField(default=True)  # Soft-delete / hide a game

    class Meta:
        ordering = ['title']
        verbose_name = 'Game'
        verbose_name_plural = 'Games'

    def __str__(self):
        return f"{self.title} ({self.developer})"

    @property
    def is_free(self):
        """Helper property: True if price is 0."""
        return self.price == 0
