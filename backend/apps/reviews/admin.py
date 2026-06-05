from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'game', 'rating', 'created_at')
    list_filter = ('rating', 'created_at', 'game__genre')
    search_fields = ('user__username', 'game__title', 'content')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
