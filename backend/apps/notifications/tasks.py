from celery import shared_task
from django.utils import timezone
from django.db.models import Q
import logging

logger = logging.getLogger(__name__)


@shared_task
def send_notification(beneficiary_id, title, message, notification_type, data=None, priority='MEDIUM'):
    """
    Send notification to a beneficiary
    Creates in-app notification and sends push notification if available
    """
    from apps.notifications.models import Notification
    from apps.beneficiaries.models import Beneficiary
    
    try:
        beneficiary = Beneficiary.objects.get(id=beneficiary_id)
        
        # Create in-app notification
        notification = Notification.objects.create(
            beneficiary=beneficiary,
            title=title,
            message=message,
            notification_type=notification_type,
            priority=priority,
            data=data or {}
        )
        
        # TODO: Send push notification when FCM is configured
        # send_push_to_beneficiary(beneficiary, title, message, data)
        
        logger.info(f"Notification sent to {beneficiary.full_name}: {title}")
        return notification.id
        
    except Beneficiary.DoesNotExist:
        logger.error(f"Beneficiary {beneficiary_id} not found")
        return None
    except Exception as e:
        logger.error(f"Error sending notification: {str(e)}")
        return None


@shared_task
def send_appointment_reminders():
    """
    Send appointment reminders (scheduled daily at 9 AM)
    TODO: Implement when appointment model is created
    """
    logger.info("Checking for appointment reminders...")
    # TODO: Query appointments for tomorrow
    # TODO: Send reminder notifications
    return "Appointment reminders checked"


@shared_task
def send_bulk_notification(beneficiary_ids, title, message, notification_type, data=None):
    """
    Send notification to multiple beneficiaries
    """
    from apps.notifications.models import Notification
    from apps.beneficiaries.models import Beneficiary
    
    try:
        beneficiaries = Beneficiary.objects.filter(id__in=beneficiary_ids)
        
        notifications = []
        for beneficiary in beneficiaries:
            notification = Notification(
                beneficiary=beneficiary,
                title=title,
                message=message,
                notification_type=notification_type,
                data=data or {}
            )
            notifications.append(notification)
        
        # Bulk create for performance
        Notification.objects.bulk_create(notifications)
        
        logger.info(f"Bulk notification sent to {len(beneficiaries)} beneficiaries")
        return len(beneficiaries)
        
    except Exception as e:
        logger.error(f"Error sending bulk notification: {str(e)}")
        return 0


@shared_task
def cleanup_old_notifications():
    """
    Delete read notifications older than 30 days
    """
    from apps.notifications.models import Notification
    from datetime import timedelta
    
    cutoff_date = timezone.now() - timedelta(days=30)
    
    deleted_count = Notification.objects.filter(
        is_read=True,
        read_at__lt=cutoff_date
    ).delete()[0]
    
    logger.info(f"Deleted {deleted_count} old notifications")
    return deleted_count
