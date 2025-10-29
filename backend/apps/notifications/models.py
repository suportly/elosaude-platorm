from django.db import models
from django.utils.translation import gettext_lazy as _


class Notification(models.Model):
    """Notifications for beneficiaries"""
    NOTIFICATION_TYPES = [
        ('GUIDE_AUTHORIZATION', _('Guide Authorization')),
        ('REIMBURSEMENT_STATUS', _('Reimbursement Status')),
        ('INVOICE_DUE', _('Invoice Due')),
        ('SYSTEM_MESSAGE', _('System Message')),
        ('HEALTH_CAMPAIGN', _('Health Campaign')),
        ('APPOINTMENT_REMINDER', _('Appointment Reminder')),
    ]

    PRIORITY_LEVELS = [
        ('LOW', _('Low')),
        ('MEDIUM', _('Medium')),
        ('HIGH', _('High')),
        ('URGENT', _('Urgent')),
    ]

    beneficiary = models.ForeignKey('beneficiaries.Beneficiary', on_delete=models.CASCADE,
                                    related_name='notifications')

    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES, verbose_name=_('Type'))
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='MEDIUM', verbose_name=_('Priority'))

    title = models.CharField(max_length=200, verbose_name=_('Title'))
    message = models.TextField(verbose_name=_('Message'))

    # Metadata
    data = models.JSONField(default=dict, blank=True, verbose_name=_('Additional Data'))
    # Can contain references to guides, reimbursements, etc.

    is_read = models.BooleanField(default=False, verbose_name=_('Is Read'))
    read_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Read At'))

    # Push notification status
    push_sent = models.BooleanField(default=False, verbose_name=_('Push Sent'))
    push_sent_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Push Sent At'))

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Notification')
        verbose_name_plural = _('Notifications')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.beneficiary.full_name} - {self.title}"


class PushToken(models.Model):
    """Push notification tokens for mobile devices"""
    DEVICE_TYPES = [
        ('IOS', _('iOS')),
        ('ANDROID', _('Android')),
    ]

    beneficiary = models.ForeignKey('beneficiaries.Beneficiary', on_delete=models.CASCADE,
                                    related_name='push_tokens')
    device_type = models.CharField(max_length=10, choices=DEVICE_TYPES, verbose_name=_('Device Type'))
    token = models.CharField(max_length=500, verbose_name=_('Push Token'))
    is_active = models.BooleanField(default=True, verbose_name=_('Active'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Push Token')
        verbose_name_plural = _('Push Tokens')
        unique_together = ['beneficiary', 'token']

    def __str__(self):
        return f"{self.beneficiary.full_name} - {self.device_type}"


class SystemMessage(models.Model):
    """System-wide messages and announcements"""
    MESSAGE_TYPES = [
        ('MAINTENANCE', _('Maintenance')),
        ('UPDATE', _('System Update')),
        ('ANNOUNCEMENT', _('Announcement')),
        ('HEALTH_TIP', _('Health Tip')),
    ]

    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, verbose_name=_('Type'))
    title = models.CharField(max_length=200, verbose_name=_('Title'))
    content = models.TextField(verbose_name=_('Content'))

    # Target audience
    target_all = models.BooleanField(default=True, verbose_name=_('Target All'))
    target_companies = models.ManyToManyField('beneficiaries.Company', blank=True,
                                             related_name='system_messages')
    target_plans = models.ManyToManyField('beneficiaries.HealthPlan', blank=True,
                                         related_name='system_messages')

    # Display settings
    is_active = models.BooleanField(default=True, verbose_name=_('Active'))
    start_date = models.DateTimeField(verbose_name=_('Start Date'))
    end_date = models.DateTimeField(null=True, blank=True, verbose_name=_('End Date'))

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('System Message')
        verbose_name_plural = _('System Messages')
        ordering = ['-created_at']

    def __str__(self):
        return self.title
