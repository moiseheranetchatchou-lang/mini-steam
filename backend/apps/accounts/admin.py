from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

# Django already registers User, but we customise the display here
admin.site.unregister(User)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Enhanced User admin with extra columns visible in the list view.
    """
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
