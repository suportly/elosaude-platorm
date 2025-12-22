from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from ..models import SystemConfiguration, AuditLog
from ..serializers import SystemConfigurationSerializer, AuditLogSerializer
from ..permissions import IsAdminUser, IsSuperAdmin
from ..signals import log_admin_action


class SettingsListView(generics.ListAPIView):
    """List all system settings"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = SystemConfigurationSerializer
    pagination_class = None  # Settings are few, no pagination needed

    def get_queryset(self):
        queryset = SystemConfiguration.objects.all()

        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)

        return queryset


class SettingsDetailView(APIView):
    """Get and update a specific setting"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, key):
        setting = get_object_or_404(SystemConfiguration, key=key)
        serializer = SystemConfigurationSerializer(
            setting,
            context={'show_sensitive': request.user.admin_profile.is_super_admin}
        )
        return Response(serializer.data)

    def put(self, request, key):
        # Only super admins can update settings
        if not request.user.admin_profile.is_super_admin:
            return Response(
                {'error': 'Only super admins can update settings'},
                status=status.HTTP_403_FORBIDDEN
            )

        setting = get_object_or_404(SystemConfiguration, key=key)
        new_value = request.data.get('value')

        if new_value is None:
            return Response(
                {'error': 'Value is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_value = setting.value
        setting.value = new_value
        setting.last_modified_by = request.user
        setting.save()

        log_admin_action(
            request=request,
            action='UPDATE',
            entity=setting,
            changes={'value': {'old': old_value, 'new': new_value}}
        )

        serializer = SystemConfigurationSerializer(setting)
        return Response(serializer.data)


class SettingsHistoryView(generics.ListAPIView):
    """Get settings change history"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = AuditLogSerializer

    def get_queryset(self):
        return AuditLog.objects.filter(
            entity_type='SystemConfiguration'
        ).order_by('-timestamp')
