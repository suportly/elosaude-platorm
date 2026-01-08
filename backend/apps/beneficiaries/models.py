from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import random
import string


class Company(models.Model):
    """Sponsor companies (Eletrosul, Engie, etc.)"""
    name = models.CharField(max_length=200, verbose_name=_('Company Name'))
    cnpj = models.CharField(max_length=14, unique=True, verbose_name=_('CNPJ'))
    address = models.TextField(verbose_name=_('Address'))
    phone = models.CharField(max_length=20, verbose_name=_('Phone'))
    email = models.EmailField(verbose_name=_('Email'))
    is_active = models.BooleanField(default=True, verbose_name=_('Active'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Company')
        verbose_name_plural = _('Companies')
        ordering = ['name']

    def __str__(self):
        return self.name


class HealthPlan(models.Model):
    """Health plan types offered"""
    PLAN_TYPES = [
        ('BASIC', _('Basic')),
        ('STANDARD', _('Standard')),
        ('PREMIUM', _('Premium')),
        ('EXECUTIVE', _('Executive')),
    ]

    name = models.CharField(max_length=100, verbose_name=_('Plan Name'))
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES, verbose_name=_('Plan Type'))
    description = models.TextField(verbose_name=_('Description'))
    monthly_fee = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Monthly Fee'))
    coverage_details = models.JSONField(default=dict, verbose_name=_('Coverage Details'))
    is_active = models.BooleanField(default=True, verbose_name=_('Active'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Health Plan')
        verbose_name_plural = _('Health Plans')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.get_plan_type_display()}"


class Beneficiary(models.Model):
    """Beneficiaries (titular and dependents)"""
    BENEFICIARY_TYPES = [
        ('TITULAR', _('Titular')),
        ('DEPENDENT', _('Dependent')),
    ]

    STATUS_CHOICES = [
        ('ACTIVE', _('Active')),
        ('SUSPENDED', _('Suspended')),
        ('CANCELLED', _('Cancelled')),
    ]

    GENDER_CHOICES = [
        ('M', _('Male')),
        ('F', _('Female')),
        ('OTHER', _('Other')),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='beneficiary', null=True, blank=True)
    registration_number = models.CharField(max_length=50, unique=True, verbose_name=_('Registration Number'))
    cpf = models.CharField(max_length=11, unique=True, verbose_name=_('CPF'))
    full_name = models.CharField(max_length=200, verbose_name=_('Full Name'))
    birth_date = models.DateField(verbose_name=_('Birth Date'))
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, verbose_name=_('Gender'))
    phone = models.CharField(max_length=20, blank=True, verbose_name=_('Phone'))
    email = models.EmailField(blank=True, verbose_name=_('Email'))
    address = models.TextField(blank=True, verbose_name=_('Address'))
    city = models.CharField(max_length=100, blank=True, verbose_name=_('City'))
    state = models.CharField(max_length=2, blank=True, verbose_name=_('State'))
    zip_code = models.CharField(max_length=8, blank=True, verbose_name=_('ZIP Code'))

    beneficiary_type = models.CharField(max_length=20, choices=BENEFICIARY_TYPES, verbose_name=_('Type'))
    titular = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True,
                                related_name='dependents', verbose_name=_('Titular'))

    company = models.ForeignKey(Company, on_delete=models.PROTECT, related_name='beneficiaries')
    health_plan = models.ForeignKey(HealthPlan, on_delete=models.PROTECT, related_name='beneficiaries')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE', verbose_name=_('Status'))
    enrollment_date = models.DateField(auto_now_add=True, verbose_name=_('Enrollment Date'))

    # Documents
    rg_document = models.FileField(upload_to='documents/rg/', null=True, blank=True)
    cpf_document = models.FileField(upload_to='documents/cpf/', null=True, blank=True)
    photo = models.ImageField(upload_to='photos/', null=True, blank=True)

    # Onboarding tracking
    onboarding_completed = models.BooleanField(
        default=False,
        verbose_name=_('Onboarding Completed')
    )
    onboarding_completed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Onboarding Completed At')
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Beneficiary')
        verbose_name_plural = _('Beneficiaries')
        ordering = ['full_name']

    def __str__(self):
        return f"{self.full_name} - {self.registration_number}"

    def save(self, *args, **kwargs):
        if not self.registration_number:
            self.registration_number = self.generate_registration_number()
        super().save(*args, **kwargs)

    @staticmethod
    def generate_registration_number():
        """Generate unique registration number"""
        prefix = 'ELO'
        number = ''.join(random.choices(string.digits, k=8))
        return f"{prefix}{number}"

    def complete_onboarding(self):
        """Mark onboarding as completed"""
        self.onboarding_completed = True
        self.onboarding_completed_at = timezone.now()
        self.save(update_fields=['onboarding_completed', 'onboarding_completed_at'])
