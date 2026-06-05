from django.contrib import admin
from django.utils.html import format_html
from .models import Game, Genre


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'developer', 'genre',
        'price', 'release_date', 'is_active'
    )
    list_filter = ('genre', 'is_active')
    search_fields = ('title', 'developer')
    list_editable = ('is_active',)
    ordering = ('title',)
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'cover_image')
        }),
        ('Publisher Details', {
            'fields': ('developer', 'publisher', 'genre', 'release_date')
        }),
        ('Pricing & Availability', {
            'fields': ('price', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )