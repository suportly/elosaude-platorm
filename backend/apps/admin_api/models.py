from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _


class AdminProfile(models.Model):
    """Extended profile for admin users with role-based permissions"""

    class Role(models.TextChoices):
        SUPER_ADMIN = 'SUPER_ADMIN', _('Super Admin')
        ADMIN = 'ADMIN', _('Admin')
        VIEWER = 'VIEWER', _('Viewer')

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='admin_profile',
        verbose_name=_('User')
    )
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.ADMIN,
        verbose_name=_('Role')
    )
    department = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_('Department')
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name=_('Phone')
    )
    last_activity = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Last Activity')
    )
    login_count = models.IntegerField(
        default=0,
        verbose_name=_('Login Count')
    )
    failed_login_attempts = models.IntegerField(
        default=0,
        verbose_name=_('Failed Login Attempts')
    )
    locked_until = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Locked Until')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'admin_api_admin_profile'
        verbose_name = _('Admin Profile')
        verbose_name_plural = _('Admin Profiles')

    def __str__(self):
        return f"{self.user.email} - {self.get_role_display()}"

    @property
    def is_super_admin(self):
        return self.role == self.Role.SUPER_ADMIN

    @property
    def can_edit(self):
        return self.role in [self.Role.SUPER_ADMIN, self.Role.ADMIN]


class AuditLog(models.Model):
    """Immutable audit trail for all admin actions"""

    class Action(models.TextChoices):
        CREATE = 'CREATE', _('Create')
        UPDATE = 'UPDATE', _('Update')
        DELETE = 'DELETE', _('Delete')
        VIEW = 'VIEW', _('View')
        APPROVE = 'APPROVE', _('Approve')
        REJECT = 'REJECT', _('Reject')
        EXPORT = 'EXPORT', _('Export')
        LOGIN = 'LOGIN', _('Login')
        LOGOUT = 'LOGOUT', _('Logout')

    admin = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs',
        verbose_name=_('Admin')
    )
    action = models.CharField(
        max_length=20,
        choices=Action.choices,
        verbose_name=_('Action')
    )
    entity_type = models.CharField(
        max_length=50,
        verbose_name=_('Entity Type')
    )
    entity_id = models.IntegerField(
        verbose_name=_('Entity ID')
    )
    entity_repr = models.CharField(
        max_length=200,
        verbose_name=_('Entity Representation')
    )
    changes = models.JSONField(
        null=True,
        blank=True,
        verbose_name=_('Changes')
    )
    ip_address = models.GenericIPAddressField(
        verbose_name=_('IP Address')
    )
    user_agent = models.CharField(
        max_length=256,
        blank=True,
        verbose_name=_('User Agent')
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Timestamp')
    )
    session_id = models.CharField(
        max_length=64,
        blank=True,
        verbose_name=_('Session ID')
    )

    class Meta:
        db_table = 'admin_api_audit_log'
        verbose_name = _('Audit Log')
        verbose_name_plural = _('Audit Logs')
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['admin', 'timestamp']),
            models.Index(fields=['entity_type', 'entity_id']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        return f"{self.admin} - {self.action} - {self.entity_type}:{self.entity_id}"

    def save(self, *args, **kwargs):
        # Prevent updates to existing records
        if self.pk:
            raise ValueError("AuditLog records are immutable and cannot be updated")
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValueError("AuditLog records are immutable and cannot be deleted")


class SystemConfiguration(models.Model):
    """System-wide configuration settings"""

    class Category(models.TextChoices):
        GENERAL = 'GENERAL', _('General')
        SECURITY = 'SECURITY', _('Security')
        NOTIFICATIONS = 'NOTIFICATIONS', _('Notifications')
        REPORTS = 'REPORTS', _('Reports')
        INTEGRATION = 'INTEGRATION', _('Integration')

    key = models.CharField(
        max_length=100,
        unique=True,
        verbose_name=_('Key')
    )
    value = models.JSONField(
        verbose_name=_('Value')
    )
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        verbose_name=_('Category')
    )
    description = models.CharField(
        max_length=500,
        verbose_name=_('Description')
    )
    is_sensitive = models.BooleanField(
        default=False,
        verbose_name=_('Is Sensitive')
    )
    last_modified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='config_modifications',
        verbose_name=_('Last Modified By')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'admin_api_system_configuration'
        verbose_name = _('System Configuration')
        verbose_name_plural = _('System Configurations')
        ordering = ['category', 'key']

    def __str__(self):
        return f"{self.key} ({self.get_category_display()})"
