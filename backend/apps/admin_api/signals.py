from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import AuditLog


def get_client_ip(request):
    """Extract client IP from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', '0.0.0.0')
    return ip


def log_admin_action(request, action, entity, changes=None):
    """
    Create an audit log entry for an admin action.

    Args:
        request: The HTTP request object
        action: The action performed (CREATE, UPDATE, DELETE, etc.)
        entity: The model instance that was affected
        changes: Optional dict of changes made (for UPDATE actions)
    """
    if not request.user or not request.user.is_authenticated:
        return None

    AuditLog.objects.create(
        admin=request.user,
        action=action,
        entity_type=entity.__class__.__name__,
        entity_id=entity.pk,
        entity_repr=str(entity)[:200],
        changes=changes,
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', '')[:256],
        session_id=request.session.session_key or ''
    )


def log_login(user, request, success=True):
    """Log login attempt"""
    if success:
        AuditLog.objects.create(
            admin=user,
            action=AuditLog.Action.LOGIN,
            entity_type='User',
            entity_id=user.pk,
            entity_repr=str(user),
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')[:256],
            session_id=request.session.session_key or ''
        )


def log_logout(user, request):
    """Log logout event"""
    AuditLog.objects.create(
        admin=user,
        action=AuditLog.Action.LOGOUT,
        entity_type='User',
        entity_id=user.pk,
        entity_repr=str(user),
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', '')[:256],
        session_id=request.session.session_key or ''
    )


@receiver(post_save, sender=User)
def create_admin_profile(sender, instance, created, **kwargs):
    """Automatically create AdminProfile for staff users"""
    from .models import AdminProfile

    if instance.is_staff and created:
        AdminProfile.objects.get_or_create(user=instance)
