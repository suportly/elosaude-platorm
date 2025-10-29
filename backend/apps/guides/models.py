from django.db import models
from django.utils.translation import gettext_lazy as _
import random
import string


class Procedure(models.Model):
    """Medical procedures (TISS standard)"""
    code = models.CharField(max_length=20, unique=True, verbose_name=_('TUSS Code'))
    name = models.CharField(max_length=200, verbose_name=_('Procedure Name'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    category = models.CharField(max_length=100, verbose_name=_('Category'))
    base_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Base Price'))
    requires_authorization = models.BooleanField(default=True, verbose_name=_('Requires Authorization'))
    is_active = models.BooleanField(default=True, verbose_name=_('Active'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Procedure')
        verbose_name_plural = _('Procedures')
        ordering = ['name']

    def __str__(self):
        return f"{self.code} - {self.name}"


class TISSGuide(models.Model):
    """TISS Guide for authorizations"""
    GUIDE_TYPES = [
        ('SP_SADT', _('SP/SADT - Support Services')),
        ('CONSULTATION', _('Consultation')),
        ('HOSPITALIZATION', _('Hospitalization')),
        ('EMERGENCY', _('Emergency')),
    ]

    STATUS_CHOICES = [
        ('PENDING', _('Pending')),
        ('IN_ANALYSIS', _('In Analysis')),
        ('AUTHORIZED', _('Authorized')),
        ('DENIED', _('Denied')),
        ('CANCELLED', _('Cancelled')),
        ('EXPIRED', _('Expired')),
    ]

    beneficiary = models.ForeignKey('beneficiaries.Beneficiary', on_delete=models.CASCADE, related_name='guides')
    provider = models.ForeignKey('providers.AccreditedProvider', on_delete=models.PROTECT, related_name='guides')

    guide_type = models.CharField(max_length=20, choices=GUIDE_TYPES, verbose_name=_('Guide Type'))
    guide_number = models.CharField(max_length=50, unique=True, verbose_name=_('Guide Number'))
    protocol_number = models.CharField(max_length=50, unique=True, verbose_name=_('Protocol Number'))

    request_date = models.DateTimeField(auto_now_add=True, verbose_name=_('Request Date'))
    authorization_date = models.DateTimeField(null=True, blank=True, verbose_name=_('Authorization Date'))
    expiry_date = models.DateField(null=True, blank=True, verbose_name=_('Expiry Date'))

    procedures = models.ManyToManyField(Procedure, through='GuideProcedure', related_name='guides')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', verbose_name=_('Status'))

    # Clinical information
    diagnosis = models.TextField(verbose_name=_('Diagnosis'))
    observations = models.TextField(blank=True, verbose_name=_('Observations'))

    # Requesting physician
    requesting_physician_name = models.CharField(max_length=200, verbose_name=_('Requesting Physician'))
    requesting_physician_crm = models.CharField(max_length=20, verbose_name=_('CRM'))

    # Denial reason (if denied)
    denial_reason = models.TextField(blank=True, verbose_name=_('Denial Reason'))

    # PDF file
    guide_pdf = models.FileField(upload_to='guides/pdf/', null=True, blank=True, verbose_name=_('Guide PDF'))

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('TISS Guide')
        verbose_name_plural = _('TISS Guides')
        ordering = ['-request_date']

    def __str__(self):
        return f"{self.guide_number} - {self.beneficiary.full_name}"

    def save(self, *args, **kwargs):
        if not self.guide_number:
            self.guide_number = self.generate_guide_number()
        if not self.protocol_number:
            self.protocol_number = self.generate_protocol_number()
        super().save(*args, **kwargs)

    @staticmethod
    def generate_guide_number():
        """Generate unique guide number"""
        prefix = 'GUIDE'
        number = ''.join(random.choices(string.digits, k=10))
        return f"{prefix}{number}"

    @staticmethod
    def generate_protocol_number():
        """Generate unique protocol number"""
        prefix = 'PROT'
        number = ''.join(random.choices(string.digits + string.ascii_uppercase, k=12))
        return f"{prefix}{number}"


class GuideProcedure(models.Model):
    """Procedures associated with a guide"""
    guide = models.ForeignKey(TISSGuide, on_delete=models.CASCADE, related_name='guide_procedures')
    procedure = models.ForeignKey(Procedure, on_delete=models.PROTECT, related_name='guide_procedures')
    quantity = models.IntegerField(default=1, verbose_name=_('Quantity'))
    authorized_quantity = models.IntegerField(default=0, verbose_name=_('Authorized Quantity'))
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Unit Price'))
    total_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Total Price'))

    class Meta:
        verbose_name = _('Guide Procedure')
        verbose_name_plural = _('Guide Procedures')

    def __str__(self):
        return f"{self.guide.guide_number} - {self.procedure.name}"

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class GuideAttachment(models.Model):
    """Attachments for guides (medical prescriptions, exams, etc.)"""
    ATTACHMENT_TYPES = [
        ('PRESCRIPTION', _('Medical Prescription')),
        ('EXAM_REQUEST', _('Exam Request')),
        ('REPORT', _('Medical Report')),
        ('IMAGE', _('Medical Image')),
        ('OTHER', _('Other')),
    ]

    guide = models.ForeignKey(TISSGuide, on_delete=models.CASCADE, related_name='attachments')
    attachment_type = models.CharField(max_length=20, choices=ATTACHMENT_TYPES, verbose_name=_('Type'))
    file = models.FileField(upload_to='guides/attachments/', verbose_name=_('File'))
    description = models.CharField(max_length=200, blank=True, verbose_name=_('Description'))
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Uploaded At'))

    class Meta:
        verbose_name = _('Guide Attachment')
        verbose_name_plural = _('Guide Attachments')
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.guide.guide_number} - {self.get_attachment_type_display()}"
