from rest_framework import serializers
from .models import Notification, PushToken, SystemMessage


class NotificationSerializer(serializers.ModelSerializer):
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'beneficiary', 'notification_type', 'notification_type_display',
            'priority', 'priority_display', 'title', 'message', 'data',
            'is_read', 'read_at', 'push_sent', 'push_sent_at',
            'created_at'
        ]
        read_only_fields = ['created_at', 'push_sent', 'push_sent_at']


class PushTokenSerializer(serializers.ModelSerializer):
    device_type_display = serializers.CharField(source='get_device_type_display', read_only=True)
    
    class Meta:
        model = PushToken
        fields = ['id', 'beneficiary', 'token', 'device_type', 'device_type_display', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class SystemMessageSerializer(serializers.ModelSerializer):
    message_type_display = serializers.CharField(source='get_message_type_display', read_only=True)

    class Meta:
        model = SystemMessage
        fields = [
            'id', 'message_type', 'message_type_display', 'title', 'content',
            'target_all', 'target_companies', 'target_plans',
            'start_date', 'end_date', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
