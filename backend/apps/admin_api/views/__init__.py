"""
Admin API Views
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from ..permissions import IsAdminUser
from ..signals import log_admin_action


class AuditMixin:
    """Mixin to automatically log admin actions"""

    def perform_create(self, serializer):
        instance = serializer.save()
        log_admin_action(
            request=self.request,
            action='CREATE',
            entity=instance
        )
        return instance

    def perform_update(self, serializer):
        old_instance = self.get_object()
        old_data = serializer.to_representation(old_instance)
        instance = serializer.save()
        new_data = serializer.to_representation(instance)
        changes = {
            k: {'old': old_data.get(k), 'new': v}
            for k, v in new_data.items()
            if old_data.get(k) != v
        }
        log_admin_action(
            request=self.request,
            action='UPDATE',
            entity=instance,
            changes=changes
        )
        return instance

    def perform_destroy(self, instance):
        log_admin_action(
            request=self.request,
            action='DELETE',
            entity=instance
        )
        instance.delete()


class AdminViewSet(AuditMixin, viewsets.ModelViewSet):
    """Base viewset for admin API with audit logging"""
    permission_classes = [IsAuthenticated, IsAdminUser]
