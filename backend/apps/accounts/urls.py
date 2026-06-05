"""
Authentication URL patterns.
Mounted at: /api/auth/
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, UserProfileView

urlpatterns = [
    # POST /api/auth/login/    → Returns access + refresh tokens
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),

    # POST /api/auth/refresh/  → Returns new access token
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # POST /api/auth/register/ → Create new account
    path('register/', RegisterView.as_view(), name='register'),

    # GET/PUT /api/auth/me/    → Current user profile
    path('me/', UserProfileView.as_view(), name='user_profile'),
]
