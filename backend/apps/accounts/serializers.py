"""
Accounts Serializers
Handles user registration and profile display.
"""

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new user account.
    Validates password strength and ensures both passwords match.
    """
    password = serializers.CharField(
        write_only=True,        # Never returned in responses
        required=True,
        validators=[validate_password]  # Enforces Django's password rules
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name')
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def validate(self, attrs):
        """Business rule: both passwords must match."""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {'password': 'Password fields did not match.'}
            )
        return attrs

    def validate_email(self, value):
        """Business rule: email must be unique across all users."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def create(self, validated_data):
        """Create user using Django's create_user to properly hash the password."""
        # Remove password2 — it's not a model field
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Returns the logged-in user's public profile data."""

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'date_joined')
        read_only_fields = ('id', 'date_joined', 'username')
