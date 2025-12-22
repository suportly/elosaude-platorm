from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta

from ..models import AdminProfile
from ..serializers import AdminProfileSerializer
from ..signals import log_login


class AdminLoginView(APIView):
    """Admin login endpoint with lockout protection"""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {'error': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find user by email first
        from django.contrib.auth import get_user_model
        User = get_user_model()

        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Authenticate using username
        user = authenticate(request, username=user_obj.username, password=password)

        if user is None:
            # Increment failed attempts
            if hasattr(user_obj, 'admin_profile'):
                profile = user_obj.admin_profile
                profile.failed_login_attempts += 1
                if profile.failed_login_attempts >= 5:
                    profile.locked_until = timezone.now() + timedelta(minutes=15)
                profile.save()

            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Check if user is staff
        if not user.is_staff:
            return Response(
                {'error': 'Access denied. Admin privileges required.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if user has admin profile
        if not hasattr(user, 'admin_profile'):
            AdminProfile.objects.create(user=user)

        profile = user.admin_profile

        # Check if account is locked
        if profile.locked_until and profile.locked_until > timezone.now():
            remaining = (profile.locked_until - timezone.now()).seconds // 60
            return Response(
                {'error': f'Account locked. Try again in {remaining} minutes.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Reset failed attempts and update login info
        profile.failed_login_attempts = 0
        profile.locked_until = None
        profile.login_count += 1
        profile.last_activity = timezone.now()
        profile.save()

        # Log successful login
        log_login(user, request, success=True)

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': AdminProfileSerializer(profile).data
        })


class AdminTokenRefreshView(TokenRefreshView):
    """Refresh access token"""
    pass


class AdminProfileView(APIView):
    """Get current admin profile"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'admin_profile'):
            return Response(
                {'error': 'Admin profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        profile = request.user.admin_profile
        profile.last_activity = timezone.now()
        profile.save(update_fields=['last_activity'])

        serializer = AdminProfileSerializer(profile)
        return Response(serializer.data)
