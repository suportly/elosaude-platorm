from django.db import models
from django.utils.translation import gettext_lazy as _
import random
import string


class ReimbursementRequest(models.Model):
    """Reimbursement requests"""
    EXPENSE_TYPES = [
        ('CONSULTATION', _('Medical Consultation')),
        ('EXAM', _('Medical Exam')),
        ('MEDICATION', _('Medication')),
        ('HOSPITALIZATION', _('Hospitalization')),
        ('SURGERY', _('Surgery')),
        ('THERAPY', _('Therapy')),
        ('OTHER', _('Other')),
    ]

    STATUS_CHOICES = [
        ('IN_ANALYSIS', _('In Analysis')),
        ('APPROVED', _('Approved')),
        ('PARTIALLY_APPROVED', _('Partially Approved')),
        ('DENIED', _('Denied')),
        ('PAID', _('Paid')),
        ('CANCELLED', _('Cancelled')),
    ]

    beneficiary = models.ForeignKey('beneficiaries.Beneficiary', on_delete=models.CASCADE,
                                    related_name='reimbursement_requests')

    protocol_number = models.CharField(max_length=50, unique=True, verbose_name=_('Protocol Number'))

    expense_type = models.CharField(max_length=20, choices=EXPENSE_TYPES, verbose_name=_('Expense Type'))
    service_date = models.DateField(verbose_name=_('Service Date'))
    service_description = models.TextField(verbose_name=_('Service Description'))

    # Provider info
    provider_name = models.CharField(max_length=200, verbose_name=_('Provider Name'))
    provider_cnpj_cpf = models.CharField(max_length=14, verbose_name=_('Provider CNPJ/CPF'))

    # Financial data
    requested_amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Requested Amount'))
    approved_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True,
                                         verbose_name=_('Approved Amount'))

    # Bank details
    bank_details = models.JSONField(verbose_name=_('Bank Details'))
    # Format: {"bank": "001", "agency": "1234", "account": "56789-0", "account_type": "checking"}

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='IN_ANALYSIS', verbose_name=_('Status'))

    request_date = models.DateTimeField(auto_now_add=True, verbose_name=_('Request Date'))
    analysis_date = models.DateTimeField(null=True, blank=True, verbose_name=_('Analysis Date'))
    payment_date = models.DateField(null=True, blank=True, verbose_name=_('Payment Date'))

    # Denial/partial approval reason
    notes = models.TextField(blank=True, verbose_name=_('Notes'))
    denial_reason = models.TextField(blank=True, verbose_name=_('Denial Reason'))

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Reimbursement Request')
        verbose_name_plural = _('Reimbursement Requests')
        ordering = ['-request_date']

    def __str__(self):
        return f"{self.protocol_number} - {self.beneficiary.full_name}"

    def save(self, *args, **kwargs):
        if not self.protocol_number:
            self.protocol_number = self.generate_protocol_number()
        super().save(*args, **kwargs)

    @staticmethod
    def generate_protocol_number():
        """Generate unique protocol number"""
        prefix = 'REIMB'
        number = ''.join(random.choices(string.digits, k=10))
        return f"{prefix}{number}"


class ReimbursementDocument(models.Model):
    """Documents attached to reimbursement requests"""
    DOCUMENT_TYPES = [
        ('INVOICE', _('Invoice/Receipt')),
        ('PRESCRIPTION', _('Medical Prescription')),
        ('REPORT', _('Medical Report')),
        ('RECEIPT', _('Payment Receipt')),
        ('OTHER', _('Other')),
    ]

    reimbursement = models.ForeignKey(ReimbursementRequest, on_delete=models.CASCADE,
                                     related_name='documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES, verbose_name=_('Document Type'))
    file = models.FileField(upload_to='reimbursements/documents/', verbose_name=_('File'))
    description = models.CharField(max_length=200, blank=True, verbose_name=_('Description'))
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Uploaded At'))

    class Meta:
        verbose_name = _('Reimbursement Document')
        verbose_name_plural = _('Reimbursement Documents')
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.reimbursement.protocol_number} - {self.get_document_type_display()}"
