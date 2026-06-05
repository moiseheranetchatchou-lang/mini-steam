"""
Accounts Views
- POST /api/auth/register/  → Create new account (public)
- GET  /api/auth/me/        → Get logged-in user profile (protected)
- PUT  /api/auth/me/        → Update profile (protected)
- POST /api/auth/login/     → Obtain JWT tokens (handled by SimpleJWT)
- POST /api/auth/refresh/   → Refresh JWT token (handled by SimpleJWT)
"""

from rest_framework import generics, permissions
from rest_framework.response import Response
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserProfileSerializer


class RegisterView(generics.CreateAPIView):
    """
    Public endpoint — anyone can register.
    Returns the newly created user (no token — user must login separately).
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]  # Override global auth requirement


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Protected endpoint — returns the currently authenticated user's profile.
    Uses request.user so each user can only ever see/edit their own data.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Always return the currently logged-in user — no ID needed in the URL
        return self.request.user
