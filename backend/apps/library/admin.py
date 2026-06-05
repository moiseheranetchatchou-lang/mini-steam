from django.contrib import admin
from .models import LibraryEntry


@admin.register(LibraryEntry)
class LibraryEntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'game', 'added_at', 'playtime_minutes')
    list_filter = ('added_at', 'game__genre')
    search_fields = ('user__username', 'game__title')
    ordering = ('-added_at',)
    readonly_fields = ('added_at',)
