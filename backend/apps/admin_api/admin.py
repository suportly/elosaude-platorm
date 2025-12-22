from django.contrib import admin
from .models import AdminProfile, AuditLog, SystemConfiguration


@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'department', 'last_activity', 'login_count']
    list_filter = ['role', 'department']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['login_count', 'failed_login_attempts', 'last_activity']


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['admin', 'action', 'entity_type', 'entity_id', 'timestamp', 'ip_address']
    list_filter = ['action', 'entity_type', 'timestamp']
    search_fields = ['admin__email', 'entity_repr']
    readonly_fields = ['admin', 'action', 'entity_type', 'entity_id', 'entity_repr',
                       'changes', 'ip_address', 'user_agent', 'timestamp', 'session_id']

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(SystemConfiguration)
class SystemConfigurationAdmin(admin.ModelAdmin):
    list_display = ['key', 'category', 'is_sensitive', 'last_modified_by', 'updated_at']
    list_filter = ['category', 'is_sensitive']
    search_fields = ['key', 'description']
