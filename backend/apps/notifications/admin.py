from django.contrib import admin
from .models import Notification, PushToken, SystemMessage


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['beneficiary', 'title', 'notification_type', 'priority', 'is_read', 'push_sent', 'created_at']
    list_filter = ['notification_type', 'priority', 'is_read', 'push_sent', 'created_at']
    search_fields = ['beneficiary__full_name', 'title', 'message']
    readonly_fields = ['push_sent', 'push_sent_at', 'created_at']


@admin.register(PushToken)
class PushTokenAdmin(admin.ModelAdmin):
    list_display = ['beneficiary', 'device_type', 'is_active', 'created_at']
    list_filter = ['device_type', 'is_active']
    search_fields = ['beneficiary__full_name', 'token']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(SystemMessage)
class SystemMessageAdmin(admin.ModelAdmin):
    list_display = ['title', 'message_type', 'target_all', 'start_date', 'end_date', 'is_active']
    list_filter = ['message_type', 'target_all', 'is_active', 'start_date']
    search_fields = ['title', 'message']
    filter_horizontal = ['target_companies', 'target_plans']
    readonly_fields = ['created_at', 'updated_at']
