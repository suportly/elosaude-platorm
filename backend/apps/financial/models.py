from django.db import models
from django.utils.translation import gettext_lazy as _
import random
import string
from datetime import datetime, timedelta


class Invoice(models.Model):
    """Monthly invoices for beneficiaries"""
    STATUS_CHOICES = [
        ('OPEN', _('Open')),
        ('PAID', _('Paid')),
        ('OVERDUE', _('Overdue')),
        ('CANCELLED', _('Cancelled')),
    ]

    beneficiary = models.ForeignKey('beneficiaries.Beneficiary', on_delete=models.CASCADE,
                                    related_name='invoices')

    reference_month = models.CharField(max_length=7, verbose_name=_('Reference Month'))  # MM/YYYY
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Amount'))
    due_date = models.DateField(verbose_name=_('Due Date'))
    payment_date = models.DateField(null=True, blank=True, verbose_name=_('Payment Date'))

    barcode = models.CharField(max_length=100, verbose_name=_('Barcode'))
    digitable_line = models.CharField(max_length=100, verbose_name=_('Digitable Line'))

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN', verbose_name=_('Status'))

    # PDF file
    invoice_pdf = models.FileField(upload_to='invoices/pdf/', null=True, blank=True, verbose_name=_('Invoice PDF'))

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Invoice')
        verbose_name_plural = _('Invoices')
        ordering = ['-reference_month', '-due_date']
        unique_together = ['beneficiary', 'reference_month']

    def __str__(self):
        return f"{self.beneficiary.full_name} - {self.reference_month}"

    def save(self, *args, **kwargs):
        if not self.barcode:
            self.barcode = self.generate_barcode()
        if not self.digitable_line:
            self.digitable_line = self.generate_digitable_line()

        # Update status based on due date
        if self.status == 'OPEN' and self.due_date < datetime.now().date():
            self.status = 'OVERDUE'

        super().save(*args, **kwargs)

    @staticmethod
    def generate_barcode():
        """Generate barcode number"""
        return ''.join(random.choices(string.digits, k=47))

    def generate_digitable_line(self):
        """Generate digitable line from barcode"""
        # Simplified version
        barcode = self.barcode if self.barcode else self.generate_barcode()
        parts = [
            barcode[0:11],
            barcode[11:22],
            barcode[22:33],
            barcode[33:47]
        ]
        return ' '.join([f"{part[:-1]}{self._calc_checksum(part)}" for part in parts])

    @staticmethod
    def _calc_checksum(value):
        """Calculate checksum digit"""
        return str(sum(int(d) for d in value) % 10)


class PaymentHistory(models.Model):
    """Payment history for invoices"""
    PAYMENT_METHODS = [
        ('BANK_SLIP', _('Bank Slip')),
        ('CREDIT_CARD', _('Credit Card')),
        ('DEBIT_CARD', _('Debit Card')),
        ('BANK_TRANSFER', _('Bank Transfer')),
        ('PIX', _('PIX')),
    ]

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payment_history')
    payment_date = models.DateField(verbose_name=_('Payment Date'))
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, verbose_name=_('Payment Method'))
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Amount Paid'))
    transaction_id = models.CharField(max_length=100, blank=True, verbose_name=_('Transaction ID'))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Payment History')
        verbose_name_plural = _('Payment Histories')
        ordering = ['-payment_date']

    def __str__(self):
        return f"{self.invoice.beneficiary.full_name} - {self.payment_date}"


class UsageHistory(models.Model):
    """Track beneficiary usage of services"""
    beneficiary = models.ForeignKey('beneficiaries.Beneficiary', on_delete=models.CASCADE,
                                    related_name='usage_history')
    period = models.CharField(max_length=7, verbose_name=_('Period'))  # MM/YYYY

    # Services count
    consultations_count = models.IntegerField(default=0, verbose_name=_('Consultations'))
    exams_count = models.IntegerField(default=0, verbose_name=_('Exams'))
    procedures_count = models.IntegerField(default=0, verbose_name=_('Procedures'))
    hospitalizations_count = models.IntegerField(default=0, verbose_name=_('Hospitalizations'))

    # Financial totals
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_('Total Amount'))
    copayment_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0,
                                          verbose_name=_('Copayment Amount'))

    # Detailed usage
    usage_details = models.JSONField(default=list, verbose_name=_('Usage Details'))
    # Format: [{"date": "2024-01-15", "provider": "Dr. Silva", "service": "Consulta", "amount": 150.00}, ...]

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Usage History')
        verbose_name_plural = _('Usage Histories')
        ordering = ['-period']
        unique_together = ['beneficiary', 'period']

    def __str__(self):
        return f"{self.beneficiary.full_name} - {self.period}"


class TaxStatement(models.Model):
    """Tax statements for income tax reporting"""
    beneficiary = models.ForeignKey('beneficiaries.Beneficiary', on_delete=models.CASCADE,
                                    related_name='tax_statements')
    year = models.IntegerField(verbose_name=_('Year'))

    # Amounts
    total_paid = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Total Paid'))
    deductible_amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Deductible Amount'))

    # Details
    monthly_breakdown = models.JSONField(default=dict, verbose_name=_('Monthly Breakdown'))
    # Format: {"01": 500.00, "02": 500.00, ...}

    # PDF file
    statement_pdf = models.FileField(upload_to='tax_statements/pdf/', null=True, blank=True,
                                    verbose_name=_('Statement PDF'))

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Tax Statement')
        verbose_name_plural = _('Tax Statements')
        ordering = ['-year']
        unique_together = ['beneficiary', 'year']

    def __str__(self):
        return f"{self.beneficiary.full_name} - {self.year}"
