from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """
    Permission class to check if user is an admin with valid profile.
    """
    message = "You do not have admin access to this resource."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if not request.user.is_staff:
            return False

        # Check if user has an admin profile
        if not hasattr(request.user, 'admin_profile'):
            return False

        # Check if account is locked
        from django.utils import timezone
        profile = request.user.admin_profile
        if profile.locked_until and profile.locked_until > timezone.now():
            return False

        return True


class IsSuperAdmin(permissions.BasePermission):
    """
    Permission class to check if user is a super admin.
    """
    message = "Only super admins can perform this action."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if not hasattr(request.user, 'admin_profile'):
            return False

        return request.user.admin_profile.is_super_admin


class CanEditPermission(permissions.BasePermission):
    """
    Permission class to check if user can edit (ADMIN or SUPER_ADMIN).
    """
    message = "You do not have permission to edit this resource."

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        if not request.user or not request.user.is_authenticated:
            return False

        if not hasattr(request.user, 'admin_profile'):
            return False

        return request.user.admin_profile.can_edit
